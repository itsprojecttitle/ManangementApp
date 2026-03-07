#!/usr/bin/env python3
import importlib.util
import socket
import threading
import time
from pathlib import Path

import webview

BASE_DIR = Path(__file__).resolve().parent
SERVER_PATH = BASE_DIR / 'managementapp_server.py'


def find_free_port(preferred=8099):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        if s.connect_ex(('127.0.0.1', preferred)) != 0:
            return preferred
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]


def load_server_module(path: Path):
    spec = importlib.util.spec_from_file_location('managementapp_server', str(path))
    mod = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(mod)
    return mod


def main():
    mod = load_server_module(SERVER_PATH)
    port = find_free_port(8099)
    server = mod.ThreadingHTTPServer(('127.0.0.1', port), mod.Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()

    time.sleep(0.2)
    url = f'http://127.0.0.1:{port}/ManagementApp.html'

    window = webview.create_window('Management App', url, width=1400, height=900)

    def shutdown():
        try:
            server.shutdown()
            server.server_close()
        except Exception:
            pass

    webview.start()
    shutdown()


if __name__ == '__main__':
    main()
