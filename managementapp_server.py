#!/usr/bin/env python3
import json
import os
import re
import shutil
import time
import ipaddress
import shlex
import subprocess
import uuid
from threading import Lock
from collections import deque
from datetime import datetime
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from omni_runtime import ensure_runtime_root

WORKSPACE = ensure_runtime_root()
OPERATIONS_DIR = WORKSPACE / "OperationDir" / "Operations"
BLACKBOOK_FILE = WORKSPACE / "blackbook.crm"
BLACKBOOK_MD_FILE = WORKSPACE / "OperationDir" / "BLACK_BOOK.md"
BLACKBOOK_JSON_FILE = WORKSPACE / "blackbook_entries.json"
HVI_INDEX_FILE = WORKSPACE / "OperationDir" / "HVI_INDEX.md"
MANUEL_DIR = WORKSPACE / "OperationDir" / "Manuel"
EDITABLE_DOC_FILES = {"MissionBriefing.md", "MissionDebrief.md"}
SWISSKNIFE_SESSIONS_FILE = WORKSPACE / "swissknife_sessions.json"
SANDBOX_LAB_DIR = WORKSPACE / "SandboxLab"
SWISSKNIFE_VM_BASE = "/home/samuelapata/SwissknifeSessions"
GCLOUD_BIN = shutil.which("gcloud") or "/opt/homebrew/bin/gcloud"
GCLOUD_SSH_BASE = [
    GCLOUD_BIN,
    "compute",
    "ssh",
    "sam",
    "--zone",
    "europe-west2-a",
    "--tunnel-through-iap",
    "--command",
]
MISSION_STATUSES = {"PENDING", "IN_PROGRESS", "COMPLETE", "BLOCKED"}
ALLOWED_HOSTS = {"127.0.0.1:8099", "localhost:8099"}
ALLOW_LAN = os.environ.get("ALLOW_LAN", "").strip().lower() in {"1", "true", "yes", "on"}
RATE_LIMIT_WINDOW_SEC = 60
RATE_LIMIT_API_GET = 240
RATE_LIMIT_API_MUTATE = 90
RATE_LIMIT_STATIC = 300
BLOCKED_UA_PATTERNS = (
    "curl/",
    "wget/",
    "python-requests",
    "httpx/",
    "scrapy",
    "go-http-client",
    "headlesschrome",
    "playwright",
    "selenium",
    "phantomjs",
)
_RATE_BUCKETS = {}
_RATE_LOCK = Lock()
DEV_WATCH_FILES = (
    "ManagementApp.html",
    "assets/managementapp.js",
    "assets/managementapp.css",
    "sw.js",
)


def _safe_name(name: str) -> str:
    return re.sub(r"[^A-Za-z0-9_-]+", "_", (name or "").strip()).strip("_") or "Untitled"


def _safe_operation_rel(operation: str) -> str:
    parts = [_safe_name(part) for part in str(operation or "").split("/") if str(part).strip()]
    parts = [part for part in parts if part]
    return "/".join(parts) or "ProjectTitle"


def _operation_dir_for_rel(operation: str) -> Path:
    rel = _safe_operation_rel(operation)
    return OPERATIONS_DIR.joinpath(*rel.split("/"))


def _mission_identity_from_sync_payload(payload):
    payload = payload if isinstance(payload, dict) else {}
    operation = _safe_operation_rel(payload.get("operation", ""))
    mission_name = _safe_name(payload.get("name") or payload.get("mission") or "")
    raw_path = str(payload.get("path") or payload.get("mission_path") or "").replace("\\", "/")
    if raw_path:
        match = re.search(r"OperationDir/Operations/(.+?)/Missions/([^/]+)\.md$", raw_path)
        if match:
            if not operation:
                operation = _safe_operation_rel(match.group(1))
            if not mission_name:
                mission_name = _safe_name(match.group(2))
    return operation or "ProjectTitle", mission_name or "NEW_MISSION"


def _ensure_sync_mission_path(payload, default_status="PENDING"):
    operation, mission_name = _mission_identity_from_sync_payload(payload)
    mission_display = mission_name.replace("_", " ")
    op_dir = _operation_dir_for_rel(operation)
    missions_dir = op_dir / "Missions"
    missions_dir.mkdir(parents=True, exist_ok=True)
    mission_path = missions_dir / f"{_safe_name(mission_name)}.md"
    status = str(payload.get("status") or default_status or "PENDING").strip()
    if status not in MISSION_STATUSES:
        status = "PENDING"
    if not mission_path.exists():
        mission_path.write_text(_build_mission_file_content(mission_display, status, "", _mission_created_fallback(mission_path)), encoding="utf-8")
    else:
        update_mission_status(str(mission_path), status)
    ensure_mission_file_metadata(mission_path, mission_name=mission_display, status=status)
    return mission_path, operation, mission_display


def _merge_operation_dirs(source: str, target: str, merged: str):
    source = _safe_name(source)
    target = _safe_name(target)
    merged = _safe_name(merged or f"{source}_{target}")
    if not source or not target or source == target:
        raise RuntimeError("Invalid source/target operation names")
    source_dir = OPERATIONS_DIR / source
    target_dir = OPERATIONS_DIR / target
    if not source_dir.exists() or not source_dir.is_dir():
        raise RuntimeError(f"Source operation not found: {source}")
    if not target_dir.exists() or not target_dir.is_dir():
        raise RuntimeError(f"Target operation not found: {target}")
    merged_dir = OPERATIONS_DIR / merged
    if merged_dir.exists():
        raise RuntimeError(f"Operation already exists: {merged}")
    merged_dir.mkdir(parents=True, exist_ok=False)
    (merged_dir / "Missions").mkdir(parents=True, exist_ok=True)
    shutil.move(str(source_dir), str(merged_dir / source))
    shutil.move(str(target_dir), str(merged_dir / target))
    return merged


