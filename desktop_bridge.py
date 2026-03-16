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
    def swissknife_download(self, payload: dict):
        try:
            import managementapp_server as mod
            url = str(payload.get("url", "")).strip()
            if not url:
                return {"ok": False, "error": "url is required"}
            result = mod.swissknife_download_to_session(
                payload.get("session_id", ""),
                url,
                bool(payload.get("login", False)),
                payload.get("format", ""),
                payload.get("quality", ""),
                payload.get("source", ""),
                payload.get("output_dir", ""),
                bool(payload.get("compat_h264", False)),
                bool(payload.get("force_4k", False)),
            )
            return {"ok": True, "result": result}
        except Exception as exc:
            return {"ok": False, "error": str(exc)}

    def swissknife_batch_download(self, payload: dict):
        try:
            import managementapp_server as mod
            urls = payload.get("urls") or []
            if not isinstance(urls, list) or not urls:
                return {"ok": False, "error": "urls is required"}
            results = []
            for url in urls:
                url = str(url or "").strip()
                if not url:
                    continue
                result = mod.swissknife_download_to_session(
                    payload.get("session_id", ""),
                    url,
                    bool(payload.get("login", False)),
                    payload.get("format", ""),
                    payload.get("quality", ""),
                    payload.get("source", ""),
                    payload.get("output_dir", ""),
                    bool(payload.get("compat_h264", False)),
                    bool(payload.get("force_4k", False)),
                )
                results.append({"url": url, "result": result})
            return {"ok": True, "results": results}
        except Exception as exc:
            return {"ok": False, "error": str(exc)}

    def swissknife_convert(self, payload: dict):
        try:
            import managementapp_server as mod
            result = mod.swissknife_convert_file(
                payload.get("source_path", ""),
                payload.get("target_format", ""),
                payload.get("output_dir", ""),
                payload.get("profile", ""),
                bool(payload.get("force_4k", False)),
                payload.get("image_quality", ""),
            )
            return {"ok": True, "result": result}
        except Exception as exc:
            return {"ok": False, "error": str(exc)}

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
