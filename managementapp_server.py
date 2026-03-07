#!/usr/bin/env python3
import json
import os
import re
import shutil
from datetime import datetime
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

WORKSPACE = Path(__file__).resolve().parent
OPERATIONS_DIR = WORKSPACE / "OperationDir" / "Operations"
BLACKBOOK_FILE = WORKSPACE / "blackbook.crm"
BLACKBOOK_MD_FILE = WORKSPACE / "OperationDir" / "BLACK_BOOK.md"
BLACKBOOK_JSON_FILE = WORKSPACE / "blackbook_entries.json"
HVI_INDEX_FILE = WORKSPACE / "OperationDir" / "HVI_INDEX.md"
MISSION_STATUSES = {"PENDING", "IN_PROGRESS", "COMPLETE", "BLOCKED"}


def _safe_name(name: str) -> str:
    return re.sub(r"[^A-Za-z0-9_-]+", "_", (name or "").strip()).strip("_") or "Untitled"


def _json_response(handler: SimpleHTTPRequestHandler, payload, status=200):
    body = json.dumps(payload, ensure_ascii=True).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Cache-Control", "no-store")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def load_operations():
    ops = []
    if OPERATIONS_DIR.exists():
        for p in sorted(OPERATIONS_DIR.iterdir()):
            if p.is_dir() and not p.name.startswith("."):
                ops.append(p.name)
    return ops


def load_missions():
    rows = []
    if not OPERATIONS_DIR.exists():
        return rows
    for missions_dir in sorted(OPERATIONS_DIR.rglob("Missions")):
        if not missions_dir.is_dir():
            continue
        op_rel = missions_dir.parent.relative_to(OPERATIONS_DIR).as_posix()
        for f in sorted(missions_dir.glob("*.md")):
            ts = datetime.fromtimestamp(f.stat().st_mtime).strftime("%Y-%m-%d")
            status = "PENDING"
            content = f.read_text(encoding="utf-8", errors="ignore")
            m = re.search(r"^\s*Status:\s*([A-Z_]+)\s*$", content, re.M)
            if m and m.group(1) in MISSION_STATUSES:
                status = m.group(1)
            rows.append({
                "date": ts,
                "operation": op_rel,
                "name": f.stem.replace("_", " "),
                "status": status,
                "path": str(f),
            })
    return rows


def update_mission_status(path: str, status: str) -> bool:
    p = Path(path)
    if status not in MISSION_STATUSES:
        return False
    if not p.exists() or not p.is_file() or not str(p).startswith(str(WORKSPACE)):
        return False

    content = p.read_text(encoding="utf-8", errors="ignore")
    if re.search(r"^\s*Status:\s*[A-Z_]+\s*$", content, re.M):
        content = re.sub(r"^\s*Status:\s*[A-Z_]+\s*$", f"Status: {status}", content, count=1, flags=re.M)
    else:
        content = f"{content.rstrip()}\n\nStatus: {status}\n"
    p.write_text(content, encoding="utf-8")
    return True


def _validate_mission_path(path: str):
    p = Path(path or "")
    if not p.exists() or not p.is_file():
        return None
    try:
        p = p.resolve()
        ws = WORKSPACE.resolve()
    except Exception:
        return None
    if not str(p).startswith(str(ws)):
        return None
    if p.suffix.lower() != ".md":
        return None
    return p


def _brief_dir_for_mission(mission_path: Path) -> Path:
    return mission_path.parent / ".brief_versions" / mission_path.stem


def _brief_index_path(mission_path: Path) -> Path:
    return _brief_dir_for_mission(mission_path) / "index.json"


def _load_brief_index(mission_path: Path):
    idx = _brief_index_path(mission_path)
    if not idx.exists():
        return {"versions": []}
    try:
        data = json.loads(idx.read_text(encoding="utf-8"))
        if isinstance(data, dict) and isinstance(data.get("versions", []), list):
            return data
    except Exception:
        pass
    return {"versions": []}


def _save_brief_index(mission_path: Path, data):
    bdir = _brief_dir_for_mission(mission_path)
    bdir.mkdir(parents=True, exist_ok=True)
    _brief_index_path(mission_path).write_text(json.dumps(data, indent=2), encoding="utf-8")


