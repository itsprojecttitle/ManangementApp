#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WWW_DIR="$ROOT_DIR/www"

rm -rf "$WWW_DIR"
mkdir -p "$WWW_DIR"

# Copy runtime web assets only.
cp "$ROOT_DIR/ManagementApp.html" "$WWW_DIR/ManagementApp.html"
cp "$ROOT_DIR/index.html" "$WWW_DIR/index.html"
cp "$ROOT_DIR/manifest.json" "$WWW_DIR/manifest.json"
cp "$ROOT_DIR/sw.js" "$WWW_DIR/sw.js"
cp "$ROOT_DIR/icon-192.svg" "$WWW_DIR/icon-192.svg"
cp "$ROOT_DIR/icon-512.svg" "$WWW_DIR/icon-512.svg"
cp "$ROOT_DIR/MissionBrief.md" "$WWW_DIR/MissionBrief.md"
cp "$ROOT_DIR/MissionDebrief.md" "$WWW_DIR/MissionDebrief.md"
cp "$ROOT_DIR/MissionBriefing.md" "$WWW_DIR/MissionBriefing.md"
cp "$ROOT_DIR/OfficialProbeManuel.md" "$WWW_DIR/OfficialProbeManuel.md"
cp "$ROOT_DIR/ProbeSkill.md" "$WWW_DIR/ProbeSkill.md"
cp "$ROOT_DIR/swissknife_sessions.json" "$WWW_DIR/swissknife_sessions.json"

mkdir -p "$WWW_DIR/assets"
cp "$ROOT_DIR/assets/managementapp.js" "$WWW_DIR/assets/managementapp.js"
cp "$ROOT_DIR/assets/managementapp.css" "$WWW_DIR/assets/managementapp.css"

if [ -d "$ROOT_DIR/OperationDir" ]; then
  rsync -a --exclude='.DS_Store' --exclude='Manuel/' "$ROOT_DIR/OperationDir/" "$WWW_DIR/OperationDir/"
fi

python3 "$ROOT_DIR/scripts/build_offline_snapshot.py" "$WWW_DIR/data"

# Ensure app boots to OMNI page inside Capacitor.
cat > "$WWW_DIR/index.html" <<'HTML'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="refresh" content="0; url=./ManagementApp.html" />
    <title>OMNI</title>
  </head>
  <body>
    <p>Loading OMNI...</p>
  </body>
</html>
HTML

echo "Built web bundle at $WWW_DIR"