def _apply_backup_sync_action(action):
    action = action if isinstance(action, dict) else {}
    action_type = str(action.get("type", "")).strip()
    payload = action.get("payload", {}) if isinstance(action.get("payload", {}), dict) else {}
    if not action_type:
        raise RuntimeError("Missing sync action type")

    if action_type == "operation.create":
        op = _safe_operation_rel(payload.get("name", ""))
        (_operation_dir_for_rel(op) / "Missions").mkdir(parents=True, exist_ok=True)
        return "operation"

    if action_type == "operation.delete":
        op = _safe_name(payload.get("name", ""))
        if not op:
            raise RuntimeError("Missing operation name")
        target = OPERATIONS_DIR / op
        if target.exists() and target.is_dir():
            shutil.rmtree(target)
            remove_blackbook_for_operation(op)
            reindex_all_mission_metadata()
            sync_blackbook_for_all_missions(event="ID REINDEXED")
        return "operation"

    if action_type == "operation.merge":
        _merge_operation_dirs(payload.get("source", ""), payload.get("target", ""), payload.get("name", ""))
        return "operation"

    if action_type == "mission.create":
        mission_path, _, _ = _ensure_sync_mission_path(payload, payload.get("status", "PENDING"))
        reindex_all_mission_metadata()
        sync_blackbook_for_mission_path(str(mission_path), event="CREATED")
        return "mission"

    if action_type == "mission.delete":
        mission_path, _, _ = _ensure_sync_mission_path(payload, payload.get("status", "PENDING"))
        if mission_path.exists():
            mission_path.unlink()
            remove_blackbook_for_mission_path(str(mission_path))
            reindex_all_mission_metadata()
            sync_blackbook_for_all_missions(event="ID REINDEXED")
        return "mission"

    if action_type == "mission.status":
        mission_path, _, _ = _ensure_sync_mission_path(payload, payload.get("status", "PENDING"))
        if not update_mission_status(str(mission_path), payload.get("status", "")):
            raise RuntimeError("Invalid mission status update")
        sync_blackbook_for_mission_path(str(mission_path), event="STATUS UPDATED")
        return "mission"

    if action_type == "mission.brief.save":
        mission_path, _, _ = _ensure_sync_mission_path(payload, "IN_PROGRESS")
        phase = int(payload.get("phase", 1) or 1)
        version = save_mission_brief_version(
            str(mission_path),
            phase,
            payload.get("content", ""),
            payload.get("variables", []),
        )
        if version is None:
            raise RuntimeError("Failed to save mission brief")
        sync_blackbook_for_mission_path(str(mission_path), event=f"PHASE {version.get('phase', phase)} SAVED")
        return "mission"

    if action_type == "mission.debrief.save":
        mission_path, _, _ = _ensure_sync_mission_path(payload, "IN_PROGRESS")
        result = save_mission_debrief_version(str(mission_path), payload.get("content", ""))
        if result is None or (isinstance(result, dict) and result.get("error")):
            raise RuntimeError((result or {}).get("error", "Failed to save mission debrief"))
        update_mission_status(str(mission_path), "COMPLETE")
        sync_blackbook_for_mission_path(str(mission_path), event="DEBRIEF SAVED")
        return "mission"

    if action_type == "blackbook.upsert":
        upsert_blackbook({
            "Probe_ID": payload.get("Probe_ID", ""),
            "Date": payload.get("Date", ""),
            "Time": payload.get("Time", ""),
            "Operation": payload.get("Operation", ""),
            "Mission": payload.get("Mission", ""),
            "Status": payload.get("Status", "PENDING"),
            "Description": payload.get("Description", ""),
            "Hypothesis": payload.get("Hypothesis", ""),
            "Platform": payload.get("Platform", ""),
            "Result_Quantitative": payload.get("Result_Quantitative", ""),
            "Notes": payload.get("Notes", ""),
        })
        return "blackbook"

    if action_type == "blackbook.delete":
        probe_id = str(payload.get("probe_id", "")).strip()
        if probe_id:
            delete_blackbook_probe(probe_id)
        return "blackbook"

    if action_type == "hvi.upsert":
        handle = upsert_hvi(payload.get("handle", ""), payload.get("fields", {}))
        if not handle:
            raise RuntimeError("Invalid HVI handle")
        return "hvi"

    if action_type == "hvi.delete":
        handle = str(payload.get("handle", "")).strip()
        if handle:
            delete_hvi(handle)
        return "hvi"

    if action_type == "doc.save":
        if not save_doc_content(payload.get("file", ""), payload.get("content", "")):
            raise RuntimeError("Invalid editable document")
        return "doc"

    raise RuntimeError(f"Unsupported sync action: {action_type}")


def _apply_backup_snapshot(snapshot, summary):
    snapshot = snapshot if isinstance(snapshot, dict) else {}
    for op in snapshot.get("operations", []) if isinstance(snapshot.get("operations", []), list) else []:
        clean = _safe_operation_rel(op)
        (_operation_dir_for_rel(clean) / "Missions").mkdir(parents=True, exist_ok=True)
        summary["operations"] += 1
    for mission in snapshot.get("missions", []) if isinstance(snapshot.get("missions", []), list) else []:
        mission_path, _, _ = _ensure_sync_mission_path(mission, mission.get("status", "PENDING"))
        sync_blackbook_for_mission_path(str(mission_path), event="SNAPSHOT IMPORTED")
        summary["missions"] += 1
    for row in snapshot.get("blackbook", []) if isinstance(snapshot.get("blackbook", []), list) else []:
        upsert_blackbook(row if isinstance(row, dict) else {})
        summary["blackbook"] += 1
    for row in snapshot.get("hvi", []) if isinstance(snapshot.get("hvi", []), list) else []:
        row = row if isinstance(row, dict) else {}
        handle = row.get("handle", "")
        fields = row.get("fields", {})
        if handle:
            upsert_hvi(handle, fields)
            summary["hvi"] += 1


def _extract_sync_queue_from_backup(payload):
    queue = payload.get("sync_queue", []) if isinstance(payload, dict) else []
    if isinstance(queue, list) and queue:
        return queue
    local_storage = payload.get("local_storage", {}) if isinstance(payload, dict) else {}
    raw = local_storage.get("omniSyncQueue:v1") if isinstance(local_storage, dict) else ""
    if isinstance(raw, str) and raw.strip():
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                return parsed
        except Exception:
            pass
    return []


def import_backup_payload_to_workspace(payload):
    payload = payload if isinstance(payload, dict) else {}
    summary = {
        "applied_actions": 0,
        "operations": 0,
        "missions": 0,
        "blackbook": 0,
        "hvi": 0,
        "docs": 0,
    }
    errors = []

    sync_queue = _extract_sync_queue_from_backup(payload)
    if sync_queue:
        for idx, action in enumerate(sync_queue):
            try:
                bucket = _apply_backup_sync_action(action)
                summary["applied_actions"] += 1
                if bucket == "operation":
                    summary["operations"] += 1
                elif bucket == "mission":
                    summary["missions"] += 1
                elif bucket == "blackbook":
                    summary["blackbook"] += 1
                elif bucket == "hvi":
                    summary["hvi"] += 1
                elif bucket == "doc":
                    summary["docs"] += 1
            except Exception as exc:
                errors.append(f"action[{idx}] {exc}")
    else:
        try:
            _apply_backup_snapshot(payload.get("snapshot", {}), summary)
        except Exception as exc:
            errors.append(str(exc))

    return {
        "ok": not errors,
        "summary": summary,
        "errors": errors,
    }


def _json_response(handler: SimpleHTTPRequestHandler, payload, status=200):
    body = json.dumps(payload, ensure_ascii=True).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Cache-Control", "no-store")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def _cleanup_rate_buckets(now_ts: float):
    stale_clients = []
    for client_ip, events in _RATE_BUCKETS.items():
        while events and (now_ts - events[0]) > RATE_LIMIT_WINDOW_SEC:
            events.popleft()
        if not events:
            stale_clients.append(client_ip)
    for client_ip in stale_clients:
        _RATE_BUCKETS.pop(client_ip, None)


def _record_and_check_rate_limit(client_ip: str, max_events: int) -> bool:
    now_ts = time.time()
    with _RATE_LOCK:
        _cleanup_rate_buckets(now_ts)
        events = _RATE_BUCKETS.setdefault(client_ip, deque())
        while events and (now_ts - events[0]) > RATE_LIMIT_WINDOW_SEC:
            events.popleft()
        if len(events) >= max_events:
            return False
        events.append(now_ts)
        return True


def load_operations():
    ops = []
    if OPERATIONS_DIR.exists():
        for p in sorted(OPERATIONS_DIR.iterdir()):
            if p.is_dir() and not p.name.startswith("."):
                ops.append(p.name)
    return ops


def _mission_created_fallback(path: Path) -> str:
    try:
        stat = path.stat()
        ts = getattr(stat, "st_birthtime", 0) or stat.st_mtime
    except Exception:
        ts = time.time()
    return datetime.fromtimestamp(ts).strftime("%Y-%m-%d %H:%M")


def _extract_mission_line_value(text: str, label: str) -> str:
    match = re.search(rf"^\s*{re.escape(label)}:\s*(.+?)\s*$", text or "", re.M)
    return match.group(1).strip() if match else ""


def _extract_mission_heading(text: str) -> str:
    match = re.search(r"^\s*#\s+(.+?)\s*$", text or "", re.M)
    return match.group(1).strip() if match else ""


def _strip_mission_header_lines(text: str) -> str:
    lines = str(text or "").replace("\r\n", "\n").split("\n")
    if lines and re.match(r"^\s*#\s+.+$", lines[0]):
        lines = lines[1:]
    filtered = []
    for line in lines:
        if re.match(r"^\s*(Mission ID|Created|Mission Name|Status):\s*.*$", line):
            continue
        filtered.append(line.rstrip())
    return "\n".join(filtered).strip("\n").strip()


