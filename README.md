# OMNI / ManagementApp

## What This Is
OMNI is a local-first management app that runs in two forms:

- Desktop/local software on the Mac
- Offline iPhone app deployed from Xcode

It combines routines, operations, missions, HVI tracking, blackbook entries, manuals, blueprints, reminders, journal tools, and an offline study terminal into one system.

## Current Location
This project is now intended to live inside `GlobalDirectory/GlobalDee` so the full working copy, desktop build, iPhone build, manuals, and project files are kept in one organized place.

## Where We Are
Status as of 2026-03-09:

- The app works as a local desktop/web app on the Mac
- The app has an iPhone build through Capacitor + Xcode
- The iPhone build can be installed directly from Xcode onto a connected iPhone
- Developer Mode was required on the phone for local deployment
- Manual phone-to-Mac sync was added through backup export/import
- The study area was simplified so the quiz and lesson block are removed and the terminal remains
- The bundled manuals were restored into the iPhone/web build
- Real iPhone local notifications were added through Capacitor local notifications
- Mobile swipe-right gesture support was added to reveal the burger menu

## Desktop Software
The desktop side is a local app/project that reads from the project workspace and local files. It includes:

- `ManagementApp.html` for the main app UI
- `assets/managementapp.js` for behavior
- `managementapp_server.py` for local API/file operations
- built desktop app artifacts in `OMNI Desktop.app` and `dist/OMNI.app`

## iPhone / Xcode
The iPhone app is packaged through the Capacitor iOS project in `ios/App/App.xcodeproj`.

Typical update flow:

1. Make changes in the project files
2. Run `npm run ios:sync`
3. Open Xcode
4. Select the iPhone
5. Press Run

For live iPhone development against the Mac workspace:

1. Run `npm run ios:live:on`
2. Run `./start_iphone_app.sh`
3. Open Xcode
4. Select the iPhone
5. Press Run

In live mode, the native iPhone app loads `http://<your-mac-ip>:8099/ManagementApp.html` from the Mac instead of the bundled `www` snapshot. Project data then syncs against the Mac server directly, and UI code changes trigger an automatic page reload on the phone.

Inside a live-capable iPhone build, `Settings` now includes runtime buttons to switch the phone between `LIVE` and `BUNDLED` mode without going back to the Mac first. This is useful if you want to drop into bundled/offline mode on the device before disconnecting.

To return to the normal bundled iPhone build:

1. Run `npm run ios:live:off`
2. Run `npm run ios:sync`
3. Press Run in Xcode again

Important nuance:

- the in-app runtime toggle is available in a live-capable build
- if you reinstall a purely bundled build from Xcode, that build does not retain the Mac live URL, so it cannot switch back to live until you deploy a live-capable build again

If signing is needed, use your Apple ID Personal Team in Xcode.

## Phone Data Sync
Bundled code updates go from Mac to iPhone through `npm run ios:sync` and Xcode.

In live mode, the phone app talks to the Mac server directly, so operations, missions, blackbook, HVI, manuals, and other `/api/*` data are pulled from the Mac instead of the offline phone snapshot.

Data changes made on the phone come back to the Mac through backup export/import:

1. On iPhone app: `Settings -> EXPORT + SHARE`
2. Send the JSON backup to the Mac
3. On Mac app: `Settings -> IMPORT BACKUP`

This now replays supported project edits back into real Mac files.

## Main Functionality
OMNI currently includes:

- dashboard and daily overview
- routines
- gym planner
- operations and missions
- HVI targets
- blackbook / mission log
- checklist and reminders
- real local iPhone notifications for reminders, quarter alerts, upcoming tasks, and checklist nudges
- journal
- blueprints / oracle docs
- books and manuals
- Swissknife session viewer
- offline study terminal
- swipe-right mobile menu reveal
- local backup export/import
- iPhone offline deployment through Xcode

## Manuals
The manuals live under `OperationDir/Manuel`. They are now included in the packaged web/iPhone build again, which increases app size but restores the full offline manual library on the phone.

## Important Paths
- `ManagementApp.html`
- `assets/managementapp.js`
- `managementapp_server.py`
- `scripts/build_web.sh`
- `ios/App/App.xcodeproj`
- `OperationDir/Manuel`

## Notes
- If the app on the phone is missing the latest changes, press Run in Xcode again
- If the app has important local data before reinstalling, export a backup first
- Rebundling the manuals will make the iPhone app much larger again
