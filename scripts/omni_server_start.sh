#!/bin/zsh
set -e
PORT=8099
if lsof -nP -iTCP:${PORT} -sTCP:LISTEN >/dev/null 2>&1; then
  exit 0
fi
PYBIN="/opt/miniconda3/bin/python3"
if [ ! -x "$PYBIN" ]; then
  PYBIN="/usr/bin/python3"
fi
exec "$PYBIN" /Users/samuelapata/ManagementApp_Project/managementapp_server.py
