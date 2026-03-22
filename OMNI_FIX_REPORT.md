# OMNI Incident Report — Full Timeline, Root Causes, Fix Attempts, Final Resolution

Date range: March 21–22, 2026  
Scope: OMNI desktop app (OMNI_FIXED.app), ManagementApp_Project workspace, local server on 127.0.0.1:8099

---

## 1) Initial Symptoms (From the Very Beginning)

- UI loads, but **dashboard, operations, missions, HVI, blackbook, templates, manuels** show empty or missing data.
- App opens but falls back to offline snapshots.
- Templates do not load; Swissknife page stuck; system version/build empty.
- Gym/routines/exercises missing.
- UI sometimes **frozen** (cannot change pages).

---

## 2) Root Causes (What Actually Broke)

### Root Cause A — Wrong server bound to port 8099
A stray `python3.1` process sometimes bound to `127.0.0.1:8099`.  
The UI still loaded, but it was reading from a server with **no `project_root`**, so it served **empty/stale context**.

### Root Cause B — UI was loading cached/old assets
The app bundle hard‑coded:
```
ManagementApp.html?v=20260322-repolive4
```
so even after fixes, the UI was stuck on the old JS/HTML, and **new code never executed**.

### Root Cause C — JS was broken (syntax errors)
The `managementapp.js` file contained escaped quotes like:
```
\"...\"
```
which caused a JS parse error.  
When JS fails, **all view logic breaks**, resulting in blank templates, missing panels, frozen UI.

### Root Cause D — CSP “unsafe-eval” errors
Some code used `Function(...)` (eval‑like).  
The webview CSP blocks this, causing `EvalError` and halting parts of UI.

### Root Cause E — LocalStorage quota failure (gym routines)
Routine data is **huge**. Writing to localStorage can fail silently, so routines/exercises appear missing even though the server has them.

### Root Cause F — Missing JS functions
Template navigation relied on functions that **didn’t exist** (`focusMissionProbeSection`, copy actions, posting template helpers), so the template panels never activated.

---

## 3) Fix Attempts (Including Failed Ones)

### Attempt 1: Force server + app launch
- Ran OMNI and checked `127.0.0.1:8099`.
- Initially worked, but **UI still empty** because it was the wrong server sometimes.
- Result: **intermittent success, not stable**.

### Attempt 2: Fix workspace binding in server
- Set server to use `OMNI_PROJECT_ROOT` if it has `OperationDir`.
- Worked **only when correct server bound to port**.
- Result: **helpful, but not enough**.

### Attempt 3: Cache-busting assets repeatedly
- Incremented `repolive` version multiple times.
- Failed because the app bundle **still hard‑coded repolive4**.
- Result: **no effect** until the app bundle URL was updated.

### Attempt 4: Template loading via `/api/doc/content`
- Added `loadDocInto` + `ensureDocLoaded` + allowlist for `PNS.md`.
- Worked, but **templates still hidden** because the detail section activation was missing.
- Result: **partial**.

### Attempt 5: Added missing template functions
- Implemented `focusMissionProbeSection`, copy pack actions, posting template, etc.
- Templates became functional **once correct JS loaded**.
- Result: **successful**, but only after asset loading was fixed.

### Attempt 6: Gym routines hydration
- Added fallback to hydrate into memory if localStorage write fails.
- Worked only when **JS loaded correctly**.
- Result: **successful after JS fixed**.

### Attempt 7: Swissknife API routing
- Switched to `serverUrlForPath(...)` to avoid origin errors.
- Worked only when JS loaded correctly.
- Result: **successful after JS fixed**.

### Attempt 8: UI diagnostics reporting
- Added `/api/dev/ui_state` to report blank panels.
- Initially failed because UI still loading old assets and CSP blocked eval.
- Result: **eventually helped pinpoint JS failure**.

### Attempt 9: CSP `unsafe-eval` errors
- Detected `EvalError` from `Function(...)`.
- Removed eval usage in `evaluateOfflinePythonExpression`.
- This stopped CSP errors from killing UI execution.
- Result: **successful**.

---

## 4) Final Fixes That Actually Resolved It

### ✅ Fix 1: Correct the app bundle URL
Patched the **actual bundled** file:
```
/Users/samuelapata/Applications/OMNI_FIXED.app/Contents/Resources/desktop_app.py
```
So it opens the newest UI build (repolive27/28).

### ✅ Fix 2: Repair JS syntax errors
Fixed escaped quotes (`\"`) in `managementapp.js` causing JS parse failure.

### ✅ Fix 3: Remove eval usage (CSP compatible)
Removed `Function(...)` evaluation to avoid CSP `unsafe-eval` errors.

### ✅ Fix 4: Restore missing template UI functions
Added `focusMissionProbeSection`, copy helpers, posting template UI methods.

### ✅ Fix 5: LocalData hydration fallback
When localStorage write fails, routines hydrate into memory and render.

### ✅ Fix 6: Swissknife path routing
Swissknife API calls now use server base URL.

---

## 5) Proof That It’s Fixed

From diagnostics (`/api/dev/ui_state`):
- Templates load with content length > 0.
- Routine data present: topCategories = 4, catalogSections = 33.
- Visible panels render, no overlays blocking.
- Server uses correct project root.

---

## 6) Why It Kept Breaking (Summary)

1. **Wrong server bound to port 8099**
2. **Old cached UI always loaded (hard‑coded repolive4)**
3. **JS syntax errors broke everything**
4. **CSP blocked eval**
5. **LocalStorage quota issues hid gym data**

---

## 7) How To Prevent It Happening Again

### A) Lock the app to the correct UI build
Keep the bundled `desktop_app.py` version synced with the workspace.

### B) Avoid eval / Function in JS
CSP forbids it in this environment.

### C) Avoid huge localStorage writes
Store large data in files, hydrate in memory.

### D) Watchdog port 8099
Kill non‑OMNI servers if they bind that port.

### E) Add an internal “Health Check” panel
Show workspace, server status, context counts visibly.

---

## 8) Files Modified

- `ManagementApp.html`
- `assets/managementapp.js`
- `assets/managementapp.css`
- `managementapp_server.py`
- `desktop_app.py` (workspace)
- `/Users/samuelapata/Applications/OMNI_FIXED.app/Contents/Resources/desktop_app.py`
- `OMNI_FIX_REPORT.md` (this report)

---

## 9) Final Status

✅ Templates load  
✅ Gym routines load  
✅ Missions/Operations/HVI load  
✅ Swissknife functions work  
✅ UI navigation works
