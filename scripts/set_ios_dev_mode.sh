#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CONFIG_PATH="$ROOT_DIR/capacitor.config.json"
MODE="${1:-}"

usage() {
  echo "Usage: $0 live|bundle" >&2
  exit 1
}

if [[ "$MODE" != "live" && "$MODE" != "bundle" ]]; then
  usage
fi

detect_ip_for_interface() {
  local iface="$1"
  local ip=""
  ip="$(ipconfig getifaddr "$iface" 2>/dev/null || true)"
  if [[ -z "$ip" ]]; then
    ip="$(ifconfig "$iface" 2>/dev/null | awk '/inet /{print $2; exit}' || true)"
  fi
  printf '%s' "$ip"
}

IP=""
if [[ "$MODE" == "live" ]]; then
  DEFAULT_IFACE="$(route get default 2>/dev/null | awk '/interface:/{print $2}' || true)"
  if [[ -n "$DEFAULT_IFACE" ]]; then
    IP="$(detect_ip_for_interface "$DEFAULT_IFACE")"
  fi
  if [[ -z "$IP" ]]; then
    IP="$(detect_ip_for_interface en0)"
  fi
  if [[ -z "$IP" ]]; then
    IP="$(detect_ip_for_interface en1)"
  fi
  if [[ -z "$IP" ]]; then
    while IFS= read -r iface; do
      [[ -z "$iface" ]] && continue
      IP="$(detect_ip_for_interface "$iface")"
      [[ -n "$IP" ]] && break
    done < <(ifconfig -l 2>/dev/null | tr ' ' '\n' | grep '^en' || true)
  fi
  if [[ -z "$IP" ]]; then
    echo "Could not detect a LAN IP for live iPhone mode." >&2
    exit 1
  fi
fi

node - "$CONFIG_PATH" "$MODE" "$IP" <<'NODE'
const fs = require("fs");

const [configPath, mode, ip] = process.argv.slice(2);
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

if (mode === "live") {
  config.server = {
    url: `http://${ip}:8099/ManagementApp.html`,
    cleartext: true,
  };
} else {
  delete config.server;
}

fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
NODE

cd "$ROOT_DIR"
npx cap copy ios

if [[ "$MODE" == "live" ]]; then
  echo "Enabled OMNI DEV iPhone live mode."
  echo "Mac server URL: http://$IP:8099/ManagementApp.html"
  echo "Next:"
  echo "  1. Run ./start_iphone_app.sh"
  echo "  2. Open Xcode and press Run on the iPhone"
else
  echo "Restored bundled iPhone mode."
  echo "Next:"
  echo "  1. npm run ios:sync"
  echo "  2. Open Xcode and press Run on the iPhone"
fi