def get_mission_brief_payload(mission_path_str: str):
    mission_path = _validate_mission_path(mission_path_str)
    if not mission_path:
        return None
    data = _load_brief_index(mission_path)
    versions = data.get("versions", [])
    latest = versions[-1] if versions else None
    content = ""
    if latest:
        f = _brief_dir_for_mission(mission_path) / latest.get("file", "")
        if f.exists():
            content = f.read_text(encoding="utf-8", errors="ignore")
    return {
        "mission_path": str(mission_path),
        "versions": versions,
        "latest": latest,
        "content": content,
    }


def get_mission_brief_version(mission_path_str: str, file_name: str):
    mission_path = _validate_mission_path(mission_path_str)
    if not mission_path:
        return None
    file_name = Path(file_name or "").name
    if not file_name:
        return None
    idx = _load_brief_index(mission_path)
    versions = idx.get("versions", [])
    found = None
    for v in versions:
        if v.get("file", "") == file_name:
            found = v
            break
    if not found:
        return None
    f = _brief_dir_for_mission(mission_path) / file_name
    if not f.exists():
        return None
    return {
        "mission_path": str(mission_path),
        "version": found,
        "content": f.read_text(encoding="utf-8", errors="ignore"),
    }


def save_mission_brief_version(mission_path_str: str, phase: int, content: str, variables):
    mission_path = _validate_mission_path(mission_path_str)
    if not mission_path:
        return None
    if phase < 1:
        phase = 1
    if not isinstance(variables, list):
        variables = []

    bdir = _brief_dir_for_mission(mission_path)
    bdir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    fname = f"phase_{phase:02d}_{stamp}.md"
    (bdir / fname).write_text(content or "", encoding="utf-8")

    idx = _load_brief_index(mission_path)
    version = {
        "phase": int(phase),
        "file": fname,
        "created_at": datetime.now().isoformat(timespec="seconds"),
        "variables": variables,
    }
    idx.setdefault("versions", []).append(version)
    _save_brief_index(mission_path, idx)
    return version


def load_blackbook():
    if BLACKBOOK_JSON_FILE.exists():
        try:
            rows = json.loads(BLACKBOOK_JSON_FILE.read_text(encoding="utf-8"))
            if isinstance(rows, list):
                return rows
        except Exception:
            pass

    if BLACKBOOK_MD_FILE.exists():
        lines = BLACKBOOK_MD_FILE.read_text(encoding="utf-8", errors="ignore").splitlines()
        header = None
        rows = []
        in_table = False
        for line in lines:
            if line.strip().startswith("|"):
                cells = [c.strip() for c in line.strip().strip("|").split("|")]
                if not in_table:
                    # First table row should be the header row.
                    header = cells
                    in_table = True
                    continue
                # Separator row like | --- | --- |
                if all(set(c) <= {"-", ":"} for c in cells if c):
                    continue
                if header and len(cells) == len(header):
                    row = dict(zip(header, cells))
                    rows.append({
                        "Probe_ID": row.get("Probe_ID", ""),
                        "Date": "",
                        "Time": "",
                        "Operation": "",
                        "Mission": "",
                        "Status": "PENDING",
                        "Hypothesis": row.get("Hypothesis", ""),
                        "Platform": row.get("Platform", ""),
                        "Result_Quantitative": row.get("Result_Quantitative", "PENDING") or "PENDING",
                        "Notes": "",
                    })
            elif in_table:
                # End at first non-table line after table starts.
                break
        if rows:
            return rows

    if BLACKBOOK_FILE.exists():
        text = BLACKBOOK_FILE.read_text(encoding="utf-8", errors="ignore")
        status = "PENDING"
        m = re.search(r"\*\*STATUS:\*\*\s*(.+)", text)
        if m:
            status = m.group(1).strip()
        return [{
            "Probe_ID": "T001",
            "Date": "",
            "Time": "",
            "Operation": "",
            "Mission": "",
            "Status": "PENDING",
            "Hypothesis": "BLACKBOOK.CRM ENTRY",
            "Platform": "Instagram",
            "Result_Quantitative": status,
            "Notes": "",
        }]
    return []


def save_blackbook(rows):
    BLACKBOOK_JSON_FILE.write_text(json.dumps(rows, indent=2), encoding="utf-8")


