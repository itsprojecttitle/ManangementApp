#!/usr/bin/env python3
import filecmp
import os
import shutil
import stat
import sys
from pathlib import Path

APP_NAME = "PROJECTTITLE Draft"
APP_SUPPORT_DIRNAME = "PROJECTTITLE Draft"
BUNDLE_SEED_DIRNAME = "app_seed"

MUTABLE_EXACT_PATHS = {
    "blackbook.crm",
    "blackbook_entries.json",
    "swissknife_sessions.json",
    "MissionBriefing.md",
    "MissionDebrief.md",
    "OperationDir/BLACK_BOOK.md",
    "OperationDir/HVI_INDEX.md",
    "OperationDir/CONTACTS_INDEX.json",
}

MUTABLE_PREFIX_PATHS = {
    "OperationDir/Operations",
    "OperationDir/Contacts",
    "SandboxLab",
}


def _local_project_root() -> Path:
    return Path(__file__).resolve().parent


def is_bundled() -> bool:
    return bool(
        getattr(sys, "frozen", False)
        or getattr(sys, "_MEIPASS", None)
        or os.environ.get("RESOURCEPATH")
    )


def bundle_resource_root() -> Path:
    if getattr(sys, "_MEIPASS", None):
        return Path(sys._MEIPASS)
    resource_path = os.environ.get("RESOURCEPATH", "").strip()
    if resource_path:
        return Path(resource_path)
    if getattr(sys, "frozen", False):
        return Path(sys.executable).resolve().parent.parent / "Resources"
    return _local_project_root()


def seed_root() -> Path:
    if is_bundled():
        return bundle_resource_root() / BUNDLE_SEED_DIRNAME
    return _local_project_root()


def runtime_root() -> Path:
    if not is_bundled():
        return _local_project_root()
    return Path.home() / "Library" / "Application Support" / APP_SUPPORT_DIRNAME


def _is_mutable(rel_path: Path) -> bool:
    rel = rel_path.as_posix()
    if rel in MUTABLE_EXACT_PATHS:
        return True
    return any(rel == prefix or rel.startswith(f"{prefix}/") for prefix in MUTABLE_PREFIX_PATHS)


def _has_immutable_flag(path: Path) -> bool:
    try:
        return bool(path.stat().st_flags & getattr(stat, "UF_IMMUTABLE", 0))
    except OSError:
        return False


def _files_match(src_path: Path, dst_path: Path) -> bool:
    try:
        src_stat = src_path.stat()
        dst_stat = dst_path.stat()
    except OSError:
        return False

    if src_stat.st_size != dst_stat.st_size:
        return False
    if int(src_stat.st_mtime) == int(dst_stat.st_mtime):
        return True
    return filecmp.cmp(src_path, dst_path, shallow=False)


def _warn_seed_skip(rel_path: Path, exc: Exception) -> None:
    print(f"[omni_runtime_draft] Skipped protected seed file: {rel_path.as_posix()} ({exc})", file=sys.stderr)


def _copy_seed_tree(src_root: Path, dst_root: Path) -> None:
    for src_path in sorted(src_root.rglob("*")):
        if src_path.name == ".DS_Store":
            continue
        rel_path = src_path.relative_to(src_root)
        dst_path = dst_root / rel_path

        if src_path.is_dir():
            dst_path.mkdir(parents=True, exist_ok=True)
            continue

        if _is_mutable(rel_path) and dst_path.exists():
            continue

        dst_path.parent.mkdir(parents=True, exist_ok=True)
        if dst_path.exists() and dst_path.is_file():
            if _files_match(src_path, dst_path):
                continue
        elif dst_path.exists() and dst_path.is_dir():
            try:
                shutil.rmtree(dst_path)
            except PermissionError as exc:
                _warn_seed_skip(rel_path, exc)
                continue

        if dst_path.exists() and _has_immutable_flag(dst_path):
            _warn_seed_skip(rel_path, PermissionError("destination is locked"))
            continue

        try:
            shutil.copy2(src_path, dst_path)
        except PermissionError as exc:
            _warn_seed_skip(rel_path, exc)


def ensure_runtime_root() -> Path:
    root = runtime_root()
    if not is_bundled():
        return root

    seed = seed_root()
    root.mkdir(parents=True, exist_ok=True)
    if seed.exists():
        _copy_seed_tree(seed, root)
    (root / "SandboxLab").mkdir(parents=True, exist_ok=True)
    return root