def _build_mission_file_content(mission_name: str, status: str, mission_id: str, created_at: str, body: str = "") -> str:
    header = [
        f"# {mission_name}",
        "",
        f"Mission ID: {mission_id}",
        f"Created: {created_at}",
        f"Mission Name: {mission_name}",
        f"Status: {status}",
    ]
    content = "\n".join(header)
    body = str(body or "").strip()
    if body:
        content = f"{content}\n\n{body}"
    return f"{content.rstrip()}\n"


def _read_mission_file_state(path: Path):
    p = Path(path)
    mission_name = p.stem.replace("_", " ")
    status = "PENDING"
    mission_id = ""
    created_at = _mission_created_fallback(p)
    body = ""
    try:
        text = p.read_text(encoding="utf-8", errors="ignore")
        mission_name = _extract_mission_line_value(text, "Mission Name") or _extract_mission_heading(text) or mission_name
        mission_id = _extract_mission_line_value(text, "Mission ID")
        created_at = _extract_mission_line_value(text, "Created") or created_at
        raw_status = _extract_mission_line_value(text, "Status")
        if raw_status in MISSION_STATUSES:
            status = raw_status
        body = _strip_mission_header_lines(text)
    except Exception:
        text = ""
    return {
        "path": p,
        "mission_name": mission_name,
        "mission_id": mission_id,
        "created_at": created_at,
        "status": status,
        "body": body,
    }


def ensure_mission_file_metadata(path: Path, mission_id: str = "", created_at: str = "", mission_name: str = "", status: str = "", body: str = None):
    p = Path(path)
    state = _read_mission_file_state(p)
    next_name = str(mission_name or state["mission_name"] or p.stem.replace("_", " ")).strip() or p.stem.replace("_", " ")
    next_status = str(status or state["status"] or "PENDING").strip().upper()
    if next_status not in MISSION_STATUSES:
        next_status = "PENDING"
    next_created = str(created_at or state["created_at"] or _mission_created_fallback(p)).strip() or _mission_created_fallback(p)
    next_id = str(mission_id or state["mission_id"] or "").strip()
    next_body = state["body"] if body is None else str(body or "").strip()
    content = _build_mission_file_content(next_name, next_status, next_id, next_created, next_body)
    current = ""
    try:
        current = p.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        pass
    if content != current:
        p.write_text(content, encoding="utf-8")
    return {
        "path": p,
        "mission_name": next_name,
        "mission_id": next_id,
        "created_at": next_created,
        "status": next_status,
        "body": next_body,
    }


def reindex_all_mission_metadata():
    records = []
    if not OPERATIONS_DIR.exists():
        return records
    for missions_dir in sorted(OPERATIONS_DIR.rglob("Missions")):
        if not missions_dir.is_dir():
            continue
        for f in sorted(missions_dir.glob("*.md")):
            state = _read_mission_file_state(f)
            state["status"] = _derive_mission_status(f, state["status"])
            operation, _ = _mission_identity_from_path(f)
            state["operation"] = operation
            records.append(state)
    records.sort(key=lambda row: (
        str(row.get("created_at") or ""),
        str(row.get("operation") or "").lower(),
        str(row.get("mission_name") or "").lower(),
        str(row.get("path") or "").lower(),
    ))
    for index, row in enumerate(records, start=1):
        row.update(ensure_mission_file_metadata(
            row["path"],
            mission_id=f"MIS-{index:03d}",
            created_at=row.get("created_at", ""),
            mission_name=row.get("mission_name", ""),
            status=row.get("status", "PENDING"),
            body=row.get("body", ""),
        ))
    return records


def load_missions():
    rows = []
    for row in reindex_all_mission_metadata():
        rows.append({
            "date": row.get("created_at", ""),
            "created_at": row.get("created_at", ""),
            "mission_id": row.get("mission_id", ""),
            "operation": row.get("operation", ""),
            "name": row.get("mission_name", ""),
            "status": row.get("status", "PENDING"),
            "path": str(row.get("path", "")),
        })
    return rows


def _status_from_mission_file(path: Path) -> str:
    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return "PENDING"
    m = re.search(r"^\s*Status:\s*([A-Z_]+)\s*$", text, re.M)
    if m and m.group(1) in MISSION_STATUSES:
        return m.group(1)
    return "PENDING"


def _debrief_dir_for_mission(mission_path: Path) -> Path:
    return mission_path.parent / ".debrief_versions" / mission_path.stem


def _debrief_index_path(mission_path: Path) -> Path:
    return _debrief_dir_for_mission(mission_path) / "index.json"


def _load_debrief_index(mission_path: Path):
    idx = _debrief_index_path(mission_path)
    if not idx.exists():
        return {"versions": []}
    try:
        data = json.loads(idx.read_text(encoding="utf-8"))
        if isinstance(data, dict) and isinstance(data.get("versions", []), list):
            return data
    except Exception:
        pass
    return {"versions": []}


def _save_debrief_index(mission_path: Path, data):
    ddir = _debrief_dir_for_mission(mission_path)
    ddir.mkdir(parents=True, exist_ok=True)
    _debrief_index_path(mission_path).write_text(json.dumps(data, indent=2), encoding="utf-8")


def _has_mission_debrief(mission_path: Path) -> bool:
    idx = _load_debrief_index(mission_path)
    versions = idx.get("versions", []) if isinstance(idx, dict) else []
    return bool(versions)


def _derive_mission_status(mission_path: Path, current_status: str) -> str:
    cur = current_status if current_status in MISSION_STATUSES else "PENDING"
    if _has_mission_debrief(mission_path):
        return "COMPLETE"
    brief_count, _ = _mission_brief_meta(mission_path)
    if brief_count > 0:
        return "IN_PROGRESS"
    if cur == "BLOCKED":
        return "BLOCKED"
    return "PENDING"


def _mission_identity_from_path(path: Path):
    p = Path(path)
    try:
        rel = p.parent.relative_to(OPERATIONS_DIR)
        operation = rel.as_posix().replace("/Missions", "")
    except Exception:
        operation = ""
    mission = p.stem.replace("_", " ")
    return operation, mission


def _mission_blackbook_probe_id(operation: str, mission: str) -> str:
    return f"MISSION:{_safe_operation_rel(operation)}:{_safe_name(mission)}"


def _merge_blackbook_mission_notes(existing_notes: str, mission_id: str, created_at: str, fallback: str) -> str:
    text = str(existing_notes or "").strip()
    text = re.sub(r"^\s*Mission ID:\s*[^|]+(?:\s*\|\s*Created:\s*[^|]+)?\s*\|?\s*", "", text, count=1, flags=re.I)
    text = text.strip(" |")
    suffix = text or str(fallback or "").strip()
    parts = [
        f"Mission ID: {mission_id or 'MIS-000'}",
        f"Created: {created_at or 'unknown'}",
    ]
    if suffix:
        parts.append(suffix)
    return " | ".join(parts)


def sync_blackbook_for_all_missions(event: str = "REINDEXED"):
    for row in reindex_all_mission_metadata():
        try:
            sync_blackbook_for_mission_path(str(row["path"]), event=event)
        except Exception:
            continue


def _mission_brief_meta(mission_path: Path):
    idx = _load_brief_index(mission_path)
    versions = idx.get("versions", []) if isinstance(idx, dict) else []
    latest_phase = 0
    if versions:
        latest = versions[-1] if isinstance(versions[-1], dict) else {}
        try:
            latest_phase = int(latest.get("phase", 0) or 0)
        except Exception:
            latest_phase = 0
    return len(versions), latest_phase


