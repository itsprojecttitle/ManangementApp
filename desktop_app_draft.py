#!/usr/bin/env python3
import os
import threading
import time

import webview

from omni_runtime_draft import APP_NAME, ensure_runtime_root

os.environ["OMNI_RUNTIME_VARIANT"] = "draft"
ensure_runtime_root()


def create_server(mod):
    for port in (8099, 0):
        try:
            server = mod.ThreadingHTTPServer(("127.0.0.1", port), mod.Handler)
            actual_port = int(server.server_address[1])
            mod.ALLOWED_HOSTS = {f"127.0.0.1:{actual_port}", f"localhost:{actual_port}"}
            return server, actual_port
        except OSError:
            continue
    raise RuntimeError("Unable to bind a local draft server port.")


def main():
    import managementapp_server as mod

    server, port = create_server(mod)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()

    time.sleep(0.2)
    url = f"http://127.0.0.1:{port}/ManagementApp.html?draft=terminal"

    webview.create_window(APP_NAME, url, width=1500, height=940, min_size=(1240, 780))

    def shutdown():
        try:
            server.shutdown()
            server.server_close()
        except Exception:
            pass

    webview.start()
    shutdown()


if __name__ == "__main__":
    main()
