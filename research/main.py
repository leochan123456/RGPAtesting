from __future__ import annotations

import argparse
import asyncio
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .analyzer import AnalysisResult, PolicyAnalyzer
from .db_manager import DatabaseManager
from .models import ShadowbanCheckRecord
from .scraper import PlatformTarget, PolicyScraper

class Console:
    def log(self, message: str) -> None:
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{now_str}] {message}")

console = Console()


DEFAULT_TARGETS = [
    PlatformTarget(
        platform="Meta",
        source_url="https://www.facebook.com/policies/ads/",
    ),
    PlatformTarget(
        platform="Xiaohongshu",
        source_url="https://www.xiaohongshu.com/",
    ),
    PlatformTarget(
        platform="Douyin",
        source_url="https://www.douyin.com/",
    ),
]


async def run_once() -> list[AnalysisResult]:
    db = DatabaseManager()
    scraper = PolicyScraper(db.snapshots_dir)
    analyzer = PolicyAnalyzer()

    results: list[AnalysisResult] = []
    for target in DEFAULT_TARGETS:
        console.log(f"Fetching policy snapshot for {target.platform}")
        content, snapshot = await scraper.fetch(target)
        db.save_snapshot(snapshot)

        previous_snapshot_path = _find_previous_snapshot(db, target.platform, snapshot.snapshot_path)
        previous_content = None
        if previous_snapshot_path:
            previous_content = Path(previous_snapshot_path).read_text(encoding="utf-8")

        diff_summary = analyzer.compare_snapshots(previous_content, content)
        rule = analyzer.build_rule(target.platform, target.source_url, content)
        db.upsert_rule(rule)

        result = AnalysisResult(
            platform=target.platform,
            source_url=target.source_url,
            banned_keywords=rule.banned_keywords,
            link_in_caption_allowed=rule.link_in_caption_allowed,
            recommended_action=rule.recommended_action,
            diff_summary=diff_summary,
            previous_snapshot_path=previous_snapshot_path,
            current_snapshot_path=snapshot.snapshot_path,
        )
        results.append(result)

        console.log(
            f"Updated {target.platform}: {len(rule.banned_keywords)} keywords, action={rule.recommended_action}"
        )

    return results


def check_shadowban_status(post_url: str, platform: str) -> dict[str, Any]:
    db = DatabaseManager()
    checked_at = datetime.now(timezone.utc)
    elapsed_hours = 2.0
    views = _mock_views(post_url, platform)
    flagged = elapsed_hours >= 2.0 and views == 0
    reason = "views_zero_after_two_hours" if flagged else "no_shadowban_signal"

    record = ShadowbanCheckRecord(
        post_url=post_url,
        platform=platform,
        checked_at=checked_at,
        elapsed_hours=elapsed_hours,
        views=views,
        flagged=flagged,
        reason=reason,
        metadata={"mock": True},
    )
    db.save_shadowban_check(record)
    return record.model_dump(mode="json")


def _mock_views(post_url: str, platform: str) -> int:
    seed = sum(ord(char) for char in f"{platform}:{post_url}")
    return 0 if seed % 5 == 0 else (seed % 137) + 1


def _find_previous_snapshot(db: DatabaseManager, platform: str, current_snapshot_path: str) -> str | None:
    snapshots = db.list_snapshots(platform)
    for snapshot in snapshots:
        if snapshot["snapshot_path"] != current_snapshot_path:
            return str(snapshot["snapshot_path"])
    return None


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Run the policy monitoring workflow.")
    parser.add_argument("command", choices=["run", "shadowban"], help="Workflow to execute")
    parser.add_argument("--post-url", default="https://example.com/post/123", help="Post URL for shadowban checks")
    parser.add_argument("--platform", default="Xiaohongshu", help="Platform name for shadowban checks")
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    if args.command == "run":
        asyncio.run(run_once())
        console.log("Policy monitoring run complete")
        return

    if args.command == "shadowban":
        result = check_shadowban_status(args.post_url, args.platform)
        console.log(result)


if __name__ == "__main__":
    main()