def _blackbook_rows_for_mission(rows, mission_path: str, operation: str, mission: str):
    matches = []
    mpath = str(mission_path or "").strip()
    op_norm = str(operation or "").strip().lower()
    ms_norm = str(mission or "").strip().lower()
    for i, row in enumerate(rows):
        notes = str((row or {}).get("Notes", "")).strip()
        row_op = str((row or {}).get("Operation", "")).strip().lower()
        row_ms = str((row or {}).get("Mission", "")).strip().lower()
        by_path = bool(mpath and (notes == mpath or notes.startswith(f"{mpath} |")))
        by_identity = bool(op_norm and ms_norm and row_op == op_norm and row_ms == ms_norm)
        if by_path or by_identity:
            matches.append(i)
    return matches


def sync_blackbook_for_mission_path(mission_path_str: str, event: str = "UPDATED"):
    mission_path = _validate_mission_path(mission_path_str)
    if not mission_path:
        return None
    operation, mission = _mission_identity_from_path(mission_path)
    mission_meta = _read_mission_file_state(mission_path)
    probe_id = _mission_blackbook_probe_id(operation, mission)
    status = _status_from_mission_file(mission_path)
    version_count, latest_phase = _mission_brief_meta(mission_path)
    now = datetime.now()

    rows = load_blackbook()
    hit_indexes = _blackbook_rows_for_mission(rows, str(mission_path), operation, mission)
    keep = None
    for idx in hit_indexes:
        if str((rows[idx] or {}).get("Probe_ID", "")).strip() == probe_id:
            keep = idx
            break
    if keep is None and hit_indexes:
        keep = hit_indexes[0]
    existing = rows[keep] if keep is not None else {}
    entry = {
        "Probe_ID": probe_id,
        "Date": now.strftime("%Y-%m-%d"),
        "Time": now.strftime("%H:%M"),
        "Operation": operation,
        "Mission": mission,
        "Status": status,
        "Description": str(existing.get("Description") or "").strip() or f"[{mission_meta.get('mission_id') or 'MIS-000'}] Auto-sync: Mission {event.lower()}.",
        "Hypothesis": str(existing.get("Hypothesis") or "").strip() or f"Mission lifecycle auto-tracked | created={mission_meta.get('created_at') or 'unknown'} | phases={version_count}",
        "Platform": str(existing.get("Platform") or "").strip() or "Internal",
        "Result_Quantitative": str(existing.get("Result_Quantitative") or "").strip() or status,
        "Notes": _merge_blackbook_mission_notes(
            existing.get("Notes", ""),
            mission_meta.get("mission_id", ""),
            mission_meta.get("created_at", ""),
            f"{mission_path} | phases:{version_count} | latest_phase:{latest_phase}",
        ),
    }

    if keep is not None:
        rows[keep] = {**rows[keep], **entry}
        rows[keep]["Probe_ID"] = probe_id
        for idx in reversed([i for i in hit_indexes if i != keep]):
            rows.pop(idx)
        save_blackbook(rows)
        return probe_id
    return upsert_blackbook(entry)


def remove_blackbook_for_mission_path(mission_path_str: str):
    mission_path = str(mission_path_str or "").strip()
    if not mission_path:
        return 0
    p = Path(mission_path)
    operation, mission = _mission_identity_from_path(p)
    rows = load_blackbook()
    hit_indexes = _blackbook_rows_for_mission(rows, mission_path, operation, mission)
    if not hit_indexes:
        return 0
    for idx in reversed(hit_indexes):
        rows.pop(idx)
    save_blackbook(rows)
    return len(hit_indexes)


def remove_blackbook_for_operation(operation: str):
    op_norm = str(operation or "").strip().lower()
    if not op_norm:
        return 0
    rows = load_blackbook()
    new_rows = [r for r in rows if str((r or {}).get("Operation", "")).strip().lower() != op_norm]
    removed = len(rows) - len(new_rows)
    if removed:
        save_blackbook(new_rows)
    return removed


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
    ensure_mission_file_metadata(p, status=status)
    return True


def get_mission_content(path: str):
    p = _validate_mission_path(path)
    if not p:
        return None
    content = p.read_text(encoding="utf-8", errors="ignore")
    return {"path": str(p), "content": content}


def save_mission_content(path: str, content: str) -> bool:
    p = _validate_mission_path(path)
    if not p:
        return False
    if not isinstance(content, str):
        content = ""

    # Preserve status metadata if editor text removes it.
    existing = p.read_text(encoding="utf-8", errors="ignore")
    prev_status = "PENDING"
    m = re.search(r"^\s*Status:\s*([A-Z_]+)\s*$", existing, re.M)
    if m and m.group(1) in MISSION_STATUSES:
        prev_status = m.group(1)
    if not re.search(r"^\s*Status:\s*[A-Z_]+\s*$", content, re.M):
        content = f"{content.rstrip()}\n\nStatus: {prev_status}\n"

    p.write_text(content, encoding="utf-8")
    ensure_mission_file_metadata(p, status=prev_status)
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


def get_mission_debrief_payload(mission_path_str: str):
    mission_path = _validate_mission_path(mission_path_str)
    if not mission_path:
        return None
    data = _load_debrief_index(mission_path)
    versions = data.get("versions", [])
    latest = versions[-1] if versions else None
    content = ""
    if latest:
        f = _debrief_dir_for_mission(mission_path) / latest.get("file", "")
        if f.exists():
            content = f.read_text(encoding="utf-8", errors="ignore")
    return {
        "mission_path": str(mission_path),
        "versions": versions,
        "latest": latest,
        "content": content,
    }


def _extract_hvi_handles_from_text(text: str):
    out = []
    seen = set()
    for m in re.finditer(r"(?:\bHVI\b|\bHandle\b|\bTarget\b)\s*[:\-]\s*@?([A-Za-z0-9._-]{2,64})", text or "", re.I):
        h = m.group(1).strip()
        key = h.lower()
        if key not in seen:
            out.append(h)
            seen.add(key)
    for m in re.finditer(r"@([A-Za-z0-9._-]{2,64})", text or ""):
        h = m.group(1).strip()
        key = h.lower()
        if key not in seen:
            out.append(h)
            seen.add(key)
    return out[:24]


def _extract_line_value(text: str, patterns):
    for pat in patterns:
        m = re.search(pat, text or "", re.I | re.M)
        if m:
            return str(m.group(1) or "").strip()
    return ""


def save_mission_debrief_version(mission_path_str: str, content: str):
    mission_path = _validate_mission_path(mission_path_str)
    if not mission_path:
        return None
    brief_count, latest_phase = _mission_brief_meta(mission_path)
    if brief_count < 1:
        return {"error": "Brief required before debrief."}

    ddir = _debrief_dir_for_mission(mission_path)
    ddir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    fname = f"debrief_{max(latest_phase, 1):02d}_{stamp}.md"
    (ddir / fname).write_text(content or "", encoding="utf-8")

    idx = _load_debrief_index(mission_path)
    version = {
        "phase": int(max(latest_phase, 1)),
        "file": fname,
        "created_at": datetime.now().isoformat(timespec="seconds"),
    }
    idx.setdefault("versions", []).append(version)
    _save_debrief_index(mission_path, idx)

    update_mission_status(str(mission_path), "COMPLETE")

    operation, mission = _mission_identity_from_path(mission_path)
    status_line = _extract_line_value(content, [
        r"^\s*HVI\s*Status\s*[:\-]\s*(.+)$",
        r"^\s*Status\s*[:\-]\s*(.+)$",
    ]) or "UPDATED"
    result_line = _extract_line_value(content, [
        r"^\s*Result\s*[:\-]\s*(.+)$",
        r"^\s*Outcome\s*[:\-]\s*(.+)$",
    ]) or "Debrief logged"
    next_phase = _extract_line_value(content, [r"^\s*Next\s*Phase\s*[:\-]\s*(.+)$"])
    handles = _extract_hvi_handles_from_text(content)
    updated_handles = []
    for handle in handles:
        h = upsert_hvi(handle, {
            "Status": status_line,
            "Mission Stage": "DEBRIEFED",
            "Operation": operation,
            "Mission": mission,
            "Result": result_line,
            "Next Phase": next_phase or "N/A",
            "Last Debrief At": datetime.now().isoformat(timespec="seconds"),
        })
        if h:
            updated_handles.append(h)

    return {"version": version, "hvi_updated": updated_handles}


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
    update_mission_status(str(mission_path), "IN_PROGRESS")
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
                        "Description": row.get("Description", ""),
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
            "Description": "",
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
        "Description": "",
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
        fields = {}
        for m in re.finditer(r"^\*\s*([^:]+):\s*(.+)$", b, re.M):
            key = m.group(1).strip()
            value = m.group(2).strip()
            fields[key] = value
        status = fields.get("Status") or fields.get("Mission Stage") or "N/A"
        number = fields.get("Number") or fields.get("Contact Number") or "N/A"
        out.append({
            "handle": handle,
            "stage": status,
            "status": status,
            "number": number,
            "fields": fields,
        })
    return out


