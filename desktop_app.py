#!/usr/bin/env python3
import os
import threading
import time
from pathlib import Path

import webview

from desktop_bridge import OmniDesktopBridge
from omni_runtime import APP_NAME, ensure_runtime_root

os.environ.setdefault("OMNI_RUNTIME_VARIANT", "omni")
ensure_runtime_root()


def detect_project_root() -> Path:
    here = Path(__file__).resolve()
    candidates = [here.parent, *list(here.parents[:6])]
    seen = set()
    for candidate in candidates:
        if candidate in seen:
            continue
        seen.add(candidate)
        if (candidate / "managementapp_server.py").exists() and (candidate / "capacitor.config.json").exists():
            return candidate
    return here.parent


PROJECT_ROOT = detect_project_root()
os.environ.setdefault("OMNI_PROJECT_ROOT", str(PROJECT_ROOT))


def create_server(mod):
    server = mod.ThreadingHTTPServer(("127.0.0.1", 0), mod.Handler)
    actual_port = int(server.server_address[1])
    mod.ALLOWED_HOSTS = {f"127.0.0.1:{actual_port}", f"localhost:{actual_port}"}
    return server, actual_port


def main():
    import managementapp_server as mod

    bridge = OmniDesktopBridge()
    server = None
    port = None
    try:
        server, port = create_server(mod)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
    except Exception as exc:
        print(f"[omni_desktop] Server start failed: {exc}")

    time.sleep(0.2)
    if port:
        url = f"http://127.0.0.1:{port}/ManagementApp.html?v=20260311-classic-2"
    else:
        runtime_root = ensure_runtime_root()
        url = f"file://{(runtime_root / 'ManagementApp.html').resolve()}"

    webview.create_window(APP_NAME, url, width=1440, height=900, min_size=(1200, 780), js_api=bridge)

    def shutdown():
        try:
            if hasattr(mod, "shutdown_managed_iphone_live_server"):
                mod.shutdown_managed_iphone_live_server()
        except Exception:
            pass
        try:
            if server:
                server.shutdown()
                server.server_close()
        except Exception:
            pass

    webview.start()
    shutdown()


if __name__ == '__main__':
    main()
