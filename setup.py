#!/usr/bin/env python3
from pathlib import Path

from setuptools import setup

ROOT_DIR = Path(__file__).resolve().parent
BUILD_DIR = ROOT_DIR / "build" / "mac"
ICON_FILE = BUILD_DIR / "OMNI.icns"
SEED_DIR = BUILD_DIR / "app_seed"

OPTIONS = {
    "argv_emulation": False,
    "iconfile": str(ICON_FILE),
    "includes": ["managementapp_server", "omni_runtime"],
    "packages": ["webview"],
    "resources": [str(SEED_DIR)] if SEED_DIR.exists() else [],
    "plist": {
        "CFBundleName": "OMNI",
        "CFBundleDisplayName": "OMNI",
        "CFBundleIdentifier": "com.samuelapata.omni",
        "CFBundleShortVersionString": "1.0.0",
        "CFBundleVersion": "1",
        "LSMinimumSystemVersion": "12.0",
        "NSHighResolutionCapable": True,
    },
    "optimize": 1,
    "strip": False,
}

setup(
    app=["desktop_app.py"],
    data_files=[],
    options={"py2app": OPTIONS},
)
