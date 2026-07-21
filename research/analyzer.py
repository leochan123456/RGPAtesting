from __future__ import annotations

import difflib
import re
from dataclasses import dataclass
from datetime import date

from .models import RuleRecord

KEYWORD_PATTERNS = [
    r"学区房",
    r"保证收益",
    r"返现",
    r"最低价",
    r"违规",
    r"敏感词",
    r"advertising law",
    r"community standards",
]


@dataclass(slots=True)
class AnalysisResult:
    platform: str
    source_url: str
    banned_keywords: list[str]
    link_in_caption_allowed: bool
    recommended_action: str
    diff_summary: list[str]
    previous_snapshot_path: str | None
    current_snapshot_path: str


class PolicyAnalyzer:
    def extract_keywords(self, content: str) -> list[str]:
        discovered: list[str] = []
        for pattern in KEYWORD_PATTERNS:
            if re.search(pattern, content, flags=re.IGNORECASE):
                discovered.append(pattern)
        return discovered

    def compare_snapshots(self, previous_content: str | None, current_content: str) -> list[str]:
        if previous_content is None:
            return ["Initial snapshot recorded"]
        diff = difflib.unified_diff(
            previous_content.splitlines(),
            current_content.splitlines(),
            lineterm="",
            n=2,
        )
        return list(diff)

    def build_rule(self, platform: str, source_url: str, content: str) -> RuleRecord:
        banned_keywords = self.extract_keywords(content)
        link_allowed = not any(keyword in {"广告法", "advertising law"} for keyword in banned_keywords)
        recommended_action = "replace_with_proximity_term" if banned_keywords else "review_before_publish"
        return RuleRecord(
            platform=platform,
            last_updated=date.today(),
            banned_keywords=banned_keywords,
            link_in_caption_allowed=link_allowed,
            recommended_action=recommended_action,
            source_url=source_url,
            notes="Auto-generated from the latest policy snapshot.",
        )
