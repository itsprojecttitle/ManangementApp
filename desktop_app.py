#!/usr/bin/env python3
import os
import threading
import subprocess
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
    preferred_port = int(os.environ.get("OMNI_PORT", "8099"))
    try:
        server = mod.ThreadingHTTPServer(("127.0.0.1", preferred_port), mod.Handler)
    except OSError:
        server = mod.ThreadingHTTPServer(("127.0.0.1", 0), mod.Handler)
    actual_port = int(server.server_address[1])
    mod.ALLOWED_HOSTS = {f"127.0.0.1:{actual_port}", f"localhost:{actual_port}"}
    return server, actual_port


def kill_stray_port_process(port: int):
    try:
        out = subprocess.run(["lsof", "-ti", f"tcp:{port}"], capture_output=True, text=True, check=False)
        pids = [p.strip() for p in out.stdout.splitlines() if p.strip().isdigit()]
        for pid in pids:
            if int(pid) == os.getpid():
                continue
            comm = subprocess.run(["ps", "-p", pid, "-o", "comm="], capture_output=True, text=True).stdout.strip()
            args = subprocess.run(["ps", "-p", pid, "-o", "args="], capture_output=True, text=True).stdout.strip()
            allow = any(token in (comm + " " + args) for token in [
                "OMNI_FIXED.app",
                "managementapp_server.py",
                "desktop_app.py",
                "OMNI"
            ])
            if allow:
                continue
            try:
                os.kill(int(pid), 15)
            except Exception:
                pass
    except Exception:
        pass


def main():
    import managementapp_server as mod

    bridge = OmniDesktopBridge()
    server = None
    port = None
    try:
        kill_stray_port_process(int(os.environ.get("OMNI_PORT", "8099")))
        server, port = create_server(mod)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
    except Exception as exc:
        print(f"[omni_desktop] Server start failed: {exc}")

    time.sleep(0.2)
    if port:
        url = f"http://127.0.0.1:{port}/ManagementApp.html?v=20260322-repolive29"
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
