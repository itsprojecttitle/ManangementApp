#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

IP="$(ipconfig getifaddr en0 2>/dev/null || true)"
if [[ -z "${IP}" ]]; then
  IP="$(ipconfig getifaddr en1 2>/dev/null || true)"
fi

echo "Starting OMNI in LAN mode..."
echo "Mac URL:    http://127.0.0.1:8099/ManagementApp.html"
if [[ -n "${IP}" ]]; then
  echo "iPhone URL: http://${IP}:8099/ManagementApp.html"
else
  echo "iPhone URL: (Could not detect local IP automatically)"
fi
echo
echo "Press Ctrl+C to stop."

ALLOW_LAN=1 python3 managementapp_server.py
