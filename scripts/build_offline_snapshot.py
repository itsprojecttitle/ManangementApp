#!/usr/bin/env python3
import json
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from managementapp_server import (
    load_blackbook,
    load_blueprints,
    load_hvi,
    load_manuels,
    load_missions,
    load_operations,
    swissknife_list_sessions,
)


def _write_json(path: Path, payload) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=True), encoding="utf-8")


def _manual_snapshot_rows():
    rows = []
    for row in load_manuels():
        item = dict(row)
        item["bundled"] = False
        rows.append(item)
    return rows


def main() -> int:
    out_dir = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else (ROOT_DIR / "www" / "data")
    payloads = {
        "operations.json": load_operations(),
        "missions.json": load_missions(),
        "blackbook.json": load_blackbook(),
        "hvi.json": load_hvi(),
        "blueprints.json": load_blueprints(),
        "manuels.json": _manual_snapshot_rows(),
        "swissknife_sessions.json": swissknife_list_sessions(),
    }
    for name, payload in payloads.items():
        _write_json(out_dir / name, payload)
    print(f"Offline snapshot written to {out_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