def upsert_blackbook(entry):
    rows = load_blackbook()
    probe_id = (entry.get("Probe_ID") or "").strip()
    if not probe_id:
        probe_id = datetime.now().strftime("BB-%Y%m%d-%H%M%S")
    entry["Probe_ID"] = probe_id

    defaults = {
        "Date": datetime.now().strftime("%Y-%m-%d"),
        "Time": datetime.now().strftime("%H:%M"),
        "Operation": "",
        "Mission": "",
        "Status": "PENDING",
        "Hypothesis": "",
        "Platform": "Internal",
        "Result_Quantitative": "PENDING",
        "Notes": "",
    }
    for k, v in defaults.items():
        if entry.get(k) in (None, ""):
            entry[k] = v

    updated = False
    for i, r in enumerate(rows):
        if str(r.get("Probe_ID", "")).strip() == probe_id:
            rows[i] = {**r, **entry}
            updated = True
            break
    if not updated:
        rows.append(entry)
    save_blackbook(rows)
    return probe_id


def delete_blackbook_probe(probe_id: str) -> bool:
    if BLACKBOOK_JSON_FILE.exists():
        rows = load_blackbook()
        new_rows = [r for r in rows if str(r.get("Probe_ID", "")).strip() != probe_id]
        removed = len(new_rows) != len(rows)
        if removed:
            save_blackbook(new_rows)
        return removed

    if not probe_id or not BLACKBOOK_MD_FILE.exists():
        return False
    lines = BLACKBOOK_MD_FILE.read_text(encoding="utf-8", errors="ignore").splitlines()
    out = []
    removed = False
    in_table = False
    for line in lines:
        if line.strip().startswith("|"):
            in_table = True
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            # Keep header/separator rows
            if len(cells) > 0 and cells[0] in {"Probe_ID", "--------"}:
                out.append(line)
                continue
            if cells and cells[0] == probe_id:
                removed = True
                continue
            out.append(line)
        else:
            if in_table:
                in_table = False
            out.append(line)
    if removed:
        BLACKBOOK_MD_FILE.write_text("\n".join(out) + "\n", encoding="utf-8")
    return removed


