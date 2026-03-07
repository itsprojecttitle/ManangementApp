#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# Stop any old local server on 8099
PID="$(lsof -tiTCP:8099 -sTCP:LISTEN 2>/dev/null || true)"
if [ -n "$PID" ]; then
  kill -9 "$PID" 2>/dev/null || true
fi

# Start server in background
nohup python3 managementapp_server.py >/tmp/managementapp-local.log 2>&1 &
sleep 1

# Open the correct URL (not file://)
open "http://127.0.0.1:8099/ManagementApp.html"
