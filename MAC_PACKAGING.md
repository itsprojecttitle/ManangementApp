# OMNI Mac Packaging

Build a standalone `OMNI.app` and DMG:

```bash
./scripts/package_mac.sh
```

For a smaller installer that excludes the bundled manual PDFs:

```bash
./scripts/package_mac.sh --lite-data
```

Notes:

- The packaged app seeds its runtime files into `~/Library/Application Support/OMNI` on first launch.
- User-editable data is preserved there across launches and app updates.
- Packaging installs `py2app` and `pywebview` into `build/mac/venv` unless you pass `--skip-install`.

Sign and notarize after you have a `Developer ID Application` certificate and either a `notarytool` profile or Apple credentials configured:

```bash
./scripts/sign_and_notarize_mac.sh
```

Recommended notarytool setup:

```bash
xcrun notarytool store-credentials OMNI_NOTARY_PROFILE \
  --apple-id "your-apple-id@example.com" \
  --team-id "TEAMID1234" \
  --password "app-specific-password"
```

Then:

```bash
NOTARYTOOL_PROFILE=OMNI_NOTARY_PROFILE ./scripts/sign_and_notarize_mac.sh
```