def _normalize_hvi_fields(fields):
    out = {}
    if not isinstance(fields, dict):
        return out
    for k, v in fields.items():
        key = str(k or "").strip()
        if not key:
            continue
        val = str(v or "").strip()
        out[key] = val
    return out


def save_hvi(rows):
    rows = rows if isinstance(rows, list) else []
    lines = ["# HVI INDEX", ""]
    for row in sorted(rows, key=lambda r: str((r or {}).get("handle", "")).lower()):
        handle = str((row or {}).get("handle", "")).strip()
        if not handle:
            continue
        fields = _normalize_hvi_fields((row or {}).get("fields", {}))
        lines.append(f"## HVI: {handle}")
        for k, v in fields.items():
            lines.append(f"* {k}: {v}")
        lines.append("")
    HVI_INDEX_FILE.parent.mkdir(parents=True, exist_ok=True)
    HVI_INDEX_FILE.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def upsert_hvi(handle: str, fields: dict):
    handle = str(handle or "").strip()
    if not handle:
        return None
    rows = load_hvi()
    merged_fields = _normalize_hvi_fields(fields)
    hit = None
    for i, row in enumerate(rows):
        if str(row.get("handle", "")).strip().lower() == handle.lower():
            hit = i
            break
    if hit is None:
        base_fields = {}
        if "Status" not in merged_fields:
            base_fields["Status"] = "N/A"
        if "Number" not in merged_fields:
            base_fields["Number"] = "N/A"
        base_fields.update(merged_fields)
        rows.append({
            "handle": handle,
            "stage": base_fields.get("Status", "N/A"),
            "status": base_fields.get("Status", "N/A"),
            "number": base_fields.get("Number", "N/A"),
            "fields": base_fields,
        })
    else:
        row = rows[hit]
        cur_fields = _normalize_hvi_fields(row.get("fields", {}))
        cur_fields.update(merged_fields)
        rows[hit] = {
            **row,
            "handle": row.get("handle", handle),
            "stage": cur_fields.get("Status", row.get("stage", "N/A")),
            "status": cur_fields.get("Status", row.get("status", "N/A")),
            "number": cur_fields.get("Number", row.get("number", "N/A")),
            "fields": cur_fields,
        }
    save_hvi(rows)
    return handle


def delete_hvi(handle: str) -> bool:
    handle = str(handle or "").strip()
    if not handle:
        return False
    rows = load_hvi()
    new_rows = [r for r in rows if str(r.get("handle", "")).strip().lower() != handle.lower()]
    if len(new_rows) == len(rows):
        return False
    save_hvi(new_rows)
    return True


def _validate_doc_file(name: str):
    name = Path(name or "").name
    if name not in EDITABLE_DOC_FILES:
        return None
    p = (WORKSPACE / name).resolve()
    try:
        ws = WORKSPACE.resolve()
    except Exception:
        return None
    if not str(p).startswith(str(ws)):
        return None
    return p


def get_doc_content(name: str):
    p = _validate_doc_file(name)
    if not p:
        return None
    if not p.exists():
        p.write_text("", encoding="utf-8")
    return {"file": p.name, "path": str(p), "content": p.read_text(encoding="utf-8", errors="ignore")}


def save_doc_content(name: str, content: str) -> bool:
    p = _validate_doc_file(name)
    if not p:
        return False
    if not isinstance(content, str):
        content = ""
    p.write_text(content, encoding="utf-8")
    return True


def _load_swissknife_sessions():
    if not SWISSKNIFE_SESSIONS_FILE.exists():
        return []
    try:
        data = json.loads(SWISSKNIFE_SESSIONS_FILE.read_text(encoding="utf-8"))
        if isinstance(data, list):
            return data
    except Exception:
        pass
    return []


def _save_swissknife_sessions(rows):
    SWISSKNIFE_SESSIONS_FILE.write_text(json.dumps(rows, indent=2), encoding="utf-8")


def _run_vm_command(command: str, timeout_sec: int = 180):
    proc = subprocess.run(
        GCLOUD_SSH_BASE + [command],
        text=True,
        capture_output=True,
        timeout=timeout_sec,
    )
    if proc.returncode != 0:
        err = (proc.stdout or proc.stderr or "VM command failed").strip()
        raise RuntimeError(err)
    return (proc.stdout or "").strip()


def _swissknife_session_id(label: str):
    safe = _safe_name(label or "daily")
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"{stamp}_{safe}"


def _find_session(rows, session_id: str):
    sid = str(session_id or "").strip()
    for i, row in enumerate(rows):
        if str((row or {}).get("id", "")).strip() == sid:
            return i
    return -1


def swissknife_list_sessions():
    rows = _load_swissknife_sessions()
    rows.sort(key=lambda r: str((r or {}).get("created_at", "")), reverse=True)
    return rows


def swissknife_create_session(label: str):
    label = str(label or "").strip() or "daily"
    session_id = _swissknife_session_id(label)
    day = datetime.now().strftime("%Y-%m-%d")
    remote_path = f"{SWISSKNIFE_VM_BASE}/{day}/{session_id}"
    cmd = f"mkdir -p {shlex.quote(remote_path)} && echo OK"
    _run_vm_command(cmd, timeout_sec=60)
    rows = _load_swissknife_sessions()
    row = {
        "id": session_id,
        "label": label,
        "day": day,
        "created_at": datetime.now().isoformat(timespec="seconds"),
        "remote_path": remote_path,
        "downloads": [],
    }
    rows.append(row)
    _save_swissknife_sessions(rows)
    return row


