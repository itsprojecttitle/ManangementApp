#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="$ROOT_DIR/build/mac-draft"
VENV_DIR="$ROOT_DIR/build/mac/venv"
SEED_DIR="$BUILD_DIR/app_seed"
DIST_DIR="$ROOT_DIR/dist-draft"
APP_NAME="PROJECTTITLE Draft"
APP_PATH="$DIST_DIR/$APP_NAME.app"
ICON_SRC="$ROOT_DIR/packaging/omni-icon.svg"
ICONSET_DIR="$BUILD_DIR/$APP_NAME.iconset"
ICON_PNG="$BUILD_DIR/projecttitle-draft-icon.png"
ICON_ICNS="$BUILD_DIR/$APP_NAME.icns"
INCLUDE_MANUALS=1
SKIP_INSTALL=0

usage() {
  cat <<'EOF'
Usage: ./scripts/package_mac_draft.sh [--lite-data] [--skip-install]

  --lite-data     Exclude OperationDir/Manuel from the app seed to keep the draft app smaller.
  --skip-install  Reuse the existing packaging virtualenv without reinstalling py2app/pywebview.
EOF
}

while (($#)); do
  case "$1" in
    --lite-data)
      INCLUDE_MANUALS=0
      ;;
    --skip-install)
      SKIP_INSTALL=1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
  shift
done

render_icon() {
  mkdir -p "$BUILD_DIR"
  rm -rf "$ICONSET_DIR" "$ICON_PNG" "$ICON_ICNS"

  qlmanage -t -s 1024 -o "$BUILD_DIR" "$ICON_SRC" >/dev/null
  mv "$BUILD_DIR/$(basename "$ICON_SRC").png" "$ICON_PNG"

  mkdir -p "$ICONSET_DIR"
  for size in 16 32 128 256 512; do
    sips -z "$size" "$size" "$ICON_PNG" --out "$ICONSET_DIR/icon_${size}x${size}.png" >/dev/null
    sips -z "$((size * 2))" "$((size * 2))" "$ICON_PNG" --out "$ICONSET_DIR/icon_${size}x${size}@2x.png" >/dev/null
  done

  iconutil -c icns "$ICONSET_DIR" -o "$ICON_ICNS"
}

stage_seed() {
  rm -rf "$SEED_DIR"
  mkdir -p "$SEED_DIR/assets" "$SEED_DIR/OperationDir" "$SEED_DIR/SandboxLab"

  local root_files=(
    "ManagementApp.html"
    "MissionBrief.md"
    "MissionBriefing.md"
    "MissionDebrief.md"
    "OfficialProbeManuel.md"
    "ProbeSkill.md"
    "RESUME.md"
    "blackbook.crm"
    "blackbook_entries.json"
    "manifest.json"
    "sw.js"
    "swissknife_sessions.json"
    "index.html"
    "icon-192.svg"
    "icon-512.svg"
  )

  local path=""
  for path in "${root_files[@]}"; do
    if [[ -f "$ROOT_DIR/$path" ]]; then
      cp -p "$ROOT_DIR/$path" "$SEED_DIR/$path"
    fi
  done

  while IFS= read -r path; do
    cp -p "$path" "$SEED_DIR/$(basename "$path")"
  done < <(find "$ROOT_DIR" -maxdepth 1 -type f -name 'BLUEPRINT*.md' | sort)

  if [[ -d "$ROOT_DIR/assets" ]]; then
    rsync -a --delete --exclude='.DS_Store' "$ROOT_DIR/assets/" "$SEED_DIR/assets/"
  fi

  if [[ -d "$ROOT_DIR/OperationDir" ]]; then
    if [[ "$INCLUDE_MANUALS" -eq 1 ]]; then
      rsync -a --delete --exclude='.DS_Store' "$ROOT_DIR/OperationDir/" "$SEED_DIR/OperationDir/"
    else
      rsync -a --delete --exclude='.DS_Store' --exclude='Manuel' "$ROOT_DIR/OperationDir/" "$SEED_DIR/OperationDir/"
      mkdir -p "$SEED_DIR/OperationDir/Manuel"
      cat > "$SEED_DIR/OperationDir/Manuel/README.md" <<'EOF'
# Manuals Excluded

This PROJECTTITLE Draft build was created with `--lite-data`, so the bundled manual PDFs were excluded to keep the app smaller.
EOF
    fi
  fi
}

install_packaging_tools() {
  if [[ ! -d "$VENV_DIR" ]]; then
    python3 -m venv "$VENV_DIR"
  fi

  if [[ "$SKIP_INSTALL" -eq 0 ]]; then
    "$VENV_DIR/bin/pip" install --upgrade pip setuptools wheel
    "$VENV_DIR/bin/pip" install py2app pywebview
  fi
}

build_app() {
  rm -rf "$DIST_DIR" "$BUILD_DIR/bdist"
  "$VENV_DIR/bin/python" "$ROOT_DIR/setup_draft.py" py2app --dist-dir "$DIST_DIR" --bdist-base "$BUILD_DIR/bdist"
}

render_icon
stage_seed
install_packaging_tools
build_app

cat <<EOF
Built:
  App: $APP_PATH
EOF
