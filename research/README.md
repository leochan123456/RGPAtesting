# Research Monitoring Prototype

This directory contains a lightweight Python prototype that:

- fetches platform policy pages into `research_data/snapshots/`
- diffs new snapshots against the previous one
- extracts a small banned keyword list
- writes structured rules into `research_data/restriction_rules.json`
- logs shadowban checks to SQLite

## Run

```bash
python -m research.main run
python -m research.main shadowban --post-url https://example.com/post/123 --platform Xiaohongshu
```

## Outputs

- `research_data/snapshots/`
- `research_data/restriction_rules.json`
- `research_data/research.db`
