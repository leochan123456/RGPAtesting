from __future__ import annotations

import json
import sqlite3
from pathlib import Path

from .models import RuleRecord, ShadowbanCheckRecord, SnapshotRecord


class DatabaseManager:
    def __init__(self, base_dir: str | Path | None = None) -> None:
        self.base_dir = Path(base_dir or Path(__file__).resolve().parents[1])
        self.data_dir = self.base_dir / "research_data"
        self.snapshots_dir = self.data_dir / "snapshots"
        self.rules_path = self.data_dir / "restriction_rules.json"
        self.sqlite_path = self.data_dir / "research.db"
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.snapshots_dir.mkdir(parents=True, exist_ok=True)
        self._ensure_sqlite_schema()

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.sqlite_path)
        connection.row_factory = sqlite3.Row
        return connection

    def _ensure_sqlite_schema(self) -> None:
        with self._connect() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS snapshots (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    platform TEXT NOT NULL,
                    source_url TEXT NOT NULL,
                    fetched_at TEXT NOT NULL,
                    snapshot_path TEXT NOT NULL,
                    content_hash TEXT NOT NULL,
                    content_length INTEGER NOT NULL
                )
                """
            )
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS shadowban_checks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    post_url TEXT NOT NULL,
                    platform TEXT NOT NULL,
                    checked_at TEXT NOT NULL,
                    elapsed_hours REAL NOT NULL,
                    views INTEGER NOT NULL,
                    flagged INTEGER NOT NULL,
                    reason TEXT NOT NULL,
                    metadata TEXT NOT NULL
                )
                """
            )
            connection.commit()

    def save_snapshot(self, snapshot: SnapshotRecord) -> None:
        with self._connect() as connection:
            connection.execute(
                """
                INSERT INTO snapshots (
                    platform, source_url, fetched_at, snapshot_path,
                    content_hash, content_length
                ) VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    snapshot.platform,
                    snapshot.source_url,
                    snapshot.fetched_at.isoformat(),
                    snapshot.snapshot_path,
                    snapshot.content_hash,
                    snapshot.content_length,
                ),
            )
            connection.commit()

    def save_shadowban_check(self, record: ShadowbanCheckRecord) -> None:
        with self._connect() as connection:
            connection.execute(
                """
                INSERT INTO shadowban_checks (
                    post_url, platform, checked_at, elapsed_hours,
                    views, flagged, reason, metadata
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    record.post_url,
                    record.platform,
                    record.checked_at.isoformat(),
                    record.elapsed_hours,
                    record.views,
                    int(record.flagged),
                    record.reason,
                    json.dumps(record.metadata, ensure_ascii=False),
                ),
            )
            connection.commit()

    def load_latest_rule(self, platform: str) -> RuleRecord | None:
        if not self.rules_path.exists():
            return None
        payload = json.loads(self.rules_path.read_text(encoding="utf-8"))
        for item in payload:
            if item.get("platform") == platform:
                return RuleRecord.model_validate(item)
        return None

    def upsert_rule(self, rule: RuleRecord) -> None:
        payload: list[dict] = []
        if self.rules_path.exists():
            loaded = json.loads(self.rules_path.read_text(encoding="utf-8"))
            if isinstance(loaded, list):
                payload = loaded
        updated = False
        serialized = rule.model_dump(mode="json")
        for index, item in enumerate(payload):
            if item.get("platform") == rule.platform:
                payload[index] = serialized
                updated = True
                break
        if not updated:
            payload.append(serialized)
        self.rules_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    def list_snapshots(self, platform: str | None = None) -> list[dict[str, str | int]]:
        query = "SELECT platform, source_url, fetched_at, snapshot_path, content_hash, content_length FROM snapshots"
        params: tuple[str, ...] = ()
        if platform:
            query += " WHERE platform = ?"
            params = (platform,)
        query += " ORDER BY fetched_at DESC"
        with self._connect() as connection:
            rows = connection.execute(query, params).fetchall()
        return [dict(row) for row in rows]