def swissknife_download_to_session(session_id: str, url: str, do_login: bool):
    session_id = str(session_id or "").strip()
    url = str(url or "").strip()
    if not session_id or not url:
        raise RuntimeError("session_id and url are required")

    rows = _load_swissknife_sessions()
    idx = _find_session(rows, session_id)
    if idx < 0:
        raise RuntimeError("Session not found")

    remote_path = str(rows[idx].get("remote_path", "")).strip()
    if not remote_path:
        raise RuntimeError("Session missing remote_path")

    login_flag = "--login" if do_login else ""
    remote_cmd = (
        "set -e; "
        f"OUT={shlex.quote(remote_path)}; URL={shlex.quote(url)}; "
        "export SWISSKNIFE_DIR=/home/samuelapata/.codex/skills/swissknife-backend; "
        "mkdir -p \"$OUT\"; "
        "SCRIPT=''; "
        "for b in "
        "/home/samuelapata/.codex/skills/swissknife-backend/scripts "
        "/home/samuelapata/Swissknife/scripts "
        "/home/samuelapata/.openclaw/workspace/swissknife-backend/scripts; do "
        "  if [ -f \"$b/ig_download_post.py\" ]; then SCRIPT=\"$b/ig_download_post.py\"; break; fi; "
        "done; "
        "if [ -z \"$SCRIPT\" ]; then "
        "  echo '{\"error\":\"ig_download_post.py not found on VM\"}'; exit 2; "
        "fi; "
        f"python3 \"$SCRIPT\" \"$URL\" --out \"$OUT\" {login_flag}"
    )
    try:
        stdout = _run_vm_command(remote_cmd, timeout_sec=360)
    except Exception as exc:
        raw = str(exc).strip()
        msg = raw
        try:
            parsed_err = json.loads(raw)
        except Exception:
            parsed_err = None
        if isinstance(parsed_err, dict) and parsed_err.get("error"):
            msg = str(parsed_err.get("error"))
        raise RuntimeError(msg)
    parsed = None
    try:
        parsed = json.loads(stdout)
    except Exception:
        m = re.search(r"(\{[\s\S]*\})\s*$", stdout)
        if m:
            parsed = json.loads(m.group(1))
    if not isinstance(parsed, dict):
        raise RuntimeError("Swissknife download did not return JSON manifest")

    record = {
        "url": url,
        "downloaded_at": datetime.now().isoformat(timespec="seconds"),
        "shortcode": parsed.get("shortcode", ""),
        "owner_username": parsed.get("owner_username", ""),
        "download_dir": parsed.get("download_dir", remote_path),
        "file_count": len(parsed.get("files", [])) if isinstance(parsed.get("files", []), list) else 0,
        "manifest": parsed,
    }
    rows[idx].setdefault("downloads", []).append(record)
    rows[idx]["last_download_at"] = record["downloaded_at"]
    _save_swissknife_sessions(rows)
    return {"session": rows[idx], "download": record}


def swissknife_delete_session(session_id: str):
    sid = str(session_id or "").strip()
    if not sid:
        raise RuntimeError("session_id is required")
    rows = _load_swissknife_sessions()
    idx = _find_session(rows, sid)
    if idx < 0:
        raise RuntimeError("Session not found")
    row = rows[idx]
    rows.pop(idx)
    _save_swissknife_sessions(rows)
    return {"id": sid, "remote_path": str(row.get("remote_path", ""))}


def run_python_sandbox(code: str):
    source = str(code or "")
    if not source.strip():
        raise RuntimeError("Code is empty")
    if len(source) > 60000:
        raise RuntimeError("Code too large")
    blocked = [
        r"\bimport\s+os\b",
        r"\bimport\s+subprocess\b",
        r"\bimport\s+socket\b",
        r"\bimport\s+requests\b",
        r"\bfrom\s+os\s+import\b",
        r"\bfrom\s+subprocess\s+import\b",
        r"\bos\.system\s*\(",
        r"\bsubprocess\.",
        r"\beval\s*\(",
        r"\bexec\s*\(",
        r"\bopen\s*\(",
        r"__import__\s*\(",
    ]
    lower_src = source.lower()
    for pat in blocked:
        if re.search(pat, lower_src):
            raise RuntimeError("Blocked operation in sandbox code")

    SANDBOX_LAB_DIR.mkdir(parents=True, exist_ok=True)
    script_name = f"lab_{uuid.uuid4().hex}.py"
    script_path = SANDBOX_LAB_DIR / script_name
    script_path.write_text(source, encoding="utf-8")
    t0 = time.time()
    env = {
        "PATH": os.environ.get("PATH", ""),
        "PYTHONNOUSERSITE": "1",
        "PYTHONDONTWRITEBYTECODE": "1",
        "HOME": str(SANDBOX_LAB_DIR),
    }
    try:
        proc = subprocess.run(
            ["python3", "-I", str(script_path.name)],
            cwd=str(SANDBOX_LAB_DIR),
            capture_output=True,
            text=True,
            timeout=8,
            env=env,
        )
        out = (proc.stdout or "")[:120000]
        err = (proc.stderr or "")[:120000]
        return {
            "ok": True,
            "exit_code": int(proc.returncode),
            "stdout": out,
            "stderr": err,
            "duration_ms": int((time.time() - t0) * 1000),
        }
    except subprocess.TimeoutExpired as exc:
        return {
            "ok": True,
            "exit_code": 124,
            "stdout": (exc.stdout or "")[:120000] if isinstance(exc.stdout, str) else "",
            "stderr": ((exc.stderr or "")[:120000] if isinstance(exc.stderr, str) else "") + "\nExecution timed out (8s).",
            "duration_ms": int((time.time() - t0) * 1000),
        }
    finally:
        try:
            script_path.unlink(missing_ok=True)
        except Exception:
            pass


def _validate_bash_script(source: str):
    src = str(source or "")
    if not src.strip():
        raise RuntimeError("Code is empty")
    if len(src) > 60000:
        raise RuntimeError("Code too large")
    blocked_fragments = [
        "sudo", "ssh", "scp", "sftp", "curl", "wget", "nc ", "netcat", "nmap",
        "python", "perl", "ruby", "php", "node", "docker", "podman", "kubectl",
        "rm ", "mv ", "cp ", "chmod", "chown", "dd ", "mkfs", "mount", "umount",
        "apt ", "brew ", "pip ", "pip3 ", "git ", ">", ">>", "<", "|", "&", ";", "$(",
        "`", "~", "..", "/etc", "/var", "/usr", "/home",
    ]
    low = src.lower()
    for frag in blocked_fragments:
        if frag in low:
            raise RuntimeError("Blocked operation in bash sandbox code")
    allowed = {
        "echo", "printf", "pwd", "ls", "cat", "grep", "sed", "awk", "cut", "sort",
        "uniq", "wc", "head", "tail", "tr", "date", "uname", "whoami", "seq", "sleep",
        "true", "false", "test", "[", "expr", "clear",
        "for", "do", "done", "if", "then", "fi", "while", "in",
    }
    for raw in src.splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        cmd = line.split()[0].strip()
        if cmd not in allowed:
            raise RuntimeError(f"Command not allowed in bash sandbox: {cmd}")


def run_bash_sandbox(code: str):
    source = str(code or "")
    _validate_bash_script(source)
    SANDBOX_LAB_DIR.mkdir(parents=True, exist_ok=True)
    script_name = f"lab_{uuid.uuid4().hex}.sh"
    script_path = SANDBOX_LAB_DIR / script_name
    script_path.write_text(source, encoding="utf-8")
    t0 = time.time()
    env = {
        "PATH": "/usr/bin:/bin",
        "HOME": str(SANDBOX_LAB_DIR),
    }
    try:
        proc = subprocess.run(
            ["bash", "--noprofile", "--norc", str(script_path.name)],
            cwd=str(SANDBOX_LAB_DIR),
            capture_output=True,
            text=True,
            timeout=8,
            env=env,
        )
        return {
            "ok": True,
            "exit_code": int(proc.returncode),
            "stdout": (proc.stdout or "")[:120000],
            "stderr": (proc.stderr or "")[:120000],
            "duration_ms": int((time.time() - t0) * 1000),
        }
    except subprocess.TimeoutExpired as exc:
        return {
            "ok": True,
            "exit_code": 124,
            "stdout": (exc.stdout or "")[:120000] if isinstance(exc.stdout, str) else "",
            "stderr": ((exc.stderr or "")[:120000] if isinstance(exc.stderr, str) else "") + "\nExecution timed out (8s).",
            "duration_ms": int((time.time() - t0) * 1000),
        }
    finally:
        try:
            script_path.unlink(missing_ok=True)
        except Exception:
            pass


def run_code_sandbox(mode: str, code: str):
    m = str(mode or "python").strip().lower()
    if m == "python":
        return run_python_sandbox(code)
    if m == "bash":
        return run_bash_sandbox(code)
    raise RuntimeError("Unsupported sandbox mode")


