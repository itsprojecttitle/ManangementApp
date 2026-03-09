#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="$ROOT_DIR/build/mac"
VENV_DIR="$BUILD_DIR/venv"
SEED_DIR="$BUILD_DIR/app_seed"
DIST_DIR="$ROOT_DIR/dist"
APP_PATH="$DIST_DIR/OMNI.app"
DMG_PATH="$BUILD_DIR/OMNI-macOS.dmg"
ICON_SRC="$ROOT_DIR/packaging/omni-icon.svg"
ICONSET_DIR="$BUILD_DIR/OMNI.iconset"
ICON_PNG="$BUILD_DIR/omni-icon.png"
ICON_ICNS="$BUILD_DIR/OMNI.icns"
INCLUDE_MANUALS=1
SKIP_INSTALL=0

usage() {
  cat <<'EOF'
Usage: ./scripts/package_mac.sh [--lite-data] [--skip-install]

  --lite-data     Exclude OperationDir/Manuel from the app seed to keep the app and DMG smaller.
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
      cp "$ROOT_DIR/$path" "$SEED_DIR/$path"
    fi
  done

  while IFS= read -r path; do
    cp "$path" "$SEED_DIR/$(basename "$path")"
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

This OMNI build was created with `--lite-data`, so the bundled manual PDFs were excluded to keep the installer smaller.
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
  rm -rf "$DIST_DIR" "$ROOT_DIR/build/bdist.macosx-"*
  "$VENV_DIR/bin/python" "$ROOT_DIR/setup.py" py2app
}

build_dmg() {
  local dmg_stage="$BUILD_DIR/dmg-root"
  rm -rf "$dmg_stage" "$DMG_PATH"
  mkdir -p "$dmg_stage"
  cp -R "$APP_PATH" "$dmg_stage/"
  ln -s /Applications "$dmg_stage/Applications"
  hdiutil create -volname "OMNI Installer" -srcfolder "$dmg_stage" -ov -format UDZO "$DMG_PATH" >/dev/null
}

render_icon
stage_seed
install_packaging_tools
build_app
build_dmg

cat <<EOF
Built:
  App: $APP_PATH
  DMG: $DMG_PATH
EOF
