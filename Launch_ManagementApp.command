#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
LOG_FILE="/tmp/omni-desktop.log"
URL="http://127.0.0.1:8099/ManagementApp.html"

if [ ! -d .venv ]; then
  python3 -m venv .venv
fi

if ! ./.venv/bin/python -c "import webview" >/dev/null 2>&1; then
  ./.venv/bin/pip install pywebview >>"$LOG_FILE" 2>&1 || true
fi

if ./.venv/bin/python desktop_app.py >>"$LOG_FILE" 2>&1; then
  exit 0
fi

PID="$(lsof -tiTCP:8099 -sTCP:LISTEN 2>/dev/null || true)"
if [ -n "$PID" ]; then
  kill -9 "$PID" 2>/dev/null || true
fi

nohup python3 managementapp_server.py >>"$LOG_FILE" 2>&1 &
sleep 1
open "$URL"
