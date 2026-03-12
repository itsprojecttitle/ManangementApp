#!/usr/bin/env python3
import re
import subprocess
from pathlib import Path


EXPORT_DIR = Path.home() / "Downloads" / "OMNI Exports"
SAFE_NAME_RE = re.compile(r"[^A-Za-z0-9._ -]+")


def _sanitize_name(name: str, fallback: str = "omni-export.txt") -> str:
    raw = str(name or "").strip()
    if not raw:
        raw = fallback
    raw = raw.replace("/", "-").replace("\\", "-")
    safe = SAFE_NAME_RE.sub("-", raw).strip(" .-_")
    return safe or fallback


def _next_available_path(target: Path) -> Path:
    if not target.exists():
        return target
    stem = target.stem
    suffix = target.suffix
    parent = target.parent
    for idx in range(2, 1000):
        candidate = parent / f"{stem}-{idx}{suffix}"
        if not candidate.exists():
            return candidate
    return parent / f"{stem}-{target.stat().st_mtime_ns}{suffix}"


class OmniDesktopBridge:
    def copy_text(self, text: str):
        try:
            subprocess.run(["pbcopy"], input=str(text or "").encode("utf-8"), check=True)
            return {"ok": True}
        except Exception as exc:
            return {"ok": False, "error": str(exc)}

    def save_text_file(self, name: str, text: str):
        try:
            EXPORT_DIR.mkdir(parents=True, exist_ok=True)
            target = _next_available_path(EXPORT_DIR / _sanitize_name(name))
            target.write_text(str(text or ""), encoding="utf-8")
            return {"ok": True, "path": str(target)}
        except Exception as exc:
            return {"ok": False, "error": str(exc)}