def load_hvi():
    if not HVI_INDEX_FILE.exists():
        return []
    text = HVI_INDEX_FILE.read_text(encoding="utf-8", errors="ignore")
    out = []
    blocks = re.split(r"\n## HVI:\s*", text)
    for b in blocks[1:]:
        lines = b.splitlines()
        if not lines:
            continue
        handle = lines[0].strip()
        stage = "N/A"
        m = re.search(r"\*\s*Mission Stage:\s*(.+)", b)
        if m:
            stage = m.group(1).strip()
        out.append({"handle": handle, "stage": stage})
    return out


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WORKSPACE), **kwargs)

    def end_headers(self):
        # Force fresh HTML/JS/CSS on each refresh to avoid stale Safari cache.
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def _read_json_body(self):
        length = int(self.headers.get("Content-Length", "0") or 0)
        if length <= 0:
            return {}
        data = self.rfile.read(length)
        try:
            return json.loads(data.decode("utf-8"))
        except Exception:
            return {}

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)
        if path == "/api/operations":
            return _json_response(self, load_operations())
        if path == "/api/missions":
            return _json_response(self, load_missions())
        if path == "/api/blackbook":
            return _json_response(self, load_blackbook())
        if path == "/api/hvi":
            return _json_response(self, load_hvi())
        if path == "/api/mission/brief":
            mission_path = (query.get("mission_path", [""])[0] or "").strip()
            payload = get_mission_brief_payload(mission_path)
            if payload is None:
                return _json_response(self, {"error": "Invalid mission_path"}, 400)
            return _json_response(self, payload, 200)
        if path == "/api/mission/brief/version":
            mission_path = (query.get("mission_path", [""])[0] or "").strip()
            file_name = (query.get("file", [""])[0] or "").strip()
            payload = get_mission_brief_version(mission_path, file_name)
            if payload is None:
                return _json_response(self, {"error": "Brief version not found"}, 404)
            return _json_response(self, payload, 200)
        return super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        body = self._read_json_body()

        if path == "/api/operation":
            op = _safe_name(body.get("name", ""))
            (OPERATIONS_DIR / op / "Missions").mkdir(parents=True, exist_ok=True)
            return _json_response(self, {"ok": True, "operation": op}, 201)

        if path == "/api/operation/merge":
            source = _safe_name(body.get("source", ""))
            target = _safe_name(body.get("target", ""))
            merged = _safe_name(body.get("name", f"{source}_{target}"))
            if not source or not target or source == target:
                return _json_response(self, {"error": "Invalid source/target operation names"}, 400)
            source_dir = OPERATIONS_DIR / source
            target_dir = OPERATIONS_DIR / target
            if not source_dir.exists() or not source_dir.is_dir():
                return _json_response(self, {"error": f"Source operation not found: {source}"}, 404)
            if not target_dir.exists() or not target_dir.is_dir():
                return _json_response(self, {"error": f"Target operation not found: {target}"}, 404)
            merged_dir = OPERATIONS_DIR / merged
            if merged_dir.exists():
                return _json_response(self, {"error": f"Operation already exists: {merged}"}, 409)
            merged_dir.mkdir(parents=True, exist_ok=False)
            (merged_dir / "Missions").mkdir(parents=True, exist_ok=True)
            shutil.move(str(source_dir), str(merged_dir / source))
            shutil.move(str(target_dir), str(merged_dir / target))
            return _json_response(self, {"ok": True, "operation": merged}, 201)

        if path == "/api/mission":
            op = _safe_name(body.get("operation", "ProjectTitle"))
            name = _safe_name(body.get("name", "NEW_MISSION"))
            status = (body.get("status") or "PENDING")
            missions_dir = OPERATIONS_DIR / op / "Missions"
            missions_dir.mkdir(parents=True, exist_ok=True)
            f = missions_dir / f"{name}.md"
            if not f.exists():
                f.write_text(f"# {name}\n\nStatus: {status}\n", encoding="utf-8")
            upsert_blackbook({
                "Date": datetime.now().strftime("%Y-%m-%d"),
                "Time": datetime.now().strftime("%H:%M"),
                "Operation": op,
                "Mission": name.replace("_", " "),
                "Status": status,
                "Hypothesis": "Mission execution log entry",
                "Platform": "Internal",
                "Result_Quantitative": "PENDING",
                "Notes": str(f),
            })
            return _json_response(self, {"ok": True, "path": str(f)}, 201)

        if path == "/api/mission/status":
            mission_path = body.get("path", "")
            status = body.get("status", "")
            if update_mission_status(mission_path, status):
                return _json_response(self, {"ok": True})
            return _json_response(self, {"error": "Invalid mission path or status"}, 400)

        if path == "/api/mission/brief/save":
            mission_path = body.get("mission_path", "")
            phase = int(body.get("phase", 1) or 1)
            content = body.get("content", "")
            variables = body.get("variables", [])
            version = save_mission_brief_version(mission_path, phase, content, variables)
            if version is None:
                return _json_response(self, {"error": "Invalid mission_path"}, 400)
            return _json_response(self, {"ok": True, "version": version}, 201)

        if path == "/api/blackbook/upsert":
            probe_id = upsert_blackbook({
                "Probe_ID": body.get("Probe_ID", ""),
                "Date": body.get("Date", ""),
                "Time": body.get("Time", ""),
                "Operation": body.get("Operation", ""),
                "Mission": body.get("Mission", ""),
                "Status": body.get("Status", "PENDING"),
                "Hypothesis": body.get("Hypothesis", ""),
                "Platform": body.get("Platform", ""),
                "Result_Quantitative": body.get("Result_Quantitative", ""),
                "Notes": body.get("Notes", ""),
            })
            return _json_response(self, {"ok": True, "Probe_ID": probe_id}, 200)

        return _json_response(self, {"error": "Not Found"}, 404)

    def do_DELETE(self):
        path = urlparse(self.path).path
        body = self._read_json_body()

        if path == "/api/mission":
            p = Path(body.get("path", ""))
            if p.exists() and str(p).startswith(str(WORKSPACE)) and p.is_file():
                p.unlink()
                return _json_response(self, {"ok": True})
            return _json_response(self, {"error": "Mission file not found"}, 404)

        if path == "/api/operation":
            op = _safe_name(body.get("name", ""))
            p = OPERATIONS_DIR / op
            if p.exists() and p.is_dir():
                shutil.rmtree(p)
                return _json_response(self, {"ok": True})
            return _json_response(self, {"error": "Operation not found"}, 404)

        if path == "/api/blackbook":
            probe_id = body.get("probe_id", "")
            if delete_blackbook_probe(probe_id):
                return _json_response(self, {"ok": True})
            return _json_response(self, {"error": "Probe not found"}, 404)

        return _json_response(self, {"error": "Not Found"}, 404)


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 8099), Handler)
    print("ManagementApp server listening on http://127.0.0.1:8099")
    server.serve_forever()
