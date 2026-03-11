#!/usr/bin/env python3
import json
import re
import sys
from pathlib import Path
from urllib.parse import quote


IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".heic", ".avif"}


def slugify(value: str) -> str:
    clean = re.sub(r"[^a-z0-9]+", "_", str(value or "").strip().lower())
    return clean.strip("_")


def encoded_asset_path(rel_path: Path) -> str:
    return "/assets/gym_photos/" + "/".join(quote(part) for part in rel_path.parts)


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: build_gym_photo_manifest.py <source_dir> <output_json>", file=sys.stderr)
        return 1

    src_dir = Path(sys.argv[1])
    out_path = Path(sys.argv[2])
    out_path.parent.mkdir(parents=True, exist_ok=True)

    manifest: dict[str, str] = {}
    if src_dir.exists():
        for path in sorted(src_dir.rglob("*")):
            if not path.is_file() or path.suffix.lower() not in IMAGE_EXTS:
                continue
            rel = path.relative_to(src_dir)
            stem_key = slugify(path.stem)
            if not stem_key:
                continue
            manifest.setdefault(stem_key, encoded_asset_path(rel))
            if rel.parent != Path("."):
                parent_key = slugify(rel.parent.name)
                combo_key = slugify(f"{parent_key}_{path.stem}")
                if combo_key:
                    manifest.setdefault(combo_key, encoded_asset_path(rel))

    out_path.write_text(json.dumps(manifest, indent=2, sort_keys=True), encoding="utf-8")
    print(f"Gym photo manifest written to {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
