# OMNI Troubleshoot Log (2026-03-22)

This file captures what failed, all fix attempts (including failed ones), and the final resolutions.

---

## 1) Initial Symptoms

- UI loads but **dashboard, operations, missions, HVI, blackbook, templates, manuels** show empty or missing data.
- App falls back to offline snapshots.
- Templates do not load; Swissknife stuck; system build/version empty.
- Gym routines/exercises missing.
- UI sometimes **frozen** (cannot change pages).

---

## 2) Root Causes (Actual)

### A) Wrong server bound to port 8099
A stray `python3.1` process sometimes owned `127.0.0.1:8099`. The UI still loaded but read from a server with **no `project_root`**, so it served **empty/stale context**.

### B) UI stuck on old cached assets
The app bundle hard‑coded:
```
ManagementApp.html?v=20260322-repolive4
```
so new JS/HTML never loaded even after fixes.

### C) JS parse errors
`managementapp.js` had escaped quotes like `\"` which broke parsing; once JS fails, all view logic breaks.

### D) CSP blocks eval
`Function(...)` and eval‑like code is blocked in the webview, producing `EvalError` and stopping script execution.

### E) LocalStorage quota failure
Routine data is large; localStorage writes silently failed, so gym/routines looked empty even though server had data.

### F) Missing template UI functions
Template view depended on functions that didn’t exist (`focusMissionProbeSection`, pack copy actions, posting template helpers), so panels never activated.

---

## 3) Fix Attempts (Including Failed)

1. **Launch OMNI + check server** – intermittent success; wrong server bound at times.
2. **Workspace binding via OMNI_PROJECT_ROOT** – worked only when correct server bound.
3. **Cache busting** – failed due to app bundle still loading repolive4.
4. **Template loading via /api/doc/content** – partial; templates still hidden.
5. **Added template functions** – successful only after correct JS loaded.
6. **Gym routines hydration** – successful only after JS loaded.
7. **Swissknife API routing** – successful only after JS loaded.
8. **Diagnostics endpoint** – initially blocked by old assets + CSP; later confirmed failures.
9. **CSP eval removal** – prevented EvalError.

---

## 4) Final Fixes That Resolved It

- **Updated app bundle URL** to point at latest repolive build.
- **Fixed JS syntax errors** (escaped quotes).
- **Removed eval usage** (CSP compatible).
- **Added missing template UI functions** (activate panels + copy actions).
- **Hydration fallback for routines** when localStorage fails.
- **Swissknife API routing through serverUrlForPath**.
- **Moved bottom-right boot log into Settings** (Health + Issue Log).

---

## 5) Proof It Was Fixed

Diagnostics `/api/dev/ui_state` showed:
- Templates have content length > 0
- Routines loaded (topCategories 4, catalogSections 33)
- Correct workspace + server

---

## 6) Why It Kept Breaking

1. Wrong process on port 8099
2. App bundle locked to old asset version
3. JS parse errors
4. CSP blocked eval
5. Large localStorage writes failed

---

## 7) Permanent Prevention (Implemented)

### A) Port Watchdog
OMNI now kills any non‑OMNI process bound to `8099` before binding, preventing stray servers from hijacking the port.

### B) Health + Diagnostics Panel
A new Settings card shows:
- Workspace path
- Active view
- Template/routine load status
- Last error
- Overlays currently active

### C) No eval / Function
CSP‑unsafe eval removed to prevent UI freezes.

### D) LocalData fallback
If localStorage fails, routines hydrate into memory so gym never appears empty.

---

## 8) Files Modified (Summary)

- `ManagementApp.html`
- `assets/managementapp.js`
- `assets/managementapp.css`
- `managementapp_server.py`
- `desktop_app.py` (workspace)
- `/Users/samuelapata/Applications/OMNI_FIXED.app/Contents/Resources/desktop_app.py`
- `OMNI_FIX_REPORT.md`
- `troubleshoot.md` (this file)

---

## 9) Final Status

✅ Templates load  
✅ Gym routines load  
✅ Missions/Operations/HVI load  
✅ Swissknife functions work  
✅ UI navigation works

---

## 10) Incident (2026-03-22) - UI Not Loading Again

### Symptoms
- UI opens but **context missing**; page appears frozen or blank.
- `/api/dev/ui_state` shows `js_boot: false`.

### Root Cause
- A **JS syntax error** in `assets/managementapp.js` prevented the app from booting:
  `info.join(\"\\n\")` inside a template literal broke parsing.

### Fix
- Replace with `info.join("\n")` (normal string literal).
- Bump cache version to `repolive31` and update app bundle URL.

### Prevention
- Run `node --check assets/managementapp.js` after any edit.
- Keep cache bust version in sync with app bundle URL.

---

## 11) Why It Happened Again (Short Answer)

- A **new edit introduced a JS syntax error**, which stopped the app from booting.
- Because the boot fails, **no hydration happens**, so the UI appears empty/frozen.
- The fix was the syntax correction + cache bump so the fixed JS actually loads.