def load_blueprints():
    rows = []
    for f in sorted(WORKSPACE.glob("BLUEPRINT*.md")):
        if not f.is_file():
            continue
        title = f.stem.replace("_", " ")
        try:
            text = f.read_text(encoding="utf-8", errors="ignore")
            m = re.search(r"^\s*#\s*(.+?)\s*$", text, re.M)
            if m:
                title = m.group(1).strip()
        except Exception:
            pass
        rows.append({
            "file": f.name,
            "title": title,
            "source_path": f"/home/samuelapata/.openclaw/workspace/{f.name}",
        })
    return rows


def load_books():
    rows = []
    for f in sorted(WORKSPACE.glob("*BOOK*.md")):
        if not f.is_file():
            continue
        title = f.stem.replace("_", " ")
        try:
            text = f.read_text(encoding="utf-8", errors="ignore")
            m = re.search(r"^\s*#\s*(.+?)\s*$", text, re.M)
            if m:
                title = m.group(1).strip()
        except Exception:
            pass
        rows.append({
            "file": f.name,
            "title": title,
            "source_path": f"/home/samuelapata/.openclaw/workspace/{f.name}",
        })
    return rows


def load_manuels():
    rows = []
    if not MANUEL_DIR.exists():
        return rows
    for f in sorted(MANUEL_DIR.rglob("*")):
        if not f.is_file():
            continue
        if "_archive_non_hacking" in f.parts:
            continue
        ext = f.suffix.lower()
        if ext not in {".pdf", ".md", ".txt"}:
            continue
        rel = f.relative_to(WORKSPACE).as_posix()
        stat = f.stat()
        rows.append({
            "file": f.name,
            "title": f.stem.replace("_", " "),
            "path": rel,
            "source_path": f"/home/samuelapata/.openclaw/workspace/{rel}",
            "type": ext.lstrip("."),
            "size": int(stat.st_size),
            "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat(timespec="seconds"),
        })
    return rows


def load_dev_build_meta():
    workspace_root = WORKSPACE.resolve()
    latest_mtime = 0.0
    watched = []
    for rel_path in DEV_WATCH_FILES:
        path = (WORKSPACE / rel_path).resolve()
        try:
            if not path.exists() or not path.is_file() or not str(path).startswith(str(workspace_root)):
                continue
            stat = path.stat()
        except Exception:
            continue
        latest_mtime = max(latest_mtime, stat.st_mtime)
        watched.append({
            "path": rel_path,
            "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat(timespec="seconds"),
        })
    return {
        "version": str(int(latest_mtime * 1000)) if latest_mtime else "0",
        "updated_at": datetime.fromtimestamp(latest_mtime).isoformat(timespec="seconds") if latest_mtime else "",
        "files": watched,
    }


