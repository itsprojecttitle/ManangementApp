#!/usr/bin/env python3
from pathlib import Path

from setuptools import setup

ROOT_DIR = Path(__file__).resolve().parent
BUILD_DIR = ROOT_DIR / "build" / "mac-draft"
ICON_FILE = BUILD_DIR / "PROJECTTITLE Draft.icns"
SEED_DIR = BUILD_DIR / "app_seed"

OPTIONS = {
    "argv_emulation": False,
    "iconfile": str(ICON_FILE),
    "includes": ["managementapp_server", "omni_runtime_draft"],
    "packages": ["webview"],
    "resources": [str(SEED_DIR)] if SEED_DIR.exists() else [],
    "plist": {
        "CFBundleName": "PROJECTTITLE Draft",
        "CFBundleDisplayName": "PROJECTTITLE Draft",
        "CFBundleIdentifier": "com.samuelapata.projecttitle.draft",
        "CFBundleShortVersionString": "0.1.0",
        "CFBundleVersion": "1",
        "LSMinimumSystemVersion": "12.0",
        "NSHighResolutionCapable": True,
    },
    "optimize": 1,
    "strip": False,
}

setup(
    app=["desktop_app_draft.py"],
    data_files=[],
    options={"py2app": OPTIONS},
)
