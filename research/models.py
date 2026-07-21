from __future__ import annotations

from datetime import date, datetime
from typing import Any


class RuleRecord:
    def __init__(
        self,
        platform: str,
        last_updated: date | str,
        banned_keywords: list[str] = None,
        link_in_caption_allowed: bool = True,
        recommended_action: str = "review_before_publish",
        source_url: str | None = None,
        notes: str | None = None,
    ) -> None:
        self.platform = platform
        if isinstance(last_updated, str):
            try:
                self.last_updated = date.fromisoformat(last_updated)
            except Exception:
                self.last_updated = date.today()
        else:
            self.last_updated = last_updated
        self.banned_keywords = banned_keywords if banned_keywords is not None else []
        self.link_in_caption_allowed = link_in_caption_allowed
        self.recommended_action = recommended_action
        self.source_url = source_url
        self.notes = notes

    def model_dump(self, mode: str = "json") -> dict[str, Any]:
        return {
            "platform": self.platform,
            "last_updated": self.last_updated.isoformat() if isinstance(self.last_updated, date) else self.last_updated,
            "banned_keywords": self.banned_keywords,
            "link_in_caption_allowed": self.link_in_caption_allowed,
            "recommended_action": self.recommended_action,
            "source_url": self.source_url,
            "notes": self.notes,
        }

    @classmethod
    def model_validate(cls, data: dict[str, Any]) -> RuleRecord:
        return cls(
            platform=data.get("platform", ""),
            last_updated=data.get("last_updated", ""),
            banned_keywords=data.get("banned_keywords", []),
            link_in_caption_allowed=data.get("link_in_caption_allowed", True),
            recommended_action=data.get("recommended_action", "review_before_publish"),
            source_url=data.get("source_url"),
            notes=data.get("notes"),
        )


class SnapshotRecord:
    def __init__(
        self,
        platform: str,
        source_url: str,
        fetched_at: datetime | str,
        snapshot_path: str,
        content_hash: str,
        content_length: int,
    ) -> None:
        self.platform = platform
        self.source_url = source_url
        if isinstance(fetched_at, str):
            try:
                self.fetched_at = datetime.fromisoformat(fetched_at.replace("Z", "+00:00"))
            except Exception:
                self.fetched_at = datetime.now()
        else:
            self.fetched_at = fetched_at
        self.snapshot_path = snapshot_path
        self.content_hash = content_hash
        self.content_length = content_length

    def model_dump(self, mode: str = "json") -> dict[str, Any]:
        return {
            "platform": self.platform,
            "source_url": self.source_url,
            "fetched_at": self.fetched_at.isoformat() if isinstance(self.fetched_at, datetime) else self.fetched_at,
            "snapshot_path": self.snapshot_path,
            "content_hash": self.content_hash,
            "content_length": self.content_length,
        }


class ShadowbanCheckRecord:
    def __init__(
        self,
        post_url: str,
        platform: str,
        checked_at: datetime | str,
        elapsed_hours: float,
        views: int,
        flagged: bool,
        reason: str,
        metadata: dict[str, Any] = None,
    ) -> None:
        self.post_url = post_url
        self.platform = platform
        if isinstance(checked_at, str):
            try:
                self.checked_at = datetime.fromisoformat(checked_at.replace("Z", "+00:00"))
            except Exception:
                self.checked_at = datetime.now()
        else:
            self.checked_at = checked_at
        self.elapsed_hours = elapsed_hours
        self.views = views
        self.flagged = flagged
        self.reason = reason
        self.metadata = metadata if metadata is not None else {}

    def model_dump(self, mode: str = "json") -> dict[str, Any]:
        return {
            "post_url": self.post_url,
            "platform": self.platform,
            "checked_at": self.checked_at.isoformat() if isinstance(self.checked_at, datetime) else self.checked_at,
            "elapsed_hours": self.elapsed_hours,
            "views": self.views,
            "flagged": self.flagged,
            "reason": self.reason,
            "metadata": self.metadata,
        }
