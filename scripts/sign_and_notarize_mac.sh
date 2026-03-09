#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
BUILD_DIR="$ROOT_DIR/build/mac"
APP_PATH="$DIST_DIR/OMNI.app"
SIGNED_DMG_PATH="$BUILD_DIR/OMNI-macOS-signed.dmg"
TMP_DMG_ROOT="$BUILD_DIR/dmg-signed-root"
NOTARY_SUBMIT_PATH=""
NOTARY_MODE="profile"
IDENTITY="${CODESIGN_IDENTITY:-}"
NOTARY_PROFILE="${NOTARYTOOL_PROFILE:-}"
APPLE_ID="${APPLE_ID:-}"
APPLE_TEAM_ID="${APPLE_TEAM_ID:-}"
APPLE_APP_PASSWORD="${APPLE_APP_PASSWORD:-}"

usage() {
  cat <<'EOF'
Usage: ./scripts/sign_and_notarize_mac.sh [--identity "Developer ID Application: ..."] [--app /path/to/OMNI.app]

Environment:
  CODESIGN_IDENTITY   Optional. Developer ID Application certificate name.
  NOTARYTOOL_PROFILE  Recommended. Keychain profile previously stored with:
                      xcrun notarytool store-credentials PROFILE_NAME ...
  APPLE_ID            Optional fallback for direct notarytool login.
  APPLE_TEAM_ID       Required with APPLE_ID.
  APPLE_APP_PASSWORD  Required with APPLE_ID.

This script:
  1. Signs the existing OMNI.app with hardened runtime.
  2. Verifies the signature.
  3. Builds a signed DMG.
  4. Submits the DMG to Apple notarization and staples the ticket.
EOF
}

while (($#)); do
  case "$1" in
    --identity)
      shift
      IDENTITY="${1:-}"
      ;;
    --app)
      shift
      APP_PATH="${1:-}"
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

pick_identity() {
  if [[ -n "$IDENTITY" ]]; then
    return 0
  fi

  local first=""
  first="$(security find-identity -v -p codesigning 2>/dev/null | sed -n 's/.*"\\(Developer ID Application: .*\\)"/\\1/p' | head -n 1)"
  if [[ -n "$first" ]]; then
    IDENTITY="$first"
    return 0
  fi

  echo "No Developer ID Application signing identity was found." >&2
  echo "Install the certificate in Keychain Access or pass CODESIGN_IDENTITY." >&2
  exit 1
}

resolve_notary_mode() {
  if [[ -n "$NOTARY_PROFILE" ]]; then
    NOTARY_MODE="profile"
    return 0
  fi
  if [[ -n "$APPLE_ID" && -n "$APPLE_TEAM_ID" && -n "$APPLE_APP_PASSWORD" ]]; then
    NOTARY_MODE="direct"
    return 0
  fi
  echo "No notarization credentials configured." >&2
  echo "Set NOTARYTOOL_PROFILE, or APPLE_ID + APPLE_TEAM_ID + APPLE_APP_PASSWORD." >&2
  exit 1
}

sign_app() {
  if [[ ! -d "$APP_PATH" ]]; then
    echo "App bundle not found: $APP_PATH" >&2
    exit 1
  fi

  codesign --force --deep --timestamp --options runtime --sign "$IDENTITY" "$APP_PATH"
  codesign --verify --deep --strict --verbose=2 "$APP_PATH"
}

build_signed_dmg() {
  rm -rf "$TMP_DMG_ROOT" "$SIGNED_DMG_PATH"
  mkdir -p "$TMP_DMG_ROOT"
  cp -R "$APP_PATH" "$TMP_DMG_ROOT/"
  ln -s /Applications "$TMP_DMG_ROOT/Applications"

  hdiutil create -volname "OMNI Installer" -srcfolder "$TMP_DMG_ROOT" -ov -format UDZO "$SIGNED_DMG_PATH" >/dev/null
  codesign --force --timestamp --sign "$IDENTITY" "$SIGNED_DMG_PATH"
}

notarize_dmg() {
  if [[ "$NOTARY_MODE" == "profile" ]]; then
    xcrun notarytool submit "$SIGNED_DMG_PATH" --keychain-profile "$NOTARY_PROFILE" --wait
  else
    xcrun notarytool submit "$SIGNED_DMG_PATH" \
      --apple-id "$APPLE_ID" \
      --team-id "$APPLE_TEAM_ID" \
      --password "$APPLE_APP_PASSWORD" \
      --wait
  fi
  xcrun stapler staple "$SIGNED_DMG_PATH"
  xcrun stapler validate "$SIGNED_DMG_PATH"
}

pick_identity
resolve_notary_mode
sign_app
build_signed_dmg
notarize_dmg

cat <<EOF
Signed and notarized:
  App: $APP_PATH
  DMG: $SIGNED_DMG_PATH
  Identity: $IDENTITY
EOF
