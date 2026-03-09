      let isFetching = false;
      let currentView = "dashboard";
      let selectedOperation = null;
      let allMissions = [];
      let allOps = [];
      let searchQuery = "";
      let missionSearchQuery = "";
      let operationSearchQuery = "";
      let blueprintSearchQuery = "";
      let bookSearchQuery = "";
      let blackbookSearchQuery = "";
      let hviSearchQuery = "";
      let hviFilterCategory = "";
      let hviFilterParam = "";
      let hviFilterDateFrom = "";
      let hviFilterDateTo = "";
      let allBlackbook = [];
      let allHvi = [];
      let hviProfileExtras = {};
      let hviStatTemplates = [];
      let operationColors = {};
      let operationOrder = [];
      let draggingOperation = "";
      let lastDragOverOperation = "";
      let missionPlanUndoStack = [];
      let missionPlanRedoStack = [];
      let checklistItems = [];
      let checklistDragIndex = -1;
      let routineTaskDrag = { period: "", fromIndex: -1 };
      let routineDescDrag = { period: "", taskId: "", fromIndex: -1 };
      let routineData = null;
      let gymCurrentCategory = "";
      let gymCurrentSubcategory = "";
      let gymViewerCategory = "";
      let gymViewerSubcategory = "";
      let gymViewerIndex = 0;
      let gymTouchStartX = 0;
      let gymSelectedExerciseKeys = new Set();
      let gymLastSelectedIndex = -1;
      let briefVariables = [];
      let briefHistory = [];
      let missionEditorPath = "";
      let missionEditorMode = "mission";
      let missionEditorFile = "";
      let missionEditorReloadTarget = "";
      let missionEditorSection = "brief";
      let missionEditorBriefContent = "";
      let missionEditorDebriefContent = "";
      let missionEditorHasBrief = false;
      let missionEditorNextBriefPhase = 1;
      let missionPopupSection = "brief";
      let intelPopupType = "";
      let intelPopupProbeId = "";
      let intelPopupHviHandle = "";
      let navDescTimer = 0;
      let hviPopupPage = 1;
      let hviStatDragIndex = -1;
      let hviLayoutTemplate = "grid";
      const HVI_DETAIL_EXCLUDED_KEYS = new Set([
        "Status",
        "Mission Stage",
        "Number",
        "Contact Number",
        "Email Address",
        "Leads",
      ]);
      let appStarted = false;
      let lockUnlocked = false;
      const LOCK_CONFIG_KEY = "managementapp:lock:v1";
      const LOCK_MAGIC = "MANAGEMENT_APP_LOCK_V1";
      const LOCK_KDF_ITERATIONS = 600000;
      const BIOMETRIC_CRED_KEY = "managementapp:biometricCredential:v1";
      let blueprintCatalog = [];
      let booksCatalog = [];
      let swissknifeSessions = [];
      let selectedSwissknifeSession = "";
      let reminderCalendarSelectedDate = "";
      let reminderCalendarMonthCursor = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      let notificationSettings = {
        enabled: true,
        quarter: true,
        reminder: true,
        checklist: true,
        sound: "matrix",
      };
      let firedNotificationKeys = [];
      let notificationHistory = [];
      let notificationAudioCtx = null;
      let tutorState = { trackId: "python", lessonId: "" };
      let tutorProgress = { completed: {}, quizScores: {}, quizDetails: {} };
      let selectedQuarterPanel = 0;
      let quarterDetailCollapsed = false;
      let performanceMode = "balanced";
      let fetchDataTimerId = 0;
      let activeAddPopupPanel = null;
      let routineClickTimers = {};
      const blackbookSaveTimers = {};
      const OFFLINE_SNAPSHOT_MAP = {
        "/api/operations": "/data/operations.json",
        "/api/missions": "/data/missions.json",
        "/api/blackbook": "/data/blackbook.json",
        "/api/hvi": "/data/hvi.json",
        "/api/blueprints": "/data/blueprints.json",
        "/api/manuels": "/data/manuels.json",
        "/api/swissknife/sessions": "/data/swissknife_sessions.json",
      };
      const lazyMarkdownState = {};

      function b64FromBytes(bytes) {
        let bin = "";
        bytes.forEach((b) => { bin += String.fromCharCode(b); });
        return btoa(bin);
      }

      function bytesFromB64(b64) {
        const bin = atob(String(b64 || ""));
        const out = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
        return out;
      }

      function b64urlFromBytes(bytes) {
        return b64FromBytes(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
      }

      function bytesFromB64url(b64url) {
        const s = String(b64url || "").replace(/-/g, "+").replace(/_/g, "/");
        const padded = s + "=".repeat((4 - (s.length % 4)) % 4);
        return bytesFromB64(padded);
      }

      function hasBiometricSupport() {
        return Boolean(window.PublicKeyCredential && window.isSecureContext && navigator.credentials);
      }

      function getBiometricCredentialId() {
        try {
          return String(localStorage.getItem(BIOMETRIC_CRED_KEY) || "").trim();
        } catch (_) {
          return "";
        }
      }

      function setBiometricCredentialId(credId) {
        try {
          const v = String(credId || "").trim();
          if (v) localStorage.setItem(BIOMETRIC_CRED_KEY, v);
          else localStorage.removeItem(BIOMETRIC_CRED_KEY);
        } catch (_) {}
      }

      async function deriveLockKey(secret, saltBytes) {
        const enc = new TextEncoder();
        const base = await crypto.subtle.importKey("raw", enc.encode(secret), "PBKDF2", false, ["deriveKey"]);
        return crypto.subtle.deriveKey(
          { name: "PBKDF2", salt: saltBytes, iterations: LOCK_KDF_ITERATIONS, hash: "SHA-256" },
          base,
          { name: "AES-GCM", length: 256 },
          false,
          ["encrypt", "decrypt"]
        );
      }

      async function createVerifierBlob(secret) {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const key = await deriveLockKey(secret, salt);
        const payload = new TextEncoder().encode(LOCK_MAGIC);
        const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, payload);
        return {
          salt: b64FromBytes(salt),
          iv: b64FromBytes(iv),
          ct: b64FromBytes(new Uint8Array(cipher)),
        };
      }

      async function verifySecret(secret, blob) {
        try {
          const key = await deriveLockKey(secret, bytesFromB64(blob.salt));
          const plain = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: bytesFromB64(blob.iv) },
            key,
            bytesFromB64(blob.ct)
          );
          const text = new TextDecoder().decode(plain);
          return text === LOCK_MAGIC;
        } catch (e) {
          return false;
        }
      }

      function normalizeRecoveryAnswer(answer) {
        return String(answer || "").trim().toLowerCase().replace(/\s+/g, " ");
      }

      async function deriveRecoverySecret(answer, prompt, saltB64) {
        const normalized = normalizeRecoveryAnswer(answer);
        const salt = bytesFromB64(saltB64);
        const payload = new TextEncoder().encode(`${normalized}|${String(prompt || "").trim()}|${b64FromBytes(salt)}`);
        const digest = await crypto.subtle.digest("SHA-256", payload);
        return b64FromBytes(new Uint8Array(digest));
      }

      function getLockConfig() {
        try {
          const raw = localStorage.getItem(LOCK_CONFIG_KEY);
          return raw ? JSON.parse(raw) : null;
        } catch (e) {
          return null;
        }
      }

      function setLockConfig(cfg) {
        localStorage.setItem(LOCK_CONFIG_KEY, JSON.stringify(cfg));
      }

      function showLockSetupMode() {
        const setup = document.getElementById("lock-setup-box");
        const unlock = document.getElementById("lock-unlock-box");
        const meta = document.getElementById("lock-meta");
        const sub = document.getElementById("lock-sub");
        if (setup) setup.style.display = "";
        if (unlock) unlock.style.display = "none";
        if (sub) sub.textContent = "Set a Master Key and a private recovery prompt + answer.";
        if (meta) {
          const bio = hasBiometricSupport() ? "Biometric: available" : "Biometric: unavailable on this origin/device";
          meta.textContent = `KDF: PBKDF2-SHA256 (${LOCK_KDF_ITERATIONS.toLocaleString()} iterations), Cipher: AES-256-GCM | ${bio}`;
        }
      }

      function showLockUnlockMode() {
        const setup = document.getElementById("lock-setup-box");
        const unlock = document.getElementById("lock-unlock-box");
        const meta = document.getElementById("lock-meta");
        const sub = document.getElementById("lock-sub");
        const promptEl = document.getElementById("lock-recovery-prompt-view");
        if (setup) setup.style.display = "none";
        if (unlock) unlock.style.display = "";
        if (sub) sub.textContent = "Unlock with Master Key or your private recovery answer.";
        const cfg = getLockConfig();
        if (promptEl) {
          const prompt = cfg && cfg.recovery_prompt ? String(cfg.recovery_prompt) : "Recovery Prompt not set.";
          promptEl.textContent = `Recovery Prompt: ${prompt}`;
        }
        if (meta) {
          const bio = hasBiometricSupport() ? "Biometric: available" : "Biometric: unavailable on this origin/device";
          meta.textContent = `KDF: PBKDF2-SHA256 (${LOCK_KDF_ITERATIONS.toLocaleString()} iterations), Cipher: AES-256-GCM | ${bio}`;
        }
      }

      function hideLockOverlay() {
        const overlay = document.getElementById("lock-overlay");
        if (!overlay) return;
        overlay.classList.remove("active");
        overlay.setAttribute("aria-hidden", "true");
      }

      function showLockOverlay() {
        const overlay = document.getElementById("lock-overlay");
        if (!overlay) return;
        overlay.classList.add("active");
        overlay.setAttribute("aria-hidden", "false");
      }

      async function setupLockScreen() {
        const k1 = document.getElementById("lock-master-1")?.value || "";
        const k2 = document.getElementById("lock-master-2")?.value || "";
        const recoveryPrompt = document.getElementById("lock-recovery-prompt")?.value || "";
        const recoveryAnswer = document.getElementById("lock-recovery-answer-setup")?.value || "";
        if (k1.length < 10) {
          themedNotice("Master Key must be at least 10 characters.");
          return;
        }
        if (k1 !== k2) {
          themedNotice("Master Key confirmation does not match.");
          return;
        }
        if (String(recoveryPrompt).trim().length < 5) {
          themedNotice("Recovery Prompt must be at least 5 characters.");
          return;
        }
        if (normalizeRecoveryAnswer(recoveryAnswer).length < 4) {
          themedNotice("Recovery Answer is too short.");
          return;
        }
        try {
          const masterVerifier = await createVerifierBlob(k1);
          const recoverySalt = b64FromBytes(crypto.getRandomValues(new Uint8Array(16)));
          const recoverySecret = await deriveRecoverySecret(recoveryAnswer, recoveryPrompt, recoverySalt);
          const recoveryVerifier = await createVerifierBlob(recoverySecret);
          setLockConfig({
            version: 1,
            created_at: new Date().toISOString(),
            kdf: { name: "PBKDF2", hash: "SHA-256", iterations: LOCK_KDF_ITERATIONS },
            master: masterVerifier,
            recovery: recoveryVerifier,
            recovery_prompt: String(recoveryPrompt).trim(),
            recovery_salt: recoverySalt
          });
          themedNotice("Lock initialized with private recovery prompt + answer.");
          await unlockWithMaster(k1);
        } catch (e) {
          themedNotice("Lock setup failed: " + e.message);
        }
      }

      async function unlockWithMaster(secret) {
        const cfg = getLockConfig();
        if (!cfg || !cfg.master || !cfg.recovery) {
          themedNotice("Lock config missing. Initialize lock first.");
          showLockSetupMode();
          return;
        }
        const okMaster = await verifySecret(secret, cfg.master);
        if (!okMaster) {
          themedNotice("Invalid key.");
          return;
        }
        lockUnlocked = true;
        hideLockOverlay();
        startAppOnce();
      }

      async function unlockLockScreen() {
        const key = document.getElementById("lock-unlock-key")?.value || "";
        if (!key) {
          themedNotice("Enter key first.");
          return;
        }
        await unlockWithMaster(key);
      }

      async function unlockWithRecoveryAnswer() {
        const cfg = getLockConfig();
        if (!cfg || !cfg.recovery || !cfg.recovery_prompt || !cfg.recovery_salt) {
          themedNotice("Recovery is not configured.");
          return;
        }
        const answer = document.getElementById("lock-recovery-answer")?.value || "";
        if (!answer) {
          themedNotice("Enter recovery answer first.");
          return;
        }
        try {
          const recoverySecret = await deriveRecoverySecret(answer, cfg.recovery_prompt, cfg.recovery_salt);
          const ok = await verifySecret(recoverySecret, cfg.recovery);
          if (!ok) {
            themedNotice("Recovery answer is incorrect.");
            return;
          }
          lockUnlocked = true;
          hideLockOverlay();
          startAppOnce();
          themedNotice("Unlocked with recovery answer.");
        } catch (e) {
          themedNotice("Recovery unlock failed: " + e.message);
        }
      }

      function toggleRotatePanel() {
        const panel = document.getElementById("lock-rotate-box");
        if (!panel) return;
        panel.classList.toggle("active");
      }

      async function rotateLockCredentials() {
        const cfg = getLockConfig();
        if (!cfg || !cfg.master || !cfg.recovery || !cfg.recovery_prompt || !cfg.recovery_salt) {
          themedNotice("Lock is not initialized.");
          return;
        }

        const currentMaster = document.getElementById("lock-rotate-current-master")?.value || "";
        const currentRecovery = document.getElementById("lock-rotate-current-recovery")?.value || "";
        const newMaster1 = document.getElementById("lock-rotate-master-1")?.value || "";
        const newMaster2 = document.getElementById("lock-rotate-master-2")?.value || "";
        const newPrompt = (document.getElementById("lock-rotate-prompt")?.value || "").trim();
        const newAnswer = document.getElementById("lock-rotate-answer")?.value || "";

        if (newMaster1.length < 10) {
          themedNotice("New Master Key must be at least 10 characters.");
          return;
        }
        if (newMaster1 !== newMaster2) {
          themedNotice("New Master Key confirmation does not match.");
          return;
        }
        if (newPrompt.length < 5) {
          themedNotice("New Recovery Prompt must be at least 5 characters.");
          return;
        }
        if (normalizeRecoveryAnswer(newAnswer).length < 4) {
          themedNotice("New Recovery Answer is too short.");
          return;
        }

        try {
          let verified = false;
          if (currentMaster) {
            verified = await verifySecret(currentMaster, cfg.master);
          }
          if (!verified && currentRecovery) {
            const currentRecoverySecret = await deriveRecoverySecret(currentRecovery, cfg.recovery_prompt, cfg.recovery_salt);
            verified = await verifySecret(currentRecoverySecret, cfg.recovery);
          }
          if (!verified) {
            themedNotice("Provide current Master Key or current Recovery Answer to rotate.");
            return;
          }

          const newMasterVerifier = await createVerifierBlob(newMaster1);
          const newRecoverySalt = b64FromBytes(crypto.getRandomValues(new Uint8Array(16)));
          const newRecoverySecret = await deriveRecoverySecret(newAnswer, newPrompt, newRecoverySalt);
          const newRecoveryVerifier = await createVerifierBlob(newRecoverySecret);

          setLockConfig({
            version: 1,
            created_at: cfg.created_at || new Date().toISOString(),
            rotated_at: new Date().toISOString(),
            kdf: { name: "PBKDF2", hash: "SHA-256", iterations: LOCK_KDF_ITERATIONS },
            master: newMasterVerifier,
            recovery: newRecoveryVerifier,
            recovery_prompt: newPrompt,
            recovery_salt: newRecoverySalt
          });

          [
            "lock-rotate-current-master",
            "lock-rotate-current-recovery",
            "lock-rotate-master-1",
            "lock-rotate-master-2",
            "lock-rotate-prompt",
            "lock-rotate-answer",
          ].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.value = "";
          });
          const panel = document.getElementById("lock-rotate-box");
          if (panel) panel.classList.remove("active");
          showLockUnlockMode();
          themedNotice("Master and recovery credentials rotated.");
        } catch (e) {
          themedNotice("Rotation failed: " + e.message);
        }
      }

      async function enrollBiometricUnlock() {
        const cfg = getLockConfig();
        if (!cfg) {
          themedNotice("Set Master Key first, then enable biometrics.");
          return;
        }
        if (!hasBiometricSupport()) {
          themedNotice("Biometric unlock needs secure context (HTTPS or localhost) and WebAuthn support.");
          return;
        }
        try {
          const challenge = crypto.getRandomValues(new Uint8Array(32));
          const userId = crypto.getRandomValues(new Uint8Array(16));
          const cred = await navigator.credentials.create({
            publicKey: {
              challenge,
              rp: { name: "OMNI" },
              user: {
                id: userId,
                name: "omni-user",
                displayName: "OMNI User",
              },
              pubKeyCredParams: [
                { type: "public-key", alg: -7 },
                { type: "public-key", alg: -257 },
              ],
              authenticatorSelection: {
                userVerification: "required",
                residentKey: "preferred",
              },
              timeout: 60000,
              attestation: "none",
            },
          });
          if (!cred || !cred.rawId) {
            themedNotice("Biometric enrollment failed.");
            return;
          }
          setBiometricCredentialId(b64urlFromBytes(new Uint8Array(cred.rawId)));
          themedNotice("Biometric unlock enabled.");
        } catch (e) {
          themedNotice("Biometric enrollment failed: " + (e?.message || "Cancelled"));
        }
      }

      async function unlockWithBiometric() {
        if (!hasBiometricSupport()) {
          themedNotice("Biometric unlock unavailable on this origin/device.");
          return;
        }
        const credId = getBiometricCredentialId();
        if (!credId) {
          themedNotice("No biometric credential found. Use ENABLE FACE ID / FINGERPRINT first.");
          return;
        }
        try {
          const challenge = crypto.getRandomValues(new Uint8Array(32));
          const assertion = await navigator.credentials.get({
            publicKey: {
              challenge,
              allowCredentials: [{ type: "public-key", id: bytesFromB64url(credId) }],
              userVerification: "required",
              timeout: 60000,
            },
          });
          if (!assertion) {
            themedNotice("Biometric unlock failed.");
            return;
          }
          lockUnlocked = true;
          hideLockOverlay();
          startAppOnce();
          themedNotice("Unlocked with biometrics.");
        } catch (e) {
          themedNotice("Biometric unlock failed: " + (e?.message || "Cancelled"));
        }
      }

      function collectAppBackupPayload() {
        const ls = {};
        const includeKey = (k) => /^(managementapp:|operationColors:|operationOrder:|hvi|checklist|routineData|journal|reminder|notification|appearance|performance|tutor|missionPlan:|dashboardSession:|swissknife)/i.test(String(k || ""));
        try {
          for (let i = 0; i < localStorage.length; i += 1) {
            const k = localStorage.key(i);
            if (!k || !includeKey(k)) continue;
            ls[k] = localStorage.getItem(k);
          }
        } catch (_) {}
        return {
          meta: {
            app: "OMNI",
            version: "backup-v1",
            exported_at: new Date().toISOString(),
            origin: window.location.origin,
          },
          snapshot: {
            operations: Array.isArray(allOps) ? allOps : [],
            missions: Array.isArray(allMissions) ? allMissions : [],
            blackbook: Array.isArray(allBlackbook) ? allBlackbook : [],
            hvi: Array.isArray(allHvi) ? allHvi : [],
            blueprints: Array.isArray(blueprintCatalog) ? blueprintCatalog : [],
            books: Array.isArray(booksCatalog) ? booksCatalog : [],
            swissknife_sessions: Array.isArray(swissknifeSessions) ? swissknifeSessions : [],
          },
          local_storage: ls,
        };
      }

      function buildBackupFile() {
        const payload = collectAppBackupPayload();
        const text = JSON.stringify(payload, null, 2);
        const ts = new Date().toISOString().replace(/[:.]/g, "-");
        const name = `omni-backup-${ts}.json`;
        const file = new File([text], name, { type: "application/json" });
        return { file, name, text };
      }

      function downloadBackupText(name, text) {
        const blob = new Blob([text], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }

      async function exportAllDataBackup() {
        try {
          const { file, name, text } = buildBackupFile();
          downloadBackupText(file.name || name, text);
          themedNotice("Backup exported.");
        } catch (e) {
          themedNotice("Export failed: " + (e?.message || "Unknown error"));
        }
      }

      async function shareAllDataBackup() {
        try {
          const { file, name, text } = buildBackupFile();
          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: "OMNI Backup",
              text: "OMNI secure backup export",
              files: [file],
            });
            themedNotice("Backup shared.");
            return;
          }
          downloadBackupText(name, text);
          themedNotice("Share not available. Backup downloaded instead.");
        } catch (e) {
          themedNotice("Share cancelled or failed.");
        }
      }

      function backupLocalStorageKeyFilter(key) {
        return /^(managementapp:|operationColors:|operationOrder:|hvi|checklist|routineData|journal|reminder|notification|appearance|performance|tutor|missionPlan:|dashboardSession:|swissknife)/i.test(String(key || ""));
      }

      function triggerImportBackupPicker() {
        const input = document.getElementById("import-backup-file");
        if (!input) {
          themedNotice("Import input missing.");
          return;
        }
        input.value = "";
        input.click();
      }

      async function importAllDataBackupFromInput(inputEl) {
        try {
          const file = inputEl && inputEl.files && inputEl.files[0];
          if (!file) return;
          const text = await file.text();
          let parsed = null;
          try {
            parsed = JSON.parse(text);
          } catch (_) {
            themedNotice("Invalid backup JSON.");
            return;
          }
          const backupLocalStorage = parsed && parsed.local_storage && typeof parsed.local_storage === "object"
            ? parsed.local_storage
            : null;
          if (!backupLocalStorage) {
            themedNotice("Backup format not recognized.");
            return;
          }
          if (!(await themedConfirm("Import this backup and replace current OMNI local data?"))) return;

          const toDelete = [];
          for (let i = 0; i < localStorage.length; i += 1) {
            const k = localStorage.key(i);
            if (backupLocalStorageKeyFilter(k)) toDelete.push(k);
          }
          toDelete.forEach((k) => localStorage.removeItem(k));

          Object.keys(backupLocalStorage).forEach((k) => {
            if (!backupLocalStorageKeyFilter(k)) return;
            const v = backupLocalStorage[k];
            localStorage.setItem(k, v == null ? "" : String(v));
          });

          themedNotice("Backup imported. Reloading...");
          setTimeout(() => window.location.reload(), 300);
        } catch (e) {
          themedNotice("Import failed: " + (e?.message || "Unknown error"));
        } finally {
          if (inputEl) inputEl.value = "";
        }
      }

      function lockNow() {
        if (!getLockConfig()) {
          themedNotice("Lock has not been initialized yet.");
          return;
        }
        lockUnlocked = false;
        showLockOverlay();
        showLockUnlockMode();
        const unlockInput = document.getElementById("lock-unlock-key");
        if (unlockInput) unlockInput.value = "";
        const recoveryInput = document.getElementById("lock-recovery-answer");
        if (recoveryInput) recoveryInput.value = "";
      }

      function initLockScreen() {
        if (!(window.crypto && window.crypto.subtle)) {
          themedNotice("WebCrypto unavailable. Starting without lock.");
          startAppOnce();
          return;
        }
        const cfg = getLockConfig();
        if (!cfg) {
          showLockOverlay();
          showLockSetupMode();
          return;
        }
        showLockOverlay();
        showLockUnlockMode();
      }

      function themedConfirm(message = "Are you sure you want to delete this?") {
        return new Promise((resolve) => {
          const overlay = document.getElementById("confirm-overlay");
          const messageEl = document.getElementById("confirm-message");
          const cancelBtn = document.getElementById("confirm-cancel");
          const okBtn = document.getElementById("confirm-ok");

          if (!overlay || !messageEl || !cancelBtn || !okBtn) {
            resolve(confirm(message));
            return;
          }

          messageEl.textContent = message;
          overlay.classList.add("active");
          overlay.setAttribute("aria-hidden", "false");

          const close = (result) => {
            overlay.classList.remove("active");
            overlay.setAttribute("aria-hidden", "true");
            cancelBtn.removeEventListener("click", onCancel);
            okBtn.removeEventListener("click", onOk);
            overlay.removeEventListener("click", onOverlay);
            document.removeEventListener("keydown", onEsc);
            resolve(result);
          };

          const onCancel = () => close(false);
          const onOk = () => close(true);
          const onOverlay = (e) => {
            if (e.target === overlay) close(false);
          };
          const onEsc = (e) => {
            if (e.key === "Escape") close(false);
          };

          cancelBtn.addEventListener("click", onCancel);
          okBtn.addEventListener("click", onOk);
          overlay.addEventListener("click", onOverlay);
          document.addEventListener("keydown", onEsc);
        });
      }

      function themedPrompt(message = "Enter value", defaultValue = "") {
        return new Promise((resolve) => {
          const overlay = document.getElementById("prompt-overlay");
          const msgEl = document.getElementById("prompt-message");
          const inputEl = document.getElementById("prompt-input");
          const cancelBtn = document.getElementById("prompt-cancel");
          const okBtn = document.getElementById("prompt-ok");
          if (!overlay || !msgEl || !inputEl || !cancelBtn || !okBtn) {
            resolve(prompt(message, defaultValue));
            return;
          }
          msgEl.textContent = String(message || "Enter value");
          inputEl.value = String(defaultValue ?? "");
          overlay.classList.add("active");
          overlay.setAttribute("aria-hidden", "false");
          const close = (result) => {
            overlay.classList.remove("active");
            overlay.setAttribute("aria-hidden", "true");
            cancelBtn.removeEventListener("click", onCancel);
            okBtn.removeEventListener("click", onOk);
            overlay.removeEventListener("click", onOverlay);
            document.removeEventListener("keydown", onEsc);
            resolve(result);
          };
          const onCancel = () => close(null);
          const onOk = () => close(inputEl.value);
          const onOverlay = (e) => { if (e.target === overlay) close(null); };
          const onEsc = (e) => {
            if (e.key === "Escape") close(null);
            if (e.key === "Enter") close(inputEl.value);
          };
          cancelBtn.addEventListener("click", onCancel);
          okBtn.addEventListener("click", onOk);
          overlay.addEventListener("click", onOverlay);
          document.addEventListener("keydown", onEsc);
          setTimeout(() => inputEl.focus(), 0);
        });
      }

      function closeAllAddPopups() {
        document.querySelectorAll(".add-popup-panel.active").forEach((el) => {
          el.classList.remove("active");
          restoreAddPopupPanel(el);
        });
        activeAddPopupPanel = null;
        const backdrop = document.getElementById("add-popup-backdrop");
        if (backdrop) backdrop.classList.remove("active");
      }

      function toggleMobileMenu() {
        document.body.classList.toggle("menu-open");
      }

      function closeMobileMenu() {
        document.body.classList.remove("menu-open");
      }

      function openAddPopup(panelId) {
        closeAllAddPopups();
        const panel = document.getElementById(panelId);
        const backdrop = document.getElementById("add-popup-backdrop");
        if (!panel || !backdrop) return;
        detachAddPopupPanel(panel);
        panel.classList.add("active");
        activeAddPopupPanel = panel;
        backdrop.classList.add("active");
      }

      function detachAddPopupPanel(panel) {
        if (!panel) return;
        if (panel.parentElement === document.body) return;
        const placeholder = document.createElement("div");
        placeholder.style.display = "none";
        placeholder.dataset.popupPlaceholder = "1";
        panel.parentElement.insertBefore(placeholder, panel);
        panel.__popupPlaceholder = placeholder;
        panel.__popupOriginalParent = placeholder.parentElement;
        document.body.appendChild(panel);
      }

      function restoreAddPopupPanel(panel) {
        if (!panel) return;
        const placeholder = panel.__popupPlaceholder;
        const originalParent = panel.__popupOriginalParent;
        if (placeholder && originalParent && placeholder.parentElement === originalParent) {
          originalParent.insertBefore(panel, placeholder);
          placeholder.remove();
        }
        panel.__popupPlaceholder = null;
        panel.__popupOriginalParent = null;
      }

      function themedNotice(message = "Done.") {
        const overlay = document.getElementById("notice-overlay");
        const msg = document.getElementById("notice-message");
        const ok = document.getElementById("notice-ok");
        if (!overlay || !msg || !ok) return;
        msg.textContent = String(message || "Done.");
        overlay.classList.add("active");
        overlay.setAttribute("aria-hidden", "false");
        const close = () => {
          overlay.classList.remove("active");
          overlay.setAttribute("aria-hidden", "true");
          ok.removeEventListener("click", close);
          overlay.removeEventListener("click", onOverlay);
          document.removeEventListener("keydown", onEsc);
        };
        const onOverlay = (e) => {
          if (e.target === overlay) close();
        };
        const onEsc = (e) => {
          if (e.key === "Escape") close();
        };
        ok.addEventListener("click", close);
        overlay.addEventListener("click", onOverlay);
        document.addEventListener("keydown", onEsc);
      }

      function closeIntelPopup() {
        const overlay = document.getElementById("intel-overlay");
        const modal = overlay ? overlay.querySelector(".intel-modal") : null;
        if (!overlay) return;
        overlay.classList.remove("active");
        overlay.classList.remove("fullscreen");
        if (modal) modal.classList.remove("intel-modal-full");
        overlay.setAttribute("aria-hidden", "true");
        intelPopupType = "";
        intelPopupProbeId = "";
        intelPopupHviHandle = "";
      }

      function openBlackbookPopup(probeId, rowIndex = -1) {
        let item = null;
        if (Number.isInteger(rowIndex) && rowIndex >= 0 && rowIndex < allBlackbook.length) {
          item = allBlackbook[rowIndex];
        }
        if (!item) {
          item = allBlackbook.find((p) => String(p.Probe_ID || "") === String(probeId || ""));
        }
        if (!item) return;
        const overlay = document.getElementById("intel-overlay");
        const title = document.getElementById("intel-title");
        const subtitle = document.getElementById("intel-subtitle");
        const body = document.getElementById("intel-body");
        const saveBtn = document.getElementById("intel-save-btn");
        const delBtn = document.getElementById("intel-delete-btn");
        const modal = overlay ? overlay.querySelector(".intel-modal") : null;
        if (!overlay || !title || !subtitle || !body || !saveBtn || !delBtn) return;
        overlay.classList.remove("fullscreen");
        if (modal) modal.classList.remove("intel-modal-full");
        intelPopupType = "blackbook";
        intelPopupProbeId = String(item.Probe_ID || "");
        title.textContent = "// BLACKBOOK ENTRY";
        subtitle.textContent = `Probe_ID: ${intelPopupProbeId}`;
        body.innerHTML = `
          <div class="intel-grid">
            <div class="form-group"><label>Date</label><input id="intel-bb-date" type="date" value="${escapeHtmlAttr(item.Date || "")}" /></div>
            <div class="form-group"><label>Time</label><input id="intel-bb-time" type="time" value="${escapeHtmlAttr(item.Time || "")}" /></div>
            <div class="form-group"><label>Operation</label><input id="intel-bb-operation" type="text" value="${escapeHtmlAttr(item.Operation || "")}" /></div>
            <div class="form-group"><label>Mission</label><input id="intel-bb-mission" type="text" value="${escapeHtmlAttr(item.Mission || "")}" /></div>
            <div class="form-group"><label>Status</label>
              <select id="intel-bb-status">
                <option value="PENDING" ${(item.Status || "PENDING") === "PENDING" ? "selected" : ""}>PENDING</option>
                <option value="IN_PROGRESS" ${(item.Status || "") === "IN_PROGRESS" ? "selected" : ""}>IN_PROGRESS</option>
                <option value="COMPLETE" ${(item.Status || "") === "COMPLETE" ? "selected" : ""}>COMPLETE</option>
                <option value="BLOCKED" ${(item.Status || "") === "BLOCKED" ? "selected" : ""}>BLOCKED</option>
              </select>
            </div>
            <div class="form-group full"><label>Description</label><textarea id="intel-bb-description" placeholder="Description...">${escapeHtmlAttr(item.Description || "")}</textarea></div>
            <div class="form-group"><label>Platform</label><input id="intel-bb-platform" type="text" value="${escapeHtmlAttr(item.Platform || "")}" /></div>
            <div class="form-group full"><label>Hypothesis</label><textarea id="intel-bb-hypothesis" placeholder="Hypothesis...">${escapeHtmlAttr(item.Hypothesis || "")}</textarea></div>
            <div class="form-group full"><label>Result</label><textarea id="intel-bb-result" placeholder="Result...">${escapeHtmlAttr(item.Result_Quantitative || "")}</textarea></div>
            <div class="form-group full"><label>Notes</label><textarea id="intel-bb-notes" placeholder="Full notes...">${escapeHtmlAttr(item.Notes || "")}</textarea></div>
          </div>
        `;
        saveBtn.style.display = "";
        delBtn.style.display = "";
        overlay.classList.add("active");
        overlay.setAttribute("aria-hidden", "false");
      }

      function openHviPopup(handle, page = 1) {
        const raw = allHvi.find((h) => String(h.handle || "Unknown") === String(handle || ""));
        if (!raw) return;
        const item = augmentHvi(raw);
        const overlay = document.getElementById("intel-overlay");
        const title = document.getElementById("intel-title");
        const subtitle = document.getElementById("intel-subtitle");
        const body = document.getElementById("intel-body");
        const saveBtn = document.getElementById("intel-save-btn");
        const delBtn = document.getElementById("intel-delete-btn");
        const modal = overlay ? overlay.querySelector(".intel-modal") : null;
        if (!overlay || !title || !subtitle || !body || !saveBtn || !delBtn) return;
        overlay.classList.add("fullscreen");
        if (modal) modal.classList.add("intel-modal-full");
        intelPopupType = "hvi";
        intelPopupHviHandle = String(item.handle || "Unknown");
        hviPopupPage = Math.max(1, Math.min(2, Number(page || 1)));
        title.textContent = "// HVI PROFILE";
        subtitle.textContent = intelPopupHviHandle;
        const fields = item.fields && typeof item.fields === "object" ? item.fields : {};
        const customStats = item.customStats && typeof item.customStats === "object" ? item.customStats : {};
        const links = hviProfileLinks(item);
        const emails = Array.isArray(item.emails) ? item.emails : [];
        const leads = Array.isArray(item.leads) ? item.leads : [];
        const photos = Array.isArray(item.photos) ? item.photos : [];
        const paramKeys = hviAllParameterKeys(item);
        const keyOptionsHtml = paramKeys.map((k) => `<option value="${escapeHtmlAttr(k)}">${escapeHtmlAttr(k)}</option>`).join("");
        const orderedCustomKeys = [...new Set([...(item.statOrder || []), ...Object.keys(customStats)])]
          .filter((k) => Object.prototype.hasOwnProperty.call(customStats, k));
        const extra = getHviExtra(intelPopupHviHandle);
        const detailRowsHtml = paramKeys.map((k) => {
          const inCustom = Object.prototype.hasOwnProperty.call(customStats, k);
          const currentValue = inCustom ? String(customStats[k] || "") : String(fields[k] || "");
          const currentDesc = String((extra.descriptions && extra.descriptions[k]) || "");
          const editValueCall = `editHviFieldValueOnlyFromPopup('${escapeJsString(k)}', ${inCustom ? "true" : "false"}, '${escapeJsString(currentValue)}')`;
          const editDescCall = `editHviFieldDescriptionOnlyFromPopup('${escapeJsString(k)}', '${escapeJsString(currentDesc)}')`;
          return `
            <div class="hvi-dossier-row">
              <div class="hvi-dossier-key">${escapeHtmlAttr(k)}</div>
              <div class="hvi-dossier-value" ondblclick="${editValueCall}" title="Double-click to edit value">${hviParamValueHtml(item, k)}</div>
              <div class="hvi-dossier-desc" ondblclick="${editDescCall}" title="Double-click to edit description">${escapeHtmlAttr(currentDesc || "No description. Double-click to add.")}</div>
            </div>
          `;
        }).join("");
        body.innerHTML = `
          <div class="intel-card hvi-popup-card hvi-dossier">
            <div class="hvi-dossier-grid">
              <section class="hvi-dossier-left">
                <div id="hvi-photo-dropzone" class="hvi-dossier-photo-wrap hvi-profile-dropzone">
                  ${photos[0]
                    ? `<img class="hvi-dossier-photo" src="${escapeHtmlAttr(photos[0])}" alt="HVI profile photo" />`
                    : `<div class="hvi-profile-empty">No Photo</div>`}
                </div>
                <div class="hvi-dossier-idline">
                  <div class="hvi-dossier-name">${escapeHtmlAttr(fields["Name"] || item.handle || "UNKNOWN")}</div>
                  <div class="hvi-dossier-subdesc" ondblclick="editHviFieldValueOnlyFromPopup('Description', false, '${escapeJsString(String(fields['Description'] || ''))}')" title="Double-click to edit description under name">${escapeHtmlAttr(String(fields["Description"] || "No profile description. Double-click to add."))}</div>
                </div>
                <div class="hvi-add-row">
                  <button class="submit-btn" type="button" onclick="triggerHviPhotoPicker()">CHOOSE / UPDATE PHOTO</button>
                </div>
                ${emails.length || leads.length ? `<div class="hvi-dossier-contact">${emails.slice(0,2).map((e, i) => `<div class="hvi-list-row"><a href="mailto:${escapeHtmlAttr(e)}" class="intel-v">${escapeHtmlAttr(e)}</a><button class="x-btn" onclick="removeHviEmailFromPopup(${i})">X</button></div>`).join("")}${leads.slice(0,2).map((l, i) => `<div class="hvi-list-row"><span class="intel-v">${escapeHtmlAttr(l)}</span><button class="x-btn" onclick="removeHviLeadFromPopup(${i})">X</button></div>`).join("")}</div>` : ""}
              </section>
              <section class="hvi-dossier-right">
                <div class="hvi-dossier-table">
                  ${detailRowsHtml}
                </div>
                <div class="intel-card" style="margin-top:8px;">
                  <h4 class="intel-k" style="margin:0 0 6px 0;">ADD FIELD</h4>
                  <div class="hvi-add-row double" style="margin-top:0;">
                    <select class="search-input" id="intel-hvi-key-simple" onchange="onHviAddKeyModeChange(this.value)">
                      <option value="">Select field key...</option>
                      <option value="__custom__">Custom key...</option>
                      ${keyOptionsHtml}
                    </select>
                    <input class="search-input" id="intel-hvi-key-custom" type="text" placeholder="Custom field key..." style="display:none;" />
                  </div>
                  <button class="submit-btn hvi-add-field-btn" type="button" onclick="addHviEntryFromPopup()">ADD / UPDATE</button>
                </div>
              </section>
            </div>
          </div>
        `;
        saveBtn.style.display = "none";
        delBtn.style.display = "";
        overlay.classList.add("active");
        overlay.setAttribute("aria-hidden", "false");
        const hviPhotoFileEl = document.getElementById("intel-hvi-photo-file");
        if (hviPhotoFileEl) {
          hviPhotoFileEl.addEventListener("change", async () => {
            const f = hviPhotoFileEl.files && hviPhotoFileEl.files[0];
            if (!f) return;
            await addHviPhotoFromDrop(f);
            hviPhotoFileEl.value = "";
          });
        }
        const hviDropzone = document.getElementById("hvi-photo-dropzone");
        if (hviDropzone) {
          hviDropzone.addEventListener("dragover", (e) => {
            e.preventDefault();
            hviDropzone.classList.add("drag-over");
          });
          hviDropzone.addEventListener("dragleave", () => hviDropzone.classList.remove("drag-over"));
          hviDropzone.addEventListener("drop", async (e) => {
            e.preventDefault();
            hviDropzone.classList.remove("drag-over");
            const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
            if (!f) return;
            await addHviPhotoFromDrop(f);
          });
        }
      }

      async function saveIntelPopup() {
        if (intelPopupType === "mission") {
          const content = String(document.getElementById("intel-mission-content")?.value || "");
          if (!missionEditorPath) return;
          try {
            if (missionPopupSection === "brief") {
              const res = await fetch("/api/mission/brief/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  mission_path: missionEditorPath,
                  phase: missionEditorNextBriefPhase,
                  content,
                  variables: typeof extractBriefVariables === "function" ? extractBriefVariables(content || "") : [],
                }),
              });
              if (!res.ok) {
                const err = await res.json().catch(() => ({ error: "Failed to save brief." }));
                throw new Error(err.error || "Failed to save brief.");
              }
              missionEditorBriefContent = content || "";
              missionEditorHasBrief = Boolean(String(missionEditorBriefContent).trim());
              missionEditorNextBriefPhase += 1;
              themedNotice("Brief saved.");
            } else {
              if (!missionEditorHasBrief && !String(missionEditorBriefContent || "").trim()) {
                throw new Error("Brief required before Debrief.");
              }
              const res = await fetch("/api/mission/debrief/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  mission_path: missionEditorPath,
                  content,
                }),
              });
              if (!res.ok) {
                const err = await res.json().catch(() => ({ error: "Failed to save debrief." }));
                throw new Error(err.error || "Failed to save debrief.");
              }
              missionEditorDebriefContent = content || "";
              themedNotice("Debrief saved. HVI updated.");
            }
            await fetchData();
            closeIntelPopup();
          } catch (e) {
            themedNotice("Mission save failed: " + e.message);
          }
          return;
        }
        if (intelPopupType !== "blackbook") return;
        const body = {
          Probe_ID: intelPopupProbeId,
          Date: document.getElementById("intel-bb-date")?.value || "",
          Time: document.getElementById("intel-bb-time")?.value || "",
          Operation: document.getElementById("intel-bb-operation")?.value || "",
          Mission: document.getElementById("intel-bb-mission")?.value || "",
          Status: document.getElementById("intel-bb-status")?.value || "PENDING",
          Description: document.getElementById("intel-bb-description")?.value || "",
          Hypothesis: document.getElementById("intel-bb-hypothesis")?.value || "",
          Platform: document.getElementById("intel-bb-platform")?.value || "",
          Result_Quantitative: document.getElementById("intel-bb-result")?.value || "",
          Notes: document.getElementById("intel-bb-notes")?.value || "",
        };
        try {
          const res = await fetch("/api/blackbook/upsert", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
          });
          if (!res.ok) throw new Error("Save failed");
          closeIntelPopup();
          await fetchData();
          themedNotice("Blackbook entry saved.");
        } catch (e) {
          themedNotice("Blackbook save failed: " + e.message);
        }
      }

      async function deleteIntelPopup() {
        if (intelPopupType === "blackbook") {
          if (!(await themedConfirm("Are you sure you want to delete this?"))) return;
          try {
            const res = await fetch("/api/blackbook", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ probe_id: intelPopupProbeId })
            });
            if (!res.ok) throw new Error("Delete failed");
            closeIntelPopup();
            await fetchData();
            themedNotice("Blackbook entry deleted.");
          } catch (e) {
            themedNotice("Delete failed: " + e.message);
          }
          return;
        }
        if (intelPopupType === "hvi") {
          await deleteHvi(intelPopupHviHandle);
          closeIntelPopup();
        }
      }

      function switchView(viewId) {
        if (viewId === "blackbook") viewId = "mission-log";
        closeAllAddPopups();
        closeMobileMenu();
        document.querySelectorAll(".view-panel").forEach((el) => el.style.display = "none");
        const targetView = document.getElementById("view-" + viewId);
        if (targetView) targetView.style.display = "block";
        
        document.querySelectorAll(".nav-btn").forEach((btn) => btn.classList.remove("active"));
        const targetBtn = document.querySelector(`.nav-btn[onclick="switchView('${viewId}')"]`);
        if (targetBtn) targetBtn.classList.add("active");
        applyViewTitleTheme(viewId, targetBtn);

        currentView = viewId;
        if (viewId === "brief-studio") {
          renderBriefMissionOptions();
        }
        if (viewId === "blueprints") {
          if (!blueprintCatalog.length && !isFetching) {
            fetchAndUpdate("/api/blueprints", (data) => {
              applyBlueprintCatalog(data);
              renderBlueprints();
            });
          } else {
            renderBlueprints();
          }
        }
        if (viewId === "books") {
          if (!booksCatalog.length && !isFetching) {
            fetchAndUpdate("/api/manuels", (data) => {
              applyBooksCatalog(data);
              renderBooks();
            });
          } else {
            renderBooks();
          }
        }
        if (viewId === "swissknife") {
          if (!swissknifeSessions.length && !isFetching) {
            fetchAndUpdate("/api/swissknife/sessions", (data) => {
              applySwissknifeSessionsData(data);
              renderSwissknife();
            });
          } else {
            renderSwissknife();
          }
        }
        if (viewId === "routines") {
          renderRoutines();
        }
        if (viewId === "gym-planner") {
          renderGymPlanner();
        }
        if (viewId === "journal") {
          renderJournal();
        }
        if (viewId === "probe-skill") {
          ensureMarkdownLoaded("/ProbeSkill.md", "probe-skill-content", "Failed to load ProbeSkill.md");
        }
        if (viewId === "probe-manual") {
          ensureMarkdownLoaded("/OfficialProbeManuel.md", "probe-manual-content", "Failed to load OfficialProbeManuel.md");
        }
        if (viewId === "mission-briefing") {
          ensureMarkdownLoaded("/MissionBriefing.md", "mission-briefing-content", "Failed to load MissionBriefing.md");
        }
        if (viewId === "hvi-intel") {
          renderHvi();
        }
        if (viewId === "tutor") {
          renderTutor();
        }
        if (viewId === "operations") {
          const mainEl = document.getElementById("blackbook-search-input");
          const opsEl = document.getElementById("blackbook-search-input-ops");
          if (!String(mainEl?.value || "").trim() && !String(opsEl?.value || "").trim()) {
            blackbookSearchQuery = "";
          }
          renderOperations();
          renderBlackbook();
          if (!allBlackbook.length && !isFetching) fetchData();
        }
        if (viewId === "mission-log") {
          const mainEl = document.getElementById("blackbook-search-input");
          const opsEl = document.getElementById("blackbook-search-input-ops");
          if (!String(mainEl?.value || "").trim() && !String(opsEl?.value || "").trim()) {
            blackbookSearchQuery = "";
          }
          renderMissions();
          renderBriefMissionOptions();
          renderBlackbook();
          if (!allBlackbook.length && !isFetching) fetchData();
        }
        if ((viewId === "operations" || viewId === "mission-log") && !isFetching) {
          fetchAndUpdate("/api/blackbook", (data) => {
            allBlackbook = Array.isArray(data) ? data : [];
            renderBlackbook();
          });
        }
        if (viewId === "hvi-intel" && !isFetching) {
          fetchAndUpdate("/api/hvi", (data) => {
            allHvi = Array.isArray(data) ? data : [];
            const hviCount = document.getElementById("hvi-count");
            if (hviCount) hviCount.innerText = String(allHvi.length);
            renderHvi();
          });
        }
        if (viewId !== "mission-log") {
          selectedOperation = null;
          updateMissionHeader();
        }
      }

      function applyViewTitleTheme(viewId, navBtn) {
        const panel = document.getElementById("view-" + viewId);
        if (!panel) return;
        const title = panel.querySelector("h2");
        if (!title) return;
        let color = "var(--term-green)";
        if (navBtn && navBtn.classList.contains("nav-yellow")) color = "var(--warning-yellow)";
        else if (navBtn && navBtn.classList.contains("nav-red")) color = "var(--alert-red)";
        else if (navBtn && navBtn.classList.contains("nav-gray")) color = "#c2c2c2";
        title.style.color = color;
      }

      function setNavHoverDescription(text) {
        const box = document.getElementById("nav-hover-desc");
        if (!box) return;
        box.textContent = text || "Hover and hold a button to load description.";
      }

      function initNavHoverDescriptions() {
        setNavHoverDescription("");
      }

      function updateMissionHeader() {
        const header = document.getElementById("mission-header");
        const sourceCode = document.getElementById("mission-source-code");
        const opInput = document.getElementById("new-mission-op");

        if (selectedOperation) {
          header.innerText = `// ${selectedOperation.toUpperCase()} MISSIONS`;
          sourceCode.innerText = `OperationDir/Operations/${selectedOperation}/Missions/[BRIEF]`;
          if (opInput) opInput.value = selectedOperation;
        } else {
          header.innerText = "// MASTER MISSION INDEX";
          sourceCode.innerText = `OperationDir/Operations/[OP]/Missions/[BRIEF]`;
          if (opInput) opInput.value = "ProjectTitle";
        }
      }

      async function handleOpCardClick(operationName) {
        selectedOperation = operationName;
        updateMissionHeader();
        switchView("mission-log");
        renderMissions();
      }

      function handleOpCardFromCard(cardEl) {
        const op = cardEl ? (cardEl.getAttribute("data-op") || "") : "";
        if (!op) return;
        handleOpCardClick(op);
      }

      function handleSearch() {
        const searchEl = document.getElementById("global-search");
        searchQuery = searchEl ? searchEl.value.toLowerCase() : "";
        if (currentView === "mission-log") renderMissions();
        if (currentView === "operations") renderOperations();
      }

      function setMissionSearch() {
        const el = document.getElementById("mission-search-input");
        missionSearchQuery = (el ? el.value : "").toLowerCase().trim();
        renderMissions();
      }

      function setOperationSearch() {
        const el = document.getElementById("operation-search-input");
        operationSearchQuery = (el ? el.value : "").toLowerCase().trim();
        renderOperations();
      }

      function setBlueprintSearch() {
        const el = document.getElementById("blueprint-search-input");
        blueprintSearchQuery = (el ? el.value : "").toLowerCase().trim();
        renderBlueprints();
      }

      function setBookSearch() {
        const el = document.getElementById("book-search-input");
        bookSearchQuery = (el ? el.value : "").toLowerCase().trim();
        renderBooks();
      }

      function setBlackbookSearch(sourceEl = null) {
        const mainEl = document.getElementById("blackbook-search-input");
        const opsEl = document.getElementById("blackbook-search-input-ops");
        let raw = "";
        if (sourceEl && typeof sourceEl.value === "string") {
          raw = sourceEl.value;
        } else if (document.activeElement === opsEl) {
          raw = String(opsEl?.value || "");
        } else if (document.activeElement === mainEl) {
          raw = String(mainEl?.value || "");
        } else if (currentView === "operations") {
          raw = String(opsEl?.value || mainEl?.value || "");
        } else {
          raw = String(mainEl?.value || opsEl?.value || "");
        }
        const value = String(raw || "").toLowerCase().trim();
        const bothEmpty = !String(mainEl?.value || "").trim() && !String(opsEl?.value || "").trim();
        blackbookSearchQuery = bothEmpty ? "" : value;
        if (mainEl && mainEl !== sourceEl && mainEl.value !== value) mainEl.value = value;
        if (opsEl && opsEl !== sourceEl && opsEl.value !== value) opsEl.value = value;
        renderBlackbook();
      }

      function setHviSearch() {
        const el = document.getElementById("hvi-search-input");
        hviSearchQuery = (el ? el.value : "").toLowerCase().trim();
        renderHvi();
      }

      function hviDateFromItem(h) {
        const raw = String(
          h?.fields?.["Updated At"] ||
          h?.fields?.["Last Updated"] ||
          h?.fields?.["Created At"] ||
          h?.fields?.["Time Added"] ||
          h?.fields?.["Date Added"] ||
          ""
        ).trim();
        if (raw) {
          const d = new Date(raw);
          if (!Number.isNaN(d.getTime())) return d;
        }
        const dOnly = String(h?.fields?.["Date"] || "").trim();
        const tOnly = String(h?.fields?.["Time"] || "00:00").trim();
        if (dOnly) {
          const d2 = new Date(`${dOnly}T${tOnly || "00:00"}`);
          if (!Number.isNaN(d2.getTime())) return d2;
        }
        return null;
      }

      function hviFreshnessClass(h) {
        const d = hviDateFromItem(h);
        if (!d) return "hvi-fresh-warn";
        const ageDays = (Date.now() - d.getTime()) / (24 * 60 * 60 * 1000);
        if (ageDays > 60) return "hvi-fresh-danger";
        if (ageDays > 21) return "hvi-fresh-warn";
        return "hvi-fresh-good";
      }

      function hviBriefText(h) {
        const fields = (h && h.fields && typeof h.fields === "object") ? h.fields : {};
        return String(
          fields["Brief"] ||
          fields["Mission Stage"] ||
          fields["Status"] ||
          h?.stage ||
          h?.status ||
          "No brief"
        ).trim() || "No brief";
      }

      function hviCategoryFromItem(h) {
        return String(h?.fields?.["Category"] || h?.fields?.["Type"] || "").trim();
      }

      function hviParametersFromItem(h) {
        return String(h?.fields?.["Parameters"] || "").trim();
      }

      function setHviFilters() {
        const catEl = document.getElementById("hvi-filter-category");
        const paramEl = document.getElementById("hvi-filter-param");
        const fromEl = document.getElementById("hvi-filter-date-from");
        const toEl = document.getElementById("hvi-filter-date-to");
        hviFilterCategory = String(catEl?.value || "").trim().toLowerCase();
        hviFilterParam = String(paramEl?.value || "").trim().toLowerCase();
        hviFilterDateFrom = String(fromEl?.value || "").trim();
        hviFilterDateTo = String(toEl?.value || "").trim();
        renderHvi();
      }

      function clearHviFilters() {
        hviFilterCategory = "";
        hviFilterParam = "";
        hviFilterDateFrom = "";
        hviFilterDateTo = "";
        const catEl = document.getElementById("hvi-filter-category");
        const paramEl = document.getElementById("hvi-filter-param");
        const fromEl = document.getElementById("hvi-filter-date-from");
        const toEl = document.getElementById("hvi-filter-date-to");
        if (catEl) catEl.value = "";
        if (paramEl) paramEl.value = "";
        if (fromEl) fromEl.value = "";
        if (toEl) toEl.value = "";
        renderHvi();
      }

      function refreshHviTimeMeta() {
        const el = document.getElementById("new-hvi-time-meta");
        if (!el) return;
        el.textContent = `Time added: ${new Date().toLocaleString("en-GB", { hour12: false })}`;
      }

      async function loadMarkdownInto(filePath, targetId, errorMessage) {
        const target = document.getElementById(targetId);
        if (!target) return;
        try {
          const res = await fetch(filePath, { cache: "no-store" });
          if (!res.ok) throw new Error("File not found");
          const markdown = await res.text();
          target.innerHTML = renderManualMarkdown(markdown);
        } catch (e) {
          target.textContent = errorMessage;
        }
      }

      function ensureMarkdownLoaded(filePath, targetId, errorMessage) {
        if (lazyMarkdownState[targetId]) return;
        lazyMarkdownState[targetId] = true;
        loadMarkdownInto(filePath, targetId, errorMessage);
      }

      function encodePathForUrl(path) {
        return String(path || "").split("/").map((p) => encodeURIComponent(p)).join("/");
      }

      function escapeJsString(s) {
        return String(s || "")
          .replace(/\\/g, "\\\\")
          .replace(/'/g, "\\'")
          .replace(/\r/g, "\\r")
          .replace(/\n/g, "\\n");
      }

      function formatFileSize(bytes) {
        const n = Number(bytes || 0);
        if (!n) return "Unknown";
        const units = ["B", "KB", "MB", "GB"];
        let v = n;
        let i = 0;
        while (v >= 1024 && i < units.length - 1) {
          v /= 1024;
          i += 1;
        }
        return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
      }

      function buildDocContextHtml(meta) {
        if (!meta) return "";
        const docType = String(meta.type || "doc").toUpperCase();
        const localPath = String(meta.path || meta.file || "Unknown");
        const sourcePath = String(meta.sourcePath || "Unknown");
        const sizeText = formatFileSize(meta.size);
        const updated = String(meta.modifiedAt || "Unknown");
        return `
          <div class="intel-card" style="margin-bottom:10px;">
            <div><strong>Type:</strong> ${escapeHtmlAttr(docType)}</div>
            <div><strong>Local Path:</strong> <code>${escapeHtmlAttr(localPath)}</code></div>
            <div><strong>Source Path:</strong> <code>${escapeHtmlAttr(sourcePath)}</code></div>
            <div><strong>Size:</strong> ${escapeHtmlAttr(sizeText)}</div>
            <div><strong>Updated:</strong> ${escapeHtmlAttr(updated)}</div>
          </div>
        `;
      }

      function buildDocActionsHtml(urlPath, fileName) {
        return `
          <div style="display:flex; gap:8px; margin-bottom:10px;">
            <a class="submit-btn" href="${escapeHtmlAttr(urlPath)}" target="_blank" rel="noopener">OPEN</a>
            <a class="submit-btn" href="${escapeHtmlAttr(urlPath)}" download="${escapeHtmlAttr(String(fileName || '').split('/').pop() || 'document')}">DOWNLOAD</a>
          </div>
        `;
      }

      function getPdfBookmarkPage(fileName) {
        const raw = localStorage.getItem(`pdf-bookmark:${String(fileName || "")}`);
        const page = Number(raw || 0);
        return Number.isInteger(page) && page > 0 ? page : 1;
      }

      function buildPdfBookmarkHtml(fileName, page) {
        return `
          <div class="intel-card" style="margin-bottom:10px;">
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <span style="font-weight:bold;">PDF BOOKMARK</span>
              <label style="color:var(--term-dim);">PAGE</label>
              <input id="pdf-bookmark-page-input" type="number" min="1" step="1" value="${Number(page || 1)}" class="search-input" style="max-width:120px;" />
              <button class="submit-btn" onclick="savePdfBookmarkFromPopup('${escapeJsString(fileName)}')">SAVE PAGE</button>
              <button class="submit-btn" onclick="openPdfBookmarkFromPopup('${escapeJsString(fileName)}')">OPEN PAGE</button>
            </div>
          </div>
        `;
      }

      function savePdfBookmarkFromPopup(fileName) {
        const input = document.getElementById("pdf-bookmark-page-input");
        const page = Number(input ? input.value : 0);
        if (!Number.isInteger(page) || page < 1) {
          themedNotice("Enter a valid page number (1+).");
          return;
        }
        localStorage.setItem(`pdf-bookmark:${String(fileName || "")}`, String(page));
        themedNotice(`Bookmark saved: page ${page}`);
      }

      function openPdfBookmarkFromPopup(fileName) {
        const input = document.getElementById("pdf-bookmark-page-input");
        const page = Number(input ? input.value : getPdfBookmarkPage(fileName));
        if (!Number.isInteger(page) || page < 1) {
          themedNotice("Enter a valid page number (1+).");
          return;
        }
        const frame = document.getElementById("doc-pdf-frame");
        if (!frame) return;
        const base = String(frame.getAttribute("data-base-src") || "").split("#")[0];
        frame.src = `${base}#page=${page}`;
      }

      function closeDocPopup() {
        const overlay = document.getElementById("doc-overlay");
        if (!overlay) return;
        overlay.classList.remove("active");
        overlay.setAttribute("aria-hidden", "true");
      }

      async function openBlueprintCard(fileName, displayTitle, sourcePath, fileType = "md", fileSize = 0, modifiedAt = "", localPath = "") {
        const overlay = document.getElementById("doc-overlay");
        const header = document.getElementById("doc-title");
        const sub = document.getElementById("doc-sub");
        const content = document.getElementById("doc-body");
        if (!overlay || !header || !sub || !content) return;
        header.textContent = `// ${String(displayTitle || "DOCUMENT").toUpperCase()}`;
        sub.textContent = sourcePath || fileName || "ORACLE_FILE";
        overlay.classList.add("active");
        overlay.setAttribute("aria-hidden", "false");
        const type = String(fileType || "").toLowerCase();
        const urlPath = `/${encodePathForUrl(fileName)}`;
        const bookMeta = booksCatalog.find((b) => (b.path || b.file) === fileName || b.file === fileName);
        const contextHtml = buildDocContextHtml(bookMeta || {
          file: fileName,
          path: localPath || fileName,
          sourcePath,
          type,
          size: Number(fileSize || 0),
          modifiedAt: String(modifiedAt || ""),
        });
        const isBundledOffline = !bookMeta || bookMeta.bundled !== false;
        if (!isBundledOffline) {
          content.innerHTML = `${contextHtml}
            <div class="intel-card">
              <p>This manual is listed in the iPhone build, but the file itself is not bundled offline.</p>
              <p>The lean mobile build keeps the catalog and removes large PDFs to reduce app size and launch time.</p>
            </div>
          `;
          return;
        }
        const actionsHtml = buildDocActionsHtml(urlPath, fileName);
        if (type === "pdf" || String(fileName).toLowerCase().endsWith(".pdf")) {
          const savedPage = getPdfBookmarkPage(fileName);
          const pdfUrl = `${urlPath}#page=${savedPage}`;
          content.innerHTML = `${contextHtml}${actionsHtml}${buildPdfBookmarkHtml(fileName, savedPage)}<iframe id="doc-pdf-frame" data-base-src="${escapeHtmlAttr(urlPath)}" src="${escapeHtmlAttr(pdfUrl)}" style="width:100%; height:66vh; border:1px solid var(--term-green); background:#000;" title="${escapeHtmlAttr(displayTitle || fileName)}"></iframe>`;
          return;
        }
        if (type === "epub" || String(fileName).toLowerCase().endsWith(".epub")) {
          content.innerHTML = `${contextHtml}
            <div class="intel-card">
              <p>EPUB preview is not embedded in this viewer yet.</p>
              ${actionsHtml}
            </div>
          `;
          return;
        }
        try {
          const res = await fetch(urlPath, { cache: "no-store" });
          if (!res.ok) {
            throw new Error("Blueprint file not found in local project.");
          }
          const markdown = await res.text();
          content.innerHTML = `${contextHtml}${actionsHtml}${renderManualMarkdown(markdown)}`;
        } catch (e) {
          content.innerHTML = `<p>Failed to load <code>${escapeHtmlAttr(fileName)}</code>.</p><p>${escapeHtmlAttr(e.message)}</p><p>Expected source path: <code>${escapeHtmlAttr(sourcePath || "")}</code></p>`;
        }
      }

      function blueprintIconFor(name) {
        const n = String(name || "").toLowerCase();
        if (n.includes("recon")) return "🧭";
        if (n.includes("osint")) return "🕶️";
        if (n.includes("bridge")) return "🔐";
        if (n.includes("fleet")) return "🛰️";
        if (n.includes("provision")) return "⚙️";
        if (n.includes("offgrid")) return "📡";
        return "📘";
      }

      function renderBlueprints() {
        const grid = document.getElementById("blueprint-grid");
        if (!grid) return;
        let items = blueprintCatalog.slice();
        if (blueprintSearchQuery) {
          items = items.filter((b) => {
            const blob = `${b.title} ${b.file} ${b.sourcePath}`.toLowerCase();
            return blob.includes(blueprintSearchQuery);
          });
        }
        grid.innerHTML = items.map((b) => `
          <div class="op-card" onclick="openBlueprintCard('${escapeHtmlAttr(b.file)}','${escapeHtmlAttr(b.title)}','${escapeHtmlAttr(b.sourcePath)}','md',0,'','${escapeHtmlAttr(b.file)}')">
            <span class="op-icon">${blueprintIconFor(b.file || b.title)}</span>
            <div class="bp-title">${escapeHtmlAttr(b.title).toUpperCase()}</div>
            <div class="bp-file">${escapeHtmlAttr(b.file)}</div>
          </div>
        `).join("") || "<p>No matching oracle files.</p>";
      }

      function renderBooks() {
        const grid = document.getElementById("book-grid");
        if (!grid) return;
        grid.classList.add("book-split");
        let items = booksCatalog.slice();
        const learningRank = (b) => {
          const t = `${b.title || ""} ${b.file || ""}`.toLowerCase();
          if (/basics|hands-on introduction|kali-linux-revealed|introduction|guide/.test(t)) return 1;
          if (/web application hacker|tangled web|owasp|xss|sql injection|csrf|file upload|ssrf|web security testing/.test(t)) return 2;
          if (/bug bounty|hackerone|top 100 bugs|vulnerabilities|cheat sheet/.test(t)) return 3;
          if (/wireshark|wifi|wireless|shodan|network/.test(t)) return 4;
          if (/linux.*privilege|windows.*privilege|post-exploitation/.test(t)) return 5;
          if (/api|aws|azure|cloud/.test(t)) return 6;
          if (/android|mobile application/.test(t)) return 7;
          if (/black hat|gray hat|violent python|metasploit|red team|operator handbook/.test(t)) return 8;
          return 9;
        };
        items.sort((a, b) => {
          const r = learningRank(a) - learningRank(b);
          if (r !== 0) return r;
          return String(a.title || "").localeCompare(String(b.title || ""));
        });
        if (bookSearchQuery) {
          items = items.filter((b) => {
            const blob = `${b.title} ${b.file} ${b.sourcePath}`.toLowerCase();
            return blob.includes(bookSearchQuery);
          });
        }
        const sectionType = (b) => {
          const blob = `${b.path || ""} ${b.title || ""}`.toLowerCase();
          if (blob.includes("social hacking") || blob.includes("social")) return "social";
          return "digital";
        };
        const social = items.filter((b) => sectionType(b) === "social");
        const digital = items.filter((b) => sectionType(b) === "digital");
        const renderSection = (label, list, color) => `
          <div class="book-section">
            <div class="book-section-title" style="color:${color};">${label}</div>
            <div class="book-section-grid">
              ${list.map((b) => `
                <div class="book-card" onclick="openBlueprintCard('${escapeJsString(b.path || b.file)}','${escapeJsString(b.title)}','${escapeJsString(b.sourcePath)}','${escapeJsString(b.type || "")}',${Number.isFinite(Number(b.size)) ? Number(b.size) : 0},'${escapeJsString(b.modifiedAt || "")}','${escapeJsString(b.path || b.file)}')" title="${escapeHtmlAttr(b.path || b.file)}">
                  <span class="op-icon">${(b.type || "").toLowerCase() === "pdf" ? "📕" : ((b.type || "").toLowerCase() === "epub" ? "📗" : "📚")}</span>
                  <div class="book-title">${escapeHtmlAttr(b.title).toUpperCase()}</div>
                  <div class="book-meta">TRACK ${learningRank(b)}${b.bundled === false ? " · CATALOG" : ""}</div>
                  <div class="book-path">${escapeHtmlAttr(b.path || b.file)}</div>
                </div>
              `).join("") || "<p>No books in this section.</p>"}
            </div>
          </div>
        `;
        grid.innerHTML = items.length
          ? `${renderSection("SOCIAL", social, "var(--danger-red)")}${renderSection("DIGITAL", digital, "var(--term-green)")}`
          : "<p>No matching books.</p>";
      }

      function renderSwissknife() {
        const sel = document.getElementById("swissknife-session-select");
        const list = document.getElementById("swissknife-session-list");
        if (!sel || !list) return;
        const sessions = Array.isArray(swissknifeSessions) ? swissknifeSessions : [];
        if (!selectedSwissknifeSession && sessions.length) {
          selectedSwissknifeSession = String(sessions[0].id || "");
        }
        sel.innerHTML = sessions.map((s) => {
          const id = escapeHtmlAttr(s.id || "");
          const label = escapeHtmlAttr(s.label || "daily");
          const created = escapeHtmlAttr(s.created_at || "");
          return `<option value="${id}" ${String(s.id || "") === selectedSwissknifeSession ? "selected" : ""}>${label} :: ${id} (${created})</option>`;
        }).join("") || "<option value=''>No sessions</option>";
        list.innerHTML = sessions.map((s) => {
          const count = Array.isArray(s.downloads) ? s.downloads.length : 0;
          const rows = (Array.isArray(s.downloads) ? s.downloads : []).slice().reverse().map((d) => `
            <li>
              <code>${escapeHtmlAttr(d.downloaded_at || "")}</code> |
              <strong>${escapeHtmlAttr(d.shortcode || "N/A")}</strong> |
              ${escapeHtmlAttr(d.owner_username || "unknown")} |
              files: ${Number(d.file_count || 0)}
            </li>
          `).join("") || "<li>No downloads yet.</li>";
          return `
            <div class="intel-card" style="margin-bottom:10px;">
              <div style="display:flex; justify-content:space-between; gap:8px; align-items:center; flex-wrap:wrap;">
                <div><strong>${escapeHtmlAttr(s.label || "daily").toUpperCase()}</strong> - <code>${escapeHtmlAttr(s.id || "")}</code></div>
                <button class="x-btn" type="button" onclick="deleteSwissknifeSession('${escapeJsString(String(s.id || ""))}')">X</button>
              </div>
              <div style="font-size:0.82rem; color:var(--term-dim);">Remote dir: <code>${escapeHtmlAttr(s.remote_path || "")}</code></div>
              <div style="font-size:0.82rem; color:var(--term-dim);">Created: ${escapeHtmlAttr(s.created_at || "")} | Downloads: ${count}</div>
              <ul style="margin-top:6px;">${rows}</ul>
            </div>
          `;
        }).join("") || "<p>No sessions yet. Create one to begin.</p>";
        sel.onchange = () => {
          selectedSwissknifeSession = sel.value || "";
        };
      }

      async function deleteSwissknifeSession(sessionId) {
        const sid = String(sessionId || "").trim();
        if (!sid) return;
        if (!(await themedConfirm("Are you sure you want to delete this?"))) return;
        try {
          const res = await fetch("/api/swissknife/session", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: sid }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: "Failed to delete session." }));
            throw new Error(err.error || "Failed to delete session.");
          }
          await fetchData();
          themedNotice("Session history deleted.");
        } catch (e) {
          themedNotice("Delete session failed: " + e.message);
        }
      }

      async function createSwissknifeSession() {
        const labelEl = document.getElementById("swissknife-session-label");
        const label = (labelEl?.value || "").trim() || "daily";
        try {
          const res = await fetch("/api/swissknife/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ label }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: "Failed to create Swissknife session." }));
            throw new Error(err.error || "Failed to create Swissknife session.");
          }
          if (labelEl) labelEl.value = "";
          await fetchData();
          closeAllAddPopups();
          themedNotice("Swissknife session created.");
        } catch (e) {
          themedNotice("Create session failed: " + e.message);
        }
      }

      async function runSwissknifeDownload() {
        const sel = document.getElementById("swissknife-session-select");
        const urlEl = document.getElementById("swissknife-url");
        const loginEl = document.getElementById("swissknife-login");
        const sessionId = (sel?.value || selectedSwissknifeSession || "").trim();
        const url = (urlEl?.value || "").trim();
        const login = !!(loginEl && loginEl.checked);
        if (!sessionId) {
          themedNotice("Create/select a session first.");
          return;
        }
        if (!url) {
          themedNotice("Enter an Instagram URL.");
          return;
        }
        try {
          const res = await fetch("/api/swissknife/download", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: sessionId, url, login }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: "Swissknife download failed." }));
            throw new Error(err.error || "Swissknife download failed.");
          }
          if (urlEl) urlEl.value = "";
          await fetchData();
          closeAllAddPopups();
          themedNotice("Download complete and saved to session.");
        } catch (e) {
          themedNotice("Download failed: " + e.message);
        }
      }

      function renderManualMarkdown(md) {
        const normalizeManualText = (input) => {
          let text = String(input || "");
          const trimmed = text.trim();
          try {
            if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
              const parsed = JSON.parse(trimmed);
              if (typeof parsed === "string") text = parsed;
              else if (Array.isArray(parsed)) {
                text = parsed.map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join("\n");
              } else if (parsed && typeof parsed === "object") {
                if (typeof parsed.content === "string") text = parsed.content;
                else if (typeof parsed.text === "string") text = parsed.text;
                else if (typeof parsed.body === "string") text = parsed.body;
              }
            }
          } catch (_) {}
          const escapedNewlineCount = (text.match(/\\n/g) || []).length;
          const realNewlineCount = (text.match(/\n/g) || []).length;
          if (escapedNewlineCount > 6 && escapedNewlineCount > realNewlineCount) {
            text = text.replace(/\\n/g, "\n");
          }
          text = text.replace(/\\"/g, '"').replace(/\\t/g, "  ");
          return text;
        };

        const normalizedMd = normalizeManualText(md);
        const esc = (s) => s
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        const inline = (s) => esc(s)
          .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
          .replace(/`([^`]+)`/g, "<code>$1</code>");
        const colorizeContextLead = (htmlLine) => {
          const m = htmlLine.match(/^([A-Za-z][A-Za-z0-9 _/\-&()]{1,42}:)\s*/);
          if (!m) return htmlLine;
          const key = String(m[1] || "").toLowerCase();
          let cls = "ctx-key";
          if (/purpose|goal|intent|target|audience|setup|move/.test(key)) cls += " ctx-key-primary";
          else if (/status|phase|task|operation/.test(key)) cls += " ctx-key-status";
          else if (/risk|warning|threat|blocker/.test(key)) cls += " ctx-key-risk";
          else if (/result|discovery|adjustment|expectation|outcome|reality/.test(key)) cls += " ctx-key-result";
          return htmlLine.replace(/^([A-Za-z][A-Za-z0-9 _/\-&()]{1,42}:)\s*/, `<span class="${cls}">$1</span> `);
        };

        const lines = normalizedMd.replace(/\r\n/g, "\n").split("\n");
        let out = "";
        let inUl = false;
        let inOl = false;

        const closeLists = () => {
          if (inUl) { out += "</ul>"; inUl = false; }
          if (inOl) { out += "</ol>"; inOl = false; }
        };

        for (const raw of lines) {
          const line = raw.trimEnd();
          const t = line.trim();

          if (!t) {
            closeLists();
            continue;
          }
          if (/^---+$/.test(t)) {
            closeLists();
            out += "<hr />";
            continue;
          }
          if (t.startsWith("### ")) {
            closeLists();
            out += `<h3>${inline(t.slice(4))}</h3>`;
            continue;
          }
          if (t.startsWith("## ")) {
            closeLists();
            out += `<h2>${inline(t.slice(3))}</h2>`;
            continue;
          }
          if (t.startsWith("# ")) {
            closeLists();
            out += `<h1>${inline(t.slice(2))}</h1>`;
            continue;
          }
          if (t.startsWith("* ") || t.startsWith("- ")) {
            if (inOl) { out += "</ol>"; inOl = false; }
            if (!inUl) { out += "<ul>"; inUl = true; }
            out += `<li>${colorizeContextLead(inline(t.slice(2)))}</li>`;
            continue;
          }
          if (/^\d+\.\s+/.test(t)) {
            if (inUl) { out += "</ul>"; inUl = false; }
            if (!inOl) { out += "<ol>"; inOl = true; }
            out += `<li>${colorizeContextLead(inline(t.replace(/^\d+\.\s+/, "")))}</li>`;
            continue;
          }
          closeLists();
          out += `<p>${colorizeContextLead(inline(t))}</p>`;
        }
        closeLists();
        return out;
      }

      async function copyProbeSkill() {
        const el = document.getElementById("probe-skill-content");
        if (!el) return;
        const text = (el.innerText || el.textContent || "").trim();
        if (!text) {
          themedNotice("Probe Skill content is empty.");
          return;
        }
        try {
          if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
            await navigator.clipboard.writeText(text);
          } else {
            const ta = document.createElement("textarea");
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
          }
          themedNotice("Probe Skill copied.");
        } catch (e) {
          themedNotice("Copy failed: " + e.message);
        }
      }

      async function copyMissionBriefing() {
        const el = document.getElementById("mission-briefing-content");
        if (!el) return;
        const text = (el.innerText || el.textContent || "").trim();
        if (!text) {
          themedNotice("Mission Briefing content is empty.");
          return;
        }
        try {
          if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
            await navigator.clipboard.writeText(text);
          } else {
            const ta = document.createElement("textarea");
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
          }
          themedNotice("Mission Briefing copied.");
        } catch (e) {
          themedNotice("Copy failed: " + e.message);
        }
      }


      function routineStorageKey() {
        return "routineData:v2";
      }

      function createDefaultRoutineData() {
        const now = Date.now();
        return {
          morning: [
            { id: `rm_${now}_1`, title: "Eat", desc: "Fuel up before starting tasks.", done: false },
            { id: `rm_${now}_2`, title: "Shower", desc: "Reset body and wake up properly.", done: false },
            { id: `rm_${now}_3`, title: "Clean bedroom", desc: "Create a clear, distraction-free environment.", done: false },
            { id: `rm_${now}_4`, title: "Stretch", desc: "5-10 minutes mobility warm-up.", done: false },
            { id: `rm_${now}_5`, title: "Gym", desc: "Select a focus and build today's routine list.", done: false },
            { id: `rm_${now}_6`, title: "Cardio", desc: "Short conditioning block.", done: false },
          ],
          night: [
            { id: `rn_${now}_1`, title: "Dinner", desc: "Recovery meal and hydration.", done: false },
            { id: `rn_${now}_2`, title: "Shower", desc: "Night reset.", done: false },
            { id: `rn_${now}_3`, title: "Tidy bedroom", desc: "Keep next-day setup clean.", done: false },
            { id: `rn_${now}_4`, title: "Stretch", desc: "Light decompression stretch.", done: false },
            { id: `rn_${now}_5`, title: "Read", desc: "Low-noise wind-down learning block.", done: false },
            { id: `rn_${now}_6`, title: "Sleep prep", desc: "No screens, final shutdown, sleep.", done: false },
          ],
          catalog: {
            "Legs": [],
            "Check": [],
            "Back": [],
            "Core/Abs": [],
            "Accessories": [],
            "Boxing": [],
            "Cardio": [],
            "RAMP": [],
            "STRETCHES": [],
          },
          topCategories: ["GYM", "CARDIO", "COMBAT", "WARMUP"],
          topCategorySections: {
            "GYM": ["Legs", "Check", "Back", "Core/Abs", "Accessories"],
            "CARDIO": ["Cardio"],
            "COMBAT": ["Boxing"],
            "WARMUP": ["RAMP", "STRETCHES"],
          },
          selectedFocus: "",
          dayList: [],
          reminders: [],
          journal: [],
        };
      }

      function normalizeRoutineData(data) {
        const base = createDefaultRoutineData();
        const out = (data && typeof data === "object") ? data : {};
        if (!Array.isArray(out.morning)) out.morning = base.morning;
        if (!Array.isArray(out.night)) out.night = base.night;
        if (!out.catalog || typeof out.catalog !== "object") out.catalog = {};
        for (const section of Object.keys(base.catalog)) {
          if (!Array.isArray(out.catalog[section])) out.catalog[section] = [];
        }
        if (!Array.isArray(out.journal)) out.journal = [];
        if (!Array.isArray(out.dayList)) out.dayList = [];
        if (!Array.isArray(out.reminders)) out.reminders = [];
        if (!Array.isArray(out.topCategories) || !out.topCategories.length) out.topCategories = base.topCategories.slice();
        out.topCategories = out.topCategories
          .map((x) => String(x || "").trim().toUpperCase())
          .filter(Boolean);
        if (!out.topCategories.length) out.topCategories = base.topCategories.slice();
        if (!out.topCategorySections || typeof out.topCategorySections !== "object") {
          out.topCategorySections = JSON.parse(JSON.stringify(base.topCategorySections));
        }
        for (const top of out.topCategories) {
          if (!Array.isArray(out.topCategorySections[top])) out.topCategorySections[top] = [];
          out.topCategorySections[top] = out.topCategorySections[top]
            .map((x) => String(x || "").trim())
            .filter(Boolean);
        }
        if (!out.topCategories.includes("WARMUP")) out.topCategories.push("WARMUP");
        if (!Array.isArray(out.topCategorySections["WARMUP"])) out.topCategorySections["WARMUP"] = [];
        if (!out.topCategorySections["WARMUP"].includes("RAMP")) out.topCategorySections["WARMUP"].push("RAMP");
        if (!out.topCategorySections["WARMUP"].includes("STRETCHES")) out.topCategorySections["WARMUP"].push("STRETCHES");
        if (!Array.isArray(out.catalog["RAMP"])) out.catalog["RAMP"] = [];
        if (!Array.isArray(out.catalog["STRETCHES"])) out.catalog["STRETCHES"] = [];

        const normalizeDescChecks = (x, prefix, i) => {
          const fromArray = Array.isArray(x?.descChecks) ? x.descChecks : [];
          const fromText = String(x?.desc || "").split(/[\n;,]+/).map((s) => s.trim()).filter(Boolean);
          const base = fromArray.length ? fromArray : fromText.map((text) => ({ text, done: false }));
          return base.map((d, j) => ({
            id: String(d?.id || `${prefix}_dc_${Date.now()}_${i}_${j}`),
            text: String(d?.text || "").trim(),
            done: !!d?.done,
          })).filter((d) => d.text);
        };
        out.morning = out.morning.map((x, i) => ({
          id: String(x?.id || `rm_fix_${Date.now()}_${i}`),
          title: String(x?.title || "Task"),
          desc: String(x?.desc || ""),
          descChecks: normalizeDescChecks(x, "rm", i),
          done: !!x?.done,
        }));
        out.night = out.night.map((x, i) => ({
          id: String(x?.id || `rn_fix_${Date.now()}_${i}`),
          title: String(x?.title || "Task"),
          desc: String(x?.desc || ""),
          descChecks: normalizeDescChecks(x, "rn", i),
          done: !!x?.done,
        }));

        for (const section of Object.keys(out.catalog)) {
          out.catalog[section] = (Array.isArray(out.catalog[section]) ? out.catalog[section] : []).map((ex, i) => ({
            id: String(ex?.id || `gx_fix_${Date.now()}_${section}_${i}`),
            name: String(ex?.name || "Exercise"),
            desc: String(ex?.desc || ex?.note || ""),
            photo: String(ex?.photo || ""),
          }));
        }
        for (const [top, subs] of Object.entries(out.topCategorySections)) {
          if (!Array.isArray(subs)) continue;
          out.topCategorySections[top] = subs.filter(Boolean);
          for (const sub of subs) {
            if (!Array.isArray(out.catalog[sub])) out.catalog[sub] = [];
          }
        }
        const mappedSubs = new Set(
          Object.values(out.topCategorySections)
            .flatMap((arr) => (Array.isArray(arr) ? arr : []))
            .map((s) => String(s || ""))
        );
        const legacyTopForSection = (sectionName) => {
          const s = String(sectionName || "").toLowerCase();
          if (s === "cardio") return "CARDIO";
          if (s === "boxing" || s === "combat") return "COMBAT";
          return "GYM";
        };
        for (const section of Object.keys(out.catalog)) {
          if (mappedSubs.has(section)) continue;
          const top = legacyTopForSection(section);
          if (!out.topCategories.includes(top)) out.topCategories.push(top);
          if (!Array.isArray(out.topCategorySections[top])) out.topCategorySections[top] = [];
          if (!out.topCategorySections[top].includes(section)) out.topCategorySections[top].push(section);
        }

        // One-time migration from legacy structures into catalog.
        if (!out._catalogMigratedV1) {
          if (Array.isArray(out.routines)) {
            for (const r of out.routines) {
              const sec = String(r?.name || "").trim() || "Accessories";
              if (!Array.isArray(out.catalog[sec])) out.catalog[sec] = [];
              const rows = Array.isArray(r?.exercises) ? r.exercises : [];
              for (const ex of rows) {
                out.catalog[sec].push({
                  id: `gx_m_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
                  name: String(ex?.name || "Exercise"),
                  desc: String(ex?.note || ex?.desc || ""),
                  photo: String(ex?.photo || ""),
                });
              }
            }
          }
          for (const m of [{ key: "boxing", section: "Boxing" }, { key: "cardio", section: "Cardio" }]) {
            const rows = Array.isArray(out[m.key]) ? out[m.key] : [];
            for (const ex of rows) {
              out.catalog[m.section].push({
                id: `gx_m_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
                name: String(ex?.title || ex?.name || m.section),
                desc: String(ex?.desc || ex?.note || ""),
                photo: String(ex?.photo || ""),
              });
            }
          }
          out._catalogMigratedV1 = true;
          out.routines = [];
          out.boxing = [];
          out.cardio = [];
        }

        out.dayList = out.dayList.map((x, i) => ({
          id: String(x?.id || `gd_fix_${Date.now()}_${i}`),
          section: String(x?.section || "Accessories"),
          exId: String(x?.exId || ""),
          name: String(x?.name || "Exercise"),
          desc: String(x?.desc || ""),
          photo: String(x?.photo || ""),
          done: !!x?.done,
        }));
        out.journal = out.journal.map((j, i) => ({
          id: String(j?.id || `jr_fix_${Date.now()}_${i}`),
          at: String(j?.at || new Date().toISOString()),
          title: String(j?.title || "Entry"),
          desc: String(j?.desc || ""),
          photo: String(j?.photo || ""),
          link: String(j?.link || ""),
        }));
        out.reminders = out.reminders.map((r, i) => ({
          id: String(r?.id || `rrm_fix_${Date.now()}_${i}`),
          when: String(r?.when || new Date().toISOString()),
          title: String(r?.title || "Upcoming"),
          desc: String(r?.desc || ""),
          notifyOffsets: Array.isArray(r?.notifyOffsets)
            ? r.notifyOffsets.map((x) => Number(x)).filter((x) => Number.isFinite(x) && x >= 0)
            : [0],
        }));
        out.selectedFocus = String(out.selectedFocus || "");
        return out;
      }

      function saveRoutineData() {
        localStorage.setItem(routineStorageKey(), JSON.stringify(routineData));
      }

      function loadRoutineData() {
        try {
          let raw = localStorage.getItem(routineStorageKey());
          if (!raw) raw = localStorage.getItem("routineData:v1");
          const parsed = raw ? JSON.parse(raw) : createDefaultRoutineData();
          routineData = normalizeRoutineData(parsed);
        } catch (e) {
          routineData = normalizeRoutineData(createDefaultRoutineData());
        }
        saveRoutineData();
        renderRoutines();
      }

      function renderRoutineList(period) {
        const listEl = document.getElementById(`${period}-routine-list`);
        if (!listEl || !routineData) return;
        const items = Array.isArray(routineData[period]) ? routineData[period] : [];
        listEl.innerHTML = items.map((item, idx) => {
          const rawChecks = Array.isArray(item.descChecks) ? item.descChecks : [];
          const checks = rawChecks.filter((d) => String(d?.text || "").trim().length > 0).slice(0, 1);
          return `
          <li class="routine-item ${item.done ? "done" : ""}"
              draggable="true"
              ondragstart="onRoutineTaskDragStart('${period}',${idx},event)"
              ondragover="onRoutineTaskDragOver(event)"
              ondragleave="onRoutineTaskDragLeave(event)"
              ondrop="onRoutineTaskDrop('${period}',${idx},event)">
            <div class="routine-item-copy">
              <span class="routine-item-title routine-inline-editable"
                    onclick="onRoutineTitleClick('${period}','${escapeHtmlAttr(item.id)}', event)"
                    ondblclick="onRoutineTitleDblClick('${period}','${escapeHtmlAttr(item.id)}', event, this)"
              >${escapeHtmlAttr(item.title)}</span>
              <ul class="routine-subcheck-list">
                ${checks.map((d, dIdx) => `
                  <li class="routine-subcheck-item ${d.done ? "done" : ""}"
                      draggable="true"
                      ondragstart="onRoutineDescDragStart('${period}','${escapeHtmlAttr(item.id)}',${dIdx},event)"
                      ondragover="onRoutineDescDragOver(event)"
                      ondragleave="onRoutineDescDragLeave(event)"
                      ondrop="onRoutineDescDrop('${period}','${escapeHtmlAttr(item.id)}',${dIdx},event)">
                    <span class="routine-subcheck-title routine-inline-editable"
                          onclick="onRoutineSubcheckClick('${period}','${escapeHtmlAttr(item.id)}','${escapeHtmlAttr(d.id)}', event)"
                          ondblclick="onRoutineSubcheckDblClick('${period}','${escapeHtmlAttr(item.id)}','${escapeHtmlAttr(d.id)}', event, this)"
                    >${escapeHtmlAttr(d.text)}</span>
                  </li>
                `).join("")}
              </ul>
            </div>
          </li>
        `;
        }).join("") || `<li class="routine-item"><div class="routine-item-copy"><span class="routine-item-desc">No tasks yet.</span></div></li>`;
      }

      function renderRoutines() {
        renderRoutineList("morning");
        renderRoutineList("night");
      }

      function setRoutineClickTimer(key, fn) {
        clearRoutineClickTimer(key);
        routineClickTimers[key] = setTimeout(() => {
          delete routineClickTimers[key];
          fn();
        }, 220);
      }

      function clearRoutineClickTimer(key) {
        const t = routineClickTimers[key];
        if (t) {
          clearTimeout(t);
          delete routineClickTimers[key];
        }
      }

      function onRoutineTitleClick(period, id, event) {
        if (event && typeof event.stopPropagation === "function") event.stopPropagation();
        setRoutineClickTimer(`title:${period}:${id}`, () => toggleRoutineTask(period, id));
      }

      function onRoutineTitleDblClick(period, id, event, el) {
        if (event && typeof event.stopPropagation === "function") event.stopPropagation();
        clearRoutineClickTimer(`title:${period}:${id}`);
        beginRoutineInlineEdit(el, (next) => saveRoutineInlineTaskField(period, id, "title", { textContent: next }));
      }

      function onRoutineDescDblClick(period, id, event, el) {
        if (event && typeof event.stopPropagation === "function") event.stopPropagation();
        beginRoutineInlineEdit(el, (next) => saveRoutineInlineTaskField(period, id, "desc", { textContent: next }));
      }

      function onRoutineSubcheckClick(period, taskId, checkId, event) {
        if (event && typeof event.stopPropagation === "function") event.stopPropagation();
        setRoutineClickTimer(`sub:${period}:${taskId}:${checkId}`, () => toggleRoutineDescCheck(period, taskId, checkId));
      }

      function onRoutineSubcheckDblClick(period, taskId, checkId, event, el) {
        if (event && typeof event.stopPropagation === "function") event.stopPropagation();
        clearRoutineClickTimer(`sub:${period}:${taskId}:${checkId}`);
        beginRoutineInlineEdit(el, (next) => saveRoutineInlineSubcheck(period, taskId, checkId, { textContent: next }));
      }

      function beginRoutineInlineEdit(el, onCommit) {
        if (!el) return;
        const original = String(el.textContent || "");
        el.setAttribute("contenteditable", "true");
        el.focus();
        document.execCommand && document.execCommand("selectAll", false, null);
        const finish = (commit) => {
          el.removeEventListener("keydown", onKeydown);
          el.removeEventListener("blur", onBlur);
          el.removeAttribute("contenteditable");
          if (!commit) {
            el.textContent = original;
            return;
          }
          const next = String((el.textContent || "").replace(/\s+/g, " ")).trim();
          if (!next) {
            el.textContent = original;
            return;
          }
          onCommit(next);
          el.textContent = next;
        };
        const onKeydown = (e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            finish(true);
            return;
          }
          if (e.key === "Escape") {
            e.preventDefault();
            finish(false);
          }
        };
        const onBlur = () => finish(true);
        el.addEventListener("keydown", onKeydown);
        el.addEventListener("blur", onBlur);
      }

      function onRoutineTaskDragStart(period, index, event) {
        routineTaskDrag = { period: String(period || ""), fromIndex: Number(index) };
        if (event && event.dataTransfer) {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", String(index));
        }
      }

      function onRoutineTaskDragOver(event) {
        if (!event) return;
        event.preventDefault();
        const row = event.currentTarget;
        if (row && row.classList) row.classList.add("drag-over");
      }

      function onRoutineTaskDragLeave(event) {
        const row = event && event.currentTarget;
        if (row && row.classList) row.classList.remove("drag-over");
      }

      function onRoutineTaskDrop(period, toIndex, event) {
        if (!event) return;
        event.preventDefault();
        const row = event.currentTarget;
        if (row && row.classList) row.classList.remove("drag-over");
        if (!routineData) return;
        const state = routineTaskDrag || {};
        routineTaskDrag = { period: "", fromIndex: -1 };
        if (String(state.period || "") !== String(period || "")) return;
        const fromIndex = Number(state.fromIndex);
        const target = Number(toIndex);
        const list = Array.isArray(routineData[period]) ? routineData[period] : [];
        if (!Number.isInteger(fromIndex) || !Number.isInteger(target)) return;
        if (fromIndex < 0 || fromIndex >= list.length || target < 0 || target >= list.length || fromIndex === target) return;
        const [moved] = list.splice(fromIndex, 1);
        list.splice(target, 0, moved);
        saveRoutineData();
        renderRoutines();
      }

      function gymTopCategories() {
        if (!routineData || !Array.isArray(routineData.topCategories) || !routineData.topCategories.length) {
          return ["GYM", "CARDIO", "COMBAT"];
        }
        return routineData.topCategories;
      }

      function getTopCategorySections(top) {
        if (!routineData) return [];
        if (!routineData.topCategorySections || typeof routineData.topCategorySections !== "object") {
          routineData.topCategorySections = {};
        }
        if (!Array.isArray(routineData.topCategorySections[top])) {
          routineData.topCategorySections[top] = [];
        }
        return routineData.topCategorySections[top];
      }

      function sectionToTop(section) {
        const raw = String(section || "").trim();
        if (!raw) return "GYM";
        for (const top of gymTopCategories()) {
          const sections = getTopCategorySections(top);
          if (sections.includes(raw)) return top;
        }
        return "GYM";
      }

      function addGymCategory() {
        if (!routineData) return;
        const input = document.getElementById("gym-new-category-input");
        const raw = String(input?.value || "").trim();
        if (!raw) return;
        const cat = raw.toUpperCase();
        routineData.topCategories = Array.isArray(routineData.topCategories) ? routineData.topCategories : [];
        if (routineData.topCategories.includes(cat)) {
          themedNotice("Category already exists.");
          return;
        }
        routineData.topCategories.push(cat);
        if (!routineData.topCategorySections || typeof routineData.topCategorySections !== "object") {
          routineData.topCategorySections = {};
        }
        routineData.topCategorySections[cat] = [];
        if (input) input.value = "";
        saveRoutineData();
        closeAllAddPopups();
        renderGymPlanner();
      }

      async function deleteGymCategory(top) {
        if (!routineData || !top) return;
        const ok = await themedConfirm(`Delete category ${top} and all its subcategories/exercises?`);
        if (!ok) return;
        const sections = getTopCategorySections(top);
        for (const sec of sections) {
          delete routineData.catalog[sec];
        }
        routineData.topCategories = gymTopCategories().filter((x) => x !== top);
        if (routineData.topCategorySections && typeof routineData.topCategorySections === "object") {
          delete routineData.topCategorySections[top];
        }
        if (gymCurrentCategory === top) {
          gymCurrentCategory = "";
          gymCurrentSubcategory = "";
        }
        saveRoutineData();
        renderGymPlanner();
      }

      function onGymCategoryInputKey(event) {
        if (!event) return;
        if (event.key === "Enter") {
          event.preventDefault();
          addGymCategory();
        }
      }

      function sectionsForTop(top) {
        if (!routineData || !routineData.catalog || !top) return [];
        const mapped = getTopCategorySections(top).slice();
        return mapped.filter((s) => Array.isArray(routineData.catalog[s]));
      }

      function addGymSubcategory() {
        if (!routineData || !gymCurrentCategory) return;
        const input = document.getElementById("gym-new-subcategory-input");
        const raw = String(input?.value || "").trim();
        if (!raw) return;
        const subs = getTopCategorySections(gymCurrentCategory);
        if (subs.includes(raw)) {
          themedNotice("Subcategory already exists.");
          return;
        }
        subs.push(raw);
        if (!Array.isArray(routineData.catalog[raw])) routineData.catalog[raw] = [];
        if (input) input.value = "";
        saveRoutineData();
        closeAllAddPopups();
        renderGymPlanner();
      }

      function onGymSubcategoryInputKey(event) {
        if (!event) return;
        if (event.key === "Enter") {
          event.preventDefault();
          addGymSubcategory();
        }
      }

      function selectGymSubcategory(sub) {
        gymCurrentSubcategory = String(sub || "");
        renderGymPlanner();
      }

      async function deleteCurrentGymSubcategory() {
        if (!routineData || !gymCurrentCategory) return;
        if (!gymCurrentSubcategory) {
          themedNotice("Select a subcategory first.");
          return;
        }
        await deleteGymSubcategory(gymCurrentSubcategory);
      }

      async function deleteGymSubcategory(subArg) {
        if (!routineData || !gymCurrentCategory) return;
        const sub = String(subArg || "").trim();
        if (!sub) return;
        const ok = await themedConfirm(`Delete subcategory ${sub} and all exercises inside it?`);
        if (!ok) return;
        routineData.topCategorySections[gymCurrentCategory] = getTopCategorySections(gymCurrentCategory).filter((s) => s !== sub);
        delete routineData.catalog[sub];
        if (gymCurrentSubcategory === sub) gymCurrentSubcategory = "";
        saveRoutineData();
        renderGymPlanner();
      }

      function exercisesForTop(top, onlySubcategory = "") {
        if (!routineData || !routineData.catalog) return [];
        const out = [];
        for (const s of sectionsForTop(top)) {
          if (onlySubcategory && s !== onlySubcategory) continue;
          for (const ex of (routineData.catalog[s] || [])) {
            out.push({
              section: s,
              id: ex.id,
              name: ex.name,
              desc: ex.desc || "",
              photo: ex.photo || "",
            });
          }
        }
        return out;
      }

      function openGymCategory(top) {
        gymCurrentCategory = top;
        gymCurrentSubcategory = "";
        gymSelectedExerciseKeys = new Set();
        gymLastSelectedIndex = -1;
        renderGymPlanner();
      }

      function backGymLevel() {
        if (gymCurrentSubcategory) {
          gymCurrentSubcategory = "";
          renderGymPlanner();
          return;
        }
        backGymCategory();
      }

      function backGymCategory() {
        gymCurrentCategory = "";
        gymCurrentSubcategory = "";
        gymSelectedExerciseKeys = new Set();
        gymLastSelectedIndex = -1;
        renderGymPlanner();
      }

      function gymRowKey(section, exId, idx) {
        const sec = String(section || "");
        const id = String(exId || "");
        if (id) return `${sec}::${id}`;
        return `${sec}::__idx_${Number(idx)}`;
      }

      function onGymRowClick(event, category, idx, section, exId) {
        const i = Number(idx);
        const key = gymRowKey(section, exId, i);
        const multi = !!(event && (event.metaKey || event.ctrlKey || event.shiftKey));
        if (multi) {
          if (event && typeof event.preventDefault === "function") event.preventDefault();
          if (event && typeof event.stopPropagation === "function") event.stopPropagation();
          const rows = exercisesForTop(gymCurrentCategory, gymCurrentSubcategory);
          if (event && event.shiftKey && Number.isInteger(gymLastSelectedIndex) && gymLastSelectedIndex >= 0) {
            const start = Math.min(gymLastSelectedIndex, i);
            const end = Math.max(gymLastSelectedIndex, i);
            for (let n = start; n <= end; n += 1) {
              const ex = rows[n];
              if (!ex) continue;
              gymSelectedExerciseKeys.add(gymRowKey(ex.section, ex.id, n));
            }
          } else {
            if (gymSelectedExerciseKeys.has(key)) gymSelectedExerciseKeys.delete(key);
            else gymSelectedExerciseKeys.add(key);
            gymLastSelectedIndex = i;
          }
          renderGymPlanner();
          return;
        }
        openExerciseViewer(category, i);
      }

      async function deleteSelectedGymExercises() {
        if (!routineData) return;
        const rows = exercisesForTop(gymCurrentCategory, gymCurrentSubcategory);
        const selected = rows
          .map((ex, idx) => ({ ex, idx, key: gymRowKey(ex.section, ex.id, idx) }))
          .filter((r) => gymSelectedExerciseKeys.has(r.key));
        if (!selected.length) return;
        const ok = await themedConfirm(`Delete ${selected.length} selected exercise(s)?`);
        if (!ok) return;
        selected.forEach(({ ex, idx }) => deleteCatalogExercise(ex.section, ex.id, idx, false, false));
        saveRoutineData();
        gymSelectedExerciseKeys = new Set();
        gymLastSelectedIndex = -1;
        renderGymPlanner();
      }

      async function editCatalogExerciseDesc(section, exId) {
        if (!routineData) return;
        const row = (routineData.catalog[section] || []).find((x) => x.id === exId);
        if (!row) return;
        const next = await themedPrompt("Edit description", row.desc || "");
        if (next === null) return;
        row.desc = String(next).trim();
        saveRoutineData();
        renderGymPlanner();
      }

      async function swapCatalogExercisePhoto(section, exId) {
        if (!routineData) return;
        const row = (routineData.catalog[section] || []).find((x) => x.id === exId);
        if (!row) return;
        const next = await themedPrompt("Swap photo URL (leave blank to clear)", row.photo || "");
        if (next === null) return;
        row.photo = String(next).trim();
        saveRoutineData();
        renderGymPlanner();
      }

      async function setExercisePhotoFromFile(section, exId, file) {
        if (!routineData || !file) return;
        const row = (routineData.catalog[section] || []).find((x) => x.id === exId);
        if (!row) return;
        try {
          row.photo = await readFileAsDataUrl(file);
          saveRoutineData();
          renderGymPlanner();
          renderExerciseViewer();
        } catch (e) {
          themedNotice("Photo upload failed.");
        }
      }

      function onCatalogActionClick(event, action, section, exId, rowIndex) {
        if (event) {
          if (typeof event.preventDefault === "function") event.preventDefault();
          if (typeof event.stopPropagation === "function") event.stopPropagation();
          if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
        }
        const sec = String(section || "");
        const id = String(exId || "");
        const idx = Number(rowIndex);
        if (!sec) return;
        if (action === "edit") {
          if (!id) return;
          editCatalogExerciseDesc(sec, id);
          return;
        }
        if (action === "photo") {
          if (!id) return;
          swapCatalogExercisePhoto(sec, id);
          return;
        }
        if (action === "delete") {
          deleteCatalogExercise(sec, id, idx);
        }
      }

      function deleteGymExerciseFromButton(btn, event) {
        if (event) {
          if (typeof event.preventDefault === "function") event.preventDefault();
          if (typeof event.stopPropagation === "function") event.stopPropagation();
          if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
        }
        const sec = String(btn?.getAttribute("data-section") || "");
        const id = String(btn?.getAttribute("data-id") || "");
        const idx = Number(btn?.getAttribute("data-idx"));
        if (!sec) return;
        deleteCatalogExercise(sec, id, idx);
      }

      async function deleteCatalogExercise(section, exId, rowIndex, rerender = true, askConfirm = true) {
        if (askConfirm) {
          const ok = await themedConfirm("Are you sure you want to delete this?");
          if (!ok) return;
        }
        if (!routineData) return;
        const list = Array.isArray(routineData.catalog[section]) ? routineData.catalog[section] : [];
        const before = list.length;
        let next = list;
        if (exId) {
          next = list.filter((x) => String(x?.id || "") !== String(exId));
        }
        if (next.length === before && Number.isInteger(rowIndex) && rowIndex >= 0 && rowIndex < list.length) {
          next = list.slice();
          next.splice(rowIndex, 1);
        }
        routineData.catalog[section] = next;
        if (rerender) {
          saveRoutineData();
          renderGymPlanner();
        }
      }

      async function editCurrentExerciseFromViewer() {
        const rows = exercisesForTop(gymViewerCategory, gymViewerSubcategory);
        if (!rows.length) return;
        if (gymViewerIndex < 0) gymViewerIndex = rows.length - 1;
        if (gymViewerIndex >= rows.length) gymViewerIndex = 0;
        const ex = rows[gymViewerIndex];
        if (!ex) return;
        await editCatalogExerciseDesc(ex.section, ex.id);
        renderExerciseViewer();
      }

      async function changeCurrentExercisePhotoFromViewer() {
        const rows = exercisesForTop(gymViewerCategory, gymViewerSubcategory);
        if (!rows.length) return;
        if (gymViewerIndex < 0) gymViewerIndex = rows.length - 1;
        if (gymViewerIndex >= rows.length) gymViewerIndex = 0;
        const ex = rows[gymViewerIndex];
        if (!ex) return;
        await swapCatalogExercisePhoto(ex.section, ex.id);
        renderExerciseViewer();
      }

      function openExerciseViewer(category, index) {
        gymViewerCategory = category;
        gymViewerSubcategory = gymCurrentSubcategory || "";
        gymViewerIndex = Math.max(0, index);
        const overlay = document.getElementById("exercise-overlay");
        if (!overlay) return;
        overlay.classList.add("active");
        overlay.setAttribute("aria-hidden", "false");
        renderExerciseViewer();
      }

      function closeExerciseViewer() {
        const overlay = document.getElementById("exercise-overlay");
        if (!overlay) return;
        overlay.classList.remove("active");
        overlay.setAttribute("aria-hidden", "true");
      }

      function renderExerciseViewer() {
        const host = document.getElementById("exercise-main");
        const title = document.getElementById("exercise-title");
        if (!host || !title) return;
        const rows = exercisesForTop(gymViewerCategory, gymViewerSubcategory);
        if (!rows.length) {
          host.innerHTML = `<div class="gym-card-desc">No exercises in this category.</div>`;
          title.textContent = `// ${gymViewerCategory || "EXERCISE"} VIEWER`;
          return;
        }
        if (gymViewerIndex < 0) gymViewerIndex = rows.length - 1;
        if (gymViewerIndex >= rows.length) gymViewerIndex = 0;
        const ex = rows[gymViewerIndex];
        title.textContent = `// ${gymViewerCategory} :: ${ex.name} (${gymViewerIndex + 1}/${rows.length})`;
        host.innerHTML = `
          <div id="exercise-photo-dropzone" class="exercise-media-col" title="Drop image, or click Choose File">
            ${ex.photo
              ? `<img id="exercise-photo-click" class="exercise-profile-photo" src="${escapeHtmlAttr(ex.photo)}" alt="${escapeHtmlAttr(ex.name)}" title="Click to change photo" />`
              : `<div id="exercise-photo-click" class="exercise-photo-empty" title="Click to add photo">No Photo</div>`}
            <div class="exercise-photo-tools">
              <input id="exercise-photo-file" class="search-input" type="file" accept="image/*" />
              <div class="routine-ex-note">Drop image or choose file</div>
            </div>
          </div>
          <div id="exercise-details-click" class="exercise-details exercise-summary" style="margin-top:2px;" title="Double-click to edit text">
            <div class="gym-list-sec exercise-section-title">${escapeHtmlAttr(ex.section)}</div>
            <div class="gym-card-name exercise-main-title">${escapeHtmlAttr(ex.name)}</div>
            <div class="routine-ex-note exercise-subtitle">Double-click title/body to edit</div>
          </div>
          <div id="exercise-desc-click" class="exercise-body-text" title="Double-click to edit description">
            ${escapeHtmlAttr(ex.desc || "")}
          </div>
        `;
        const photoClickEl = document.getElementById("exercise-photo-click");
        if (photoClickEl) photoClickEl.onclick = () => changeCurrentExercisePhotoFromViewer();
        const photoFileEl = document.getElementById("exercise-photo-file");
        if (photoFileEl) {
          photoFileEl.addEventListener("change", async () => {
            const f = photoFileEl.files && photoFileEl.files[0];
            if (!f) return;
            await setExercisePhotoFromFile(ex.section, ex.id, f);
            photoFileEl.value = "";
          });
        }
        const photoDropzone = document.getElementById("exercise-photo-dropzone");
        if (photoDropzone) {
          photoDropzone.addEventListener("dragover", (e) => {
            e.preventDefault();
            photoDropzone.classList.add("drag-over");
          });
          photoDropzone.addEventListener("dragleave", () => photoDropzone.classList.remove("drag-over"));
          photoDropzone.addEventListener("drop", async (e) => {
            e.preventDefault();
            photoDropzone.classList.remove("drag-over");
            const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
            if (!f) return;
            await setExercisePhotoFromFile(ex.section, ex.id, f);
          });
        }
        const detailsClickEl = document.getElementById("exercise-details-click");
        if (detailsClickEl) detailsClickEl.ondblclick = () => editCurrentExerciseFromViewer();
        const descClickEl = document.getElementById("exercise-desc-click");
        if (descClickEl) descClickEl.ondblclick = () => editCurrentExerciseFromViewer();
        host.ontouchstart = (e) => {
          const t = e && e.touches && e.touches[0];
          gymTouchStartX = t ? t.clientX : 0;
        };
        host.ontouchend = (e) => {
          const t = e && e.changedTouches && e.changedTouches[0];
          const endX = t ? t.clientX : 0;
          const dx = endX - gymTouchStartX;
          if (Math.abs(dx) < 40) return;
          if (dx < 0) nextExercise(); else prevExercise();
        };
      }

      function prevExercise() {
        gymViewerIndex -= 1;
        renderExerciseViewer();
      }

      function nextExercise() {
        gymViewerIndex += 1;
        renderExerciseViewer();
      }

      function renderGymPlanner() {
        if (!routineData) return;
        const home = document.getElementById("gym-category-home");
        const view = document.getElementById("gym-category-view");
        const topAddLaunch = document.getElementById("gym-top-add-launch");
        const subPage = document.getElementById("gym-subcategory-page");
        const exPage = document.getElementById("gym-exercise-page");
        const title = document.getElementById("gym-category-title");
        const list = document.getElementById("gym-list");
        const subGrid = document.getElementById("gym-subcategory-grid");
        if (!home || !view || !subPage || !exPage || !title || !list || !subGrid) return;

        if (!gymCurrentCategory) {
          if (topAddLaunch) topAddLaunch.style.display = "flex";
          home.style.display = "grid";
          view.style.display = "none";
          home.innerHTML = gymTopCategories().map((c) => {
            const count = exercisesForTop(c).length;
            return `
              <div class="op-card gym-category-card" onclick="openGymCategory('${escapeJsString(c)}')">
                <button class="op-delete-btn" type="button" onclick="event.stopPropagation(); deleteGymCategory('${escapeJsString(c)}')" title="Delete Category">X</button>
                <span class="op-icon">🏋</span>
                ${escapeHtmlAttr(c)}
                <div style="color:var(--term-dim); font-size:0.78rem; margin-top:4px;">${count} exercises</div>
              </div>
            `;
          }).join("");
          return;
        }

        if (topAddLaunch) topAddLaunch.style.display = "none";
        home.style.display = "none";
        view.style.display = "block";
        const sections = sectionsForTop(gymCurrentCategory);
        if (!gymCurrentSubcategory) {
          title.textContent = `// ${gymCurrentCategory} / SUBCATEGORIES`;
          subPage.style.display = "block";
          exPage.style.display = "none";
          subGrid.innerHTML = sections.map((s) => {
            const count = (routineData.catalog[s] || []).length;
            return `
              <div class="op-card gym-category-card" onclick="selectGymSubcategory('${escapeJsString(s)}')">
                <button class="op-delete-btn" type="button" onclick="event.stopPropagation(); deleteGymSubcategory('${escapeJsString(s)}')" title="Delete Subcategory">X</button>
                <span class="op-icon">📂</span>
                ${escapeHtmlAttr(s)}
                <div style="color:var(--term-dim); font-size:0.78rem; margin-top:4px;">${count} exercises</div>
              </div>
            `;
          }).join("") || `<div class="hvi-card">No subcategories yet.</div>`;
          return;
        }

        if (gymCurrentSubcategory && !sections.includes(gymCurrentSubcategory)) {
          gymCurrentSubcategory = "";
          renderGymPlanner();
          return;
        }

        title.textContent = `// ${gymCurrentCategory} / ${gymCurrentSubcategory}`;
        subPage.style.display = "none";
        exPage.style.display = "block";

        const rows = exercisesForTop(gymCurrentCategory, gymCurrentSubcategory);
        list.innerHTML = `
          ${rows.map((ex, idx) => {
            const selected = gymSelectedExerciseKeys.has(gymRowKey(ex.section, ex.id, idx));
            return `
          <div class="gym-list-row ${selected ? "selected" : ""}" onclick="onGymRowClick(event,'${escapeJsString(gymCurrentCategory)}',${idx},'${escapeJsString(ex.section)}','${escapeJsString(ex.id)}')" ondblclick="openExerciseViewer('${escapeJsString(gymCurrentCategory)}', ${idx})">
            <div class="gym-list-sec">${escapeHtmlAttr(ex.section)}</div>
            <div>
              <div class="gym-card-name">${escapeHtmlAttr(ex.name)}</div>
              <div class="gym-card-desc">${escapeHtmlAttr(ex.desc || "")}</div>
            </div>
            <div class="gym-list-actions">
              <button
                class="x-btn routine-mini-btn"
                type="button"
                data-section="${escapeHtmlAttr(ex.section)}"
                data-id="${escapeHtmlAttr(ex.id)}"
                data-idx="${idx}"
                onclick="deleteGymExerciseFromButton(this, event)"
              >X</button>
            </div>
          </div>
        `;
          }).join("") || `<div class="gym-list-row"><div class="gym-card-desc">No exercises yet in ${gymCurrentSubcategory}.</div></div>`}
        `;
      }

      async function readFileAsDataUrl(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ""));
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      async function addCatalogExerciseFromForm() {
        if (!routineData) return;
        const sectionEl = document.getElementById("gym-add-section");
        const nameEl = document.getElementById("gym-add-name");
        const descEl = document.getElementById("gym-add-desc");
        const photoUrlEl = document.getElementById("gym-add-photo-url");
        const photoFileEl = document.getElementById("gym-add-photo-file");
        const section = String(sectionEl?.value || "").trim();
        const name = String(nameEl?.value || "").trim();
        const desc = String(descEl?.value || "").trim();
        if (!gymCurrentCategory) {
          themedNotice("Open a category first.");
          return;
        }
        if (!section || !name) return;
        let photo = String(photoUrlEl?.value || "").trim();
        if (photoFileEl && photoFileEl.files && photoFileEl.files[0]) {
          try {
            photo = await readFileAsDataUrl(photoFileEl.files[0]);
          } catch (e) {
            themedNotice("Photo upload failed.");
            return;
          }
        }
        if (!Array.isArray(routineData.catalog[section])) routineData.catalog[section] = [];
        routineData.catalog[section].push({
          id: `gx_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
          name,
          desc,
          photo,
        });
        if (nameEl) nameEl.value = "";
        if (descEl) descEl.value = "";
        if (photoUrlEl) photoUrlEl.value = "";
        if (photoFileEl) photoFileEl.value = "";
        saveRoutineData();
        closeAllAddPopups();
        renderGymPlanner();
      }

      function addBlankGymExercise() {
        if (!routineData || !gymCurrentCategory || !gymCurrentSubcategory) return;
        const section = String(gymCurrentSubcategory || "").trim();
        if (!section) return;
        if (!Array.isArray(routineData.catalog[section])) routineData.catalog[section] = [];
        routineData.catalog[section].push({
          id: `gx_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
          name: "NEW EXERCISE",
          desc: "Tap to edit details",
          photo: "",
        });
        saveRoutineData();
        renderGymPlanner();
      }

      function tutorProgressKey() {
        return "omni:tutor:progress:v1";
      }

      function getTutorCatalog() {
        return [
          {
            id: "python",
            name: "Python Foundations",
            desc: "Syntax, functions, files, and building small offline tools.",
            lessons: [
              {
                id: "py-basics",
                title: "Python Basics + Variables",
                level: "Beginner",
                overview: "Understand variables, data types, loops, and functions.",
                objectives: [
                  "Use strings, numbers, lists, and dictionaries.",
                  "Write loops and conditions correctly.",
                  "Build a simple function and call it.",
                ],
                lab: {
                  mode: "python",
                  code: "tasks = ['learn vars', 'write loop', 'run function']\nfor i, t in enumerate(tasks, start=1):\n    print(f'{i}. {t}')\n\ndef score(done, total):\n    return round((done/total) * 100, 1)\n\nprint('Progress:', score(2, 3), '%')",
                },
                quiz: [
                  { q: "Which type stores key/value pairs?", options: ["list", "dict", "tuple"], answer: 1 },
                  { q: "Which keyword defines a function?", options: ["fn", "function", "def"], answer: 2 },
                ],
              },
              {
                id: "py-files",
                title: "Python Files + Automation",
                level: "Beginner",
                overview: "Read, write, and parse simple local files.",
                objectives: [
                  "Write a `.txt` log safely.",
                  "Read data and transform it into structured output.",
                  "Understand safe local automation patterns.",
                ],
                lab: {
                  mode: "python",
                  code: "import json\nentries = [{'task':'scan notes','done':True},{'task':'draft script','done':False}]\nprint(json.dumps(entries, indent=2))",
                },
                quiz: [
                  { q: "What mode writes a new file in Python?", options: ["'r'", "'w'", "'x'"], answer: 1 },
                  { q: "What does `json.dumps` return?", options: ["dict", "string", "file"], answer: 1 },
                ],
              },
            ],
          },
          {
            id: "bash",
            name: "Bash + CLI",
            desc: "Terminal fluency for local workflows and automation.",
            lessons: [
              {
                id: "bash-nav",
                title: "CLI Navigation + Files",
                level: "Beginner",
                overview: "Move through directories and inspect files confidently.",
                objectives: [
                  "Use `pwd`, `ls`, `cd` accurately.",
                  "Create, copy, move, and remove files safely.",
                  "Use `rg` for fast search.",
                ],
                lab: {
                  mode: "bash",
                  code: "pwd\nls\nprintf 'hello omni\\n' > sample.txt\ncat sample.txt",
                },
                quiz: [
                  { q: "What command prints current directory?", options: ["whoami", "pwd", "where"], answer: 1 },
                  { q: "Best fast recursive text search?", options: ["grep -R", "find", "rg"], answer: 2 },
                ],
              },
              {
                id: "bash-scripts",
                title: "Bash Scripting Basics",
                level: "Beginner",
                overview: "Build simple scripts for repeated local tasks.",
                objectives: [
                  "Use variables and loops in shell scripts.",
                  "Check return codes.",
                  "Create safe repeatable scripts.",
                ],
                lab: {
                  mode: "bash",
                  code: "for f in one two three; do echo \"task:$f\"; done",
                },
                quiz: [
                  { q: "What starts a loop in bash?", options: ["for", "loop", "repeat"], answer: 0 },
                  { q: "Which symbol references previous exit code?", options: ["$!", "$?", "$#"], answer: 1 },
                ],
              },
            ],
          },
          {
            id: "networking",
            name: "Networking Basics",
            desc: "IP, DNS, routing, ports, and local network understanding.",
            lessons: [
              {
                id: "net-core",
                title: "IP / DNS / Ports",
                level: "Beginner",
                overview: "Core concepts to understand connectivity and troubleshooting.",
                objectives: [
                  "Differentiate public vs private IP.",
                  "Understand port-based services.",
                  "Read simple connectivity output.",
                ],
                lab: {
                  mode: "bash",
                  code: "echo 'Map example:'\necho 'Client -> Router -> DNS -> Server:443'",
                },
                quiz: [
                  { q: "HTTPS commonly uses which port?", options: ["22", "80", "443"], answer: 2 },
                  { q: "DNS resolves:", options: ["IP to MAC", "Name to IP", "Port to process"], answer: 1 },
                ],
              },
              {
                id: "net-lab-plan",
                title: "Offline Lab Plan (Local Mesh Simulation)",
                level: "Beginner",
                overview: "Design a safe local test environment for learning.",
                objectives: [
                  "Build a local-only practice topology.",
                  "Separate learner machine and target VM.",
                  "Track findings in structured notes.",
                ],
                lab: {
                  mode: "python",
                  code: "lab = {\n  'host': 'your laptop',\n  'vm1': 'practice target',\n  'vm2': 'monitor/log box',\n  'network': 'host-only / no internet'\n}\nfor k,v in lab.items(): print(f'{k}: {v}')",
                },
                quiz: [
                  { q: "Best first rule for a safe practice lab?", options: ["Expose everything online", "Use host-only isolation", "Disable logs"], answer: 1 },
                  { q: "Why keep a monitoring VM?", options: ["For wallpapers", "To capture traffic/log evidence", "To increase lag"], answer: 1 },
                ],
              },
            ],
          },
          {
            id: "cyber",
            name: "Cybersecurity Foundations",
            desc: "Defensive security mindset, hardening, and risk assessment.",
            lessons: [
              {
                id: "cyber-threats",
                title: "Threat Model + Attack Surface",
                level: "Beginner",
                overview: "Learn to identify risks before tools.",
                objectives: [
                  "Map assets, threats, and controls.",
                  "Prioritize high-impact vulnerabilities.",
                  "Plan mitigations and verification.",
                ],
                lab: {
                  mode: "python",
                  code: "assets = ['email','files','accounts']\nfor a in assets:\n    print(f'Asset: {a} | Risk: medium | Control: MFA+backup')",
                },
                quiz: [
                  { q: "What is attack surface?", options: ["Your desktop background", "All reachable exposure points", "A password list"], answer: 1 },
                  { q: "Best immediate account hardening step?", options: ["Disable updates", "Enable MFA", "Reuse passwords"], answer: 1 },
                ],
              },
              {
                id: "cyber-incidents",
                title: "Incident Basics + Recovery",
                level: "Beginner",
                overview: "Understand detect, contain, recover, and review cycle.",
                objectives: [
                  "Detect suspicious behavior quickly.",
                  "Contain impact and preserve evidence.",
                  "Recover and improve controls.",
                ],
                lab: {
                  mode: "bash",
                  code: "echo '1) detect 2) contain 3) recover 4) review'",
                },
                quiz: [
                  { q: "First priority in incident response?", options: ["Tweet about it", "Contain impact safely", "Ignore logs"], answer: 1 },
                  { q: "Post-incident review should produce:", options: ["Blame only", "New controls + lessons", "Nothing"], answer: 1 },
                ],
              },
            ],
          },
          {
            id: "builders",
            name: "Build Models (Beginner Projects)",
            desc: "Create basic real projects online/offline with guided scopes.",
            lessons: [
              {
                id: "build-cli",
                title: "Build a Local CLI Task Tracker",
                level: "Beginner",
                overview: "Design and ship a tiny useful command-line app.",
                objectives: [
                  "Define data model for tasks.",
                  "Implement add/list/update workflow.",
                  "Persist local JSON safely.",
                ],
                lab: {
                  mode: "python",
                  code: "import json\ntasks=[{'title':'first task','done':False}]\nprint(json.dumps(tasks, indent=2))",
                },
                quiz: [
                  { q: "Good first project storage format?", options: ["Binary blob", "JSON", "None"], answer: 1 },
                  { q: "Best initial scope?", options: ["Small + complete", "Huge + unfinished", "No plan"], answer: 0 },
                ],
              },
              {
                id: "build-web",
                title: "Build an Offline Notes Web App",
                level: "Beginner",
                overview: "Use HTML/CSS/JS and local storage for an offline app.",
                objectives: [
                  "Create a minimal notes UI.",
                  "Save/load using localStorage.",
                  "Add search/filter and export.",
                ],
                lab: {
                  mode: "python",
                  code: "print('Plan: UI -> save/load -> search -> export')",
                },
                quiz: [
                  { q: "Which browser API can store simple local app data?", options: ["localStorage", "GPU API", "Bluetooth"], answer: 0 },
                  { q: "Good MVP for notes app?", options: ["Add/list/save notes", "Cloud sync first", "AI autoscale"], answer: 0 },
                ],
              },
            ],
          },
        ];
      }

      function loadTutorProgress() {
        try {
          const raw = localStorage.getItem(tutorProgressKey());
          const parsed = raw ? JSON.parse(raw) : null;
          if (parsed && typeof parsed === "object") {
            tutorProgress = {
              completed: parsed.completed && typeof parsed.completed === "object" ? parsed.completed : {},
              quizScores: parsed.quizScores && typeof parsed.quizScores === "object" ? parsed.quizScores : {},
              quizDetails: parsed.quizDetails && typeof parsed.quizDetails === "object" ? parsed.quizDetails : {},
            };
          } else {
            tutorProgress = { completed: {}, quizScores: {}, quizDetails: {} };
          }
        } catch (e) {
          tutorProgress = { completed: {}, quizScores: {}, quizDetails: {} };
        }
      }

      function saveTutorProgress() {
        localStorage.setItem(tutorProgressKey(), JSON.stringify(tutorProgress));
      }

      function getTutorLesson(trackId, lessonId) {
        const track = getTutorCatalog().find((t) => t.id === trackId);
        if (!track) return null;
        return track.lessons.find((l) => l.id === lessonId) || null;
      }

      function tutorLessonMeta(trackId, lesson) {
        const title = String(lesson?.title || "").toLowerCase();
        if (trackId === "python") {
          return {
            topics: title.includes("file") ? ["python", "files", "json", "automation"] : ["python", "variables", "loops", "functions"],
            refs: ["Python docs: tutorial + stdlib", "Practice: Terminal Lab examples", "App path: Terminal Lab -> Python Sandbox"],
          };
        }
        if (trackId === "bash") {
          return {
            topics: title.includes("script") ? ["bash", "scripting", "loops", "exit codes"] : ["bash", "filesystem", "commands", "search"],
            refs: ["Bash manpages (`man bash`)", "Tooling: `rg`, `ls`, `cat` practice", "App path: Terminal Lab -> Bash Sandbox"],
          };
        }
        if (trackId === "networking") {
          return {
            topics: ["networking", "ip", "dns", "ports", "routing"],
            refs: ["Networking basics notes", "Use safe local topology diagrams", "Lab plan lesson for host-only setups"],
          };
        }
        if (trackId === "cyber") {
          return {
            topics: ["cybersecurity", "threat model", "hardening", "incident response"],
            refs: ["Security foundations checklist", "MFA + backup controls", "Post-incident review workflow"],
          };
        }
        return {
          topics: ["project building", "mvp", "local app", "iteration"],
          refs: ["Build one small complete version first", "Use checklist for milestones", "Log outcomes in Journal"],
        };
      }

      function renderTutor() {
        loadTutorProgress();
        const catalog = getTutorCatalog();
        if (!catalog.some((t) => t.id === tutorState.trackId)) tutorState.trackId = catalog[0]?.id || "python";
        const selectedTrack = catalog.find((t) => t.id === tutorState.trackId) || catalog[0];
        if (!selectedTrack) return;
        if (!selectedTrack.lessons.some((l) => l.id === tutorState.lessonId)) {
          tutorState.lessonId = selectedTrack.lessons[0]?.id || "";
        }
        const trackHost = document.getElementById("tutor-track-list");
        const lessonHost = document.getElementById("tutor-lesson-list");
        const progressHost = document.getElementById("tutor-progress");
        if (trackHost) {
          trackHost.innerHTML = catalog.map((t) => `
            <button class="submit-btn tutor-track-btn ${t.id === tutorState.trackId ? "active" : ""}" type="button" onclick="selectTutorTrack('${escapeJsString(t.id)}')">
              ${escapeHtmlAttr(t.name)}<br /><span class="routine-ex-note">${escapeHtmlAttr(t.desc)}</span><br />
              <span class="routine-ex-note">Lessons: ${t.lessons.length}</span>
            </button>
          `).join("");
        }
        if (lessonHost) {
          lessonHost.innerHTML = selectedTrack.lessons.map((l, idx) => {
            const key = `${selectedTrack.id}::${l.id}`;
            const done = !!tutorProgress.completed[key];
            const meta = tutorLessonMeta(selectedTrack.id, l);
            return `
              <button class="confirm-btn tutor-lesson-btn ${done ? "done" : ""}" type="button" onclick="openTutorLesson('${escapeJsString(selectedTrack.id)}','${escapeJsString(l.id)}')">
                [${idx + 1}] ${escapeHtmlAttr(l.title)}<br />
                <span class="routine-ex-note">Level: ${escapeHtmlAttr(l.level)} | Topics: ${escapeHtmlAttr(meta.topics.slice(0, 3).join(", "))}</span>${done ? ` <span style="color:var(--warning-yellow)">[DONE]</span>` : ""}
              </button>
            `;
          }).join("");
        }
        const totalLessons = catalog.reduce((n, t) => n + t.lessons.length, 0);
        const doneLessons = Object.keys(tutorProgress.completed).length;
        const pct = totalLessons ? Math.round((doneLessons / totalLessons) * 100) : 0;
        if (progressHost) progressHost.textContent = `Progress: ${pct}% (${doneLessons}/${totalLessons})`;
        openTutorLesson(selectedTrack.id, tutorState.lessonId);
      }

      function selectTutorTrack(trackId) {
        tutorState.trackId = trackId;
        tutorState.lessonId = "";
        renderTutor();
      }

      function openTutorLesson(trackId, lessonId) {
        const catalog = getTutorCatalog();
        const track = catalog.find((t) => t.id === trackId);
        if (!track) return;
        const lesson = track.lessons.find((l) => l.id === lessonId) || track.lessons[0];
        if (!lesson) return;
        tutorState.trackId = track.id;
        tutorState.lessonId = lesson.id;
        const host = document.getElementById("tutor-lesson-view");
        if (!host) return;
        const meta = tutorLessonMeta(track.id, lesson);
        host.innerHTML = `
          <h3>// ${escapeHtmlAttr(track.name)} :: ${escapeHtmlAttr(lesson.title)}</h3>
          <p><span class="hvi-field-label">Level</span>${escapeHtmlAttr(lesson.level)}</p>
          <div class="tutor-meta-row">
            ${meta.topics.map((t) => `<span class="tutor-chip">${escapeHtmlAttr(t)}</span>`).join("")}
          </div>
          <p>${escapeHtmlAttr(lesson.overview)}</p>
          <h4>// OBJECTIVES</h4>
          <ul>${lesson.objectives.map((x) => `<li>${escapeHtmlAttr(x)}</li>`).join("")}</ul>
          <h4>// STUDY REFERENCES</h4>
          <ul class="tutor-ref-list">${meta.refs.map((r) => `<li>${escapeHtmlAttr(r)}</li>`).join("")}</ul>
          <div class="terminal-actions" style="margin:10px 0;">
            <button class="submit-btn" type="button" onclick="launchTutorLab('${escapeJsString(track.id)}','${escapeJsString(lesson.id)}')">RUN LAB IN TERMINAL</button>
            <button class="confirm-btn" type="button" onclick="markTutorLessonComplete('${escapeJsString(track.id)}','${escapeJsString(lesson.id)}')">MARK COMPLETE</button>
          </div>
          <h4>// LEARN PATH</h4>
          <p class="routine-ex-note">Use this loop: Study lesson -> Run lab task -> Mark complete -> Start next lesson. Build one mini project per track.</p>
        `;
      }

      function gradeTutorQuiz(trackId, lessonId) {
        const lesson = getTutorLesson(trackId, lessonId);
        if (!lesson) return;
        let correct = 0;
        const items = [];
        lesson.quiz.forEach((q, qi) => {
          const name = `quiz_${trackId}_${lessonId}_${qi}`;
          const chosen = document.querySelector(`input[name="${name}"]:checked`);
          const chosenIndex = chosen ? Number(chosen.value) : -1;
          const isCorrect = chosenIndex === Number(q.answer);
          if (isCorrect) correct += 1;
          items.push({
            question: q.q,
            correct: isCorrect,
            chosenText: chosenIndex >= 0 ? String(q.options[chosenIndex] || "") : "No answer",
            answerText: String(q.options[Number(q.answer)] || ""),
          });
        });
        const pct = lesson.quiz.length ? Math.round((correct / lesson.quiz.length) * 100) : 0;
        const key = `${trackId}::${lessonId}`;
        tutorProgress.quizScores[key] = Math.max(Number(tutorProgress.quizScores[key] || 0), pct);
        tutorProgress.quizDetails[key] = {
          at: new Date().toISOString(),
          pct,
          correct,
          total: lesson.quiz.length,
          items,
        };
        saveTutorProgress();
        const out = document.getElementById("tutor-quiz-result");
        if (out) {
          out.innerHTML = `
            <div class="tutor-quiz-report">
              <div><strong>Quiz Score:</strong> ${pct}% (${correct}/${lesson.quiz.length})</div>
              ${items.map((it, i) => `
                <div class="tutor-quiz-line">
                  <div>${i + 1}. ${escapeHtmlAttr(it.question || "")}</div>
                  <div class="${it.correct ? "tutor-ok" : "tutor-bad"}">${it.correct ? "Correct" : "Wrong"}</div>
                  <div>Chosen: ${escapeHtmlAttr(it.chosenText || "No answer")}</div>
                  <div>Correct: ${escapeHtmlAttr(it.answerText || "")}</div>
                </div>
              `).join("")}
            </div>
          `;
        }
        const progressHost = document.getElementById("tutor-progress");
        const catalog = getTutorCatalog();
        const totalLessons = catalog.reduce((n, t) => n + t.lessons.length, 0);
        const doneLessons = Object.keys(tutorProgress.completed).length;
        const progressPct = totalLessons ? Math.round((doneLessons / totalLessons) * 100) : 0;
        if (progressHost) progressHost.textContent = `Progress: ${progressPct}% (${doneLessons}/${totalLessons})`;
      }

      function markTutorLessonComplete(trackId, lessonId) {
        const key = `${trackId}::${lessonId}`;
        tutorProgress.completed[key] = new Date().toISOString();
        saveTutorProgress();
        themedNotice("Tutor lesson marked complete.");
        renderTutor();
      }

      function launchTutorLab(trackId, lessonId) {
        const lesson = getTutorLesson(trackId, lessonId);
        if (!lesson || !lesson.lab) return;
        const modeEl = document.getElementById("terminal-mode");
        const codeEl = document.getElementById("terminal-code");
        if (modeEl) modeEl.value = lesson.lab.mode || "python";
        if (codeEl) codeEl.value = lesson.lab.code || "";
        switchView("terminal-lab");
        themedNotice("Tutor lab loaded in Terminal Lab.");
      }

      function formatJournalTime(iso) {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return String(iso || "");
        return d.toLocaleString("en-GB", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });
      }

      function renderJournal() {
        const host = document.getElementById("journal-list");
        if (!host || !routineData) return;
        const rows = Array.isArray(routineData.journal) ? routineData.journal.slice().reverse() : [];
        host.innerHTML = rows.map((j) => `
          <div class="journal-item">
            <div class="journal-head">
              <span class="journal-title">${escapeHtmlAttr(j.title)}</span>
              <span class="journal-time">${escapeHtmlAttr(formatJournalTime(j.at))}</span>
            </div>
            <div class="journal-desc">${escapeHtmlAttr(j.desc)}</div>
            <div class="journal-media">
              ${j.photo ? `<img class="journal-photo" src="${escapeHtmlAttr(j.photo)}" alt="Journal photo" />` : ""}
              ${j.link ? `<a class="submit-btn" href="${escapeHtmlAttr(j.link)}" target="_blank" rel="noopener">OPEN LINK</a>` : ""}
            </div>
            <div style="margin-top:6px;">
              <button class="x-btn routine-mini-btn" type="button" onclick="deleteJournalEntry('${escapeHtmlAttr(j.id)}')">X</button>
            </div>
          </div>
        `).join("") || `<div class="journal-item"><span class="routine-ex-note">No journal entries yet.</span></div>`;
      }

      async function addJournalEntry() {
        if (!routineData) return;
        const titleEl = document.getElementById("journal-title-input");
        const descEl = document.getElementById("journal-desc-input");
        const photoEl = document.getElementById("journal-photo-input");
        const photoFileEl = document.getElementById("journal-photo-file");
        const linkEl = document.getElementById("journal-link-input");
        const title = String(titleEl?.value || "").trim();
        const desc = String(descEl?.value || "").trim();
        let photo = String(photoEl?.value || "").trim();
        if (photoFileEl && photoFileEl.files && photoFileEl.files[0]) {
          try {
            photo = await readFileAsDataUrl(photoFileEl.files[0]);
          } catch (e) {
            themedNotice("Photo upload failed.");
            return;
          }
        }
        const link = String(linkEl?.value || "").trim();
        if (!title) return;
        routineData.journal.push({
          id: `jr_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
          at: new Date().toISOString(),
          title,
          desc,
          photo,
          link,
        });
        if (titleEl) titleEl.value = "";
        if (descEl) descEl.value = "";
        if (photoEl) photoEl.value = "";
        if (photoFileEl) photoFileEl.value = "";
        if (linkEl) linkEl.value = "";
        saveRoutineData();
        closeAllAddPopups();
        renderJournal();
      }

      async function deleteJournalEntry(id) {
        if (!(await themedConfirm("Are you sure you want to delete this?"))) return;
        if (!routineData) return;
        routineData.journal = (routineData.journal || []).filter((j) => j.id !== id);
        saveRoutineData();
        renderJournal();
      }

      function openReminderPopup() {
        const overlay = document.getElementById("reminder-overlay");
        if (!overlay) return;
        const d = new Date();
        const dateEl = document.getElementById("reminder-date-input");
        const timeEl = document.getElementById("reminder-time-input");
        if (dateEl && !dateEl.value) dateEl.value = d.toISOString().slice(0, 10);
        if (timeEl && !timeEl.value) timeEl.value = d.toTimeString().slice(0, 5);
        overlay.classList.add("active");
        overlay.setAttribute("aria-hidden", "false");
        reminderCalendarMonthCursor = new Date(d.getFullYear(), d.getMonth(), 1);
        reminderCalendarSelectedDate = "";
        renderReminderCalendar();
        renderReminderList();
      }

      function closeReminderPopup() {
        const overlay = document.getElementById("reminder-overlay");
        if (!overlay) return;
        overlay.classList.remove("active");
        overlay.setAttribute("aria-hidden", "true");
      }

      function formatReminderWhen(iso) {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return String(iso || "");
        return d.toLocaleString("en-GB", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      }

      function localDateKey(d) {
        const dt = new Date(d);
        if (Number.isNaN(dt.getTime())) return "";
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, "0");
        const day = String(dt.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      }

      function renderReminderList() {
        const host = document.getElementById("reminder-list");
        if (!host || !routineData) return;
        if (!reminderCalendarSelectedDate) {
          host.innerHTML = `<div class="reminder-row"><div style="color:var(--term-dim);">Select a calendar date with a reminder dot to view entries.</div></div>`;
          return;
        }
        let rows = Array.isArray(routineData.reminders) ? routineData.reminders.slice() : [];
        rows = rows.filter((r) => {
          const d = new Date(r.when);
          if (Number.isNaN(d.getTime())) return false;
          return localDateKey(d) === reminderCalendarSelectedDate;
        });
        rows.sort((a, b) => new Date(a.when).getTime() - new Date(b.when).getTime());
        host.innerHTML = rows.map((r) => `
          <div class="reminder-row">
            <div style="color:var(--warning-yellow); font-weight:700;">${escapeHtmlAttr(formatReminderWhen(r.when))}</div>
            <div>${escapeHtmlAttr(r.title)}</div>
            <div style="color:var(--term-dim);">${escapeHtmlAttr(r.desc || "")}${Array.isArray(r.notifyOffsets) ? `<br /><span style="color:var(--warning-yellow); font-size:0.76rem;">Alerts: ${escapeHtmlAttr(r.notifyOffsets.map((m) => {
              if (m === 0) return "at time";
              if (m % 1440 === 0) return `${m / 1440}d before`;
              if (m % 60 === 0) return `${m / 60}h before`;
              return `${m}m before`;
            }).join(", "))}</span>` : ""}</div>
            <button class="x-btn routine-mini-btn" type="button" onclick="deleteReminderEntry('${escapeHtmlAttr(r.id)}')">X</button>
          </div>
        `).join("") || `<div class="reminder-row"><div style="color:var(--term-dim);">No reminders on ${escapeHtmlAttr(reminderCalendarSelectedDate)}.</div></div>`;
      }

      function addReminderEntry() {
        if (!routineData) return;
        const dateEl = document.getElementById("reminder-date-input");
        const timeEl = document.getElementById("reminder-time-input");
        const titleEl = document.getElementById("reminder-title-input");
        const descEl = document.getElementById("reminder-desc-input");
        const date = String(dateEl?.value || "").trim();
        const time = String(timeEl?.value || "").trim() || "00:00";
        const title = String(titleEl?.value || "").trim();
        const desc = String(descEl?.value || "").trim();
        const offsets = Array.from(document.querySelectorAll(".reminder-offset:checked"))
          .map((el) => Number(el.value))
          .filter((x) => Number.isFinite(x) && x >= 0);
        if (!date || !title) return;
        const when = new Date(`${date}T${time}`);
        if (Number.isNaN(when.getTime())) return;
        routineData.reminders.push({
          id: `rem_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
          when: when.toISOString(),
          title,
          desc,
          notifyOffsets: offsets.length ? [...new Set(offsets)] : [0],
        });
        if (titleEl) titleEl.value = "";
        if (descEl) descEl.value = "";
        saveRoutineData();
        const dateEl2 = document.getElementById("reminder-date-input");
        if (dateEl2) dateEl2.value = localDateKey(when);
        reminderCalendarSelectedDate = localDateKey(when);
        reminderCalendarMonthCursor = new Date(when.getFullYear(), when.getMonth(), 1);
        renderReminderCalendar();
        renderReminderList();
      }

      async function deleteReminderEntry(id) {
        if (!(await themedConfirm("Are you sure you want to delete this?"))) return;
        if (!routineData) return;
        routineData.reminders = (routineData.reminders || []).filter((r) => r.id !== id);
        saveRoutineData();
        renderReminderCalendar();
        renderReminderList();
      }

      function shiftReminderCalendarMonth(delta) {
        const d = Number(delta || 0);
        if (!Number.isFinite(d)) return;
        reminderCalendarMonthCursor = new Date(
          reminderCalendarMonthCursor.getFullYear(),
          reminderCalendarMonthCursor.getMonth() + d,
          1
        );
        renderReminderCalendar();
      }

      function selectReminderCalendarDate(dateStr) {
        const candidate = String(dateStr || "").trim();
        const hasReminder = (Array.isArray(routineData?.reminders) ? routineData.reminders : []).some((r) => {
          const d = new Date(r.when);
          if (Number.isNaN(d.getTime())) return false;
          return localDateKey(d) === candidate;
        });
        reminderCalendarSelectedDate = hasReminder ? candidate : "";
        const dateEl = document.getElementById("reminder-date-input");
        if (dateEl && candidate) dateEl.value = candidate;
        renderReminderCalendar();
        renderReminderList();
      }

      function renderReminderCalendar() {
        const titleEl = document.getElementById("reminder-calendar-title");
        const gridEl = document.getElementById("reminder-calendar-grid");
        if (!titleEl || !gridEl || !routineData) return;

        const month = reminderCalendarMonthCursor.getMonth();
        const year = reminderCalendarMonthCursor.getFullYear();
        titleEl.textContent = reminderCalendarMonthCursor.toLocaleDateString("en-GB", {
          month: "long",
          year: "numeric",
        }).toUpperCase();

        const first = new Date(year, month, 1);
        const last = new Date(year, month + 1, 0);
        const startOffset = (first.getDay() + 6) % 7;
        const totalDays = last.getDate();

        const reminderCounts = {};
        (Array.isArray(routineData.reminders) ? routineData.reminders : []).forEach((r) => {
          const d = new Date(r.when);
          if (Number.isNaN(d.getTime())) return;
          const key = localDateKey(d);
          reminderCounts[key] = (reminderCounts[key] || 0) + 1;
        });

        const cells = [];
        for (let i = 0; i < startOffset; i += 1) {
          cells.push(`<div class="reminder-cal-cell empty"></div>`);
        }
        for (let day = 1; day <= totalDays; day += 1) {
          const dateObj = new Date(year, month, day);
          const key = localDateKey(dateObj);
          const count = reminderCounts[key] || 0;
          const active = key === reminderCalendarSelectedDate ? " active" : "";
          const dot = count > 0 ? `<div class="reminder-cal-dot">${count}</div>` : "";
          cells.push(`
            <button class="reminder-cal-cell${active}" type="button" onclick="selectReminderCalendarDate('${key}')">
              <span>${day}</span>
              ${dot}
            </button>
          `);
        }
        while (cells.length < 42) {
          cells.push(`<div class="reminder-cal-cell empty"></div>`);
        }
        gridEl.innerHTML = cells.join("");
      }

      function notificationSettingsKey() {
        return "notificationSettings:v1";
      }

      function firedNotificationsKey() {
        return "firedNotifications:v1";
      }

      function notificationHistoryKey() {
        return "notificationHistory:v1";
      }

      function appearanceSettingsKey() {
        return "appearanceSettings:v1";
      }

      function performanceSettingsKey() {
        return "performanceSettings:v1";
      }

      function performanceModeToMs(mode) {
        const m = String(mode || "balanced");
        if (m === "fast") return 10000;
        if (m === "light") return 40000;
        if (m === "manual") return 0;
        return 20000;
      }

      function scheduleFetchDataPolling() {
        if (fetchDataTimerId) {
          clearInterval(fetchDataTimerId);
          fetchDataTimerId = 0;
        }
        const ms = performanceModeToMs(performanceMode);
        if (ms > 0) fetchDataTimerId = setInterval(fetchData, ms);
      }

      function loadPerformanceSettings() {
        let mode = "balanced";
        try {
          const raw = localStorage.getItem(performanceSettingsKey());
          const parsed = raw ? JSON.parse(raw) : null;
          mode = String(parsed?.mode || "balanced");
        } catch (_) {}
        if (!["fast", "balanced", "light", "manual"].includes(mode)) mode = "balanced";
        performanceMode = mode;
        const el = document.getElementById("perf-mode");
        if (el) el.value = mode;
        scheduleFetchDataPolling();
      }

      function savePerformanceSettings() {
        const el = document.getElementById("perf-mode");
        const mode = String(el?.value || "balanced");
        performanceMode = ["fast", "balanced", "light", "manual"].includes(mode) ? mode : "balanced";
        localStorage.setItem(performanceSettingsKey(), JSON.stringify({ mode: performanceMode }));
        scheduleFetchDataPolling();
      }

      function resetPerformanceSettings() {
        localStorage.removeItem(performanceSettingsKey());
        loadPerformanceSettings();
      }

      function manualSyncNow() {
        fetchData();
        themedNotice("Manual sync triggered.");
      }

      function defaultAppearanceSettings() {
        return {
          primary: "#00ff41",
          secondary: "#ffcc00",
          textColor: "#00ff41",
          bgColor: "#050505",
          textSize: 16,
          uiScale: 100,
          fontTheme: "classic",
          titleFontTheme: "classic",
        };
      }

      function getFontThemeMap() {
        return {
          classic: "\"Courier New\", Courier, monospace",
          matrix: "\"Lucida Console\", Monaco, monospace",
          tech: "\"Consolas\", \"Menlo\", \"Monaco\", monospace",
          modern: "\"SFMono-Regular\", \"IBM Plex Mono\", \"Menlo\", monospace",
        };
      }

      function applyAppearanceSettings(settings) {
        const root = document.documentElement;
        if (!root) return;
        const defaults = defaultAppearanceSettings();
        const primary = String(settings?.primary || defaults.primary);
        const secondary = String(settings?.secondary || defaults.secondary);
        const textColor = String(settings?.textColor || defaults.textColor);
        const bgColor = String(settings?.bgColor || defaults.bgColor);
        const textSize = Number(settings?.textSize || defaults.textSize);
        const uiScale = Number(settings?.uiScale || defaults.uiScale);
        const fontTheme = String(settings?.fontTheme || defaults.fontTheme);
        const titleFontTheme = String(settings?.titleFontTheme || defaults.titleFontTheme);
        const fontMap = getFontThemeMap();
        const bodyFont = fontMap[fontTheme] || fontMap.classic;
        const titleFont = fontMap[titleFontTheme] || fontMap.classic;
        const scaledRootSize = Math.max(12, Math.min(24, textSize)) * (Math.max(80, Math.min(140, uiScale)) / 100);
        root.style.setProperty("--term-green", primary);
        root.style.setProperty("--warning-yellow", secondary);
        root.style.setProperty("--text-color", textColor);
        root.style.setProperty("--bg-color", bgColor);
        root.style.setProperty("--font-main", bodyFont);
        root.style.setProperty("--font-title", titleFont);
        root.style.setProperty("--font-nav", bodyFont);
        root.style.fontSize = `${scaledRootSize}px`;
        if (document.body) document.body.style.fontSize = "";
        root.style.setProperty("--ui-scale", String(Math.max(80, Math.min(140, uiScale)) / 100));
      }

      function loadAppearanceSettings() {
        const defaults = defaultAppearanceSettings();
        let settings = { ...defaults };
        try {
          const raw = localStorage.getItem(appearanceSettingsKey());
          const parsed = raw ? JSON.parse(raw) : null;
          if (parsed && typeof parsed === "object") {
            settings = {
              primary: String(parsed.primary || defaults.primary),
              secondary: String(parsed.secondary || defaults.secondary),
              textColor: String(parsed.textColor || defaults.textColor),
              bgColor: String(parsed.bgColor || defaults.bgColor),
              textSize: Number(parsed.textSize || defaults.textSize),
              uiScale: Number(parsed.uiScale || defaults.uiScale),
              fontTheme: String(parsed.fontTheme || defaults.fontTheme),
              titleFontTheme: String(parsed.titleFontTheme || defaults.titleFontTheme),
            };
          }
        } catch (e) {}
        applyAppearanceSettings(settings);
        const pEl = document.getElementById("ui-term-green");
        const sEl = document.getElementById("ui-warning-yellow");
        const tEl = document.getElementById("ui-text-color");
        const bEl = document.getElementById("ui-bg-color");
        const tsEl = document.getElementById("ui-text-size");
        const scEl = document.getElementById("ui-scale");
        const fontEl = document.getElementById("ui-font-theme");
        const titleFontEl = document.getElementById("ui-title-font");
        if (pEl) pEl.value = settings.primary;
        if (sEl) sEl.value = settings.secondary;
        if (tEl) tEl.value = settings.textColor;
        if (bEl) bEl.value = settings.bgColor;
        if (tsEl) tsEl.value = String(settings.textSize);
        if (scEl) scEl.value = String(settings.uiScale);
        if (fontEl) fontEl.value = settings.fontTheme || defaults.fontTheme;
        if (titleFontEl) titleFontEl.value = settings.titleFontTheme || defaults.titleFontTheme;
      }

      function saveAppearanceSettings() {
        const pEl = document.getElementById("ui-term-green");
        const sEl = document.getElementById("ui-warning-yellow");
        const tEl = document.getElementById("ui-text-color");
        const bEl = document.getElementById("ui-bg-color");
        const tsEl = document.getElementById("ui-text-size");
        const scEl = document.getElementById("ui-scale");
        const fontEl = document.getElementById("ui-font-theme");
        const titleFontEl = document.getElementById("ui-title-font");
        const settings = {
          primary: String(pEl?.value || "#00ff41"),
          secondary: String(sEl?.value || "#ffcc00"),
          textColor: String(tEl?.value || "#00ff41"),
          bgColor: String(bEl?.value || "#050505"),
          textSize: Number(tsEl?.value || 16),
          uiScale: Number(scEl?.value || 100),
          fontTheme: String(fontEl?.value || "classic"),
          titleFontTheme: String(titleFontEl?.value || "classic"),
        };
        localStorage.setItem(appearanceSettingsKey(), JSON.stringify(settings));
        applyAppearanceSettings(settings);
      }

      function resetAppearanceField(field) {
        const defaults = defaultAppearanceSettings();
        const pEl = document.getElementById("ui-term-green");
        const sEl = document.getElementById("ui-warning-yellow");
        const tEl = document.getElementById("ui-text-color");
        const bEl = document.getElementById("ui-bg-color");
        const tsEl = document.getElementById("ui-text-size");
        const scEl = document.getElementById("ui-scale");
        const fontEl = document.getElementById("ui-font-theme");
        const titleFontEl = document.getElementById("ui-title-font");
        if (field === "primary" && pEl) pEl.value = defaults.primary;
        if (field === "secondary" && sEl) sEl.value = defaults.secondary;
        if (field === "textColor" && tEl) tEl.value = defaults.textColor;
        if (field === "bgColor" && bEl) bEl.value = defaults.bgColor;
        if (field === "textSize" && tsEl) tsEl.value = String(defaults.textSize);
        if (field === "uiScale" && scEl) scEl.value = String(defaults.uiScale);
        if (field === "fontTheme" && fontEl) fontEl.value = defaults.fontTheme;
        if (field === "titleFontTheme" && titleFontEl) titleFontEl.value = defaults.titleFontTheme;
        saveAppearanceSettings();
      }

      function cycleFontTheme() {
        const options = ["classic", "matrix", "tech", "modern"];
        const fontEl = document.getElementById("ui-font-theme");
        if (!fontEl) return;
        const idx = options.indexOf(String(fontEl.value || "classic"));
        fontEl.value = options[(idx + 1 + options.length) % options.length];
        saveAppearanceSettings();
      }

      function resetAppearanceSettings() {
        localStorage.removeItem(appearanceSettingsKey());
        loadAppearanceSettings();
      }

      function loadNotificationSettings() {
        try {
          const raw = localStorage.getItem(notificationSettingsKey());
          const parsed = raw ? JSON.parse(raw) : {};
          notificationSettings = {
            enabled: parsed?.enabled !== false,
            quarter: parsed?.quarter !== false,
            reminder: parsed?.reminder !== false,
            checklist: parsed?.checklist !== false,
            sound: String(parsed?.sound || "matrix"),
          };
        } catch (e) {
          notificationSettings = { enabled: true, quarter: true, reminder: true, checklist: true, sound: "matrix" };
        }
        try {
          const rawFired = localStorage.getItem(firedNotificationsKey());
          const parsedFired = rawFired ? JSON.parse(rawFired) : [];
          firedNotificationKeys = Array.isArray(parsedFired) ? parsedFired.slice(-800) : [];
        } catch (e) {
          firedNotificationKeys = [];
        }
        try {
          const rawHistory = localStorage.getItem(notificationHistoryKey());
          const parsedHistory = rawHistory ? JSON.parse(rawHistory) : [];
          notificationHistory = Array.isArray(parsedHistory) ? parsedHistory.slice(-300) : [];
        } catch (e) {
          notificationHistory = [];
        }
        const enabledEl = document.getElementById("notify-enabled");
        const quarterEl = document.getElementById("notify-quarter");
        const reminderEl = document.getElementById("notify-reminder");
        const checklistEl = document.getElementById("notify-checklist");
        const soundEl = document.getElementById("notify-sound");
        if (enabledEl) enabledEl.checked = !!notificationSettings.enabled;
        if (quarterEl) quarterEl.checked = !!notificationSettings.quarter;
        if (reminderEl) reminderEl.checked = !!notificationSettings.reminder;
        if (checklistEl) checklistEl.checked = !!notificationSettings.checklist;
        if (soundEl) soundEl.value = notificationSettings.sound || "matrix";
        renderNotificationHistory();
      }

      function saveNotificationSettings() {
        const enabledEl = document.getElementById("notify-enabled");
        const quarterEl = document.getElementById("notify-quarter");
        const reminderEl = document.getElementById("notify-reminder");
        const checklistEl = document.getElementById("notify-checklist");
        const soundEl = document.getElementById("notify-sound");
        notificationSettings = {
          enabled: !!enabledEl?.checked,
          quarter: !!quarterEl?.checked,
          reminder: !!reminderEl?.checked,
          checklist: !!checklistEl?.checked,
          sound: String(soundEl?.value || "matrix"),
        };
        localStorage.setItem(notificationSettingsKey(), JSON.stringify(notificationSettings));
      }

      function resetNotificationField(field) {
        const defaults = { enabled: true, quarter: true, reminder: true, checklist: true, sound: "matrix" };
        const enabledEl = document.getElementById("notify-enabled");
        const quarterEl = document.getElementById("notify-quarter");
        const reminderEl = document.getElementById("notify-reminder");
        const checklistEl = document.getElementById("notify-checklist");
        const soundEl = document.getElementById("notify-sound");
        if (field === "enabled" && enabledEl) enabledEl.checked = defaults.enabled;
        if (field === "quarter" && quarterEl) quarterEl.checked = defaults.quarter;
        if (field === "reminder" && reminderEl) reminderEl.checked = defaults.reminder;
        if (field === "checklist" && checklistEl) checklistEl.checked = defaults.checklist;
        if (field === "sound" && soundEl) soundEl.value = defaults.sound;
        saveNotificationSettings();
      }

      function resetNotificationSettings() {
        localStorage.removeItem(notificationSettingsKey());
        loadNotificationSettings();
      }

      async function clearAppCache() {
        if (!(await themedConfirm("Clear cached app files now? (Your saved OMNI data will stay.)"))) return;
        try {
          if ("caches" in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map((k) => caches.delete(k)));
          }
          themedNotice("Cache cleared. Reloading...");
          setTimeout(() => {
            window.location.reload();
          }, 250);
        } catch (e) {
          themedNotice("Cache clear failed: " + (e?.message || "Unknown error"));
        }
      }

      function rememberNotificationKey(key) {
        if (!key) return;
        if (firedNotificationKeys.includes(key)) return;
        firedNotificationKeys.push(key);
        if (firedNotificationKeys.length > 800) firedNotificationKeys = firedNotificationKeys.slice(-800);
        localStorage.setItem(firedNotificationsKey(), JSON.stringify(firedNotificationKeys));
      }

      function unrememberNotificationKey(key) {
        if (!key) return;
        firedNotificationKeys = firedNotificationKeys.filter((x) => x !== key);
        localStorage.setItem(firedNotificationsKey(), JSON.stringify(firedNotificationKeys));
      }

      function saveNotificationHistory() {
        localStorage.setItem(notificationHistoryKey(), JSON.stringify(notificationHistory.slice(-300)));
      }

      function renderNotificationHistory() {
        const host = document.getElementById("notify-history-list");
        if (!host) return;
        const dismissed = notificationHistory.filter((x) => !!x?.dismissedAt).slice().reverse();
        if (!dismissed.length) {
          host.innerHTML = `<div class="notify-history-row" style="color:var(--term-dim);">No dismissed alerts yet.</div>`;
          return;
        }
        host.innerHTML = dismissed.map((x) => `
          <div class="notify-history-row">
            <div class="notify-history-time">${escapeHtmlAttr(new Date(x.dismissedAt).toLocaleString("en-GB", { hour12: false }))}</div>
            <div class="notify-title">${escapeHtmlAttr(x.title || "Alert")}</div>
            <div class="notify-msg">${escapeHtmlAttr(x.message || "")}</div>
          </div>
        `).join("");
      }

      function clearNotificationHistory() {
        notificationHistory = [];
        saveNotificationHistory();
        renderNotificationHistory();
      }

      function isNotificationFired(key) {
        return !!key && firedNotificationKeys.includes(key);
      }

      function playNotificationSound() {
        const mode = String(notificationSettings.sound || "matrix");
        if (mode === "off") return;
        try {
          const Ctx = window.AudioContext || window.webkitAudioContext;
          if (!Ctx) return;
          if (!notificationAudioCtx || notificationAudioCtx.state === "closed") {
            notificationAudioCtx = new Ctx();
          }
          const ctx = notificationAudioCtx;
          if (ctx.state === "suspended") ctx.resume();
          const seq = mode === "ping"
            ? [{ f: 900, t: 0.15 }]
            : mode === "soft"
              ? [{ f: 520, t: 0.10 }, { f: 420, t: 0.18 }]
              : [{ f: 760, t: 0.08 }, { f: 980, t: 0.10 }, { f: 640, t: 0.14 }];
          let at = ctx.currentTime;
          seq.forEach((x) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = "triangle";
            o.frequency.value = x.f;
            g.gain.setValueAtTime(0.0001, at);
            g.gain.exponentialRampToValueAtTime(0.12, at + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, at + x.t);
            o.connect(g);
            g.connect(ctx.destination);
            o.start(at);
            o.stop(at + x.t + 0.02);
            at += x.t + 0.03;
          });
        } catch (e) {}
      }

      function testNotificationSound() {
        saveNotificationSettings();
        playNotificationSound();
      }

      function pushNotification(title, message, key) {
        if (!notificationSettings.enabled) return;
        if (key && isNotificationFired(key)) return;
        const host = document.getElementById("notify-overlay");
        if (!host) return;
        const id = `n_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
        const historyId = `h_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
        notificationHistory.push({
          id: historyId,
          key: key || "",
          title: String(title || ""),
          message: String(message || ""),
          createdAt: new Date().toISOString(),
          dismissedAt: "",
        });
        saveNotificationHistory();
        const card = document.createElement("div");
        card.className = "notify-card";
        card.id = id;
        card.setAttribute("data-history-id", historyId);
        card.setAttribute("data-key", key || "");
        card.innerHTML = `
          <button class="x-btn notify-close" type="button" onclick="dismissNotification('${id}')">X</button>
          <div class="notify-title">${escapeHtmlAttr(title)}</div>
          <div class="notify-msg">${escapeHtmlAttr(message)}</div>
        `;
        host.prepend(card);
        if (host.children.length > 6) host.removeChild(host.lastElementChild);
        playNotificationSound();
        if (key) rememberNotificationKey(key);
      }

      function dismissNotification(id) {
        const el = document.getElementById(id);
        const key = el ? String(el.getAttribute("data-key") || "") : "";
        const historyId = el ? String(el.getAttribute("data-history-id") || "") : "";
        if (historyId) {
          const row = notificationHistory.find((x) => String(x.id) === historyId);
          if (row && !row.dismissedAt) row.dismissedAt = new Date().toISOString();
          saveNotificationHistory();
          renderNotificationHistory();
        }
        if (key) unrememberNotificationKey(key);
        if (el && el.parentNode) el.parentNode.removeChild(el);
      }

      function minutesUntil(iso) {
        const t = new Date(iso).getTime();
        if (!Number.isFinite(t)) return Infinity;
        return Math.floor((t - Date.now()) / 60000);
      }

      function getNextPlannedBlockInfo(now = new Date()) {
        const q = getQuarterState(now);
        const opDay = operationalDayKey(now);
        const plan = loadMissionPlan(opDay);
        const blocks = [];
        for (let qi = 0; qi < 8; qi += 1) {
          const qStart = new Date(q.dayStart.getTime() + qi * 3 * 60 * 60 * 1000);
          const defs = [
            { slot: 1, startMin: 0, kind: "mission" },
            { slot: 2, startMin: 30, kind: "mission" },
            { slot: 3, startMin: 60, kind: "mission" },
            { slot: 4, startMin: 90, kind: "mission" },
            { slot: 5, startMin: 120, kind: "recovery" },
            { slot: 6, startMin: 150, kind: "recovery" },
          ];
          defs.forEach((d) => {
            const startAt = new Date(qStart.getTime() + d.startMin * 60000);
            const mins = Math.floor((startAt.getTime() - now.getTime()) / 60000);
            if (mins < 0) return;
            const planned = getPlannedMission(plan, qi + 1, d.slot);
            blocks.push({
              key: `block:${opDay}:Q${qi + 1}:S${d.slot}:${startAt.toISOString()}`,
              startAt,
              mins,
              quarter: qi + 1,
              slot: d.slot,
              label: d.kind === "mission"
                ? `${planned.operation || "Operation"} - ${planned.missionName || "Mission Task"}`
                : `Recovery - ${planned.missionName || "UNASSIGNED"}`,
            });
          });
        }
        blocks.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
        return blocks.length ? blocks[0] : null;
      }

      function runNotificationEngine() {
        if (!notificationSettings.enabled) return;
        if (notificationSettings.quarter) {
          const now = new Date();
          const q = getQuarterState(now);
          const opDay = operationalDayKey(now);
          const qKey = `quarter:${opDay}:Q${q.quarterIndex}`;
          if (!isNotificationFired(qKey)) {
            pushNotification("Quarter Alert", `Q${q.quarterIndex}/8 is live now.`, qKey);
          }
        }
        if (notificationSettings.reminder && routineData && Array.isArray(routineData.reminders)) {
          routineData.reminders.forEach((r) => {
            const offsets = Array.isArray(r.notifyOffsets) && r.notifyOffsets.length ? r.notifyOffsets : [0];
            offsets.forEach((offsetMins) => {
              const triggerMs = new Date(r.when).getTime() - (Number(offsetMins || 0) * 60000);
              const diff = Math.floor((Date.now() - triggerMs) / 1000);
              const key = `rem:${r.id}:${offsetMins}`;
              if (diff >= 0 && diff <= 55 && !isNotificationFired(key)) {
                const leadText = offsetMins === 0
                  ? "now"
                  : (offsetMins % 1440 === 0 ? `${offsetMins / 1440} day(s)` : (offsetMins % 60 === 0 ? `${offsetMins / 60} hour(s)` : `${offsetMins} min`)) + " prior";
                pushNotification("Reminder", `${r.title} (${leadText})`, key);
              }
            });
          });
        }
        const nextBlock = getNextPlannedBlockInfo(new Date());
        if (nextBlock && nextBlock.mins >= 0 && nextBlock.mins <= 15) {
          const key = `upcoming:${nextBlock.key}`;
          pushNotification("Upcoming Task", `Q${nextBlock.quarter} Block ${nextBlock.slot} in ${nextBlock.mins}m: ${nextBlock.label}`, key);
        }
        if (notificationSettings.checklist && Array.isArray(checklistItems)) {
          const pending = checklistItems.filter((x) => !x.done);
          if (pending.length) {
            const bucket = Math.floor(Date.now() / (30 * 60 * 1000)); // every 30 mins
            const key = `checklist:${operationalDayKey(new Date())}:${bucket}`;
            const preview = pending.slice(0, 2).map((x) => x.text).join(" | ");
            pushNotification("Checklist Pending", `${pending.length} item(s) pending. ${preview}`, key);
          }
        }
      }

      async function runTerminalCode() {
        const codeEl = document.getElementById("terminal-code");
        const outEl = document.getElementById("terminal-output");
        const modeEl = document.getElementById("terminal-mode");
        if (!codeEl || !outEl) return;
        const code = String(codeEl.value || "");
        const mode = String(modeEl?.value || "python");
        if (!code.trim()) {
          outEl.textContent = "No code.";
          return;
        }
        outEl.textContent = "Running...";
        try {
          const res = await fetch("/api/sandbox/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mode, code }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error || "Run failed.");
          outEl.textContent = `mode=${escapeHtmlAttr(mode)} exit=${Number(data.exit_code || 0)} time=${Number(data.duration_ms || 0)}ms\n\n${data.stdout || ""}${data.stderr ? `\n[stderr]\n${data.stderr}` : ""}`;
        } catch (e) {
          outEl.textContent = `Error: ${e.message}`;
        }
      }

      function clearTerminalOutput() {
        const outEl = document.getElementById("terminal-output");
        if (outEl) outEl.textContent = "Cleared.";
      }

      function loadTerminalExample() {
        const codeEl = document.getElementById("terminal-code");
        const modeEl = document.getElementById("terminal-mode");
        if (!codeEl) return;
        const mode = String(modeEl?.value || "python");
        if (mode === "bash") {
          codeEl.value = `# restricted bash sandbox\npwd\nls\nprintf "hello from bash sandbox\\n"\nfor i in 1 2 3; do echo "line $i"; done`;
          return;
        }
        codeEl.value = `# offline local python sandbox\nfrom math import sqrt\n\nnums = [1, 2, 9, 16, 25]\nfor n in nums:\n    print(n, '->', sqrt(n))`;
      }

      function addRoutineTask(period) {
        if (!routineData) return;
        const titleEl = document.getElementById(`${period}-routine-task-input`);
        const descEl = document.getElementById(`${period}-routine-desc-input`);
        const title = String(titleEl?.value || "").trim();
        const desc = String(descEl?.value || "").trim();
        const descChecks = desc.split(/[\n;,]+/).map((s) => s.trim()).filter(Boolean).map((text, idx) => ({
          id: `dc_${Date.now()}_${idx}_${Math.floor(Math.random() * 100000)}`,
          text,
          done: false,
        }));
        if (!title) return;
        routineData[period].push({
          id: `rt_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
          title,
          desc,
          descChecks,
          done: false,
        });
        if (titleEl) titleEl.value = "";
        if (descEl) descEl.value = "";
        saveRoutineData();
        closeAllAddPopups();
        renderRoutines();
      }

      function toggleRoutineTask(period, id) {
        if (!routineData) return;
        const item = (routineData[period] || []).find((x) => x.id === id);
        if (!item) return;
        item.done = !item.done;
        saveRoutineData();
        renderRoutines();
      }

      async function editRoutineTask(period, id) {
        if (!routineData) return;
        const item = (routineData[period] || []).find((x) => x.id === id);
        if (!item) return;
        const newTitle = await themedPrompt("Edit task name", item.title);
        if (newTitle === null) return;
        const t = String(newTitle).trim();
        if (!t) return;
        const newDesc = await themedPrompt("Edit description", item.desc || "");
        if (newDesc === null) return;
        const oldDoneByText = new Map(
          (Array.isArray(item.descChecks) ? item.descChecks : [])
            .map((d) => [String(d.text || "").trim().toLowerCase(), !!d.done])
            .filter(([k]) => !!k)
        );
        const currentChecksText = (Array.isArray(item.descChecks) ? item.descChecks : [])
          .map((d) => String(d.text || "").trim())
          .filter(Boolean)
          .join("\n");
        const checksRaw = await themedPrompt("Edit sub checkmarks (one per line)", currentChecksText);
        if (checksRaw === null) return;
        item.title = t;
        item.desc = String(newDesc).trim();
        item.descChecks = String(checksRaw || "")
          .split(/\n+/)
          .map((s) => String(s || "").trim())
          .filter(Boolean)
          .map((text, idx) => {
            const key = text.toLowerCase();
            return {
              id: item?.descChecks?.[idx]?.id || `dc_${Date.now()}_${idx}_${Math.floor(Math.random() * 100000)}`,
              text,
              done: oldDoneByText.get(key) || false,
            };
          });
        saveRoutineData();
        renderRoutines();
      }

      function saveRoutineInlineTaskField(period, taskId, field, el) {
        if (!routineData || !el) return;
        const item = (routineData[period] || []).find((x) => x.id === taskId);
        if (!item) return;
        const next = String((el.textContent || "").replace(/\s+/g, " ")).trim();
        if (!next) {
          el.textContent = String(item[field] || "");
          return;
        }
        if (field === "title") item.title = next;
        if (field === "desc") item.desc = next;
        saveRoutineData();
      }

      function saveRoutineInlineSubcheck(period, taskId, checkId, el) {
        if (!routineData || !el) return;
        const item = (routineData[period] || []).find((x) => x.id === taskId);
        if (!item || !Array.isArray(item.descChecks)) return;
        const check = item.descChecks.find((d) => d.id === checkId);
        if (!check) return;
        const next = String((el.textContent || "").replace(/\s+/g, " ")).trim();
        if (!next) {
          el.textContent = String(check.text || "");
          return;
        }
        check.text = next;
        saveRoutineData();
      }


      async function onRoutineDescDoubleClick(event, period, taskId) {
        if (event && typeof event.stopPropagation === "function") event.stopPropagation();
        if (!routineData) return;
        const item = (routineData[period] || []).find((x) => x.id === taskId);
        if (!item) return;
        const next = await themedPrompt("Edit description", item.desc || "");
        if (next === null) return;
        item.desc = String(next || "").trim();
        saveRoutineData();
        renderRoutines();
      }

      async function onRoutineSubcheckDoubleClick(event, period, taskId, checkId) {
        if (event && typeof event.stopPropagation === "function") event.stopPropagation();
        if (!routineData) return;
        const item = (routineData[period] || []).find((x) => x.id === taskId);
        if (!item || !Array.isArray(item.descChecks)) return;
        const check = item.descChecks.find((d) => d.id === checkId);
        if (!check) return;
        const next = await themedPrompt("Edit sub checkmark", check.text || "");
        if (next === null) return;
        const t = String(next || "").trim();
        if (!t) return;
        check.text = t;
        saveRoutineData();
        renderRoutines();
      }

      function toggleRoutineDescCheck(period, taskId, checkId) {
        if (!routineData) return;
        const item = (routineData[period] || []).find((x) => x.id === taskId);
        if (!item || !Array.isArray(item.descChecks)) return;
        const check = item.descChecks.find((d) => d.id === checkId);
        if (!check) return;
        check.done = !check.done;
        saveRoutineData();
        renderRoutines();
      }

      function onRoutineDescDragStart(period, taskId, index, event) {
        routineDescDrag = { period, taskId, fromIndex: index };
        if (event && event.dataTransfer) {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", String(index));
        }
      }

      function onRoutineDescDragOver(event) {
        if (!event) return;
        event.preventDefault();
        const row = event.currentTarget;
        if (row && row.classList) row.classList.add("drag-over");
      }

      function onRoutineDescDragLeave(event) {
        const row = event && event.currentTarget;
        if (row && row.classList) row.classList.remove("drag-over");
      }

      function onRoutineDescDrop(period, taskId, toIndex, event) {
        if (event) event.preventDefault();
        const row = event && event.currentTarget;
        if (row && row.classList) row.classList.remove("drag-over");
        const state = routineDescDrag || {};
        routineDescDrag = { period: "", taskId: "", fromIndex: -1 };
        if (!routineData) return;
        if (state.period !== period || state.taskId !== taskId) return;
        const fromIndex = Number(state.fromIndex);
        if (!Number.isInteger(fromIndex) || fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
        const task = (routineData[period] || []).find((x) => x.id === taskId);
        if (!task || !Array.isArray(task.descChecks)) return;
        if (fromIndex >= task.descChecks.length || toIndex >= task.descChecks.length) return;
        const [moved] = task.descChecks.splice(fromIndex, 1);
        task.descChecks.splice(toIndex, 0, moved);
        saveRoutineData();
        renderRoutines();
      }

      async function deleteRoutineTask(period, id) {
        if (!(await themedConfirm("Are you sure you want to delete this?"))) return;
        if (!routineData) return;
        routineData[period] = (routineData[period] || []).filter((x) => x.id !== id);
        saveRoutineData();
        renderRoutines();
      }

      function checklistStorageKey() {
        return "checklistItems:v1";
      }

      function checklistSeedItems() {
        return [
          { text: "Clean Opencalow", subtext: "" },
          { text: "Fix Openclaw", subtext: "" },
          { text: "Add openclaw to Macbook", subtext: "" },
          { text: "Buy CapCut", subtext: "" },
          { text: "Captcha and Antibot", subtext: "" },
          { text: "Google Account Automation", subtext: "" },
          { text: "Quick Cash Upsell (5 past clients, studio/edit slots)", subtext: "PRIORITY: Revenue Generation (£500/week) - Immediate Cash Flow" },
          { text: "Marketing Pitch (5 new artists, \"Video + 3 Snippets\" £250)", subtext: "PRIORITY: Revenue Generation (£500/week) - Immediate Cash Flow" },
          { text: "Storefront Audit (Fix Instagram/Page \"Book Now\" flow)", subtext: "PRIORITY: Revenue Generation (£500/week) - Immediate Cash Flow" },
          { text: "Job Applications / Cover letter template", subtext: "PRIORITY: Revenue Generation (£500/week) - Job/Career" },
          { text: "Update CV/portfolio", subtext: "PRIORITY: Revenue Generation (£500/week) - Job/Career" },
          { text: "CV’s template", subtext: "PRIORITY: Revenue Generation (£500/week) - Job/Career" },
          { text: "Certificates", subtext: "PRIORITY: Revenue Generation (£500/week) - Job/Career" },
          { text: "Portfolio’s", subtext: "PRIORITY: Revenue Generation (£500/week) - Job/Career" },
          { text: "Internships", subtext: "PRIORITY: Revenue Generation (£500/week) - Job/Career" },
          { text: "Funding.", subtext: "PRIORITY: Revenue Generation (£500/week) - Job/Career" },
          { text: "Modeling digitals", subtext: "PRIORITY: Revenue Generation (£500/week) - Job/Career" },
          { text: "HARD DEADLINE: 11:40 Neck Ultrasound", subtext: "PRIORITY: Revenue Generation (£500/week) - Job/Career" },
          { text: "Shortlist local studios", subtext: "INFRASTRUCTURE & ORG" },
          { text: "HubSpot: Update timeline and booking", subtext: "INFRASTRUCTURE & ORG" },
          { text: "Admin: Student loan, Custom Email, Credit Card", subtext: "INFRASTRUCTURE & ORG" },
          { text: "Admin: Call 111, Sign out of codex everywhere", subtext: "INFRASTRUCTURE & ORG" },
          { text: "Create Social Accounts (FB, LinkedIn, IG Booking Portfolio Page)", subtext: "MARKETING & BRAND" },
          { text: "SEO for Projecttitle.co.uk (http://projecttitle.co.uk/)", subtext: "MARKETING & BRAND" },
          { text: "Portfolio Updates (Boxing, Wedding, Amel, Booth troop)", subtext: "MARKETING & BRAND" },
          { text: "Design Bedroom", subtext: "PERSONAL/CREATIVE" },
          { text: "Spotify: Create Playlist, Edit Roy Dawood & Kozi", subtext: "PERSONAL/CREATIVE" },
          { text: "Fix iPhone battery / Adobe", subtext: "PERSONAL/CREATIVE" },
          { text: "Bedroom", subtext: "Quick note" },
          { text: "Openclaw with multiplee bots", subtext: "Quick note" },
          { text: "https://www.sans.org/cyber-security-courses/automating-information-security-with-python/", subtext: "Add to job missions" },
          { text: "https://www.giac.org/certifications/python-coder-gpyc/", subtext: "Add to job missions" },
          { text: "https://help.offsec.com/hc/en-us/articles/12483872278932-PEN-200-FAQ", subtext: "Add to job missions" },
          { text: "https://help.offsec.com/hc/en-us/articles/4406841351316-PEN-200-Onboarding-A-Learner-Introduction-Guide-to-the-OSCP", subtext: "Add to job missions" },
          { text: "https://academy.hackthebox.com/course/preview/introduction-to-python-3", subtext: "Add to job missions" },
          { text: "https://academy.hackthebox.com/course/preview/introduction-to-bash-scripting", subtext: "Add to job missions" },
          { text: "https://tryhackme.com/room/pythonforcybersecurity", subtext: "Add to job missions" },
          { text: "https://tryhackme.com/path/outline/jrpenetrationtester", subtext: "Add to job missions" },
          { text: "https://www.coursera.org/professional-certificates/google-it-automation", subtext: "Add to job missions" },
          { text: "https://cloud.google.com/billing/docs/how-to/verify-billing-enabled", subtext: "Add to job missions" },
          { text: "https://cloud.google.com/billing/docs/how-to/restart-services", subtext: "Add to job missions" },
          { text: "https://docs.cloud.google.com/resource-manager/docs/project-suspension-guidelines", subtext: "Add to job missions" },
          { text: "IT Support", subtext: "Add to job missions" },
          { text: "https://www.coursera.org/professional-certificates/google-it-support", subtext: "Add to job missions" },
          { text: "Data Analyst", subtext: "Add to job missions" },
          { text: "https://www.coursera.org/professional-certificates/google-data-analytics", subtext: "Add to job missions" },
          { text: "Project Manager", subtext: "Add to job missions" },
          { text: "https://www.coursera.org/professional-certificates/google-project-management", subtext: "Add to job missions" },
          { text: "UX Designer", subtext: "Add to job missions" },
          { text: "https://www.coursera.org/professional-certificates/google-ux-design", subtext: "Add to job missions" },
          { text: "Digital Marketing / E-commerce", subtext: "Add to job missions" },
          { text: "https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce", subtext: "Add to job missions" },
          { text: "Cloud (AWS)", subtext: "Add to job missions" },
          { text: "https://aws.amazon.com/certification/certified-cloud-practitioner/", subtext: "Add to job missions" },
          { text: "Cloud (Google Cloud)", subtext: "Add to job missions" },
          { text: "https://cloud.google.com/learn/certification/cloud-digital-leader", subtext: "Add to job missions" },
          { text: "Law / Bar Prep", subtext: "Add to job missions" },
          { text: "https://www.barbri.com/bar-review-course", subtext: "Add to job missions" },
          { text: "https://www.themisbar.com/bar-review/", subtext: "Add to job missions" },
          { text: "https://smartbarprep.com/", subtext: "Add to job missions" },
          { text: "Cybersecurity + Python/Bash track", subtext: "Add to job missions" },
        ];
      }

      function mergeChecklistSeedItems() {
        const existing = new Set(
          checklistItems.map((x) => `${String(x.text || "").toLowerCase()}::${String(x.subtext || "").toLowerCase()}`)
        );
        for (const seed of checklistSeedItems()) {
          const text = String(seed.text || "").trim();
          const subtext = String(seed.subtext || "").trim();
          if (!text) continue;
          const sig = `${text.toLowerCase()}::${subtext.toLowerCase()}`;
          if (existing.has(sig)) continue;
          checklistItems.push({
            id: `seed_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
            text,
            subtext,
            done: false,
          });
          existing.add(sig);
        }
      }

      function loadChecklistItems() {
        try {
          const raw = localStorage.getItem(checklistStorageKey());
          const parsed = raw ? JSON.parse(raw) : [];
          checklistItems = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          checklistItems = [];
        }
        mergeChecklistSeedItems();
        saveChecklistItems();
        renderChecklist();
      }

      function saveChecklistItems() {
        localStorage.setItem(checklistStorageKey(), JSON.stringify(checklistItems));
      }

      function addChecklistItem() {
        const input = document.getElementById("checklist-new-item");
        const subInput = document.getElementById("checklist-new-sub");
        if (!input) return;
        const text = (input.value || "").trim();
        const subtext = (subInput && subInput.value ? subInput.value : "").trim();
        if (!text) return;
        checklistItems.push({
          id: `t_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
          text,
          subtext,
          done: false,
        });
        input.value = "";
        if (subInput) subInput.value = "";
        saveChecklistItems();
        closeAllAddPopups();
        renderChecklist();
      }

      function onChecklistInputKey(e) {
        if (e && e.key === "Enter") addChecklistItem();
      }

      function toggleChecklistItem(id) {
        const idx = checklistItems.findIndex((x) => x.id === id);
        if (idx < 0) return;
        checklistItems[idx].done = !checklistItems[idx].done;
        saveChecklistItems();
        renderChecklist();
      }

      async function deleteChecklistItem(id) {
        if (!(await themedConfirm("Are you sure you want to delete this?"))) return;
        checklistItems = checklistItems.filter((x) => x.id !== id);
        saveChecklistItems();
        renderChecklist();
      }

      function onChecklistDragStart(index, event) {
        checklistDragIndex = index;
        if (event && event.dataTransfer) {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", String(index));
        }
      }

      function onChecklistDragOver(index, event) {
        if (!event) return;
        event.preventDefault();
        const li = event.currentTarget;
        if (li && li.classList) li.classList.add("drag-over");
      }

      function onChecklistDragLeave(event) {
        const li = event && event.currentTarget;
        if (li && li.classList) li.classList.remove("drag-over");
      }

      function onChecklistDrop(index, event) {
        if (event) event.preventDefault();
        const li = event && event.currentTarget;
        if (li && li.classList) li.classList.remove("drag-over");
        const from = checklistDragIndex;
        const to = index;
        checklistDragIndex = -1;
        if (from < 0 || to < 0 || from === to || from >= checklistItems.length || to >= checklistItems.length) return;
        const [moved] = checklistItems.splice(from, 1);
        checklistItems.splice(to, 0, moved);
        saveChecklistItems();
        renderChecklist();
      }

      function renderChecklist() {
        const list = document.getElementById("checklist-list");
        const empty = document.getElementById("checklist-empty");
        if (!list || !empty) return;
        if (!checklistItems.length) {
          list.style.display = "none";
          empty.style.display = "block";
          list.innerHTML = "";
          return;
        }
        empty.style.display = "none";
        list.style.display = "block";
        list.innerHTML = checklistItems.map((item, index) => `
          <li class="checklist-item ${item.done ? "done" : ""}"
              draggable="true"
              ondragstart="onChecklistDragStart(${index}, event)"
              ondragover="onChecklistDragOver(${index}, event)"
              ondragleave="onChecklistDragLeave(event)"
              ondrop="onChecklistDrop(${index}, event)">
            <span class="checklist-handle">::</span>
            <input class="checklist-check" type="checkbox" ${item.done ? "checked" : ""} onchange="toggleChecklistItem('${escapeHtmlAttr(item.id)}')" />
            <div class="checklist-copy">
              <span class="checklist-text">${escapeHtmlAttr(item.text)}</span>
              ${item.subtext ? `<span class="checklist-subtext">${escapeHtmlAttr(item.subtext)}</span>` : ""}
            </div>
            <button class="x-btn" type="button" onclick="deleteChecklistItem('${escapeHtmlAttr(item.id)}')" title="Delete">X</button>
          </li>
        `).join("");
      }

      function extractBriefVariables(text) {
        const out = [];
        const seen = new Set();
        const lines = String(text || "").replace(/\r\n/g, "\n").split("\n");
        for (const raw of lines.slice(0, 400)) {
          const line = raw.trim();
          if (!line) continue;
          const m = line.match(/^([A-Za-z][A-Za-z0-9 _().\/-]{1,80}):\s*(.+)$/);
          if (!m) continue;
          const key = m[1].trim();
          const value = m[2].trim();
          const sig = `${key.toLowerCase()}::${value.toLowerCase()}`;
          if (seen.has(sig)) continue;
          seen.add(sig);
          out.push({ key, value });
        }
        return out;
      }

      function renderBriefVariables() {
        const host = document.getElementById("brief-vars");
        if (!host) return;
        if (!briefVariables.length) {
          host.innerHTML = `<div class="checklist-empty">No variables parsed yet.</div>`;
          return;
        }
        host.innerHTML = briefVariables.map((v, i) => `
          <div class="brief-var-row">
            <input type="text" value="${escapeHtmlAttr(v.key || "")}" onchange="onBriefVariableChange(${i}, 'key', this.value)" />
            <input type="text" value="${escapeHtmlAttr(v.value || "")}" onchange="onBriefVariableChange(${i}, 'value', this.value)" />
          </div>
        `).join("");
      }

      function onBriefVariableChange(index, field, value) {
        if (index < 0 || index >= briefVariables.length) return;
        if (field !== "key" && field !== "value") return;
        briefVariables[index][field] = value || "";
      }

      function renderBriefHistory() {
        const host = document.getElementById("brief-history");
        if (!host) return;
        if (!briefHistory.length) {
          host.innerHTML = `<li><button type="button" disabled>No saved phases yet.</button></li>`;
          return;
        }
        host.innerHTML = briefHistory.map((v, i) => `
          <li>
            <button type="button" onclick="loadBriefVersion(${i})">
              Phase ${v.phase || "?"} :: ${escapeHtmlAttr(v.created_at || "")}
            </button>
          </li>
        `).join("");
      }

      function parseBriefVariablesFromEditor() {
        const el = document.getElementById("brief-content");
        if (!el) return;
        briefVariables = extractBriefVariables(el.value || "");
        renderBriefVariables();
      }

      function getBriefSelectedMissionPath() {
        const sel = document.getElementById("brief-mission-select");
        return sel ? (sel.value || "") : "";
      }

      function onBriefOperationFilterChange() {
        renderBriefMissionOptions();
      }

      function onBriefMissionChange() {
        const phaseInput = document.getElementById("brief-phase");
        if (phaseInput) phaseInput.value = "1";
      }

      function renderBriefMissionOptions() {
        const opSel = document.getElementById("brief-operation-filter");
        const mSel = document.getElementById("brief-mission-select");
        if (!opSel || !mSel) return;
        const operations = [...new Set(allMissions.map((m) => m.operation).filter(Boolean))].sort((a, b) => a.localeCompare(b));
        const currentOp = opSel.value || "";
        const opOptions = [`<option value="">All Operations</option>`]
          .concat(operations.map((op) => `<option value="${escapeHtmlAttr(op)}" ${op === currentOp ? "selected" : ""}>${escapeHtmlAttr(op)}</option>`))
          .join("");
        opSel.innerHTML = opOptions;

        const filtered = allMissions
          .filter((m) => !opSel.value || m.operation === opSel.value)
          .sort((a, b) => (a.operation + "::" + a.name).localeCompare(b.operation + "::" + b.name));
        const currentMission = mSel.value || "";
        mSel.innerHTML = [`<option value="">-- Select Mission --</option>`]
          .concat(filtered.map((m) => `<option value="${escapeHtmlAttr(m.path)}" ${m.path === currentMission ? "selected" : ""}>${escapeHtmlAttr(m.operation)} :: ${escapeHtmlAttr(m.name)}</option>`))
          .join("");
      }

      async function loadBriefForSelectedMission() {
        const missionPath = getBriefSelectedMissionPath();
        if (!missionPath) {
          alert("Select a mission first.");
          return;
        }
        try {
          const res = await fetch(`/api/mission/brief?mission_path=${encodeURIComponent(missionPath)}`, { cache: "no-store" });
          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: "Failed to load brief history." }));
            throw new Error(err.error || "Failed to load brief history.");
          }
          const data = await res.json();
          briefHistory = Array.isArray(data.versions) ? data.versions : [];
          const editor = document.getElementById("brief-content");
          const phaseInput = document.getElementById("brief-phase");
          if (editor) editor.value = data.content || "";
          if (phaseInput) phaseInput.value = String((data.latest && data.latest.phase ? data.latest.phase : 0) + 1);
          briefVariables = (data.latest && Array.isArray(data.latest.variables)) ? data.latest.variables : extractBriefVariables(data.content || "");
          renderBriefVariables();
          renderBriefHistory();
        } catch (e) {
          alert("Load brief failed: " + e.message);
        }
      }

      async function saveBriefPhase() {
        const missionPath = getBriefSelectedMissionPath();
        const editor = document.getElementById("brief-content");
        const phaseInput = document.getElementById("brief-phase");
        if (!missionPath || !editor || !phaseInput) {
          alert("Select a mission and provide brief content.");
          return;
        }
        if (!editor.value.trim()) {
          alert("Brief content is empty.");
          return;
        }
        const phase = Math.max(1, parseInt(phaseInput.value || "1", 10) || 1);
        try {
          const res = await fetch("/api/mission/brief/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mission_path: missionPath,
              phase,
              content: editor.value,
              variables: briefVariables,
            })
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: "Failed to save brief phase." }));
            throw new Error(err.error || "Failed to save brief phase.");
          }
          await loadBriefForSelectedMission();
          alert(`Saved phase ${phase}.`);
        } catch (e) {
          alert("Save brief failed: " + e.message);
        }
      }

      function createNextBriefPhase() {
        const editor = document.getElementById("brief-content");
        const phaseInput = document.getElementById("brief-phase");
        if (!editor || !phaseInput) return;
        const currentPhase = Math.max(1, parseInt(phaseInput.value || "1", 10) || 1);
        const nextPhase = currentPhase + 1;
        let nextText = editor.value || "";
        nextText = nextText.replace(/Phase\\s*\\d+/gi, `Phase ${nextPhase}`);
        editor.value = nextText;
        phaseInput.value = String(nextPhase);
        briefVariables = extractBriefVariables(nextText);
        renderBriefVariables();
        if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
          navigator.clipboard.writeText(nextText).catch(() => {});
        }
      }

      function loadBriefVersion(index) {
        const v = briefHistory[index];
        if (!v) return;
        const missionPath = getBriefSelectedMissionPath();
        if (!missionPath) return;
        fetch(`/api/mission/brief/version?mission_path=${encodeURIComponent(missionPath)}&file=${encodeURIComponent(v.file || "")}`, { cache: "no-store" })
          .then(async (res) => {
            if (!res.ok) {
              const err = await res.json().catch(() => ({ error: "Failed to load selected version." }));
              throw new Error(err.error || "Failed to load selected version.");
            }
            return res.json();
          })
          .then((data) => {
            const editor = document.getElementById("brief-content");
            const phaseInput = document.getElementById("brief-phase");
            if (editor) editor.value = data.content || "";
            if (phaseInput) phaseInput.value = String((v.phase || 1) + 1);
            briefVariables = Array.isArray(v.variables) ? v.variables : extractBriefVariables(data.content || "");
            renderBriefVariables();
          })
          .catch((e) => alert("Load version failed: " + e.message));
      }

      async function fetchAndUpdate(endpoint, callback) {
        try {
          const data = await fetchJsonSmart(endpoint);
          callback(data);
        } catch (e) {
          console.error(`Fetch to ${endpoint} Failed`, e);
        }
      }

      async function submitNewMission() {
        const nameInput = document.getElementById("new-mission-name");
        const opInput = document.getElementById("new-mission-op");
        const statusSelect = document.getElementById("new-mission-status");
        const briefInput = document.getElementById("new-mission-brief");
        const debriefInput = document.getElementById("new-mission-debrief");
        const msgEl = document.getElementById("submission-message");

        if (!nameInput.value.trim()) {
          msgEl.innerHTML = '<span style="color:red;">NAME REQUIRED.</span>';
          return;
        }

        const briefContent = String(briefInput?.value || "").trim();
        const debriefContent = String(debriefInput?.value || "").trim();
        if (debriefContent && !briefContent) {
          msgEl.innerHTML = '<span style="color:red;">DEBRIEF REQUIRES BRIEF FIRST.</span>';
          return;
        }
        const lifecycleStatus = debriefContent ? "COMPLETE" : (briefContent ? "IN_PROGRESS" : (statusSelect?.value || "PENDING"));

        try {
          const res = await fetch("/api/mission", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: nameInput.value.trim(),
              operation: opInput.value.trim(),
              status: lifecycleStatus
            })
          });
          if (res.ok) {
            const data = await res.json().catch(() => ({}));
            const missionPath = String(data?.path || "");
            if (missionPath && briefContent) {
              const variables = typeof extractBriefVariables === "function" ? extractBriefVariables(briefContent) : [];
              const briefRes = await fetch("/api/mission/brief/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  mission_path: missionPath,
                  phase: 1,
                  content: briefContent,
                  variables,
                })
              });
              if (!briefRes.ok) {
                const err = await briefRes.json().catch(() => ({ error: "Mission created, brief save failed." }));
                msgEl.innerHTML = `<span style="color:var(--warning-yellow);">MISSION CREATED. BRIEF WARNING: ${escapeHtmlAttr(err.error || "BRIEF SAVE FAILED.")}</span>`;
              } else {
                msgEl.innerHTML = '<span style="color:var(--term-green);">SUCCESS + BRIEF SAVED.</span>';
              }
            } else {
              msgEl.innerHTML = '<span style="color:var(--term-green);">SUCCESS.</span>';
            }
            if (missionPath && debriefContent) {
              const debriefRes = await fetch("/api/mission/debrief/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  mission_path: missionPath,
                  content: debriefContent
                })
              });
              if (!debriefRes.ok) {
                const err = await debriefRes.json().catch(() => ({ error: "Debrief save failed." }));
                msgEl.innerHTML = `<span style="color:var(--warning-yellow);">MISSION/BRIEF SAVED. DEBRIEF WARNING: ${escapeHtmlAttr(err.error || "DEBRIEF SAVE FAILED.")}</span>`;
              } else {
                msgEl.innerHTML = '<span style="color:var(--term-green);">SUCCESS + BRIEF + DEBRIEF SAVED.</span>';
              }
            }
            selectedOperation = opInput.value.trim();
            nameInput.value = "";
            if (briefInput) briefInput.value = "";
            if (debriefInput) debriefInput.value = "";
            closeAllAddPopups();
            switchView("mission-log");
            fetchData();
          } else {
            const err = await res.json().catch(() => ({ error: "Failed to create mission." }));
            msgEl.innerHTML = `<span style="color:red;">ERROR: ${err.error || err.message || "CREATE FAILED."}</span>`;
          }
        } catch (e) { msgEl.innerText = "Error: " + e.message; }
      }

      async function submitNewOperation() {
        const nameInput = document.getElementById("new-op-name");
        const msgEl = document.getElementById("op-submission-message");

        if (!nameInput.value.trim()) {
          msgEl.innerHTML = '<span style="color:red;">NAME REQUIRED.</span>';
          return;
        }

        try {
          const res = await fetch("/api/operation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: nameInput.value.trim() })
          });
          if (res.ok) {
            msgEl.innerHTML = '<span style="color:var(--term-green);">INITIALIZED.</span>';
            nameInput.value = "";
            closeAllAddPopups();
            fetchData();
          } else {
            const err = await res.json();
            msgEl.innerHTML = `<span style="color:red;">ERROR: ${err.message}</span>`;
          }
        } catch (e) { msgEl.innerText = "Error: " + e.message; }
      }

      async function deleteMission(path) {
        if (!(await themedConfirm("Are you sure you want to delete this?"))) return;
        
        try {
          const res = await fetch("/api/mission", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: path })
          });
          if (res.ok) fetchData();
        } catch (e) { alert("Delete failed: " + e.message); }
      }

      async function deleteOperation(op, event) {
        if (event) event.stopPropagation();
        if (!(await themedConfirm("Are you sure you want to delete this?"))) return;

        try {
          const res = await fetch("/api/operation", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: op })
          });
          if (res.ok) {
            if (operationColors[op]) {
              delete operationColors[op];
              saveOperationColors();
            }
            operationOrder = operationOrder.filter((x) => x !== op);
            saveOperationOrder();
            fetchData();
          } else {
            const err = await res.json().catch(() => ({ error: "Delete failed." }));
            alert(err.error || "Delete failed.");
          }
        } catch (e) { alert("Delete failed: " + e.message); }
      }

      function deleteOperationFromButton(btn, event) {
        const op = btn ? (btn.getAttribute("data-op") || "") : "";
        if (!op) {
          alert("Delete failed: missing operation name.");
          return;
        }
        deleteOperation(op, event);
      }

      function operationColorsKey() {
        return "operationColors:v1";
      }

      function normalizeHexColor(color) {
        const v = String(color || "").trim();
        return /^#[0-9a-fA-F]{6}$/.test(v) ? v : "";
      }

      function loadOperationColors() {
        try {
          const raw = localStorage.getItem(operationColorsKey());
          const parsed = raw ? JSON.parse(raw) : {};
          operationColors = (parsed && typeof parsed === "object") ? parsed : {};
        } catch (e) {
          operationColors = {};
        }
      }

      function saveOperationColors() {
        localStorage.setItem(operationColorsKey(), JSON.stringify(operationColors));
      }

      function getOperationColor(op) {
        return normalizeHexColor(operationColors[op] || "");
      }

      function setOperationColor(op, color) {
        if (!op) return;
        const normalized = normalizeHexColor(color);
        if (!normalized) return;
        operationColors[op] = normalized;
        saveOperationColors();
        renderOperations();
      }

      function setOperationColorFromInput(inputEl, event) {
        if (event) event.stopPropagation();
        const op = inputEl ? (inputEl.getAttribute("data-op") || "") : "";
        const color = inputEl ? inputEl.value : "";
        setOperationColor(op, color);
      }

      function resetOperationColor(op) {
        if (!op) return;
        if (operationColors[op]) {
          delete operationColors[op];
          saveOperationColors();
        }
        renderOperations();
      }

      function resetOperationColorFromButton(btn, event) {
        if (event) event.stopPropagation();
        const op = btn ? (btn.getAttribute("data-op") || "") : "";
        resetOperationColor(op);
      }

      function operationOrderKey() {
        return "operationOrder:v1";
      }

      function loadOperationOrder() {
        try {
          const raw = localStorage.getItem(operationOrderKey());
          const parsed = raw ? JSON.parse(raw) : [];
          operationOrder = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          operationOrder = [];
        }
      }

      function saveOperationOrder() {
        localStorage.setItem(operationOrderKey(), JSON.stringify(operationOrder));
      }

      function syncOperationOrder() {
        const existing = new Set(allOps);
        operationOrder = operationOrder.filter((op) => existing.has(op));
        allOps.forEach((op) => {
          if (!operationOrder.includes(op)) operationOrder.push(op);
        });
        saveOperationOrder();
      }

      function orderedOperations() {
        const rank = new Map(operationOrder.map((op, idx) => [op, idx]));
        return [...allOps].sort((a, b) => {
          const ra = rank.has(a) ? rank.get(a) : Number.MAX_SAFE_INTEGER;
          const rb = rank.has(b) ? rank.get(b) : Number.MAX_SAFE_INTEGER;
          if (ra !== rb) return ra - rb;
          return a.localeCompare(b);
        });
      }

      function onOperationDragStart(cardEl, event) {
        const op = cardEl ? (cardEl.getAttribute("data-op") || "") : "";
        if (!op || !event) return;
        draggingOperation = op;
        lastDragOverOperation = "";
        if (event.dataTransfer) {
          event.dataTransfer.setData("text/plain", op);
          event.dataTransfer.effectAllowed = "move";
        }
      }

      function onOperationDragOver(cardEl, event) {
        if (!event || !draggingOperation) return;
        event.preventDefault();
        if (cardEl) {
          cardEl.classList.add("drag-over");
          lastDragOverOperation = cardEl.getAttribute("data-op") || "";
        }
      }

      function onOperationDragLeave(cardEl) {
        if (cardEl) cardEl.classList.remove("drag-over");
      }

      async function onOperationDrop(cardEl, event) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        const target = cardEl ? (cardEl.getAttribute("data-op") || "") : "";
        if (!draggingOperation || !target || draggingOperation === target) {
          onOperationDragEnd();
          return;
        }
        const suggested = `${draggingOperation}_${target}`;
        const mergedName = await themedPrompt("New merged operation name", suggested);
        if (!mergedName || !mergedName.trim()) {
          onOperationDragEnd();
          return;
        }
        mergeOperations(draggingOperation, target, mergedName.trim());
        onOperationDragEnd();
      }

      function onOperationGridDragOver(event) {
        if (!draggingOperation || !event) return;
        event.preventDefault();
      }

      async function onOperationGridDrop(event) {
        if (!event) return;
        event.preventDefault();
        if (!draggingOperation) return;
        const cardTarget = event.target && event.target.closest ? event.target.closest(".op-card") : null;
        if (cardTarget) return;
        const fallbackTarget = lastDragOverOperation;
        if (!fallbackTarget || fallbackTarget === draggingOperation) {
          onOperationDragEnd();
          return;
        }
        const suggested = `${draggingOperation}_${fallbackTarget}`;
        const mergedName = await themedPrompt("New merged operation name", suggested);
        if (!mergedName || !mergedName.trim()) {
          onOperationDragEnd();
          return;
        }
        mergeOperations(draggingOperation, fallbackTarget, mergedName.trim());
        onOperationDragEnd();
      }

      function onOperationDragEnd() {
        draggingOperation = "";
        lastDragOverOperation = "";
        document.querySelectorAll(".op-card.drag-over").forEach((el) => el.classList.remove("drag-over"));
      }

      async function mergeOperations(dragOp, targetOp, mergedName) {
        try {
          const res = await fetch("/api/operation/merge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ source: dragOp, target: targetOp, name: mergedName })
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: "Merge failed." }));
            alert(err.error || "Merge failed.");
            return false;
          }
          const oldOps = new Set([dragOp, targetOp]);
          Object.keys(operationColors).forEach((k) => {
            if (oldOps.has(k)) delete operationColors[k];
          });
          saveOperationColors();
          fetchData();
          return true;
        } catch (e) {
          alert("Merge failed: " + e.message);
          return false;
        }
      }

      async function deleteBlackbookLog(probeId) {
        if (!(await themedConfirm("Are you sure you want to delete this?"))) return;
        try {
          const res = await fetch("/api/blackbook", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ probe_id: probeId })
          });
          if (res.ok) fetchData();
        } catch (e) { alert("Delete failed: " + e.message); }
      }

      function deleteBlackbookFromButton(btn) {
        const row = btn ? btn.closest("tr") : null;
        const probeId = row ? (row.getAttribute("data-probe-id") || "") : "";
        if (!probeId) {
          alert("Delete failed: missing Probe ID.");
          return;
        }
        deleteBlackbookLog(probeId);
      }

      function saveBlackbookFromButton(btn) {
        const row = btn ? btn.closest("tr") : null;
        if (!row) return;
        const probeId = row.getAttribute("data-probe-id") || "";
        const existing = allBlackbook.find((x) => String(x?.Probe_ID || "") === String(probeId)) || {};
        const payload = {
          Probe_ID: probeId,
          Date: row.querySelector(".bb-date")?.value || existing.Date || "",
          Time: row.querySelector(".bb-time")?.value || existing.Time || "",
          Operation: row.querySelector(".bb-operation")?.value || "",
          Mission: row.querySelector(".bb-mission")?.value || "",
          Status: row.querySelector(".bb-status")?.value || "PENDING",
          Description: row.querySelector(".bb-description")?.value || "",
          Hypothesis: row.querySelector(".bb-hypothesis")?.value || existing.Hypothesis || "",
          Platform: row.querySelector(".bb-platform")?.value || existing.Platform || "",
          Result_Quantitative: row.querySelector(".bb-result")?.value || existing.Result_Quantitative || "",
          Notes: row.querySelector(".bb-notes")?.value || existing.Notes || "",
        };

        fetch("/api/blackbook/upsert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
          .then(async (res) => {
            if (!res.ok) {
              const err = await res.json().catch(() => ({ error: "Save failed." }));
              throw new Error(err.error || "Save failed.");
            }
            fetchData();
          })
          .catch((e) => alert("Blackbook save failed: " + e.message));
      }

      function queueBlackbookAutoSaveFromElement(el) {
        const row = el ? el.closest("tr") : null;
        if (!row) return;
        const probeId = String(row.getAttribute("data-probe-id") || "");
        if (!probeId) return;
        if (blackbookSaveTimers[probeId]) clearTimeout(blackbookSaveTimers[probeId]);
        blackbookSaveTimers[probeId] = setTimeout(() => {
          delete blackbookSaveTimers[probeId];
          const existing = allBlackbook.find((x) => String(x?.Probe_ID || "") === probeId) || {};
          const payload = {
            Probe_ID: probeId,
            Date: row.querySelector(".bb-date")?.value || existing.Date || "",
            Time: row.querySelector(".bb-time")?.value || existing.Time || "",
            Operation: row.querySelector(".bb-operation")?.value || "",
            Mission: row.querySelector(".bb-mission")?.value || "",
            Status: row.querySelector(".bb-status")?.value || "PENDING",
            Description: row.querySelector(".bb-description")?.value || "",
            Hypothesis: row.querySelector(".bb-hypothesis")?.value || existing.Hypothesis || "",
            Platform: row.querySelector(".bb-platform")?.value || existing.Platform || "",
            Result_Quantitative: row.querySelector(".bb-result")?.value || existing.Result_Quantitative || "",
            Notes: row.querySelector(".bb-notes")?.value || existing.Notes || "",
          };
          fetch("/api/blackbook/upsert", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }).then(() => fetchData()).catch(() => {});
        }, 300);
      }

      async function deleteHvi(handle) {
        if (!(await themedConfirm("Are you sure you want to delete this?"))) return;
        try {
          const res = await fetch("/api/hvi", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ handle: handle })
          });
          if (res.ok) fetchData();
        } catch (e) { alert("Delete failed: " + e.message); }
      }

      async function submitNewHvi() {
        const handleEl = document.getElementById("new-hvi-handle");
        const statusEl = document.getElementById("new-hvi-status");
        const numberEl = document.getElementById("new-hvi-number");
        const categoryEl = document.getElementById("new-hvi-category");
        const parametersEl = document.getElementById("new-hvi-parameters");
        const photoUrlEl = document.getElementById("new-hvi-photo-url");
        const photoFileEl = document.getElementById("new-hvi-photo-file");
        const handle = (handleEl?.value || "").trim();
        if (!handle) {
          themedNotice("HVI handle is required.");
          return;
        }
        const now = new Date();
        const createdAt = now.toISOString();
        const fields = {
          Status: (statusEl?.value || "").trim() || "N/A",
          Number: (numberEl?.value || "").trim() || "N/A",
          Category: (categoryEl?.value || "").trim() || "General",
          Parameters: (parametersEl?.value || "").trim() || "",
          "Created At": createdAt,
          Date: createdAt.slice(0, 10),
          Time: createdAt.slice(11, 16),
        };
        try {
          const res = await fetch("/api/hvi", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ handle, fields }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: "Failed to create HVI target." }));
            throw new Error(err.error || "Failed to create HVI target.");
          }
          let photo = String(photoUrlEl?.value || "").trim();
          if (photoFileEl && photoFileEl.files && photoFileEl.files[0]) {
            try {
              photo = await readFileAsDataUrl(photoFileEl.files[0]);
            } catch (e) {
              themedNotice("HVI photo upload failed.");
              return;
            }
          }
          if (photo) {
            const extra = getHviExtra(handle);
            if (!extra.photos.includes(photo)) extra.photos.push(photo);
            setHviExtra(handle, extra);
          }
          if (handleEl) handleEl.value = "";
          if (statusEl) statusEl.value = "";
          if (numberEl) numberEl.value = "";
          if (categoryEl) categoryEl.value = "";
          if (parametersEl) parametersEl.value = "";
          if (photoUrlEl) photoUrlEl.value = "";
          if (photoFileEl) photoFileEl.value = "";
          closeAllAddPopups();
          await fetchData();
          themedNotice("HVI target added.");
        } catch (e) {
          themedNotice("Add HVI failed: " + e.message);
        }
      }

      async function clearProgressLogs() {
        if (!(await themedConfirm("Are you sure you want to delete this?"))) return;
        try {
          await fetch("/api/logs", { method: "DELETE" });
          const logOutput = document.getElementById("log-output");
          if (logOutput) logOutput.innerHTML = "> Logs cleared.";
        } catch (e) { alert("Failed to clear logs: " + e.message); }
      }

      async function updateMissionStatus(path, status) {
        try {
          const res = await fetch("/api/mission/status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path, status })
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: "Failed to update mission status." }));
            alert(err.error || "Failed to update mission status.");
          } else {
            fetchData();
          }
        } catch (e) {
          alert("Failed to update mission status: " + e.message);
        }
      }

      function missionStatusClass(status) {
        const key = (status || "").toLowerCase().replace(/_/g, "-");
        return `mission-status-select status-${key}`;
      }

      function onMissionStatusChange(selectEl, path) {
        selectEl.className = missionStatusClass(selectEl.value);
        updateMissionStatus(path, selectEl.value);
      }

      async function openMissionEditor(path) {
        if (!path) return;
        try {
          const missionPath = String(path || "");
          missionEditorPath = missionPath;
          const overlay = document.getElementById("intel-overlay");
          const titleEl = document.getElementById("intel-title");
          const subtitle = document.getElementById("intel-subtitle");
          const body = document.getElementById("intel-body");
          const saveBtn = document.getElementById("intel-save-btn");
          const delBtn = document.getElementById("intel-delete-btn");
          const modal = overlay ? overlay.querySelector(".intel-modal") : null;
          if (!overlay || !titleEl || !subtitle || !body || !saveBtn || !delBtn) return;
          overlay.classList.remove("fullscreen");
          if (modal) modal.classList.remove("intel-modal-full");
          missionEditorMode = "mission";
          missionEditorFile = "";
          missionEditorReloadTarget = "";
          missionPopupSection = "brief";
          const [briefRes, debriefRes] = await Promise.all([
            fetch(`/api/mission/brief?mission_path=${encodeURIComponent(missionPath)}`, { cache: "no-store" }),
            fetch(`/api/mission/debrief?mission_path=${encodeURIComponent(missionPath)}`, { cache: "no-store" }),
          ]);
          if (!briefRes.ok) {
            const err = await briefRes.json().catch(() => ({ error: "Failed to load mission brief." }));
            throw new Error(err.error || "Failed to load mission brief.");
          }
          const briefData = await briefRes.json();
          const debriefData = debriefRes.ok ? await debriefRes.json() : { content: "" };
          missionEditorBriefContent = String(briefData?.content || "").trim();
          missionEditorDebriefContent = String(debriefData?.content || "").trim();
          missionEditorHasBrief = Boolean(missionEditorBriefContent || (Array.isArray(briefData?.versions) && briefData.versions.length));
          missionEditorNextBriefPhase = Math.max(1, Number((briefData?.latest?.phase || 0)) + 1);
          const m = allMissions.find((x) => String(x.path || "") === missionPath);
          const heading = String((missionEditorBriefContent.match(/^\s*#\s+(.+)\s*$/m) || [])[1] || "").trim();
          const op = String(m?.operation || "N/A");
          const name = heading || String(m?.name || missionPath.split("/").pop() || "Mission");
          const status = String(m?.status || "PENDING");
          intelPopupType = "mission";
          titleEl.textContent = "// MISSION BRIEFING";
          subtitle.textContent = `${op} :: ${name}`;
          body.innerHTML = `
            <div class="intel-grid">
              <div class="form-group"><label>Operation</label><input id="intel-mission-op" type="text" value="${escapeHtmlAttr(op)}" readonly /></div>
              <div class="form-group"><label>Mission</label><input id="intel-mission-name" type="text" value="${escapeHtmlAttr(name)}" readonly /></div>
              <div class="form-group"><label>Status</label>
                <select id="intel-mission-status" onchange="updateMissionStatus('${escapeJsString(missionPath)}', this.value)">
                  <option value="PENDING" ${status === "PENDING" ? "selected" : ""}>PENDING</option>
                  <option value="IN_PROGRESS" ${status === "IN_PROGRESS" ? "selected" : ""}>IN_PROGRESS</option>
                  <option value="COMPLETE" ${status === "COMPLETE" ? "selected" : ""}>COMPLETE</option>
                  <option value="BLOCKED" ${status === "BLOCKED" ? "selected" : ""}>BLOCKED</option>
                </select>
              </div>
              <div class="form-group" style="display:flex; align-items:end;">
                <button class="confirm-btn" type="button" onclick="toggleMissionIntelSection()" id="intel-mission-toggle">NEXT ▶ DEBRIEF</button>
              </div>
              <div class="form-group full"><label id="intel-mission-content-label">Brief</label>
                <textarea id="intel-mission-content" placeholder="Paste mission brief...">${escapeHtmlAttr(missionEditorBriefContent || "")}</textarea>
              </div>
            </div>
          `;
          saveBtn.style.display = "";
          delBtn.style.display = "none";
          overlay.classList.add("active");
          overlay.setAttribute("aria-hidden", "false");
          const contentEl = document.getElementById("intel-mission-content");
          if (contentEl) contentEl.focus();
        } catch (e) {
          alert("Open mission failed: " + e.message);
        }
      }

      function toggleMissionIntelSection() {
        if (intelPopupType !== "mission") return;
        const textEl = document.getElementById("intel-mission-content");
        const labelEl = document.getElementById("intel-mission-content-label");
        const btn = document.getElementById("intel-mission-toggle");
        if (!textEl || !labelEl || !btn) return;
        if (missionPopupSection === "brief") {
          missionEditorBriefContent = textEl.value || "";
          if (!String(missionEditorBriefContent).trim() && !missionEditorHasBrief) {
            themedNotice("Save or paste Brief first, then open Debrief.");
            return;
          }
          missionPopupSection = "debrief";
          labelEl.textContent = "Debrief";
          textEl.value = missionEditorDebriefContent || "";
          textEl.placeholder = "Paste mission debrief...";
          btn.textContent = "◀ BRIEF";
        } else {
          missionEditorDebriefContent = textEl.value || "";
          missionPopupSection = "brief";
          labelEl.textContent = "Brief";
          textEl.value = missionEditorBriefContent || "";
          textEl.placeholder = "Paste mission brief...";
          btn.textContent = "NEXT ▶ DEBRIEF";
        }
      }

      async function openDocEditor(fileName, titleText, reloadTargetId = "") {
        if (!fileName) return;
        try {
          const res = await fetch(`/api/doc/content?file=${encodeURIComponent(fileName)}`, { cache: "no-store" });
          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: "Failed to load document." }));
            throw new Error(err.error || "Failed to load document.");
          }
          const data = await res.json();
          const overlay = document.getElementById("mission-editor-overlay");
          const titleEl = document.getElementById("mission-editor-title");
          const pathEl = document.getElementById("mission-editor-path");
          const textEl = document.getElementById("mission-editor-text");
          const nextBtn = document.getElementById("mission-editor-next");
          if (!overlay || !titleEl || !pathEl || !textEl) return;
          missionEditorMode = "doc";
          missionEditorFile = String(data.file || fileName);
          missionEditorReloadTarget = reloadTargetId || "";
          missionEditorPath = String(data.path || fileName);
          titleEl.textContent = titleText || "// DOCUMENT EDITOR";
          pathEl.textContent = missionEditorPath;
          textEl.value = data.content || "";
          if (nextBtn) nextBtn.style.display = "none";
          overlay.classList.add("active");
          overlay.setAttribute("aria-hidden", "false");
          textEl.focus();
        } catch (e) {
          themedNotice("Open document failed: " + e.message);
        }
      }

      function toggleMissionEditorSection() {
        if (missionEditorMode !== "mission") return;
        const textEl = document.getElementById("mission-editor-text");
        const titleEl = document.getElementById("mission-editor-title");
        const pathEl = document.getElementById("mission-editor-path");
        const nextBtn = document.getElementById("mission-editor-next");
        if (!textEl || !titleEl || !pathEl || !nextBtn) return;
        if (missionEditorSection === "brief") {
          missionEditorBriefContent = textEl.value || "";
          if (!String(missionEditorBriefContent).trim() && !missionEditorHasBrief) {
            themedNotice("Save or paste Brief first, then open Debrief.");
            return;
          }
          missionEditorSection = "debrief";
          titleEl.textContent = "// MISSION DEBRIEF";
          pathEl.textContent = `${missionEditorPath} | DEBRIEF`;
          textEl.value = missionEditorDebriefContent || "";
          nextBtn.textContent = "◀ BRIEF";
        } else {
          missionEditorDebriefContent = textEl.value || "";
          missionEditorSection = "brief";
          titleEl.textContent = "// MISSION BRIEF";
          pathEl.textContent = `${missionEditorPath} | BRIEF`;
          textEl.value = missionEditorBriefContent || "";
          nextBtn.textContent = "NEXT ▶";
        }
      }

      function closeMissionEditor() {
        const overlay = document.getElementById("mission-editor-overlay");
        if (!overlay) return;
        overlay.classList.remove("active");
        overlay.setAttribute("aria-hidden", "true");
      }

      async function saveMissionEditor() {
        if (!missionEditorPath) return;
        const textEl = document.getElementById("mission-editor-text");
        const content = textEl ? textEl.value : "";
        try {
          let url = "/api/doc/content";
          let body = { file: missionEditorFile, content };
          if (missionEditorMode === "mission") {
            if (missionEditorSection === "brief") {
              url = "/api/mission/brief/save";
              body = {
                mission_path: missionEditorPath,
                phase: missionEditorNextBriefPhase,
                content,
                variables: typeof extractBriefVariables === "function" ? extractBriefVariables(content || "") : [],
              };
            } else {
              if (!missionEditorHasBrief && !String(missionEditorBriefContent || "").trim()) {
                throw new Error("Brief required before Debrief.");
              }
              url = "/api/mission/debrief/save";
              body = { mission_path: missionEditorPath, content };
            }
          }
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: "Failed to save file." }));
            throw new Error(err.error || "Failed to save file.");
          }
          await fetchData();
          if (missionEditorMode === "mission") {
            if (missionEditorSection === "brief") {
              missionEditorBriefContent = content || "";
              missionEditorHasBrief = Boolean(String(missionEditorBriefContent).trim());
              missionEditorNextBriefPhase += 1;
              themedNotice("Brief saved.");
            } else {
              missionEditorDebriefContent = content || "";
              themedNotice("Debrief saved. HVI updated from debrief.");
            }
          }
          if (missionEditorMode === "doc" && missionEditorFile && missionEditorReloadTarget) {
            await loadMarkdownInto(`/${missionEditorFile}`, missionEditorReloadTarget, `Failed to load ${missionEditorFile}`);
          }
          closeMissionEditor();
        } catch (e) {
          alert("Save failed: " + e.message);
        }
      }

      function renderMissions() {
        const tbody = document.querySelector("#view-mission-log tbody");
        if (!tbody) return;

        let filtered = allMissions;
        if (selectedOperation) {
          filtered = filtered.filter(m => m.operation === selectedOperation || m.operation.startsWith(`${selectedOperation}/`));
        }
        if (missionSearchQuery) {
          filtered = filtered.filter(m => 
            m.name.toLowerCase().includes(missionSearchQuery) || 
            m.operation.toLowerCase().includes(missionSearchQuery) ||
            (m.status || "").toLowerCase().includes(missionSearchQuery)
          );
        }

        tbody.innerHTML = filtered.map(m => `
          <tr ondblclick="openMissionEditor('${escapeJsString(m.path)}')" title="Double-click to open mission brief">
            <td>${m.date}</td>
            <td>${m.operation}</td>
            <td><span class="mission-link status-${String(m.status || "PENDING").toLowerCase().replace(/_/g, "-")}" onclick="openMissionEditor('${escapeJsString(m.path)}')" title="Open full mission brief">${m.name}</span></td>
            <td>
              <select class="${missionStatusClass(m.status)}" onchange="onMissionStatusChange(this, '${escapeJsString(m.path)}')">
                <option value="PENDING" ${m.status === "PENDING" ? "selected" : ""}>PENDING</option>
                <option value="IN_PROGRESS" ${m.status === "IN_PROGRESS" ? "selected" : ""}>IN_PROGRESS</option>
                <option value="COMPLETE" ${m.status === "COMPLETE" ? "selected" : ""}>COMPLETE</option>
                <option value="BLOCKED" ${m.status === "BLOCKED" ? "selected" : ""}>BLOCKED</option>
              </select>
            </td>
            <td style="text-align: center;">
              <div class="mission-actions-inline">
                <button class="submit-btn" style="padding:4px 8px;" onclick="openMissionEditor('${escapeJsString(m.path)}')" title="Open Briefs / Debrief">BRIEFS</button>
                <button class="x-btn" onclick="deleteMission('${escapeJsString(m.path)}')" title="Delete Mission">X</button>
              </div>
            </td>
          </tr>
        `).join("") || "<tr><td colspan='5'>No missions found.</td></tr>";
      }

      function renderOperations() {
        const grid = document.querySelector("#view-operations .ops-grid");
        if (!grid) return;
        grid.ondragover = onOperationGridDragOver;
        grid.ondrop = onOperationGridDrop;

        let filtered = orderedOperations();
        if (!filtered.length && Array.isArray(allMissions) && allMissions.length) {
          filtered = [...new Set(allMissions.map((m) => String(m.operation || "").trim()).filter(Boolean))]
            .sort((a, b) => a.localeCompare(b));
        }
        if (operationSearchQuery) {
          filtered = filtered.filter(op => op.toLowerCase().includes(operationSearchQuery));
        }

        grid.innerHTML = filtered.map(op => {
          const opColor = getOperationColor(op) || "#00ff41";
          const safeColor = escapeHtmlAttr(opColor);
          return `
          <div
            class="op-card"
            data-op="${escapeHtmlAttr(op)}"
            draggable="true"
            onclick="handleOpCardFromCard(this)"
            ondragstart="onOperationDragStart(this, event)"
            ondragover="onOperationDragOver(this, event)"
            ondragleave="onOperationDragLeave(this)"
            ondrop="onOperationDrop(this, event)"
            ondragend="onOperationDragEnd()"
            style="border-color:${safeColor}; box-shadow: inset 0 0 0 1px ${safeColor}33;"
          >
            <div class="op-color-wrap" onclick="event.stopPropagation()">
              <input
                class="op-color-input"
                type="color"
                data-op="${escapeHtmlAttr(op)}"
                value="${safeColor}"
                title="Operation color"
                onclick="event.stopPropagation()"
                onchange="setOperationColorFromInput(this, event)"
              />
            </div>
            <button class="op-color-reset-mini" data-op="${escapeHtmlAttr(op)}" onclick="resetOperationColorFromButton(this, event)" title="Reset to green">↺</button>
            <button class="op-delete-btn" data-op="${escapeHtmlAttr(op)}" onclick="deleteOperationFromButton(this, event)" title="Delete Operation">X</button>
            <span class="op-icon">📁</span>
            ${op.toUpperCase()}
          </div>
        `}).join("") || "<p>No matching operations.</p>";
      }

      function renderBlackbook() {
        const mainTbody = document.querySelector("#view-blackbook tbody");
        const opsTbody = document.getElementById("operations-blackbook-tbody");
        if (!mainTbody && !opsTbody) return;
        let data = allBlackbook;
        if (blackbookSearchQuery) {
          data = data.filter((p) => {
            const blob = [
              p.Probe_ID, p.Date, p.Time, p.Operation, p.Mission, p.Status,
              p.Description, p.Hypothesis, p.Platform, p.Result_Quantitative, p.Notes
            ].join(" ").toLowerCase();
            return blob.includes(blackbookSearchQuery);
          });
        }
        const rowsHtml = data.map((p, idx) => {
          const status = String(p.Status || "PENDING");
          const statusClass = `mission-link status-${status.toLowerCase().replace(/_/g, "-")}`;
          return `
          <tr data-probe-id="${escapeHtmlAttr(p.Probe_ID || "")}" ondblclick="openBlackbookPopup('${escapeJsString(p.Probe_ID || "")}', ${idx})" title="Double-click to open full entry">
            <td>${escapeHtml(p.Operation || "")}</td>
            <td>${escapeHtml(p.Mission || "")}</td>
            <td><span class="${statusClass}">${escapeHtml(status)}</span></td>
            <td>${escapeHtml(p.Description || "")}</td>
            <td style="text-align:center;">
              <div class="bb-actions">
                <button class="bb-delete-btn" onclick="deleteBlackbookFromButton(this)" title="Delete Blackbook Log">X</button>
              </div>
            </td>
          </tr>
        `;
        }).join("") || "<tr><td colspan='5'>No blackbook logs.</td></tr>";
        if (mainTbody) mainTbody.innerHTML = rowsHtml;
        if (opsTbody) opsTbody.innerHTML = rowsHtml;
      }

      function renderHvi() {
        const container = document.getElementById("hvi-container");
        if (!container) return;
        let data = allHvi.map((h) => augmentHvi(h));
        const categorySelect = document.getElementById("hvi-filter-category");
        if (categorySelect) {
          const categories = [...new Set(
            data.map((h) => hviCategoryFromItem(h)).filter(Boolean)
          )].sort((a, b) => a.localeCompare(b));
          categorySelect.innerHTML = `<option value="">All Categories</option>${categories.map((c) => `<option value="${escapeHtmlAttr(c)}">${escapeHtmlAttr(c)}</option>`).join("")}`;
          const selected = (hviFilterCategory || "").trim();
          const hit = categories.find((c) => c.toLowerCase() === selected);
          categorySelect.value = hit || "";
        }
        if (hviSearchQuery) {
          data = data.filter((h) => {
            const blob = [
              h.handle || "",
              h.stage || "",
              h.status || "",
              h.number || "",
              ...(Array.isArray(h.emails) ? h.emails : []),
              ...(Array.isArray(h.leads) ? h.leads : []),
              ...(Array.isArray(h.photos) ? h.photos : []),
              ...(h.customStats && typeof h.customStats === "object" ? Object.entries(h.customStats).flatMap(([k, v]) => [k, v]) : []),
              ...(h.fields && typeof h.fields === "object" ? Object.entries(h.fields).flatMap(([k, v]) => [k, v]) : []),
            ].join(" ").toLowerCase();
            return blob.includes(hviSearchQuery);
          });
        }
        if (hviFilterCategory) {
          data = data.filter((h) => hviCategoryFromItem(h).toLowerCase() === hviFilterCategory);
        }
        if (hviFilterParam) {
          data = data.filter((h) => {
            const params = hviParametersFromItem(h);
            const fieldsBlob = Object.entries(h.fields || {}).flatMap(([k, v]) => [k, v]).join(" ");
            return `${params} ${fieldsBlob}`.toLowerCase().includes(hviFilterParam);
          });
        }
        if (hviFilterDateFrom || hviFilterDateTo) {
          const from = hviFilterDateFrom ? new Date(`${hviFilterDateFrom}T00:00:00`) : null;
          const to = hviFilterDateTo ? new Date(`${hviFilterDateTo}T23:59:59`) : null;
          data = data.filter((h) => {
            const d = hviDateFromItem(h);
            if (!d) return false;
            if (from && d < from) return false;
            if (to && d > to) return false;
            return true;
          });
        }

        container.innerHTML = data.map(h => `
          <div class="hvi-card hvi-summary-row ${hviFreshnessClass(h)}" ondblclick="openHviPopup('${escapeJsString(h.handle || "Unknown")}')" title="Double-click to open profile">
            <button class="x-btn hvi-row-delete" onclick="event.stopPropagation(); deleteHvi('${escapeJsString(h.handle || "Unknown")}')" title="Delete HVI">X</button>
            <div class="hvi-summary-main">
              ${Array.isArray(h.photos) && h.photos[0] ? `<img class="hvi-thumb" src="${escapeHtmlAttr(h.photos[0])}" alt="HVI photo" />` : `<div class="hvi-thumb hvi-thumb-empty">NO PHOTO</div>`}
              <div class="hvi-summary-text">
                <div class="hvi-summary-name">${escapeHtmlAttr(h.handle || "Unknown")}</div>
                <div class="hvi-summary-brief">${escapeHtmlAttr(hviBriefText(h))}</div>
              </div>
            </div>
          </div>
        `).join("") || "<div class='hvi-card'><p>No HVI profiles found.</p></div>";
      }

      function operationalDayKey(now = new Date()) {
        const d = new Date(now);
        if (d.getHours() < 4) d.setDate(d.getDate() - 1);
        return d.toISOString().slice(0, 10);
      }

      function getQuarterState(now = new Date()) {
        const dayStart = new Date(now);
        dayStart.setHours(4, 0, 0, 0);
        if (now < dayStart) dayStart.setDate(dayStart.getDate() - 1);
        const elapsedMs = now - dayStart;
        const quarterMs = 3 * 60 * 60 * 1000;
        const quarterIndex = Math.min(7, Math.floor(elapsedMs / quarterMs));
        const quarterStart = new Date(dayStart.getTime() + quarterIndex * quarterMs);
        const quarterEnd = new Date(quarterStart.getTime() + quarterMs);
        const minuteInQuarter = Math.floor((now - quarterStart) / 60000);

        let phase = "RECOVERY";
        let cadence = "Eat / Read / Exercise / Checklist";
        let currentBlock = 0;
        let inWork = false;
        let blockStart = null;
        let blockEnd = null;
        if (minuteInQuarter < 120) {
          phase = "MISSION BLOCK";
          if (minuteInQuarter < 25) {
            currentBlock = 1;
            inWork = true;
            cadence = "BLOCK 1 (WORK)";
            blockStart = new Date(quarterStart.getTime() + 0 * 60000);
            blockEnd = new Date(quarterStart.getTime() + 25 * 60000);
          } else if (minuteInQuarter < 30) {
            currentBlock = 1;
            cadence = "BREAK";
            blockStart = new Date(quarterStart.getTime() + 25 * 60000);
            blockEnd = new Date(quarterStart.getTime() + 30 * 60000);
          } else if (minuteInQuarter < 55) {
            currentBlock = 2;
            inWork = true;
            cadence = "BLOCK 2 (WORK)";
            blockStart = new Date(quarterStart.getTime() + 30 * 60000);
            blockEnd = new Date(quarterStart.getTime() + 55 * 60000);
          } else if (minuteInQuarter < 60) {
            currentBlock = 2;
            cadence = "BREAK";
            blockStart = new Date(quarterStart.getTime() + 55 * 60000);
            blockEnd = new Date(quarterStart.getTime() + 60 * 60000);
          } else if (minuteInQuarter < 85) {
            currentBlock = 3;
            inWork = true;
            cadence = "BLOCK 3 (WORK)";
            blockStart = new Date(quarterStart.getTime() + 60 * 60000);
            blockEnd = new Date(quarterStart.getTime() + 85 * 60000);
          } else if (minuteInQuarter < 90) {
            currentBlock = 3;
            cadence = "BREAK";
            blockStart = new Date(quarterStart.getTime() + 85 * 60000);
            blockEnd = new Date(quarterStart.getTime() + 90 * 60000);
          } else if (minuteInQuarter < 115) {
            currentBlock = 4;
            inWork = true;
            cadence = "BLOCK 4 (WORK)";
            blockStart = new Date(quarterStart.getTime() + 90 * 60000);
            blockEnd = new Date(quarterStart.getTime() + 115 * 60000);
          } else {
            currentBlock = 4;
            cadence = "BREAK";
            blockStart = new Date(quarterStart.getTime() + 115 * 60000);
            blockEnd = new Date(quarterStart.getTime() + 120 * 60000);
          }
        } else if (minuteInQuarter < 175) {
          phase = "RECOVERY BLOCK";
          if (minuteInQuarter < 145) {
            currentBlock = 5;
            cadence = "RECOVERY BLOCK 5";
            blockStart = new Date(quarterStart.getTime() + 120 * 60000);
            blockEnd = new Date(quarterStart.getTime() + 145 * 60000);
          } else if (minuteInQuarter < 150) {
            currentBlock = 5;
            cadence = "BREAK";
            blockStart = new Date(quarterStart.getTime() + 145 * 60000);
            blockEnd = new Date(quarterStart.getTime() + 150 * 60000);
          } else {
            currentBlock = 6;
            cadence = "RECOVERY BLOCK 6";
            blockStart = new Date(quarterStart.getTime() + 150 * 60000);
            blockEnd = new Date(quarterStart.getTime() + 175 * 60000);
          }
        } else {
          phase = "RESET WINDOW";
          currentBlock = 6;
          cadence = "BREAK";
          blockStart = new Date(quarterStart.getTime() + 175 * 60000);
          blockEnd = new Date(quarterStart.getTime() + 180 * 60000);
        }

        return {
          quarterIndex: quarterIndex + 1,
          quarterStart,
          quarterEnd,
          phase,
          cadence,
          currentBlock,
          inWork,
          blockStart,
          blockEnd,
          dayStart,
        };
      }

      function formatHm(d) {
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
      }

      function formatUkHm(d) {
        return d.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "Europe/London",
        });
      }

      function missionPlanKey(opDay) {
        return `missionPlan:${opDay}`;
      }

      function enforceDailyPlanReset(opDay) {
        const dayMarkerKey = "missionPlan:lastOpDay";
        const prev = localStorage.getItem(dayMarkerKey);
        if (prev === opDay) return;

        // New operational day detected: start with a clean planner
        localStorage.setItem(dayMarkerKey, opDay);
        localStorage.setItem(missionPlanKey(opDay), JSON.stringify({}));

        // Keep storage clean by removing old day plans
        const toDelete = [];
        for (let i = 0; i < localStorage.length; i += 1) {
          const k = localStorage.key(i);
          if (k && k.startsWith("missionPlan:") && k !== missionPlanKey(opDay) && k !== dayMarkerKey) {
            toDelete.push(k);
          }
        }
        toDelete.forEach((k) => localStorage.removeItem(k));
      }

      function loadMissionPlan(opDay) {
        enforceDailyPlanReset(opDay);
        try {
          const raw = localStorage.getItem(missionPlanKey(opDay));
          const parsed = raw ? JSON.parse(raw) : {};
          return parsed && typeof parsed === "object" ? parsed : {};
        } catch (e) {
          return {};
        }
      }

      function saveMissionPlan(opDay, plan) {
        localStorage.setItem(missionPlanKey(opDay), JSON.stringify(plan));
      }

      async function resetDashboardSession() {
        if (!(await themedConfirm("Are you sure you want to reset today’s dashboard session?"))) return;
        const opDay = operationalDayKey(new Date());
        localStorage.setItem(missionPlanKey(opDay), JSON.stringify({}));
        missionPlanUndoStack = [];
        missionPlanRedoStack = [];
        renderOperationFocus();
        themedNotice("Dashboard session reset.");
      }

      function deepCloneJson(obj) {
        return JSON.parse(JSON.stringify(obj || {}));
      }

      function plansEqual(a, b) {
        return JSON.stringify(a || {}) === JSON.stringify(b || {});
      }

      function pushMissionPlanUndo(opDay, planSnapshot) {
        missionPlanUndoStack.push({ opDay, plan: deepCloneJson(planSnapshot) });
        if (missionPlanUndoStack.length > 200) missionPlanUndoStack.shift();
        missionPlanRedoStack = [];
      }

      function undoMissionPlan() {
        if (!missionPlanUndoStack.length) return;
        const snapshot = missionPlanUndoStack.pop();
        const current = loadMissionPlan(snapshot.opDay);
        missionPlanRedoStack.push({ opDay: snapshot.opDay, plan: deepCloneJson(current) });
        saveMissionPlan(snapshot.opDay, deepCloneJson(snapshot.plan));
        renderOperationFocus();
      }

      function redoMissionPlan() {
        if (!missionPlanRedoStack.length) return;
        const snapshot = missionPlanRedoStack.pop();
        const current = loadMissionPlan(snapshot.opDay);
        missionPlanUndoStack.push({ opDay: snapshot.opDay, plan: deepCloneJson(current) });
        saveMissionPlan(snapshot.opDay, deepCloneJson(snapshot.plan));
        renderOperationFocus();
      }

      function onAppUndoRedoShortcut(e) {
        const key = (e.key || "").toLowerCase();
        const withMod = e.metaKey || e.ctrlKey;
        if (!withMod) return;
        const isUndo = key === "z" && !e.shiftKey;
        const isRedo = (key === "z" && e.shiftKey) || (key === "y" && e.ctrlKey);
        if (!isUndo && !isRedo) return;
        const t = e.target;
        const isTyping = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
        if (isTyping) return;
        e.preventDefault();
        if (isUndo) undoMissionPlan();
        if (isRedo) redoMissionPlan();
      }

      function ensureMissionPlanSlot(plan, quarterNum, slotNum) {
        if (!plan[quarterNum]) plan[quarterNum] = {};
        const cur = plan[quarterNum][slotNum];
        if (!cur || typeof cur !== "object") {
          const missionPath = typeof cur === "string" ? cur : "";
          plan[quarterNum][slotNum] = { operation: "", missionPath, recoveryTask: "" };
        }
        return plan[quarterNum][slotNum];
      }

      function setMissionPlanOperation(opDay, quarterNum, slotNum, operation) {
        const before = loadMissionPlan(opDay);
        const plan = deepCloneJson(before);
        const slot = ensureMissionPlanSlot(plan, quarterNum, slotNum);
        slot.operation = operation || "";
        slot.recoveryTask = "";
        if (!slot.missionPath) {
          if (!plansEqual(before, plan)) pushMissionPlanUndo(opDay, before);
          saveMissionPlan(opDay, plan);
          renderOperationFocus();
          return;
        }
        const mission = allMissions.find((m) => m.path === slot.missionPath);
        if (!mission || mission.operation !== slot.operation) {
          slot.missionPath = "";
        }
        if (!plansEqual(before, plan)) pushMissionPlanUndo(opDay, before);
        saveMissionPlan(opDay, plan);
        renderOperationFocus();
      }

      function setMissionPlanMission(opDay, quarterNum, slotNum, missionPath) {
        const before = loadMissionPlan(opDay);
        const plan = deepCloneJson(before);
        const slot = ensureMissionPlanSlot(plan, quarterNum, slotNum);
        slot.missionPath = missionPath || "";
        slot.recoveryTask = "";
        if (slot.missionPath) {
          const mission = allMissions.find((m) => m.path === slot.missionPath);
          if (mission) slot.operation = mission.operation || slot.operation;
        }
        if (!plansEqual(before, plan)) pushMissionPlanUndo(opDay, before);
        saveMissionPlan(opDay, plan);
        renderOperationFocus();
      }

      function setRecoveryTask(opDay, quarterNum, slotNum, task) {
        const before = loadMissionPlan(opDay);
        const plan = deepCloneJson(before);
        const slot = ensureMissionPlanSlot(plan, quarterNum, slotNum);
        slot.recoveryTask = task || "";
        slot.operation = "";
        slot.missionPath = "";
        if (!plansEqual(before, plan)) pushMissionPlanUndo(opDay, before);
        saveMissionPlan(opDay, plan);
        renderOperationFocus();
      }

      function escapeHtmlAttr(s) {
        return String(s || "")
          .replace(/&/g, "&amp;")
          .replace(/"/g, "&quot;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
      }

      function hviProfileLinks(item) {
        const links = [];
        const seen = new Set();
        const seenInstaUsers = new Set();
        const normalizeLinkKey = (u) => {
          try {
            const parsed = new URL(u);
            const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
            const path = parsed.pathname.replace(/\/+$/, "").toLowerCase();
            return `${parsed.protocol}//${host}${path}`;
          } catch (_) {
            return String(u || "").trim().toLowerCase().replace(/\/+$/, "");
          }
        };
        const pushLink = (url, label) => {
          const u = String(url || "").trim();
          if (!u) return;
          const key = normalizeLinkKey(u);
          if (seen.has(key)) return;
          seen.add(key);
          links.push({ url: u, label: label || u });
        };
        const pushInstagramUser = (userRaw) => {
          const user = String(userRaw || "").trim().replace(/^@/, "");
          if (!user) return;
          const key = user.toLowerCase();
          if (seenInstaUsers.has(key)) return;
          seenInstaUsers.add(key);
          pushLink(`https://www.instagram.com/${encodeURIComponent(user)}/`, `Instagram: @${user}`);
        };
        // Do not auto-add profile handle as an Instagram link; only use explicit social field links/mentions.
        const social = String(item?.fields?.["Social Media Handles"] || "");
        const urlMatches = social.match(/https?:\/\/[^\s,)]+/gi) || [];
        urlMatches.forEach((u) => pushLink(u, u));
        const mentions = social.match(/@[A-Za-z0-9._]+/g) || [];
        mentions.forEach((m) => pushInstagramUser(m));
        return links;
      }

      function hviAllParameterKeys(item) {
        const fields = item?.fields && typeof item.fields === "object" ? item.fields : {};
        const custom = item?.customStats && typeof item.customStats === "object" ? item.customStats : {};
        const preferred = [
          "Name",
          "Age",
          "Status",
          "Mission Stage",
          "Number",
          "Organization/Affiliation",
          "Painpoint/Need",
          "Social Media Handles",
          "Contact Number",
          "Email Address",
        ];
        const keys = [...new Set([
          ...preferred,
          ...Object.keys(fields),
          ...Object.keys(custom),
        ].map((k) => String(k || "").trim()).filter(Boolean))];
        return keys;
      }

      function hviParamValueHtml(item, key) {
        const k = String(key || "").trim();
        if (!k) return renderHviValue("N/A");
        const fields = item?.fields && typeof item.fields === "object" ? item.fields : {};
        const custom = item?.customStats && typeof item.customStats === "object" ? item.customStats : {};
        if (Object.prototype.hasOwnProperty.call(custom, k)) return renderHviValue(custom[k] || "N/A");
        if (k === "Status") return renderHviValue(item?.status || item?.stage || fields["Status"] || fields["Mission Stage"] || "N/A");
        if (k === "Mission Stage") return renderHviValue(fields["Mission Stage"] || item?.stage || item?.status || "N/A");
        if (k === "Number") return renderHviValue(item?.number || fields["Number"] || fields["Contact Number"] || "N/A");
        return renderHviValue(fields[k] || "N/A");
      }

      function hviLayoutStorageKey() {
        return "hviLayoutTemplate:v1";
      }

      function loadHviLayoutTemplate() {
        try {
          const raw = String(localStorage.getItem(hviLayoutStorageKey()) || "grid").trim().toLowerCase();
          hviLayoutTemplate = ["grid", "stack", "compact"].includes(raw) ? raw : "grid";
        } catch (_) {
          hviLayoutTemplate = "grid";
        }
      }

      function saveHviLayoutTemplate() {
        try {
          localStorage.setItem(hviLayoutStorageKey(), hviLayoutTemplate);
        } catch (_) {}
      }

      function setHviLayoutTemplate(value) {
        const next = String(value || "").trim().toLowerCase();
        hviLayoutTemplate = ["grid", "stack", "compact"].includes(next) ? next : "grid";
        saveHviLayoutTemplate();
        if (intelPopupType === "hvi" && intelPopupHviHandle) {
          openHviPopup(intelPopupHviHandle, hviPopupPage);
        }
      }

      function hviKeyOptions(item) {
        const builtIn = ["Status", "Number", "Email", "Lead", "Photo", "Height", "Sports"];
        const fieldKeys = Object.keys(item?.fields || {});
        const statKeys = Object.keys(item?.customStats || {});
        const all = [...new Set([...builtIn, ...hviStatTemplates, ...fieldKeys, ...statKeys].map((x) => String(x || "").trim()).filter(Boolean))];
        return all.sort((a, b) => a.localeCompare(b));
      }

      function renderHviValue(value) {
        const raw = String(value || "").trim();
        if (!raw) return "<span class=\"hvi-field-value\">N/A</span>";
        const esc = escapeHtmlAttr(raw);
        const urlLike = /^https?:\/\//i.test(raw);
        const imageLike = /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(raw);
        const fileLike = /\.(pdf|docx?|xlsx?|pptx?|txt|md|csv|json|zip|rar|7z|mp3|mp4|mov|mkv)$/i.test(raw);
        if (urlLike && imageLike) {
          return `<a class="hvi-field-value" href="${esc}" target="_blank" rel="noopener noreferrer">${esc}</a><img src="${esc}" alt="Profile media" style="margin-top:4px;max-width:100%;max-height:120px;object-fit:cover;border:1px solid var(--term-dim);" />`;
        }
        if (urlLike) {
          return `<a class="hvi-field-value" href="${esc}" target="_blank" rel="noopener noreferrer">${esc}</a>`;
        }
        if (raw.startsWith("/") || raw.startsWith("OperationDir/")) {
          const path = raw.startsWith("/") ? raw.slice(1) : raw;
          const href = `/${encodePathForUrl(path)}`;
          return `<a class="hvi-field-value" href="${escapeHtmlAttr(href)}" target="_blank" rel="noopener noreferrer">${esc}</a>`;
        }
        if (fileLike) {
          return `<span class="hvi-field-value">${esc}</span>`;
        }
        return `<span class="hvi-field-value">${esc}</span>`;
      }

      async function editHviStatValueFromPopup(key, currentValue) {
        if (intelPopupType !== "hvi" || !intelPopupHviHandle) return;
        const k = String(key || "").trim();
        if (!k) return;
        const next = await themedPrompt(`Edit ${k}`, String(currentValue || ""));
        if (next === null) return;
        const extra = getHviExtra(intelPopupHviHandle);
        extra.stats[k] = String(next).trim();
        if (!extra.statOrder.includes(k)) extra.statOrder.push(k);
        ensureHviStatTemplate(k);
        setHviExtra(intelPopupHviHandle, extra);
        openHviPopup(intelPopupHviHandle, hviPopupPage);
      }

      function onHviStatDragStart(index, event) {
        hviStatDragIndex = index;
        if (event && event.dataTransfer) {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", String(index));
        }
      }

      function onHviStatDragOver(event) {
        if (!event) return;
        event.preventDefault();
        const row = event.currentTarget;
        if (row && row.classList) row.classList.add("drag-over");
      }

      function onHviStatDragLeave(event) {
        const row = event && event.currentTarget;
        if (row && row.classList) row.classList.remove("drag-over");
      }

      function onHviStatDrop(index, event) {
        if (!event) return;
        event.preventDefault();
        const row = event.currentTarget;
        if (row && row.classList) row.classList.remove("drag-over");
        if (intelPopupType !== "hvi" || !intelPopupHviHandle) return;
        const from = hviStatDragIndex;
        const to = Number(index);
        hviStatDragIndex = -1;
        if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < 0 || from === to) return;
        const item = augmentHvi(allHvi.find((h) => String(h.handle || "Unknown") === String(intelPopupHviHandle || "")));
        const order = [...(item?.statOrder || [])];
        if (from >= order.length || to >= order.length) return;
        const [moved] = order.splice(from, 1);
        order.splice(to, 0, moved);
        const extra = getHviExtra(intelPopupHviHandle);
        extra.statOrder = order;
        setHviExtra(intelPopupHviHandle, extra);
        openHviPopup(intelPopupHviHandle, hviPopupPage);
      }

      function hviExtrasStorageKey() {
        return "hviProfileExtras:v1";
      }

      function hviStatTemplatesKey() {
        return "hviStatTemplates:v1";
      }

      function loadHviStatTemplates() {
        try {
          const raw = localStorage.getItem(hviStatTemplatesKey());
          const parsed = raw ? JSON.parse(raw) : [];
          hviStatTemplates = Array.isArray(parsed) ? parsed.map((x) => String(x || "").trim()).filter(Boolean) : [];
        } catch (e) {
          hviStatTemplates = [];
        }
      }

      function saveHviStatTemplates() {
        localStorage.setItem(hviStatTemplatesKey(), JSON.stringify(hviStatTemplates));
      }

      function ensureHviStatTemplate(key) {
        const k = String(key || "").trim();
        if (!k) return;
        if (!hviStatTemplates.includes(k)) {
          hviStatTemplates.push(k);
          hviStatTemplates.sort((a, b) => a.localeCompare(b));
          saveHviStatTemplates();
        }
      }

      function loadHviProfileExtras() {
        try {
          const raw = localStorage.getItem(hviExtrasStorageKey());
          const parsed = raw ? JSON.parse(raw) : {};
          hviProfileExtras = parsed && typeof parsed === "object" ? parsed : {};
        } catch (e) {
          hviProfileExtras = {};
        }
      }

      function saveHviProfileExtras() {
        localStorage.setItem(hviExtrasStorageKey(), JSON.stringify(hviProfileExtras));
      }

      function normalizeList(v) {
        return Array.isArray(v) ? v.map((x) => String(x || "").trim()).filter(Boolean) : [];
      }

      function getHviExtra(handle) {
        const key = String(handle || "").trim();
        const x = hviProfileExtras[key] || {};
        const stats = x.stats && typeof x.stats === "object" ? x.stats : {};
        const slots = Array.isArray(x.slots) ? x.slots.map((s) => String(s || "").trim()).filter(Boolean) : [];
        const descriptions = x.descriptions && typeof x.descriptions === "object" ? x.descriptions : {};
        return {
          stats: { ...stats },
          statOrder: Array.isArray(x.statOrder) ? x.statOrder.map((s) => String(s || "").trim()).filter(Boolean) : [],
          photos: normalizeList(x.photos),
          emails: normalizeList(x.emails),
          leads: normalizeList(x.leads),
          slots,
          descriptions: { ...descriptions },
        };
      }

      function setHviExtra(handle, extra) {
        const key = String(handle || "").trim();
        if (!key) return;
        hviProfileExtras[key] = {
          stats: extra && extra.stats && typeof extra.stats === "object" ? extra.stats : {},
          statOrder: Array.isArray(extra?.statOrder) ? extra.statOrder.map((s) => String(s || "").trim()).filter(Boolean) : [],
          photos: normalizeList(extra?.photos),
          emails: normalizeList(extra?.emails),
          leads: normalizeList(extra?.leads),
          slots: Array.isArray(extra?.slots) ? extra.slots.map((s) => String(s || "").trim()).filter(Boolean) : [],
          descriptions: extra && extra.descriptions && typeof extra.descriptions === "object" ? extra.descriptions : {},
        };
        saveHviProfileExtras();
      }

      function setPrimaryHviPhoto(extra, photoValue) {
        const val = String(photoValue || "").trim();
        if (!val) return;
        const current = normalizeList(extra?.photos);
        const next = [val, ...current.filter((p) => p !== val)];
        extra.photos = next;
      }

      function augmentHvi(item) {
        const base = item && typeof item === "object" ? item : {};
        const handle = String(base.handle || "Unknown");
        const fields = base.fields && typeof base.fields === "object" ? { ...base.fields } : {};
        const extra = getHviExtra(handle);
        const status = String(base.status || base.stage || fields["Status"] || fields["Mission Stage"] || "N/A");
        const number = String(base.number || fields["Number"] || fields["Contact Number"] || "N/A");
        const emailField = String(fields["Email Address"] || "").trim();
        const leadsField = String(fields["Leads"] || "").trim();
        const emails = [...new Set([...(emailField && emailField !== "N/A" ? emailField.split(/[,\n;]/) : []), ...extra.emails].map((x) => String(x || "").trim()).filter(Boolean))];
        const leads = [...new Set([...(leadsField && leadsField !== "N/A" ? leadsField.split(/[,\n;]/) : []), ...extra.leads].map((x) => String(x || "").trim()).filter(Boolean))];
        const statOrder = extra.statOrder.filter((k) => Object.prototype.hasOwnProperty.call(extra.stats, k));
        return { ...base, handle, fields, status, stage: status, number, photos: extra.photos, emails, leads, customStats: extra.stats, statOrder };
      }

      function addHviQuickModule(moduleName) {
        if (intelPopupType !== "hvi" || !intelPopupHviHandle) return;
        const key = String(moduleName || "").trim();
        if (!key) return;
        const extra = getHviExtra(intelPopupHviHandle);
        if (!Object.prototype.hasOwnProperty.call(extra.stats, key)) {
          extra.stats[key] = "N/A";
          if (!extra.statOrder.includes(key)) extra.statOrder.push(key);
          setHviExtra(intelPopupHviHandle, extra);
        }
        openHviPopup(intelPopupHviHandle, hviPopupPage);
      }

      async function addHviPhotoFromPopup() {
        if (intelPopupType !== "hvi" || !intelPopupHviHandle) return;
        const fileInput = document.getElementById("intel-hvi-photo-file");
        let value = "";
        if (fileInput && fileInput.files && fileInput.files[0]) {
          try {
            value = await readFileAsDataUrl(fileInput.files[0]);
          } catch (e) {
            themedNotice("Photo upload failed.");
            return;
          }
        }
        if (!value) return;
        const extra = getHviExtra(intelPopupHviHandle);
        setPrimaryHviPhoto(extra, value);
        setHviExtra(intelPopupHviHandle, extra);
        if (fileInput) fileInput.value = "";
        openHviPopup(intelPopupHviHandle, hviPopupPage);
      }

      function triggerHviPhotoPicker() {
        const targetHandle = String(intelPopupHviHandle || "").trim();
        if (!targetHandle) {
          themedNotice("Open an HVI profile first.");
          return;
        }
        const launchHiddenInput = () => {
          const picker = document.createElement("input");
          picker.type = "file";
          picker.accept = "image/*";
          picker.style.position = "fixed";
          picker.style.left = "-9999px";
          picker.style.width = "1px";
          picker.style.height = "1px";
          picker.style.opacity = "0";
          picker.setAttribute("aria-hidden", "true");
          picker.onchange = async () => {
            try {
              const f = picker.files && picker.files[0];
              if (!f) return;
              await addHviPhotoFromDrop(f);
            } finally {
              if (picker.parentNode) picker.parentNode.removeChild(picker);
            }
          };
          document.body.appendChild(picker);
          requestAnimationFrame(() => picker.click());
        };

        try {
          // Safari 17+ may support this and behaves better with overlays.
          if (window.showOpenFilePicker) {
            window.showOpenFilePicker({
              multiple: false,
              types: [{ description: "Images", accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"] } }],
            }).then(async (handles) => {
              const h = handles && handles[0];
              if (!h) return;
              const file = await h.getFile();
              if (!file) return;
              await addHviPhotoFromDrop(file);
            }).catch(() => {
              // User cancel or unsupported path: fall back silently.
            });
            return;
          }
        } catch (_) {}

        launchHiddenInput();
      }

      async function addHviPhotoFromDrop(file) {
        if (intelPopupType !== "hvi" || !intelPopupHviHandle || !file) return;
        try {
          const value = await readFileAsDataUrl(file);
          const extra = getHviExtra(intelPopupHviHandle);
          setPrimaryHviPhoto(extra, value);
          setHviExtra(intelPopupHviHandle, extra);
          openHviPopup(intelPopupHviHandle, hviPopupPage);
        } catch (e) {
          themedNotice("Photo upload failed.");
        }
      }

      function removeHviPhotoFromPopup(index) {
        if (intelPopupType !== "hvi" || !intelPopupHviHandle) return;
        const i = Number(index);
        const extra = getHviExtra(intelPopupHviHandle);
        if (!Number.isInteger(i) || i < 0 || i >= extra.photos.length) return;
        extra.photos.splice(i, 1);
        setHviExtra(intelPopupHviHandle, extra);
        openHviPopup(intelPopupHviHandle, hviPopupPage);
      }

      function addHviEmailFromPopup() {
        if (intelPopupType !== "hvi" || !intelPopupHviHandle) return;
        const input = document.getElementById("intel-hvi-email");
        const value = String(input ? input.value : "").trim();
        if (!value) return;
        const extra = getHviExtra(intelPopupHviHandle);
        if (!extra.emails.includes(value)) extra.emails.push(value);
        setHviExtra(intelPopupHviHandle, extra);
        if (input) input.value = "";
        openHviPopup(intelPopupHviHandle, hviPopupPage);
      }

      function removeHviEmailFromPopup(index) {
        if (intelPopupType !== "hvi" || !intelPopupHviHandle) return;
        const i = Number(index);
        const extra = getHviExtra(intelPopupHviHandle);
        if (!Number.isInteger(i) || i < 0 || i >= extra.emails.length) return;
        extra.emails.splice(i, 1);
        setHviExtra(intelPopupHviHandle, extra);
        openHviPopup(intelPopupHviHandle, hviPopupPage);
      }

      function addHviLeadFromPopup() {
        if (intelPopupType !== "hvi" || !intelPopupHviHandle) return;
        const input = document.getElementById("intel-hvi-lead");
        const value = String(input ? input.value : "").trim();
        if (!value) return;
        const extra = getHviExtra(intelPopupHviHandle);
        if (!extra.leads.includes(value)) extra.leads.push(value);
        setHviExtra(intelPopupHviHandle, extra);
        if (input) input.value = "";
        openHviPopup(intelPopupHviHandle, hviPopupPage);
      }

      function removeHviLeadFromPopup(index) {
        if (intelPopupType !== "hvi" || !intelPopupHviHandle) return;
        const i = Number(index);
        const extra = getHviExtra(intelPopupHviHandle);
        if (!Number.isInteger(i) || i < 0 || i >= extra.leads.length) return;
        extra.leads.splice(i, 1);
        setHviExtra(intelPopupHviHandle, extra);
        openHviPopup(intelPopupHviHandle, hviPopupPage);
      }

      function addHviStatFromPopup() {
        if (intelPopupType !== "hvi" || !intelPopupHviHandle) return;
        const keyEl = document.getElementById("intel-hvi-stat-k");
        const valEl = document.getElementById("intel-hvi-stat-v");
        const key = String(keyEl ? keyEl.value : "").trim();
        const val = String(valEl ? valEl.value : "").trim();
        if (!key || !val) return;
        const extra = getHviExtra(intelPopupHviHandle);
        extra.stats[key] = val;
        if (!extra.statOrder.includes(key)) extra.statOrder.push(key);
        ensureHviStatTemplate(key);
        setHviExtra(intelPopupHviHandle, extra);
        if (keyEl) keyEl.value = "";
        if (valEl) valEl.value = "";
        openHviPopup(intelPopupHviHandle, hviPopupPage);
      }

      async function addHviEntryFromPopup() {
        if (intelPopupType !== "hvi" || !intelPopupHviHandle) return;
        const keyEl = document.getElementById("intel-hvi-key-simple");
        const customKeyEl = document.getElementById("intel-hvi-key-custom");
        const photoFileEl = document.getElementById("intel-hvi-photo-file");
        const selectedKey = String(keyEl ? keyEl.value : "").trim();
        const key = selectedKey === "__custom__"
          ? String(customKeyEl ? customKeyEl.value : "").trim()
          : selectedKey;
        if (!key) {
          themedNotice("Field key is required.");
          return;
        }
        let value = "N/A";
        const k = key.toLowerCase();
        const isPhotoKey = k === "photo" || k === "photos" || k === "photo profiling";
        if (isPhotoKey && photoFileEl && photoFileEl.files && photoFileEl.files[0]) {
          try {
            value = await readFileAsDataUrl(photoFileEl.files[0]);
          } catch (e) {
            themedNotice("Photo upload failed.");
            return;
          }
        }
        const extra = getHviExtra(intelPopupHviHandle);
        try {
          if (k === "email" || k === "emails" || k === "email address") {
            if (!extra.emails.includes(value)) extra.emails.push(value);
            ensureHviStatTemplate(key);
            setHviExtra(intelPopupHviHandle, extra);
          } else if (k === "lead" || k === "leads") {
            if (!extra.leads.includes(value)) extra.leads.push(value);
            ensureHviStatTemplate(key);
            setHviExtra(intelPopupHviHandle, extra);
          } else if (k === "photo" || k === "photos" || k === "photo profiling") {
            setPrimaryHviPhoto(extra, value);
            ensureHviStatTemplate(key);
            setHviExtra(intelPopupHviHandle, extra);
          } else {
            // Persist as canonical HVI field first (server), then mirror local custom stats for immediate UI.
            const res = await fetch("/api/hvi", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                handle: intelPopupHviHandle,
                fields: { [key]: value },
              }),
            });
            if (!res.ok) {
              const err = await res.json().catch(() => ({ error: "Failed to update HVI field." }));
              throw new Error(err.error || "Failed to update HVI field.");
            }
            ensureHviStatTemplate(key);
            extra.stats[key] = value;
            if (!extra.statOrder.includes(key)) extra.statOrder.push(key);
            setHviExtra(intelPopupHviHandle, extra);
          }
        } catch (e) {
          themedNotice("Add field failed: " + e.message);
          return;
        }
        if (keyEl) keyEl.value = "";
        if (customKeyEl) {
          customKeyEl.value = "";
          customKeyEl.style.display = "none";
        }
        if (photoFileEl) photoFileEl.value = "";
        await fetchData();
        openHviPopup(intelPopupHviHandle, hviPopupPage);
      }

      async function editHviFieldBundleFromPopup(key, isCustom, currentValue, currentDesc) {
        if (intelPopupType !== "hvi" || !intelPopupHviHandle) return;
        const k = String(key || "").trim();
        if (!k) return;
        const nextValue = await themedPrompt(`Edit ${k} value`, String(currentValue || ""));
        if (nextValue === null) return;
        const nextDesc = await themedPrompt(`Edit ${k} description`, String(currentDesc || ""));
        if (nextDesc === null) return;
        const extra = getHviExtra(intelPopupHviHandle);
        extra.descriptions = extra.descriptions && typeof extra.descriptions === "object" ? extra.descriptions : {};
        extra.descriptions[k] = String(nextDesc || "").trim();
        try {
          if (isCustom) {
            extra.stats[k] = String(nextValue || "").trim() || "N/A";
            if (!extra.statOrder.includes(k)) extra.statOrder.push(k);
            ensureHviStatTemplate(k);
            setHviExtra(intelPopupHviHandle, extra);
          } else {
            const res = await fetch("/api/hvi", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                handle: intelPopupHviHandle,
                fields: { [k]: String(nextValue || "").trim() || "N/A" },
              }),
            });
            if (!res.ok) {
              const err = await res.json().catch(() => ({ error: "Failed to update HVI field." }));
              throw new Error(err.error || "Failed to update HVI field.");
            }
            setHviExtra(intelPopupHviHandle, extra);
          }
          await fetchData();
          openHviPopup(intelPopupHviHandle, hviPopupPage);
        } catch (e) {
          themedNotice("Edit failed: " + e.message);
        }
      }

      async function editHviFieldValueOnlyFromPopup(key, isCustom, currentValue) {
        if (intelPopupType !== "hvi" || !intelPopupHviHandle) return;
        const k = String(key || "").trim();
        if (!k) return;
        const nextValue = await themedPrompt(`Edit ${k} value`, String(currentValue || ""));
        if (nextValue === null) return;
        const extra = getHviExtra(intelPopupHviHandle);
        try {
          if (isCustom) {
            extra.stats[k] = String(nextValue || "").trim() || "N/A";
            if (!extra.statOrder.includes(k)) extra.statOrder.push(k);
            ensureHviStatTemplate(k);
            setHviExtra(intelPopupHviHandle, extra);
          } else {
            const res = await fetch("/api/hvi", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                handle: intelPopupHviHandle,
                fields: { [k]: String(nextValue || "").trim() || "N/A" },
              }),
            });
            if (!res.ok) {
              const err = await res.json().catch(() => ({ error: "Failed to update HVI field." }));
              throw new Error(err.error || "Failed to update HVI field.");
            }
          }
          await fetchData();
          openHviPopup(intelPopupHviHandle, hviPopupPage);
        } catch (e) {
          themedNotice("Edit value failed: " + e.message);
        }
      }

      async function editHviFieldDescriptionOnlyFromPopup(key, currentDesc) {
        if (intelPopupType !== "hvi" || !intelPopupHviHandle) return;
        const k = String(key || "").trim();
        if (!k) return;
        const nextDesc = await themedPrompt(`Edit ${k} description`, String(currentDesc || ""));
        if (nextDesc === null) return;
        const extra = getHviExtra(intelPopupHviHandle);
        extra.descriptions = extra.descriptions && typeof extra.descriptions === "object" ? extra.descriptions : {};
        extra.descriptions[k] = String(nextDesc || "").trim();
        setHviExtra(intelPopupHviHandle, extra);
        openHviPopup(intelPopupHviHandle, hviPopupPage);
      }

      function onHviAddKeyModeChange(value) {
        const customKeyEl = document.getElementById("intel-hvi-key-custom");
        if (!customKeyEl) return;
        if (String(value || "") === "__custom__") {
          customKeyEl.style.display = "";
          customKeyEl.focus();
        } else {
          customKeyEl.style.display = "none";
          customKeyEl.value = "";
        }
      }

      async function editHviFieldFromPopup(key, currentValue) {
        if (intelPopupType !== "hvi" || !intelPopupHviHandle) return;
        const k = String(key || "").trim();
        if (!k) return;
        const next = await themedPrompt(`Edit ${k}`, String(currentValue || ""));
        if (next === null) return;
        try {
          const res = await fetch("/api/hvi", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              handle: intelPopupHviHandle,
              fields: { [k]: String(next).trim() || "N/A" },
            }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: "Failed to update HVI field." }));
            throw new Error(err.error || "Failed to update HVI field.");
          }
          await fetchData();
          openHviPopup(intelPopupHviHandle, hviPopupPage);
        } catch (e) {
          themedNotice("Edit HVI field failed: " + e.message);
        }
      }

      function removeHviStatFromPopup(key) {
        if (intelPopupType !== "hvi" || !intelPopupHviHandle) return;
        const k = String(key || "").trim();
        if (!k) return;
        const extra = getHviExtra(intelPopupHviHandle);
        delete extra.stats[k];
        extra.statOrder = extra.statOrder.filter((x) => x !== k);
        setHviExtra(intelPopupHviHandle, extra);
        openHviPopup(intelPopupHviHandle, hviPopupPage);
      }

      function changeHviPopupPage(delta) {
        if (intelPopupType !== "hvi" || !intelPopupHviHandle) return;
        const raw = allHvi.find((h) => String(h.handle || "Unknown") === String(intelPopupHviHandle || ""));
        const item = raw ? augmentHvi(raw) : null;
        const fields = item?.fields && typeof item.fields === "object" ? item.fields : {};
        const customKeys = new Set(Object.keys(item?.customStats || {}));
        const ordered = [
          "Name", "Age", "Social Media Handles", "Contact Number", "Email Address",
          "Organization/Affiliation", "Painpoint/Need", "Mission Stage", "Status", "Number",
        ];
        const keys = Object.keys(fields);
        const renderKeys = [...ordered.filter((k) => keys.includes(k)), ...keys.filter((k) => !ordered.includes(k))]
          .filter((k) => !HVI_DETAIL_EXCLUDED_KEYS.has(k) && !customKeys.has(k));
        const totalPages = renderKeys.length > 14 ? 2 : 1;
        const next = Math.max(1, Math.min(totalPages, hviPopupPage + Number(delta || 0)));
        hviPopupPage = next;
        openHviPopup(intelPopupHviHandle, hviPopupPage);
      }

      function getPlannedMission(plan, quarterNum, slotNum) {
        const rawSlot = (plan[quarterNum] && plan[quarterNum][slotNum]) ? plan[quarterNum][slotNum] : { operation: "", missionPath: "" };
        const missionPath = typeof rawSlot === "string" ? rawSlot : (rawSlot.missionPath || "");
        let operation = typeof rawSlot === "string" ? "" : (rawSlot.operation || "");
        const recoveryTask = typeof rawSlot === "string" ? "" : (rawSlot.recoveryTask || "");
        let missionName = "";
        if (slotNum >= 5) {
          return { operation: "RECOVERY", missionName: recoveryTask || "UNASSIGNED", missionPath: "", isRecovery: true };
        }
        if (missionPath) {
          const m = allMissions.find((x) => x.path === missionPath);
          if (m) {
            operation = operation || m.operation || "";
            missionName = m.name || "";
          }
        }
        return { operation, missionName, missionPath, isRecovery: false };
      }

      function missionHrefFromPath(path) {
        if (!path) return "";
        const marker = "/OperationDir/";
        const idx = path.indexOf(marker);
        if (idx >= 0) return path.slice(idx);
        return "";
      }

      function renderOperationFocus() {
        const container = document.getElementById("operation-focus-list");
        if (!container) return;

        const now = new Date();
        const opDay = operationalDayKey(now);
        const quarter = getQuarterState(now);
        const operationOptions = [...new Set([
          ...allOps,
          ...allMissions.map((m) => m.operation).filter(Boolean),
        ])].sort((a, b) => a.localeCompare(b));
        const plan = loadMissionPlan(opDay);
        const focusSlot = quarter.currentBlock > 0 ? getPlannedMission(plan, quarter.quarterIndex, quarter.currentBlock) : null;
        const focusMissionText = focusSlot && (focusSlot.operation || focusSlot.missionName)
          ? `${focusSlot.operation || "Operation"} - ${focusSlot.missionName || "Mission Task"}`
          : "Operation - Mission Task";
        const focusMissionHref = focusSlot ? missionHrefFromPath(focusSlot.missionPath) : "";
        const taskNumber = Math.min(4, Math.max(1, quarter.currentBlock || 1));
        const dayLine = `OPERATION DAY: ${opDay}`;
        const quarterLine = `Q${quarter.quarterIndex}/8: [${formatUkHm(now)}]`;
        let taskLine = "BREAK";
        if (quarter.cadence !== "BREAK") {
          if (quarter.currentBlock >= 1 && quarter.currentBlock <= 4) {
            taskLine = `TASK ${taskNumber}/4`;
          } else if (quarter.currentBlock >= 5 && quarter.currentBlock <= 6) {
            taskLine = `RECOVERY ${quarter.currentBlock - 4}/2`;
          }
        }

        const blockDefs = [
          { sNum: 1, startMin: 0, endMin: 25, kind: "mission", tint: "block-tint-1" },
          { sNum: 2, startMin: 30, endMin: 55, kind: "mission", tint: "block-tint-2" },
          { sNum: 3, startMin: 60, endMin: 85, kind: "mission", tint: "block-tint-3" },
          { sNum: 4, startMin: 90, endMin: 115, kind: "mission", tint: "block-tint-4" },
          { sNum: 5, startMin: 120, endMin: 145, kind: "recovery", tint: "recovery-slot" },
          { sNum: 6, startMin: 150, endMin: 175, kind: "recovery", tint: "recovery-slot" },
        ];
        if (!Number.isInteger(selectedQuarterPanel) || selectedQuarterPanel < 1 || selectedQuarterPanel > 8) {
          selectedQuarterPanel = quarter.quarterIndex;
        }

        const renderQuarterSlots = (qNum) => {
          const qStart = new Date(quarter.dayStart.getTime() + (qNum - 1) * 3 * 60 * 60 * 1000);
          return blockDefs.map((def) => {
            const slotStart = new Date(qStart.getTime() + def.startMin * 60000);
            const slotEnd = new Date(qStart.getTime() + (def.endMin) * 60000);
            const sNum = def.sNum;
            const rawSlot = (plan[qNum] && plan[qNum][sNum]) ? plan[qNum][sNum] : { operation: "", missionPath: "" };
            const selectedMissionPath = typeof rawSlot === "string" ? rawSlot : (rawSlot.missionPath || "");
            let selectedOperation = typeof rawSlot === "string" ? "" : (rawSlot.operation || "");
            const selectedRecoveryTask = typeof rawSlot === "string" ? "" : (rawSlot.recoveryTask || "");
            if (!selectedOperation && selectedMissionPath) {
              const selectedMission = allMissions.find((m) => m.path === selectedMissionPath);
              if (selectedMission) selectedOperation = selectedMission.operation || "";
            }
            const operationOptionsHtml = [`<option value="">-- Select Operation --</option>`]
              .concat(operationOptions.map((op) =>
                `<option value="${escapeHtmlAttr(op)}" ${op === selectedOperation ? "selected" : ""}>${escapeHtmlAttr(op)}</option>`
              ))
              .join("");
            const filteredMissions = allMissions
              .filter((m) => !selectedOperation || m.operation === selectedOperation)
              .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
            const missionOptionsHtml = [`<option value="">-- Select Mission --</option>`]
              .concat(filteredMissions.map((m) =>
                `<option value="${escapeHtmlAttr(m.path)}" ${m.path === selectedMissionPath ? "selected" : ""}>${escapeHtmlAttr(m.name || "Untitled")}</option>`
              ))
              .join("");
            const recoveryOptionsHtml = [
              `<option value="">-- Select Recovery Task --</option>`,
              `<option value="EAT" ${selectedRecoveryTask === "EAT" ? "selected" : ""}>EAT</option>`,
              `<option value="READ" ${selectedRecoveryTask === "READ" ? "selected" : ""}>READ</option>`,
              `<option value="EXERCISE" ${selectedRecoveryTask === "EXERCISE" ? "selected" : ""}>EXERCISE</option>`,
              `<option value="CHECKLIST" ${selectedRecoveryTask === "CHECKLIST" ? "selected" : ""}>CHECKLIST</option>`,
            ].join("");
            const inner = def.kind === "mission" ? `
              <div class="slot-label">Operation</div>
              <select class="matrix-select" onchange="setMissionPlanOperation('${opDay}', ${qNum}, ${sNum}, this.value)">
                ${operationOptionsHtml}
              </select>
              <div class="slot-label">Mission</div>
              <select class="matrix-select" onchange="setMissionPlanMission('${opDay}', ${qNum}, ${sNum}, this.value)">
                ${missionOptionsHtml}
              </select>
            ` : `
              <div class="slot-label" style="color: var(--warning-yellow);">Recovery Task</div>
              <select class="matrix-select recovery-select" onchange="setRecoveryTask('${opDay}', ${qNum}, ${sNum}, this.value)">
                ${recoveryOptionsHtml}
              </select>
            `;
            return `
              <div class="quarter-slot ${def.tint}">
                <div class="quarter-slot-time">
                  <strong>Block ${sNum}</strong> (${def.kind === "mission" ? "WORK" : "RECOVERY"}): ${formatHm(slotStart)}-${formatHm(slotEnd)}
                </div>
                ${inner}
              </div>
            `;
          }).join("");
        };

        const quarterGrid = Array.from({ length: 8 }).map((_, i) => {
          const qNum = i + 1;
          const start = new Date(quarter.dayStart.getTime() + i * 3 * 60 * 60 * 1000);
          const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
          const active = qNum === quarter.quarterIndex;
          const viewed = qNum === selectedQuarterPanel;
          return `
            <div class="quarter-tile ${viewed ? "active" : ""}" onclick="setQuarterPanel(${qNum})">
              <div class="quarter-tile-head">Q${qNum} ${formatHm(start)}-${formatHm(end)}</div>
              <div class="quarter-tile-sub">Blocks 1-4 Missions | 5-6 Recovery${active ? " | LIVE" : ""}</div>
            </div>
          `;
        }).join("");

        const detailStart = new Date(quarter.dayStart.getTime() + (selectedQuarterPanel - 1) * 3 * 60 * 60 * 1000);
        const detailEnd = new Date(detailStart.getTime() + 3 * 60 * 60 * 1000);
        const selectedQuarterSlots = renderQuarterSlots(selectedQuarterPanel);

        container.innerHTML = `
          <div class="focus-header" ondblclick="toggleQuarterDetailPanel()">
            <div class="focus-day">${dayLine}</div>
            <div class="focus-quarter">${quarterLine}</div>
            <div class="focus-phase">
              ${taskLine}:
              ${focusMissionHref
                ? `<span class="mission-link status-in-progress" onclick="openMissionEditor('${escapeJsString(focusSlot?.missionPath || "")}')" style="color: var(--warning-yellow); font-weight: bold; text-decoration: underline;">[${escapeHtmlAttr(focusMissionText)}]</span>`
                : `[${escapeHtmlAttr(focusMissionText)}]`}
            </div>
          </div>
          <div class="quarter-grid">${quarterGrid}</div>
          <div class="quarter-detail-panel" ondblclick="toggleQuarterDetailPanel()">
            <div class="quarter-carousel-head" ondblclick="toggleQuarterDetailPanel()">
              <div class="quarter-detail-title">Q${selectedQuarterPanel} DETAIL: ${formatHm(detailStart)}-${formatHm(detailEnd)}</div>
              <button
                class="quarter-toggle-arrow"
                type="button"
                title="${quarterDetailCollapsed ? "Expand quarter detail" : "Collapse quarter detail"}"
                onclick="event.stopPropagation(); toggleQuarterDetailPanel();"
              >${quarterDetailCollapsed ? "▸" : "▾"}</button>
            </div>
            ${quarterDetailCollapsed ? `<div class="routine-ex-note">Detail hidden. Double-click here to expand.</div>` : selectedQuarterSlots}
          </div>
        `;
      }

      function setQuarterPanel(qNum) {
        const n = Number(qNum);
        if (!Number.isInteger(n) || n < 1 || n > 8) return;
        selectedQuarterPanel = n;
        renderOperationFocus();
      }

      function onQuarterTileDoubleClick(qNum) {
        const n = Number(qNum);
        if (!Number.isInteger(n) || n < 1 || n > 8) return;
        selectedQuarterPanel = n;
        quarterDetailCollapsed = !quarterDetailCollapsed;
        renderOperationFocus();
      }

      function toggleQuarterDetailPanel() {
        quarterDetailCollapsed = !quarterDetailCollapsed;
        renderOperationFocus();
      }

      async function applyOperationDayFocus() {
        await fetchData();
        renderOperationFocus();
        themedNotice("Operation day focus updated.");
      }

      function shouldPreferOfflineSnapshots() {
        const protocol = String(window.location?.protocol || "");
        return Boolean(window.Capacitor) || protocol === "capacitor:" || protocol === "file:";
      }

      async function fetchJsonPath(path) {
        const res = await fetch(path, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
        return res.json();
      }

      async function fetchJsonSmart(endpoint) {
        const fallback = OFFLINE_SNAPSHOT_MAP[endpoint];
        const attempts = [];
        if (fallback && shouldPreferOfflineSnapshots()) attempts.push(fallback);
        attempts.push(endpoint);
        if (fallback && !attempts.includes(fallback)) attempts.push(fallback);

        let lastError = null;
        for (const path of attempts) {
          if (!path) continue;
          try {
            return await fetchJsonPath(path);
          } catch (e) {
            lastError = e;
          }
        }
        console.error(`Fetch to ${endpoint} Failed`, lastError);
        return null;
      }

      function applyBlueprintCatalog(data) {
        if (!Array.isArray(data)) return;
        blueprintCatalog = data.map((b) => ({
          file: String(b.file || ""),
          title: String(b.title || b.file || "BLUEPRINT"),
          sourcePath: String(b.source_path || `/home/samuelapata/.openclaw/workspace/${b.file || ""}`),
        })).filter((b) => b.file);
      }

      function applyBooksCatalog(data) {
        if (!Array.isArray(data)) return;
        booksCatalog = data.map((b) => ({
          file: String(b.file || ""),
          path: String(b.path || b.file || ""),
          title: String(b.title || b.file || "MANUEL"),
          sourcePath: String(b.source_path || `/home/samuelapata/.openclaw/workspace/${b.path || b.file || ""}`),
          type: String(b.type || ""),
          size: Number(b.size || 0),
          modifiedAt: String(b.modified_at || ""),
          bundled: b.bundled !== false,
        })).filter((b) => b.file);
      }

      function applySwissknifeSessionsData(data) {
        if (!Array.isArray(data)) return;
        swissknifeSessions = data;
        if (!selectedSwissknifeSession && swissknifeSessions.length) {
          selectedSwissknifeSession = String(swissknifeSessions[0].id || "");
        }
      }

      async function fetchData() {
        if (isFetching) return;
        isFetching = true;

        try {
          const needsBlueprints = currentView === "blueprints";
          const needsBooks = currentView === "books";
          const needsSwissknife = currentView === "swissknife";
          const [
            opsData,
            missionsData,
            blackbookData,
            hviData,
            blueprintsData,
            manuelsData,
            swissknifeData,
          ] = await Promise.all([
            fetchJsonSmart("/api/operations"),
            fetchJsonSmart("/api/missions"),
            fetchJsonSmart("/api/blackbook"),
            fetchJsonSmart("/api/hvi"),
            needsBlueprints ? fetchJsonSmart("/api/blueprints") : Promise.resolve(null),
            needsBooks ? fetchJsonSmart("/api/manuels") : Promise.resolve(null),
            needsSwissknife ? fetchJsonSmart("/api/swissknife/sessions") : Promise.resolve(null),
          ]);

          if (Array.isArray(opsData)) {
            allOps = opsData;
            syncOperationOrder();
            const opCount = document.getElementById("op-count-dash");
            if (opCount) opCount.innerText = String(opsData.length);
          }

          if (Array.isArray(missionsData)) {
            allMissions = missionsData;
            const missionCount = document.getElementById("mission-count-dash");
            if (missionCount) missionCount.innerText = String(missionsData.length);
          }

          if (Array.isArray(blackbookData)) {
            allBlackbook = blackbookData;
          }

          if (Array.isArray(hviData)) {
            allHvi = hviData;
            const hviCount = document.getElementById("hvi-count");
            if (hviCount) hviCount.innerText = String(hviData.length);
          }

          if (Array.isArray(blueprintsData)) {
            applyBlueprintCatalog(blueprintsData);
          }

          if (Array.isArray(manuelsData)) {
            applyBooksCatalog(manuelsData);
          }

          if (Array.isArray(swissknifeData)) {
            applySwissknifeSessionsData(swissknifeData);
          }

          // Render only the active view to avoid heavy full-app redraws on each sync.
          if (currentView === "dashboard") {
            renderOperationFocus();
          } else if (currentView === "operations") {
            renderOperations();
            renderBlackbook();
          } else if (currentView === "mission-log") {
            renderMissions();
            renderBriefMissionOptions();
            renderBlackbook();
          } else if (currentView === "hvi-intel") {
            renderHvi();
          } else if (currentView === "blueprints") {
            renderBlueprints();
          } else if (currentView === "books") {
            renderBooks();
          } else if (currentView === "swissknife") {
            renderSwissknife();
          }

          const logOutputEl = document.getElementById("log-output");
          if (logOutputEl) {
            logOutputEl.innerHTML = `> System Sync OK @ ${new Date().toLocaleTimeString()}`;
          }
        } finally {
          isFetching = false;
        }
      }

      function initMatrixRain() {
        const host = document.getElementById("matrix-rain");
        if (!host) return;
        host.innerHTML = "";
        const width = Math.max(window.innerWidth || 0, 800);
        const count = Math.max(18, Math.floor(width / 44));
        for (let i = 0; i < count; i += 1) {
          const col = document.createElement("div");
          col.className = "matrix-col";
          const leftPct = (i / count) * 100 + (Math.random() * 1.8 - 0.9);
          col.style.left = `${Math.max(0, Math.min(99, leftPct))}%`;
          col.style.animationDuration = `${11 + Math.random() * 14}s`;
          col.style.animationDelay = `${-Math.random() * 16}s`;
          let text = "";
          const rows = 60 + Math.floor(Math.random() * 45);
          for (let r = 0; r < rows; r += 1) {
            text += `${Math.random() > 0.5 ? "1" : "0"}\n`;
          }
          col.textContent = text;
          host.appendChild(col);
        }
      }

      function startAppOnce() {
        if (appStarted) return;
        appStarted = true;
        window.alert = (message) => themedNotice(message);
        initMatrixRain();
        window.addEventListener("resize", initMatrixRain);
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.getRegistrations().then((regs) => {
            regs.forEach((r) => r.unregister());
          }).catch(() => {});
        }
        loadOperationColors();
        loadOperationOrder();
        loadHviProfileExtras();
        loadHviStatTemplates();
        loadChecklistItems();
        loadRoutineData();
        loadHviLayoutTemplate();
        loadAppearanceSettings();
        loadNotificationSettings();
        loadPerformanceSettings();
        refreshHviTimeMeta();
        setInterval(refreshHviTimeMeta, 60000);
        initNavHoverDescriptions();
        const missionOverlay = document.getElementById("mission-editor-overlay");
        if (missionOverlay) {
          missionOverlay.addEventListener("click", (e) => {
            if (e.target === missionOverlay) closeMissionEditor();
          });
        }
        const intelOverlay = document.getElementById("intel-overlay");
        if (intelOverlay) {
          intelOverlay.addEventListener("click", (e) => {
            if (e.target === intelOverlay) closeIntelPopup();
          });
        }
        const docOverlay = document.getElementById("doc-overlay");
        if (docOverlay) {
          docOverlay.addEventListener("click", (e) => {
            if (e.target === docOverlay) closeDocPopup();
          });
        }
        const reminderOverlay = document.getElementById("reminder-overlay");
        if (reminderOverlay) {
          reminderOverlay.addEventListener("click", (e) => {
            if (e.target === reminderOverlay) closeReminderPopup();
          });
        }
        const exerciseOverlay = document.getElementById("exercise-overlay");
        if (exerciseOverlay) {
          exerciseOverlay.addEventListener("click", (e) => {
            if (e.target === exerciseOverlay) closeExerciseViewer();
          });
        }
        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape") {
            const overlay = document.getElementById("mission-editor-overlay");
            if (overlay && overlay.classList.contains("active")) closeMissionEditor();
            const intel = document.getElementById("intel-overlay");
            if (intel && intel.classList.contains("active")) closeIntelPopup();
            const doc = document.getElementById("doc-overlay");
            if (doc && doc.classList.contains("active")) closeDocPopup();
            const rem = document.getElementById("reminder-overlay");
            if (rem && rem.classList.contains("active")) closeReminderPopup();
            const exv = document.getElementById("exercise-overlay");
            if (exv && exv.classList.contains("active")) closeExerciseViewer();
            closeAllAddPopups();
          }
        });
        document.addEventListener("keydown", onAppUndoRedoShortcut);
        fetchData();
        runNotificationEngine();
        scheduleFetchDataPolling();
        setInterval(runNotificationEngine, 30000);
        switchView('dashboard');
      }

      document.addEventListener("DOMContentLoaded", () => {
        // Temporary bypass: start app directly without lock screen.
        lockUnlocked = true;
        hideLockOverlay();
        startAppOnce();
      });
    