class Handler(SimpleHTTPRequestHandler):
    server_version = "ManagementApp"
    sys_version = ""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WORKSPACE), **kwargs)

    def end_headers(self):
        # Force fresh HTML/JS/CSS on each refresh and send hardening headers.
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        self.send_header("X-Content-Type-Options", "nosniff")
        # Allow same-origin iframe rendering for local PDF/manual popup viewer.
        self.send_header("X-Frame-Options", "SAMEORIGIN")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()")
        self.send_header(
            "Content-Security-Policy",
            "default-src 'self'; "
            "connect-src 'self'; "
            "img-src 'self' data:; "
            "style-src 'self' 'unsafe-inline'; "
            "script-src 'self' 'unsafe-inline'; "
            "object-src 'none'; "
            "base-uri 'none'; "
            "frame-ancestors 'self'; "
            "form-action 'self'"
        )
        super().end_headers()

    def _client_ip(self) -> str:
        return (self.client_address[0] if self.client_address else "") or ""

    def _is_local_client(self) -> bool:
        ip = self._client_ip()
        try:
            addr = ipaddress.ip_address(ip)
            if addr.is_loopback:
                return True
            if ALLOW_LAN and addr.is_private:
                return True
            return False
        except Exception:
            return False

    def _is_allowed_host(self) -> bool:
        host = (self.headers.get("Host") or "").strip().lower()
        if host in ALLOWED_HOSTS:
            return True
        if ALLOW_LAN and host.endswith(":8099"):
            return True
        return False

    def _is_allowed_origin(self) -> bool:
        host = (self.headers.get("Host") or "").strip().lower()
        origin = (self.headers.get("Origin") or "").strip().lower()
        referer = (self.headers.get("Referer") or "").strip().lower()
        if not host:
            return False
        allowed_prefixes = (f"http://{host}/", f"https://{host}/")
        if origin and not origin.startswith((f"http://{host}", f"https://{host}")):
            return False
        if referer and not referer.startswith(allowed_prefixes):
            return False
        return True

    def _is_blocked_user_agent(self) -> bool:
        ua = (self.headers.get("User-Agent") or "").lower()
        if not ua:
            return False
        return any(p in ua for p in BLOCKED_UA_PATTERNS)

    def _forbidden(self, message: str = "Forbidden"):
        return _json_response(self, {"error": message}, 403)

    def _too_many(self):
        return _json_response(self, {"error": "Too many requests"}, 429)

    def _enforce_request_guard(self, method: str, path: str) -> bool:
        is_api = path.startswith("/api/")
        if not self._is_local_client():
            self._forbidden("Local access only")
            return False
        if not self._is_allowed_host():
            self._forbidden("Invalid host")
            return False
        if is_api and not self._is_allowed_origin():
            self._forbidden("Origin check failed")
            return False
        if is_api and self._is_blocked_user_agent():
            self._forbidden("User-Agent blocked")
            return False

        client_ip = self._client_ip()
        if is_api:
            limit = RATE_LIMIT_API_GET if method == "GET" else RATE_LIMIT_API_MUTATE
        else:
            limit = RATE_LIMIT_STATIC
        if not _record_and_check_rate_limit(client_ip, limit):
            self._too_many()
            return False
        return True

    def _read_json_body(self):
        length = int(self.headers.get("Content-Length", "0") or 0)
        if length <= 0:
            return {}
        data = self.rfile.read(length)
        try:
            return json.loads(data.decode("utf-8"))
        except Exception:
            return {}

    def list_directory(self, path):
        return self._forbidden("Directory listing disabled")

    def do_OPTIONS(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if not self._enforce_request_guard("OPTIONS", path):
            return
        self.send_response(204)
        self.send_header("Allow", "GET, POST, DELETE, OPTIONS")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if not self._enforce_request_guard("GET", path):
            return
        query = parse_qs(parsed.query)
        if path == "/api/operations":
            return _json_response(self, load_operations())
        if path == "/api/missions":
            return _json_response(self, load_missions())
        if path == "/api/blackbook":
            return _json_response(self, load_blackbook())
        if path == "/api/hvi":
            return _json_response(self, load_hvi())
        if path == "/api/blueprints":
            return _json_response(self, load_blueprints())
        if path == "/api/books":
            return _json_response(self, load_books())
        if path == "/api/manuels":
            return _json_response(self, load_manuels())
        if path == "/api/swissknife/sessions":
            return _json_response(self, swissknife_list_sessions())
        if path == "/api/dev/version":
            return _json_response(self, load_dev_build_meta())
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
        if path == "/api/mission/debrief":
            mission_path = (query.get("mission_path", [""])[0] or "").strip()
            payload = get_mission_debrief_payload(mission_path)
            if payload is None:
                return _json_response(self, {"error": "Invalid mission_path"}, 400)
            return _json_response(self, payload, 200)
        if path == "/api/mission/content":
            mission_path = (query.get("path", [""])[0] or "").strip()
            payload = get_mission_content(mission_path)
            if payload is None:
                return _json_response(self, {"error": "Invalid mission path"}, 400)
            return _json_response(self, payload, 200)
        if path == "/api/doc/content":
            file_name = (query.get("file", [""])[0] or "").strip()
            payload = get_doc_content(file_name)
            if payload is None:
                return _json_response(self, {"error": "Invalid or locked file"}, 400)
            return _json_response(self, payload, 200)
        return super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        if not self._enforce_request_guard("POST", path):
            return
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
            op = _safe_operation_rel(body.get("operation", "ProjectTitle"))
            name = _safe_name(body.get("name", "NEW_MISSION"))
            status = str(body.get("status") or "PENDING").strip()
            if status not in MISSION_STATUSES:
                status = "PENDING"
            missions_dir = _operation_dir_for_rel(op) / "Missions"
            missions_dir.mkdir(parents=True, exist_ok=True)
            f = missions_dir / f"{name}.md"
            if not f.exists():
                display_name = name.replace("_", " ")
                f.write_text(_build_mission_file_content(display_name, status, "", _mission_created_fallback(f)), encoding="utf-8")
            else:
                update_mission_status(str(f), status)
            ensure_mission_file_metadata(f, mission_name=name.replace("_", " "), status=status)
            reindex_all_mission_metadata()
            meta = _read_mission_file_state(f)
            meta["status"] = _derive_mission_status(f, meta.get("status", "PENDING"))
            sync_blackbook_for_mission_path(str(f), event="CREATED")
            return _json_response(self, {
                "ok": True,
                "path": str(f),
                "operation": op,
                "name": meta.get("mission_name", name.replace("_", " ")),
                "mission_id": meta.get("mission_id", ""),
                "created_at": meta.get("created_at", ""),
            }, 201)

        if path == "/api/mission/status":
            mission_path = body.get("path", "")
            status = body.get("status", "")
            if update_mission_status(mission_path, status):
                sync_blackbook_for_mission_path(mission_path, event="STATUS UPDATED")
                return _json_response(self, {"ok": True})
            return _json_response(self, {"error": "Invalid mission path or status"}, 400)

        if path == "/api/mission/content":
            mission_path = body.get("path", "")
            content = body.get("content", "")
            if save_mission_content(mission_path, content):
                sync_blackbook_for_mission_path(mission_path, event="CONTENT UPDATED")
                return _json_response(self, {"ok": True}, 200)
            return _json_response(self, {"error": "Invalid mission path"}, 400)

        if path == "/api/swissknife/session":
            label = body.get("label", "daily")
            try:
                row = swissknife_create_session(label)
            except Exception as exc:
                return _json_response(self, {"error": str(exc)}, 400)
            return _json_response(self, {"ok": True, "session": row}, 201)

        if path == "/api/swissknife/download":
            try:
                result = swissknife_download_to_session(
                    body.get("session_id", ""),
                    body.get("url", ""),
                    bool(body.get("login", False)),
                )
            except Exception as exc:
                return _json_response(self, {"error": str(exc)}, 400)
            return _json_response(self, {"ok": True, **result}, 200)

        if path == "/api/doc/content":
            file_name = body.get("file", "")
            content = body.get("content", "")
            if save_doc_content(file_name, content):
                return _json_response(self, {"ok": True}, 200)
            return _json_response(self, {"error": "Invalid or locked file"}, 400)

        if path == "/api/mission/brief/save":
            mission_path = body.get("mission_path", "")
            phase = int(body.get("phase", 1) or 1)
            content = body.get("content", "")
            variables = body.get("variables", [])
            version = save_mission_brief_version(mission_path, phase, content, variables)
            if version is None:
                return _json_response(self, {"error": "Invalid mission_path"}, 400)
            sync_blackbook_for_mission_path(mission_path, event=f"PHASE {version.get('phase', phase)} SAVED")
            return _json_response(self, {"ok": True, "version": version}, 201)

        if path == "/api/mission/debrief/save":
            mission_path = body.get("mission_path", "")
            content = body.get("content", "")
            result = save_mission_debrief_version(mission_path, content)
            if result is None:
                return _json_response(self, {"error": "Invalid mission_path"}, 400)
            if isinstance(result, dict) and result.get("error"):
                return _json_response(self, {"error": result.get("error")}, 400)
            sync_blackbook_for_mission_path(mission_path, event="DEBRIEF SAVED")
            return _json_response(self, {"ok": True, **result}, 201)

        if path == "/api/blackbook/upsert":
            probe_id = upsert_blackbook({
                "Probe_ID": body.get("Probe_ID", ""),
                "Date": body.get("Date", ""),
                "Time": body.get("Time", ""),
                "Operation": body.get("Operation", ""),
                "Mission": body.get("Mission", ""),
                "Status": body.get("Status", "PENDING"),
                "Description": body.get("Description", ""),
                "Hypothesis": body.get("Hypothesis", ""),
                "Platform": body.get("Platform", ""),
                "Result_Quantitative": body.get("Result_Quantitative", ""),
                "Notes": body.get("Notes", ""),
            })
            return _json_response(self, {"ok": True, "Probe_ID": probe_id}, 200)

        if path == "/api/hvi":
            handle = body.get("handle", "")
            fields = body.get("fields", {})
            saved = upsert_hvi(handle, fields)
            if not saved:
                return _json_response(self, {"error": "Invalid HVI handle"}, 400)
            return _json_response(self, {"ok": True, "handle": saved}, 200)

        if path == "/api/backup/import":
            result = import_backup_payload_to_workspace(body)
            return _json_response(self, result, 200)

        if path == "/api/sandbox/python":
            try:
                result = run_python_sandbox(body.get("code", ""))
            except Exception as exc:
                return _json_response(self, {"error": str(exc)}, 400)
            return _json_response(self, result, 200)

        if path == "/api/sandbox/run":
            try:
                result = run_code_sandbox(body.get("mode", "python"), body.get("code", ""))
            except Exception as exc:
                return _json_response(self, {"error": str(exc)}, 400)
            return _json_response(self, result, 200)

        return _json_response(self, {"error": "Not Found"}, 404)

    def do_DELETE(self):
        path = urlparse(self.path).path
        if not self._enforce_request_guard("DELETE", path):
            return
        body = self._read_json_body()

        if path == "/api/mission":
            p = Path(body.get("path", ""))
            if p.exists() and str(p).startswith(str(WORKSPACE)) and p.is_file():
                p_str = str(p)
                p.unlink()
                remove_blackbook_for_mission_path(p_str)
                reindex_all_mission_metadata()
                sync_blackbook_for_all_missions(event="ID REINDEXED")
                return _json_response(self, {"ok": True})
            return _json_response(self, {"error": "Mission file not found"}, 404)

        if path == "/api/operation":
            op = _safe_name(body.get("name", ""))
            p = OPERATIONS_DIR / op
            if p.exists() and p.is_dir():
                shutil.rmtree(p)
                remove_blackbook_for_operation(op)
                reindex_all_mission_metadata()
                sync_blackbook_for_all_missions(event="ID REINDEXED")
                return _json_response(self, {"ok": True})
            return _json_response(self, {"error": "Operation not found"}, 404)

        if path == "/api/blackbook":
            probe_id = body.get("probe_id", "")
            if delete_blackbook_probe(probe_id):
                return _json_response(self, {"ok": True})
            return _json_response(self, {"error": "Probe not found"}, 404)

        if path == "/api/hvi":
            handle = body.get("handle", "")
            if delete_hvi(handle):
                return _json_response(self, {"ok": True})
            return _json_response(self, {"error": "HVI not found"}, 404)

        if path == "/api/swissknife/session":
            try:
                result = swissknife_delete_session(body.get("session_id", ""))
            except Exception as exc:
                return _json_response(self, {"error": str(exc)}, 400)
            return _json_response(self, {"ok": True, **result}, 200)

        return _json_response(self, {"error": "Not Found"}, 404)


if __name__ == "__main__":
    bind_addr = "0.0.0.0" if ALLOW_LAN else "127.0.0.1"
    server = ThreadingHTTPServer((bind_addr, 8099), Handler)
    if ALLOW_LAN:
        print("ManagementApp server (LAN mode) listening on http://0.0.0.0:8099")
    else:
        print("ManagementApp server listening on http://127.0.0.1:8099")
    server.serve_forever()
