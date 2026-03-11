      let isFetching = false;
      let currentView = "dashboard";
      let viewHistoryStack = [];
      let suppressViewHistory = false;
      let selectedOperation = null;
      let allMissions = [];
      let allOps = [];
      let globalSearchQuery = "";
      let globalSearchScope = "all";
      let globalSearchResults = [];
      let searchQuery = "";
      let missionSearchQuery = "";
      let operationSearchQuery = "";
      let blueprintSearchQuery = "";
      let bookSearchQuery = "";
      let blackbookSearchQuery = "";
      let hviSearchQuery = "";
      let datawellSearchQuery = "";
      let hviFilterCategory = "";
      let hviFilterParam = "";
      let hviFilterDateFrom = "";
      let hviFilterDateTo = "";
      let datawellFilterType = "";
      let allBlackbook = [];
      let allHvi = [];
      let allDatawells = [];
      let missionDatawellLinks = { workflow: [], missions: {} };
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
      let postingTemplateDragIndex = -1;
      let routineTaskDrag = { period: "", fromIndex: -1 };
      let routineDescDrag = { period: "", taskId: "", fromIndex: -1 };
      let routineData = null;
      let gymCurrentCategory = "";
      let gymCurrentSubcategory = "";
      let gymViewerCategory = "";
      let gymViewerSubcategory = "";
      let gymViewerIndex = 0;
      let gymTouchStartX = 0;
      let gymPhotoManifest = {};
      let gymPhotoManifestPromise = null;
      let gymSelectedExerciseKeys = new Set();
      let gymSelectedExerciseOrder = [];
      let gymLastSelectedIndex = -1;
      let gymSessionMode = false;
      let gymSessionQueue = [];
      let gymSessionStartedAt = "";
      let gymActiveSavedSessionId = "";
      let gymSelectedSavedSessionId = "";
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
      let missionCommandSelectedPath = "";
      let missionCommandCache = {};
      let missionPopupSection = "brief";
      let intelPopupType = "";
      let intelPopupProbeId = "";
      let intelPopupHviHandle = "";
      let intelPopupDatawellId = "";
      let missionDatawellPopupReturnView = "";
      let navDescTimer = 0;
      let appTitleTerminalTimer = 0;
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
      const REMINDER_MAX_PRIOR_ALERTS = 3;
      let notificationSettings = {
        enabled: true,
        quarter: true,
        reminder: true,
        upcoming: true,
        checklist: true,
        sound: "matrix",
        quietEnabled: false,
        quietStart: "22:00",
        quietEnd: "07:00",
      };
      let firedNotificationKeys = [];
      let notificationHistory = [];
      let notificationAudioCtx = null;
      let nativeNotificationPermission = "prompt";
      let nativeNotificationRefreshTimer = 0;
      let nativeNotificationListenersBound = false;
      let omniCalendarPermission = "prompt";
      let omniCalendarSyncTimer = 0;
      let mobileMenuTouchState = { mode: "", startX: 0, startY: 0 };
      let tutorState = { trackId: "python", lessonId: "" };
      let tutorProgress = { completed: {}, quizScores: {}, quizDetails: {} };
      let selectedQuarterPanel = 0;
      let quarterDetailCollapsed = false;
      let performanceMode = "balanced";
      let privacySettings = {
        lockOnLaunch: false,
        autoLockOnBackground: false,
      };
      let fetchDataTimerId = 0;
      let activeAddPopupPanel = null;
      let routineClickTimers = {};
      const DASHBOARD_QUARTER_COUNT = 8;
      const QUARTER_DURATION_MS = 3 * 60 * 60 * 1000;
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
      const OMNI_SYNC_QUEUE_KEY = "omniSyncQueue:v1";
      const OMNI_SYNC_SHADOW_KEY = "omniSyncShadow:v1";
      const OMNI_SYNC_CENTER_KEY = "omniSyncCenter:v1";
      const OMNI_PRIVACY_SETTINGS_KEY = "omniPrivacySettings:v1";
      const NATIVE_NOTIFICATION_SNAPSHOT_KEY = "omniNativeNotifications:v1";
      const OMNI_CALENDAR_SYNC_STATE_KEY = "omniCalendarSyncState:v1";
      const OMNI_CALENDAR_EVENT_DURATION_MS = 30 * 60 * 1000;
      const NOTIFICATION_ENGINE_INTERVAL_MS = 60 * 1000;
      const OMNI_APP_VERSION_LABEL = "OMNI DEV";
      const OMNI_APP_BUILD_LABEL = "2026-03-10 05:05";
      const OMNI_NOTIFICATION_THREAD_ID = "omni-alerts";
      const OMNI_PINNED_REMINDER_SPECS = [
        {
          id: "omni_latiesha_20260317_1700",
          when: "2026-03-17T17:00:00+00:00",
          title: "Latiesha",
          desc: "Worth It follow-up.",
          notifyOffsets: [0],
          syncToAppleCalendar: true,
        },
      ];
      const nativeWindowFetch = window.fetch.bind(window);
      let offlineSyncQueue = null;
      let offlineSyncShadow = null;
      let liveDevBuildVersion = "";
      let liveDevReloadTimerId = 0;
      let runtimeModeFetchPromise = null;
      let runtimeModeState = {
        available: false,
        remoteCapable: false,
        activeMode: "bundled",
        persistedMode: "",
        currentUrl: "",
        localUrl: "",
        remoteUrl: "",
      };
      let macIphoneLiveFetchPromise = null;
      let macIphoneLiveBusy = false;
      let macIphoneLiveState = {
        available: false,
        configuredMode: "bundled",
        configuredUrl: "",
        configuredHost: "",
        serverRunning: false,
        managedByApp: false,
        serverControl: "stopped",
        lastAction: "",
        lastChangedAt: "",
        lastError: "",
        lastSummary: "",
        xcodeStepRequired: true,
      };

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

      function initTerminalAppTitle() {
        if (window.OMNI_DRAFT_MODE || appTitleTerminalTimer) return;
        const titleEl = document.getElementById("app-title");
        if (!titleEl) return;
        const baseTitle = String(titleEl.dataset.baseTitle || titleEl.textContent || "PROJECTTITLE").trim().toUpperCase();
        titleEl.dataset.baseTitle = baseTitle;
        const frames = ["|", "/", "-", "\\"];
        let frameIndex = 0;
        const render = () => {
          const left = frames[frameIndex % frames.length];
          const right = frames[(frameIndex + 2) % frames.length];
          titleEl.textContent = `[${left}] ${baseTitle} [${right}]`;
          frameIndex += 1;
        };
        render();
        appTitleTerminalTimer = window.setInterval(render, 140);
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

      function cloneSyncData(value) {
        if (value == null) return value;
        return JSON.parse(JSON.stringify(value));
      }

      function safeSyncName(name) {
        const cleaned = String(name || "").trim().replace(/[^A-Za-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
        return cleaned || "Untitled";
      }

      function safeOperationRel(operation) {
        const parts = String(operation || "").split("/").map((part) => safeSyncName(part)).filter(Boolean);
        return parts.length ? parts.join("/") : "ProjectTitle";
      }

      function buildSyntheticMissionPath(operation, missionName) {
        return `OperationDir/Operations/${safeOperationRel(operation)}/Missions/${safeSyncName(missionName)}.md`;
      }

      function parseMissionIdentityFromPath(path) {
        const raw = String(path || "").trim();
        const parts = raw.split("/").filter(Boolean);
        const opsIndex = parts.indexOf("Operations");
        const missionsIndex = parts.indexOf("Missions");
        const op = opsIndex >= 0 && missionsIndex > opsIndex ? parts.slice(opsIndex + 1, missionsIndex).join("/") : "";
        const rawMission = missionsIndex >= 0 && parts[missionsIndex + 1]
          ? String(parts[missionsIndex + 1]).replace(/\.md$/i, "")
          : "";
        const safeMission = safeSyncName(rawMission || "NEW_MISSION");
        return {
          operation: safeOperationRel(op),
          safeMission,
          displayName: safeMission.replace(/_/g, " "),
          path: buildSyntheticMissionPath(op || "ProjectTitle", safeMission),
        };
      }

      function buildMissionIdentityFromPayload(payload = {}) {
        const parsed = parseMissionIdentityFromPath(payload.path || payload.mission_path || "");
        const operation = safeOperationRel(payload.operation || parsed.operation || "ProjectTitle");
        const safeMission = safeSyncName(payload.name || payload.mission || parsed.safeMission || "NEW_MISSION");
        return {
          operation,
          safeMission,
          displayName: safeMission.replace(/_/g, " "),
          path: buildSyntheticMissionPath(operation, safeMission),
        };
      }

      function todayYmd() {
        return new Date().toISOString().slice(0, 10);
      }

      function localMissionDateTime(value = new Date()) {
        const date = value instanceof Date ? value : new Date(value || Date.now());
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      }

      function normalizeMissionCreatedAt(value) {
        const raw = String(value || "").trim();
        if (!raw) return localMissionDateTime();
        const simple = raw.replace("T", " ").replace(/:\d{2}(?:\.\d+)?Z?$/, (match) => match.startsWith(":") ? match : "");
        const hit = simple.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})/);
        if (hit) return `${hit[1]} ${hit[2]}`;
        const parsed = new Date(raw);
        if (!Number.isNaN(parsed.getTime())) return localMissionDateTime(parsed);
        return raw;
      }

      function missionSequenceId(index) {
        return `MIS-${String(Math.max(1, index)).padStart(3, "0")}`;
      }

      function compareMissionSequence(a, b) {
        return String(a?.created_at || a?.date || "").localeCompare(String(b?.created_at || b?.date || ""))
          || String(a?.operation || "").localeCompare(String(b?.operation || ""))
          || String(a?.name || "").localeCompare(String(b?.name || ""))
          || String(a?.path || "").localeCompare(String(b?.path || ""));
      }

      function reindexShadowMissions(shadow) {
        if (!shadow || !Array.isArray(shadow.missions)) return;
        shadow.missions.forEach((row) => {
          row.name = String(row?.name || parseMissionIdentityFromPath(row?.path || "").displayName || "Mission").trim() || "Mission";
          row.created_at = normalizeMissionCreatedAt(row?.created_at || row?.date || "");
          row.date = row.created_at;
        });
        [...shadow.missions].sort(compareMissionSequence).forEach((row, idx) => {
          row.mission_id = missionSequenceId(idx + 1);
        });
      }

      function isoTimestamp() {
        return new Date().toISOString();
      }

      function defaultOfflineSyncShadow() {
        return {
          dirty: false,
          seeded: false,
          operations: [],
          missions: [],
          blackbook: [],
          hvi: [],
          docs: {},
          missionBriefs: {},
          missionDebriefs: {},
        };
      }

      function getOfflineSyncQueue() {
        if (Array.isArray(offlineSyncQueue)) return offlineSyncQueue;
        try {
          const raw = localStorage.getItem(OMNI_SYNC_QUEUE_KEY);
          const parsed = raw ? JSON.parse(raw) : [];
          offlineSyncQueue = Array.isArray(parsed) ? parsed : [];
        } catch (_) {
          offlineSyncQueue = [];
        }
        return offlineSyncQueue;
      }

      function saveOfflineSyncQueue() {
        localStorage.setItem(OMNI_SYNC_QUEUE_KEY, JSON.stringify(getOfflineSyncQueue()));
      }

      function getOfflineSyncShadow() {
        if (offlineSyncShadow && typeof offlineSyncShadow === "object") return offlineSyncShadow;
        try {
          const raw = localStorage.getItem(OMNI_SYNC_SHADOW_KEY);
          const parsed = raw ? JSON.parse(raw) : null;
          offlineSyncShadow = parsed && typeof parsed === "object" ? parsed : defaultOfflineSyncShadow();
        } catch (_) {
          offlineSyncShadow = defaultOfflineSyncShadow();
        }
        if (!Array.isArray(offlineSyncShadow.operations)) offlineSyncShadow.operations = [];
        if (!Array.isArray(offlineSyncShadow.missions)) offlineSyncShadow.missions = [];
        if (!Array.isArray(offlineSyncShadow.blackbook)) offlineSyncShadow.blackbook = [];
        if (!Array.isArray(offlineSyncShadow.hvi)) offlineSyncShadow.hvi = [];
        if (!offlineSyncShadow.docs || typeof offlineSyncShadow.docs !== "object") offlineSyncShadow.docs = {};
        if (!offlineSyncShadow.missionBriefs || typeof offlineSyncShadow.missionBriefs !== "object") offlineSyncShadow.missionBriefs = {};
        if (!offlineSyncShadow.missionDebriefs || typeof offlineSyncShadow.missionDebriefs !== "object") offlineSyncShadow.missionDebriefs = {};
        return offlineSyncShadow;
      }

      function saveOfflineSyncShadow() {
        localStorage.setItem(OMNI_SYNC_SHADOW_KEY, JSON.stringify(getOfflineSyncShadow()));
      }

      function seedOfflineSyncShadowFromMemory() {
        const shadow = getOfflineSyncShadow();
        if (shadow.seeded) return shadow;
        shadow.operations = Array.isArray(allOps) ? cloneSyncData(allOps) : [];
        shadow.missions = Array.isArray(allMissions) ? cloneSyncData(allMissions) : [];
        reindexShadowMissions(shadow);
        shadow.blackbook = Array.isArray(allBlackbook) ? cloneSyncData(allBlackbook) : [];
        shadow.hvi = Array.isArray(allHvi) ? cloneSyncData(allHvi) : [];
        shadow.seeded = true;
        saveOfflineSyncShadow();
        return shadow;
      }

      function syncOfflineShadowToRuntime() {
        const shadow = getOfflineSyncShadow();
        if (!shadow.dirty) return;
        reindexShadowMissions(shadow);
        allOps = cloneSyncData(shadow.operations || []) || [];
        allMissions = cloneSyncData(shadow.missions || []) || [];
        allBlackbook = cloneSyncData(shadow.blackbook || []) || [];
        allHvi = cloneSyncData(shadow.hvi || []) || [];
      }

      function markOfflineSyncDirty(shadow) {
        shadow.dirty = true;
        shadow.seeded = true;
        saveOfflineSyncShadow();
        syncOfflineShadowToRuntime();
      }

      function enqueueOfflineSyncAction(type, payload, key = "") {
        const queue = getOfflineSyncQueue();
        const action = {
          type: String(type || "").trim(),
          key: String(key || "").trim(),
          created_at: isoTimestamp(),
          payload: cloneSyncData(payload || {}),
        };
        if (action.key) {
          const idx = queue.findIndex((item) => String(item?.key || "") === action.key);
          if (idx >= 0) queue[idx] = action;
          else queue.push(action);
        } else {
          queue.push(action);
        }
        saveOfflineSyncQueue();
      }

      function normalizeHviFields(fields) {
        const out = {};
        if (!fields || typeof fields !== "object") return out;
        Object.keys(fields).forEach((key) => {
          const k = String(key || "").trim();
          if (!k) return;
          out[k] = String(fields[key] == null ? "" : fields[key]).trim();
        });
        return out;
      }

      function upsertShadowHvi(shadow, handle, fields) {
        const cleanHandle = String(handle || "").trim();
        if (!cleanHandle) return null;
        const cleanFields = normalizeHviFields(fields);
        const idx = shadow.hvi.findIndex((row) => String(row?.handle || "").trim().toLowerCase() === cleanHandle.toLowerCase());
        if (idx === -1) {
          const baseFields = {};
          if (!("Status" in cleanFields)) baseFields.Status = "N/A";
          if (!("Number" in cleanFields)) baseFields.Number = "N/A";
          Object.assign(baseFields, cleanFields);
          shadow.hvi.push({
            handle: cleanHandle,
            stage: baseFields.Status || "N/A",
            status: baseFields.Status || "N/A",
            number: baseFields.Number || "N/A",
            fields: baseFields,
          });
        } else {
          const current = shadow.hvi[idx] || {};
          const nextFields = normalizeHviFields(current.fields || {});
          Object.assign(nextFields, cleanFields);
          shadow.hvi[idx] = {
            ...current,
            handle: cleanHandle,
            stage: nextFields.Status || current.stage || "N/A",
            status: nextFields.Status || current.status || "N/A",
            number: nextFields.Number || current.number || "N/A",
            fields: nextFields,
          };
        }
        return cleanHandle;
      }

      function upsertShadowBlackbook(shadow, entry) {
        const now = new Date();
        const probeId = String(entry?.Probe_ID || "").trim() || `BB-${now.toISOString().replace(/[-:TZ.]/g, "").slice(0, 14)}`;
        const row = {
          Probe_ID: probeId,
          Date: String(entry?.Date || "").trim() || todayYmd(),
          Time: String(entry?.Time || "").trim() || now.toISOString().slice(11, 16),
          Operation: String(entry?.Operation || "").trim(),
          Mission: String(entry?.Mission || "").trim(),
          Status: String(entry?.Status || "PENDING").trim() || "PENDING",
          Description: String(entry?.Description || "").trim(),
          Hypothesis: String(entry?.Hypothesis || "").trim(),
          Platform: String(entry?.Platform || "Internal").trim() || "Internal",
          Result_Quantitative: String(entry?.Result_Quantitative || "PENDING").trim() || "PENDING",
          Notes: String(entry?.Notes || "").trim(),
        };
        const idx = shadow.blackbook.findIndex((item) => String(item?.Probe_ID || "").trim() === probeId);
        if (idx === -1) shadow.blackbook.push(row);
        else shadow.blackbook[idx] = { ...shadow.blackbook[idx], ...row };
        return probeId;
      }

      function removeShadowMissionArtifacts(shadow, missionPath) {
        delete shadow.missionBriefs[String(missionPath || "")];
        delete shadow.missionDebriefs[String(missionPath || "")];
      }

      function findShadowMission(shadow, missionPath, operation, displayName) {
        const targetPath = String(missionPath || "");
        const cleanOp = safeOperationRel(operation || "");
        const cleanName = String(displayName || "").trim().toLowerCase();
        return shadow.missions.find((row) => {
          if (targetPath && String(row?.path || "") === targetPath) return true;
          return String(row?.operation || "") === cleanOp && String(row?.name || "").trim().toLowerCase() === cleanName;
        }) || null;
      }

      function ensureShadowMission(shadow, payload = {}) {
        const ident = buildMissionIdentityFromPayload(payload);
        const existing = findShadowMission(shadow, ident.path, ident.operation, ident.displayName);
        if (existing) {
          if (payload.status) existing.status = String(payload.status || existing.status || "PENDING").trim() || "PENDING";
          existing.created_at = normalizeMissionCreatedAt(payload.created_at || existing.created_at || existing.date || "");
          existing.date = existing.created_at;
          if (payload.mission_id) existing.mission_id = String(payload.mission_id || "").trim();
          return existing;
        }
        if (!shadow.operations.includes(ident.operation)) shadow.operations.push(ident.operation);
        const row = {
          date: normalizeMissionCreatedAt(payload.created_at || payload.date || ""),
          created_at: normalizeMissionCreatedAt(payload.created_at || payload.date || ""),
          mission_id: String(payload.mission_id || "").trim(),
          operation: ident.operation,
          name: ident.displayName,
          status: String(payload.status || "PENDING").trim() || "PENDING",
          path: ident.path,
        };
        row.date = row.created_at;
        shadow.missions.push(row);
        return row;
      }

      async function readBundledJsonSnapshot(path) {
        const res = await nativeWindowFetch(path, { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load ${path}`);
        return res.json();
      }

      async function readBundledTextFile(path) {
        const res = await nativeWindowFetch(path, { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load ${path}`);
        return res.text();
      }

      function jsonResponse(payload, status = 200) {
        return new Response(JSON.stringify(payload), {
          status,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        });
      }

      function errorJsonResponse(message, status = 400) {
        return jsonResponse({ error: String(message || "Request failed.") }, status);
      }

      function offlineReadDataForEndpoint(endpoint) {
        if (!shouldPreferOfflineSnapshots()) return undefined;
        const shadow = getOfflineSyncShadow();
        if (!shadow.dirty) return undefined;
        if (endpoint === "/api/operations") return cloneSyncData(shadow.operations || []) || [];
        if (endpoint === "/api/missions") return cloneSyncData(shadow.missions || []) || [];
        if (endpoint === "/api/blackbook") return cloneSyncData(shadow.blackbook || []) || [];
        if (endpoint === "/api/hvi") return cloneSyncData(shadow.hvi || []) || [];
        return undefined;
      }

      async function handleOfflineApiRequest(urlObj, method, body) {
        const path = String(urlObj?.pathname || "");
        const query = urlObj?.searchParams || new URLSearchParams();

        if (method === "GET" && OFFLINE_SNAPSHOT_MAP[path]) {
          const shadowData = offlineReadDataForEndpoint(path);
          if (shadowData !== undefined) return jsonResponse(shadowData, 200);
          try {
            const data = await readBundledJsonSnapshot(OFFLINE_SNAPSHOT_MAP[path]);
            return jsonResponse(data, 200);
          } catch (e) {
            return errorJsonResponse(e?.message || "Snapshot unavailable.", 404);
          }
        }

        if (method === "GET" && path === "/api/mission/brief") {
          const missionPath = String(query.get("mission_path") || "");
          const shadow = getOfflineSyncShadow();
          const entry = shadow.missionBriefs[missionPath];
          if (!entry) {
            return jsonResponse({ mission_path: missionPath, versions: [], latest: null, content: "" }, 200);
          }
          return jsonResponse({
            mission_path: missionPath,
            versions: cloneSyncData(entry.versions || []) || [],
            latest: cloneSyncData(entry.latest || null),
            content: String(entry.content || ""),
          }, 200);
        }

        if (method === "GET" && path === "/api/mission/brief/version") {
          const missionPath = String(query.get("mission_path") || "");
          const file = String(query.get("file") || "");
          const shadow = getOfflineSyncShadow();
          const entry = shadow.missionBriefs[missionPath];
          const version = entry && Array.isArray(entry.versions)
            ? entry.versions.find((row) => String(row?.file || "") === file)
            : null;
          if (!version) return errorJsonResponse("Brief version not found", 404);
          return jsonResponse({
            mission_path: missionPath,
            version: cloneSyncData(version),
            content: String(version.content || ""),
          }, 200);
        }

        if (method === "GET" && path === "/api/mission/debrief") {
          const missionPath = String(query.get("mission_path") || "");
          const shadow = getOfflineSyncShadow();
          const entry = shadow.missionDebriefs[missionPath];
          if (!entry) {
            return jsonResponse({ mission_path: missionPath, versions: [], latest: null, content: "" }, 200);
          }
          return jsonResponse({
            mission_path: missionPath,
            versions: cloneSyncData(entry.versions || []) || [],
            latest: cloneSyncData(entry.latest || null),
            content: String(entry.content || ""),
          }, 200);
        }

        if (method === "GET" && path === "/api/doc/content") {
          const fileName = String(query.get("file") || "").split("/").pop();
          if (!fileName) return errorJsonResponse("Invalid or locked file", 400);
          const shadow = getOfflineSyncShadow();
          if (shadow.docs[fileName]) {
            return jsonResponse({
              file: fileName,
              path: fileName,
              content: String(shadow.docs[fileName].content || ""),
            }, 200);
          }
          try {
            const content = await readBundledTextFile(`/${fileName}`);
            return jsonResponse({ file: fileName, path: fileName, content }, 200);
          } catch (_) {
            return errorJsonResponse("Invalid or locked file", 400);
          }
        }

        if (method === "POST" && path === "/api/operation") {
          const shadow = seedOfflineSyncShadowFromMemory();
          const op = safeOperationRel(body?.name || "ProjectTitle");
          if (!shadow.operations.includes(op)) shadow.operations.push(op);
          markOfflineSyncDirty(shadow);
          enqueueOfflineSyncAction("operation.create", { name: op }, `operation.create:${op}`);
          return jsonResponse({ ok: true, operation: op }, 201);
        }

        if (method === "DELETE" && path === "/api/operation") {
          const shadow = seedOfflineSyncShadowFromMemory();
          const op = safeOperationRel(body?.name || "");
          if (!op) return errorJsonResponse("Operation not found", 404);
          shadow.operations = shadow.operations.filter((item) => item !== op);
          const removedPaths = shadow.missions
            .filter((item) => String(item?.operation || "") === op || String(item?.operation || "").startsWith(`${op}/`))
            .map((item) => String(item?.path || ""));
          shadow.missions = shadow.missions.filter((item) => !(String(item?.operation || "") === op || String(item?.operation || "").startsWith(`${op}/`)));
          reindexShadowMissions(shadow);
          shadow.blackbook = shadow.blackbook.filter((item) => String(item?.Operation || "").trim() !== op);
          removedPaths.forEach((missionPath) => removeShadowMissionArtifacts(shadow, missionPath));
          markOfflineSyncDirty(shadow);
          enqueueOfflineSyncAction("operation.delete", { name: op });
          return jsonResponse({ ok: true }, 200);
        }

        if (method === "POST" && path === "/api/operation/merge") {
          const shadow = seedOfflineSyncShadowFromMemory();
          const source = safeOperationRel(body?.source || "");
          const target = safeOperationRel(body?.target || "");
          const merged = safeOperationRel(body?.name || `${source}_${target}`);
          if (!source || !target || source === target) return errorJsonResponse("Invalid source/target operation names", 400);
          shadow.operations = shadow.operations.filter((item) => item !== source && item !== target);
          if (!shadow.operations.includes(merged)) shadow.operations.push(merged);
          shadow.missions = shadow.missions.map((item) => {
            const currentOp = String(item?.operation || "");
            let nextOp = currentOp;
            if (currentOp === source || currentOp.startsWith(`${source}/`)) nextOp = `${merged}/${currentOp}`;
            if (currentOp === target || currentOp.startsWith(`${target}/`)) nextOp = `${merged}/${currentOp}`;
            if (nextOp === currentOp) return item;
            const missionName = String(item?.name || "").trim() || parseMissionIdentityFromPath(item?.path || "").displayName;
            return {
              ...item,
              operation: nextOp,
              path: buildSyntheticMissionPath(nextOp, missionName),
            };
          });
          shadow.blackbook = shadow.blackbook.map((item) => {
            const opName = String(item?.Operation || "");
            if (opName === source || opName.startsWith(`${source}/`)) return { ...item, Operation: `${merged}/${opName}` };
            if (opName === target || opName.startsWith(`${target}/`)) return { ...item, Operation: `${merged}/${opName}` };
            return item;
          });
          markOfflineSyncDirty(shadow);
          enqueueOfflineSyncAction("operation.merge", { source, target, name: merged });
          return jsonResponse({ ok: true, operation: merged }, 201);
        }

        if (method === "POST" && path === "/api/mission") {
          const shadow = seedOfflineSyncShadowFromMemory();
          const ident = buildMissionIdentityFromPayload(body || {});
          const status = String(body?.status || "PENDING").trim() || "PENDING";
          const row = ensureShadowMission(shadow, {
            operation: ident.operation,
            name: ident.displayName,
            status,
            path: ident.path,
            created_at: body?.created_at || "",
          });
          row.status = status;
          reindexShadowMissions(shadow);
          markOfflineSyncDirty(shadow);
          enqueueOfflineSyncAction("mission.create", {
            operation: ident.operation,
            name: ident.displayName,
            path: ident.path,
            status,
          });
          return jsonResponse({
            ok: true,
            path: ident.path,
            operation: ident.operation,
            name: ident.displayName,
            mission_id: row.mission_id || "",
            created_at: row.created_at || "",
          }, 201);
        }

        if (method === "DELETE" && path === "/api/mission") {
          const shadow = seedOfflineSyncShadowFromMemory();
          const ident = buildMissionIdentityFromPayload(body || {});
          const before = shadow.missions.length;
          shadow.missions = shadow.missions.filter((item) => String(item?.path || "") !== ident.path);
          reindexShadowMissions(shadow);
          removeShadowMissionArtifacts(shadow, ident.path);
          if (shadow.missions.length === before) return errorJsonResponse("Mission file not found", 404);
          markOfflineSyncDirty(shadow);
          enqueueOfflineSyncAction("mission.delete", {
            operation: ident.operation,
            name: ident.displayName,
            path: ident.path,
          });
          return jsonResponse({ ok: true }, 200);
        }

        if (method === "POST" && path === "/api/mission/status") {
          const shadow = seedOfflineSyncShadowFromMemory();
          const ident = buildMissionIdentityFromPayload(body || {});
          const status = String(body?.status || "PENDING").trim() || "PENDING";
          const mission = ensureShadowMission(shadow, { operation: ident.operation, name: ident.displayName, status, path: ident.path });
          mission.status = status;
          reindexShadowMissions(shadow);
          markOfflineSyncDirty(shadow);
          enqueueOfflineSyncAction("mission.status", {
            operation: ident.operation,
            name: ident.displayName,
            path: ident.path,
            status,
          }, `mission.status:${ident.path}`);
          return jsonResponse({ ok: true }, 200);
        }

        if (method === "POST" && path === "/api/mission/brief/save") {
          const shadow = seedOfflineSyncShadowFromMemory();
          const ident = buildMissionIdentityFromPayload({
            path: body?.mission_path || "",
            operation: body?.operation || "",
            name: body?.name || "",
          });
          const mission = ensureShadowMission(shadow, { operation: ident.operation, name: ident.displayName, status: "IN_PROGRESS", path: ident.path });
          if (mission.status !== "COMPLETE") mission.status = "IN_PROGRESS";
          reindexShadowMissions(shadow);
          const phase = Math.max(1, parseInt(body?.phase || "1", 10) || 1);
          const version = {
            phase,
            file: `phase_${String(phase).padStart(2, "0")}_${isoTimestamp().replace(/[-:TZ.]/g, "").slice(0, 14)}.md`,
            created_at: isoTimestamp(),
            variables: Array.isArray(body?.variables) ? cloneSyncData(body.variables) : [],
            content: String(body?.content || ""),
          };
          const entry = shadow.missionBriefs[ident.path] || { versions: [], latest: null, content: "" };
          entry.versions = Array.isArray(entry.versions) ? entry.versions : [];
          entry.versions.push(version);
          entry.latest = {
            phase: version.phase,
            file: version.file,
            created_at: version.created_at,
            variables: cloneSyncData(version.variables),
          };
          entry.content = version.content;
          shadow.missionBriefs[ident.path] = entry;
          markOfflineSyncDirty(shadow);
          enqueueOfflineSyncAction("mission.brief.save", {
            operation: ident.operation,
            name: ident.displayName,
            path: ident.path,
            phase,
            content: version.content,
            variables: cloneSyncData(version.variables),
          }, `mission.brief.save:${ident.path}:phase:${phase}`);
          return jsonResponse({ ok: true, version: cloneSyncData(entry.latest) }, 201);
        }

        if (method === "POST" && path === "/api/mission/debrief/save") {
          const shadow = seedOfflineSyncShadowFromMemory();
          const ident = buildMissionIdentityFromPayload({
            path: body?.mission_path || "",
            operation: body?.operation || "",
            name: body?.name || "",
          });
          const briefEntry = shadow.missionBriefs[ident.path];
          if (!briefEntry || !Array.isArray(briefEntry.versions) || !briefEntry.versions.length) {
            return errorJsonResponse("Brief required before debrief.", 400);
          }
          const mission = ensureShadowMission(shadow, { operation: ident.operation, name: ident.displayName, status: "COMPLETE", path: ident.path });
          mission.status = "COMPLETE";
          reindexShadowMissions(shadow);
          const latestPhase = Number(briefEntry?.latest?.phase || 1) || 1;
          const version = {
            phase: latestPhase,
            file: `debrief_${String(Math.max(latestPhase, 1)).padStart(2, "0")}_${isoTimestamp().replace(/[-:TZ.]/g, "").slice(0, 14)}.md`,
            created_at: isoTimestamp(),
            content: String(body?.content || ""),
          };
          const entry = shadow.missionDebriefs[ident.path] || { versions: [], latest: null, content: "" };
          entry.versions = Array.isArray(entry.versions) ? entry.versions : [];
          entry.versions.push(version);
          entry.latest = {
            phase: version.phase,
            file: version.file,
            created_at: version.created_at,
          };
          entry.content = version.content;
          shadow.missionDebriefs[ident.path] = entry;
          markOfflineSyncDirty(shadow);
          enqueueOfflineSyncAction("mission.debrief.save", {
            operation: ident.operation,
            name: ident.displayName,
            path: ident.path,
            content: version.content,
          }, `mission.debrief.save:${ident.path}`);
          return jsonResponse({ ok: true, version: cloneSyncData(entry.latest), hvi_updated: [] }, 201);
        }

        if (method === "POST" && path === "/api/blackbook/upsert") {
          const shadow = seedOfflineSyncShadowFromMemory();
          const probeId = upsertShadowBlackbook(shadow, body || {});
          markOfflineSyncDirty(shadow);
          enqueueOfflineSyncAction("blackbook.upsert", {
            Probe_ID: probeId,
            Date: body?.Date || "",
            Time: body?.Time || "",
            Operation: body?.Operation || "",
            Mission: body?.Mission || "",
            Status: body?.Status || "PENDING",
            Description: body?.Description || "",
            Hypothesis: body?.Hypothesis || "",
            Platform: body?.Platform || "",
            Result_Quantitative: body?.Result_Quantitative || "",
            Notes: body?.Notes || "",
          }, `blackbook.upsert:${probeId}`);
          return jsonResponse({ ok: true, Probe_ID: probeId }, 200);
        }

        if (method === "DELETE" && path === "/api/blackbook") {
          const shadow = seedOfflineSyncShadowFromMemory();
          const probeId = String(body?.probe_id || "").trim();
          const before = shadow.blackbook.length;
          shadow.blackbook = shadow.blackbook.filter((item) => String(item?.Probe_ID || "").trim() !== probeId);
          if (shadow.blackbook.length === before) return errorJsonResponse("Probe not found", 404);
          markOfflineSyncDirty(shadow);
          enqueueOfflineSyncAction("blackbook.delete", { probe_id: probeId });
          return jsonResponse({ ok: true }, 200);
        }

        if (method === "POST" && path === "/api/hvi") {
          const shadow = seedOfflineSyncShadowFromMemory();
          const handle = upsertShadowHvi(shadow, body?.handle || "", body?.fields || {});
          if (!handle) return errorJsonResponse("Invalid HVI handle", 400);
          markOfflineSyncDirty(shadow);
          enqueueOfflineSyncAction("hvi.upsert", {
            handle,
            fields: normalizeHviFields(body?.fields || {}),
          }, `hvi.upsert:${String(handle).toLowerCase()}`);
          return jsonResponse({ ok: true, handle }, 200);
        }

        if (method === "DELETE" && path === "/api/hvi") {
          const shadow = seedOfflineSyncShadowFromMemory();
          const handle = String(body?.handle || "").trim();
          const before = shadow.hvi.length;
          shadow.hvi = shadow.hvi.filter((item) => String(item?.handle || "").trim().toLowerCase() !== handle.toLowerCase());
          if (shadow.hvi.length === before) return errorJsonResponse("HVI not found", 404);
          markOfflineSyncDirty(shadow);
          enqueueOfflineSyncAction("hvi.delete", { handle });
          return jsonResponse({ ok: true }, 200);
        }

        if (method === "POST" && path === "/api/doc/content") {
          const shadow = seedOfflineSyncShadowFromMemory();
          const fileName = String(body?.file || "").split("/").pop();
          if (!["MissionBriefing.md", "MissionDebrief.md"].includes(fileName || "")) {
            return errorJsonResponse("Invalid or locked file", 400);
          }
          shadow.docs[fileName] = {
            file: fileName,
            content: String(body?.content || ""),
          };
          markOfflineSyncDirty(shadow);
          enqueueOfflineSyncAction("doc.save", {
            file: fileName,
            content: String(body?.content || ""),
          }, `doc.save:${fileName}`);
          return jsonResponse({ ok: true }, 200);
        }

        if (method === "DELETE" && path === "/api/logs") {
          return jsonResponse({ ok: true }, 200);
        }

        if (path.startsWith("/api/")) {
          return errorJsonResponse("This action requires the Mac server and will sync when you import the backup on Mac.", 503);
        }

        return errorJsonResponse("Not Found", 404);
      }

      window.fetch = async function omniFetch(input, init = undefined) {
        if (!shouldPreferOfflineSnapshots()) {
          return nativeWindowFetch(input, init);
        }
        const rawUrl = typeof input === "string" ? input : (input && input.url) ? input.url : "";
        const urlObj = new URL(rawUrl, window.location.href);
        if (!urlObj.pathname.startsWith("/api/")) {
          return nativeWindowFetch(input, init);
        }
        const method = String(init?.method || (typeof input !== "string" ? input?.method : "") || "GET").toUpperCase();
        let body = {};
        const rawBody = typeof init?.body === "string" ? init.body : "";
        if (rawBody) {
          try {
            body = JSON.parse(rawBody);
          } catch (_) {
            body = {};
          }
        }
        return handleOfflineApiRequest(urlObj, method, body);
      };

      function collectAppBackupPayload() {
        const ls = {};
        const includeKey = (k) => /^(managementapp:|operationColors:|operationOrder:|hvi|checklist|routineData|journal|reminder|notification|appearance|performance|tutor|missionPlan:|dashboardSession:|swissknife|omniSync)/i.test(String(k || ""));
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
            version: "backup-v2",
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
          sync_queue: cloneSyncData(getOfflineSyncQueue()) || [],
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
          recordSyncCenterEvent("backup_exported", { message: file.name || name });
          if (currentView === "settings") renderSyncCenter();
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
            recordSyncCenterEvent("backup_shared", { message: file.name || name });
            if (currentView === "settings") renderSyncCenter();
            themedNotice("Backup shared.");
            return;
          }
          downloadBackupText(name, text);
          recordSyncCenterEvent("backup_exported", { message: name });
          if (currentView === "settings") renderSyncCenter();
          themedNotice("Share not available. Backup downloaded instead.");
        } catch (e) {
          themedNotice("Share cancelled or failed.");
        }
      }

      function backupLocalStorageKeyFilter(key) {
        return /^(managementapp:|operationColors:|operationOrder:|hvi|checklist|routineData|journal|reminder|notification|appearance|performance|tutor|missionPlan:|dashboardSession:|swissknife|omniSync)/i.test(String(key || ""));
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

      async function importProjectBackupToMac(parsed) {
        if (shouldPreferOfflineSnapshots()) return null;
        if (!parsed || typeof parsed !== "object") return null;
        const hasProjectPayload = (Array.isArray(parsed.sync_queue) && parsed.sync_queue.length)
          || (parsed.snapshot && typeof parsed.snapshot === "object");
        if (!hasProjectPayload) return null;
        try {
          const res = await nativeWindowFetch("/api/backup/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parsed),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: "Project sync failed." }));
            return { ok: false, error: err.error || "Project sync failed." };
          }
          return res.json();
        } catch (e) {
          return { ok: false, error: e?.message || "Project sync failed." };
        }
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

          const projectSyncResult = await importProjectBackupToMac(parsed);
          if (projectSyncResult && projectSyncResult.ok) {
            delete backupLocalStorage[OMNI_SYNC_QUEUE_KEY];
            delete backupLocalStorage[OMNI_SYNC_SHADOW_KEY];
          }

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

          let notice = "Backup imported.";
          if (projectSyncResult && projectSyncResult.ok) {
            const applied = Number(projectSyncResult?.summary?.applied_actions || 0);
            notice = `Backup imported. Mac files synced: ${applied} action(s).`;
          } else if (projectSyncResult && !projectSyncResult.ok) {
            notice = `Local backup imported. Mac file sync failed: ${projectSyncResult.error || "Unknown error"}`;
          }

          recordSyncCenterEvent("backup_imported", { message: notice });
          themedNotice(`${notice} Reloading...`);
          setTimeout(() => window.location.reload(), 450);
        } catch (e) {
          themedNotice("Import failed: " + (e?.message || "Unknown error"));
        } finally {
          if (inputEl) inputEl.value = "";
        }
      }

      function formatLocalDateTime(value) {
        if (!value) return "Never";
        const d = new Date(value);
        if (!Number.isFinite(d.getTime())) return String(value);
        return d.toLocaleString("en-GB", { hour12: false });
      }

      function readSyncCenterState() {
        try {
          const raw = localStorage.getItem(OMNI_SYNC_CENTER_KEY);
          const parsed = raw ? JSON.parse(raw) : null;
          return parsed && typeof parsed === "object"
            ? parsed
            : { events: [] };
        } catch (_) {
          return { events: [] };
        }
      }

      function writeSyncCenterState(state) {
        localStorage.setItem(OMNI_SYNC_CENTER_KEY, JSON.stringify(state && typeof state === "object" ? state : { events: [] }));
      }

      function recordSyncCenterEvent(kind, detail = {}) {
        const state = readSyncCenterState();
        const next = {
          ...state,
          last_kind: String(kind || "").trim(),
          last_at: new Date().toISOString(),
          events: Array.isArray(state.events) ? state.events.slice(-29) : [],
        };
        next.events.push({
          kind: String(kind || "").trim() || "activity",
          at: new Date().toISOString(),
          detail: detail && typeof detail === "object" ? detail : {},
        });
        next.events = next.events.slice(-30);
        writeSyncCenterState(next);
      }

      function currentAppDataCounts() {
        const routineCount = ["morning", "night"].reduce((sum, period) => sum + (Array.isArray(routineData?.[period]) ? routineData[period].length : 0), 0);
        const gymExerciseCount = routineData?.catalog && typeof routineData.catalog === "object"
          ? Object.values(routineData.catalog).reduce((sum, rows) => sum + (Array.isArray(rows) ? rows.length : 0), 0)
          : 0;
        return {
          operations: Array.isArray(allOps) ? allOps.length : 0,
          missions: Array.isArray(allMissions) ? allMissions.length : 0,
          blackbook: Array.isArray(allBlackbook) ? allBlackbook.length : 0,
          hvi: Array.isArray(allHvi) ? allHvi.length : 0,
          datawells: Array.isArray(allDatawells) ? allDatawells.length : 0,
          books: Array.isArray(booksCatalog) ? booksCatalog.length : 0,
          blueprints: Array.isArray(blueprintCatalog) ? blueprintCatalog.length : 0,
          checklist: Array.isArray(checklistItems) ? checklistItems.length : 0,
          reminders: Array.isArray(routineData?.reminders) ? routineData.reminders.length : 0,
          journal: Array.isArray(routineData?.journal) ? routineData.journal.length : 0,
          postingTemplate: Array.isArray(routineData?.postingTemplate?.items) ? routineData.postingTemplate.items.length : 0,
          routines: routineCount,
          gym: gymExerciseCount,
          gymSavedSessions: Array.isArray(routineData?.savedSessions) ? routineData.savedSessions.length : 0,
          syncQueue: Array.isArray(getOfflineSyncQueue()) ? getOfflineSyncQueue().length : 0,
        };
      }

      function buildSyncCenterReportText() {
        const state = readSyncCenterState();
        const counts = currentAppDataCounts();
        const events = (Array.isArray(state.events) ? state.events : []).slice().reverse();
        return [
          "OMNI // SYNC CENTER REPORT",
          "",
          `APP: ${OMNI_APP_VERSION_LABEL}`,
          `BUILD: ${OMNI_APP_BUILD_LABEL}`,
          `GENERATED: ${new Date().toISOString()}`,
          `LAST ACTION: ${formatLocalDateTime(state.last_at)}${state.last_kind ? ` :: ${state.last_kind}` : ""}`,
          "",
          "[DATA COUNTS]",
          `Operations: ${counts.operations}`,
          `Missions: ${counts.missions}`,
          `Blackbook: ${counts.blackbook}`,
          `HVI: ${counts.hvi}`,
          `Datawells: ${counts.datawells}`,
          `Books: ${counts.books}`,
          `Blueprints: ${counts.blueprints}`,
          `Checklist: ${counts.checklist}`,
          `Reminders: ${counts.reminders}`,
          `Journal: ${counts.journal}`,
          `Posting Template Stages: ${counts.postingTemplate}`,
          `Routine Tasks: ${counts.routines}`,
          `Gym Exercises: ${counts.gym}`,
          `Saved Gym Sessions: ${counts.gymSavedSessions}`,
          `Offline Sync Queue: ${counts.syncQueue}`,
          "",
          "[RECENT EVENTS]",
          events.length
            ? events.map((row) => `${formatLocalDateTime(row.at)} :: ${String(row.kind || "activity").toUpperCase()}${row.detail?.message ? ` :: ${row.detail.message}` : ""}`).join("\n")
            : "No sync center events yet.",
        ].join("\n");
      }

      function saveTextFile(name, text) {
        downloadBackupText(String(name || "omni-export.txt"), String(text || ""));
      }

      async function shareTextFile(title, name, text) {
        const file = new File([String(text || "")], String(name || "omni-export.txt"), { type: "text/plain" });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: String(title || "OMNI Export"),
            text: String(title || "OMNI Export"),
            files: [file],
          });
          return true;
        }
        saveTextFile(name, text);
        return false;
      }

      function saveSyncCenterReport() {
        const fileName = `omni-sync-report-${new Date().toISOString().replace(/[:.]/g, "-")}.txt`;
        saveTextFile(fileName, buildSyncCenterReportText());
        recordSyncCenterEvent("sync_report_saved", { message: fileName });
        if (currentView === "settings") renderSyncCenter();
        themedNotice("Sync report saved.");
      }

      function getRuntimeModePlugin() {
        return window.Capacitor?.Plugins?.OmniRuntimeMode || null;
      }

      function setRuntimeModeState(patch = {}) {
        runtimeModeState = {
          ...runtimeModeState,
          ...(patch && typeof patch === "object" ? patch : {}),
        };
        return runtimeModeState;
      }

      function defaultRuntimeModeState() {
        return {
          available: false,
          remoteCapable: isNativeLanDevSession(),
          activeMode: isNativeLanDevSession() ? "live" : "bundled",
          persistedMode: "",
          currentUrl: String(window.location?.href || ""),
          localUrl: "",
          remoteUrl: "",
        };
      }

      async function refreshRuntimeModeState(force = false) {
        if (!isNativeRuntime()) {
          return setRuntimeModeState(defaultRuntimeModeState());
        }
        if (runtimeModeFetchPromise && !force) return runtimeModeFetchPromise;
        const plugin = getRuntimeModePlugin();
        if (!plugin?.getStatus) {
          return setRuntimeModeState(defaultRuntimeModeState());
        }
        runtimeModeFetchPromise = plugin.getStatus()
          .then((payload) => setRuntimeModeState({
            ...defaultRuntimeModeState(),
            ...(payload && typeof payload === "object" ? payload : {}),
          }))
          .catch(() => setRuntimeModeState(defaultRuntimeModeState()))
          .finally(() => {
            runtimeModeFetchPromise = null;
            if (currentView === "settings") renderSyncCenter();
          });
        return runtimeModeFetchPromise;
      }

      function runtimeModeStatusLabel() {
        const mode = String(runtimeModeState?.activeMode || "bundled").toUpperCase();
        if (!runtimeModeState?.remoteCapable) return `${mode} ONLY`;
        return mode;
      }

      function runtimeModeDetailLabel() {
        if (!isNativeRuntime()) return "WEB / MAC";
        if (!runtimeModeState?.remoteCapable) return "Bundled runtime only";
        return String(runtimeModeState?.activeMode || "") === "live"
          ? "Mac server linked"
          : "Bundled offline fallback";
      }

      function canControlIphoneLiveFromMac() {
        return !isNativeRuntime();
      }

      function defaultMacIphoneLiveState() {
        return {
          available: canControlIphoneLiveFromMac(),
          configuredMode: "bundled",
          configuredUrl: "",
          configuredHost: "",
          serverRunning: false,
          managedByApp: false,
          serverControl: "stopped",
          lastAction: "",
          lastChangedAt: "",
          lastError: "",
          lastSummary: "",
          xcodeStepRequired: true,
        };
      }

      function setMacIphoneLiveState(payload = {}) {
        macIphoneLiveState = {
          ...defaultMacIphoneLiveState(),
          ...(payload && typeof payload === "object" ? {
            available: payload.available !== false,
            configuredMode: String(payload.configured_mode || payload.configuredMode || "bundled").toLowerCase(),
            configuredUrl: String(payload.configured_url || payload.configuredUrl || ""),
            configuredHost: String(payload.configured_host || payload.configuredHost || ""),
            serverRunning: !!payload.server_running || !!payload.serverRunning,
            managedByApp: !!payload.managed_by_app || !!payload.managedByApp,
            serverControl: String(payload.server_control || payload.serverControl || "stopped").toLowerCase(),
            lastAction: String(payload.last_action || payload.lastAction || ""),
            lastChangedAt: String(payload.last_changed_at || payload.lastChangedAt || ""),
            lastError: String(payload.last_error || payload.lastError || ""),
            lastSummary: String(payload.last_summary || payload.lastSummary || ""),
            xcodeStepRequired: payload.xcode_step_required !== false,
          } : {}),
        };
        return macIphoneLiveState;
      }

      async function refreshMacIphoneLiveState(force = false) {
        if (!canControlIphoneLiveFromMac()) {
          return setMacIphoneLiveState(defaultMacIphoneLiveState());
        }
        if (macIphoneLiveFetchPromise && !force) return macIphoneLiveFetchPromise;
        macIphoneLiveFetchPromise = nativeWindowFetch("/api/iphone/live/status", { cache: "no-store" })
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          })
          .then((payload) => setMacIphoneLiveState(payload))
          .catch((e) => setMacIphoneLiveState({
            ...defaultMacIphoneLiveState(),
            lastError: e?.message || "Unable to load iPhone live status.",
          }))
          .finally(() => {
            macIphoneLiveFetchPromise = null;
            if (currentView === "settings") renderSyncCenter();
          });
        return macIphoneLiveFetchPromise;
      }

      function macIphoneConfiguredModeLabel() {
        return String(macIphoneLiveState?.configuredMode || "bundled").toUpperCase();
      }

      function macIphoneServerStatusLabel() {
        if (macIphoneLiveBusy) return "WORKING";
        return macIphoneLiveState?.serverRunning ? "RUNNING" : "STOPPED";
      }

      function macIphoneServerDetailLabel() {
        const control = String(macIphoneLiveState?.serverControl || "stopped").toLowerCase();
        if (control === "managed") return "Managed by Mac app";
        if (control === "external") return "External OMNI live server";
        return "No live server on port 8099";
      }

      function macIphoneSummaryLabel() {
        if (macIphoneLiveBusy) return "Applying iPhone mode change...";
        if (macIphoneLiveState?.lastSummary) return macIphoneLiveState.lastSummary;
        return macIphoneLiveState?.configuredMode === "live"
          ? "Live build configured on this Mac."
          : "Bundled/offline build configured on this Mac.";
      }

      async function toggleMacIphoneLiveMode(targetMode) {
        const target = String(targetMode || "").trim().toLowerCase();
        if (!canControlIphoneLiveFromMac()) {
          themedNotice("Mac iPhone live controls are only available from the Mac version of OMNI.");
          return;
        }
        if (target !== "live" && target !== "bundled") {
          themedNotice("Invalid iPhone live mode request.");
          return;
        }
        if (macIphoneLiveBusy) return;
        const confirmText = target === "live"
          ? "Prepare the iPhone build for LIVE mode and start the Mac LAN server now? You will still need to press Run in Xcode on the phone build."
          : "Restore the iPhone build to BUNDLED/OFFLINE mode now, stop the Mac LAN server, and sync iOS again?";
        if (!(await themedConfirm(confirmText))) return;

        macIphoneLiveBusy = true;
        if (currentView === "settings") renderSyncCenter();
        const path = target === "live" ? "/api/iphone/live/on" : "/api/iphone/live/off";
        try {
          const res = await nativeWindowFetch(path, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{}",
          });
          const payload = await res.json().catch(() => ({}));
          if (!res.ok) {
            if (payload?.status) setMacIphoneLiveState(payload.status);
            throw new Error(payload?.error || `HTTP ${res.status}`);
          }
          setMacIphoneLiveState(payload);
          recordSyncCenterEvent(
            target === "live" ? "iphone_live_enabled_from_mac" : "iphone_live_disabled_from_mac",
            {
              message: target === "live"
                ? "Mac prepared iPhone live mode."
                : "Mac restored iPhone bundled mode.",
            },
          );
          themedNotice(
            target === "live"
              ? "Mac prepared iPhone LIVE mode. Press Run in Xcode on the iPhone build."
              : "Mac restored the iPhone BUNDLED mode. Press Run in Xcode again for the offline build.",
          );
        } catch (e) {
          themedNotice(`iPhone mode change failed: ${e?.message || "Unknown error"}`);
        } finally {
          macIphoneLiveBusy = false;
          await refreshMacIphoneLiveState(true).catch(() => {});
        }
      }

      async function switchOmniRuntimeMode(targetMode) {
        const target = String(targetMode || "").trim().toLowerCase();
        const plugin = getRuntimeModePlugin();
        if (!plugin) {
          themedNotice("Runtime mode control is only available on the iPhone app.");
          return;
        }
        if (target !== "bundled" && target !== "live") {
          themedNotice("Invalid runtime mode request.");
          return;
        }
        if (target === "live" && !runtimeModeState?.remoteCapable) {
          themedNotice("This build does not have live runtime mode available.");
          return;
        }
        const confirmText = target === "bundled"
          ? "Switch this phone to bundled/offline mode now? Save any open editor changes first."
          : "Switch this phone back to live Mac mode now? The Mac server must be reachable.";
        if (!(await themedConfirm(confirmText))) return;
        try {
          recordSyncCenterEvent(target === "bundled" ? "runtime_switch_bundled" : "runtime_switch_live", {
            message: target === "bundled" ? "Switching phone to bundled mode." : "Switching phone to live mode.",
          });
          if (target === "bundled") {
            await plugin.switchToBundled();
          } else {
            await plugin.switchToLive();
          }
        } catch (e) {
          themedNotice(`Runtime switch failed: ${e?.message || "Unknown error"}`);
        }
      }

      function renderSyncCenter() {
        const summaryHost = document.getElementById("sync-center-summary");
        const notifyHost = document.getElementById("sync-center-notify-preview");
        const historyHost = document.getElementById("sync-center-history");
        const countsHost = document.getElementById("sync-center-counts");
        if (!summaryHost || !notifyHost || !historyHost || !countsHost) return;

        const state = readSyncCenterState();
        const counts = currentAppDataCounts();
        const upcoming = buildNativeNotificationRows().slice(0, 10);
        const dismissed = notificationHistory
          .filter((row) => !!row?.dismissedAt)
          .slice()
          .reverse()
          .slice(0, 12);
        const recentEvents = (Array.isArray(state.events) ? state.events : [])
          .slice()
          .reverse()
          .slice(0, 8);
        const quietLabel = notificationSettings.quietEnabled
          ? `${notificationSettings.quietStart || "22:00"}-${notificationSettings.quietEnd || "07:00"}`
          : "OFF";
        const privacyLabel = [
          privacySettings.lockOnLaunch ? "LAUNCH LOCK" : "",
          privacySettings.autoLockOnBackground ? "BG LOCK" : "",
        ].filter(Boolean).join(" • ") || "UNLOCKED ON START";
        const macIphoneLiveControls = canControlIphoneLiveFromMac()
          ? `
              <div class="sync-center-list">
                <div class="sync-center-list-title">Mac iPhone Live Control</div>
                <div class="mission-profile-highlights">
                  <div class="mission-highlight-card"><span class="mission-highlight-key">iPhone Build</span><span class="mission-highlight-value">${escapeHtmlAttr(macIphoneConfiguredModeLabel())}</span></div>
                  <div class="mission-highlight-card"><span class="mission-highlight-key">LAN Server</span><span class="mission-highlight-value">${escapeHtmlAttr(macIphoneServerStatusLabel())}</span></div>
                  <div class="mission-highlight-card"><span class="mission-highlight-key">Server Detail</span><span class="mission-highlight-value">${escapeHtmlAttr(macIphoneServerDetailLabel())}</span></div>
                  <div class="mission-highlight-card"><span class="mission-highlight-key">iPhone URL</span><span class="mission-highlight-value">${escapeHtmlAttr(macIphoneLiveState?.configuredUrl || "Not configured")}</span></div>
                  <div class="mission-highlight-card"><span class="mission-highlight-key">Last Change</span><span class="mission-highlight-value">${escapeHtmlAttr(macIphoneLiveState?.lastChangedAt ? formatLocalDateTime(macIphoneLiveState.lastChangedAt) : "No change logged")}</span></div>
                </div>
                <div class="settings-actions">
                  <button class="confirm-btn" type="button" onclick="toggleMacIphoneLiveMode('live')" ${macIphoneLiveBusy ? "disabled" : ""}>TURN IPHONE LIVE ON</button>
                  <button class="confirm-btn" type="button" onclick="toggleMacIphoneLiveMode('bundled')" ${macIphoneLiveBusy ? "disabled" : ""}>TURN IPHONE LIVE OFF</button>
                  <button class="confirm-btn" type="button" onclick="refreshMacIphoneLiveState(true)" ${macIphoneLiveBusy ? "disabled" : ""}>REFRESH LIVE STATUS</button>
                </div>
                <div class="routine-ex-note">${escapeHtmlAttr(macIphoneSummaryLabel())}</div>
                ${macIphoneLiveState?.xcodeStepRequired ? `<div class="routine-ex-note">After changing this mode on Mac, press <code>Run</code> in Xcode on the iPhone again to apply it to the installed app.</div>` : ""}
                ${macIphoneLiveState?.lastError ? `<div class="routine-ex-note" style="color:var(--warning-yellow);">${escapeHtmlAttr(macIphoneLiveState.lastError)}</div>` : ""}
              </div>
            `
          : "";
        const runtimeActions = runtimeModeState?.remoteCapable
          ? `
              <div class="settings-actions">
                <button class="confirm-btn" type="button" onclick="switchOmniRuntimeMode('bundled')">USE BUNDLED MODE</button>
                <button class="confirm-btn" type="button" onclick="switchOmniRuntimeMode('live')">USE LIVE MODE</button>
              </div>
            `
          : (isNativeRuntime()
              ? `<div class="routine-ex-note">This build only has bundled/offline runtime available.</div>`
              : "");

        summaryHost.innerHTML = `
          <div class="mission-profile-highlights">
            <div class="mission-highlight-card"><span class="mission-highlight-key">App</span><span class="mission-highlight-value">${escapeHtmlAttr(OMNI_APP_VERSION_LABEL)}</span></div>
            <div class="mission-highlight-card"><span class="mission-highlight-key">Build</span><span class="mission-highlight-value">${escapeHtmlAttr(OMNI_APP_BUILD_LABEL)}</span></div>
            <div class="mission-highlight-card"><span class="mission-highlight-key">Runtime</span><span class="mission-highlight-value">${escapeHtmlAttr(runtimeModeStatusLabel())}</span></div>
            <div class="mission-highlight-card"><span class="mission-highlight-key">Runtime Detail</span><span class="mission-highlight-value">${escapeHtmlAttr(runtimeModeDetailLabel())}</span></div>
            <div class="mission-highlight-card"><span class="mission-highlight-key">Last Sync Action</span><span class="mission-highlight-value">${escapeHtmlAttr(state.last_at ? formatLocalDateTime(state.last_at) : "No sync action yet")}</span></div>
            <div class="mission-highlight-card"><span class="mission-highlight-key">Sync Queue</span><span class="mission-highlight-value">${escapeHtmlAttr(String(counts.syncQueue || 0))} pending</span></div>
            <div class="mission-highlight-card"><span class="mission-highlight-key">Notifications</span><span class="mission-highlight-value">${escapeHtmlAttr(notificationSettings.enabled ? `ON • ${String(nativeNotificationPermission || "prompt").toUpperCase()}` : "OFF")}</span></div>
            <div class="mission-highlight-card"><span class="mission-highlight-key">Quiet Hours</span><span class="mission-highlight-value">${escapeHtmlAttr(quietLabel)}</span></div>
            <div class="mission-highlight-card"><span class="mission-highlight-key">Performance</span><span class="mission-highlight-value">${escapeHtmlAttr(String(performanceMode || "balanced").toUpperCase())}</span></div>
            <div class="mission-highlight-card"><span class="mission-highlight-key">Privacy</span><span class="mission-highlight-value">${escapeHtmlAttr(privacyLabel)}</span></div>
          </div>
          ${runtimeActions}
          ${macIphoneLiveControls}
          <div class="sync-center-list">
            <div class="sync-center-list-title">Recent Sync Events</div>
            ${recentEvents.length
              ? recentEvents.map((row) => `
                  <div class="sync-center-row">
                    <span class="sync-center-meta">${escapeHtmlAttr(formatLocalDateTime(row.at))}</span>
                    <span>${escapeHtmlAttr(String(row.kind || "activity").replace(/_/g, " ").toUpperCase())}${row.detail?.message ? ` • ${escapeHtmlAttr(String(row.detail.message || ""))}` : ""}</span>
                  </div>
                `).join("")
              : `<div class="sync-center-row sync-center-empty">No sync events yet.</div>`}
          </div>
        `;

        notifyHost.innerHTML = upcoming.length
          ? `<div class="sync-center-list">${upcoming.map((row) => `
              <div class="sync-center-row">
                <span class="sync-center-meta">${escapeHtmlAttr(formatLocalDateTime(row.at))}</span>
                <span>${escapeHtmlAttr(row.title || "Alert")} • ${escapeHtmlAttr(row.body || "")}</span>
              </div>
            `).join("")}</div>`
          : `<div class="sync-center-row sync-center-empty">No alerts scheduled under the current notification settings.</div>`;

        historyHost.innerHTML = dismissed.length
          ? `<div class="sync-center-list">${dismissed.map((row) => `
              <div class="sync-center-row">
                <span class="sync-center-meta">${escapeHtmlAttr(formatLocalDateTime(row.dismissedAt))}</span>
                <span>${escapeHtmlAttr(row.title || "Alert")} • ${escapeHtmlAttr(row.message || "")}</span>
              </div>
            `).join("")}</div>`
          : `<div class="sync-center-row sync-center-empty">No dismissed alerts yet.</div>`;

        countsHost.innerHTML = `
          <div class="sync-center-stat-grid">
            <div class="sync-center-stat"><span class="sync-center-stat-key">Operations</span><span class="sync-center-stat-value">${escapeHtmlAttr(String(counts.operations || 0))}</span></div>
            <div class="sync-center-stat"><span class="sync-center-stat-key">Missions</span><span class="sync-center-stat-value">${escapeHtmlAttr(String(counts.missions || 0))}</span></div>
            <div class="sync-center-stat"><span class="sync-center-stat-key">Blackbook</span><span class="sync-center-stat-value">${escapeHtmlAttr(String(counts.blackbook || 0))}</span></div>
            <div class="sync-center-stat"><span class="sync-center-stat-key">HVI</span><span class="sync-center-stat-value">${escapeHtmlAttr(String(counts.hvi || 0))}</span></div>
            <div class="sync-center-stat"><span class="sync-center-stat-key">Datawells</span><span class="sync-center-stat-value">${escapeHtmlAttr(String(counts.datawells || 0))}</span></div>
            <div class="sync-center-stat"><span class="sync-center-stat-key">Books</span><span class="sync-center-stat-value">${escapeHtmlAttr(String(counts.books || 0))}</span></div>
            <div class="sync-center-stat"><span class="sync-center-stat-key">Blueprints</span><span class="sync-center-stat-value">${escapeHtmlAttr(String(counts.blueprints || 0))}</span></div>
            <div class="sync-center-stat"><span class="sync-center-stat-key">Checklist</span><span class="sync-center-stat-value">${escapeHtmlAttr(String(counts.checklist || 0))}</span></div>
            <div class="sync-center-stat"><span class="sync-center-stat-key">Reminders</span><span class="sync-center-stat-value">${escapeHtmlAttr(String(counts.reminders || 0))}</span></div>
            <div class="sync-center-stat"><span class="sync-center-stat-key">Journal</span><span class="sync-center-stat-value">${escapeHtmlAttr(String(counts.journal || 0))}</span></div>
            <div class="sync-center-stat"><span class="sync-center-stat-key">Posting Stages</span><span class="sync-center-stat-value">${escapeHtmlAttr(String(counts.postingTemplate || 0))}</span></div>
            <div class="sync-center-stat"><span class="sync-center-stat-key">Routine Tasks</span><span class="sync-center-stat-value">${escapeHtmlAttr(String(counts.routines || 0))}</span></div>
            <div class="sync-center-stat"><span class="sync-center-stat-key">Gym Exercises</span><span class="sync-center-stat-value">${escapeHtmlAttr(String(counts.gym || 0))}</span></div>
            <div class="sync-center-stat"><span class="sync-center-stat-key">Saved Sessions</span><span class="sync-center-stat-value">${escapeHtmlAttr(String(counts.gymSavedSessions || 0))}</span></div>
          </div>
        `;
      }

      function privacySettingsKey() {
        return OMNI_PRIVACY_SETTINGS_KEY;
      }

      function loadPrivacySettings() {
        try {
          const raw = localStorage.getItem(privacySettingsKey());
          const parsed = raw ? JSON.parse(raw) : null;
          privacySettings = {
            lockOnLaunch: !!parsed?.lockOnLaunch,
            autoLockOnBackground: !!parsed?.autoLockOnBackground,
          };
        } catch (_) {
          privacySettings = {
            lockOnLaunch: false,
            autoLockOnBackground: false,
          };
        }
        const launchEl = document.getElementById("privacy-lock-on-launch");
        const bgEl = document.getElementById("privacy-auto-lock-bg");
        if (launchEl) launchEl.checked = !!privacySettings.lockOnLaunch;
        if (bgEl) bgEl.checked = !!privacySettings.autoLockOnBackground;
        if (currentView === "settings") renderSyncCenter();
      }

      function savePrivacySettings() {
        const launchEl = document.getElementById("privacy-lock-on-launch");
        const bgEl = document.getElementById("privacy-auto-lock-bg");
        privacySettings = {
          lockOnLaunch: !!launchEl?.checked,
          autoLockOnBackground: !!bgEl?.checked,
        };
        localStorage.setItem(privacySettingsKey(), JSON.stringify(privacySettings));
        if (currentView === "settings") renderSyncCenter();
        themedNotice("Privacy settings saved.");
      }

      function resetPrivacySettings() {
        localStorage.removeItem(privacySettingsKey());
        loadPrivacySettings();
        if (currentView === "settings") renderSyncCenter();
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

      function themedConfirm(message = "Are you sure you want to delete this?", options = {}) {
        return new Promise((resolve) => {
          const overlay = document.getElementById("confirm-overlay");
          const titleEl = document.getElementById("confirm-title");
          const messageEl = document.getElementById("confirm-message");
          const cancelBtn = document.getElementById("confirm-cancel");
          const okBtn = document.getElementById("confirm-ok");

          if (!overlay || !messageEl || !cancelBtn || !okBtn) {
            resolve(confirm(message));
            return;
          }

          const config = options && typeof options === "object" ? options : {};
          const defaultTitle = cancelBtn.getAttribute("data-default-title") || (titleEl ? titleEl.textContent : "// CONFIRM ACTION");
          const defaultCancel = cancelBtn.getAttribute("data-default-label") || cancelBtn.textContent || "Cancel";
          const defaultOk = okBtn.getAttribute("data-default-label") || okBtn.textContent || "Confirm";
          cancelBtn.setAttribute("data-default-label", defaultCancel);
          okBtn.setAttribute("data-default-label", defaultOk);
          if (titleEl) titleEl.textContent = String(config.title || defaultTitle);
          messageEl.textContent = message;
          cancelBtn.textContent = String(config.cancelText || defaultCancel);
          okBtn.textContent = String(config.okText || defaultOk);
          okBtn.classList.toggle("danger", config.danger !== false);
          overlay.classList.add("active");
          overlay.setAttribute("aria-hidden", "false");

          const close = (result) => {
            overlay.classList.remove("active");
            overlay.setAttribute("aria-hidden", "true");
            if (titleEl) titleEl.textContent = defaultTitle;
            cancelBtn.textContent = defaultCancel;
            okBtn.textContent = defaultOk;
            okBtn.classList.add("danger");
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

      function resetMobileMenuTouchState() {
        mobileMenuTouchState = { mode: "", startX: 0, startY: 0 };
      }

      function initMobileMenuGestures() {
        if (!("ontouchstart" in window)) return;
        const aside = document.querySelector("aside");
        const overlay = document.getElementById("mobile-nav-overlay");
        document.addEventListener("touchstart", (e) => {
          const touch = e.touches && e.touches[0];
          if (!touch) return;
          const open = document.body.classList.contains("menu-open");
          const target = e.target;
          if (!open && touch.clientX <= 28) {
            mobileMenuTouchState = { mode: "open", startX: touch.clientX, startY: touch.clientY };
            return;
          }
          if (open && ((aside && aside.contains(target)) || (overlay && overlay === target))) {
            mobileMenuTouchState = { mode: "close", startX: touch.clientX, startY: touch.clientY };
            return;
          }
          resetMobileMenuTouchState();
        }, { passive: true });
        document.addEventListener("touchend", (e) => {
          const touch = e.changedTouches && e.changedTouches[0];
          if (!touch || !mobileMenuTouchState.mode) return;
          const dx = touch.clientX - mobileMenuTouchState.startX;
          const dy = touch.clientY - mobileMenuTouchState.startY;
          const open = document.body.classList.contains("menu-open");
          if (Math.abs(dy) <= 80) {
            if (!open && mobileMenuTouchState.mode === "open" && dx >= 65) {
              document.body.classList.add("menu-open");
            } else if (open && mobileMenuTouchState.mode === "close" && dx <= -55) {
              closeMobileMenu();
            }
          }
          resetMobileMenuTouchState();
        }, { passive: true });
        document.addEventListener("touchcancel", resetMobileMenuTouchState, { passive: true });
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
        const previousType = intelPopupType;
        const returnView = missionDatawellPopupReturnView;
        if (!overlay) return;
        overlay.classList.remove("active");
        overlay.classList.remove("fullscreen");
        if (modal) modal.classList.remove("intel-modal-full", "mission-intel-modal");
        overlay.setAttribute("aria-hidden", "true");
        intelPopupType = "";
        intelPopupProbeId = "";
        intelPopupHviHandle = "";
        intelPopupDatawellId = "";
        missionDatawellPopupReturnView = "";
        if (previousType === "datawells" && returnView === "mission" && missionEditorPath) {
          overlay.classList.add("fullscreen", "active");
          if (modal) modal.classList.add("intel-modal-full", "mission-intel-modal");
          renderMissionIntelEditor();
          overlay.setAttribute("aria-hidden", "false");
        }
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
        if (modal) modal.classList.remove("intel-modal-full", "mission-intel-modal");
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
        if (modal) modal.classList.remove("mission-intel-modal");
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
        if (intelPopupType === "datawells") {
          const targetId = String(intelPopupDatawellId || "").trim();
          const index = allDatawells.findIndex((row) => String(row?.id || "").trim() === targetId);
          if (index < 0) {
            themedNotice("Datawell source missing.");
            return;
          }
          const existing = allDatawells[index] || {};
          allDatawells[index] = normalizeDatawellEntry({
            ...existing,
            id: targetId,
            title: document.getElementById("intel-datawell-title")?.value || existing.title || "",
            sourceType: document.getElementById("intel-datawell-type")?.value || existing.sourceType || "",
            platform: document.getElementById("intel-datawell-platform")?.value || existing.platform || "",
            link: document.getElementById("intel-datawell-link")?.value || existing.link || "",
            description: document.getElementById("intel-datawell-description")?.value || existing.description || "",
            community: document.getElementById("intel-datawell-community")?.value || existing.community || "",
            painpoints: document.getElementById("intel-datawell-painpoints")?.value || existing.painpoints || "",
            entryPoints: document.getElementById("intel-datawell-entrypoints")?.value || existing.entryPoints || "",
            notes: document.getElementById("intel-datawell-notes")?.value || existing.notes || "",
            tags: document.getElementById("intel-datawell-tags")?.value || existing.tags || "",
            createdAt: existing.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          saveDatawells();
          closeIntelPopup();
          themedNotice("Datawell source saved.");
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
        if (intelPopupType === "datawells") {
          const deleted = await deleteDatawell(intelPopupDatawellId, { skipConfirm: false });
          if (deleted) closeIntelPopup();
          return;
        }
        if (intelPopupType === "hvi") {
          await deleteHvi(intelPopupHviHandle);
          closeIntelPopup();
        }
      }

      function switchView(viewId) {
        if (viewId === "sync-center") {
          openSettingsSyncCenter();
          return;
        }
        if (viewId === "blackbook") viewId = "mission-log";
        if (viewId === "tutor") viewId = "terminal-lab";
        closeAllAddPopups();
        closeMobileMenu();
        document.querySelectorAll(".view-panel").forEach((el) => el.style.display = "none");
        const targetView = document.getElementById("view-" + viewId);
        if (targetView) targetView.style.display = "block";
        
        document.querySelectorAll(".nav-btn").forEach((btn) => btn.classList.remove("active"));
        const targetBtn = document.querySelector(`.nav-btn[onclick="switchView('${viewId}')"]`);
        if (targetBtn) targetBtn.classList.add("active");
        applyViewTitleTheme(viewId, targetBtn);

        if (!suppressViewHistory && currentView && currentView !== viewId) {
          const last = viewHistoryStack[viewHistoryStack.length - 1];
          if (last !== currentView) viewHistoryStack.push(currentView);
          if (viewHistoryStack.length > 40) viewHistoryStack = viewHistoryStack.slice(-40);
        }
        currentView = viewId;
        if (viewId === "brief-studio") {
          renderBriefMissionOptions();
          renderBriefVariables();
          renderBriefProfilePreview();
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
        if (viewId === "dashboard") {
          renderOperationFocus();
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
        if (viewId === "mission-probe") {
          ensureMarkdownLoaded("/MissionProbeWorkflow.md", "mission-probe-guide-content", "Failed to load MissionProbeWorkflow.md");
          ensureMarkdownLoaded("/MissionBriefing.md", "mission-probe-brief-content", "Failed to load MissionBriefing.md");
          ensureMarkdownLoaded("/ProbeSkill.md", "mission-probe-skill-content", "Failed to load ProbeSkill.md");
          ensureMarkdownLoaded("/OfficialProbeManuel.md", "mission-probe-manual-content", "Failed to load OfficialProbeManuel.md");
          renderMissionProbeDatawellLinks();
        }
        if (viewId === "posting-template") {
          renderPostingTemplate();
        }
        if (viewId === "datawells") {
          renderDatawells();
        }
        if (viewId === "global-search") {
          renderGlobalSearch();
          if ((!allMissions.length || !allOps.length) && !isFetching) fetchData();
        }
        if (viewId === "settings") {
          loadPrivacySettings();
          refreshRuntimeModeState(true).catch(() => {});
          refreshMacIphoneLiveState(true).catch(() => {});
          renderSyncCenter();
          if ((!allMissions.length || !allOps.length) && !isFetching) fetchData();
        }
        if (viewId === "mission-briefing") {
          ensureMarkdownLoaded("/MissionBriefing.md", "mission-briefing-content", "Failed to load MissionBriefing.md");
        }
        if (viewId === "hvi-intel") {
          renderHvi();
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

      function goBackView(fallback = "dashboard") {
        let target = "";
        while (viewHistoryStack.length) {
          const candidate = String(viewHistoryStack.pop() || "");
          if (candidate && candidate !== currentView) {
            target = candidate;
            break;
          }
        }
        if (!target) target = String(fallback || "dashboard");
        suppressViewHistory = true;
        try {
          switchView(target);
        } finally {
          suppressViewHistory = false;
        }
      }

      function focusMissionProbeSection(section = "") {
        const key = String(section || "").trim().toLowerCase();
        const map = {
          brief: "mission-probe-brief-card",
          skill: "mission-probe-skill-card",
          manual: "mission-probe-manual-card",
        };
        const targetId = map[key];
        if (currentView !== "mission-probe") switchView("mission-probe");
        const el = targetId ? document.getElementById(targetId) : null;
        if (!el || typeof el.scrollIntoView !== "function") return;
        setTimeout(() => {
          try {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          } catch (_) {
            el.scrollIntoView();
          }
        }, 40);
      }

      function openRoutineView(period = "") {
        switchView("routines");
        const target = document.getElementById(`${String(period || "").trim().toLowerCase()}-routine-list`);
        if (!target || typeof target.scrollIntoView !== "function") return;
        setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
      }

      function scrollSettingsSyncCenterIntoView() {
        const panel = document.getElementById("settings-sync-center-panel");
        if (!panel || typeof panel.scrollIntoView !== "function") return;
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      function openSettingsSyncCenter() {
        switchView("settings");
        setTimeout(scrollSettingsSyncCenterIntoView, 50);
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

      function datawellsStorageKey() {
        return "managementapp:datawells:v1";
      }

      function missionDatawellLinksKey() {
        return "managementapp:missionDatawellLinks:v1";
      }

      function normalizeMissionDatawellLinks(data) {
        const input = data && typeof data === "object" ? data : {};
        const workflow = Array.isArray(input.workflow)
          ? input.workflow.map((id) => String(id || "").trim()).filter(Boolean)
          : [];
        const missions = {};
        if (input.missions && typeof input.missions === "object") {
          Object.entries(input.missions).forEach(([path, ids]) => {
            const key = String(path || "").trim();
            if (!key || !Array.isArray(ids)) return;
            const next = [...new Set(ids.map((id) => String(id || "").trim()).filter(Boolean))];
            if (next.length) missions[key] = next;
          });
        }
        return { workflow: [...new Set(workflow)], missions };
      }

      function loadMissionDatawellLinks() {
        try {
          const raw = localStorage.getItem(missionDatawellLinksKey());
          const parsed = raw ? JSON.parse(raw) : null;
          missionDatawellLinks = normalizeMissionDatawellLinks(parsed);
        } catch (e) {
          missionDatawellLinks = normalizeMissionDatawellLinks(null);
        }
        pruneMissionDatawellLinks();
      }

      function saveMissionDatawellLinks(silent = false) {
        pruneMissionDatawellLinks();
        missionDatawellLinks = normalizeMissionDatawellLinks(missionDatawellLinks);
        localStorage.setItem(missionDatawellLinksKey(), JSON.stringify(missionDatawellLinks));
        if (currentView === "mission-probe") renderMissionProbeDatawellLinks();
        if (intelPopupType === "mission" && missionEditorPath) {
          syncMissionIntelContentState();
          renderMissionIntelEditor();
        }
        if (!silent) recordSyncCenterEvent("datawell_links_saved", { message: "Mission/Datawell links updated." });
      }

      function getWorkflowLinkedDatawellIds() {
        return Array.isArray(missionDatawellLinks?.workflow) ? missionDatawellLinks.workflow.slice() : [];
      }

      function getMissionLinkedDatawellIds(path) {
        const key = String(path || "").trim();
        if (!key) return [];
        const rows = missionDatawellLinks?.missions && typeof missionDatawellLinks.missions === "object"
          ? missionDatawellLinks.missions[key]
          : [];
        return Array.isArray(rows) ? rows.slice() : [];
      }

      function setWorkflowLinkedDatawellIds(ids) {
        missionDatawellLinks.workflow = [...new Set((Array.isArray(ids) ? ids : []).map((id) => String(id || "").trim()).filter(Boolean))];
      }

      function setMissionLinkedDatawellIds(path, ids) {
        const key = String(path || "").trim();
        if (!key) return;
        const next = [...new Set((Array.isArray(ids) ? ids : []).map((id) => String(id || "").trim()).filter(Boolean))];
        if (!missionDatawellLinks.missions || typeof missionDatawellLinks.missions !== "object") missionDatawellLinks.missions = {};
        if (next.length) missionDatawellLinks.missions[key] = next;
        else delete missionDatawellLinks.missions[key];
      }

      function getLinkedDatawellRows(ids = []) {
        const wanted = new Set((Array.isArray(ids) ? ids : []).map((id) => String(id || "").trim()).filter(Boolean));
        if (!wanted.size) return [];
        const rows = Array.isArray(allDatawells) ? allDatawells : [];
        return rows.filter((row) => wanted.has(String(row?.id || "").trim()));
      }

      function pruneMissionDatawellLinks() {
        const validIds = new Set((Array.isArray(allDatawells) ? allDatawells : []).map((row) => String(row?.id || "").trim()).filter(Boolean));
        setWorkflowLinkedDatawellIds(getWorkflowLinkedDatawellIds().filter((id) => validIds.has(id)));
        const missions = missionDatawellLinks?.missions && typeof missionDatawellLinks.missions === "object"
          ? missionDatawellLinks.missions
          : {};
        Object.keys(missions).forEach((path) => {
          setMissionLinkedDatawellIds(path, getMissionLinkedDatawellIds(path).filter((id) => validIds.has(id)));
        });
      }

      function buildDatawellSelectOptions(selectedIds = []) {
        const taken = new Set((Array.isArray(selectedIds) ? selectedIds : []).map((id) => String(id || "").trim()).filter(Boolean));
        const rows = Array.isArray(allDatawells) ? allDatawells.slice() : [];
        rows.sort((a, b) => String(a?.title || "").localeCompare(String(b?.title || "")));
        const available = rows.filter((row) => !taken.has(String(row?.id || "").trim()));
        return `<option value="">Select Datawell source...</option>${available.map((row) => `<option value="${escapeHtmlAttr(row.id)}">${escapeHtmlAttr(row.title || "Datawell")}${row.sourceType ? ` :: ${escapeHtmlAttr(row.sourceType)}` : ""}${row.platform ? ` / ${escapeHtmlAttr(row.platform)}` : ""}</option>`).join("")}`;
      }

      function buildLinkedDatawellListHtml(ids = [], options = {}) {
        const rows = getLinkedDatawellRows(ids);
        const removeCall = String(options.removeCall || "");
        const openCall = String(options.openCall || "");
        if (!rows.length) return `<div class="mission-dossier-empty">No linked Datawells yet.</div>`;
        return rows.map((row) => `
          <div class="linked-datawell-row">
            <div class="linked-datawell-copy">
              <div class="linked-datawell-title">${escapeHtmlAttr(row.title || "Datawell")}</div>
              <div class="linked-datawell-meta">${escapeHtmlAttr([row.sourceType || "", row.platform || ""].filter(Boolean).join(" • ") || "Source")}</div>
              <div class="linked-datawell-desc">${escapeHtmlAttr(row.painpoints || row.entryPoints || row.description || "No mapped detail yet.")}</div>
            </div>
            <div class="linked-datawell-actions">
              ${openCall ? `<button class="confirm-btn" type="button" onclick="${openCall}('${escapeJsString(row.id)}')">OPEN</button>` : ""}
              ${removeCall ? `<button class="confirm-btn danger" type="button" onclick="${removeCall}('${escapeJsString(row.id)}')">UNLINK</button>` : ""}
            </div>
          </div>
        `).join("");
      }

      function renderMissionProbeDatawellLinks() {
        const selectEl = document.getElementById("mission-probe-datawell-select");
        const listEl = document.getElementById("mission-probe-datawell-list");
        const countEl = document.getElementById("mission-probe-datawell-count");
        if (!selectEl || !listEl || !countEl) return;
        const ids = getWorkflowLinkedDatawellIds();
        countEl.textContent = `${ids.length} linked`;
        selectEl.innerHTML = buildDatawellSelectOptions(ids);
        listEl.innerHTML = buildLinkedDatawellListHtml(ids, {
          removeCall: "removeMissionProbeDatawellLink",
          openCall: "openLinkedWorkflowDatawell",
        });
      }

      function addMissionProbeDatawellLink() {
        const selectEl = document.getElementById("mission-probe-datawell-select");
        const nextId = String(selectEl?.value || "").trim();
        if (!nextId) {
          themedNotice("Select a Datawell source first.");
          return;
        }
        const ids = getWorkflowLinkedDatawellIds();
        if (!ids.includes(nextId)) ids.push(nextId);
        setWorkflowLinkedDatawellIds(ids);
        saveMissionDatawellLinks();
        themedNotice("Datawell linked to Mission + Probe.");
      }

      function removeMissionProbeDatawellLink(id) {
        const targetId = String(id || "").trim();
        const ids = getWorkflowLinkedDatawellIds().filter((rowId) => rowId !== targetId);
        setWorkflowLinkedDatawellIds(ids);
        saveMissionDatawellLinks();
      }

      function openLinkedWorkflowDatawell(id) {
        missionDatawellPopupReturnView = "mission-probe";
        openDatawellPopup(id);
      }

      function buildMissionEditorDatawellPanelHtml(missionPath) {
        const ids = getMissionLinkedDatawellIds(missionPath);
        return `
          <div class="mission-intel-vars linked-datawell-panel">
            <div class="linked-datawell-panel-head">
              <strong style="color:var(--warning-yellow);">// LINKED DATAWELLS</strong>
              <span class="routine-ex-note">${ids.length} linked source(s) for this mission.</span>
            </div>
            <div class="linked-datawell-add-row">
              <select id="mission-datawell-select" class="search-input">${buildDatawellSelectOptions(ids)}</select>
              <button class="submit-btn" type="button" onclick="addMissionEditorDatawellLink()">LINK SOURCE</button>
            </div>
            <div id="mission-datawell-list">${buildLinkedDatawellListHtml(ids, {
              removeCall: "removeMissionEditorDatawellLink",
              openCall: "openLinkedMissionDatawell",
            })}</div>
          </div>
        `;
      }

      function addMissionEditorDatawellLink() {
        const missionPath = String(missionEditorPath || "").trim();
        const selectEl = document.getElementById("mission-datawell-select");
        const nextId = String(selectEl?.value || "").trim();
        if (!missionPath) return;
        if (!nextId) {
          themedNotice("Select a Datawell source first.");
          return;
        }
        const ids = getMissionLinkedDatawellIds(missionPath);
        if (!ids.includes(nextId)) ids.push(nextId);
        setMissionLinkedDatawellIds(missionPath, ids);
        saveMissionDatawellLinks();
        themedNotice("Datawell linked to mission.");
      }

      function removeMissionEditorDatawellLink(id) {
        const missionPath = String(missionEditorPath || "").trim();
        if (!missionPath) return;
        const targetId = String(id || "").trim();
        const ids = getMissionLinkedDatawellIds(missionPath).filter((rowId) => rowId !== targetId);
        setMissionLinkedDatawellIds(missionPath, ids);
        saveMissionDatawellLinks();
      }

      function openLinkedMissionDatawell(id) {
        syncMissionIntelContentState();
        missionDatawellPopupReturnView = "mission";
        openDatawellPopup(id);
      }

      function buildDatawellPackSection(ids = [], heading = "LINKED DATAWELLS") {
        const rows = getLinkedDatawellRows(ids);
        if (!rows.length) return `${heading}\nNone linked.`;
        return [
          heading,
          ...rows.map((row, index) => [
            `${index + 1}. ${row.title || "Datawell"}`,
            row.sourceType ? `Type: ${row.sourceType}` : "",
            row.platform ? `Platform: ${row.platform}` : "",
            row.link ? `Link: ${row.link}` : "",
            row.description ? `Description: ${row.description}` : "",
            row.community ? `Community: ${row.community}` : "",
            row.painpoints ? `Painpoints: ${row.painpoints}` : "",
            row.entryPoints ? `Entry Points: ${row.entryPoints}` : "",
            row.notes ? `Notes: ${row.notes}` : "",
            row.tags ? `Tags: ${row.tags}` : "",
          ].filter(Boolean).join("\n"))
        ].join("\n\n");
      }

      function normalizeDatawellEntry(row, index = 0) {
        const nowIso = new Date().toISOString();
        const item = row && typeof row === "object" ? row : {};
        return {
          id: String(item.id || `dw_${Date.now()}_${index}_${Math.floor(Math.random() * 100000)}`),
          title: String(item.title || item.name || item.source || "Untitled Datawell").trim(),
          sourceType: String(item.sourceType || item.type || "").trim(),
          platform: String(item.platform || "").trim(),
          link: String(item.link || item.url || "").trim(),
          description: String(item.description || item.desc || "").trim(),
          community: String(item.community || "").trim(),
          painpoints: String(item.painpoints || item.painPoints || "").trim(),
          entryPoints: String(item.entryPoints || item.entrypoints || "").trim(),
          notes: String(item.notes || "").trim(),
          tags: String(item.tags || "").trim(),
          createdAt: String(item.createdAt || nowIso),
          updatedAt: String(item.updatedAt || item.createdAt || nowIso),
        };
      }

      function loadDatawells() {
        try {
          const raw = localStorage.getItem(datawellsStorageKey());
          const parsed = raw ? JSON.parse(raw) : [];
          allDatawells = Array.isArray(parsed) ? parsed.map((row, i) => normalizeDatawellEntry(row, i)) : [];
        } catch (e) {
          allDatawells = [];
        }
        pruneMissionDatawellLinks();
        saveDatawells(true);
      }

      function saveDatawells(silent = false) {
        allDatawells = Array.isArray(allDatawells) ? allDatawells.map((row, i) => normalizeDatawellEntry(row, i)) : [];
        pruneMissionDatawellLinks();
        localStorage.setItem(datawellsStorageKey(), JSON.stringify(allDatawells));
        if (currentView === "datawells") renderDatawells();
        if (currentView === "mission-probe") renderMissionProbeDatawellLinks();
        if (currentView === "settings") renderSyncCenter();
        if (currentView === "global-search") renderGlobalSearch();
        if (!silent) recordSyncCenterEvent("datawells_saved", { message: `${allDatawells.length} source(s) stored.` });
      }

      function clearDatawellForm() {
        const ids = [
          "new-datawell-title",
          "new-datawell-type",
          "new-datawell-platform",
          "new-datawell-link",
          "new-datawell-description",
          "new-datawell-community",
          "new-datawell-painpoints",
          "new-datawell-entrypoints",
          "new-datawell-notes",
          "new-datawell-tags",
        ];
        ids.forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.value = "";
        });
      }

      function submitNewDatawell() {
        const item = normalizeDatawellEntry({
          title: document.getElementById("new-datawell-title")?.value || "",
          sourceType: document.getElementById("new-datawell-type")?.value || "",
          platform: document.getElementById("new-datawell-platform")?.value || "",
          link: document.getElementById("new-datawell-link")?.value || "",
          description: document.getElementById("new-datawell-description")?.value || "",
          community: document.getElementById("new-datawell-community")?.value || "",
          painpoints: document.getElementById("new-datawell-painpoints")?.value || "",
          entryPoints: document.getElementById("new-datawell-entrypoints")?.value || "",
          notes: document.getElementById("new-datawell-notes")?.value || "",
          tags: document.getElementById("new-datawell-tags")?.value || "",
        });
        if (!item.title) {
          themedNotice("Datawell title is required.");
          return;
        }
        const nowIso = new Date().toISOString();
        item.createdAt = nowIso;
        item.updatedAt = nowIso;
        allDatawells.unshift(item);
        saveDatawells();
        clearDatawellForm();
        closeAllAddPopups();
        themedNotice("Datawell source added.");
      }

      function setDatawellSearch() {
        const el = document.getElementById("datawells-search-input");
        datawellSearchQuery = String(el?.value || "").toLowerCase().trim();
        renderDatawells();
      }

      function setDatawellFilters() {
        const el = document.getElementById("datawells-filter-type");
        datawellFilterType = String(el?.value || "").toLowerCase().trim();
        renderDatawells();
      }

      function clearDatawellFilters() {
        datawellSearchQuery = "";
        datawellFilterType = "";
        const searchEl = document.getElementById("datawells-search-input");
        const typeEl = document.getElementById("datawells-filter-type");
        if (searchEl) searchEl.value = "";
        if (typeEl) typeEl.value = "";
        renderDatawells();
      }

      function deleteDatawell(id, options = {}) {
        const targetId = String(id || "").trim();
        if (!targetId) return Promise.resolve(false);
        const proceed = options.skipConfirm
          ? Promise.resolve(true)
          : themedConfirm("Are you sure you want to delete this?");
        return Promise.resolve(proceed).then((ok) => {
          if (!ok) return false;
          allDatawells = allDatawells.filter((row) => String(row?.id || "").trim() !== targetId);
          saveDatawells();
          themedNotice("Datawell source deleted.");
          return true;
        });
      }

      function renderDatawells() {
        const container = document.getElementById("datawells-container");
        if (!container) return;
        let rows = Array.isArray(allDatawells) ? allDatawells.slice() : [];
        const typeSelect = document.getElementById("datawells-filter-type");
        if (typeSelect) {
          const types = [...new Set(rows.map((row) => String(row?.sourceType || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
          typeSelect.innerHTML = `<option value="">All Source Types</option>${types.map((type) => `<option value="${escapeHtmlAttr(type)}">${escapeHtmlAttr(type)}</option>`).join("")}`;
          const selected = (datawellFilterType || "").trim();
          const hit = types.find((type) => type.toLowerCase() === selected);
          typeSelect.value = hit || "";
        }
        if (datawellSearchQuery) {
          rows = rows.filter((row) => [
            row.title,
            row.sourceType,
            row.platform,
            row.link,
            row.description,
            row.community,
            row.painpoints,
            row.entryPoints,
            row.notes,
            row.tags,
          ].join(" ").toLowerCase().includes(datawellSearchQuery));
        }
        if (datawellFilterType) {
          rows = rows.filter((row) => String(row?.sourceType || "").trim().toLowerCase() === datawellFilterType);
        }
        rows.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
        container.innerHTML = rows.map((row) => `
          <div class="hvi-card datawell-card" ondblclick="openDatawellPopup('${escapeJsString(row.id)}')" title="Double-click to open source profile">
            <button class="x-btn hvi-row-delete" onclick="event.stopPropagation(); deleteDatawell('${escapeJsString(row.id)}')" title="Delete Datawell">X</button>
            <div class="datawell-head">
              <div class="datawell-title-wrap">
                <div class="hvi-summary-name">${escapeHtmlAttr(row.title || "Untitled Datawell")}</div>
                <div class="datawell-source-line">
                  <span class="datawell-type">${escapeHtmlAttr(row.sourceType || "Source")}</span>
                  ${row.platform ? `<span class="datawell-sep">•</span><span>${escapeHtmlAttr(row.platform)}</span>` : ""}
                  ${row.link ? `<span class="datawell-sep">•</span><a href="${escapeHtmlAttr(row.link)}" target="_blank" rel="noreferrer" onclick="event.stopPropagation()">${escapeHtmlAttr(row.link)}</a>` : ""}
                </div>
              </div>
            </div>
            <div class="datawell-grid">
              <div class="datawell-block"><div class="datawell-key">DESCRIPTION</div><div class="datawell-value">${escapeHtmlAttr(row.description || "No description yet.")}</div></div>
              <div class="datawell-block"><div class="datawell-key">COMMUNITY</div><div class="datawell-value">${escapeHtmlAttr(row.community || "No community noted.")}</div></div>
              <div class="datawell-block"><div class="datawell-key">PAINPOINTS</div><div class="datawell-value">${escapeHtmlAttr(row.painpoints || "No painpoints mapped.")}</div></div>
              <div class="datawell-block"><div class="datawell-key">ENTRY POINTS</div><div class="datawell-value">${escapeHtmlAttr(row.entryPoints || "No entry points mapped.")}</div></div>
            </div>
            <div class="datawell-footer">
              <span>${escapeHtmlAttr(row.tags || "No tags")}</span>
              <span>Updated ${escapeHtmlAttr(formatLocalDateTime(row.updatedAt || row.createdAt || ""))}</span>
            </div>
          </div>
        `).join("") || "<div class='hvi-card'><p>No Datawells yet. Add a source to start mapping communities and painpoints.</p></div>";
      }

      function openDatawellPopup(id) {
        const item = allDatawells.find((row) => String(row?.id || "") === String(id || ""));
        if (!item) return;
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
        if (modal) modal.classList.remove("mission-intel-modal");
        intelPopupType = "datawells";
        intelPopupDatawellId = String(item.id || "");
        title.textContent = "// DATAWELL PROFILE";
        subtitle.textContent = item.title || "Datawell";
        body.innerHTML = `
          <div class="intel-card datawell-popup-card">
            <div class="intel-grid datawell-popup-grid">
              <div class="form-group">
                <label for="intel-datawell-title">Title</label>
                <input id="intel-datawell-title" class="search-input" type="text" value="${escapeHtmlAttr(item.title || "")}" />
              </div>
              <div class="form-group">
                <label for="intel-datawell-type">Source Type</label>
                <input id="intel-datawell-type" class="search-input" type="text" value="${escapeHtmlAttr(item.sourceType || "")}" placeholder="Social Account / Website / Article / Comments" />
              </div>
              <div class="form-group">
                <label for="intel-datawell-platform">Platform</label>
                <input id="intel-datawell-platform" class="search-input" type="text" value="${escapeHtmlAttr(item.platform || "")}" placeholder="Instagram / TikTok / YouTube / Forum" />
              </div>
              <div class="form-group">
                <label for="intel-datawell-link">Link</label>
                <input id="intel-datawell-link" class="search-input" type="text" value="${escapeHtmlAttr(item.link || "")}" placeholder="https://..." />
              </div>
              <div class="form-group full">
                <label for="intel-datawell-description">Description</label>
                <textarea id="intel-datawell-description" class="mission-intel-textarea" rows="4" placeholder="What is this source and why does it matter?">${escapeHtmlAttr(item.description || "")}</textarea>
              </div>
              <div class="form-group full">
                <label for="intel-datawell-community">Community</label>
                <textarea id="intel-datawell-community" class="mission-intel-textarea" rows="3" placeholder="Which community, audience, or pocket of people is exposed here?">${escapeHtmlAttr(item.community || "")}</textarea>
              </div>
              <div class="form-group full">
                <label for="intel-datawell-painpoints">Painpoints</label>
                <textarea id="intel-datawell-painpoints" class="mission-intel-textarea" rows="4" placeholder="What painpoints, frustrations, wants, or pressure points show up here?">${escapeHtmlAttr(item.painpoints || "")}</textarea>
              </div>
              <div class="form-group full">
                <label for="intel-datawell-entrypoints">Entry Points</label>
                <textarea id="intel-datawell-entrypoints" class="mission-intel-textarea" rows="4" placeholder="How do you enter the community for indexing, probing, and conversation?">${escapeHtmlAttr(item.entryPoints || "")}</textarea>
              </div>
              <div class="form-group full">
                <label for="intel-datawell-notes">Notes</label>
                <textarea id="intel-datawell-notes" class="mission-intel-textarea" rows="4" placeholder="Extra indexing notes, patterns, posting behavior, or reference details.">${escapeHtmlAttr(item.notes || "")}</textarea>
              </div>
              <div class="form-group full">
                <label for="intel-datawell-tags">Tags</label>
                <input id="intel-datawell-tags" class="search-input" type="text" value="${escapeHtmlAttr(item.tags || "")}" placeholder="music, comments, underground, source map" />
              </div>
            </div>
            <div class="datawell-footer">
              <span>Created ${escapeHtmlAttr(formatLocalDateTime(item.createdAt || ""))}</span>
              <span>Updated ${escapeHtmlAttr(formatLocalDateTime(item.updatedAt || item.createdAt || ""))}</span>
            </div>
          </div>
        `;
        saveBtn.style.display = "";
        delBtn.style.display = "";
        overlay.classList.add("active");
        overlay.setAttribute("aria-hidden", "false");
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

      function isAppleTouchDevice() {
        const ua = String(navigator.userAgent || "");
        const platform = String(navigator.platform || "");
        return /iPhone|iPad|iPod/i.test(ua)
          || /iPhone|iPad|iPod/i.test(platform)
          || (platform === "MacIntel" && Number(navigator.maxTouchPoints || 0) > 1);
      }

      function shouldUseNativePdfFlow() {
        return isNativeRuntime() && isAppleTouchDevice();
      }

      function openExternalDocumentUrl(url) {
        const target = normalizeGymCatalogText(url);
        if (!target) return;
        try {
          const opened = window.open(target, "_blank", "noopener");
          if (!opened) window.location.href = target;
        } catch (e) {
          window.location.href = target;
        }
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
        const base = frame
          ? String(frame.getAttribute("data-base-src") || "").split("#")[0]
          : `/${encodePathForUrl(fileName)}`;
        if (frame) {
          frame.src = `${base}#page=${page}`;
          return;
        }
        openExternalDocumentUrl(`${base}#page=${page}`);
      }

      function closeDocPopup() {
        const overlay = document.getElementById("doc-overlay");
        const content = document.getElementById("doc-body");
        const backBtn = document.getElementById("doc-back-btn");
        const closeBtn = document.getElementById("doc-close-btn");
        if (!overlay) return;
        overlay.classList.remove("briefing-mode");
        overlay.classList.remove("active");
        overlay.setAttribute("aria-hidden", "true");
        if (content) content.className = "doc-body";
        if (backBtn) backBtn.style.display = "none";
        if (closeBtn) closeBtn.textContent = "Close";
      }

      function selectCopyFallbackText() {
        const field = document.getElementById("copy-fallback-text");
        if (!field) return;
        field.focus();
        field.select();
        if (typeof field.setSelectionRange === "function") field.setSelectionRange(0, field.value.length);
      }

      async function shareCopyFallbackText() {
        const field = document.getElementById("copy-fallback-text");
        const text = String(field?.value || "").trim();
        if (!text) {
          themedNotice("Nothing to share.");
          return;
        }
        if (!navigator.share || typeof navigator.share !== "function") {
          themedNotice("Share is not available on this device.");
          return;
        }
        try {
          await navigator.share({
            title: "OMNI AI PACK",
            text,
          });
        } catch (e) {
          if (e && String(e.name || "") === "AbortError") return;
          themedNotice("Share failed: " + (e?.message || "Unavailable."));
        }
      }

      function openCopyFallbackViewer(title, text) {
        const overlay = document.getElementById("doc-overlay");
        const header = document.getElementById("doc-title");
        const sub = document.getElementById("doc-sub");
        const content = document.getElementById("doc-body");
        const backBtn = document.getElementById("doc-back-btn");
        const closeBtn = document.getElementById("doc-close-btn");
        if (!overlay || !header || !sub || !content) return;
        header.textContent = `// ${String(title || "MANUAL COPY").toUpperCase()}`;
        sub.textContent = "Clipboard access is blocked in this context. Use SELECT ALL and copy manually.";
        content.className = "doc-body";
        overlay.classList.add("active");
        overlay.setAttribute("aria-hidden", "false");
        if (backBtn) backBtn.style.display = "";
        if (closeBtn) closeBtn.textContent = "Close";
        const shareButton = navigator.share && typeof navigator.share === "function"
          ? `<button class="submit-btn" type="button" onclick="shareCopyFallbackText()">SHARE</button>`
          : "";
        content.innerHTML = `
          <div class="copy-fallback-shell">
            <div class="copy-fallback-note">Clipboard access is blocked by the current iPhone app context. The full text is loaded below for manual copy.</div>
            <div class="copy-fallback-actions">
              <button class="submit-btn" type="button" onclick="selectCopyFallbackText()">SELECT ALL</button>
              ${shareButton}
              <button class="confirm-btn" type="button" onclick="closeDocPopup()">BACK</button>
            </div>
            <textarea id="copy-fallback-text" class="copy-fallback-area" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" readonly>${escapeHtmlAttr(text)}</textarea>
          </div>
        `;
        requestAnimationFrame(() => selectCopyFallbackText());
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
          if (shouldUseNativePdfFlow()) {
            content.innerHTML = `${contextHtml}${actionsHtml}${buildPdfBookmarkHtml(fileName, savedPage)}
              <div class="intel-card">
                <p>Embedded PDF scrolling is unreliable in the iPhone app. Use <strong>OPEN FULL PDF</strong> for the full document reader, or <strong>OPEN SAVED PAGE</strong> to jump straight to your saved bookmark.</p>
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                  <button class="submit-btn" type="button" onclick="openExternalDocumentUrl('${escapeJsString(urlPath)}')">OPEN FULL PDF</button>
                  <button class="confirm-btn" type="button" onclick="openExternalDocumentUrl('${escapeJsString(pdfUrl)}')">OPEN SAVED PAGE</button>
                </div>
              </div>`;
            return;
          }
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
          const result = await copyTextWithFallback(text, "PROBE SKILL");
          themedNotice(result === "manual" ? "Clipboard blocked. Manual copy view opened." : "Probe Skill copied.");
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
          const result = await copyTextWithFallback(text, "MISSION BRIEFING");
          themedNotice(result === "manual" ? "Clipboard blocked. Manual copy view opened." : "Mission Briefing copied.");
        } catch (e) {
          themedNotice("Copy failed: " + e.message);
        }
      }

      async function openMissionBriefingViewer() {
        const overlay = document.getElementById("doc-overlay");
        const header = document.getElementById("doc-title");
        const sub = document.getElementById("doc-sub");
        const content = document.getElementById("doc-body");
        const backBtn = document.getElementById("doc-back-btn");
        const closeBtn = document.getElementById("doc-close-btn");
        const inline = document.getElementById("mission-briefing-content");
        if (!overlay || !header || !sub || !content) return;
        header.textContent = "// MISSION BRIEFING";
        sub.textContent = "MissionBriefing.md";
        content.className = "doc-body mission-brief-doc-body";
        overlay.classList.add("active", "briefing-mode");
        overlay.setAttribute("aria-hidden", "false");
        if (backBtn) backBtn.style.display = "";
        if (closeBtn) closeBtn.textContent = "Close";
        let html = String(inline?.innerHTML || "").trim();
        if (!html || /Loading Mission Briefing/i.test(String(inline?.textContent || ""))) {
          try {
            const res = await fetch("/MissionBriefing.md", { cache: "no-store" });
            if (!res.ok) throw new Error("Failed to load MissionBriefing.md");
            const markdown = await res.text();
            html = renderManualMarkdown(markdown);
            if (inline) inline.innerHTML = html;
          } catch (e) {
            html = `<div class="intel-card">${escapeHtmlAttr(e?.message || "Failed to load Mission Briefing.")}</div>`;
          }
        }
        content.innerHTML = `
          <div class="mission-brief-doc manual-view mission-brief-view">
            <div class="mission-brief-actions" style="margin-bottom:10px;">
              <button class="confirm-btn" type="button" onclick="closeDocPopup()">BACK</button>
            </div>
            ${html || "<div class=\"intel-card\">Mission Briefing is empty.</div>"}
          </div>
        `;
      }

      async function copyTextWithFallback(text, fallbackTitle = "MANUAL COPY") {
        const value = String(text || "");
        if (!value.trim()) throw new Error("Nothing to copy.");
        try {
          if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
            await navigator.clipboard.writeText(value);
            return "copied";
          }
        } catch (_) {}
        const ta = document.createElement("textarea");
        ta.value = value;
        ta.setAttribute("readonly", "readonly");
        ta.style.position = "fixed";
        ta.style.top = "0";
        ta.style.left = "-9999px";
        ta.style.opacity = "0";
        ta.style.pointerEvents = "none";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        ta.setSelectionRange(0, ta.value.length);
        let copied = false;
        try {
          copied = document.execCommand("copy");
        } finally {
          document.body.removeChild(ta);
        }
        if (copied) return "copied";
        openCopyFallbackViewer(fallbackTitle, value);
        return "manual";
      }

      async function readTextForPack(filePath, fallbackId) {
        try {
          const res = await fetch(filePath, { cache: "no-store" });
          if (!res.ok) throw new Error(`Failed to load ${filePath}`);
          return (await res.text()).trim();
        } catch (_) {
          const fallback = document.getElementById(fallbackId);
          return String(fallback?.innerText || fallback?.textContent || "").trim();
        }
      }

      async function buildMissionProbePackText() {
        const instruction = await readTextForPack("/MissionProbeWorkflow.md", "mission-probe-guide-content");
        const brief = await readTextForPack("/MissionBriefing.md", "mission-probe-brief-content");
        const probe = await readTextForPack("/ProbeSkill.md", "mission-probe-skill-content");
        const intro = String(document.getElementById("mission-probe-intro")?.innerText || document.getElementById("mission-probe-intro")?.textContent || "").trim();
        const tutorial = String(document.getElementById("mission-probe-tutorial-content")?.innerText || document.getElementById("mission-probe-tutorial-content")?.textContent || "").trim();
        const linkedDatawells = buildDatawellPackSection(getWorkflowLinkedDatawellIds(), "LINKED DATAWELLS / INDEXING CHAIN");
        return [
          "AI WORKSPACE // MISSION + PROBE",
          "",
          "[MISSION + PROBE OVERVIEW]",
          intro || "Mission + Probe overview missing.",
          "",
          "[HOW TO USE]",
          tutorial || "Tutorial content missing.",
          "",
          "[AI BOT INSTRUCTION]",
          instruction || "AI bot instruction content missing.",
          "",
          linkedDatawells,
          "",
          "[MISSION BRIEF]",
          brief || "Mission briefing is empty.",
          "",
          "[PROBE SKILL]",
          probe || "Probe skill is empty.",
        ].join("\n");
      }

      async function buildMissionBriefingText() {
        return readTextForPack("/MissionBriefing.md", "mission-briefing-content");
      }

      async function saveMissionProbePackToFile() {
        try {
          const text = await buildMissionProbePackText();
          const name = `mission-probe-ai-pack-${new Date().toISOString().replace(/[:.]/g, "-")}.txt`;
          saveTextFile(name, text);
          recordSyncCenterEvent("file_saved", { message: name });
          if (currentView === "settings") renderSyncCenter();
          themedNotice("AI pack file saved.");
        } catch (e) {
          themedNotice("Save failed: " + (e?.message || "Unknown error"));
        }
      }

      async function shareMissionProbePackFile() {
        try {
          const text = await buildMissionProbePackText();
          const name = `mission-probe-ai-pack-${new Date().toISOString().replace(/[:.]/g, "-")}.txt`;
          const shared = await shareTextFile("Mission + Probe AI Pack", name, text);
          recordSyncCenterEvent(shared ? "file_shared" : "file_saved", { message: name });
          if (currentView === "settings") renderSyncCenter();
          themedNotice(shared ? "AI pack shared." : "Share unavailable. AI pack file saved.");
        } catch (e) {
          themedNotice("Share failed: " + (e?.message || "Unknown error"));
        }
      }

      async function saveMissionBriefingToFile() {
        try {
          const text = await buildMissionBriefingText();
          const name = `mission-briefing-${new Date().toISOString().replace(/[:.]/g, "-")}.md`;
          saveTextFile(name, text);
          recordSyncCenterEvent("file_saved", { message: name });
          if (currentView === "settings") renderSyncCenter();
          themedNotice("Mission briefing file saved.");
        } catch (e) {
          themedNotice("Save failed: " + (e?.message || "Unknown error"));
        }
      }

      async function shareMissionBriefingFile() {
        try {
          const text = await buildMissionBriefingText();
          const name = `mission-briefing-${new Date().toISOString().replace(/[:.]/g, "-")}.md`;
          const shared = await shareTextFile("Mission Briefing", name, text);
          recordSyncCenterEvent(shared ? "file_shared" : "file_saved", { message: name });
          if (currentView === "settings") renderSyncCenter();
          themedNotice(shared ? "Mission briefing shared." : "Share unavailable. Mission briefing file saved.");
        } catch (e) {
          themedNotice("Share failed: " + (e?.message || "Unknown error"));
        }
      }

      async function copyMissionProbePack() {
        const combined = await buildMissionProbePackText();
        if (!combined.trim()) {
          themedNotice("Mission + Probe pack is empty.");
          return;
        }
        try {
          const result = await copyTextWithFallback(combined, "MISSION + PROBE AI PACK");
          themedNotice(result === "manual" ? "Clipboard blocked. Manual copy view opened." : "Mission + Probe AI pack copied.");
        } catch (e) {
          themedNotice("Copy failed: " + e.message);
        }
      }

      async function copyMissionProbeTutorial() {
        try {
          const res = await fetch("/MissionProbeWorkflow.md", { cache: "no-store" });
          if (!res.ok) throw new Error("Failed to load MissionProbeWorkflow.md");
          const text = (await res.text()).trim();
          if (!text) {
            themedNotice("Mission + Probe tutorial is empty.");
            return;
          }
          const result = await copyTextWithFallback(text, "MISSION + PROBE TUTORIAL");
          themedNotice(result === "manual" ? "Clipboard blocked. Manual copy view opened." : "Mission + Probe tutorial copied.");
        } catch (e) {
          themedNotice("Copy failed: " + e.message);
        }
      }


      function routineStorageKey() {
        return "routineData:v2";
      }

      function normalizeGymMetric(value) {
        const n = Number(value);
        if (!Number.isFinite(n) || n < 0) return 0;
        return Math.round(n);
      }

      function sanitizeGymSessionMode(value, fallback = "strength") {
        const mode = String(value || "").trim().toLowerCase();
        if (["strength", "time", "hybrid"].includes(mode)) return mode;
        return fallback;
      }

      function sanitizeGymSessionStatus(value, fallback = "pending") {
        const status = String(value || "").trim().toLowerCase();
        if (["pending", "in-progress", "completed", "skipped"].includes(status)) return status;
        return fallback;
      }

      function inferGymSessionMode(exercise = {}) {
        const explicit = sanitizeGymSessionMode(exercise?.sessionMode, "");
        if (explicit) return explicit;
        const hasSeconds = normalizeGymMetric(exercise?.targetSeconds || exercise?.lastSession?.seconds) > 0;
        const hasReps = normalizeGymMetric(exercise?.targetReps || exercise?.lastSession?.reps) > 0
          || normalizeGymMetric(exercise?.targetSets || exercise?.lastSession?.sets) > 0;
        if (hasSeconds && hasReps) return "hybrid";
        if (hasSeconds) return "time";
        return "strength";
      }

      function normalizeGymLastSession(last) {
        if (!last || typeof last !== "object") return null;
        const labels = gymMetricLabelsFor(last);
        const normalized = {
          status: sanitizeGymSessionStatus(last.status, "completed"),
          mode: sanitizeGymSessionMode(last.mode, inferGymSessionMode(last)),
          setsLabel: labels.setsLabel,
          repsLabel: labels.repsLabel,
          secondsLabel: labels.secondsLabel,
          restLabel: labels.restLabel,
          weightLabel: labels.weightLabel,
          resultLabel: labels.resultLabel,
          sets: normalizeGymMetric(last.sets),
          reps: normalizeGymMetric(last.reps),
          seconds: normalizeGymMetric(last.seconds),
          restSeconds: normalizeGymMetric(last.restSeconds),
          weight: String(last.weight || "").trim(),
          result: String(last.result || "").trim(),
          notes: String(last.notes || "").trim(),
          at: String(last.at || last.updatedAt || "").trim(),
        };
        const hasMeaningfulData = normalized.at
          || normalized.notes
          || normalized.weight
          || normalized.result
          || normalized.sets
          || normalized.reps
          || normalized.seconds
          || normalized.restSeconds
          || normalized.status !== "pending";
        return hasMeaningfulData ? normalized : null;
      }

      function normalizeGymCatalogText(value) {
        return String(value || "").replace(/\s+/g, " ").trim();
      }

      function normalizeGymMetricLabel(value, fallback = "") {
        const clean = normalizeGymCatalogText(value);
        return clean || normalizeGymCatalogText(fallback);
      }

      function appendGymCatalogNote(text, note) {
        const base = normalizeGymCatalogText(text);
        const extra = normalizeGymCatalogText(note);
        if (!extra) return base;
        if (!base) return extra;
        return base.toLowerCase().includes(extra.toLowerCase()) ? base : `${base} ${extra}`;
      }

      function gymExerciseLooksLowerBody(exercise = {}) {
        const blob = [
          exercise?.section || "",
          exercise?.name || "",
          exercise?.desc || "",
          exercise?.targets || "",
        ].join(" ").toLowerCase();
        return /(quad|glute|hamstring|adductor|calf|ankle|knee|leg|hip flexor|split squat|step up|lunge|squat|rdl|bridge|thrust|tibialis|soleus|cossack|pistol|nordic|wall sit|spanish squat|terminal knee)/.test(blob);
      }

      function gymExerciseSupportsHeelElevation(exercise = {}) {
        const blob = [
          exercise?.section || "",
          exercise?.name || "",
          exercise?.desc || "",
          exercise?.targets || "",
        ].join(" ").toLowerCase();
        return /(quad|glute|hamstring|adductor|leg|knee|hip flexor|split squat|step up|lunge|squat|rdl|bridge|thrust|cossack|pistol|nordic|wall sit|spanish squat|terminal knee|leg press|hip thrust|peterson|poliquin|reverse lunge|step-down|box squat)/.test(blob);
      }

      function gymMetricLabelsFor(item = {}) {
        return {
          setsLabel: normalizeGymMetricLabel(item?.setsLabel, "Sets"),
          repsLabel: normalizeGymMetricLabel(item?.repsLabel, "Reps"),
          secondsLabel: normalizeGymMetricLabel(item?.secondsLabel, "Seconds"),
          restLabel: normalizeGymMetricLabel(item?.restLabel, "Rest"),
          weightLabel: normalizeGymMetricLabel(item?.weightLabel, "Weight"),
          resultLabel: normalizeGymMetricLabel(item?.resultLabel, "Result"),
        };
      }

      function gymSessionCardLabelsFor(item = {}) {
        return {
          ...gymMetricLabelsFor(item),
          targetsLabel: normalizeGymMetricLabel(item?.targetsLabel, "Targets"),
        };
      }

      function gymReferenceTopKeywords(exercise = {}) {
        const top = sectionToTop(normalizeGymSectionName(exercise?.section));
        if (top === "COMBAT") return ["boxing", "drill", "technique"];
        if (top === "CARDIO") return ["running", "exercise", "workout"];
        if (top === "WARMUP") return ["warm up", "mobility", "exercise"];
        return ["exercise", "form", "technique"];
      }

      function buildGymReferenceQuery(item) {
        const exercise = (item && typeof item === "object") ? item : { name: String(item || "") };
        const base = normalizeGymCatalogText(
          exercise?.referenceQuery
          || exercise?.photoReference
          || exercise?.photoHint
          || exercise?.name
          || ""
        );
        if (!base) return "";
        const section = normalizeGymSectionName(exercise?.section || "");
        const lowered = base.toLowerCase();
        const tokens = [];
        const addToken = (value) => {
          const clean = normalizeGymCatalogText(value);
          if (!clean) return;
          if (tokens.some((row) => row.toLowerCase() === clean.toLowerCase())) return;
          tokens.push(clean);
        };

        addToken(base);
        if (section && !lowered.includes(section.toLowerCase())) addToken(section);
        gymReferenceTopKeywords(exercise).forEach((token) => {
          if (!lowered.includes(token.toLowerCase())) addToken(token);
        });
        if (/(lead hand|jab|cross|hook|uppercut|slip|parry|pivot|shadow|bag|spar|ring)/i.test(base) && !/boxing/i.test(lowered)) {
          addToken("boxing");
        }
        if (/(stretch|mobility|cars|rotation|rocker|switch)/i.test(base) && !/mobility|stretch/i.test(lowered)) {
          addToken("mobility");
        }
        if (/(plank|dead bug|pallof|bird dog|hollow)/i.test(base) && !/core/i.test(lowered)) {
          addToken("core");
        }
        return tokens.join(" ");
      }

      function normalizeGymCatalogNameKey(value) {
        return normalizeGymCatalogText(value).toLowerCase();
      }

      function normalizeGymPhotoManifest(manifest) {
        if (!manifest || typeof manifest !== "object") return {};
        const out = {};
        Object.entries(manifest).forEach(([key, value]) => {
          const cleanKey = slugifyGymCatalogKey(String(key || "").replace(/\//g, "_"));
          const cleanValue = normalizeGymCatalogText(value);
          if (cleanKey && cleanValue) out[cleanKey] = cleanValue;
        });
        return out;
      }

      function gymPhotoManifestKeysFor(exercise = {}) {
        const sectionKey = slugifyGymCatalogKey(normalizeGymSectionName(exercise?.section || ""));
        const nameKey = slugifyGymCatalogKey(exercise?.name || exercise?.id || "");
        const idKey = slugifyGymCatalogKey(exercise?.id || "");
        const refKey = slugifyGymCatalogKey(exercise?.referenceQuery || "");
        const keys = [
          sectionKey && nameKey ? `${sectionKey}_${nameKey}` : "",
          sectionKey && idKey ? `${sectionKey}_${idKey}` : "",
          nameKey,
          idKey,
          refKey,
        ].filter(Boolean);
        return [...new Set(keys)];
      }

      async function loadGymPhotoManifest() {
        if (gymPhotoManifestPromise) return gymPhotoManifestPromise;
        gymPhotoManifestPromise = nativeWindowFetch("/data/gym_photo_manifest.json", { cache: "no-store" })
          .then((res) => (res.ok ? res.json() : {}))
          .then((json) => {
            gymPhotoManifest = normalizeGymPhotoManifest(json);
            if (currentView === "gym-planner") renderGymPlanner();
            const overlay = document.getElementById("exercise-overlay");
            if (overlay && overlay.classList.contains("active")) renderExerciseViewer();
            return gymPhotoManifest;
          })
          .catch(() => {
            gymPhotoManifest = {};
            return gymPhotoManifest;
          });
        return gymPhotoManifestPromise;
      }

      function normalizeGymSectionName(section) {
        const clean = String(section || "").trim();
        const lowered = clean.toLowerCase();
        if (lowered === "check") return "Chest";
        if (lowered === "accessories") return "Stability/Fundamentals";
        return clean;
      }

      function slugifyGymCatalogKey(value) {
        return normalizeGymCatalogNameKey(value)
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_+|_+$/g, "")
          || "exercise";
      }

      function trimGymPhotoLabel(value, maxLen = 26) {
        const clean = normalizeGymCatalogText(value);
        if (!clean) return "";
        if (clean.length <= maxLen) return clean;
        return `${clean.slice(0, Math.max(0, maxLen - 3))}...`;
      }

      function gymOfflinePhotoAccent(section) {
        const top = sectionToTop(normalizeGymSectionName(section));
        if (top === "COMBAT") return "#ff784f";
        if (top === "CARDIO") return "#4fb3ff";
        if (top === "WARMUP") return "#ffd24f";
        return "#57ff8b";
      }

      function escapeSvgText(value) {
        return String(value || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;");
      }

      function buildGymOfflinePhotoDataUrl(exercise = {}) {
        const section = trimGymPhotoLabel(normalizeGymSectionName(exercise?.section) || "Training", 18) || "Training";
        const name = trimGymPhotoLabel(exercise?.name || "Exercise", 28) || "Exercise";
        const accent = gymOfflinePhotoAccent(section);
        const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 420">
            <defs>
              <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#07140b"/>
                <stop offset="100%" stop-color="#020202"/>
              </linearGradient>
            </defs>
            <rect width="420" height="420" fill="url(#bg)"/>
            <rect x="24" y="24" width="372" height="372" rx="22" fill="none" stroke="${accent}" stroke-width="6"/>
            <rect x="118" y="182" width="184" height="18" rx="8" fill="${accent}" opacity="0.92"/>
            <rect x="92" y="168" width="18" height="46" rx="6" fill="${accent}" opacity="0.92"/>
            <rect x="70" y="160" width="14" height="62" rx="5" fill="${accent}" opacity="0.72"/>
            <rect x="314" y="168" width="18" height="46" rx="6" fill="${accent}" opacity="0.92"/>
            <rect x="336" y="160" width="14" height="62" rx="5" fill="${accent}" opacity="0.72"/>
            <circle cx="210" cy="122" r="40" fill="#0f2617" stroke="${accent}" stroke-width="5"/>
            <path d="M160 304 C188 266, 232 266, 260 304" fill="none" stroke="${accent}" stroke-width="12" stroke-linecap="round"/>
            <text x="42" y="64" fill="${accent}" font-size="26" font-family="Arial, sans-serif" letter-spacing="2">OMNI OFFLINE</text>
            <text x="42" y="346" fill="#f7f1cc" font-size="22" font-family="Arial, sans-serif">${escapeSvgText(section)}</text>
            <text x="42" y="376" fill="#ffffff" font-size="28" font-family="Arial, sans-serif" font-weight="700">${escapeSvgText(name)}</text>
          </svg>
        `;
        return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
      }

      function hasGymCustomPhoto(exercise = {}) {
        return !!normalizeGymCatalogText(exercise?.photo);
      }

      function getGymBundledPhoto(exercise = {}) {
        const manifest = gymPhotoManifest && typeof gymPhotoManifest === "object" ? gymPhotoManifest : {};
        const keys = gymPhotoManifestKeysFor(exercise);
        for (const key of keys) {
          if (manifest[key]) return manifest[key];
        }
        return "";
      }

      function getGymDisplayPhoto(exercise = {}) {
        const custom = normalizeGymCatalogText(exercise?.photo);
        if (custom) return custom;
        const bundled = getGymBundledPhoto(exercise);
        return bundled || buildGymOfflinePhotoDataUrl(exercise);
      }

      function buildGymReferenceUrl(item) {
        const clean = buildGymReferenceQuery(item);
        if (!clean) return "";
        return `https://duckduckgo.com/?q=${encodeURIComponent(clean)}&iax=images&ia=images`;
      }

      function isAutoGymReferenceUrl(url) {
        const clean = normalizeGymCatalogText(url).toLowerCase();
        return /duckduckgo\.com\/\?q=.*iax=images/.test(clean) || /google\.[^/]+\/search/.test(clean);
      }

      function normalizeGymCatalogExercise(exercise, fallbackId) {
        const lastSession = normalizeGymLastSession(exercise?.lastSession);
        const labels = gymMetricLabelsFor({ ...(lastSession || {}), ...(exercise || {}) });
        const referenceQuery = buildGymReferenceQuery(exercise);
        const rawReferenceUrl = normalizeGymCatalogText(exercise?.referenceUrl);
        const referenceUrl = rawReferenceUrl && !isAutoGymReferenceUrl(rawReferenceUrl)
          ? rawReferenceUrl
          : buildGymReferenceUrl({ ...exercise, referenceQuery });
        return {
          id: String(exercise?.id || fallbackId || `gx_fix_${Date.now()}_${Math.floor(Math.random() * 100000)}`),
          name: String(exercise?.name || "Exercise"),
          desc: String(exercise?.desc || exercise?.note || ""),
          photo: String(exercise?.photo || ""),
          targets: normalizeGymCatalogText(exercise?.targets),
          targetsLabel: normalizeGymMetricLabel(exercise?.targetsLabel, "Targets"),
          referenceQuery,
          referenceUrl,
          source: normalizeGymCatalogText(exercise?.source),
          sessionMode: inferGymSessionMode(exercise),
          setsLabel: labels.setsLabel,
          repsLabel: labels.repsLabel,
          secondsLabel: labels.secondsLabel,
          restLabel: labels.restLabel,
          weightLabel: labels.weightLabel,
          resultLabel: labels.resultLabel,
          targetSets: normalizeGymMetric(exercise?.targetSets ?? lastSession?.sets ?? 0),
          targetReps: normalizeGymMetric(exercise?.targetReps ?? lastSession?.reps ?? 0),
          targetSeconds: normalizeGymMetric(exercise?.targetSeconds ?? lastSession?.seconds ?? 0),
          restSeconds: normalizeGymMetric(exercise?.restSeconds ?? lastSession?.restSeconds ?? 0),
          targetWeight: String(exercise?.targetWeight ?? lastSession?.weight ?? "").trim(),
          lastSession,
        };
      }

      function gymSeedExercise(section, name, desc, options = {}) {
        return normalizeGymCatalogExercise({
          id: options.id || `gx_seed_${slugifyGymCatalogKey(section)}_${slugifyGymCatalogKey(name)}`,
          name,
          desc,
          photo: String(options.photo || "").trim(),
          targets: options.targets || "",
          referenceQuery: options.referenceQuery || name,
          referenceUrl: options.referenceUrl || "",
          source: options.source || "",
          sessionMode: options.sessionMode || "",
          targetSets: options.targetSets ?? 0,
          targetReps: options.targetReps ?? 0,
          targetSeconds: options.targetSeconds ?? 0,
          restSeconds: options.restSeconds ?? 0,
          targetWeight: options.targetWeight ?? "",
        });
      }

      function buildDefaultGymCatalogSeed() {
        const gymSource = "Local gym archive";
        const boxingSource = "Local boxing archive";
        const coreSource = "Local core/hip protocol";
        const catalog = {
          "Chest": [
            gymSeedExercise("Chest", "Bench Press", "Flat barbell press for upper-body strength and chest drive.", {
              targets: "Chest, anterior delts, triceps",
              referenceQuery: "barbell bench press exercise",
              source: gymSource,
              targetSets: 4,
              targetReps: 6,
              restSeconds: 120,
            }),
            gymSeedExercise("Chest", "Incline Bench Press", "Upper-chest pressing variation with a slightly higher bench angle.", {
              targets: "Upper chest, anterior delts, triceps",
              referenceQuery: "incline bench press exercise",
              source: gymSource,
              targetSets: 4,
              targetReps: 8,
              restSeconds: 90,
            }),
            gymSeedExercise("Chest", "Dumbbell Bench Press", "Independent press for chest strength and left-right balance.", {
              targets: "Chest, triceps, stabilizers",
              referenceQuery: "dumbbell bench press exercise",
              source: gymSource,
              targetSets: 3,
              targetReps: 10,
              restSeconds: 90,
            }),
            gymSeedExercise("Chest", "Close-Grip Bench Press", "Pressing variation to drive triceps and lockout strength.", {
              targets: "Triceps, chest, anterior delts",
              referenceQuery: "close grip bench press exercise",
              source: gymSource,
              targetSets: 3,
              targetReps: 8,
              restSeconds: 120,
            }),
            gymSeedExercise("Chest", "Paused Bench Press", "Competition-style pause on the chest to build control and power off the bottom.", {
              targets: "Chest, triceps, pressing control",
              referenceQuery: "paused bench press exercise",
              source: gymSource,
              targetSets: 3,
              targetReps: 5,
              restSeconds: 120,
            }),
            gymSeedExercise("Chest", "Push-Up Plus", "Push-up with a strong scapular reach at the top for serratus control.", {
              targets: "Chest, serratus anterior, shoulder stability",
              referenceQuery: "push up plus exercise",
              source: gymSource,
              targetSets: 3,
              targetReps: 12,
              restSeconds: 45,
            }),
          ],
          "Back": [
            gymSeedExercise("Back", "Seated Machine Shrugs", "Controlled shrug for upper-trap strength without swinging.", {
              targets: "Upper traps, lower traps, lats",
              referenceQuery: "seated machine shrug",
              source: gymSource,
              targetSets: 3,
              targetReps: 12,
              restSeconds: 60,
            }),
            gymSeedExercise("Back", "Band Pull-Aparts", "High-rep scapular retraction drill to open the upper back.", {
              targets: "Rhomboids, mid traps, rear delts",
              referenceQuery: "band pull apart exercise palms up",
              source: gymSource,
              targetSets: 3,
              targetReps: 15,
              restSeconds: 30,
            }),
            gymSeedExercise("Back", "Chest-Supported Dumbbell Rows", "Row from an incline bench to load the back without low-back sway.", {
              targets: "Rhomboids, mid traps, lats",
              referenceQuery: "chest supported dumbbell row incline bench",
              source: gymSource,
              targetSets: 3,
              targetReps: 10,
              restSeconds: 75,
            }),
            gymSeedExercise("Back", "Bench Rows", "Chest-supported row variation for clean pulling mechanics and strict tempo.", {
              targets: "Rhomboids, mid traps, lats",
              referenceQuery: "bench supported row chest supported",
              source: gymSource,
              targetSets: 3,
              targetReps: 10,
              restSeconds: 75,
            }),
            gymSeedExercise("Back", "Straight-Arm Pulldowns", "Lat isolation drill to groove scapular depression and trunk control.", {
              targets: "Lats, teres major, lower traps",
              referenceQuery: "straight arm pulldown cable",
              source: gymSource,
              targetSets: 3,
              targetReps: 12,
              restSeconds: 60,
            }),
            gymSeedExercise("Back", "Scapular Pull-Ups", "Depression-only pull-up rep to teach clean shoulder packing.", {
              targets: "Lower traps, lats, shoulder stability",
              referenceQuery: "scapular pull ups depression",
              source: gymSource,
              targetSets: 3,
              targetReps: 8,
              restSeconds: 60,
            }),
            gymSeedExercise("Back", "Face Pulls", "Rear-shoulder and cuff drill with a clean external-rotation finish.", {
              targets: "Rear delts, rotator cuff, mid traps",
              referenceQuery: "face pull external rotation rope",
              source: gymSource,
              targetSets: 3,
              targetReps: 15,
              restSeconds: 45,
            }),
            gymSeedExercise("Back", "Band External Rotations", "Small-range cuff work to keep shoulders healthy for pressing and boxing.", {
              targets: "Infraspinatus, teres minor, rotator cuff",
              referenceQuery: "band external rotation elbow at side",
              source: gymSource,
              targetSets: 3,
              targetReps: 15,
              restSeconds: 30,
            }),
            gymSeedExercise("Back", "Rear Delt Flyes", "Strict rear-delt work with a slight pause at the top.", {
              targets: "Rear delts, scapular stabilizers",
              referenceQuery: "rear delt fly dumbbell",
              source: gymSource,
              targetSets: 3,
              targetReps: 12,
              restSeconds: 45,
            }),
            gymSeedExercise("Back", "Wall Angels", "Slow posture drill for the upper back and shoulder blades.", {
              targets: "Lower traps, rhomboids, rotator cuff",
              referenceQuery: "wall angels exercise posture",
              source: gymSource,
              targetSets: 2,
              targetReps: 8,
              restSeconds: 30,
            }),
          ],
          "Shoulders": [
            gymSeedExercise("Shoulders", "Dumbbell Lateral Raises", "Controlled side raise for clean shoulder volume without swinging.", {
              targets: "Medial delts, supraspinatus",
              referenceQuery: "dumbbell lateral raise strict",
              source: gymSource,
              targetSets: 3,
              targetReps: 15,
              restSeconds: 45,
            }),
            gymSeedExercise("Shoulders", "Cable Lateral Raises", "Cable variation that keeps constant tension through the whole rep.", {
              targets: "Medial delts",
              referenceQuery: "cable lateral raise behind body",
              source: gymSource,
              targetSets: 3,
              targetReps: 12,
              restSeconds: 45,
            }),
            gymSeedExercise("Shoulders", "Dumbbell Front Raises", "Light front raise for shoulder control and clean arm path.", {
              targets: "Anterior delts",
              referenceQuery: "dumbbell front raise light",
              source: gymSource,
              targetSets: 2,
              targetReps: 12,
              restSeconds: 45,
            }),
            gymSeedExercise("Shoulders", "Scaption Raises", "Thumbs-up raise through the scapular plane for stable shoulders.", {
              targets: "Supraspinatus, medial delts",
              referenceQuery: "scaption raise thumbs up",
              source: gymSource,
              targetSets: 3,
              targetReps: 12,
              restSeconds: 45,
            }),
            gymSeedExercise("Shoulders", "Overhead Dumbbell Press", "Neutral-grip overhead press for controlled vertical strength.", {
              targets: "Anterior delts, medial delts, triceps, stabilizers",
              referenceQuery: "neutral grip dumbbell shoulder press",
              source: gymSource,
              targetSets: 3,
              targetReps: 8,
              restSeconds: 90,
            }),
            gymSeedExercise("Shoulders", "Prone Y Raises", "Light lower-trap raise to improve overhead control and shoulder position.", {
              targets: "Lower traps, shoulder stabilizers",
              referenceQuery: "prone Y raise lower trapezius",
              source: gymSource,
              targetSets: 2,
              targetReps: 10,
              restSeconds: 30,
            }),
          ],
          "Legs": [
            gymSeedExercise("Legs", "Back Squat", "Primary squat pattern for lower-body strength, bracing, and leg drive.", {
              targets: "Quads, glutes, adductors, trunk",
              referenceQuery: "back squat exercise",
              source: gymSource,
              targetSets: 4,
              targetReps: 5,
              restSeconds: 150,
            }),
            gymSeedExercise("Legs", "Front Squat", "Upright squat variation to bias quads and upper-back posture.", {
              targets: "Quads, upper back, trunk",
              referenceQuery: "front squat exercise",
              source: gymSource,
              targetSets: 4,
              targetReps: 6,
              restSeconds: 120,
            }),
            gymSeedExercise("Legs", "Wide-Stance Squat", "Sumo-style squat for adductors, glutes, and a wider base.", {
              targets: "Adductors, glute med, glute max, quads",
              referenceQuery: "wide stance squat sumo upright",
              source: gymSource,
              targetSets: 4,
              targetReps: 10,
              restSeconds: 90,
            }),
            gymSeedExercise("Legs", "Goblet Squat with Band Around Knees", "Squat pattern that reinforces knee tracking and glute engagement.", {
              targets: "Glute med, glute max, adductors, quads",
              referenceQuery: "banded goblet squat",
              source: gymSource,
              targetSets: 3,
              targetReps: 12,
              restSeconds: 75,
            }),
            gymSeedExercise("Legs", "Heels-Elevated Wide Squat", "Wide squat with heel lift to keep the torso upright and load the quads.", {
              targets: "Adductors, quads, glutes",
              referenceQuery: "heels elevated wide squat",
              source: gymSource,
              targetSets: 3,
              targetReps: 10,
              restSeconds: 75,
            }),
            gymSeedExercise("Legs", "Cossack Squat", "Side-to-side squat for adductors, hips, and frontal-plane control.", {
              targets: "Adductors, glute med, deep hip rotators",
              referenceQuery: "cossack squat exercise",
              source: gymSource,
              targetSets: 3,
              targetReps: 6,
              restSeconds: 60,
            }),
            gymSeedExercise("Legs", "Wide-Stance Split Squat", "Split squat with lateral bias for glute med and adductor strength.", {
              targets: "Glute med, adductors, VMO",
              referenceQuery: "wide stance split squat",
              source: gymSource,
              targetSets: 3,
              targetReps: 8,
              restSeconds: 75,
            }),
            gymSeedExercise("Legs", "Bulgarian Split Squat", "Rear-foot elevated split squat for unilateral leg strength and balance.", {
              targets: "Quads, glutes, adductors",
              referenceQuery: "bulgarian split squat exercise",
              source: gymSource,
              targetSets: 3,
              targetReps: 8,
              restSeconds: 75,
            }),
            gymSeedExercise("Legs", "Hip Thrust", "Posterior-chain builder focused on glute lockout and pelvis control.", {
              targets: "Glute max, hamstrings, posterior chain",
              referenceQuery: "glute bridge exercise",
              source: gymSource,
              targetSets: 4,
              targetReps: 10,
              restSeconds: 90,
            }),
            gymSeedExercise("Legs", "Single-Leg Glute Bridge", "Unilateral bridge to improve glute firing and pelvic balance.", {
              targets: "Glute max, hamstrings, pelvic stabilizers",
              referenceQuery: "single leg glute bridge",
              source: gymSource,
              targetSets: 3,
              targetReps: 10,
              restSeconds: 45,
            }),
            gymSeedExercise("Legs", "Single-Leg Romanian Deadlift", "Single-leg hinge to train hamstrings, glutes, and foot control.", {
              targets: "Hamstrings, glute max, foot stabilizers",
              referenceQuery: "single leg romanian deadlift",
              source: gymSource,
              targetSets: 3,
              targetReps: 8,
              restSeconds: 60,
            }),
            gymSeedExercise("Legs", "Tibialis Raises", "Shin-strength drill to support ankles, gait, and knee-friendly running.", {
              targets: "Tibialis anterior",
              referenceQuery: "tibialis anterior raises",
              source: gymSource,
              targetSets: 3,
              targetReps: 15,
              restSeconds: 30,
            }),
          ],
          "Core/Abs": [
            gymSeedExercise("Core/Abs", "Front Plank", "Foundational anti-extension hold with a tucked pelvis and active trunk.", {
              targets: "Transverse abdominis, lower abs",
              referenceQuery: "front plank posterior pelvic tilt",
              source: coreSource,
              targetSets: 3,
              targetSeconds: 45,
              restSeconds: 30,
            }),
            gymSeedExercise("Core/Abs", "Side Plank", "Side-core hold for anti-lean strength and hip-to-rib connection.", {
              targets: "Obliques, quadratus lumborum",
              referenceQuery: "side plank exercise",
              source: coreSource,
              targetSets: 3,
              targetSeconds: 30,
              restSeconds: 30,
            }),
            gymSeedExercise("Core/Abs", "Dead Bug", "Controlled cross-body core drill that links trunk stability with hip motion.", {
              targets: "Lower abs, deep core, hip stability",
              referenceQuery: "dead bug core exercise",
              source: coreSource,
              targetSets: 3,
              targetReps: 10,
              restSeconds: 30,
            }),
            gymSeedExercise("Core/Abs", "Shoulder Taps", "High-plank anti-rotation drill that forces the hips and ribs to stay quiet.", {
              targets: "Deep core, serratus anterior, anti-rotation",
              referenceQuery: "plank shoulder taps exercise",
              source: coreSource,
              targetSets: 3,
              targetReps: 12,
              restSeconds: 30,
            }),
            gymSeedExercise("Core/Abs", "Bird Dog", "Cross-body trunk drill for spinal control and posterior-chain balance.", {
              targets: "Deep core, glutes, spinal stability",
              referenceQuery: "bird dog exercise",
              source: coreSource,
              targetSets: 3,
              targetReps: 10,
              restSeconds: 30,
            }),
            gymSeedExercise("Core/Abs", "Hollow Body Hold", "Gymnastics-style trunk hold that teaches full-body tension.", {
              targets: "Anterior core, lower abs, trunk stiffness",
              referenceQuery: "hollow body hold exercise",
              source: coreSource,
              targetSets: 3,
              targetSeconds: 20,
              restSeconds: 30,
            }),
            gymSeedExercise("Core/Abs", "Pallof Press", "Anti-rotation press to build a stable trunk for lifting and punching.", {
              targets: "Obliques, transverse abdominis",
              referenceQuery: "pallof press exercise",
              source: coreSource,
              targetSets: 3,
              targetReps: 12,
              restSeconds: 45,
            }),
            gymSeedExercise("Core/Abs", "Cable Crunch", "Loaded trunk-flexion drill for strong upper-ab tension.", {
              targets: "Upper rectus abdominis",
              referenceQuery: "cable crunch exercise",
              source: gymSource,
              targetSets: 3,
              targetReps: 15,
              restSeconds: 45,
            }),
            gymSeedExercise("Core/Abs", "Reverse Crunch", "Posterior-tilt-focused lower-ab drill with slow control.", {
              targets: "Lower rectus abdominis",
              referenceQuery: "reverse crunch exercise",
              source: coreSource,
              targetSets: 3,
              targetReps: 12,
              restSeconds: 45,
            }),
            gymSeedExercise("Core/Abs", "Lying Leg Raises", "Floor-based leg raise for lower-ab strength and hip-flexor control.", {
              targets: "Lower abs, hip flexors",
              referenceQuery: "lying leg raise",
              source: coreSource,
              targetSets: 3,
              targetReps: 12,
              restSeconds: 45,
            }),
            gymSeedExercise("Core/Abs", "Hanging Knee Raises", "Lower-ab and hip-control drill from a dead hang.", {
              targets: "Lower abs, hip control, grip",
              referenceQuery: "hanging knee raise",
              source: coreSource,
              targetSets: 3,
              targetReps: 10,
              restSeconds: 60,
            }),
            gymSeedExercise("Core/Abs", "Cable Woodchops", "Rotational pattern for obliques and torso sequencing.", {
              targets: "Internal obliques, external obliques",
              referenceQuery: "cable woodchop exercise",
              source: gymSource,
              targetSets: 3,
              targetReps: 12,
              restSeconds: 45,
            }),
            gymSeedExercise("Core/Abs", "Back Raises", "Posterior-chain assistance for low-back endurance and glute support.", {
              targets: "Erector spinae, glute max, hamstrings",
              referenceQuery: "back extension exercise",
              source: coreSource,
              targetSets: 3,
              targetReps: 12,
              restSeconds: 45,
            }),
            gymSeedExercise("Core/Abs", "Superman Hold", "Simple trunk-extension hold to balance anterior-core work.", {
              targets: "Low back, glutes, posterior chain",
              referenceQuery: "superman hold exercise",
              source: coreSource,
              targetSets: 3,
              targetSeconds: 20,
              restSeconds: 30,
            }),
            gymSeedExercise("Core/Abs", "Bear Crawl Hold", "Anti-collapse core position that links shoulders and hips under tension.", {
              targets: "Deep core, obliques, shoulder-hip connection",
              referenceQuery: "bear crawl exercise",
              source: coreSource,
              targetSets: 3,
              targetSeconds: 30,
              restSeconds: 30,
            }),
            gymSeedExercise("Core/Abs", "Mountain Climbers", "Fast knee-drive core drill that ties trunk stiffness to conditioning.", {
              targets: "Abs, hip flexors, conditioning",
              referenceQuery: "mountain climbers exercise",
              source: coreSource,
              targetSets: 4,
              targetSeconds: 20,
              restSeconds: 20,
            }),
            gymSeedExercise("Core/Abs", "Ab Wheel Rollout", "Advanced anti-extension rollout for hard trunk stiffness and shoulder control.", {
              targets: "Anterior core, lats, serratus anterior",
              referenceQuery: "ab wheel rollout exercise",
              source: coreSource,
              targetSets: 3,
              targetReps: 8,
              restSeconds: 45,
            }),
          ],
          "Neck": [
            gymSeedExercise("Neck", "Chin Tuck", "Deep-neck flexor drill to improve head position and reduce forward-neck posture.", {
              targets: "Deep neck flexors, posture",
              referenceQuery: "chin tuck exercise",
              source: boxingSource,
              targetSets: 2,
              targetReps: 12,
              restSeconds: 20,
            }),
            gymSeedExercise("Neck", "Neck Flexion Isometric", "Front-neck brace held against light hand pressure without shrugging.", {
              targets: "Neck flexors, head stability",
              referenceQuery: "neck flexion isometric exercise",
              source: boxingSource,
              targetSets: 3,
              targetSeconds: 20,
              restSeconds: 20,
            }),
            gymSeedExercise("Neck", "Neck Extension Isometric", "Back-of-neck isometric to build resilient head position for sport.", {
              targets: "Neck extensors, posture",
              referenceQuery: "neck extension isometric exercise",
              source: boxingSource,
              targetSets: 3,
              targetSeconds: 20,
              restSeconds: 20,
            }),
            gymSeedExercise("Neck", "Lateral Neck Isometric", "Side-neck brace against light hand pressure on each side.", {
              targets: "Lateral neck stabilizers, posture",
              referenceQuery: "lateral neck isometric exercise",
              source: boxingSource,
              targetSets: 2,
              targetSeconds: 15,
              restSeconds: 20,
            }),
            gymSeedExercise("Neck", "Neck Controlled Rotations", "Slow pain-free neck circles for mobility and relaxed shoulder posture.", {
              targets: "Neck mobility, relaxation",
              referenceQuery: "neck controlled articular rotations",
              source: boxingSource,
              targetSets: 2,
              targetReps: 5,
              restSeconds: 15,
            }),
          ],
          "Plyometrics": [
            gymSeedExercise("Plyometrics", "Pogo Jumps", "Fast ankle-dominant bounce for spring, rhythm, and reactive stiffness.", {
              targets: "Ankles, calves, elastic rebound",
              referenceQuery: "pogo jumps exercise",
              source: coreSource,
              targetSets: 3,
              targetSeconds: 20,
              restSeconds: 30,
            }),
            gymSeedExercise("Plyometrics", "Skater Bounds", "Lateral bound pattern for reactive hips, balance, and change of direction.", {
              targets: "Glute med, adductors, lateral power",
              referenceQuery: "skater jumps exercise",
              source: coreSource,
              targetSets: 3,
              targetReps: 8,
              restSeconds: 45,
            }),
            gymSeedExercise("Plyometrics", "Vertical Jumps", "Simple max-height jump for lower-body power without added complexity.", {
              targets: "Leg power, landing mechanics",
              referenceQuery: "vertical jump exercise",
              source: coreSource,
              targetSets: 4,
              targetReps: 5,
              restSeconds: 45,
            }),
            gymSeedExercise("Plyometrics", "Broad Jump Stick Landing", "Horizontal jump with a controlled hold on the landing.", {
              targets: "Posterior chain, balance, landing control",
              referenceQuery: "broad jump stick landing exercise",
              source: coreSource,
              targetSets: 3,
              targetReps: 5,
              restSeconds: 45,
            }),
            gymSeedExercise("Plyometrics", "Burpees", "Full-body conditioning jump pattern for repeat power under fatigue.", {
              targets: "Conditioning, trunk stiffness, leg power",
              referenceQuery: "burpee exercise",
              source: coreSource,
              targetSets: 3,
              targetReps: 10,
              restSeconds: 45,
            }),
          ],
          "Stability/Fundamentals": [
            gymSeedExercise("Stability/Fundamentals", "Farmer's Carry", "Heavy bilateral carry for posture, grip, trunk, and gait strength.", {
              targets: "Core, grip, glute med, calves, foot intrinsics",
              referenceQuery: "farmers carry exercise",
              source: gymSource,
              targetSets: 4,
              targetSeconds: 40,
              restSeconds: 60,
            }),
            gymSeedExercise("Stability/Fundamentals", "Suitcase Carry", "Single-side loaded carry for anti-lean control and oblique strength.", {
              targets: "Obliques, lats, glute med, grip",
              referenceQuery: "suitcase carry exercise",
              source: gymSource,
              targetSets: 3,
              targetSeconds: 30,
              restSeconds: 60,
            }),
            gymSeedExercise("Stability/Fundamentals", "Farmer's Carry March", "Carry variation that slows the step down and forces hip control.", {
              targets: "Obliques, lower abs, hip flexor control",
              referenceQuery: "farmers carry march",
              source: gymSource,
              targetSets: 3,
              targetSeconds: 30,
              restSeconds: 45,
            }),
            gymSeedExercise("Stability/Fundamentals", "Backward Walking", "Upright backward walk for VMO, calves, and gait mechanics.", {
              targets: "VMO, calves, hip extensors, gait",
              referenceQuery: "backward walking exercise",
              source: gymSource,
              targetSets: 1,
              targetSeconds: 300,
              restSeconds: 0,
            }),
            gymSeedExercise("Stability/Fundamentals", "Wall Walks", "Shoulder-and-core stability drill that builds overhead confidence.", {
              targets: "Anterior core, serratus anterior, shoulder girdle",
              referenceQuery: "wall walk handstand",
              source: gymSource,
              targetSets: 3,
              targetReps: 4,
              restSeconds: 60,
            }),
            gymSeedExercise("Stability/Fundamentals", "Handstand Hold", "Wall-supported inversion hold to challenge trunk tension and stacked shoulders.", {
              targets: "Core, shoulder stabilizers, bodyline control",
              referenceQuery: "wall handstand hold",
              source: gymSource,
              targetSets: 3,
              targetSeconds: 30,
              restSeconds: 60,
            }),
            gymSeedExercise("Stability/Fundamentals", "Wall Sit", "Simple isometric leg brace that also teaches stacked trunk posture.", {
              targets: "Quads, trunk endurance, posture",
              referenceQuery: "wall sit exercise",
              source: coreSource,
              targetSets: 3,
              targetSeconds: 45,
              restSeconds: 30,
            }),
          ],
          "Hip Flexors": [
            gymSeedExercise("Hip Flexors", "Single-Leg Knee Raise Hold", "Boxing-specific hip-flexor drill for balance, frame, and front-side lift.", {
              targets: "Hip flexors, lower abs, stance stability",
              referenceQuery: "single leg knee raise exercise",
              source: boxingSource,
              targetSets: 3,
              targetReps: 10,
              restSeconds: 30,
            }),
            gymSeedExercise("Hip Flexors", "Split Squat with Arms Overhead", "Split-stance mobility drill that opens the front hip while training posture.", {
              targets: "Hip flexors, glutes, trunk posture",
              referenceQuery: "split squat arms overhead stretch",
              source: boxingSource,
              targetSets: 3,
              targetReps: 8,
              restSeconds: 30,
            }),
            gymSeedExercise("Hip Flexors", "Standing Band Hip Flexor Raise", "Resisted marching pattern to build active hip-flexor strength.", {
              targets: "Hip flexors, lower abs, single-leg balance",
              referenceQuery: "standing band hip flexor raise exercise",
              source: boxingSource,
              targetSets: 3,
              targetReps: 12,
              restSeconds: 30,
            }),
            gymSeedExercise("Hip Flexors", "Wall March Hip Lock", "Sprint-wall drill that teaches hip lock, knee drive, and tall posture.", {
              targets: "Hip flexors, glutes, posture, running mechanics",
              referenceQuery: "wall march sprint drill",
              source: coreSource,
              targetSets: 3,
              targetReps: 8,
              restSeconds: 30,
            }),
            gymSeedExercise("Hip Flexors", "Crab Walks", "Lateral floor movement to reinforce abductors, hips, and control under fatigue.", {
              targets: "Hip abductors, glute med, trunk control",
              referenceQuery: "crab walk exercise",
              source: boxingSource,
              targetSets: 3,
              targetSeconds: 30,
              restSeconds: 30,
            }),
          ],
          "Cardio": [
            gymSeedExercise("Cardio", "Jump Rope", "Simple engine-builder for rhythm, calves, and ring conditioning.", {
              targets: "Aerobic base, calves, rhythm",
              referenceQuery: "jump rope exercise boxing",
              source: boxingSource,
              targetSets: 6,
              targetSeconds: 60,
              restSeconds: 30,
            }),
            gymSeedExercise("Cardio", "Stairmaster", "Steady machine conditioning with strict posture and no leaning.", {
              targets: "Aerobic engine, legs, posture",
              referenceQuery: "stairmaster workout machine",
              source: boxingSource,
              targetSets: 1,
              targetSeconds: 600,
              restSeconds: 0,
            }),
            gymSeedExercise("Cardio", "18-Lap Run", "Longer run block to build repeatable cardio for boxing rounds.", {
              targets: "Aerobic endurance, pacing",
              referenceQuery: "running laps exercise track",
              source: boxingSource,
              targetSets: 1,
              targetSeconds: 900,
              restSeconds: 0,
            }),
            gymSeedExercise("Cardio", "Jogs + Short Burst Sprints", "Alternating pace work to train base conditioning and speed on demand.", {
              targets: "Conditioning, speed, recovery",
              referenceQuery: "sprint intervals running workout",
              source: gymSource,
              targetSets: 8,
              targetSeconds: 20,
              restSeconds: 40,
            }),
            gymSeedExercise("Cardio", "Backward Sled Drag", "Upright drag for legs and conditioning without heavy spinal loading.", {
              targets: "Quads, calves, core endurance",
              referenceQuery: "backward sled drag",
              source: gymSource,
              targetSets: 1,
              targetSeconds: 300,
              restSeconds: 0,
            }),
          ],
          "Running": [
            gymSeedExercise("Running", "Aerobic Base Run", "Steady longer run for real stamina and repeatable recovery between hard efforts.", {
              targets: "Aerobic endurance, pacing, leg durability",
              referenceQuery: "easy pace running workout",
              source: coreSource,
              sessionMode: "time",
              targetSets: 1,
              targetSeconds: 1800,
              restSeconds: 0,
            }),
            gymSeedExercise("Running", "Tempo Run", "Sustained hard-but-controlled pace to raise your working threshold.", {
              targets: "Threshold endurance, pace control",
              referenceQuery: "tempo run workout",
              source: coreSource,
              sessionMode: "time",
              targetSets: 1,
              targetSeconds: 900,
              restSeconds: 0,
            }),
            gymSeedExercise("Running", "Sprint Cluster Intervals", "Two mini sprints, short rest, then repeat to build burst stamina.", {
              targets: "Anaerobic power, repeat sprint ability, CO2 tolerance",
              referenceQuery: "repeat sprint interval workout",
              source: coreSource,
              sessionMode: "time",
              targetSets: 8,
              targetSeconds: 12,
              restSeconds: 20,
            }),
            gymSeedExercise("Running", "30-30 Burst Run", "Thirty seconds hard, thirty seconds float jog for longer burst conditioning.", {
              targets: "Running stamina, pace changes, recovery",
              referenceQuery: "30 30 running intervals workout",
              source: coreSource,
              sessionMode: "time",
              targetSets: 10,
              targetSeconds: 30,
              restSeconds: 30,
            }),
            gymSeedExercise("Running", "CO2 Shuttle Intervals", "Short shuttle bursts with controlled rest to build lungs under pressure.", {
              targets: "CO2 tolerance, direction change, fight conditioning",
              referenceQuery: "shuttle run intervals workout",
              source: coreSource,
              sessionMode: "time",
              targetSets: 10,
              targetSeconds: 15,
              restSeconds: 20,
            }),
            gymSeedExercise("Running", "Hill Sprint Repeats", "Short uphill accelerations to build force, posture, and clean sprint mechanics.", {
              targets: "Power, acceleration, leg drive",
              referenceQuery: "hill sprint workout",
              source: coreSource,
              sessionMode: "time",
              targetSets: 8,
              targetSeconds: 12,
              restSeconds: 60,
            }),
          ],
          "Boxing": [
            gymSeedExercise("Boxing", "Shadow Boxing", "Three technical rounds focusing on stance, clean punching, and active guard.", {
              targets: "Technique, rhythm, shoulders, feet",
              referenceQuery: "shadow boxing drill",
              source: boxingSource,
              sessionMode: "time",
              targetSets: 3,
              targetSeconds: 180,
              restSeconds: 60,
            }),
            gymSeedExercise("Boxing", "Bag Work Pace Control", "Alternate fast-volume and slower power rounds while changing range on purpose.", {
              targets: "Bag work, tempo, range control",
              referenceQuery: "heavy bag boxing drill",
              source: boxingSource,
              sessionMode: "time",
              targetSets: 4,
              targetSeconds: 180,
              restSeconds: 60,
            }),
            gymSeedExercise("Boxing", "Sniper Range Rounds", "Stay long and snappy with sharp single shots and quick resets.", {
              targets: "Long range, precision, balance",
              referenceQuery: "boxing long range drill",
              source: boxingSource,
              sessionMode: "time",
              targetSets: 3,
              targetSeconds: 180,
              restSeconds: 60,
            }),
            gymSeedExercise("Boxing", "Inside Fighting Measurement Drill", "Work close range while measuring distance and moving between punches.", {
              targets: "Inside fighting, range awareness, guard",
              referenceQuery: "boxing inside fighting drill",
              source: boxingSource,
              sessionMode: "time",
              targetSets: 3,
              targetSeconds: 180,
              restSeconds: 60,
            }),
            gymSeedExercise("Boxing", "Parry to Counter Drill", "Parry the incoming shot, reset the feet, and fire a clean counter.", {
              targets: "Defense, timing, countering",
              referenceQuery: "boxing parry counter drill",
              source: boxingSource,
              sessionMode: "time",
              targetSets: 3,
              targetSeconds: 120,
              restSeconds: 45,
            }),
            gymSeedExercise("Boxing", "Tight Guard Pivot Reset", "Close-range movement drill that keeps the guard tight while changing angle.", {
              targets: "Guard discipline, pivots, ring movement",
              referenceQuery: "boxing pivot drill",
              source: boxingSource,
              sessionMode: "time",
              targetSets: 3,
              targetSeconds: 120,
              restSeconds: 45,
            }),
          ],
          "Shadow Boxing": [
            gymSeedExercise("Shadow Boxing", "Jab and Feint Round", "Solo round for jabs, feints, range-finding, and snapping the hand back.", {
              targets: "Timing, lead hand, distance control",
              referenceQuery: "shadow boxing jab drill",
              source: boxingSource,
              sessionMode: "time",
              targetSets: 3,
              targetSeconds: 180,
              restSeconds: 45,
            }),
            gymSeedExercise("Shadow Boxing", "Step-In Step-Out 1-2 Round", "Enter on the jab-cross, leave on balance, and reset before repeating.", {
              targets: "Entry timing, straight punches, exits",
              referenceQuery: "shadow boxing 1 2 drill",
              source: boxingSource,
              sessionMode: "time",
              targetSets: 3,
              targetSeconds: 180,
              restSeconds: 45,
            }),
            gymSeedExercise("Shadow Boxing", "Slip and Counter Round", "Work slips, rolls, and immediate return punches without overcommitting.", {
              targets: "Defense, rhythm, counters",
              referenceQuery: "shadow boxing slip counter drill",
              source: boxingSource,
              sessionMode: "time",
              targetSets: 3,
              targetSeconds: 180,
              restSeconds: 45,
            }),
            gymSeedExercise("Shadow Boxing", "Freestyle Speed-Power Round", "Alternate relaxed speed with deliberate hard shots while staying balanced.", {
              targets: "Punch rhythm, power transfer, control",
              referenceQuery: "shadow boxing speed power drill",
              source: boxingSource,
              sessionMode: "time",
              targetSets: 3,
              targetSeconds: 180,
              restSeconds: 45,
            }),
            gymSeedExercise("Shadow Boxing", "Slip Line Shadow Round", "Use a line or imagined rope to drill slips, weaves, and counters in rhythm.", {
              targets: "Head movement, level changes, defense",
              referenceQuery: "slip line shadow boxing drill",
              source: boxingSource,
              sessionMode: "time",
              targetSets: 3,
              targetSeconds: 120,
              restSeconds: 30,
            }),
          ],
          "Bag Work": [
            gymSeedExercise("Bag Work", "Fast Volume Round", "Fast hands, clean returns, and nonstop work without losing stance.", {
              targets: "Hand speed, conditioning, rhythm",
              referenceQuery: "boxing heavy bag speed drill",
              source: boxingSource,
              sessionMode: "time",
              targetSets: 4,
              targetSeconds: 180,
              restSeconds: 60,
            }),
            gymSeedExercise("Bag Work", "Slow Hard Power Round", "Slow the pace down and place hard technically clean shots with intent.", {
              targets: "Power, technique, shot selection",
              referenceQuery: "boxing heavy bag power drill",
              source: boxingSource,
              sessionMode: "time",
              targetSets: 4,
              targetSeconds: 180,
              restSeconds: 60,
            }),
            gymSeedExercise("Bag Work", "Close-Range Inside Round", "Stay tight, measure range, and work compact shots at close distance.", {
              targets: "Inside fighting, short punches, frame control",
              referenceQuery: "boxing inside bag drill",
              source: boxingSource,
              sessionMode: "time",
              targetSets: 3,
              targetSeconds: 180,
              restSeconds: 60,
            }),
            gymSeedExercise("Bag Work", "Long-Range Sniper Round", "Work from the end of range with far, snappy, precise shots and resets.", {
              targets: "Long range, precision, feet under you",
              referenceQuery: "boxing long range bag drill",
              source: boxingSource,
              sessionMode: "time",
              targetSets: 3,
              targetSeconds: 180,
              restSeconds: 60,
            }),
            gymSeedExercise("Bag Work", "Random Pace Mid-Range Round", "Mix fast, slow, hard, and light shots at random while staying composed.", {
              targets: "Pace control, composure, ring IQ",
              referenceQuery: "boxing random pace bag drill",
              source: boxingSource,
              sessionMode: "time",
              targetSets: 3,
              targetSeconds: 180,
              restSeconds: 60,
            }),
            gymSeedExercise("Bag Work", "Body Catch Counter Series", "Right or left body catch into uppercut-hook-jab chains on the bag.", {
              targets: "Combination flow, counters, body-shot rhythm",
              referenceQuery: "boxing body catch counter drill",
              source: boxingSource,
              sessionMode: "time",
              targetSets: 3,
              targetSeconds: 120,
              restSeconds: 45,
            }),
          ],
          "Footwork/Agility": [
            gymSeedExercise("Footwork/Agility", "Pivot Circle Drill", "Circle a target with sharp pivots while keeping the stance loaded.", {
              targets: "Pivots, balance, ring movement",
              referenceQuery: "boxing pivot drill cone",
              source: boxingSource,
              sessionMode: "time",
              targetSets: 3,
              targetSeconds: 90,
              restSeconds: 30,
            }),
            gymSeedExercise("Footwork/Agility", "Step-In Step-Out Drill", "Close distance, score, and leave without hanging in the pocket.", {
              targets: "Range control, timing, exits",
              referenceQuery: "boxing step in step out drill",
              source: boxingSource,
              sessionMode: "time",
              targetSets: 3,
              targetSeconds: 90,
              restSeconds: 30,
            }),
            gymSeedExercise("Footwork/Agility", "L-Step Exit Drill", "Angle off after the exchange using a sharp L-step exit.", {
              targets: "Angles, exits, foot placement",
              referenceQuery: "boxing l step drill",
              source: boxingSource,
              sessionMode: "time",
              targetSets: 3,
              targetSeconds: 90,
              restSeconds: 30,
            }),
            gymSeedExercise("Footwork/Agility", "Cone Box Shuffle", "Small-box shuffle pattern for direction change and stance discipline.", {
              targets: "Agility, feet, coordination",
              referenceQuery: "boxing cone footwork drill",
              source: boxingSource,
              sessionMode: "time",
              targetSets: 4,
              targetSeconds: 45,
              restSeconds: 20,
            }),
            gymSeedExercise("Footwork/Agility", "Roll-Hop Reset", "Roll under, hop out, and reset the stance before the next entry.", {
              targets: "Defense, lower-body rhythm, reset speed",
              referenceQuery: "boxing roll hop drill",
              source: boxingSource,
              sessionMode: "time",
              targetSets: 3,
              targetSeconds: 90,
              restSeconds: 30,
            }),
          ],
          "Coordination": [
            gymSeedExercise("Coordination", "Jump Rope Crossovers", "Coordination-heavy skipping variation to sharpen timing and rhythm.", {
              targets: "Timing, calves, coordination",
              referenceQuery: "jump rope crossovers exercise",
              source: boxingSource,
              sessionMode: "time",
              targetSets: 4,
              targetSeconds: 45,
              restSeconds: 20,
            }),
            gymSeedExercise("Coordination", "Slip Rope Weave Drill", "Weave under a rope and return cleanly to guard every rep.", {
              targets: "Head movement, rhythm, posture",
              referenceQuery: "slip rope boxing drill",
              source: boxingSource,
              sessionMode: "time",
              targetSets: 3,
              targetSeconds: 90,
              restSeconds: 20,
            }),
            gymSeedExercise("Coordination", "Alternating Step-Punch Drill", "Match the feet and hands so punches land off clean step timing.", {
              targets: "Hand-foot timing, coordination, boxing rhythm",
              referenceQuery: "boxing coordination drill solo",
              source: boxingSource,
              sessionMode: "time",
              targetSets: 3,
              targetSeconds: 60,
              restSeconds: 20,
            }),
            gymSeedExercise("Coordination", "Tennis Ball Wall Catch", "Simple hand-eye drill to sharpen reaction timing away from the bag.", {
              targets: "Reaction, hand-eye coordination, focus",
              referenceQuery: "tennis ball wall catch drill",
              source: boxingSource,
              targetSets: 4,
              targetSeconds: 30,
              restSeconds: 20,
            }),
          ],
          "RAMP": [
            gymSeedExercise("RAMP", "Foam Roller Wall Raises", "Slow wall-slide primer for lower traps, cuff, and thoracic opening.", {
              targets: "Lower traps, rotator cuff, thoracic spine",
              referenceQuery: "foam roller wall slides",
              source: gymSource,
              targetSets: 2,
              targetReps: 10,
              restSeconds: 20,
            }),
            gymSeedExercise("RAMP", "Thoracic Spine Foam Roll", "Quick thoracic opener before pressing, pulling, or boxing rounds.", {
              targets: "Thoracic spine, upper back",
              referenceQuery: "thoracic spine foam rolling",
              source: gymSource,
              targetSets: 2,
              targetSeconds: 45,
              restSeconds: 20,
            }),
            gymSeedExercise("RAMP", "Leg Kicks", "Dynamic front-to-back leg swings to open the hips before work.", {
              targets: "Hip flexors, hamstrings, hip mobility",
              referenceQuery: "leg swings exercise",
              source: boxingSource,
              targetSets: 2,
              targetReps: 10,
              restSeconds: 20,
            }),
            gymSeedExercise("RAMP", "Walking Lunges", "Dynamic lunge pattern to wake up hips, glutes, and trunk control.", {
              targets: "Glutes, quads, hips",
              referenceQuery: "walking lunges exercise",
              source: boxingSource,
              targetSets: 2,
              targetReps: 10,
              restSeconds: 20,
            }),
            gymSeedExercise("RAMP", "Open Gates", "Hip-opening mobility drill to prepare stance, pivots, and knee drive.", {
              targets: "Hip mobility, groin, balance",
              referenceQuery: "open the gate hip mobility exercise",
              source: boxingSource,
              targetSets: 2,
              targetReps: 10,
              restSeconds: 20,
            }),
            gymSeedExercise("RAMP", "Butt Kicks", "Fast turnover warm-up to prepare hamstrings and improve rhythm.", {
              targets: "Hamstrings, lower legs, warm-up rhythm",
              referenceQuery: "butt kicks exercise",
              source: boxingSource,
              targetSets: 3,
              targetSeconds: 20,
              restSeconds: 20,
            }),
            gymSeedExercise("RAMP", "Wrist and Ankle Rotations", "Joint prep before punching, skipping, and plyometric footwork.", {
              targets: "Wrists, ankles, joint prep",
              referenceQuery: "wrist ankle mobility warmup",
              source: boxingSource,
              targetSets: 2,
              targetSeconds: 30,
              restSeconds: 10,
            }),
          ],
          "Mobility": [
            gymSeedExercise("Mobility", "90/90 Hip Switch", "Controlled hip-rotation drill to open internal and external range.", {
              targets: "Hip rotation, pelvic control",
              referenceQuery: "90 90 hip switch exercise",
              source: boxingSource,
              targetSets: 2,
              targetReps: 8,
              restSeconds: 15,
            }),
            gymSeedExercise("Mobility", "World's Greatest Stretch", "Full-chain mobility drill covering hips, thoracic rotation, and hamstrings.", {
              targets: "Hips, thoracic spine, hamstrings",
              referenceQuery: "worlds greatest stretch exercise",
              source: boxingSource,
              targetSets: 2,
              targetReps: 6,
              restSeconds: 15,
            }),
            gymSeedExercise("Mobility", "Thoracic Open Book", "Open the mid-back so the ribs and shoulders rotate more freely.", {
              targets: "Thoracic spine, rib rotation",
              referenceQuery: "open book thoracic rotation exercise",
              source: gymSource,
              targetSets: 2,
              targetReps: 8,
              restSeconds: 15,
            }),
            gymSeedExercise("Mobility", "Ankle Dorsiflexion Rockers", "Knee-over-toe ankle drill for squats, running, and footwork.", {
              targets: "Ankles, calves, dorsiflexion",
              referenceQuery: "ankle dorsiflexion rocker exercise",
              source: boxingSource,
              targetSets: 2,
              targetReps: 10,
              restSeconds: 15,
            }),
            gymSeedExercise("Mobility", "Shoulder CARs", "Slow shoulder circles to free up overhead and guard positions.", {
              targets: "Shoulders, scapular control",
              referenceQuery: "shoulder cars exercise",
              source: gymSource,
              targetSets: 2,
              targetReps: 5,
              restSeconds: 15,
            }),
          ],
          "Boxing RAMP": [
            gymSeedExercise("Boxing RAMP", "Skipping Primer", "Normal skipping rounds to raise temperature and find rhythm early.", {
              targets: "Foot rhythm, calves, aerobic warm-up",
              referenceQuery: "boxing skipping warm up",
              source: boxingSource,
              targetSets: 3,
              targetSeconds: 60,
              restSeconds: 20,
            }),
            gymSeedExercise("Boxing RAMP", "Sprint Skips", "Faster skip bursts to push coordination and reaction speed.", {
              targets: "Foot speed, calves, coordination",
              referenceQuery: "sprint skipping exercise boxing",
              source: boxingSource,
              targetSets: 3,
              targetSeconds: 30,
              restSeconds: 30,
            }),
            gymSeedExercise("Boxing RAMP", "Fast Uppercuts", "Fast uppercut rounds to wake up shoulders, rhythm, and guard position.", {
              targets: "Shoulders, rhythm, punch mechanics",
              referenceQuery: "boxing uppercut drill",
              source: boxingSource,
              targetSets: 3,
              targetSeconds: 30,
              restSeconds: 20,
            }),
            gymSeedExercise("Boxing RAMP", "Toe Taps", "Quick-feet drill to build bounce, balance, and sharp entries.", {
              targets: "Footwork, calves, balance",
              referenceQuery: "boxing toe taps drill",
              source: boxingSource,
              targetSets: 3,
              targetSeconds: 20,
              restSeconds: 20,
            }),
            gymSeedExercise("Boxing RAMP", "Running Knee Raises", "Tall sprint-mechanics drill with no leaning and active hips.", {
              targets: "Hip flexors, footwork, posture",
              referenceQuery: "running knee raises drill",
              source: boxingSource,
              targetSets: 3,
              targetSeconds: 20,
              restSeconds: 20,
            }),
            gymSeedExercise("Boxing RAMP", "Box Jumps", "Short-power plyo with balanced landing and stacked posture.", {
              targets: "Power, landing balance, lower body",
              referenceQuery: "box jump exercise",
              source: boxingSource,
              targetSets: 3,
              targetReps: 6,
              restSeconds: 45,
            }),
            gymSeedExercise("Boxing RAMP", "Lunge Jumps", "Explosive split-stance jump to build spring and reactivity.", {
              targets: "Leg power, balance, conditioning",
              referenceQuery: "lunge jumps exercise",
              source: boxingSource,
              targetSets: 3,
              targetReps: 6,
              restSeconds: 45,
            }),
          ],
          "STRETCHES": [
            gymSeedExercise("STRETCHES", "Lat Stretch", "Bench or overhead lat stretch to open the upper back before or after training.", {
              targets: "Lats, teres major",
              referenceQuery: "lat stretch overhead",
              source: gymSource,
              targetSets: 2,
              targetSeconds: 40,
              restSeconds: 15,
            }),
            gymSeedExercise("STRETCHES", "Doorway Pec Stretch", "Classic chest-opening stretch to undo pressing and rounded posture.", {
              targets: "Pecs, front shoulder",
              referenceQuery: "doorway pec stretch",
              source: gymSource,
              targetSets: 2,
              targetSeconds: 40,
              restSeconds: 15,
            }),
            gymSeedExercise("STRETCHES", "Upper Trap and Levator Stretch", "Neck-and-shoulder release for high-tension upper traps.", {
              targets: "Upper traps, levator scapulae",
              referenceQuery: "upper trap stretch",
              source: gymSource,
              targetSets: 2,
              targetSeconds: 40,
              restSeconds: 15,
            }),
            gymSeedExercise("STRETCHES", "Child's Pose with Lat Bias", "Recovery stretch that opens the lats and lower back.", {
              targets: "Lats, lower back",
              referenceQuery: "childs pose lat stretch",
              source: gymSource,
              targetSets: 2,
              targetSeconds: 45,
              restSeconds: 15,
            }),
            gymSeedExercise("STRETCHES", "Calf Stretch", "Simple calf opener for ankles, skipping, and cleaner footwork.", {
              targets: "Calves, ankles",
              referenceQuery: "calf stretch wall exercise",
              source: boxingSource,
              targetSets: 2,
              targetSeconds: 40,
              restSeconds: 15,
            }),
            gymSeedExercise("STRETCHES", "Hip Flexor Stretch", "Front-hip opener to keep your stance tall and reduce hip tension.", {
              targets: "Hip flexors, quads, pelvis",
              referenceQuery: "hip flexor stretch kneeling",
              source: boxingSource,
              targetSets: 2,
              targetSeconds: 40,
              restSeconds: 15,
            }),
            gymSeedExercise("STRETCHES", "Chest Opening Stretch", "Open the chest and front delts after bag rounds or pressing.", {
              targets: "Chest, front delts",
              referenceQuery: "chest opening stretch exercise",
              source: boxingSource,
              targetSets: 2,
              targetSeconds: 30,
              restSeconds: 15,
            }),
          ],
        };
        return {
          catalog,
          topCategories: ["GYM", "CARDIO", "COMBAT", "WARMUP"],
          topCategorySections: {
            "GYM": ["Chest", "Back", "Shoulders", "Legs", "Core/Abs", "Neck", "Stability/Fundamentals", "Hip Flexors", "Plyometrics"],
            "CARDIO": ["Cardio", "Running"],
            "COMBAT": ["Boxing", "Shadow Boxing", "Bag Work", "Footwork/Agility", "Coordination"],
            "WARMUP": ["RAMP", "Mobility", "Boxing RAMP", "STRETCHES"],
          },
        };
      }

      function buildSupplementalGymCatalogSeed() {
        const ringSource = "Local ring plyometric archive";
        const boxingSource = "Local boxing archive";
        const warmupSource = "Local warm-up archive";
        const psychologySource = "Local boxing psychology archive";
        const comboSource = "Local boxing combinations archive";
        const seedMany = (section, source, rows) => rows.map((row) => gymSeedExercise(section, row.name, row.desc, {
          targets: row.targets || "",
          referenceQuery: row.referenceQuery || row.name,
          source,
          sessionMode: row.sessionMode || "",
          targetSets: row.targetSets ?? row.sets ?? 0,
          targetReps: row.targetReps ?? row.reps ?? 0,
          targetSeconds: row.targetSeconds ?? row.seconds ?? 0,
          restSeconds: row.restSeconds ?? row.rest ?? 0,
          targetWeight: row.targetWeight ?? row.weight ?? "",
        }));
        return {
          catalog: {
            "Ring Plyometrics": seedMany("Ring Plyometrics", ringSource, [
              { name: "Beginner Chest Ring Push-Up Pop", desc: "Small hand-release pop from the rings to teach chest-driven elasticity without losing shoulder position.", targets: "Chest, triceps, serratus anterior", reps: 6, sets: 3, rest: 45 },
              { name: "Beginner Chest Ring Reach Push-Up", desc: "Explosive push-up with a brief reach to build unilateral control and ring confidence.", targets: "Chest, anterior delts, trunk stability", reps: 6, sets: 3, rest: 45 },
              { name: "Intermediate Chest Ring Plyo Push-Up", desc: "More aggressive ring pop focusing on fast concentric force and a stable landing back to the rings.", targets: "Chest, triceps, shoulder stability", reps: 5, sets: 4, rest: 60 },
              { name: "Intermediate Chest Ring Deficit Pop Push-Up", desc: "Lower the chest slightly deeper before driving out fast for a bigger elastic rebound.", targets: "Chest, front delts, triceps", reps: 5, sets: 4, rest: 60 },
              { name: "Advanced Chest Ring Clapping Push-Up", desc: "High-output ring push-up that teaches violent upper-body intent and fast hand replacement.", targets: "Chest, triceps, reactive power", reps: 4, sets: 4, rest: 75 },
              { name: "Advanced Chest Ring Archer Pop Push-Up", desc: "Explosive archer variation demanding one-side force production and high ring control.", targets: "Chest, triceps, anti-rotation core", reps: 4, sets: 4, rest: 75 },
              { name: "Beginner Back Ring Row Snap", desc: "Fast concentric ring row with a calm lower to build pull speed before advanced ring pulling.", targets: "Mid back, biceps, scapular control", reps: 8, sets: 3, rest: 45 },
              { name: "Beginner Back Ring High Elbow Row", desc: "Explosive high-elbow row to light up upper-back retraction and amateur boxing posture.", targets: "Rear delts, rhomboids, upper back", reps: 8, sets: 3, rest: 45 },
              { name: "Intermediate Back Ring Power Row", desc: "Hard body-line row with a fast chest-to-rings finish and deliberate bracing throughout.", targets: "Lats, mid back, biceps", reps: 6, sets: 4, rest: 60 },
              { name: "Intermediate Back Ring Tuck Pull-Up Lower", desc: "Explosive pull into a tuck and slow lower to bridge toward true plyometric pulling.", targets: "Lats, biceps, lower abs", reps: 5, sets: 4, rest: 60 },
              { name: "Advanced Back Ring Plyo Pull-Up", desc: "Drive high out of the pull with a clean, controlled catch on the return.", targets: "Lats, upper back, arm pull power", reps: 4, sets: 4, rest: 75 },
              { name: "Advanced Back Chest-to-Rings Pull-Up", desc: "Chest-high explosive pull that builds the force needed for advanced ring transitions.", targets: "Lats, scapular depressors, biceps", reps: 4, sets: 4, rest: 75 },
              { name: "Beginner Shoulders Ring Support Bounce", desc: "Tiny rebound pulses in ring support to teach stacked shoulders and elastic tension.", targets: "Shoulder stabilizers, triceps, trunk stiffness", seconds: 20, sets: 3, rest: 40, sessionMode: "time" },
              { name: "Beginner Shoulders Ring Pike Lean Pop", desc: "Short pike lean with a fast push away to wake up the shoulders safely.", targets: "Anterior delts, serratus anterior, upper chest", reps: 6, sets: 3, rest: 45 },
              { name: "Intermediate Shoulders Ring Support Tuck Pop", desc: "Explosive support pulse while holding a compact tuck to challenge shoulder integrity.", targets: "Shoulders, triceps, lower abs", reps: 6, sets: 4, rest: 60 },
              { name: "Intermediate Shoulders Ring Pike Press Pop", desc: "Pike press pattern with a springy return to build fast vertical pressing control.", targets: "Shoulders, upper chest, triceps", reps: 5, sets: 4, rest: 60 },
              { name: "Advanced Shoulders Explosive Ring Dip", desc: "Fast dip ascent with a stable catch back into support for advanced pressing power.", targets: "Shoulders, triceps, chest", reps: 4, sets: 4, rest: 75 },
              { name: "Advanced Shoulders Ring Russian Dip Pop", desc: "Advanced dip transition pattern emphasizing violent elbow extension and ring control.", targets: "Triceps, front delts, ring transition strength", reps: 3, sets: 4, rest: 90 },
              { name: "Beginner Core Ring Knee Tuck Snap", desc: "Fast knee-tuck action from support to build front-side core speed and ring awareness.", targets: "Lower abs, hip flexors, shoulder stability", reps: 8, sets: 3, rest: 40 },
              { name: "Beginner Core Ring Body Saw Pulse", desc: "Short body-saw range with rhythmic tension changes for beginner ring trunk work.", targets: "Anterior core, serratus anterior, lats", seconds: 20, sets: 3, rest: 40, sessionMode: "time" },
              { name: "Intermediate Core Ring Pike Tuck", desc: "Explosive pike-tuck action demanding strong lower-ab control and ring steadiness.", targets: "Lower abs, hip flexors, trunk compression", reps: 6, sets: 4, rest: 50 },
              { name: "Intermediate Core Ring Fallout Snap", desc: "Dynamic fallout rep with a quick return to brace anti-extension strength and speed.", targets: "Anterior core, lats, shoulder stability", reps: 6, sets: 4, rest: 50 },
              { name: "Advanced Core Toes-to-Rings Snap", desc: "High-tension compression lift done explosively with a strict lower.", targets: "Lower abs, hip flexors, grip", reps: 5, sets: 4, rest: 60 },
              { name: "Advanced Core Ring L-Sit Pulse", desc: "Explosive pulse work from an L-sit to challenge compression, stability, and ring control.", targets: "Hip flexors, abs, shoulder stabilizers", seconds: 15, sets: 4, rest: 50, sessionMode: "time" },
              { name: "Beginner Legs Ring Assisted Squat Pop", desc: "Use the rings to offload and move explosively out of the squat without losing posture.", targets: "Quads, glutes, landing mechanics", reps: 8, sets: 3, rest: 45 },
              { name: "Beginner Legs Ring Assisted Skater Hop", desc: "Supported lateral hop that teaches direction change and single-leg balance safely.", targets: "Glute med, adductors, lateral power", reps: 8, sets: 3, rest: 45 },
              { name: "Intermediate Legs Ring Split Jump Switch", desc: "Ring-assisted switch jump building rhythm, spring, and split-stance power.", targets: "Quads, glutes, stance change power", reps: 6, sets: 4, rest: 60 },
              { name: "Intermediate Legs Ring Cossack Hop Stick", desc: "Lateral Cossack pattern with a hop and controlled landing for athletic range and strength.", targets: "Adductors, glutes, ankle stiffness", reps: 6, sets: 4, rest: 60 },
              { name: "Advanced Legs Ring Assisted Pistol Pop", desc: "Explosive single-leg squat pattern using the rings only as balance support.", targets: "Single-leg power, quads, glute stability", reps: 5, sets: 4, rest: 75 },
              { name: "Advanced Legs Ring Broad Jump Rebound", desc: "Jump, stick, and rebound with ring assistance for horizontal force and reactive return.", targets: "Posterior chain, landing control, elastic rebound", reps: 5, sets: 4, rest: 75 },
            ]),
            "RAMP": seedMany("RAMP", warmupSource, [
              { name: "Skip Pulse", desc: "Short skipping pulse to raise temperature fast without wasting early energy.", targets: "Calves, heart rate, rhythm", seconds: 45, sets: 3, rest: 15, sessionMode: "time" },
              { name: "March and Reach", desc: "Marching pattern with overhead reach to connect breath, ribs, and hips.", targets: "Hip flexors, thoracic lift, posture", reps: 10, sets: 2, rest: 15 },
              { name: "A-Skip March", desc: "Running mechanics primer to wake up front-side lift and foot timing.", targets: "Hip flexors, calves, rhythm", seconds: 20, sets: 3, rest: 20, sessionMode: "time" },
              { name: "Lateral Shuffle Pulse", desc: "Quick side-to-side pulse to warm up adductors and short defensive steps.", targets: "Adductors, calves, lateral footwork", seconds: 20, sets: 3, rest: 20, sessionMode: "time" },
              { name: "Scap Push-Up", desc: "Shoulder blade push-up to switch on serratus and shoulder control before pressing or punching.", targets: "Serratus anterior, upper back", reps: 12, sets: 2, rest: 20 },
              { name: "Glute Bridge March", desc: "Bridge plus alternating knee drive to activate glutes while keeping the pelvis quiet.", targets: "Glutes, hamstrings, lower abs", reps: 10, sets: 2, rest: 20 },
              { name: "Dead Bug Reach", desc: "Simple core activation drill linking rib control to arm and leg movement.", targets: "Anterior core, breathing, coordination", reps: 8, sets: 2, rest: 20 },
              { name: "Squat to Stand Flow", desc: "Open ankles, hamstrings, and thoracic posture before lower-body or boxing work.", targets: "Hamstrings, ankles, thoracic mobility", reps: 8, sets: 2, rest: 20 },
              { name: "Split Squat Pulse", desc: "Short split-squat pulse for hips, ankles, and stance stability before movement rounds.", targets: "Quads, glutes, hip mobility", reps: 8, sets: 2, rest: 20 },
              { name: "Band External Rotation Pulse", desc: "Tiny cuff pulses to wake up the shoulders before bag work or pressing.", targets: "Rotator cuff, rear delts, shoulder stability", reps: 12, sets: 2, rest: 20 },
            ]),
            "Mobility": seedMany("Mobility", warmupSource, [
              { name: "Hip Airplane Support", desc: "Supported single-leg hip-rotation drill for balance, glute control, and fight stance integrity.", targets: "Glute med, hip rotation, balance", reps: 6, sets: 2, rest: 20 },
              { name: "Adductor Rockback", desc: "Groin-opening rockback for lateral movement and wider squat positions.", targets: "Adductors, hips, groin", reps: 10, sets: 2, rest: 20 },
              { name: "Couch Stretch Flow", desc: "Dynamic couch stretch sequence to open quads and hip flexors before or after training.", targets: "Quads, hip flexors, pelvis position", seconds: 30, sets: 2, rest: 15, sessionMode: "time" },
              { name: "Hamstring Floss", desc: "Gentle nerve-and-hamstring glide to reduce stiffness before sprinting or kicking up pace.", targets: "Hamstrings, calves, posterior chain", reps: 10, sets: 2, rest: 15 },
              { name: "Wrist Extension Rock", desc: "Hands-and-knees wrist prep for push-ups, rings, and hand-heavy warm-up circuits.", targets: "Wrists, forearms, hand support", reps: 12, sets: 2, rest: 15 },
              { name: "Seated Shin Box Reach", desc: "Hip rotation drill with a reach to open both hips and mid-back together.", targets: "Hip internal rotation, glutes, thoracic mobility", reps: 8, sets: 2, rest: 20 },
              { name: "T-Spine Rotation Lunge", desc: "Open the thoracic spine from a lunge so punches and pivots rotate cleaner.", targets: "Thoracic rotation, hips, obliques", reps: 8, sets: 2, rest: 20 },
              { name: "Ankle Knee Drive Pulse", desc: "Pulse the knee over the toe to improve stance depth, footwork, and rebound.", targets: "Ankles, calves, foot mechanics", reps: 12, sets: 2, rest: 15 },
            ]),
            "Boxing RAMP": seedMany("Boxing RAMP", boxingSource, [
              { name: "England Boxing Style Skip Ladder", desc: "Escalating skip cadence to sharpen bounce, breathing, and ring rhythm early.", targets: "Skipping rhythm, calves, aerobic wake-up", seconds: 45, sets: 4, rest: 20, sessionMode: "time" },
              { name: "England Boxing Style Stance Pulse", desc: "Light bounce in stance with clean guard and balanced front-foot pressure.", targets: "Stance balance, calves, guard", seconds: 20, sets: 3, rest: 15, sessionMode: "time" },
              { name: "England Boxing Style Jab Rhythm Raise", desc: "Loose jab pulse to warm the lead shoulder and sharpen scoring rhythm.", targets: "Lead hand, shoulder endurance, timing", seconds: 20, sets: 3, rest: 15, sessionMode: "time" },
              { name: "England Boxing Style Guard Lift Burner", desc: "Fast guard recoveries to raise shoulder temperature and defensive discipline.", targets: "Shoulders, upper back, guard recovery", seconds: 20, sets: 3, rest: 15, sessionMode: "time" },
              { name: "Reactive Toe Tap Switch", desc: "Quick toe taps with direction changes to build fast feet and ring readiness.", targets: "Foot speed, rhythm, ankle stiffness", seconds: 20, sets: 3, rest: 15, sessionMode: "time" },
              { name: "Pivot Pulse Round", desc: "Micro-pivot sequence warming the hips and teaching angle change before hard rounds.", targets: "Pivots, hips, ring movement", seconds: 30, sets: 3, rest: 20, sessionMode: "time" },
              { name: "Slip-Roll Wake-Up", desc: "Short slip and roll series to switch on head movement before technical work.", targets: "Defense rhythm, knees, obliques", seconds: 30, sets: 3, rest: 20, sessionMode: "time" },
              { name: "Band Punch Outs", desc: "Light band-resisted straights to activate punch path and quick recoil.", targets: "Punch mechanics, triceps, serratus anterior", reps: 12, sets: 3, rest: 20 },
              { name: "Three-Punch Build-Up", desc: "Build jab-cross-hook speed progressively without crossing the feet or overloading early.", targets: "Punch sequencing, rhythm, shoulders", seconds: 30, sets: 3, rest: 20, sessionMode: "time" },
              { name: "Fast Hands to Reset", desc: "Five-second hand burst followed by controlled reset breathing and stance.", targets: "Hand speed, composure, reset quality", sets: 6, seconds: 5, rest: 20, sessionMode: "time" },
            ]),
            "England Boxing Warm-Up": seedMany("England Boxing Warm-Up", boxingSource, [
              { name: "Amateur Bout Warm-Up Circuit", desc: "Skip, stance pulse, jab rhythm, and guard recoveries to mimic a short amateur warm-up.", targets: "Full boxing warm-up, rhythm, breathing", sets: 4, seconds: 45, rest: 15, sessionMode: "time" },
              { name: "Corner Exit Warm-Up", desc: "Step off the line after every short punch sequence to prime ring exits.", targets: "Footwork, angles, ring awareness", sets: 3, seconds: 60, rest: 20, sessionMode: "time" },
              { name: "Scoring Burst Warm-Up", desc: "Short flurries of clean amateur scoring shots with sharp pullback and no brawling.", targets: "Scoring rhythm, hand speed, balance", sets: 4, seconds: 30, rest: 20, sessionMode: "time" },
              { name: "Lead Hand Sharpener", desc: "Warm the lead hand with jabs, flicks, and touch-and-go range finding.", targets: "Lead hand, timing, distance control", sets: 3, seconds: 45, rest: 15, sessionMode: "time" },
              { name: "Rear Hand Return Warm-Up", desc: "Cross-focused warm-up teaching recoil, chin cover, and rear-side alignment.", targets: "Rear hand, shoulder alignment, defense", sets: 3, seconds: 45, rest: 15, sessionMode: "time" },
              { name: "Guard Recovery Round", desc: "Throw and instantly rebuild the guard to lock in amateur discipline.", targets: "Guard discipline, shoulders, focus", sets: 3, seconds: 45, rest: 15, sessionMode: "time" },
              { name: "Three-Step Entry Warm-Up", desc: "Entry pattern using step, score, and leave to prepare for clean amateur exchanges.", targets: "Entries, exits, ring rhythm", sets: 3, seconds: 45, rest: 15, sessionMode: "time" },
              { name: "Final Round Switch-On", desc: "Last warm-up round before sparring or pads to bring intent up without burning out.", targets: "Nervous system readiness, speed, focus", sets: 1, seconds: 120, rest: 0, sessionMode: "time" },
            ]),
            "STRETCHES": seedMany("STRETCHES", warmupSource, [
              { name: "Hamstring Strap Stretch", desc: "Controlled hamstring opener using a strap or towel after running or lower-body work.", targets: "Hamstrings, calves", seconds: 40, sets: 2, rest: 15, sessionMode: "time" },
              { name: "Figure Four Glute Stretch", desc: "Classic glute opener for piriformis tightness and post-training decompression.", targets: "Glutes, piriformis, hips", seconds: 40, sets: 2, rest: 15, sessionMode: "time" },
              { name: "Frog Adductor Stretch", desc: "Wide-knee groin stretch to restore lateral range after footwork and lower-body work.", targets: "Adductors, groin, hips", seconds: 40, sets: 2, rest: 15, sessionMode: "time" },
              { name: "Forearm Flexor Stretch", desc: "Palm-up forearm stretch for grip-heavy pulling, bag work, and ring sessions.", targets: "Forearm flexors, wrists", seconds: 30, sets: 2, rest: 10, sessionMode: "time" },
              { name: "Forearm Extensor Stretch", desc: "Palm-down forearm stretch to unload the elbows and wrists after high-volume striking.", targets: "Forearm extensors, wrists", seconds: 30, sets: 2, rest: 10, sessionMode: "time" },
              { name: "Triceps and Lat Bench Stretch", desc: "Bench-supported overhead stretch for triceps, lats, and ribcage expansion.", targets: "Triceps, lats, thoracic opening", seconds: 40, sets: 2, rest: 15, sessionMode: "time" },
              { name: "Standing Quad Stretch", desc: "Simple quad opener to reduce front-thigh stiffness after jumping or sprinting.", targets: "Quads, hip flexors", seconds: 30, sets: 2, rest: 10, sessionMode: "time" },
              { name: "QL Side Reach Stretch", desc: "Lateral chain reach to loosen the ribs, QL, and side body after rotation-heavy rounds.", targets: "QL, obliques, lats", seconds: 30, sets: 2, rest: 10, sessionMode: "time" },
            ]),
            "Cool Down": seedMany("Cool Down", warmupSource, [
              { name: "Nasal Walk-Down", desc: "Walk slowly and bring breathing back under control through the nose only.", targets: "Recovery breathing, heart rate downshift", seconds: 120, sets: 1, rest: 0, sessionMode: "time" },
              { name: "90-90 Breathing Reset", desc: "Supine breathing reset to calm the trunk and restore rib position after hard work.", targets: "Diaphragm, recovery, lower ribs", seconds: 90, sets: 1, rest: 0, sessionMode: "time" },
              { name: "Legs-Up Wall Recovery", desc: "Feet-up recovery position to reduce agitation and let the body cool down.", targets: "Recovery, nervous system downshift", seconds: 120, sets: 1, rest: 0, sessionMode: "time" },
              { name: "Shoulder Shakeout", desc: "Loose shakeout and arm circles to unload tension from shoulders and forearms.", targets: "Shoulders, forearms, relaxation", seconds: 45, sets: 2, rest: 10, sessionMode: "time" },
              { name: "Gentle Shadow Flush", desc: "Very light movement round to cool down while keeping the joints moving.", targets: "Recovery circulation, rhythm, composure", seconds: 90, sets: 1, rest: 0, sessionMode: "time" },
              { name: "Box Breathing Reset", desc: "Box breathing cycle to close the session in a calmer state.", targets: "Breathing control, composure, stress reduction", seconds: 60, sets: 2, rest: 10, sessionMode: "time" },
              { name: "Neck Reset Series", desc: "Slow neck mobility and chin-tuck reset after guard-heavy or shrug-heavy work.", targets: "Neck relaxation, posture", reps: 6, sets: 2, rest: 10 },
              { name: "Parasympathetic Floor Reach", desc: "Easy floor reach and long exhale to reduce whole-body tone before leaving the session.", targets: "Recovery, posterior chain, breathing", seconds: 60, sets: 2, rest: 10, sessionMode: "time" },
            ]),
            "Boxing": seedMany("Boxing", boxingSource, [
              { name: "England Boxing 3x3 Technical Rounds", desc: "Structured amateur-style technical rounds prioritising score, reset, and ring discipline.", targets: "Amateur scoring, pacing, composure", sets: 3, seconds: 180, rest: 60, sessionMode: "time" },
              { name: "Amateur Scoring Burst Session", desc: "Touch-and-go scoring bursts that finish with a clean exit rather than trading.", targets: "Scoring rhythm, range control, exits", sets: 4, seconds: 120, rest: 45, sessionMode: "time" },
              { name: "Jab-Only Scoring Session", desc: "Win the exchange with the lead hand alone and stay disciplined under boredom.", targets: "Lead-hand dominance, rhythm, patience", sets: 3, seconds: 180, rest: 45, sessionMode: "time" },
              { name: "Counterpunch Timer Session", desc: "Wait, read, then answer cleanly to train reaction over emotion.", targets: "Counter timing, discipline, composure", sets: 3, seconds: 150, rest: 45, sessionMode: "time" },
              { name: "Long Range Ring Generalship", desc: "Stay long, control the center, and move before the opponent settles.", targets: "Ring control, long range, scoring", sets: 3, seconds: 180, rest: 60, sessionMode: "time" },
              { name: "Mid-Range Pressure Builder", desc: "Controlled pressure session focused on staying first without getting ragged.", targets: "Pressure, balance, shot selection", sets: 3, seconds: 180, rest: 60, sessionMode: "time" },
              { name: "Defensive Reboot Session", desc: "Defense-first boxing round plan built around parry, slip, roll, and reset.", targets: "Defense, ring calm, clean counters", sets: 3, seconds: 150, rest: 45, sessionMode: "time" },
              { name: "Final Minute Steal Drill", desc: "Train the mindset of winning the last minute with sharp visible scoring work.", targets: "Round awareness, urgency, scoring bursts", sets: 4, seconds: 60, rest: 30, sessionMode: "time" },
            ]),
            "Shadow Boxing": seedMany("Shadow Boxing", boxingSource, [
              { name: "Mirror Guard Round", desc: "Shadow round spent checking guard recovery and clean shoulder relaxation.", targets: "Guard, posture, self-correction", sets: 3, seconds: 120, rest: 30, sessionMode: "time" },
              { name: "Long Guard Probe Round", desc: "Use the long guard and lead hand to touch range and make the opponent freeze.", targets: "Long range, lead-hand control, feints", sets: 3, seconds: 120, rest: 30, sessionMode: "time" },
              { name: "Pull Counter Shadow Round", desc: "Pull just out of range, see the miss, and answer sharply without overreaching.", targets: "Defense, timing, counter shot selection", sets: 3, seconds: 120, rest: 30, sessionMode: "time" },
              { name: "Body Jab Step-Off Round", desc: "Jab the body, angle out, and recover your eyes before the next entry.", targets: "Body attack, angle exits, ring awareness", sets: 3, seconds: 120, rest: 30, sessionMode: "time" },
              { name: "Southpaw Look Round", desc: "Shadow a southpaw look so your feet and eyes get used to the mirror puzzle.", targets: "Adaptability, foot placement, stance reads", sets: 2, seconds: 150, rest: 30, sessionMode: "time" },
              { name: "Angle Exit Shadow Round", desc: "Punch, quarter turn, and leave on balance every single exchange.", targets: "Angles, exits, ring discipline", sets: 3, seconds: 120, rest: 30, sessionMode: "time" },
              { name: "Rhythm Break Shadow Round", desc: "Intentionally change cadence to become harder to read before the next burst.", targets: "Rhythm manipulation, feints, timing", sets: 3, seconds: 120, rest: 30, sessionMode: "time" },
              { name: "Lead Hook Frame Round", desc: "Frame with the lead shoulder and hook only when your feet and distance say yes.", targets: "Lead hook quality, balance, guard", sets: 3, seconds: 120, rest: 30, sessionMode: "time" },
              { name: "Double Jab Score Round", desc: "Work repeated lead-hand scoring without drifting onto the front foot.", targets: "Double jab, ring scoring, posture", sets: 3, seconds: 120, rest: 30, sessionMode: "time" },
              { name: "England Boxing Scoring Round", desc: "Imagine judges watching every exchange and throw only what would clearly score.", targets: "Scoring clarity, discipline, visual sharpness", sets: 3, seconds: 180, rest: 45, sessionMode: "time" },
            ]),
            "Bag Work": seedMany("Bag Work", boxingSource, [
              { name: "Jab to Chest Scoring Round", desc: "Use the jab to the chest and shoulder line to break rhythm and score first.", targets: "Lead-hand control, scoring, distance", sets: 3, seconds: 120, rest: 30, sessionMode: "time" },
              { name: "30-Second Steal Round", desc: "Start calm, then empty out the final thirty seconds with visible scoring work.", targets: "Pacing, urgency, round management", sets: 4, seconds: 150, rest: 45, sessionMode: "time" },
              { name: "Body-Head Ladder Round", desc: "Climb from body to head in clean sequences without smothering the bag.", targets: "Shot variation, body-head transitions", sets: 3, seconds: 150, rest: 45, sessionMode: "time" },
              { name: "Angle Step Pivot Round", desc: "Step in, score, pivot off, and reset distance before re-entering.", targets: "Footwork, pivots, ring exits", sets: 3, seconds: 150, rest: 45, sessionMode: "time" },
              { name: "Catch and Shoot Round", desc: "Touch the bag lightly to simulate a catch, then answer with a clean return burst.", targets: "Counters, reaction speed, guard discipline", sets: 3, seconds: 120, rest: 30, sessionMode: "time" },
              { name: "Two-Touch Exit Round", desc: "Land two meaningful shots, then leave immediately before the third temptation.", targets: "Discipline, exits, shot selection", sets: 3, seconds: 120, rest: 30, sessionMode: "time" },
              { name: "Uppercut Hook Pocket Round", desc: "Short-range pocket round built around uppercut-hook links and compact balance.", targets: "Inside punching, pocket control, shoulders", sets: 3, seconds: 120, rest: 30, sessionMode: "time" },
              { name: "Clinch Break Punchout Round", desc: "Simulate a break and fire a short scoring burst before stepping away.", targets: "Break reactions, hand speed, exits", sets: 3, seconds: 120, rest: 30, sessionMode: "time" },
              { name: "Reset Off the Jab Round", desc: "Every combination starts or ends with a jab reset so the round never becomes messy.", targets: "Jab discipline, range reset, scoring", sets: 3, seconds: 150, rest: 45, sessionMode: "time" },
              { name: "Last 20 Seconds Empty the Tank", desc: "Controlled work early, then a hard twenty-second finish each round.", targets: "Conditioning, intent, closing flurries", sets: 5, seconds: 100, rest: 40, sessionMode: "time" },
            ]),
            "Boxing Combinations": seedMany("Boxing Combinations", comboSource, [
              { name: "1-2 Straight Score", desc: "Simple jab-cross thrown sharp and straight with immediate guard recovery.", targets: "Straight punches, scoring clarity", sets: 3, reps: 12, rest: 20 },
              { name: "1-1-2 Rhythm Break", desc: "Double jab to disrupt rhythm before the rear hand lands clean.", targets: "Lead-hand setup, rhythm change", sets: 3, reps: 10, rest: 20 },
              { name: "1-2-3 Exit", desc: "Straight-straight-hook and leave on balance without admiring the work.", targets: "Basic combination, exits, balance", sets: 3, reps: 10, rest: 20 },
              { name: "1-6-3-2 Fold and Fire", desc: "Jab, rear uppercut, lead hook, rear cross as a tight pocket chain.", targets: "Uppercut entry, pocket sequencing", sets: 3, reps: 8, rest: 25 },
              { name: "2-3-2 Counter Finish", desc: "Cross-hook-cross for pressure or a visible answer after a read.", targets: "Rear-hand chain, pressure scoring", sets: 3, reps: 8, rest: 25 },
              { name: "3-2-3 Shoulder Roll Return", desc: "Lead hook, cross, hook while staying under yourself and not falling over.", targets: "Hook-cross rhythm, shoulder control", sets: 3, reps: 8, rest: 25 },
              { name: "1-2 Slip 2", desc: "Throw straight shots, slip the imagined return, then answer instantly.", targets: "Defense into offense, timing", sets: 3, reps: 8, rest: 25 },
              { name: "Jab Body Cross Head", desc: "Change levels cleanly and come back upstairs without loading up.", targets: "Level changes, body-head sequencing", sets: 3, reps: 8, rest: 25 },
              { name: "Lead Hook Body Head", desc: "Hook low then high while keeping feet quiet and shoulders relaxed.", targets: "Body-head hooks, close-range control", sets: 3, reps: 8, rest: 25 },
              { name: "Rear Uppercut Lead Hook Cross", desc: "Compact three-shot sequence for pocket work and sharp finishing.", targets: "Inside punching, sequencing, balance", sets: 3, reps: 8, rest: 25 },
              { name: "Double Jab Cross Hook", desc: "Use two lead touches to frame the opening before the heavy shots land.", targets: "Setups, scoring, punch flow", sets: 3, reps: 8, rest: 25 },
              { name: "Pull Counter Cross Hook", desc: "Make them miss, then punish the opening with a clean two-shot answer.", targets: "Pull counter, timing, punish response", sets: 3, reps: 8, rest: 25 },
            ]),
            "Boxing Feints": seedMany("Boxing Feints", comboSource, [
              { name: "Shoulder Feint to Jab", desc: "Show the shoulder first so the jab lands while the eyes are already frozen.", targets: "Feints, lead-hand deception, scoring", sets: 3, reps: 10, rest: 20 },
              { name: "Level Change Feint to Cross", desc: "Dip the eyes and level before firing the straight rear hand upstairs.", targets: "Level feint, rear-hand setup", sets: 3, reps: 8, rest: 20 },
              { name: "Step Feint to Lead Hook", desc: "Sell the step and let the hook arrive once the guard reacts.", targets: "Foot feint, hook timing, entries", sets: 3, reps: 8, rest: 20 },
              { name: "Jab Feint to Rear Uppercut", desc: "Make them reach for the jab and come through the middle instead.", targets: "Lead-hand feint, uppercut opening", sets: 3, reps: 8, rest: 20 },
              { name: "Hip Feint to Cross", desc: "Subtle hip show to draw the read before sending the rear straight.", targets: "Body language deception, cross timing", sets: 3, reps: 8, rest: 20 },
              { name: "Half-Step Pull Feint Counter", desc: "Half-step away to invite the shot, then answer off the new timing.", targets: "Distance feint, countering, composure", sets: 3, reps: 8, rest: 20 },
              { name: "Glance Feint to 1-2", desc: "Eyes and head sell one lane while the straight punches take the other.", targets: "Eye deception, straight scoring", sets: 3, reps: 8, rest: 20 },
              { name: "Hand Trap Feint to Body Jab", desc: "Hand-show feint that brings the elbows high so the body jab lands cleaner.", targets: "Hand feints, body attack openings", sets: 3, reps: 8, rest: 20 },
            ]),
            "Boxing Psychology": seedMany("Boxing Psychology", psychologySource, [
              { name: "Stay Calm Under Noise Drill", desc: "Run rounds with the sole aim of keeping posture, breath, and decisions calm under pressure.", targets: "Composure, nervous-system control, decision quality", sets: 2, seconds: 180, rest: 45, sessionMode: "time" },
              { name: "Scoring Eye Between Exchanges", desc: "Train yourself to see what clearly scores instead of what only feels busy.", targets: "Judging awareness, scoring selection", sets: 2, seconds: 180, rest: 45, sessionMode: "time" },
              { name: "Bait and Punish Mindset Round", desc: "Think in terms of invitations, traps, and punish windows rather than random volume.", targets: "Tactical patience, traps, punish timing", sets: 2, seconds: 180, rest: 45, sessionMode: "time" },
              { name: "Pressure Without Panic Round", desc: "Walk someone down while staying mentally loose and technically honest.", targets: "Pressure, calm aggression, structure", sets: 2, seconds: 180, rest: 45, sessionMode: "time" },
              { name: "Round Theft Awareness", desc: "Learn when to save energy and when to visibly steal the last thirty seconds.", targets: "Round management, urgency, timing", sets: 2, seconds: 150, rest: 45, sessionMode: "time" },
              { name: "Rhythm Control and Disruption", desc: "Notice your own rhythm, break it, then break theirs on purpose.", targets: "Rhythm control, deception, adaptability", sets: 2, seconds: 180, rest: 45, sessionMode: "time" },
              { name: "Composure After Being Hit", desc: "Reset immediately after an imagined clean shot instead of emotionally rushing back.", targets: "Emotional control, reset speed, defense", sets: 2, seconds: 180, rest: 45, sessionMode: "time" },
              { name: "Corner Instruction Replay", desc: "Practice receiving one simple instruction and obeying it for the whole round.", targets: "Coachability, discipline, focus", sets: 2, seconds: 180, rest: 45, sessionMode: "time" },
            ]),
          },
          topCategories: ["GYM", "COMBAT", "WARMUP"],
          topCategorySections: {
            "GYM": ["Ring Plyometrics"],
            "COMBAT": ["Boxing", "Shadow Boxing", "Bag Work", "Boxing Combinations", "Boxing Feints", "Boxing Psychology"],
            "WARMUP": ["RAMP", "Mobility", "Boxing RAMP", "England Boxing Warm-Up", "STRETCHES", "Cool Down"],
          },
        };
      }

      function buildExpandedGymCatalogSeed() {
        const ringSource = "Expanded ring plyometric archive";
        const boxingSource = "Expanded boxing archive";
        const warmupSource = "Expanded warm-up archive";
        const comboSource = "Expanded boxing combinations archive";
        const psychologySource = "Expanded boxing psychology archive";
        const tacticsSource = "Expanded boxing tactics archive";
        const structuralSource = "Expanded structural support archive";
        const singlesSource = "Expanded singles archive";
        const seedMany = (section, source, rows) => rows.map((row) => gymSeedExercise(section, row.name, row.desc, {
          targets: row.targets || "",
          referenceQuery: row.referenceQuery || row.name,
          source,
          sessionMode: row.sessionMode || "",
          targetSets: row.targetSets ?? row.sets ?? 0,
          targetReps: row.targetReps ?? row.reps ?? 0,
          targetSeconds: row.targetSeconds ?? row.seconds ?? 0,
          restSeconds: row.restSeconds ?? row.rest ?? 0,
          targetWeight: row.targetWeight ?? row.weight ?? "",
        }));
        return {
          catalog: {
            "Ring Plyometrics": seedMany("Ring Plyometrics", ringSource, [
              { name: "Beginner Chest Ring Split-Stance Pop", desc: "Split-stance ring push-up pop to learn chest-driven speed without losing rib position.", targets: "Chest, triceps, serratus anterior", sets: 3, reps: 6, rest: 45 },
              { name: "Beginner Chest Ring Reach and Catch", desc: "Fast push from the rings, reach slightly, then catch cleanly to build elastic pressing confidence.", targets: "Chest, front delts, anti-rotation core", sets: 3, reps: 6, rest: 45 },
              { name: "Intermediate Chest Ring Alternating Pop", desc: "Alternating ring pop that teaches one-side drive while the body stays stacked.", targets: "Chest, triceps, trunk stability", sets: 4, reps: 5, rest: 60 },
              { name: "Advanced Chest Ring Release Catch", desc: "Explosive ring push-up with a tiny release and clean catch back into tension.", targets: "Chest, triceps, reactive press power", sets: 4, reps: 4, rest: 75 },
              { name: "Beginner Back Ring Inverted Row Burst", desc: "Explode through the top of the ring row and own the slow return.", targets: "Mid back, biceps, scapular control", sets: 3, reps: 8, rest: 45 },
              { name: "Beginner Back Ring High Pull Pulse", desc: "Fast high pull with controlled shoulders for upper-back reactivity.", targets: "Upper back, rear delts, biceps", sets: 3, reps: 8, rest: 45 },
              { name: "Intermediate Back Ring Archer Row Snap", desc: "One-side dominant row snap that forces the trunk to resist twisting.", targets: "Lats, rhomboids, anti-rotation core", sets: 4, reps: 5, rest: 60 },
              { name: "Advanced Back Ring High Pull to Lower", desc: "Explosive pull above the rings followed by a slow disciplined lower.", targets: "Upper back, lats, pull power", sets: 4, reps: 4, rest: 75 },
              { name: "Beginner Shoulders Ring Support Shift", desc: "Small support shifts to build ring comfort and stacked shoulders before harder plyo work.", targets: "Shoulder stabilizers, triceps, trunk", sets: 3, seconds: 20, rest: 40, sessionMode: "time" },
              { name: "Beginner Shoulders Ring Pike Push Pulse", desc: "Short pike push away from the rings to wake up vertical pressing patterns.", targets: "Shoulders, upper chest, serratus anterior", sets: 3, reps: 6, rest: 45 },
              { name: "Intermediate Shoulders Ring Dip Drive", desc: "Controlled dip with an explosive ascent to build athletic pressing power.", targets: "Front delts, triceps, chest", sets: 4, reps: 5, rest: 60 },
              { name: "Advanced Shoulders Ring Pike Press Rebound", desc: "Fast pike press pattern with a quick elastic return while shoulders stay stacked.", targets: "Shoulders, triceps, upper chest", sets: 4, reps: 4, rest: 75 },
              { name: "Beginner Core Ring Mountain Climber Switch", desc: "Hands in rings, fast knee-switch pattern to teach core stiffness under movement.", targets: "Abs, hip flexors, shoulder stability", sets: 3, seconds: 20, rest: 30, sessionMode: "time" },
              { name: "Beginner Core Ring Plank Saw", desc: "Short-range body saw on rings to build anti-extension strength.", targets: "Anterior core, lats, serratus anterior", sets: 3, seconds: 20, rest: 35, sessionMode: "time" },
              { name: "Intermediate Core Ring Tuck Switch", desc: "Explosive knee-tuck switch demanding clean front-side compression.", targets: "Lower abs, hip flexors, trunk control", sets: 4, reps: 6, rest: 50 },
              { name: "Advanced Core Ring Pike Lift and Hold", desc: "Drive into a pike on the rings, pause briefly, then lower without losing shape.", targets: "Lower abs, hip flexors, shoulder stability", sets: 4, reps: 5, rest: 60 },
              { name: "Beginner Legs Ring Assisted Split Bounce", desc: "Use the rings lightly while bouncing through a split stance to learn spring and balance.", targets: "Quads, glutes, calves", sets: 3, reps: 8, rest: 45 },
              { name: "Beginner Legs Ring Lateral Hop Assist", desc: "Supported lateral hop teaching side-to-side force without ugly landings.", targets: "Adductors, glute med, landing control", sets: 3, reps: 8, rest: 45 },
              { name: "Intermediate Legs Ring Reverse Lunge Pop", desc: "Reverse lunge to explosive stand with just enough ring help to stay sharp.", targets: "Quads, glutes, stance drive", sets: 4, reps: 6, rest: 60 },
              { name: "Advanced Legs Ring Skater Rebound", desc: "Single-leg lateral rebound using the rings only as minimal balance support.", targets: "Glute med, adductors, elastic lateral power", sets: 4, reps: 5, rest: 75 },
              { name: "Beginner Stability Ring Push-Up to Knee Drive", desc: "Push-up followed by a controlled knee drive for total-body coordination.", targets: "Chest, core, hip flexors", sets: 3, reps: 6, rest: 45 },
              { name: "Beginner Stability Ring Bear Hover Step", desc: "Low hover position with deliberate step changes to teach ring control and trunk tension.", targets: "Core, shoulders, coordination", sets: 3, seconds: 20, rest: 35, sessionMode: "time" },
              { name: "Intermediate Stability Ring Plank Jack", desc: "Ring plank with feet jumping out and in while the shoulders stay quiet.", targets: "Core, shoulders, adductors", sets: 4, seconds: 20, rest: 40, sessionMode: "time" },
              { name: "Advanced Stability Ring Burpee Row Pop", desc: "Burpee into fast ring row for a demanding full-body power sequence.", targets: "Chest, back, legs, conditioning", sets: 4, reps: 4, rest: 75 },
            ]),
            "Isometric Holds": seedMany("Isometric Holds", structuralSource, [
              { name: "Split Squat Iso Hold", desc: "Long split-squat hold to build lower-body tolerance, alignment, and front-leg control.", targets: "Quads, glutes, adductors, knee control", sets: 3, seconds: 30, rest: 30, sessionMode: "time" },
              { name: "Spanish Squat Iso Hold", desc: "Quad-dominant supported squat hold to load the knees without ugly torso collapse.", targets: "Quads, patellar tendon, knees", sets: 3, seconds: 30, rest: 30, sessionMode: "time" },
              { name: "Wall Sit with Adductor Squeeze", desc: "Wall sit plus squeeze to load the quads while teaching hip-to-knee control.", targets: "Quads, adductors, trunk", sets: 3, seconds: 40, rest: 30, sessionMode: "time" },
              { name: "Single-Leg Calf Raise Hold", desc: "Top-position calf hold for ankle stiffness and balance under one leg.", targets: "Calves, ankles, foot stability", sets: 3, seconds: 20, rest: 20, sessionMode: "time" },
              { name: "Glute Bridge Iso Hold", desc: "Static bridge lockout to teach full glute squeeze and pelvis control.", targets: "Glutes, hamstrings, posterior chain", sets: 3, seconds: 30, rest: 20, sessionMode: "time" },
              { name: "Push-Up Mid Hold", desc: "Pause halfway down to build pressing control and shoulder stability.", targets: "Chest, triceps, anterior core", sets: 3, seconds: 15, rest: 30, sessionMode: "time" },
              { name: "Chin-Up Top Hold", desc: "Hold the top position without shrugging to build scapular and elbow control.", targets: "Lats, biceps, scapular depression", sets: 3, seconds: 12, rest: 40, sessionMode: "time" },
              { name: "Ring Support Hold", desc: "Locked-out ring support to build shoulder packing and full-body tension.", targets: "Shoulder stabilizers, triceps, trunk", sets: 4, seconds: 15, rest: 30, sessionMode: "time" },
              { name: "Hollow Body Iso Hold", desc: "Full-tension anterior-core hold for trunk stiffness and rib control.", targets: "Abs, hip flexors, trunk tension", sets: 3, seconds: 25, rest: 25, sessionMode: "time" },
              { name: "Farmer Hold", desc: "Static heavy carry hold to build grip, posture, and anti-collapse strength.", targets: "Grip, traps, obliques, posture", sets: 3, seconds: 20, rest: 40, sessionMode: "time" },
            ]),
            "Scapula": seedMany("Scapula", structuralSource, [
              { name: "Scap Push-Up Hold", desc: "Top-of-push-up serratus hold with the shoulder blades spread and ribs controlled.", targets: "Serratus anterior, scapular protraction, trunk", sets: 3, seconds: 20, rest: 20, sessionMode: "time" },
              { name: "Scap Push-Up Reps", desc: "Pure shoulder-blade movement to build protraction and retraction awareness.", targets: "Serratus anterior, scapular control", sets: 3, reps: 12, rest: 20 },
              { name: "Scap Pull-Up Hold", desc: "Hang and depress the shoulder blades without bending the elbows.", targets: "Lower traps, lats, shoulder packing", sets: 3, seconds: 12, rest: 30, sessionMode: "time" },
              { name: "Serratus Wall Slide", desc: "Wall-assisted upward rotation drill to keep the shoulders smooth overhead.", targets: "Serratus anterior, lower traps, shoulders", sets: 3, reps: 10, rest: 20 },
              { name: "Prone Trap 3 Raise", desc: "Strict low-angle raise to build lower-trap support and cleaner shoulder blades.", targets: "Lower traps, scapular stability", sets: 3, reps: 10, rest: 20 },
              { name: "Band Scapular Protraction", desc: "Straight-arm reach against a band to train active protraction without shrugging.", targets: "Serratus anterior, scapula, trunk", sets: 3, reps: 12, rest: 20 },
              { name: "Ring Scap Support Circles", desc: "Small controlled circles in ring support to challenge scapular control under instability.", targets: "Scapula, shoulders, triceps", sets: 3, reps: 8, rest: 25 },
              { name: "Low Trap Lift-Off", desc: "Wall or bench lift-off for upward rotation and overhead support without lumbar cheating.", targets: "Lower traps, mid traps, scapular upward rotation", sets: 3, reps: 8, rest: 20 },
            ]),
            "Glutes": seedMany("Glutes", structuralSource, [
              { name: "B-Stance Hip Thrust", desc: "Staggered-stance thrust to bias one glute while keeping hip drive honest.", targets: "Glute max, posterior chain, imbalance correction", sets: 3, reps: 10, rest: 45 },
              { name: "Frog Pumps", desc: "High-tension glute pump to teach full squeeze without lower-back takeover.", targets: "Glute max, hip extension", sets: 3, reps: 20, rest: 30 },
              { name: "Single-Leg Hip Thrust", desc: "Unilateral thrust to improve glute output and left-right balance.", targets: "Glute max, hamstrings, pelvic control", sets: 3, reps: 10, rest: 40 },
              { name: "Banded Clamshell", desc: "Small-range external-rotation work for the side glutes and hip control.", targets: "Glute med, glute min, external rotators", sets: 3, reps: 15, rest: 20 },
              { name: "Standing Cable Hip Abduction", desc: "Controlled abduction for side-glute strength without leaning away.", targets: "Glute med, glute min, balance", sets: 3, reps: 12, rest: 25 },
              { name: "45-Degree Back Extension Glute Bias", desc: "Posterior-chain raise done with a glute lockout focus rather than low-back swing.", targets: "Glutes, hamstrings, posterior chain", sets: 3, reps: 12, rest: 35 },
              { name: "Lateral Step-Down", desc: "Single-leg control drill to build hips and stop the knee caving inward.", targets: "Glute med, quads, knee control", sets: 3, reps: 8, rest: 30 },
              { name: "Side Plank Hip Abduction", desc: "Lift the top leg from a side plank to tie glute med into trunk control.", targets: "Glute med, obliques, lateral chain", sets: 3, reps: 10, rest: 25 },
            ]),
            "Ankles": seedMany("Ankles", structuralSource, [
              { name: "Single-Leg Soleus Raise", desc: "Bent-knee calf raise for the soleus and boxing-friendly ankle stiffness.", targets: "Soleus, calves, ankle stiffness", sets: 3, reps: 15, rest: 20 },
              { name: "Tibialis Raise Hold", desc: "Top-position shin hold to build front-of-lower-leg endurance.", targets: "Tibialis anterior, ankles, gait", sets: 3, seconds: 20, rest: 20, sessionMode: "time" },
              { name: "Ankle Inversion Band Raise", desc: "Band-resisted inversion to support inside-ankle control and foot stability.", targets: "Tibialis posterior, ankles, arch control", sets: 3, reps: 15, rest: 20 },
              { name: "Ankle Eversion Band Raise", desc: "Band-resisted eversion to strengthen the outside ankle and peroneals.", targets: "Peroneals, ankles, lateral stability", sets: 3, reps: 15, rest: 20 },
              { name: "Single-Leg Balance Reach", desc: "Reach pattern that teaches the ankle to hold shape while the trunk moves.", targets: "Foot tripod, ankle stability, balance", sets: 3, reps: 8, rest: 20 },
              { name: "Heel Walk", desc: "Walk on the heels to build the shins and improve foot control.", targets: "Tibialis anterior, ankles, dorsiflexion", sets: 3, seconds: 20, rest: 20, sessionMode: "time" },
              { name: "Toe Walk", desc: "Walk on the toes to strengthen the calves, feet, and lower-leg stiffness.", targets: "Calves, feet, ankles", sets: 3, seconds: 20, rest: 20, sessionMode: "time" },
              { name: "Pogo Hold to Bounce", desc: "Start with a stiff ankle hold and release into short pogo contacts.", targets: "Ankles, calves, elastic stiffness", sets: 3, reps: 12, rest: 25 },
            ]),
            "Knees": seedMany("Knees", structuralSource, [
              { name: "Terminal Knee Extension", desc: "Band TKE to build clean lockout and wake up the VMO around the knee.", targets: "VMO, knee lockout, quads", sets: 3, reps: 15, rest: 20 },
              { name: "Peterson Step-Up", desc: "Small deficit step-up for VMO strength and better knee tracking.", targets: "VMO, quads, knee control", sets: 3, reps: 10, rest: 25 },
              { name: "Eccentric Step-Down", desc: "Slow lower off a step to build knee control and deceleration strength.", targets: "Quads, glutes, knees", sets: 3, reps: 8, rest: 25 },
              { name: "Spanish Squat Reps", desc: "Supported squat pattern that loads the quads heavily while sparing the hips.", targets: "Quads, knees, patellar tendon", sets: 3, reps: 12, rest: 30 },
              { name: "Reverse Nordic", desc: "Knee-dominant quad drill to build front-thigh resilience and length under load.", targets: "Quads, knees, hip extension control", sets: 3, reps: 8, rest: 30 },
              { name: "Poliquin Step-Up", desc: "Toe-elevated step-up pattern to challenge VMO and knee-over-toe strength.", targets: "VMO, quads, ankles", sets: 3, reps: 8, rest: 25 },
              { name: "Split Squat Knee Drive", desc: "Split squat with an active finish through the front knee and hip.", targets: "Quads, glutes, knee tracking", sets: 3, reps: 10, rest: 25 },
              { name: "Sissy Squat Hold", desc: "Short-range hold to load the quads and teach the knees to tolerate forward travel.", targets: "Quads, knees, trunk tension", sets: 3, seconds: 15, rest: 25, sessionMode: "time" },
            ]),
            "Shoulders": seedMany("Shoulders", structuralSource, [
              { name: "Bottom-Up Kettlebell Press", desc: "Press with the bell upside down to force shoulder stacking and grip irradiation.", targets: "Shoulders, rotator cuff, grip", sets: 3, reps: 6, rest: 40 },
              { name: "Half-Kneeling Landmine Press", desc: "Single-arm angled press that teaches rib control and shoulder drive.", targets: "Shoulders, serratus anterior, trunk", sets: 3, reps: 8, rest: 35 },
              { name: "Single-Arm Overhead Carry", desc: "Walk with one arm locked overhead to build stacked shoulders and anti-lean control.", targets: "Shoulder stability, obliques, posture", sets: 3, seconds: 25, rest: 25, sessionMode: "time" },
              { name: "Cuban Rotation", desc: "External rotation plus press pattern for shoulder prep and cuff strength.", targets: "Rotator cuff, rear delts, shoulders", sets: 3, reps: 10, rest: 25 },
              { name: "External Rotation at 90 Degrees", desc: "Cuff work at the 90-90 position for punchers and overhead athletes.", targets: "Rotator cuff, rear shoulder, stability", sets: 3, reps: 12, rest: 20 },
              { name: "Single-Arm Lateral Raise Hold", desc: "Top-position hold to improve deltoid control and side-to-side symmetry.", targets: "Medial delts, shoulder control", sets: 3, seconds: 15, rest: 20, sessionMode: "time" },
            ]),
            "Neck": seedMany("Neck", structuralSource, [
              { name: "Supine Neck Lift", desc: "Lift the head slightly off the floor and hold without jutting the chin.", targets: "Deep neck flexors, posture", sets: 3, seconds: 15, rest: 20, sessionMode: "time" },
              { name: "Prone Neck Extension Lift", desc: "Light prone lift for the back of the neck with no shrugging.", targets: "Neck extensors, posture", sets: 3, seconds: 15, rest: 20, sessionMode: "time" },
              { name: "Rotational Neck Isometric", desc: "Resist gentle rotation by hand pressure without twisting through the shoulders.", targets: "Neck rotators, cervical control", sets: 3, seconds: 12, rest: 20, sessionMode: "time" },
              { name: "Four-Way Neck Manual Series", desc: "Front, back, and both sides in one manual resistance series for balanced neck strength.", targets: "Neck flexors, extensors, lateral stabilizers", sets: 2, reps: 4, rest: 25 },
            ]),
            "Hip Flexors": seedMany("Hip Flexors", structuralSource, [
              { name: "Hanging Straight-Leg Hold", desc: "Hang and hold the legs up to build true front-side compression.", targets: "Hip flexors, lower abs, grip", sets: 3, seconds: 12, rest: 25, sessionMode: "time" },
              { name: "Seated Pike Leg Lift", desc: "Lift the heels off the floor in a pike sit without leaning back.", targets: "Hip flexors, lower abs, quad tie-in", sets: 3, reps: 10, rest: 20 },
              { name: "Supported Psoas March", desc: "March one knee high at a time with posture support and no trunk sway.", targets: "Hip flexors, lower abs, single-leg balance", sets: 3, reps: 12, rest: 20 },
              { name: "Dead Bug Iso Press", desc: "Dead-bug variation with a hard opposite-side press to challenge hip flexor control.", targets: "Hip flexors, abs, cross-body control", sets: 3, reps: 8, rest: 20 },
              { name: "Standing Knee Drive Switch", desc: "Fast alternating knee-drive drill with tall posture and clean foot strike.", targets: "Hip flexors, footwork, coordination", sets: 3, seconds: 20, rest: 20, sessionMode: "time" },
              { name: "L-Sit Tuck Hold", desc: "Short tucked L-sit to harden the hip flexors and trunk together.", targets: "Hip flexors, abs, shoulder support", sets: 3, seconds: 12, rest: 25, sessionMode: "time" },
            ]),
            "Singles": seedMany("Singles", singlesSource, [
              { name: "Single-Arm Dumbbell Bench Press", desc: "One-arm bench press for chest strength and trunk anti-rotation.", targets: "Chest, triceps, anti-rotation core", sets: 3, reps: 8, rest: 35 },
              { name: "Single-Arm Floor Press", desc: "Floor press version for pressing balance and safer shoulder range.", targets: "Chest, triceps, shoulder stability", sets: 3, reps: 8, rest: 30 },
              { name: "Single-Arm Overhead Press", desc: "One-arm vertical press to expose rib flare, shoulder drift, and side-to-side differences.", targets: "Shoulders, triceps, trunk control", sets: 3, reps: 8, rest: 35 },
              { name: "Single-Arm Landmine Press", desc: "Angled unilateral press that teaches one-side drive without spinal drift.", targets: "Shoulders, upper chest, obliques", sets: 3, reps: 8, rest: 30 },
              { name: "Single-Arm Dumbbell Row", desc: "Supported one-arm row to clean up scapular rhythm and pulling asymmetry.", targets: "Lats, rhomboids, rear delts", sets: 3, reps: 10, rest: 30 },
              { name: "Single-Arm Cable Row", desc: "Row one side at a time so the trunk and scapula cannot hide imbalances.", targets: "Lats, rhomboids, anti-rotation core", sets: 3, reps: 10, rest: 30 },
              { name: "Single-Arm Lat Pulldown", desc: "One-side pulldown to clean up scapular depression and left-right pulling strength.", targets: "Lats, lower traps, biceps", sets: 3, reps: 10, rest: 30 },
              { name: "Single-Arm Cable Fly", desc: "One-side fly to expose control differences through the chest and front shoulder.", targets: "Chest, front delts, anti-rotation core", sets: 3, reps: 10, rest: 25 },
              { name: "Single-Arm Farmer Carry", desc: "Carry one side only to expose and fix trunk and grip imbalances.", targets: "Grip, obliques, posture", sets: 3, seconds: 25, rest: 25, sessionMode: "time" },
              { name: "Single-Arm Overhead Carry", desc: "Unilateral overhead carry for shoulder integrity and rib control.", targets: "Shoulders, obliques, posture", sets: 3, seconds: 20, rest: 25, sessionMode: "time" },
              { name: "Single-Leg Box Squat", desc: "Controlled single-leg sit-back squat for lower-body symmetry and knee control.", targets: "Quads, glutes, knee control", sets: 3, reps: 6, rest: 35 },
              { name: "Single-Leg Heel-Elevated Squat", desc: "Supported single-leg squat variation for quad bias and ankle freedom.", targets: "Quads, glutes, ankles", sets: 3, reps: 6, rest: 35 },
              { name: "Single-Leg Split Squat", desc: "Rear-foot-free split squat focusing on front-leg drive and imbalance cleanup.", targets: "Quads, glutes, adductors", sets: 3, reps: 8, rest: 30 },
              { name: "Single-Leg Heel-Elevated Split Squat", desc: "Quad-biased split squat variation for front-leg knee travel and balance.", targets: "Quads, glutes, knees", sets: 3, reps: 8, rest: 30 },
              { name: "Single-Leg Romanian Deadlift", desc: "One-leg hinge for hamstrings, glutes, and foot control.", targets: "Hamstrings, glutes, foot stability", sets: 3, reps: 8, rest: 30 },
              { name: "Single-Leg Step-Up Drive", desc: "Drive up and finish tall on one leg to improve asymmetry and front-side power.", targets: "Quads, glutes, hip flexors", sets: 3, reps: 8, rest: 30 },
              { name: "Single-Leg Hip Thrust", desc: "One-leg bridge thrust for glute asymmetry and pelvic control.", targets: "Glutes, hamstrings, pelvis control", sets: 3, reps: 10, rest: 25 },
              { name: "Single-Leg Hamstring Bridge", desc: "Heel-driven unilateral bridge to strengthen the back side one leg at a time.", targets: "Hamstrings, glutes, calves", sets: 3, reps: 10, rest: 25 },
              { name: "Single-Leg Calf Raise", desc: "Full-range calf raise to expose ankle and lower-leg imbalances.", targets: "Calves, ankles, foot pressure", sets: 3, reps: 15, rest: 20 },
              { name: "Single-Leg Leg Press", desc: "Machine single-leg press to load one side cleanly without balance becoming the limiter.", targets: "Quads, glutes, adductors", sets: 3, reps: 10, rest: 35 },
              { name: "Single-Leg Reverse Lunge", desc: "One-side reverse lunge for balance, symmetry, and deceleration control.", targets: "Quads, glutes, adductors", sets: 3, reps: 8, rest: 30 },
              { name: "Single-Arm Pallof Press", desc: "Press one handle away and resist rotation to expose trunk-side differences.", targets: "Obliques, trunk, anti-rotation control", sets: 3, reps: 10, rest: 25 },
            ]),
            "RAMP": seedMany("RAMP", warmupSource, [
              { name: "Fast Feet March", desc: "Quick front-side march to wake up rhythm and body temperature without overcooking the session.", targets: "Hip flexors, calves, rhythm", sets: 3, seconds: 20, rest: 15, sessionMode: "time" },
              { name: "Carioca Step", desc: "Cross-step pattern to raise temperature and prepare the hips for rotational sport work.", targets: "Hips, coordination, lateral rhythm", sets: 3, seconds: 20, rest: 15, sessionMode: "time" },
              { name: "Band Pull-Apart Pulse", desc: "Short upper-back activation to switch on posture before pressing or punching.", targets: "Rear delts, rhomboids, mid traps", sets: 2, reps: 15, rest: 15 },
              { name: "Monster Walk", desc: "Banded walk to activate glutes and knee tracking before squats or footwork.", targets: "Glute med, glute max, knees", sets: 2, steps: 12, reps: 12, rest: 15 },
              { name: "Calf Bounce Series", desc: "Short elastic calf series to build spring before skipping, running, or ring plyos.", targets: "Calves, Achilles stiffness, foot rhythm", sets: 3, seconds: 20, rest: 15, sessionMode: "time" },
              { name: "Hip Open Step-Through", desc: "Step-through pattern to open hips and keep the pelvis moving cleanly.", targets: "Hip flexors, adductors, balance", sets: 2, reps: 8, rest: 15 },
              { name: "Reverse Lunge Reach", desc: "Reverse lunge with overhead reach to connect hips, trunk, and shoulders.", targets: "Quads, glutes, thoracic lift", sets: 2, reps: 8, rest: 15 },
              { name: "Tall Kneel Halo", desc: "Tall-kneeling halo to switch on trunk control and shoulder movement without cheating through the lower back.", targets: "Core, shoulders, thoracic control", sets: 2, reps: 8, rest: 15 },
              { name: "Lateral Lunge Reach", desc: "Open the groin and prepare side movement before agility or boxing drills.", targets: "Adductors, glutes, ankle mobility", sets: 2, reps: 8, rest: 15 },
              { name: "Snap-Down to Stance", desc: "Athletic snap-down into a stable stance to prime braking and body awareness.", targets: "Trunk stiffness, hips, landing mechanics", sets: 3, reps: 6, rest: 20 },
            ]),
            "Mobility": seedMany("Mobility", warmupSource, [
              { name: "90-90 Hover Switch", desc: "Lift the knees slightly while switching 90-90 positions to own hip rotation rather than just falling through it.", targets: "Hip rotation, glutes, trunk control", sets: 2, reps: 6, rest: 15 },
              { name: "Shin Box Get-Up", desc: "Flow from the shin box into a tall get-up to open hips and build control.", targets: "Hips, obliques, thoracic mobility", sets: 2, reps: 6, rest: 15 },
              { name: "Thoracic Bridge Reach", desc: "Open the chest and mid-back while coordinating the hips underneath.", targets: "Thoracic spine, shoulders, glutes", sets: 2, reps: 6, rest: 15 },
              { name: "Hamstring Sweep Walk", desc: "Walking sweep pattern to loosen hamstrings before running or lower-body work.", targets: "Hamstrings, calves, posterior chain", sets: 2, reps: 10, rest: 15 },
              { name: "Knee-to-Wall Dorsiflexion Hold", desc: "Loaded ankle opener that improves squat depth and boxing bounce.", targets: "Ankles, calves, dorsiflexion", sets: 2, seconds: 30, rest: 15, sessionMode: "time" },
              { name: "Lat Prayer Reach", desc: "Bench or floor prayer stretch to free the lats and overhead line.", targets: "Lats, triceps, thoracic opening", sets: 2, seconds: 30, rest: 15, sessionMode: "time" },
              { name: "Wrist Flexor Rock", desc: "Gentle wrist prep for push-ups, rings, and bag work.", targets: "Wrists, forearms, hand support", sets: 2, reps: 10, rest: 10 },
              { name: "Wall Hip Lock Hold", desc: "Sprint-pattern hip lock to open the stance leg and teach stacked posture.", targets: "Hip flexors, glutes, foot pressure", sets: 2, seconds: 20, rest: 15, sessionMode: "time" },
              { name: "Cossack Shift Flow", desc: "Shift side to side through the Cossack pattern to open groin and ankles.", targets: "Adductors, ankles, hips", sets: 2, reps: 8, rest: 15 },
              { name: "Scap Wall Slide Lift-Off", desc: "Wall slide into a small lift-off for cleaner upward rotation and shoulder position.", targets: "Serratus anterior, lower traps, shoulders", sets: 2, reps: 8, rest: 15 },
            ]),
            "Boxing RAMP": seedMany("Boxing RAMP", boxingSource, [
              { name: "Boxer Bounce Ladder", desc: "Escalating stance bounce to wake up calves, posture, and ring rhythm.", targets: "Bounce, calves, guard posture", sets: 4, seconds: 20, rest: 15, sessionMode: "time" },
              { name: "Lead-Hand Flash Series", desc: "Fast lead-hand flashes to warm the shoulder and sharpen touch timing.", targets: "Lead shoulder, timing, hand speed", sets: 3, seconds: 20, rest: 15, sessionMode: "time" },
              { name: "Rear-Hand Snap Series", desc: "Loose rear straight reps emphasizing fast recoil and chin cover.", targets: "Rear shoulder, straight mechanics, guard return", sets: 3, seconds: 20, rest: 15, sessionMode: "time" },
              { name: "Quarter-Turn Jab Pulse", desc: "Small jab bursts with quarter turns to prepare scoring exits.", targets: "Foot pivots, jabs, exits", sets: 3, seconds: 25, rest: 15, sessionMode: "time" },
              { name: "Check Hook Foot Prep", desc: "Lead-hook foot pattern without loading the shoulders too early.", targets: "Lead hook mechanics, pivots, balance", sets: 3, reps: 8, rest: 15 },
              { name: "Slip-Slip-Reset Pulse", desc: "Head movement primer that brings the eyes back to center every time.", targets: "Defense rhythm, knees, obliques", sets: 3, seconds: 25, rest: 15, sessionMode: "time" },
              { name: "Touch-and-Go Scoring Burst", desc: "Short scoring bursts that finish with a disciplined reset instead of a brawl.", targets: "Amateur scoring, hand speed, control", sets: 4, seconds: 15, rest: 20, sessionMode: "time" },
              { name: "Guard Rebuild March", desc: "March in stance while rebuilding the guard after each short burst.", targets: "Guard discipline, shoulders, feet", sets: 3, seconds: 25, rest: 15, sessionMode: "time" },
              { name: "Roll and Step-Out Primer", desc: "Roll under and leave on angle to prepare defensive exits.", targets: "Defense, exits, ring awareness", sets: 3, reps: 6, rest: 20 },
              { name: "Final Nervous System Switch-On", desc: "Last short sharp burst before the session starts proper.", targets: "Readiness, speed, focus", sets: 1, seconds: 90, rest: 0, sessionMode: "time" },
            ]),
            "England Boxing Warm-Up": seedMany("England Boxing Warm-Up", boxingSource, [
              { name: "England Boxing Walk-In Pulse", desc: "Short activation series you could use after gloving up and before the bell.", targets: "Breathing, bounce, focus", sets: 2, seconds: 45, rest: 15, sessionMode: "time" },
              { name: "Lead Foot Claim Warm-Up", desc: "Warm-up round built around owning the lead-foot position without overreaching.", targets: "Lead-foot battle, stance awareness, balance", sets: 3, seconds: 45, rest: 15, sessionMode: "time" },
              { name: "Double Jab and Leave", desc: "Score with the double jab, leave on angle, and reset with your eyes up.", targets: "Lead-hand scoring, exits, discipline", sets: 3, seconds: 45, rest: 15, sessionMode: "time" },
              { name: "Block-Parry Wake-Up", desc: "Simple block and parry rehearsal to sharpen guard reactions before harder rounds.", targets: "Defense, guard, reaction quality", sets: 3, seconds: 40, rest: 15, sessionMode: "time" },
              { name: "Scoring Exit Warm-Up", desc: "Every short combination ends with a clean amateur-style exit.", targets: "Scoring, exits, posture", sets: 3, seconds: 45, rest: 15, sessionMode: "time" },
              { name: "England Boxing Ring Circle", desc: "Circle the imaginary ring, score, and relocate without crossing your feet.", targets: "Ring craft, feet, composure", sets: 3, seconds: 60, rest: 20, sessionMode: "time" },
              { name: "Southpaw Mirror Prep", desc: "Warm-up drill for seeing the mirror-stance puzzle before sparring or pads.", targets: "Adaptation, foot placement, reads", sets: 2, seconds: 60, rest: 20, sessionMode: "time" },
              { name: "Touch High Score Low Warm-Up", desc: "Show high, land low, and keep the tempo crisp and relaxed.", targets: "Level changes, setups, scoring control", sets: 3, seconds: 45, rest: 15, sessionMode: "time" },
              { name: "Round-One Sharpener", desc: "Final primer designed to start the first round sharp rather than sleepy.", targets: "Start speed, focus, intent", sets: 1, seconds: 90, rest: 0, sessionMode: "time" },
              { name: "Corner Reset Rehearsal", desc: "Practice hearing the corner, breathing, and leaving the stool mentally composed.", targets: "Composure, reset breathing, discipline", sets: 2, seconds: 45, rest: 20, sessionMode: "time" },
            ]),
            "STRETCHES": seedMany("STRETCHES", warmupSource, [
              { name: "Adductor Side Lunge Stretch", desc: "Long side-lunge hold to open the groin after footwork and lower-body work.", targets: "Adductors, groin, hips", sets: 2, seconds: 30, rest: 10, sessionMode: "time" },
              { name: "Soleus Wall Stretch", desc: "Bent-knee calf stretch for the lower calf and ankle recovery.", targets: "Soleus, ankles, calves", sets: 2, seconds: 30, rest: 10, sessionMode: "time" },
              { name: "Biceps Wall Stretch", desc: "Open the front of the arm and chest after lots of guard tension or pressing.", targets: "Biceps, front shoulder, chest", sets: 2, seconds: 30, rest: 10, sessionMode: "time" },
              { name: "Wrist Prayer Stretch", desc: "Simple wrist decompression after bag work, rings, or floor work.", targets: "Wrists, forearms", sets: 2, seconds: 30, rest: 10, sessionMode: "time" },
              { name: "Seated Figure Four Fold", desc: "Fold gently over the shin to open the glutes and posterior hip.", targets: "Glutes, piriformis, hips", sets: 2, seconds: 40, rest: 10, sessionMode: "time" },
              { name: "Thoracic Bench Opener", desc: "Bench-supported chest and thoracic opener after punching or pressing volume.", targets: "Thoracic spine, chest, lats", sets: 2, seconds: 30, rest: 10, sessionMode: "time" },
            ]),
            "Cool Down": seedMany("Cool Down", warmupSource, [
              { name: "Walk and Shake", desc: "Light walk paired with relaxed arm shakeout to let the session leave your body.", targets: "Recovery circulation, shoulders, forearms", sets: 1, seconds: 90, rest: 0, sessionMode: "time" },
              { name: "Long Exhale March", desc: "Slow march with long exhales to bring the heart rate down without collapsing.", targets: "Breathing, posture, downshift", sets: 1, seconds: 60, rest: 0, sessionMode: "time" },
              { name: "Crocodile Breathing", desc: "Prone breathing reset to calm the trunk and nervous system after hard effort.", targets: "Diaphragm, recovery breathing, lower ribs", sets: 1, seconds: 90, rest: 0, sessionMode: "time" },
              { name: "Feet Elevated Nasal Recovery", desc: "Feet-up nasal breathing to slow the system down before leaving training.", targets: "Recovery, stress reduction, breathing", sets: 1, seconds: 120, rest: 0, sessionMode: "time" },
              { name: "Forearm Flush", desc: "Open-close hand pumping and gentle wrist circles after bag work or rings.", targets: "Forearms, wrists, recovery", sets: 2, seconds: 30, rest: 10, sessionMode: "time" },
              { name: "Jaw and Face Relax Reset", desc: "Consciously unclench the jaw and relax the face while breathing slowly.", targets: "Relaxation, parasympathetic downshift", sets: 2, seconds: 30, rest: 10, sessionMode: "time" },
              { name: "Seated Boxer's Fold", desc: "Simple seated fold with long exhale to let the back and hips soften after rounds.", targets: "Hamstrings, lower back, relaxation", sets: 2, seconds: 30, rest: 10, sessionMode: "time" },
              { name: "Shoulder Blade Slide Reset", desc: "Very easy wall slide to finish with clean shoulder position rather than tension.", targets: "Shoulders, upper back, posture", sets: 2, reps: 8, rest: 10 },
            ]),
            "Boxing": seedMany("Boxing", boxingSource, [
              { name: "England Boxing Tempo Session", desc: "Three scoring speeds in one round: patient, sharp, then urgent without brawling.", targets: "Pacing, scoring, composure", sets: 3, seconds: 180, rest: 45, sessionMode: "time" },
              { name: "Lead-Hand Command Session", desc: "Control the session using only the jab, touch, frame, and lead hook threats.", targets: "Lead-hand authority, range control, patience", sets: 3, seconds: 180, rest: 45, sessionMode: "time" },
              { name: "Step-In Score Step-Out Session", desc: "Enter only when ready, score clean, and leave every exchange with discipline.", targets: "Entries, exits, scoring clarity", sets: 3, seconds: 150, rest: 45, sessionMode: "time" },
              { name: "Body Work Investment Session", desc: "Invest in the body early so the head work becomes easier later.", targets: "Body attacks, tempo management, setup thinking", sets: 3, seconds: 180, rest: 45, sessionMode: "time" },
              { name: "Counter and Move Session", desc: "Every clean answer is followed by a move so you never stay for the trade.", targets: "Counters, exits, ring IQ", sets: 3, seconds: 150, rest: 45, sessionMode: "time" },
              { name: "Southpaw Adjustment Session", desc: "Session focused on foot placement, lead-hand battle, and outside-angle awareness.", targets: "Southpaw tactics, feet, reads", sets: 3, seconds: 150, rest: 45, sessionMode: "time" },
              { name: "Pressure Without Smothering", desc: "Walk forward with purpose while keeping just enough space to punch properly.", targets: "Pressure, distance control, balance", sets: 3, seconds: 180, rest: 45, sessionMode: "time" },
              { name: "Amateur Ring Generalship Session", desc: "Win the geography of the ring and make the other person work harder to set.", targets: "Ring control, scoring positions, efficiency", sets: 3, seconds: 180, rest: 45, sessionMode: "time" },
              { name: "Defend First Then Score", desc: "Defensive read first, scoring second, with no emotional rushback.", targets: "Defensive discipline, decision quality, counters", sets: 3, seconds: 150, rest: 45, sessionMode: "time" },
              { name: "Final Round Close-Out Session", desc: "Practice finishing the session like you are stealing the bout late.", targets: "Urgency, finish mentality, visible scoring", sets: 2, seconds: 180, rest: 45, sessionMode: "time" },
            ]),
            "Shadow Boxing": seedMany("Shadow Boxing", boxingSource, [
              { name: "Three-Level Jab Round", desc: "Touch high, middle, and body targets with the jab while keeping the feet under you.", targets: "Level changes, jab variety, balance", sets: 3, seconds: 120, rest: 30, sessionMode: "time" },
              { name: "Post and Pivot Round", desc: "Post the lead hand, pivot off, and build exits into every exchange.", targets: "Posts, pivots, exits", sets: 3, seconds: 120, rest: 30, sessionMode: "time" },
              { name: "Half-Beat Delay Round", desc: "Throw the first shot, pause a fraction, then finish once the guard reacts.", targets: "Rhythm breaks, timing, setups", sets: 3, seconds: 120, rest: 30, sessionMode: "time" },
              { name: "Body Feint Body Shot Round", desc: "Sell one body lane and attack the other while staying compact.", targets: "Feints, body attacks, close control", sets: 3, seconds: 120, rest: 30, sessionMode: "time" },
              { name: "Southpaw Exit Round", desc: "Practice leaving to the correct side against a southpaw picture.", targets: "Foot placement, exits, tactical awareness", sets: 3, seconds: 120, rest: 30, sessionMode: "time" },
              { name: "False Reset Round", desc: "Pretend to reset, then re-enter with a sharp scoring shot before the imaginary opponent settles.", targets: "Deception, re-entry timing, ring craft", sets: 3, seconds: 120, rest: 30, sessionMode: "time" },
              { name: "Double Jab Frame Round", desc: "Use the second jab as a frame and decide whether to leave, angle, or continue.", targets: "Lead-hand control, frames, decisions", sets: 3, seconds: 120, rest: 30, sessionMode: "time" },
              { name: "Counter Hook Shadow Round", desc: "Read the imagined cross and answer with a balanced lead hook.", targets: "Counter hooks, balance, defense into offense", sets: 3, seconds: 120, rest: 30, sessionMode: "time" },
              { name: "Pull and Stab Round", desc: "Pull just out of range and stab the jab or cross back into the lane.", targets: "Pull counter timing, straight punching", sets: 3, seconds: 120, rest: 30, sessionMode: "time" },
              { name: "Corner Escape Shadow Round", desc: "Work on escaping the corner with pivots, posts, and disciplined feet.", targets: "Corner escapes, footwork, composure", sets: 3, seconds: 120, rest: 30, sessionMode: "time" },
            ]),
            "Bag Work": seedMany("Bag Work", boxingSource, [
              { name: "Jab-Only Distance Mapping", desc: "Spend a round learning the bag range with nothing but the jab.", targets: "Distance control, lead hand, patience", sets: 3, seconds: 120, rest: 30, sessionMode: "time" },
              { name: "One-Two and Angle Round", desc: "Land the straight pair, then step off to a fresh lane every time.", targets: "Straight punching, angles, exits", sets: 3, seconds: 150, rest: 45, sessionMode: "time" },
              { name: "Touch High Rip Low Round", desc: "Fast high touch followed by invested body work while staying compact.", targets: "Level changes, body-head flow, setups", sets: 3, seconds: 150, rest: 45, sessionMode: "time" },
              { name: "Three Shot Rule Round", desc: "Never throw more than three before moving so the round stays intelligent.", targets: "Discipline, exits, shot selection", sets: 3, seconds: 120, rest: 30, sessionMode: "time" },
              { name: "Post, Hook, Pivot Round", desc: "Post the bag, hook around the post, and pivot out.", targets: "Posts, lead hooks, pivots", sets: 3, seconds: 120, rest: 30, sessionMode: "time" },
              { name: "Body Jab to Rear Uppercut Round", desc: "Change levels sharply and come through the middle before resetting.", targets: "Body jab, uppercut timing, compact flow", sets: 3, seconds: 120, rest: 30, sessionMode: "time" },
              { name: "Shoulder Feint and Cross Round", desc: "Sell the shoulder, let the guard react, and land the rear straight clean.", targets: "Feints, rear hand, scoring clarity", sets: 3, seconds: 120, rest: 30, sessionMode: "time" },
              { name: "Fast Hands Last 15", desc: "Controlled work for most of the round, then a sharp last-fifteen-second finish.", targets: "Pacing, hand speed, strong finishes", sets: 4, seconds: 105, rest: 30, sessionMode: "time" },
              { name: "Inside Bump and Work Round", desc: "Bump into pocket range, work short shots, then slide out again.", targets: "Inside work, pocket balance, exits", sets: 3, seconds: 120, rest: 30, sessionMode: "time" },
              { name: "Jab Recover Repeat Round", desc: "Every punch sequence ends with the jab returning you to control.", targets: "Jab discipline, recovery, ring calm", sets: 3, seconds: 150, rest: 45, sessionMode: "time" },
            ]),
            "Boxing Combinations": seedMany("Boxing Combinations", comboSource, [
              { name: "1-2-1 Return", desc: "Cross lands, then the jab returns you to command.", targets: "Straight rhythm, reset jab", sets: 3, reps: 10, rest: 20 },
              { name: "1-1-2-3 Score and Leave", desc: "Double jab, cross, hook, then get off the line.", targets: "Lead-hand setup, exits, combination flow", sets: 3, reps: 8, rest: 20 },
              { name: "1-2-5-2 Lift the Guard", desc: "Straight-straight-hook-cross to move the guard and finish hard.", targets: "Guard manipulation, sequencing", sets: 3, reps: 8, rest: 20 },
              { name: "1-6-2 Middle Lane", desc: "Jab, rear uppercut, cross for compact inside-off-the-jab flow.", targets: "Uppercut entry, compact power", sets: 3, reps: 8, rest: 20 },
              { name: "2-3-6-3 Pocket Chain", desc: "Cross-hook-uppercut-hook while staying tight and balanced.", targets: "Pocket work, hooks, uppercuts", sets: 3, reps: 8, rest: 20 },
              { name: "1 to Body 2 to Head", desc: "Split levels cleanly with straight punches.", targets: "Level changes, straight accuracy", sets: 3, reps: 8, rest: 20 },
              { name: "3-2-Roll-3-2", desc: "Hook-cross, roll under the return, then hook-cross again.", targets: "Defense inside combinations, rhythm", sets: 3, reps: 6, rest: 20 },
              { name: "1-1-Body Jab-3", desc: "Use repeated lead-hand touches to open the lead hook.", targets: "Lead-hand setups, body jabs, hooks", sets: 3, reps: 8, rest: 20 },
              { name: "2-3-2 and Pivot", desc: "Classic cross-hook-cross followed by an immediate angle change.", targets: "Pressure scoring, pivots, exits", sets: 3, reps: 8, rest: 20 },
              { name: "1-2-3-6", desc: "Straight-straight-hook-uppercut for close-range finishing.", targets: "Combination finishers, pocket control", sets: 3, reps: 8, rest: 20 },
              { name: "1-2-Slip-3", desc: "Punch, slip the reply, then land the lead hook.", targets: "Defense into offense, timing", sets: 3, reps: 8, rest: 20 },
              { name: "3-Body-3-Head", desc: "Hook the body twice, then come upstairs on the final hook.", targets: "Body-head transitions, hook control", sets: 3, reps: 8, rest: 20 },
              { name: "Lead Uppercut Rear Cross Lead Hook", desc: "Lead-side uppercut entry into a clean finishing chain.", targets: "Uppercut entries, close-range sequencing", sets: 3, reps: 8, rest: 20 },
              { name: "Double Jab Cross Roll Cross", desc: "Score with the jab twice, cross, roll, and come back with the cross.", targets: "Straight scoring, defensive rhythm", sets: 3, reps: 8, rest: 20 },
            ]),
            "Boxing Feints": seedMany("Boxing Feints", comboSource, [
              { name: "Jab Show to Body Jab", desc: "Make the guard rise before you stab the body.", targets: "Lead-hand feints, body scoring", sets: 3, reps: 8, rest: 20 },
              { name: "Shoulder Twitch to Lead Hook", desc: "Sell the rear hand threat and bring the hook around the side.", targets: "Shoulder feints, hook timing", sets: 3, reps: 8, rest: 20 },
              { name: "Foot Stomp Feint to Cross", desc: "Small step or stomp cue to freeze the feet before the rear straight lands.", targets: "Foot feints, rear-hand setups", sets: 3, reps: 8, rest: 20 },
              { name: "Glove Touch Feint to Exit Jab", desc: "Touch the glove line, then score on the leave rather than the entry.", targets: "Touch feints, scoring exits", sets: 3, reps: 8, rest: 20 },
              { name: "Hip Dip Feint to Uppercut", desc: "Dip the hips as if to body attack, then come through the middle.", targets: "Level feints, uppercut openings", sets: 3, reps: 8, rest: 20 },
              { name: "Eye Feint to Cross Hook", desc: "Eyes sell one lane while the actual work comes through another.", targets: "Visual deception, two-shot setups", sets: 3, reps: 8, rest: 20 },
              { name: "False Reset Feint to 1-2", desc: "Pretend to settle, then re-enter before the opponent resets.", targets: "Reset deception, re-entry timing", sets: 3, reps: 8, rest: 20 },
              { name: "Half-Step Draw to Counter Hook", desc: "Half-step back to invite the shot, then return with the hook.", targets: "Draws, counter hooks, distance reads", sets: 3, reps: 8, rest: 20 },
            ]),
            "Boxing Psychology": seedMany("Boxing Psychology", psychologySource, [
              { name: "Own the Tempo Round", desc: "Decide the pace rather than inheriting it from the other person.", targets: "Tempo ownership, composure, leadership", sets: 2, seconds: 180, rest: 45, sessionMode: "time" },
              { name: "Score Not Impress Round", desc: "Choose the clean scoring shot over the flashy one every time.", targets: "Discipline, judging awareness, restraint", sets: 2, seconds: 180, rest: 45, sessionMode: "time" },
              { name: "Calm Eyes Under Pressure", desc: "Keep the visual field wide and the mind calm as the exchange speeds up.", targets: "Vision, composure, decision quality", sets: 2, seconds: 150, rest: 45, sessionMode: "time" },
              { name: "Silence After Success", desc: "Do not emotionally chase after landing something good; stay intelligent.", targets: "Emotional control, maturity, patience", sets: 2, seconds: 150, rest: 45, sessionMode: "time" },
              { name: "First Minute Authority", desc: "Start sharp without panicking so the round opens on your terms.", targets: "Starts, confidence, structure", sets: 2, seconds: 120, rest: 30, sessionMode: "time" },
              { name: "Recover Fast After Errors", desc: "When a mistake happens, reset immediately and continue with no drama.", targets: "Resilience, reset speed, professionalism", sets: 2, seconds: 150, rest: 45, sessionMode: "time" },
              { name: "Controlled Aggression Round", desc: "Bring intent without leaking shape, breath, or judgment.", targets: "Aggression control, intent, composure", sets: 2, seconds: 180, rest: 45, sessionMode: "time" },
              { name: "See the Other Person Fade", desc: "Train yourself to notice changes in posture, breathing, and urgency.", targets: "Observation, fight IQ, timing", sets: 2, seconds: 150, rest: 45, sessionMode: "time" },
            ]),
            "Boxing Tactics": seedMany("Boxing Tactics", tacticsSource, [
              { name: "Jab the Chest to Freeze Feet", desc: "Use the chest jab to interrupt rhythm and stop the feet from setting.", targets: "Distance control, disruption, lead hand", sets: 3, reps: 10, rest: 20 },
              { name: "Post and Draw", desc: "Post the lead hand and wait for the reaction before deciding the next shot.", targets: "Posts, traps, reactions", sets: 3, reps: 8, rest: 20 },
              { name: "Show Exit Then Re-Enter", desc: "Sell the idea that you are leaving, then score again before the reset completes.", targets: "Deception, re-entry timing, ring craft", sets: 3, reps: 8, rest: 20 },
              { name: "Touch High Score Low", desc: "Hand high first, score low second, and keep the body under you.", targets: "Level manipulation, setups, balance", sets: 3, reps: 8, rest: 20 },
              { name: "Touch Low Bring High", desc: "Invest low so the guard starts thinking about the body before the head shot arrives.", targets: "Body-head setups, timing", sets: 3, reps: 8, rest: 20 },
              { name: "Half-Beat Delay Trap", desc: "Pause just long enough for the defense to open itself.", targets: "Rhythm traps, timing, composure", sets: 3, reps: 8, rest: 20 },
              { name: "Blind-Side Step Outside the Jab", desc: "Move your lead foot outside and score from a cleaner lane.", targets: "Foot placement, jab angles, positioning", sets: 3, reps: 8, rest: 20 },
              { name: "Frame with the Lead Shoulder", desc: "Use shoulder and stance shape to own the space before punching.", targets: "Frames, close-range control, balance", sets: 3, reps: 8, rest: 20 },
              { name: "Corner Seal and Exit", desc: "Step the opponent toward the corner, score, then leave before it gets messy.", targets: "Ring positioning, exits, discipline", sets: 3, reps: 6, rest: 20 },
              { name: "Bait the Jab Counter", desc: "Offer a read that invites the jab, then punish the predictable answer.", targets: "Baits, counters, tactical patience", sets: 3, reps: 8, rest: 20 },
              { name: "Take Ground with the Double Jab", desc: "Use the double jab as a territorial tool rather than just a scoring tool.", targets: "Ring command, lead-hand pressure, entries", sets: 3, reps: 8, rest: 20 },
              { name: "Win the Reset Phase", desc: "Score after the exchange when the other person is mentally off the task.", targets: "Reset awareness, timing, scoring windows", sets: 3, reps: 8, rest: 20 },
            ]),
          },
          topCategories: ["GYM", "COMBAT", "WARMUP"],
          topCategorySections: {
            "GYM": ["Ring Plyometrics", "Isometric Holds", "Scapula", "Glutes", "Ankles", "Knees", "Singles"],
            "COMBAT": ["Boxing", "Shadow Boxing", "Bag Work", "Boxing Combinations", "Boxing Feints", "Boxing Psychology", "Boxing Tactics"],
            "WARMUP": ["RAMP", "Mobility", "Boxing RAMP", "England Boxing Warm-Up", "STRETCHES", "Cool Down"],
          },
        };
      }

      function mergeGymCatalogExerciseDefaults(existing, seed) {
        if (!existing || !seed) return existing;
        if (!normalizeGymCatalogText(existing.desc) && normalizeGymCatalogText(seed.desc)) existing.desc = normalizeGymCatalogText(seed.desc);
        if (!normalizeGymCatalogText(existing.photo) && normalizeGymCatalogText(seed.photo)) existing.photo = normalizeGymCatalogText(seed.photo);
        if (!normalizeGymCatalogText(existing.targets) && normalizeGymCatalogText(seed.targets)) existing.targets = normalizeGymCatalogText(seed.targets);
        if (!normalizeGymCatalogText(existing.referenceQuery) && normalizeGymCatalogText(seed.referenceQuery)) {
          existing.referenceQuery = normalizeGymCatalogText(seed.referenceQuery);
        }
        if (!normalizeGymCatalogText(existing.referenceUrl) && normalizeGymCatalogText(seed.referenceUrl)) {
          existing.referenceUrl = normalizeGymCatalogText(seed.referenceUrl);
        }
        if (!normalizeGymCatalogText(existing.source) && normalizeGymCatalogText(seed.source)) existing.source = normalizeGymCatalogText(seed.source);
        if (!normalizeGymMetric(existing.targetSets) && normalizeGymMetric(seed.targetSets)) existing.targetSets = normalizeGymMetric(seed.targetSets);
        if (!normalizeGymMetric(existing.targetReps) && normalizeGymMetric(seed.targetReps)) existing.targetReps = normalizeGymMetric(seed.targetReps);
        if (!normalizeGymMetric(existing.targetSeconds) && normalizeGymMetric(seed.targetSeconds)) existing.targetSeconds = normalizeGymMetric(seed.targetSeconds);
        if (!normalizeGymMetric(existing.restSeconds) && normalizeGymMetric(seed.restSeconds)) existing.restSeconds = normalizeGymMetric(seed.restSeconds);
        if (!String(existing.targetWeight || "").trim() && String(seed.targetWeight || "").trim()) {
          existing.targetWeight = String(seed.targetWeight || "").trim();
        }
        existing.sessionMode = sanitizeGymSessionMode(existing.sessionMode, inferGymSessionMode(existing));
        existing.lastSession = normalizeGymLastSession(existing.lastSession);
        return existing;
      }

      function mergeGymCatalogSeedInto(out, seed) {
        if (!out || typeof out !== "object" || !seed || typeof seed !== "object") return out;
        if (!Array.isArray(out.topCategories)) out.topCategories = [];
        for (const top of Array.isArray(seed.topCategories) ? seed.topCategories : []) {
          if (!out.topCategories.includes(top)) out.topCategories.push(top);
        }
        if (!out.topCategorySections || typeof out.topCategorySections !== "object") out.topCategorySections = {};
        if (!out.catalog || typeof out.catalog !== "object") out.catalog = {};
        for (const [top, sections] of Object.entries(seed.topCategorySections || {})) {
          if (!Array.isArray(out.topCategorySections[top])) out.topCategorySections[top] = [];
          for (const section of Array.isArray(sections) ? sections : []) {
            if (!out.topCategorySections[top].includes(section)) out.topCategorySections[top].push(section);
          }
        }
        for (const [section, rows] of Object.entries(seed.catalog || {})) {
          if (!Array.isArray(out.catalog[section])) out.catalog[section] = [];
          const existingRows = out.catalog[section];
          const existingByName = new Map(
            existingRows
              .map((row) => [normalizeGymCatalogNameKey(row?.name), row])
              .filter(([name]) => !!name)
          );
          for (const seedRow of Array.isArray(rows) ? rows : []) {
            const key = normalizeGymCatalogNameKey(seedRow.name);
            const existing = existingByName.get(key);
            if (existing) {
              mergeGymCatalogExerciseDefaults(existing, seedRow);
            } else {
              const nextRow = normalizeGymCatalogExercise(seedRow, seedRow.id);
              existingRows.push(nextRow);
              existingByName.set(key, nextRow);
            }
          }
        }
        return out;
      }

      function applyDefaultGymCatalogSeed(out) {
        if (!out || typeof out !== "object") return out;
        mergeGymCatalogSeedInto(out, buildDefaultGymCatalogSeed());
        mergeGymCatalogSeedInto(out, buildSupplementalGymCatalogSeed());
        mergeGymCatalogSeedInto(out, buildExpandedGymCatalogSeed());
        return out;
      }

      function mergeGymCatalogSection(out, fromSection, toSection) {
        if (!out || !out.catalog || fromSection === toSection) return;
        const sourceRows = Array.isArray(out.catalog[fromSection]) ? out.catalog[fromSection] : [];
        if (!sourceRows.length && !Object.prototype.hasOwnProperty.call(out.catalog, fromSection)) return;
        if (!Array.isArray(out.catalog[toSection])) out.catalog[toSection] = [];
        const targetRows = out.catalog[toSection];
        const targetByName = new Map(
          targetRows
            .map((row) => [normalizeGymCatalogNameKey(row?.name), row])
            .filter(([name]) => !!name)
        );
        sourceRows.forEach((row, idx) => {
          const normalizedRow = normalizeGymCatalogExercise(row, `gx_fix_${Date.now()}_${slugifyGymCatalogKey(fromSection)}_${idx}`);
          const key = normalizeGymCatalogNameKey(normalizedRow.name);
          const existing = key ? targetByName.get(key) : null;
          if (existing) {
            mergeGymCatalogExerciseDefaults(existing, normalizedRow);
          } else {
            targetRows.push(normalizedRow);
            if (key) targetByName.set(key, normalizedRow);
          }
        });
        delete out.catalog[fromSection];
      }

      function applyLegacyGymSectionMigration(out) {
        if (!out || !out.catalog || typeof out.catalog !== "object") return out;
        const originals = Object.keys(out.catalog);
        originals.forEach((section) => {
          const normalized = normalizeGymSectionName(section);
          if (normalized && normalized !== section) mergeGymCatalogSection(out, section, normalized);
        });
        if (out.topCategorySections && typeof out.topCategorySections === "object") {
          Object.keys(out.topCategorySections).forEach((top) => {
            const next = Array.isArray(out.topCategorySections[top]) ? out.topCategorySections[top] : [];
            out.topCategorySections[top] = [...new Set(next.map((section) => normalizeGymSectionName(section)).filter(Boolean))];
          });
        }
        if (Array.isArray(out.dayList)) {
          out.dayList = out.dayList.map((item) => ({
            ...item,
            section: normalizeGymSectionName(item?.section || "Stability/Fundamentals"),
          }));
        }
        return out;
      }

      function applyGymCatalogAutoOptions(out) {
        if (!out || !out.catalog || typeof out.catalog !== "object") return out;
        Object.entries(out.catalog).forEach(([section, rows]) => {
          if (!Array.isArray(rows)) return;
          rows.forEach((row) => {
            if (!row || typeof row !== "object") return;
            if (gymExerciseSupportsHeelElevation({ ...row, section })) {
              row.desc = appendGymCatalogNote(row.desc, "Heel-elevated variation available.");
            }
          });
        });
        return out;
      }

      function getCatalogExercise(section, exId) {
        if (!routineData || !section || !exId) return null;
        const rows = Array.isArray(routineData.catalog?.[section]) ? routineData.catalog[section] : [];
        return rows.find((item) => String(item?.id || "") === String(exId || "")) || null;
      }

      function formatGymSessionStatus(status) {
        const clean = sanitizeGymSessionStatus(status, "pending");
        if (clean === "in-progress") return "IN PROGRESS";
        return clean.toUpperCase();
      }

      function formatGymMetricSummary(item) {
        if (!item || typeof item !== "object") return "";
        const labels = gymMetricLabelsFor(item);
        const bits = [];
        if (normalizeGymMetric(item.sets)) bits.push(`${labels.setsLabel} ${normalizeGymMetric(item.sets)}`);
        if (normalizeGymMetric(item.reps)) bits.push(`${labels.repsLabel} ${normalizeGymMetric(item.reps)}`);
        if (normalizeGymMetric(item.seconds)) bits.push(`${labels.secondsLabel} ${normalizeGymMetric(item.seconds)}`);
        if (String(item.weight || "").trim()) bits.push(`${labels.weightLabel} ${String(item.weight || "").trim()}`);
        if (String(item.result || "").trim()) bits.push(`${labels.resultLabel}: ${String(item.result || "").trim()}`);
        return bits.join(" • ");
      }

      function formatGymPresetSummary(item) {
        if (!item || typeof item !== "object") return "";
        const labels = gymMetricLabelsFor(item);
        const bits = [];
        const sets = normalizeGymMetric(item.targetSets);
        const reps = normalizeGymMetric(item.targetReps);
        const seconds = normalizeGymMetric(item.targetSeconds);
        const rest = normalizeGymMetric(item.restSeconds);
        if (sets) bits.push(`${labels.setsLabel} ${sets}`);
        if (reps) bits.push(`${labels.repsLabel} ${reps}`);
        if (seconds) bits.push(`${labels.secondsLabel} ${seconds}`);
        if (String(item.targetWeight || "").trim()) bits.push(`${labels.weightLabel} ${String(item.targetWeight || "").trim()}`);
        if (rest) bits.push(`${labels.restLabel} ${rest}`);
        return bits.join(" • ");
      }

      function formatGymLastSession(lastSession) {
        if (!lastSession) return "";
        const labels = gymMetricLabelsFor(lastSession);
        const bits = [formatGymSessionStatus(lastSession.status)];
        const metricSummary = formatGymMetricSummary(lastSession);
        if (metricSummary) bits.push(metricSummary);
        if (normalizeGymMetric(lastSession.restSeconds)) bits.push(`${labels.restLabel} ${normalizeGymMetric(lastSession.restSeconds)}`);
        return bits.join(" • ");
      }

      function getGymReferenceUrl(item) {
        if (!item || typeof item !== "object") return "";
        const raw = normalizeGymCatalogText(item.referenceUrl);
        if (raw && !isAutoGymReferenceUrl(raw)) return raw;
        return normalizeGymCatalogText(buildGymReferenceUrl(item));
      }

      function openGymExerciseReference(url, label = "") {
        const target = normalizeGymCatalogText(url);
        if (!target) return;
        const overlay = document.getElementById("doc-overlay");
        const header = document.getElementById("doc-title");
        const sub = document.getElementById("doc-sub");
        const content = document.getElementById("doc-body");
        if (!overlay || !header || !sub || !content) {
          try {
            const opened = window.open(target, "_blank", "noopener");
            if (!opened) window.location.href = target;
          } catch (e) {
            window.location.href = target;
          }
          return;
        }
        header.textContent = "// REFERENCE VIEWER";
        sub.textContent = label || target;
        content.className = "doc-body";
        overlay.classList.add("active");
        overlay.setAttribute("aria-hidden", "false");
        content.innerHTML = `
          <div class="exercise-reference-viewer">
            <div class="exercise-reference-viewer-actions">
              <a class="submit-btn" href="${escapeHtmlAttr(target)}" target="_blank" rel="noopener">OPEN IN BROWSER</a>
              <button class="confirm-btn" type="button" onclick="closeDocPopup()">CLOSE</button>
            </div>
            <div class="routine-ex-note">If the embedded page refuses to load, use OPEN IN BROWSER and then return to OMNI.</div>
            <iframe class="exercise-reference-frame" src="${escapeHtmlAttr(target)}" title="${escapeHtmlAttr(label || "Reference Viewer")}"></iframe>
          </div>
        `;
      }

      function educationRoutineTopics() {
        return [
          "Public Law",
          "Science",
          "Cyber security",
          "Language",
          "English literature (Story telling)",
          "One new industry",
          "Finance: Trust and Asset protection",
          "Decentralised finance",
          "Credit scoring",
        ];
      }

      function educationRoutineDescription() {
        return educationRoutineTopics().join("; ");
      }

      function buildEducationRoutineTask(existing = {}) {
        const oldChecks = Array.isArray(existing?.descChecks) ? existing.descChecks : [];
        const oldDoneByText = new Map(
          oldChecks
            .map((row) => [String(row?.text || "").trim().toLowerCase(), !!row?.done])
            .filter(([text]) => !!text)
        );
        return {
          id: String(existing?.id || `rn_ed_${Date.now()}_${Math.floor(Math.random() * 100000)}`),
          title: "Education",
          desc: educationRoutineDescription(),
          descChecks: educationRoutineTopics().map((text, idx) => ({
            id: String(oldChecks[idx]?.id || `dc_ed_${Date.now()}_${idx}_${Math.floor(Math.random() * 100000)}`),
            text,
            done: !!oldDoneByText.get(text.toLowerCase()),
          })),
          done: !!existing?.done,
        };
      }

      function applyEducationRoutineMigration(out) {
        if (!out || !Array.isArray(out.night)) return out;
        const titleKey = (value) => String(value || "").trim().toLowerCase();
        const night = out.night.slice();
        const educationIdx = night.findIndex((item) => titleKey(item?.title) === "education");
        const legacyIdx = night.findIndex((item) => ["read", "study"].includes(titleKey(item?.title)));
        const targetIdx = educationIdx >= 0 ? educationIdx : legacyIdx;
        const baseItem = targetIdx >= 0 ? night[targetIdx] : {};
        const educationTask = buildEducationRoutineTask(baseItem);
        if (targetIdx >= 0) {
          night[targetIdx] = educationTask;
        } else {
          const sleepPrepIdx = night.findIndex((item) => titleKey(item?.title) === "sleep prep");
          if (sleepPrepIdx >= 0) night.splice(sleepPrepIdx, 0, educationTask);
          else night.push(educationTask);
        }
        out.night = night;
        return out;
      }

      function buildDefaultPostingTemplateState(seedTs = Date.now()) {
        return {
          title: "Mission Prioritization for Sales Engagement",
          subtitle: "Timeline reference of mission styles in order, moving from discovery and probing into trust, production, sales, and clear calls to action.",
          items: [
            {
              id: `pt_${seedTs}_1`,
              title: "Data Worlds",
              subtext: "Identify global pockets of interest. Pinpoint where your audience congregates and key pain points arise.",
            },
            {
              id: `pt_${seedTs}_2`,
              title: "Probing / Indexing",
              subtext: "Dive deeper into identified communities. Explore reactions, posters, and engagement dynamics.",
            },
            {
              id: `pt_${seedTs}_3`,
              title: "Branding / Collaboration",
              subtext: "Build your brand identity. Partner with other creators to amplify reach and credibility.",
            },
            {
              id: `pt_${seedTs}_4`,
              title: "PR",
              subtext: "Leverage public relations for media coverage, interviews, and press outreach.",
            },
            {
              id: `pt_${seedTs}_5`,
              title: "Engagement Missions",
              subtext: "Engage the audience directly via polls, questions, and interactive content.",
            },
            {
              id: `pt_${seedTs}_6`,
              title: "Testimonials",
              subtext: "Gather early success stories and proof from initial customers or engagements.",
            },
            {
              id: `pt_${seedTs}_7`,
              title: "Content Day / Live Action",
              subtext: "Organize creative shoots, collaborations, and live public activations.",
            },
            {
              id: `pt_${seedTs}_8`,
              title: "Production",
              subtext: "Ramp up campaigns, product launches, or content delivery based on demand.",
            },
            {
              id: `pt_${seedTs}_9`,
              title: "Sales / Recruitment",
              subtext: "Once trust and engagement are built, pursue direct sales or recruitment such as hiring support staff.",
            },
            {
              id: `pt_${seedTs}_10`,
              title: "Calls to Action (CTAs)",
              subtext: "Guide your audience clearly to the next step, whether purchasing, signing up, or joining your team.",
            },
          ],
        };
      }

      function createDefaultRoutineData() {
        const now = Date.now();
        const gymSeed = buildDefaultGymCatalogSeed();
        const state = {
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
            buildEducationRoutineTask({ id: `rn_${now}_5`, done: false }),
            { id: `rn_${now}_6`, title: "Sleep prep", desc: "No screens, final shutdown, sleep.", done: false },
          ],
          catalog: gymSeed.catalog,
          topCategories: gymSeed.topCategories,
          topCategorySections: gymSeed.topCategorySections,
          selectedFocus: "",
          dayList: [],
          savedSessions: [],
          reminders: [],
          journal: [],
          postingTemplate: buildDefaultPostingTemplateState(now),
        };
        ensurePinnedReminderEntries(state);
        return state;
      }

      function ensurePinnedReminderEntries(state) {
        if (!state || !Array.isArray(state.reminders)) return;
        OMNI_PINNED_REMINDER_SPECS.forEach((spec) => {
          const id = String(spec?.id || "").trim();
          if (!id) return;
          const nextReminder = {
            id,
            when: String(spec.when || ""),
            title: String(spec.title || "Reminder"),
            desc: String(spec.desc || ""),
            notifyOffsets: normalizeReminderNotifyOffsets(spec.notifyOffsets),
            syncToAppleCalendar: spec.syncToAppleCalendar !== false,
          };
          const existingIndex = state.reminders.findIndex((row) => String(row?.id || "").trim() === id);
          if (existingIndex >= 0) {
            state.reminders[existingIndex] = {
              ...state.reminders[existingIndex],
              ...nextReminder,
            };
          } else {
            state.reminders.push(nextReminder);
          }
        });
        state.reminders.sort((a, b) => new Date(a.when).getTime() - new Date(b.when).getTime());
      }

      function normalizeReminderNotifyOffsets(offsets, options = {}) {
        const raw = Array.isArray(offsets) ? offsets : [];
        const allowAtTime = options.allowAtTime !== false;
        const wantsAtTime = allowAtTime && raw.some((value) => Number(value) === 0);
        const seen = new Set();
        const prior = [];
        raw.forEach((value) => {
          const mins = Number(value);
          if (!Number.isFinite(mins) || mins < 0) return;
          if (mins === 0) return;
          if (seen.has(mins) || prior.length >= REMINDER_MAX_PRIOR_ALERTS) return;
          seen.add(mins);
          prior.push(mins);
        });
        const out = [];
        if (wantsAtTime) out.push(0);
        prior.forEach((mins) => out.push(mins));
        if (!out.length) out.push(0);
        return out;
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
        if (!Array.isArray(out.savedSessions)) out.savedSessions = [];
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
        if (!out.topCategorySections["WARMUP"].includes("Mobility")) out.topCategorySections["WARMUP"].push("Mobility");
        if (!out.topCategorySections["WARMUP"].includes("Boxing RAMP")) out.topCategorySections["WARMUP"].push("Boxing RAMP");
        if (!out.topCategorySections["WARMUP"].includes("STRETCHES")) out.topCategorySections["WARMUP"].push("STRETCHES");
        if (!Array.isArray(out.catalog["RAMP"])) out.catalog["RAMP"] = [];
        if (!Array.isArray(out.catalog["Mobility"])) out.catalog["Mobility"] = [];
        if (!Array.isArray(out.catalog["Boxing RAMP"])) out.catalog["Boxing RAMP"] = [];
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
        applyEducationRoutineMigration(out);

        for (const section of Object.keys(out.catalog)) {
          out.catalog[section] = (Array.isArray(out.catalog[section]) ? out.catalog[section] : [])
            .map((ex, i) => normalizeGymCatalogExercise(ex, `gx_fix_${Date.now()}_${section}_${i}`));
        }
        for (const [top, subs] of Object.entries(out.topCategorySections)) {
          if (!Array.isArray(subs)) continue;
          out.topCategorySections[top] = subs.filter(Boolean);
          for (const sub of subs) {
            if (!Array.isArray(out.catalog[sub])) out.catalog[sub] = [];
          }
        }
        applyLegacyGymSectionMigration(out);
        applyGymCatalogAutoOptions(out);
        const mappedSubs = new Set(
          Object.values(out.topCategorySections)
            .flatMap((arr) => (Array.isArray(arr) ? arr : []))
            .map((s) => String(s || ""))
        );
        const legacyTopForSection = (sectionName) => {
          const s = String(sectionName || "").toLowerCase();
          if (s === "cardio" || s === "running") return "CARDIO";
          if (["boxing", "combat", "shadow boxing", "bag work", "footwork/agility", "coordination"].includes(s)) return "COMBAT";
          if (["ramp", "mobility", "boxing ramp", "stretches"].includes(s)) return "WARMUP";
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
              const sec = String(r?.name || "").trim() || "Stability/Fundamentals";
              if (!Array.isArray(out.catalog[sec])) out.catalog[sec] = [];
              const rows = Array.isArray(r?.exercises) ? r.exercises : [];
              for (const ex of rows) {
                out.catalog[sec].push(normalizeGymCatalogExercise({
                  id: `gx_m_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
                  name: String(ex?.name || "Exercise"),
                  desc: String(ex?.note || ex?.desc || ""),
                  photo: String(ex?.photo || ""),
                }));
              }
            }
          }
          for (const m of [{ key: "boxing", section: "Boxing" }, { key: "cardio", section: "Cardio" }]) {
            const rows = Array.isArray(out[m.key]) ? out[m.key] : [];
            for (const ex of rows) {
              out.catalog[m.section].push(normalizeGymCatalogExercise({
                id: `gx_m_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
                name: String(ex?.title || ex?.name || m.section),
                desc: String(ex?.desc || ex?.note || ""),
                photo: String(ex?.photo || ""),
              }));
            }
          }
          out._catalogMigratedV1 = true;
          out.routines = [];
          out.boxing = [];
          out.cardio = [];
        }

        applyDefaultGymCatalogSeed(out);

        out.dayList = out.dayList.map((x, i) => ({
          id: String(x?.id || `gd_fix_${Date.now()}_${i}`),
          section: normalizeGymSectionName(x?.section || "Stability/Fundamentals"),
          exId: String(x?.exId || ""),
          name: String(x?.name || "Exercise"),
          desc: String(x?.desc || ""),
          photo: String(x?.photo || ""),
          done: !!x?.done,
        }));
        out.savedSessions = out.savedSessions
          .map((session, i) => normalizeGymSavedSession(session, i))
          .filter((session) => Array.isArray(session?.items) && session.items.length > 0);
        out.journal = out.journal.map((j, i) => ({
          id: String(j?.id || `jr_fix_${Date.now()}_${i}`),
          at: String(j?.at || new Date().toISOString()),
          title: String(j?.title || "Entry"),
          desc: String(j?.desc || ""),
          photo: String(j?.photo || ""),
          link: String(j?.link || ""),
        }));
        const basePostingTemplate = base.postingTemplate || buildDefaultPostingTemplateState();
        const rawPostingTemplate = out.postingTemplate && typeof out.postingTemplate === "object"
          ? out.postingTemplate
          : basePostingTemplate;
        const rawPostingItems = Array.isArray(rawPostingTemplate?.items) && rawPostingTemplate.items.length
          ? rawPostingTemplate.items
          : basePostingTemplate.items;
        out.postingTemplate = {
          title: String(rawPostingTemplate?.title || basePostingTemplate.title || "Posting Template"),
          subtitle: String(rawPostingTemplate?.subtitle || basePostingTemplate.subtitle || ""),
          items: rawPostingItems.map((item, i) => ({
            id: String(item?.id || `pt_fix_${Date.now()}_${i}`),
            title: String(item?.title || `Stage ${i + 1}`),
            subtext: String(item?.subtext || item?.desc || ""),
          })),
        };
        out.reminders = out.reminders.map((r, i) => ({
          id: String(r?.id || `rrm_fix_${Date.now()}_${i}`),
          when: String(r?.when || new Date().toISOString()),
          title: String(r?.title || "Upcoming"),
          desc: String(r?.desc || ""),
          notifyOffsets: normalizeReminderNotifyOffsets(r?.notifyOffsets),
          syncToAppleCalendar: r?.syncToAppleCalendar !== false,
        }));
        ensurePinnedReminderEntries(out);
        out.selectedFocus = String(out.selectedFocus || "");
        return out;
      }

      function saveRoutineData() {
        localStorage.setItem(routineStorageKey(), JSON.stringify(routineData));
        queueNativeNotificationRefresh(250, { prompt: false });
        queueOmniCalendarSync(250, { prompt: false });
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
          const checks = rawChecks.filter((d) => String(d?.text || "").trim().length > 0);
          return `
          <li class="routine-item ${item.done ? "done" : ""}"
              draggable="true"
              ondragstart="onRoutineTaskDragStart('${period}',${idx},event)"
              ondragover="onRoutineTaskDragOver(event)"
              ondragleave="onRoutineTaskDragLeave(event)"
              ondrop="onRoutineTaskDrop('${period}',${idx},event)">
            <div class="routine-item-copy">
              <div class="routine-item-head">
                <span class="routine-item-title routine-inline-editable"
                      onclick="onRoutineTitleClick('${period}','${escapeHtmlAttr(item.id)}', event)"
                      ondblclick="onRoutineTitleDblClick('${period}','${escapeHtmlAttr(item.id)}', event, this)"
                >${escapeHtmlAttr(item.title)}</span>
                <div class="routine-item-actions">
                  <button class="confirm-btn routine-mini-btn" type="button" onclick="event.stopPropagation(); editRoutineTask('${period}','${escapeJsString(item.id)}')">EDIT</button>
                  <button class="x-btn routine-mini-btn" type="button" onclick="event.stopPropagation(); deleteRoutineTask('${period}','${escapeJsString(item.id)}')">X</button>
                </div>
              </div>
              ${String(item.desc || "").trim()
                ? `<div class="routine-item-desc routine-inline-editable"
                     onclick="event.stopPropagation()"
                     ondblclick="onRoutineDescDblClick('${period}','${escapeHtmlAttr(item.id)}', event, this)"
                   >${escapeHtmlAttr(item.desc)}</div>`
                : `<div class="routine-item-desc routine-item-desc-empty">No description yet. Use EDIT.</div>`}
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
        renderOperationFocus();
      }

      function collectIncompleteRoutineTasks() {
        if (!routineData) return [];
        const out = [];
        ["morning", "night"].forEach((period) => {
          const rows = Array.isArray(routineData?.[period]) ? routineData[period] : [];
          rows.forEach((item) => {
            const pendingChecks = (Array.isArray(item?.descChecks) ? item.descChecks : [])
              .map((row) => ({ text: String(row?.text || "").trim(), done: !!row?.done }))
              .filter((row) => row.text && !row.done)
              .map((row) => row.text);
            const incomplete = !item?.done || pendingChecks.length;
            if (!incomplete) return;
            out.push({
              period,
              id: String(item?.id || ""),
              title: String(item?.title || "Routine Task").trim(),
              desc: String(item?.desc || "").trim(),
              pendingChecks,
            });
          });
        });
        return out;
      }

      function routineReminderTitle(task) {
        return `${String(task?.period || "").toUpperCase()} ROUTINE :: ${String(task?.title || "Task").trim()}`;
      }

      function routineReminderDescription(task) {
        const pending = Array.isArray(task?.pendingChecks) ? task.pendingChecks.filter(Boolean) : [];
        if (pending.length) return `Pending: ${pending.join(" | ")}`;
        return String(task?.desc || "").trim() || "Routine follow-up reminder.";
      }

      function upsertRoutineReminder(task, when, offsetMins = 0) {
        if (!routineData || !task || !(when instanceof Date) || !Number.isFinite(when.getTime())) return;
        if (!Array.isArray(routineData.reminders)) routineData.reminders = [];
        const title = routineReminderTitle(task);
        const desc = routineReminderDescription(task);
        const existing = routineData.reminders.find((row) => {
          const rowWhen = new Date(row?.when).getTime();
          return String(row?.title || "") === title
            && String(row?.desc || "") === desc
            && Number.isFinite(rowWhen)
            && rowWhen >= Date.now() - (12 * 60 * 60 * 1000);
        });
        if (existing) {
          existing.when = when.toISOString();
          existing.notifyOffsets = [Math.max(0, Number(offsetMins || 0))];
          return;
        }
        routineData.reminders.push({
          id: `rem_routine_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
          when: when.toISOString(),
          title,
          desc,
          notifyOffsets: [Math.max(0, Number(offsetMins || 0))],
        });
      }

      function refreshReminderUiAfterRoutineReminder(when) {
        if (!(when instanceof Date) || !Number.isFinite(when.getTime())) return;
        reminderCalendarSelectedDate = localDateKey(when);
        reminderCalendarMonthCursor = new Date(when.getFullYear(), when.getMonth(), 1);
        renderReminderCalendar();
        renderReminderList();
      }

      function carryIncompleteRoutineTasksToReminders() {
        if (!routineData) return;
        const tasks = collectIncompleteRoutineTasks();
        if (!tasks.length) {
          themedNotice("No incomplete routine items to carry.");
          return;
        }
        const baseMs = Date.now() + (15 * 60 * 1000);
        tasks.forEach((task, idx) => upsertRoutineReminder(task, new Date(baseMs + idx * 5 * 60 * 1000), 0));
        saveRoutineData();
        refreshReminderUiAfterRoutineReminder(new Date(baseMs));
        if (currentView === "settings") renderSyncCenter();
        themedNotice(`${tasks.length} routine item(s) carried into reminders.`);
      }

      function snoozeIncompleteRoutineTasks(minutes = 60) {
        if (!routineData) return;
        const tasks = collectIncompleteRoutineTasks();
        if (!tasks.length) {
          themedNotice("No incomplete routine items to snooze.");
          return;
        }
        const leadMins = Math.max(5, Number(minutes || 60));
        const baseMs = Date.now() + (leadMins * 60 * 1000);
        tasks.forEach((task, idx) => upsertRoutineReminder(task, new Date(baseMs + idx * 5 * 60 * 1000), 0));
        saveRoutineData();
        refreshReminderUiAfterRoutineReminder(new Date(baseMs));
        if (currentView === "settings") renderSyncCenter();
        themedNotice(`${tasks.length} routine item(s) snoozed for ${leadMins} minute(s).`);
      }

      async function resetRoutineProgress() {
        if (!(await themedConfirm("Reset all routine checks and subtasks?"))) return;
        if (!routineData) return;
        ["morning", "night"].forEach((period) => {
          const rows = Array.isArray(routineData?.[period]) ? routineData[period] : [];
          rows.forEach((item) => {
            item.done = false;
            if (Array.isArray(item.descChecks)) {
              item.descChecks.forEach((row) => { row.done = false; });
            }
          });
        });
        saveRoutineData();
        renderRoutines();
        if (currentView === "settings") renderSyncCenter();
        themedNotice("Routine progress reset.");
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
          return ["GYM", "CARDIO", "COMBAT", "WARMUP"];
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
        const raw = normalizeGymSectionName(section);
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
          resetGymSessionRunner();
        }
        pruneGymExerciseSelection();
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
        const raw = normalizeGymSectionName(input?.value || "");
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
        gymLastSelectedIndex = -1;
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
        const sub = normalizeGymSectionName(subArg || "");
        if (!sub) return;
        const ok = await themedConfirm(`Delete subcategory ${sub} and all exercises inside it?`);
        if (!ok) return;
        routineData.topCategorySections[gymCurrentCategory] = getTopCategorySections(gymCurrentCategory).filter((s) => s !== sub);
        delete routineData.catalog[sub];
        if (gymCurrentSubcategory === sub) {
          gymCurrentSubcategory = "";
          resetGymSessionRunner();
        }
        pruneGymExerciseSelection();
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
              targets: ex.targets || "",
              targetsLabel: ex.targetsLabel || "",
              referenceQuery: ex.referenceQuery || "",
              referenceUrl: getGymReferenceUrl(ex),
              source: ex.source || "",
              sessionMode: inferGymSessionMode(ex),
              setsLabel: ex.setsLabel || "",
              repsLabel: ex.repsLabel || "",
              secondsLabel: ex.secondsLabel || "",
              restLabel: ex.restLabel || "",
              weightLabel: ex.weightLabel || "",
              resultLabel: ex.resultLabel || "",
              targetSets: normalizeGymMetric(ex.targetSets),
              targetReps: normalizeGymMetric(ex.targetReps),
              targetSeconds: normalizeGymMetric(ex.targetSeconds),
              restSeconds: normalizeGymMetric(ex.restSeconds),
              targetWeight: String(ex.targetWeight || "").trim(),
              lastSession: normalizeGymLastSession(ex.lastSession),
            });
          }
        }
        return out;
      }

      function allGymExercises() {
        if (!routineData || !routineData.catalog) return [];
        const out = [];
        const seenSections = new Set();
        gymTopCategories().forEach((top) => {
          sectionsForTop(top).forEach((section) => {
            if (seenSections.has(section)) return;
            seenSections.add(section);
            (routineData.catalog[section] || []).forEach((ex) => {
              out.push({
                section,
                id: ex.id,
                name: ex.name,
                desc: ex.desc || "",
                photo: ex.photo || "",
                targets: ex.targets || "",
                targetsLabel: ex.targetsLabel || "",
                referenceQuery: ex.referenceQuery || "",
                referenceUrl: getGymReferenceUrl(ex),
                source: ex.source || "",
                sessionMode: inferGymSessionMode(ex),
                setsLabel: ex.setsLabel || "",
                repsLabel: ex.repsLabel || "",
                secondsLabel: ex.secondsLabel || "",
                restLabel: ex.restLabel || "",
                weightLabel: ex.weightLabel || "",
                resultLabel: ex.resultLabel || "",
                targetSets: normalizeGymMetric(ex.targetSets),
                targetReps: normalizeGymMetric(ex.targetReps),
                targetSeconds: normalizeGymMetric(ex.targetSeconds),
                restSeconds: normalizeGymMetric(ex.restSeconds),
                targetWeight: String(ex.targetWeight || "").trim(),
                lastSession: normalizeGymLastSession(ex.lastSession),
              });
            });
          });
        });
        Object.keys(routineData.catalog).forEach((section) => {
          if (seenSections.has(section)) return;
          (routineData.catalog[section] || []).forEach((ex) => {
            out.push({
              section,
              id: ex.id,
              name: ex.name,
              desc: ex.desc || "",
              photo: ex.photo || "",
              targets: ex.targets || "",
              referenceQuery: ex.referenceQuery || "",
              referenceUrl: getGymReferenceUrl(ex),
              source: ex.source || "",
              sessionMode: inferGymSessionMode(ex),
              targetSets: normalizeGymMetric(ex.targetSets),
              targetReps: normalizeGymMetric(ex.targetReps),
              targetSeconds: normalizeGymMetric(ex.targetSeconds),
              restSeconds: normalizeGymMetric(ex.restSeconds),
              targetWeight: String(ex.targetWeight || "").trim(),
              lastSession: normalizeGymLastSession(ex.lastSession),
            });
          });
        });
        return out;
      }

      function pruneGymExerciseSelection() {
        const validKeys = new Set(allGymExercises().map((ex, idx) => gymRowKey(ex.section, ex.id, idx)));
        gymSelectedExerciseOrder = gymSelectedExerciseOrder.filter((key) => validKeys.has(key));
        gymSelectedExerciseKeys = new Set(gymSelectedExerciseOrder);
      }

      function formatGymPickedSessionStatus(selected) {
        if (!Array.isArray(selected) || !selected.length) {
          return "Pick exercises anywhere in Gym to build a mixed manual session.";
        }
        const labels = selected.slice(0, 4).map((item) => item.name);
        const extra = selected.length - labels.length;
        return `${selected.length} picked: ${labels.join(" -> ")}${extra > 0 ? ` -> +${extra} more` : ""}`;
      }

      function sanitizeGymSavedSessionStatus(value, fallback = "saved") {
        const status = String(value || "").trim().toLowerCase();
        if (["saved", "active", "completed", "ended"].includes(status)) return status;
        return fallback;
      }

      function normalizeGymSavedSessionItem(item, index = 0, fallbackStatus = "pending") {
        const labels = gymMetricLabelsFor(item);
        return {
          section: normalizeGymSectionName(item?.section || "Stability/Fundamentals"),
          id: String(item?.id || ""),
          name: String(item?.name || "Exercise"),
          targetsLabel: normalizeGymMetricLabel(item?.targetsLabel, "Targets"),
          status: sanitizeGymSessionStatus(item?.status, fallbackStatus || (index === 0 ? "in-progress" : "pending")),
          mode: sanitizeGymSessionMode(item?.mode, inferGymSessionMode(item)),
          setsLabel: labels.setsLabel,
          repsLabel: labels.repsLabel,
          secondsLabel: labels.secondsLabel,
          restLabel: labels.restLabel,
          weightLabel: labels.weightLabel,
          resultLabel: labels.resultLabel,
          sets: normalizeGymMetric(item?.sets),
          reps: normalizeGymMetric(item?.reps),
          seconds: normalizeGymMetric(item?.seconds),
          restSeconds: normalizeGymMetric(item?.restSeconds),
          weight: String(item?.weight || "").trim(),
          result: String(item?.result || "").trim(),
          notes: String(item?.notes || "").trim(),
          updatedAt: String(item?.updatedAt || item?.at || "").trim(),
        };
      }

      function summarizeGymSavedSession(session) {
        const items = Array.isArray(session?.items) ? session.items : [];
        const summary = {
          total: items.length,
          completed: 0,
          skipped: 0,
          active: 0,
          pending: 0,
        };
        items.forEach((item) => {
          const status = sanitizeGymSessionStatus(item?.status, "pending");
          if (status === "completed") summary.completed += 1;
          else if (status === "skipped") summary.skipped += 1;
          else if (status === "in-progress") summary.active += 1;
          else summary.pending += 1;
        });
        summary.remaining = summary.pending + summary.active;
        return summary;
      }

      function deriveGymSavedSessionStatus(items, allowActive = true) {
        const summary = summarizeGymSavedSession({ items });
        if (!summary.total) return allowActive ? "saved" : "ended";
        if (summary.remaining === 0) return summary.completed > 0 ? "completed" : "ended";
        if (allowActive && (summary.completed > 0 || summary.skipped > 0 || summary.active > 0)) return "active";
        return allowActive ? "saved" : "ended";
      }

      function formatGymSavedSessionLabel(isoString, count = 0) {
        const when = new Date(String(isoString || ""));
        const base = Number.isNaN(when.getTime())
          ? "Saved session"
          : when.toLocaleString("en-GB", {
              weekday: "long",
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
        return count ? `${base} • ${count} items` : base;
      }

      function formatGymSavedSessionProgress(session) {
        const summary = summarizeGymSavedSession(session);
        if (!summary.total) return "0 items";
        const bits = [`${summary.total} items`];
        if (summary.completed) bits.push(`${summary.completed} completed`);
        if (summary.skipped) bits.push(`${summary.skipped} skipped`);
        if (summary.active) bits.push(`${summary.active} active`);
        if (summary.pending) bits.push(`${summary.pending} pending`);
        if (!summary.completed && !summary.skipped && !summary.active && summary.pending === summary.total) bits.push("not started");
        return bits.join(" • ");
      }

      function formatGymSavedSessionOptionLabel(session) {
        if (!session) return "Saved session";
        const status = sanitizeGymSavedSessionStatus(session.status, "saved").toUpperCase();
        return `${formatGymSavedSessionLabel(session.createdAt, session.items.length)} • ${status}`;
      }

      function normalizeGymSavedSession(session, index = 0) {
        const rawItems = Array.isArray(session?.items) ? session.items : [];
        const items = rawItems
          .map((item, itemIndex) => normalizeGymSavedSessionItem(item, itemIndex, "pending"))
          .filter((item) => item.section && (item.id || item.name));
        const createdAt = String(session?.createdAt || session?.startedAt || session?.at || new Date().toISOString()).trim();
        const derivedStatus = deriveGymSavedSessionStatus(items, true);
        const status = sanitizeGymSavedSessionStatus(session?.status, derivedStatus);
        return {
          id: String(session?.id || `gss_fix_${Date.now()}_${index}_${Math.floor(Math.random() * 100000)}`),
          label: normalizeGymCatalogText(session?.label) || formatGymSavedSessionLabel(createdAt, items.length),
          createdAt,
          finishedAt: String(session?.finishedAt || "").trim(),
          status,
          items,
        };
      }

      function buildGymSavedSessionFromQueue(queue, status = "saved") {
        const createdAt = new Date().toISOString();
        const cleanStatus = sanitizeGymSavedSessionStatus(status, "saved");
        const items = (Array.isArray(queue) ? queue : []).map((item, index) => {
          const next = normalizeGymSavedSessionItem(item, index, cleanStatus === "active" && index === 0 ? "in-progress" : "pending");
          if (cleanStatus === "saved") next.status = "pending";
          return next;
        });
        return normalizeGymSavedSession({
          id: `gss_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
          createdAt,
          status: cleanStatus,
          items,
        });
      }

      function upsertGymSavedSession(session) {
        if (!routineData) return null;
        if (!Array.isArray(routineData.savedSessions)) routineData.savedSessions = [];
        const normalized = normalizeGymSavedSession(session, routineData.savedSessions.length);
        const next = routineData.savedSessions.filter((item) => String(item?.id || "") !== normalized.id);
        next.unshift(normalized);
        routineData.savedSessions = next.slice(0, 60);
        return normalized;
      }

      function syncActiveGymSavedSession(statusOverride = "") {
        if (!routineData) return null;
        if (!gymActiveSavedSessionId) {
          saveRoutineData();
          return null;
        }
        if (!Array.isArray(routineData.savedSessions)) routineData.savedSessions = [];
        const existing = routineData.savedSessions.find((item) => String(item?.id || "") === String(gymActiveSavedSessionId || "")) || null;
        const rawItems = (Array.isArray(gymSessionQueue) && gymSessionQueue.length) ? gymSessionQueue : (existing?.items || []);
        const createdAt = String(existing?.createdAt || gymSessionStartedAt || new Date().toISOString()).trim();
        const nextStatus = statusOverride
          ? sanitizeGymSavedSessionStatus(statusOverride, "active")
          : deriveGymSavedSessionStatus(rawItems, true);
        const next = upsertGymSavedSession({
          ...(existing || {}),
          id: gymActiveSavedSessionId,
          label: existing?.label || formatGymSavedSessionLabel(createdAt, rawItems.length),
          createdAt,
          finishedAt: ["completed", "ended"].includes(nextStatus)
            ? String(existing?.finishedAt || new Date().toISOString())
            : "",
          status: nextStatus,
          items: rawItems,
        });
        if (next) gymSelectedSavedSessionId = next.id;
        saveRoutineData();
        return next;
      }

      function finalizeActiveGymSavedSession(statusOverride = "") {
        if (!gymActiveSavedSessionId) return null;
        const finalStatus = statusOverride
          ? sanitizeGymSavedSessionStatus(statusOverride, "ended")
          : deriveGymSavedSessionStatus(gymSessionQueue, false);
        const next = syncActiveGymSavedSession(finalStatus);
        gymActiveSavedSessionId = "";
        return next;
      }

      function saveCurrentGymSelectionSnapshot() {
        if (!routineData) return;
        const picked = selectedGymExercises();
        if (!picked.length) {
          themedNotice("Pick exercises first.");
          return;
        }
        const queue = picked.map(({ rowIndex, ...exercise }, index) => {
          const item = buildGymSessionItem(exercise, index);
          item.status = "pending";
          return item;
        });
        const saved = upsertGymSavedSession(buildGymSavedSessionFromQueue(queue, "saved"));
        if (!saved) return;
        gymSelectedSavedSessionId = saved.id;
        saveRoutineData();
        renderGymPlanner();
        themedNotice("Picked session saved.");
      }

      function preloadSelectedGymSession() {
        if (!routineData || !Array.isArray(routineData.savedSessions) || !routineData.savedSessions.length) {
          themedNotice("No saved sessions yet.");
          return;
        }
        const targetId = String(gymSelectedSavedSessionId || document.getElementById("gym-saved-session-select")?.value || "");
        const session = routineData.savedSessions.find((item) => String(item?.id || "") === targetId);
        if (!session) {
          themedNotice("Pick a saved session first.");
          return;
        }
        const allRows = allGymExercises();
        clearGymExerciseSelection(false);
        let matched = 0;
        let missing = 0;
        session.items.forEach((savedItem) => {
          const section = normalizeGymSectionName(savedItem?.section || "");
          let rowIndex = -1;
          let match = null;
          if (savedItem?.id) {
            rowIndex = allRows.findIndex((row) => normalizeGymSectionName(row?.section || "") === section && String(row?.id || "") === String(savedItem.id || ""));
            match = rowIndex >= 0 ? allRows[rowIndex] : null;
          }
          if (!match && savedItem?.name) {
            rowIndex = allRows.findIndex((row) => normalizeGymSectionName(row?.section || "") === section && normalizeGymCatalogNameKey(row?.name) === normalizeGymCatalogNameKey(savedItem.name));
            match = rowIndex >= 0 ? allRows[rowIndex] : null;
          }
          if (!match) {
            missing += 1;
            return;
          }
          setGymExerciseSelection(match.section, match.id, rowIndex, true);
          matched += 1;
        });
        gymSelectedSavedSessionId = session.id;
        renderGymPlanner();
        if (!matched) themedNotice("No exercises from that session were found.");
        else if (missing) themedNotice(`Preloaded ${matched} exercise(s). ${missing} missing from current gym library.`);
        else themedNotice(`Preloaded ${matched} exercise(s).`);
      }

      function openGymCategory(top) {
        gymCurrentCategory = top;
        gymCurrentSubcategory = "";
        gymLastSelectedIndex = -1;
        resetGymSessionRunner();
        renderGymPlanner();
      }

      function backGymLevel() {
        if (gymCurrentSubcategory) {
          gymCurrentSubcategory = "";
          resetGymSessionRunner();
          renderGymPlanner();
          return;
        }
        backGymCategory();
      }

      function backGymCategory() {
        gymCurrentCategory = "";
        gymCurrentSubcategory = "";
        gymLastSelectedIndex = -1;
        resetGymSessionRunner();
        renderGymPlanner();
      }

      function gymRowKey(section, exId, idx) {
        const sec = String(section || "");
        const id = String(exId || "");
        if (id) return `${sec}::${id}`;
        return `${sec}::__idx_${Number(idx)}`;
      }

      function clearGymExerciseSelection(rerender = true) {
        gymSelectedExerciseKeys = new Set();
        gymSelectedExerciseOrder = [];
        gymLastSelectedIndex = -1;
        if (rerender) renderGymPlanner();
      }

      function setGymExerciseSelection(section, exId, idx, shouldSelect) {
        const key = gymRowKey(section, exId, idx);
        if (shouldSelect) {
          gymSelectedExerciseKeys.add(key);
          if (!gymSelectedExerciseOrder.includes(key)) gymSelectedExerciseOrder.push(key);
        } else {
          gymSelectedExerciseKeys.delete(key);
          gymSelectedExerciseOrder = gymSelectedExerciseOrder.filter((item) => item !== key);
        }
      }

      function toggleGymExerciseSelection(section, exId, idx) {
        const key = gymRowKey(section, exId, idx);
        setGymExerciseSelection(section, exId, idx, !gymSelectedExerciseKeys.has(key));
        renderGymPlanner();
      }

      function toggleGymExerciseFromButton(btn, event) {
        if (event) {
          if (typeof event.preventDefault === "function") event.preventDefault();
          if (typeof event.stopPropagation === "function") event.stopPropagation();
          if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
        }
        const sec = String(btn?.getAttribute("data-section") || "");
        const id = String(btn?.getAttribute("data-id") || "");
        const idx = Number(btn?.getAttribute("data-idx"));
        if (!sec) return;
        toggleGymExerciseSelection(sec, id, idx);
      }

      function selectedGymExercises(rowsArg) {
        const rows = Array.isArray(rowsArg) ? rowsArg : allGymExercises();
        const byKey = new Map(rows.map((ex, idx) => [gymRowKey(ex.section, ex.id, idx), { ...ex, rowIndex: idx }]));
        return gymSelectedExerciseOrder.map((key) => byKey.get(key)).filter(Boolean);
      }

      function resetGymSessionRunner() {
        gymSessionMode = false;
        gymSessionQueue = [];
        gymSessionStartedAt = "";
        gymActiveSavedSessionId = "";
      }

      function buildGymSessionItem(exercise, index = 0) {
        const last = normalizeGymLastSession(exercise?.lastSession);
        const mode = inferGymSessionMode(exercise);
        return {
          section: String(exercise?.section || ""),
          id: String(exercise?.id || ""),
          name: String(exercise?.name || "Exercise"),
          desc: String(exercise?.desc || ""),
          photo: String(exercise?.photo || ""),
          targets: String(exercise?.targets || ""),
          targetsLabel: normalizeGymMetricLabel(exercise?.targetsLabel, "Targets"),
          referenceQuery: String(exercise?.referenceQuery || ""),
          referenceUrl: getGymReferenceUrl(exercise),
          source: String(exercise?.source || ""),
          mode,
          setsLabel: normalizeGymMetricLabel(exercise?.setsLabel ?? last?.setsLabel, "Sets"),
          repsLabel: normalizeGymMetricLabel(exercise?.repsLabel ?? last?.repsLabel, "Reps"),
          secondsLabel: normalizeGymMetricLabel(exercise?.secondsLabel ?? last?.secondsLabel, "Seconds"),
          restLabel: normalizeGymMetricLabel(exercise?.restLabel ?? last?.restLabel, "Rest"),
          weightLabel: normalizeGymMetricLabel(exercise?.weightLabel ?? last?.weightLabel, "Weight"),
          resultLabel: normalizeGymMetricLabel(exercise?.resultLabel ?? last?.resultLabel, "Result"),
          status: index === 0 ? "in-progress" : "pending",
          sets: normalizeGymMetric(exercise?.targetSets ?? last?.sets ?? 0),
          reps: normalizeGymMetric(exercise?.targetReps ?? last?.reps ?? 0),
          seconds: normalizeGymMetric(exercise?.targetSeconds ?? last?.seconds ?? 0),
          restSeconds: normalizeGymMetric(exercise?.restSeconds ?? last?.restSeconds ?? 0),
          weight: String(exercise?.targetWeight ?? last?.weight ?? "").trim(),
          result: String(last?.result || "").trim(),
          notes: "",
          updatedAt: "",
        };
      }

      function currentGymSessionItem() {
        if (!gymSessionMode || !Array.isArray(gymSessionQueue) || !gymSessionQueue.length) return null;
        return gymSessionQueue[gymViewerIndex] || null;
      }

      function persistGymSessionItem(item, persistDefaults = false, persistStore = true) {
        if (!item || !routineData) return;
        const row = getCatalogExercise(item.section, item.id);
        if (!row) return;
        row.lastSession = normalizeGymLastSession({
          status: item.status,
          mode: item.mode,
          setsLabel: item.setsLabel,
          repsLabel: item.repsLabel,
          secondsLabel: item.secondsLabel,
          restLabel: item.restLabel,
          weightLabel: item.weightLabel,
          resultLabel: item.resultLabel,
          sets: item.sets,
          reps: item.reps,
          seconds: item.seconds,
          restSeconds: item.restSeconds,
          weight: item.weight,
          result: item.result,
          notes: item.notes,
          at: new Date().toISOString(),
        });
        if (persistDefaults) {
          row.targets = normalizeGymCatalogText(item.targets || row.targets || "");
          row.targetsLabel = normalizeGymMetricLabel(item.targetsLabel, row.targetsLabel || "Targets");
          row.sessionMode = sanitizeGymSessionMode(item.mode, inferGymSessionMode(item));
          row.setsLabel = normalizeGymMetricLabel(item.setsLabel, row.setsLabel || "Sets");
          row.repsLabel = normalizeGymMetricLabel(item.repsLabel, row.repsLabel || "Reps");
          row.secondsLabel = normalizeGymMetricLabel(item.secondsLabel, row.secondsLabel || "Seconds");
          row.restLabel = normalizeGymMetricLabel(item.restLabel, row.restLabel || "Rest");
          row.weightLabel = normalizeGymMetricLabel(item.weightLabel, row.weightLabel || "Weight");
          row.resultLabel = normalizeGymMetricLabel(item.resultLabel, row.resultLabel || "Result");
          row.targetSets = normalizeGymMetric(item.sets);
          row.targetReps = normalizeGymMetric(item.reps);
          row.targetSeconds = normalizeGymMetric(item.seconds);
          row.restSeconds = normalizeGymMetric(item.restSeconds);
          row.targetWeight = String(item.weight || "").trim();
        }
        if (persistStore) saveRoutineData();
      }

      function persistFinishedGymSessionItems() {
        if (!gymSessionMode || !Array.isArray(gymSessionQueue) || !gymSessionQueue.length) return;
        gymSessionQueue.forEach((item) => {
          if (item.status === "completed" || item.status === "in-progress") persistGymSessionItem(item, true, false);
          else if (item.status === "skipped") persistGymSessionItem(item, false, false);
        });
        if (!gymActiveSavedSessionId) saveRoutineData();
      }

      function syncGymSessionStatusPills() {
        document.querySelectorAll(".exercise-session-pill").forEach((pill) => {
          const idx = Number(pill.getAttribute("data-idx"));
          const item = gymSessionQueue[idx];
          if (!item) return;
          pill.classList.toggle("active", idx === gymViewerIndex);
          pill.classList.toggle("completed", item.status === "completed");
          pill.classList.toggle("skipped", item.status === "skipped");
          pill.classList.toggle("in-progress", item.status === "in-progress");
          const statusEl = pill.querySelector("em");
          if (statusEl) statusEl.textContent = formatGymSessionStatus(item.status);
        });
      }

      function updateGymSessionField(field, value, rerender = false) {
        const item = currentGymSessionItem();
        if (!item) return;
        if (field === "status") item.status = sanitizeGymSessionStatus(value, item.status);
        else if (field === "mode") item.mode = sanitizeGymSessionMode(value, item.mode);
        else if (["sets", "reps", "seconds", "restSeconds"].includes(field)) item[field] = normalizeGymMetric(value);
        else if (field === "targets") item[field] = normalizeGymCatalogText(value);
        else if (field.endsWith("Label")) item[field] = normalizeGymMetricLabel(value, item[field] || "");
        else item[field] = String(value || "");
        if (field !== "status" && ["pending", "skipped"].includes(item.status)) item.status = "in-progress";
        item.updatedAt = new Date().toISOString();
        if (routineData) {
          const row = getCatalogExercise(item.section, item.id);
          if (row) {
            if (field === "targets") row.targets = item.targets;
            if (field === "targetsLabel") row.targetsLabel = item.targetsLabel;
            if (field === "setsLabel") row.setsLabel = item.setsLabel;
            if (field === "repsLabel") row.repsLabel = item.repsLabel;
            if (field === "secondsLabel") row.secondsLabel = item.secondsLabel;
            if (field === "restLabel") row.restLabel = item.restLabel;
            if (field === "weightLabel") row.weightLabel = item.weightLabel;
            if (field === "resultLabel") row.resultLabel = item.resultLabel;
          }
        }
        persistGymSessionItem(item, false, false);
        syncActiveGymSavedSession();
        if (rerender) {
          renderExerciseViewer();
          return;
        }
        syncGymSessionStatusPills();
      }

      function markGymSessionInProgress() {
        const item = currentGymSessionItem();
        if (!item) return;
        item.status = "in-progress";
        item.updatedAt = new Date().toISOString();
        persistGymSessionItem(item, false, false);
        syncActiveGymSavedSession();
        renderExerciseViewer();
      }

      function moveGymSessionToIndex(index) {
        if (!gymSessionMode || !Array.isArray(gymSessionQueue) || !gymSessionQueue.length) return;
        const nextIndex = Math.max(0, Math.min(gymSessionQueue.length - 1, Number(index)));
        gymViewerIndex = nextIndex;
        const item = currentGymSessionItem();
        if (item && item.status === "pending") {
          item.status = "in-progress";
          item.updatedAt = new Date().toISOString();
        }
        syncActiveGymSavedSession();
        renderExerciseViewer();
      }

      function completeGymSessionStep() {
        const item = currentGymSessionItem();
        if (!item) return;
        item.status = "completed";
        item.updatedAt = new Date().toISOString();
        persistGymSessionItem(item, true, false);
        syncActiveGymSavedSession();
        if (gymViewerIndex < gymSessionQueue.length - 1) {
          moveGymSessionToIndex(gymViewerIndex + 1);
        } else {
          renderExerciseViewer();
          themedNotice("Session complete.");
        }
      }

      function skipGymSessionStep() {
        const item = currentGymSessionItem();
        if (!item) return;
        item.status = "skipped";
        item.updatedAt = new Date().toISOString();
        persistGymSessionItem(item, false, false);
        syncActiveGymSavedSession();
        if (gymViewerIndex < gymSessionQueue.length - 1) {
          moveGymSessionToIndex(gymViewerIndex + 1);
        } else {
          renderExerciseViewer();
        }
      }

      async function requestCloseExerciseViewer() {
        if (gymSessionMode) {
          const ok = await themedConfirm(
            "End current workout session? Completed exercise updates stay saved.",
            {
              title: "// END WORKOUT SESSION",
              cancelText: "KEEP SESSION",
              okText: "END SESSION",
              danger: true,
            }
          );
          if (!ok) return;
          persistFinishedGymSessionItems();
          finalizeActiveGymSavedSession();
        }
        closeExerciseViewer();
      }

      function openGymSessionRunner() {
        const queue = selectedGymExercises();
        if (!queue.length) {
          themedNotice("Pick exercises first.");
          return;
        }
        gymViewerCategory = gymCurrentCategory || "GYM";
        gymViewerSubcategory = "";
        gymViewerIndex = 0;
        gymSessionMode = true;
        gymSessionStartedAt = new Date().toISOString();
        gymSessionQueue = queue.map(({ rowIndex, ...ex }, idx) => buildGymSessionItem(ex, idx));
        const overlay = document.getElementById("exercise-overlay");
        if (!overlay) return;
        const activeSession = upsertGymSavedSession(buildGymSavedSessionFromQueue(gymSessionQueue, "active"));
        gymActiveSavedSessionId = String(activeSession?.id || "");
        gymSelectedSavedSessionId = gymActiveSavedSessionId;
        saveRoutineData();
        overlay.classList.add("active");
        overlay.setAttribute("aria-hidden", "false");
        renderExerciseViewer();
      }

      function currentGymViewerRows() {
        if (gymSessionMode && Array.isArray(gymSessionQueue) && gymSessionQueue.length) {
          return gymSessionQueue.map((ex) => {
            const live = (routineData?.catalog?.[ex.section] || []).find((item) => String(item?.id || "") === String(ex.id || ""));
            if (!live) return ex;
            return {
              ...live,
              ...ex,
              name: ex.name || live.name,
              desc: ex.desc || live.desc || "",
              photo: ex.photo || live.photo || "",
              targets: ex.targets || live.targets || "",
              targetsLabel: ex.targetsLabel || live.targetsLabel || "Targets",
              referenceQuery: ex.referenceQuery || live.referenceQuery || "",
              referenceUrl: getGymReferenceUrl({ ...live, ...ex }),
              source: ex.source || live.source || "",
              setsLabel: ex.setsLabel || live.setsLabel || "",
              repsLabel: ex.repsLabel || live.repsLabel || "",
              secondsLabel: ex.secondsLabel || live.secondsLabel || "",
              restLabel: ex.restLabel || live.restLabel || "",
              weightLabel: ex.weightLabel || live.weightLabel || "",
              resultLabel: ex.resultLabel || live.resultLabel || "",
            };
          });
        }
        return exercisesForTop(gymViewerCategory, gymViewerSubcategory);
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
              setGymExerciseSelection(ex.section, ex.id, n, true);
            }
          } else {
            setGymExerciseSelection(section, exId, i, !gymSelectedExerciseKeys.has(key));
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
        const selected = selectedGymExercises(rows).map((item) => ({ ex: item, idx: item.rowIndex }));
        if (!selected.length) return;
        const ok = await themedConfirm(`Delete ${selected.length} selected exercise(s)?`);
        if (!ok) return;
        selected.forEach(({ ex, idx }) => deleteCatalogExercise(ex.section, ex.id, idx, false, false));
        saveRoutineData();
        pruneGymExerciseSelection();
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
        const next = await themedPrompt("Swap custom photo URL (leave blank for offline bundled image)", row.photo || "");
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
        setGymExerciseSelection(section, exId, rowIndex, false);
        pruneGymExerciseSelection();
        if (gymSessionMode) {
          gymSessionQueue = gymSessionQueue.filter((item) => !(String(item.section || "") === String(section || "") && String(item.id || "") === String(exId || "")));
          if (!gymSessionQueue.length) {
            finalizeActiveGymSavedSession("ended");
            resetGymSessionRunner();
          } else {
            if (gymViewerIndex >= gymSessionQueue.length) gymViewerIndex = gymSessionQueue.length - 1;
            syncActiveGymSavedSession();
          }
        }
        if (rerender) {
          saveRoutineData();
          renderGymPlanner();
        }
      }

      function saveCurrentExerciseProfileFromViewer() {
        if (gymSessionMode || !routineData) return;
        const rows = currentGymViewerRows();
        if (!rows.length) return;
        const ex = rows[gymViewerIndex];
        if (!ex) return;
        const row = getCatalogExercise(ex.section, ex.id);
        if (!row) return;
        const nameEl = document.getElementById("exercise-profile-name");
        const descEl = document.getElementById("exercise-profile-desc");
        const targetsEl = document.getElementById("exercise-profile-targets");
        const sourceEl = document.getElementById("exercise-profile-source");
        const modeEl = document.getElementById("exercise-profile-mode");
        const setsLabelEl = document.getElementById("exercise-profile-sets-label");
        const setsEl = document.getElementById("exercise-profile-sets");
        const repsLabelEl = document.getElementById("exercise-profile-reps-label");
        const repsEl = document.getElementById("exercise-profile-reps");
        const secondsLabelEl = document.getElementById("exercise-profile-seconds-label");
        const secondsEl = document.getElementById("exercise-profile-seconds");
        const restLabelEl = document.getElementById("exercise-profile-rest-label");
        const restEl = document.getElementById("exercise-profile-rest");
        const weightLabelEl = document.getElementById("exercise-profile-weight-label");
        const weightEl = document.getElementById("exercise-profile-weight");
        const resultLabelEl = document.getElementById("exercise-profile-result-label");
        const nextName = normalizeGymCatalogText(nameEl?.value || row.name || "Exercise");
        row.name = nextName || row.name || "Exercise";
        row.desc = String(descEl?.value || "").trim();
        row.targets = normalizeGymCatalogText(targetsEl?.value || "");
        row.source = normalizeGymCatalogText(sourceEl?.value || "");
        row.sessionMode = sanitizeGymSessionMode(modeEl?.value || row.sessionMode || inferGymSessionMode(row), inferGymSessionMode(row));
        row.setsLabel = normalizeGymMetricLabel(setsLabelEl?.value, row.setsLabel || "Sets");
        row.repsLabel = normalizeGymMetricLabel(repsLabelEl?.value, row.repsLabel || "Reps");
        row.secondsLabel = normalizeGymMetricLabel(secondsLabelEl?.value, row.secondsLabel || "Seconds");
        row.restLabel = normalizeGymMetricLabel(restLabelEl?.value, row.restLabel || "Rest");
        row.weightLabel = normalizeGymMetricLabel(weightLabelEl?.value, row.weightLabel || "Weight");
        row.resultLabel = normalizeGymMetricLabel(resultLabelEl?.value, row.resultLabel || "Result");
        row.targetSets = normalizeGymMetric(setsEl?.value);
        row.targetReps = normalizeGymMetric(repsEl?.value);
        row.targetSeconds = normalizeGymMetric(secondsEl?.value);
        row.restSeconds = normalizeGymMetric(restEl?.value);
        row.targetWeight = String(weightEl?.value || "").trim();
        row.referenceQuery = normalizeGymCatalogText(row.referenceQuery || row.name);
        row.referenceUrl = normalizeGymCatalogText(row.referenceUrl || buildGymReferenceUrl(row.referenceQuery || row.name));
        saveRoutineData();
        renderGymPlanner();
        renderExerciseViewer();
        themedNotice("Exercise profile updated.");
      }

      function currentGymViewerCatalogExercise() {
        if (gymSessionMode || !routineData) return null;
        const rows = currentGymViewerRows();
        if (!rows.length) return null;
        const ex = rows[gymViewerIndex];
        if (!ex) return null;
        return getCatalogExercise(ex.section, ex.id) || null;
      }

      function toggleCurrentGymViewerPick() {
        if (gymSessionMode) return;
        const rows = currentGymViewerRows();
        if (!rows.length) return;
        const ex = rows[gymViewerIndex];
        if (!ex) return;
        toggleGymExerciseSelection(ex.section, ex.id, gymViewerIndex);
        renderExerciseViewer();
      }

      function updateGymViewerQuickField(field, value) {
        const row = currentGymViewerCatalogExercise();
        if (!row) return;
        if (field === "targets") row.targets = normalizeGymCatalogText(value);
        else if (field === "targetsLabel") row.targetsLabel = normalizeGymMetricLabel(value, row.targetsLabel || "Targets");
        else if (field === "setsLabel") row.setsLabel = normalizeGymMetricLabel(value, row.setsLabel || "Sets");
        else if (field === "repsLabel") row.repsLabel = normalizeGymMetricLabel(value, row.repsLabel || "Reps");
        else if (field === "sets") row.targetSets = normalizeGymMetric(value);
        else if (field === "reps") row.targetReps = normalizeGymMetric(value);
        saveRoutineData();
        renderGymPlanner();
      }

      function completeGymViewerQuickEntry() {
        const row = currentGymViewerCatalogExercise();
        if (!row) return;
        row.targets = normalizeGymCatalogText(row.targets || "");
        row.targetsLabel = normalizeGymMetricLabel(row.targetsLabel, "Targets");
        row.setsLabel = normalizeGymMetricLabel(row.setsLabel, "Sets");
        row.repsLabel = normalizeGymMetricLabel(row.repsLabel, "Reps");
        row.targetSets = normalizeGymMetric(row.targetSets);
        row.targetReps = normalizeGymMetric(row.targetReps);
        row.lastSession = normalizeGymLastSession({
          ...(row.lastSession || {}),
          status: "completed",
          mode: inferGymSessionMode(row),
          targetsLabel: row.targetsLabel,
          setsLabel: row.setsLabel,
          repsLabel: row.repsLabel,
          secondsLabel: normalizeGymMetricLabel(row.secondsLabel, "Seconds"),
          restLabel: normalizeGymMetricLabel(row.restLabel, "Rest"),
          weightLabel: normalizeGymMetricLabel(row.weightLabel, "Weight"),
          resultLabel: normalizeGymMetricLabel(row.resultLabel, "Result"),
          sets: row.targetSets,
          reps: row.targetReps,
          seconds: normalizeGymMetric(row.targetSeconds),
          restSeconds: normalizeGymMetric(row.restSeconds),
          weight: String(row.targetWeight || "").trim(),
          result: String(row.lastSession?.result || "").trim(),
          notes: String(row.lastSession?.notes || "").trim(),
          at: new Date().toISOString(),
        });
        saveRoutineData();
        renderGymPlanner();
        renderExerciseViewer();
        themedNotice("Exercise updated.");
      }

      async function editCurrentExerciseFromViewer() {
        const rows = currentGymViewerRows();
        if (!rows.length) return;
        if (gymViewerIndex < 0) gymViewerIndex = rows.length - 1;
        if (gymViewerIndex >= rows.length) gymViewerIndex = 0;
        const ex = rows[gymViewerIndex];
        if (!ex) return;
        await editCatalogExerciseDesc(ex.section, ex.id);
        renderExerciseViewer();
      }

      async function changeCurrentExercisePhotoFromViewer() {
        const rows = currentGymViewerRows();
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
        resetGymSessionRunner();
        const overlay = document.getElementById("exercise-overlay");
        if (!overlay) return;
        overlay.classList.add("active");
        overlay.setAttribute("aria-hidden", "false");
        renderExerciseViewer();
      }

      function closeExerciseViewer() {
        const overlay = document.getElementById("exercise-overlay");
        if (!overlay) return;
        resetGymSessionRunner();
        overlay.classList.remove("active");
        overlay.setAttribute("aria-hidden", "true");
        renderGymPlanner();
      }

      function renderExerciseViewer() {
        const host = document.getElementById("exercise-main");
        const title = document.getElementById("exercise-title");
        const closeBtn = document.getElementById("exercise-close-btn");
        const prevBtn = document.getElementById("exercise-prev-btn");
        const nextBtn = document.getElementById("exercise-next-btn");
        const endBtn = document.getElementById("exercise-end-session-btn");
        if (!host || !title) return;
        const rows = currentGymViewerRows();
        if (!rows.length) {
          host.innerHTML = `<div class="gym-card-desc">No exercises in this category.</div>`;
          title.textContent = `// ${gymViewerCategory || "EXERCISE"} VIEWER`;
          if (closeBtn) closeBtn.textContent = "Close";
          if (prevBtn) prevBtn.disabled = true;
          if (nextBtn) nextBtn.disabled = true;
          if (endBtn) endBtn.style.display = "none";
          return;
        }
        if (gymSessionMode) {
          if (gymViewerIndex < 0) gymViewerIndex = 0;
          if (gymViewerIndex >= rows.length) gymViewerIndex = rows.length - 1;
        } else {
          if (gymViewerIndex < 0) gymViewerIndex = rows.length - 1;
          if (gymViewerIndex >= rows.length) gymViewerIndex = 0;
        }
        const ex = rows[gymViewerIndex];
        const completedCount = rows.filter((item) => item.status === "completed").length;
        const skippedCount = rows.filter((item) => item.status === "skipped").length;
        const activeCount = rows.filter((item) => item.status === "in-progress").length;
        const lastSummary = ex.lastSession ? formatGymLastSession(ex.lastSession) : "";
        const referenceUrl = getGymReferenceUrl(ex);
        const referenceLabel = buildGymReferenceQuery(ex);
        const photoSrc = getGymDisplayPhoto(ex);
        const hasCustomPhoto = hasGymCustomPhoto(ex);
        const labels = gymSessionCardLabelsFor(ex);
        const cardTargetsLabel = normalizeGymMetricLabel(gymSessionMode ? labels.targetsLabel : (ex.targetsLabel || labels.targetsLabel), "Targets");
        const cardTargetsValue = String(ex.targets || "");
        const cardSetsLabel = normalizeGymMetricLabel(gymSessionMode ? labels.setsLabel : (ex.setsLabel || labels.setsLabel), "Sets");
        const cardSetsValue = gymSessionMode
          ? String(normalizeGymMetric(ex.sets) || "")
          : String(normalizeGymMetric(ex.targetSets ?? ex.lastSession?.sets ?? 0) || "");
        const cardRepsLabel = normalizeGymMetricLabel(gymSessionMode ? labels.repsLabel : (ex.repsLabel || labels.repsLabel), "Reps");
        const cardRepsValue = gymSessionMode
          ? String(normalizeGymMetric(ex.reps) || "")
          : String(normalizeGymMetric(ex.targetReps ?? ex.lastSession?.reps ?? 0) || "");
        const viewerKey = gymRowKey(ex.section, ex.id, gymViewerIndex);
        const viewerSelected = !gymSessionMode && gymSelectedExerciseKeys.has(viewerKey);
        const viewerSelectedOrder = viewerSelected ? gymSelectedExerciseOrder.indexOf(viewerKey) : -1;
        if (endBtn) endBtn.style.display = gymSessionMode ? "inline-flex" : "none";
        if (closeBtn) closeBtn.textContent = gymSessionMode ? "Cancel" : "Close";
        if (prevBtn) prevBtn.disabled = gymSessionMode ? gymViewerIndex <= 0 : false;
        if (nextBtn) nextBtn.disabled = gymSessionMode ? gymViewerIndex >= rows.length - 1 : false;
        title.textContent = gymSessionMode
          ? `// SESSION RUN :: ${ex.name} (${gymViewerIndex + 1}/${rows.length})`
          : `// ${gymViewerCategory} :: ${ex.name} (${gymViewerIndex + 1}/${rows.length})`;
        host.innerHTML = `
          ${gymSessionMode ? `
          <div class="exercise-session-banner">
            <div class="exercise-session-kicker">MANUAL SESSION</div>
            <div class="exercise-session-copy">${completedCount} completed • ${skippedCount} skipped • ${rows.length - completedCount - skippedCount} remaining${activeCount ? ` • ${activeCount} active` : ""}</div>
          </div>` : ""}
          <div id="exercise-photo-dropzone" class="exercise-media-col" title="Drop image, or click Choose File">
            <img id="exercise-photo-click" class="exercise-profile-photo ${hasCustomPhoto ? "custom-photo" : "offline-photo"}" src="${escapeHtmlAttr(photoSrc)}" alt="${escapeHtmlAttr(ex.name)}" title="${hasCustomPhoto ? "Click to change custom photo" : "Tap to add your own photo"}" />
            <div class="exercise-photo-tools">
              <input id="exercise-photo-file" class="search-input" type="file" accept="image/*" />
              <div class="routine-ex-note">${hasCustomPhoto ? "Custom photo loaded" : "Offline preview loaded"} • Drop image or choose file</div>
              ${referenceUrl ? `<button id="exercise-reference-btn" class="confirm-btn" type="button">ONLINE PHOTO SEARCH</button>` : ""}
            </div>
          </div>
          <div id="exercise-details-click" class="exercise-details exercise-summary" style="margin-top:2px;" title="${gymSessionMode ? "Workout session detail" : "Exercise profile"}">
            <div class="gym-list-sec exercise-section-title">${escapeHtmlAttr(ex.section)}</div>
            <div class="gym-card-name exercise-main-title">${escapeHtmlAttr(ex.name)}</div>
            <div class="routine-ex-note exercise-subtitle">${gymSessionMode ? "Manual session runner" : (lastSummary || "Quick exercise editor")}</div>
          </div>
          <div class="exercise-meta-grid exercise-meta-grid-session">
            <label class="exercise-meta-card exercise-meta-card-editable">
              <input id="exercise-session-targets-label" class="exercise-meta-label-input" type="text" value="${escapeHtmlAttr(cardTargetsLabel)}" placeholder="Targets" />
              <textarea id="exercise-session-targets" class="exercise-meta-value-input exercise-meta-value-textarea" rows="2" placeholder="Text here">${escapeHtmlAttr(cardTargetsValue)}</textarea>
            </label>
            <label class="exercise-meta-card exercise-meta-card-editable">
              <input id="exercise-session-sets-card-label" class="exercise-meta-label-input" type="text" value="${escapeHtmlAttr(cardSetsLabel)}" placeholder="Sets" />
              <input id="exercise-session-sets-card" class="exercise-meta-value-input" type="text" inputmode="text" value="${escapeHtmlAttr(cardSetsValue)}" placeholder="Text here" />
            </label>
            <label class="exercise-meta-card exercise-meta-card-editable">
              <input id="exercise-session-reps-card-label" class="exercise-meta-label-input" type="text" value="${escapeHtmlAttr(cardRepsLabel)}" placeholder="Reps" />
              <input id="exercise-session-reps-card" class="exercise-meta-value-input" type="text" inputmode="text" value="${escapeHtmlAttr(cardRepsValue)}" placeholder="Text here" />
            </label>
            <div class="exercise-meta-card exercise-meta-card-action">
              <button id="exercise-session-complete-card" class="submit-btn exercise-meta-complete-btn ${viewerSelected ? "gym-pick-btn selected" : ""}" type="button">${gymSessionMode ? (ex.status === "completed" ? "COMPLETED" : "COMPLETE") : (viewerSelected ? String(viewerSelectedOrder + 1) : "PICK")}</button>
            </div>
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
	        const referenceBtn = document.getElementById("exercise-reference-btn");
	        if (referenceBtn) referenceBtn.onclick = () => openGymExerciseReference(referenceUrl, referenceLabel);
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
        if (detailsClickEl) detailsClickEl.ondblclick = gymSessionMode ? null : () => editCurrentExerciseFromViewer();
        const bindQuickField = (id, field) => {
          const el = document.getElementById(id);
          if (!el) return;
          el.addEventListener("input", () => {
            if (gymSessionMode) updateGymSessionField(field, el.value);
            else updateGymViewerQuickField(field, el.value);
          });
        };
        bindQuickField("exercise-session-targets-label", "targetsLabel");
        bindQuickField("exercise-session-targets", "targets");
        bindQuickField("exercise-session-sets-card-label", "setsLabel");
        bindQuickField("exercise-session-sets-card", "sets");
        bindQuickField("exercise-session-reps-card-label", "repsLabel");
        bindQuickField("exercise-session-reps-card", "reps");
        const completeCardBtn = document.getElementById("exercise-session-complete-card");
        if (completeCardBtn) completeCardBtn.onclick = () => {
          if (gymSessionMode) completeGymSessionStep();
          else toggleCurrentGymViewerPick();
        };
	        if (gymSessionMode) {
	          const statusEl = document.getElementById("exercise-session-status");
	          if (statusEl) statusEl.addEventListener("change", () => updateGymSessionField("status", statusEl.value, true));
	          const modeEl = document.getElementById("exercise-session-mode");
	          if (modeEl) modeEl.addEventListener("change", () => updateGymSessionField("mode", modeEl.value));
	          const weightLabelEl = document.getElementById("exercise-session-weight-label");
	          if (weightLabelEl) weightLabelEl.addEventListener("input", () => updateGymSessionField("weightLabel", weightLabelEl.value));
	          const weightEl = document.getElementById("exercise-session-weight");
	          if (weightEl) weightEl.addEventListener("input", () => updateGymSessionField("weight", weightEl.value));
            const syncTextPair = (field, primaryId, mirrorId) => {
              const primary = document.getElementById(primaryId);
              if (!primary) return;
              primary.addEventListener("input", () => {
                updateGymSessionField(field, primary.value);
                const mirror = document.getElementById(mirrorId);
                if (mirror && mirror !== primary) mirror.value = primary.value;
              });
            };
            syncTextPair("setsLabel", "exercise-session-sets-card-label", "exercise-session-sets-label");
            syncTextPair("setsLabel", "exercise-session-sets-label", "exercise-session-sets-card-label");
            syncTextPair("sets", "exercise-session-sets-card", "exercise-session-sets");
            syncTextPair("sets", "exercise-session-sets", "exercise-session-sets-card");
            syncTextPair("repsLabel", "exercise-session-reps-card-label", "exercise-session-reps-label");
            syncTextPair("repsLabel", "exercise-session-reps-label", "exercise-session-reps-card-label");
            syncTextPair("reps", "exercise-session-reps-card", "exercise-session-reps");
            syncTextPair("reps", "exercise-session-reps", "exercise-session-reps-card");
	          const secondsLabelEl = document.getElementById("exercise-session-seconds-label");
	          if (secondsLabelEl) secondsLabelEl.addEventListener("input", () => updateGymSessionField("secondsLabel", secondsLabelEl.value));
	          const secondsEl = document.getElementById("exercise-session-seconds");
	          if (secondsEl) secondsEl.addEventListener("input", () => updateGymSessionField("seconds", secondsEl.value));
	          const restLabelEl = document.getElementById("exercise-session-rest-label");
	          if (restLabelEl) restLabelEl.addEventListener("input", () => updateGymSessionField("restLabel", restLabelEl.value));
	          const restEl = document.getElementById("exercise-session-rest");
	          if (restEl) restEl.addEventListener("input", () => updateGymSessionField("restSeconds", restEl.value));
	          const resultLabelEl = document.getElementById("exercise-session-result-label");
	          if (resultLabelEl) resultLabelEl.addEventListener("input", () => updateGymSessionField("resultLabel", resultLabelEl.value));
	          const resultEl = document.getElementById("exercise-session-result");
	          if (resultEl) resultEl.addEventListener("input", () => updateGymSessionField("result", resultEl.value));
	          const notesEl = document.getElementById("exercise-session-notes");
	          if (notesEl) notesEl.addEventListener("input", () => updateGymSessionField("notes", notesEl.value));
	        }
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
        syncGymSessionStatusPills();
      }

      function prevExercise() {
        if (gymSessionMode) {
          moveGymSessionToIndex(gymViewerIndex - 1);
          return;
        }
        gymViewerIndex -= 1;
        renderExerciseViewer();
      }

      function nextExercise() {
        if (gymSessionMode) {
          moveGymSessionToIndex(gymViewerIndex + 1);
          return;
        }
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
        const sessionStatus = document.getElementById("gym-session-status");
        const saveBtn = document.getElementById("gym-session-save-btn");
        const clearBtn = document.getElementById("gym-session-clear-btn");
        const playBtn = document.getElementById("gym-session-play-btn");
        const savedStatus = document.getElementById("gym-saved-session-status");
        const savedSelect = document.getElementById("gym-saved-session-select");
        const preloadBtn = document.getElementById("gym-session-preload-btn");
        const categoryNote = document.getElementById("gym-category-note");
        if (!home || !view || !subPage || !exPage || !title || !list || !subGrid) return;
        pruneGymExerciseSelection();
        const picked = selectedGymExercises();
        const savedSessions = Array.isArray(routineData.savedSessions) ? routineData.savedSessions.slice() : [];
        if (sessionStatus) sessionStatus.textContent = formatGymPickedSessionStatus(picked);
        if (saveBtn) saveBtn.disabled = !picked.length;
        if (clearBtn) clearBtn.disabled = !picked.length;
        if (playBtn) playBtn.disabled = !picked.length;
        if (!savedSessions.some((item) => String(item?.id || "") === String(gymSelectedSavedSessionId || ""))) {
          gymSelectedSavedSessionId = savedSessions[0]?.id || "";
        }
        const selectedSavedSession = savedSessions.find((item) => String(item?.id || "") === String(gymSelectedSavedSessionId || "")) || null;
        if (savedSelect) {
          if (!savedSessions.length) {
            savedSelect.innerHTML = `<option value="">No saved sessions</option>`;
            savedSelect.disabled = true;
            savedSelect.value = "";
          } else {
            savedSelect.innerHTML = savedSessions.map((session) => `
              <option value="${escapeHtmlAttr(session.id)}">${escapeHtmlAttr(formatGymSavedSessionOptionLabel(session))}</option>
            `).join("");
            savedSelect.disabled = false;
            savedSelect.value = gymSelectedSavedSessionId;
            savedSelect.onchange = () => {
              gymSelectedSavedSessionId = String(savedSelect.value || "");
              renderGymPlanner();
            };
          }
        }
        if (savedStatus) {
          savedStatus.textContent = selectedSavedSession
            ? `${formatGymSavedSessionLabel(selectedSavedSession.createdAt)} • ${formatGymSavedSessionProgress(selectedSavedSession)} • ${sanitizeGymSavedSessionStatus(selectedSavedSession.status, "saved").toUpperCase()}`
            : "No saved sessions yet.";
        }
        if (preloadBtn) preloadBtn.disabled = !selectedSavedSession;

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
          if (categoryNote) categoryNote.textContent = "Select a subcategory to view and edit exercise profiles.";
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
        if (categoryNote) categoryNote.textContent = "Open an exercise to edit its preset. Picks stay active across categories and subcategories.";

        const rows = exercisesForTop(gymCurrentCategory, gymCurrentSubcategory);
        list.innerHTML = `
          ${rows.map((ex, idx) => {
            const key = gymRowKey(ex.section, ex.id, idx);
            const isSelected = gymSelectedExerciseKeys.has(key);
            const selectedOrder = gymSelectedExerciseOrder.indexOf(key);
            const presetSummary = formatGymPresetSummary(ex);
            const hasCustomPhoto = hasGymCustomPhoto(ex);
            return `
          <div class="gym-list-row ${isSelected ? "selected" : ""}" onclick="onGymRowClick(event,'${escapeJsString(gymCurrentCategory)}',${idx},'${escapeJsString(ex.section)}','${escapeJsString(ex.id)}')" ondblclick="openExerciseViewer('${escapeJsString(gymCurrentCategory)}', ${idx})">
            <div class="gym-list-sec">${escapeHtmlAttr(ex.section)}</div>
            <div class="gym-list-main">
              <div class="gym-card-name">${escapeHtmlAttr(ex.name)}</div>
              <div class="gym-card-desc">${escapeHtmlAttr(ex.desc || "")}</div>
              <div class="gym-list-meta">
                ${presetSummary ? `<div class="gym-pr-badge">PRESET: ${escapeHtmlAttr(presetSummary)}</div>` : ""}
                ${ex.targets ? `<div class="gym-pr-badge gym-target-badge">TARGETS: ${escapeHtmlAttr(ex.targets)}</div>` : ""}
                <div class="gym-pr-badge gym-ref-badge">PHOTO: ${hasCustomPhoto ? "CUSTOM" : "OFFLINE"}</div>
                ${ex.lastSession ? `<div class="gym-pr-badge">LAST: ${escapeHtmlAttr(formatGymLastSession(ex.lastSession))}</div>` : ""}
              </div>
            </div>
            <div class="gym-list-actions">
              <button
                class="confirm-btn routine-mini-btn gym-pick-btn ${isSelected ? "selected" : ""}"
                type="button"
                data-section="${escapeHtmlAttr(ex.section)}"
                data-id="${escapeHtmlAttr(ex.id)}"
                data-idx="${idx}"
                onclick="toggleGymExerciseFromButton(this, event)"
              >${isSelected ? selectedOrder + 1 : "PICK"}</button>
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
        routineData.catalog[section].push(normalizeGymCatalogExercise({
          id: `gx_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
          name,
          desc,
          photo,
        }));
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
        routineData.catalog[section].push(normalizeGymCatalogExercise({
          id: `gx_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
          name: "NEW EXERCISE",
          desc: "Tap to edit details",
          photo: "",
        }));
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

      function getPostingTemplateState() {
        if (!routineData) return buildDefaultPostingTemplateState();
        if (!routineData.postingTemplate || typeof routineData.postingTemplate !== "object") {
          routineData.postingTemplate = buildDefaultPostingTemplateState();
        }
        if (!Array.isArray(routineData.postingTemplate.items)) routineData.postingTemplate.items = [];
        return routineData.postingTemplate;
      }

      function renderPostingTemplate() {
        const listEl = document.getElementById("posting-template-list");
        const titleEl = document.getElementById("posting-template-board-title");
        const subtitleEl = document.getElementById("posting-template-board-subtitle");
        if (!listEl) return;
        const board = getPostingTemplateState();
        if (titleEl && titleEl.value !== String(board.title || "")) titleEl.value = String(board.title || "");
        if (subtitleEl && subtitleEl.value !== String(board.subtitle || "")) subtitleEl.value = String(board.subtitle || "");
        const rows = Array.isArray(board.items) ? board.items : [];
        listEl.innerHTML = rows.map((item, index) => `
          <article class="posting-template-item"
                   draggable="true"
                   ondragstart="onPostingTemplateDragStart(${index}, event)"
                   ondragover="onPostingTemplateDragOver(${index}, event)"
                   ondragleave="onPostingTemplateDragLeave(event)"
                   ondrop="onPostingTemplateDrop(${index}, event)">
            <div class="posting-template-item-head">
              <span class="posting-template-order">${escapeHtmlAttr(String(index + 1).padStart(2, "0"))}</span>
              <span class="posting-template-handle">::</span>
              <span class="posting-template-step">TIMELINE STAGE</span>
              <div class="posting-template-controls">
                <button class="confirm-btn routine-mini-btn" type="button" onclick="movePostingTemplateItem(${index}, -1)">UP</button>
                <button class="confirm-btn routine-mini-btn" type="button" onclick="movePostingTemplateItem(${index}, 1)">DOWN</button>
                <button class="x-btn routine-mini-btn" type="button" onclick="deletePostingTemplateItem('${escapeHtmlAttr(item.id)}')">X</button>
              </div>
            </div>
            <input class="posting-template-title-input"
                   type="text"
                   value="${escapeHtmlAttr(item.title || "")}"
                   placeholder="Stage title..."
                   oninput="updatePostingTemplateItemField('${escapeHtmlAttr(item.id)}', 'title', this.value)" />
            <textarea class="posting-template-subtext-input"
                      placeholder="Subtext / reference details..."
                      oninput="updatePostingTemplateItemField('${escapeHtmlAttr(item.id)}', 'subtext', this.value)">${escapeHtmlAttr(item.subtext || "")}</textarea>
          </article>
        `).join("") || `<div class="posting-template-empty">No posting stages yet. Add one to start the timeline.</div>`;
      }

      function updatePostingTemplateBoardField(field, value) {
        const board = getPostingTemplateState();
        if (field !== "title" && field !== "subtitle") return;
        board[field] = String(value || "");
        saveRoutineData();
      }

      function updatePostingTemplateItemField(id, field, value) {
        const board = getPostingTemplateState();
        if (field !== "title" && field !== "subtext") return;
        const row = (board.items || []).find((item) => String(item?.id || "") === String(id || ""));
        if (!row) return;
        row[field] = String(value || "");
        saveRoutineData();
      }

      function addPostingTemplateItem() {
        const board = getPostingTemplateState();
        const nextIndex = (Array.isArray(board.items) ? board.items.length : 0) + 1;
        board.items.push({
          id: `pt_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
          title: `New Stage ${nextIndex}`,
          subtext: "Add the mission style, reference notes, or execution detail here.",
        });
        saveRoutineData();
        renderPostingTemplate();
        setTimeout(() => {
          const rows = document.querySelectorAll(".posting-template-title-input");
          const input = rows[rows.length - 1];
          if (input && typeof input.focus === "function") {
            input.focus();
            if (typeof input.select === "function") input.select();
          }
        }, 40);
      }

      async function deletePostingTemplateItem(id) {
        if (!(await themedConfirm("Delete this posting template stage?"))) return;
        const board = getPostingTemplateState();
        board.items = (board.items || []).filter((item) => String(item?.id || "") !== String(id || ""));
        saveRoutineData();
        renderPostingTemplate();
      }

      function movePostingTemplateItem(index, direction) {
        const board = getPostingTemplateState();
        const rows = Array.isArray(board.items) ? board.items : [];
        const from = Number(index);
        const to = from + Number(direction || 0);
        if (from < 0 || to < 0 || from >= rows.length || to >= rows.length || from === to) return;
        const [moved] = rows.splice(from, 1);
        rows.splice(to, 0, moved);
        saveRoutineData();
        renderPostingTemplate();
      }

      function onPostingTemplateDragStart(index, event) {
        postingTemplateDragIndex = Number(index);
        if (event && event.dataTransfer) {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", String(index));
        }
      }

      function onPostingTemplateDragOver(index, event) {
        if (!event) return;
        event.preventDefault();
        const row = event.currentTarget;
        if (row && row.classList) row.classList.add("drag-over");
      }

      function onPostingTemplateDragLeave(event) {
        const row = event && event.currentTarget;
        if (row && row.classList) row.classList.remove("drag-over");
      }

      function onPostingTemplateDrop(index, event) {
        if (event) event.preventDefault();
        const row = event && event.currentTarget;
        if (row && row.classList) row.classList.remove("drag-over");
        const board = getPostingTemplateState();
        const rows = Array.isArray(board.items) ? board.items : [];
        const from = postingTemplateDragIndex;
        const to = Number(index);
        postingTemplateDragIndex = -1;
        if (from < 0 || to < 0 || from >= rows.length || to >= rows.length || from === to) return;
        const [moved] = rows.splice(from, 1);
        rows.splice(to, 0, moved);
        saveRoutineData();
        renderPostingTemplate();
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
        reminderCalendarSelectedDate = String(dateEl?.value || localDateKey(d) || "").trim();
        applyReminderLeadInputs([0]);
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
          host.innerHTML = `<div class="reminder-row"><div style="color:var(--term-dim);">Select a calendar date to view or add entries.</div></div>`;
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

      function getReminderLeadSelectValues() {
        return Array.from(document.querySelectorAll(".reminder-offset-slot"))
          .map((el) => Number(el.value))
          .filter((value) => Number.isFinite(value) && value > 0);
      }

      function applyReminderLeadInputs(offsets = [0]) {
        const normalized = normalizeReminderNotifyOffsets(offsets);
        const atTimeEl = document.getElementById("reminder-offset-at-time");
        if (atTimeEl) atTimeEl.checked = normalized.includes(0);
        const prior = normalized.filter((value) => value > 0).slice(0, REMINDER_MAX_PRIOR_ALERTS);
        const selects = Array.from(document.querySelectorAll(".reminder-offset-slot"));
        selects.forEach((select, index) => {
          select.value = String(prior[index] || "");
        });
      }

      function getReminderOffsetsFromForm() {
        const atTimeEl = document.getElementById("reminder-offset-at-time");
        const raw = [];
        if (atTimeEl?.checked) raw.push(0);
        raw.push(...getReminderLeadSelectValues());
        return normalizeReminderNotifyOffsets(raw, { allowAtTime: atTimeEl?.checked !== false });
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
        const offsets = getReminderOffsetsFromForm();
        if (!date || !title) return;
        const when = new Date(`${date}T${time}`);
        if (Number.isNaN(when.getTime())) return;
        routineData.reminders.push({
          id: `rem_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
          when: when.toISOString(),
          title,
          desc,
          notifyOffsets: offsets,
          syncToAppleCalendar: true,
        });
        if (titleEl) titleEl.value = "";
        if (descEl) descEl.value = "";
        applyReminderLeadInputs([0]);
        saveRoutineData();
        const dateEl2 = document.getElementById("reminder-date-input");
        if (dateEl2) dateEl2.value = localDateKey(when);
        reminderCalendarSelectedDate = localDateKey(when);
        reminderCalendarMonthCursor = new Date(when.getFullYear(), when.getMonth(), 1);
        renderReminderCalendar();
        renderReminderList();
        queueNativeNotificationRefresh(100, { prompt: true });
        queueOmniCalendarSync(100, { prompt: true });
      }

      async function deleteReminderEntry(id) {
        if (!(await themedConfirm("Are you sure you want to delete this?"))) return;
        if (!routineData) return;
        if (OMNI_PINNED_REMINDER_SPECS.some((spec) => String(spec.id || "") === String(id || ""))) {
          themedNotice("This reminder is pinned in OMNI and cannot be deleted from the calendar.");
          return;
        }
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
        reminderCalendarSelectedDate = candidate;
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
          const marker = active ? `<div class="reminder-cal-selected-marker"></div>` : "";
          cells.push(`
            <button class="reminder-cal-cell${active}" type="button" onclick="selectReminderCalendarDate('${key}')">
              <span>${day}</span>
              ${dot}
              ${marker}
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

      function omniCalendarSyncStateKey() {
        return OMNI_CALENDAR_SYNC_STATE_KEY;
      }

      function readOmniCalendarSyncState() {
        try {
          const raw = localStorage.getItem(omniCalendarSyncStateKey());
          const parsed = raw ? JSON.parse(raw) : {};
          const eventIds = parsed && typeof parsed.eventIds === "object" ? parsed.eventIds : {};
          return { eventIds };
        } catch (e) {
          return { eventIds: {} };
        }
      }

      function writeOmniCalendarSyncState(state) {
        const nextState = state && typeof state === "object" ? state : {};
        const eventIds = nextState && typeof nextState.eventIds === "object" ? nextState.eventIds : {};
        localStorage.setItem(omniCalendarSyncStateKey(), JSON.stringify({ eventIds }));
      }

      function getLocalNotificationsPlugin() {
        return window.Capacitor?.Plugins?.LocalNotifications || null;
      }

      function getOmniCalendarPlugin() {
        return window.Capacitor?.Plugins?.OmniCalendar || null;
      }

      function nativeNotificationsAvailable() {
        return isNativeRuntime() && !!getLocalNotificationsPlugin();
      }

      function nativeCalendarAvailable() {
        return isNativeRuntime() && !!getOmniCalendarPlugin();
      }

      function nativeNotificationsActive() {
        return nativeNotificationsAvailable() && notificationSettings.enabled && nativeNotificationPermission === "granted";
      }

      function nativeNotificationIdForKey(key) {
        const input = String(key || "");
        let hash = 2166136261;
        for (let i = 0; i < input.length; i += 1) {
          hash ^= input.charCodeAt(i);
          hash = Math.imul(hash, 16777619);
        }
        return (Math.abs(hash >>> 0) % 2147480000) + 1;
      }

      function readNativeNotificationSnapshot() {
        try {
          const raw = localStorage.getItem(NATIVE_NOTIFICATION_SNAPSHOT_KEY);
          const parsed = raw ? JSON.parse(raw) : [];
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          return [];
        }
      }

      function writeNativeNotificationSnapshot(rows) {
        localStorage.setItem(NATIVE_NOTIFICATION_SNAPSHOT_KEY, JSON.stringify(Array.isArray(rows) ? rows : []));
      }

      function queueNativeNotificationRefresh(delayMs = 350, options = {}) {
        if (!nativeNotificationsAvailable()) return;
        if (nativeNotificationRefreshTimer) clearTimeout(nativeNotificationRefreshTimer);
        nativeNotificationRefreshTimer = window.setTimeout(() => {
          nativeNotificationRefreshTimer = 0;
          refreshNativeNotifications(options).catch(() => {});
        }, Math.max(0, Number(delayMs || 0)));
      }

      function buildAppleCalendarSyncedReminders() {
        if (!routineData || !Array.isArray(routineData.reminders)) return [];
        return routineData.reminders
          .filter((row) => !!String(row?.id || "").trim() && row?.syncToAppleCalendar !== false)
          .sort((a, b) => new Date(a.when).getTime() - new Date(b.when).getTime());
      }

      function queueOmniCalendarSync(delayMs = 500, options = {}) {
        if (!nativeCalendarAvailable()) return;
        if (omniCalendarSyncTimer) clearTimeout(omniCalendarSyncTimer);
        omniCalendarSyncTimer = window.setTimeout(() => {
          omniCalendarSyncTimer = 0;
          refreshOmniCalendarSync(options).catch(() => {});
        }, Math.max(0, Number(delayMs || 0)));
      }

      async function ensureOmniCalendarPermission(options = {}) {
        const plugin = getOmniCalendarPlugin();
        if (!plugin) return false;
        const prompt = options.prompt === true;
        const showNotice = options.showNotice === true;
        let state = "prompt";
        try {
          const status = await plugin.checkPermissions();
          state = String(status?.calendar || "prompt");
        } catch (e) {}
        if (state !== "granted" && state !== "write-only" && prompt) {
          try {
            const requested = await plugin.requestPermissions();
            state = String(requested?.calendar || state);
          } catch (e) {}
        }
        omniCalendarPermission = state;
        if (showNotice && state !== "granted" && state !== "write-only") {
          themedNotice("Apple Calendar access is not allowed yet. Enable Calendar access for OMNI DEV on iPhone.");
        }
        return state === "granted" || state === "write-only";
      }

      function buildAppleCalendarPayload(reminder) {
        const startAt = new Date(reminder?.when || "");
        if (Number.isNaN(startAt.getTime())) return null;
        const endAt = new Date(startAt.getTime() + OMNI_CALENDAR_EVENT_DURATION_MS);
        const offsets = Array.isArray(reminder?.notifyOffsets) && reminder.notifyOffsets.length
          ? reminder.notifyOffsets.map((value) => Number(value)).filter((value) => Number.isFinite(value) && value >= 0)
          : [0];
        const desc = String(reminder?.desc || "").trim();
        const notes = [
          desc,
          "Created by OMNI.",
        ].filter(Boolean).join("\n\n");
        return {
          syncKey: `reminder:${String(reminder?.id || "").trim()}`,
          title: String(reminder?.title || "Reminder"),
          notes,
          startDate: startAt.toISOString(),
          endDate: endAt.toISOString(),
          alarmsMins: [...new Set(offsets)],
        };
      }

      async function refreshOmniCalendarSync(options = {}) {
        const plugin = getOmniCalendarPlugin();
        if (!plugin) return false;
        const prompt = options.prompt === true;
        const syncedReminders = buildAppleCalendarSyncedReminders();
        const previousState = readOmniCalendarSyncState();
        const previousIds = previousState && typeof previousState.eventIds === "object" ? previousState.eventIds : {};
        const desiredIds = new Set(syncedReminders.map((row) => String(row?.id || "").trim()).filter(Boolean));
        const granted = await ensureOmniCalendarPermission({ prompt, showNotice: prompt });
        if (!granted) return false;

        const nextEventIds = {};
        const staleReminderIds = Object.keys(previousIds).filter((reminderId) => !desiredIds.has(String(reminderId || "").trim()));
        for (const staleReminderId of staleReminderIds) {
          const staleEventId = String(previousIds[staleReminderId] || "").trim();
          if (!staleEventId) continue;
          await plugin.deleteEvent({ eventId: staleEventId }).catch(() => {});
        }

        for (const reminder of syncedReminders) {
          const reminderId = String(reminder?.id || "").trim();
          const payload = buildAppleCalendarPayload(reminder);
          if (!reminderId || !payload) continue;
          const existingEventId = String(previousIds[reminderId] || "").trim();
          const result = await plugin.upsertEvent({
            eventId: existingEventId,
            ...payload,
          }).catch(() => null);
          const nextEventId = String(result?.eventId || existingEventId || "").trim();
          if (nextEventId) nextEventIds[reminderId] = nextEventId;
        }

        writeOmniCalendarSyncState({ eventIds: nextEventIds });
        return true;
      }

      async function ensureNativeNotificationPermission(options = {}) {
        const plugin = getLocalNotificationsPlugin();
        if (!plugin) return false;
        const prompt = options.prompt === true;
        const showNotice = options.showNotice === true;
        let state = "prompt";
        try {
          const status = await plugin.checkPermissions();
          state = String(status?.display || "prompt");
        } catch (e) {}
        if (state !== "granted" && prompt) {
          try {
            const requested = await plugin.requestPermissions();
            state = String(requested?.display || state);
          } catch (e) {}
        }
        nativeNotificationPermission = state;
        if (showNotice && state !== "granted") {
          themedNotice("Phone notifications are not allowed yet. Enable them when iPhone prompts you.");
        }
        return state === "granted";
      }

      function notificationLeadText(offsetMins) {
        const mins = Number(offsetMins || 0);
        if (mins === 0) return "now";
        if (mins % 1440 === 0) return `${mins / 1440} day(s) prior`;
        if (mins % 60 === 0) return `${mins / 60} hour(s) prior`;
        return `${mins} min prior`;
      }

      function notificationWithinQuietHours(dateLike) {
        if (!notificationSettings.quietEnabled) return false;
        const value = dateLike instanceof Date ? dateLike : new Date(dateLike);
        if (!Number.isFinite(value.getTime())) return false;
        const start = String(notificationSettings.quietStart || "22:00");
        const end = String(notificationSettings.quietEnd || "07:00");
        const parseMins = (input, fallback) => {
          const match = String(input || "").match(/^(\d{1,2}):(\d{2})$/);
          if (!match) return fallback;
          const h = Math.max(0, Math.min(23, Number(match[1] || 0)));
          const m = Math.max(0, Math.min(59, Number(match[2] || 0)));
          return (h * 60) + m;
        };
        const nowMins = value.getHours() * 60 + value.getMinutes();
        const startMins = parseMins(start, 22 * 60);
        const endMins = parseMins(end, 7 * 60);
        if (startMins === endMins) return true;
        if (startMins < endMins) return nowMins >= startMins && nowMins < endMins;
        return nowMins >= startMins || nowMins < endMins;
      }

      function buildReminderNativeNotifications(nowMs, horizonMs) {
        if (!routineData || !Array.isArray(routineData.reminders)) return [];
        const out = [];
        routineData.reminders.forEach((r) => {
          const whenMs = new Date(r.when).getTime();
          if (!Number.isFinite(whenMs)) return;
          const offsets = Array.isArray(r.notifyOffsets) && r.notifyOffsets.length ? r.notifyOffsets : [0];
          offsets.forEach((offsetMins) => {
            const atMs = whenMs - (Number(offsetMins || 0) * 60000);
            if (atMs <= nowMs + 15000 || atMs > horizonMs) return;
            const key = `rem:${r.id}:${offsetMins}`;
            out.push({
              key,
              id: nativeNotificationIdForKey(key),
              title: "Reminder",
              body: Number(offsetMins || 0) === 0
                ? String(r.title || "Reminder")
                : `${String(r.title || "Reminder")} (${notificationLeadText(offsetMins)})`,
              at: new Date(atMs).toISOString(),
              extra: { omniSource: "omni-app", key, kind: "reminder" },
            });
          });
        });
        return out;
      }

      function buildQuarterNativeNotifications(nowMs, horizonMs) {
        const out = [];
        forEachQuarterWindowInRange(nowMs, horizonMs, ({ qNum, qStart, opDay }) => {
          const atMs = qStart.getTime();
          if (atMs <= nowMs + 15000 || atMs > horizonMs) return;
          const key = `quarter:${opDay}:Q${qNum}`;
          const copy = getQuarterAlertCopy(qNum);
          out.push({
            key,
            id: nativeNotificationIdForKey(key),
            title: copy.title,
            body: copy.body,
            at: qStart.toISOString(),
            extra: { omniSource: "omni-app", key, kind: "quarter" },
          });
        });
        return out;
      }

      function buildHourNativeNotifications(nowMs, horizonMs) {
        const out = [];
        forEachQuarterWindowInRange(nowMs, horizonMs, ({ qNum, qStart, opDay }) => {
          [2, 3].forEach((hourNumber) => {
            const startAt = new Date(qStart.getTime() + (hourNumber - 1) * 60 * 60000);
            const atMs = startAt.getTime();
            if (atMs <= nowMs + 15000 || atMs > horizonMs) return;
            const key = `hour:${opDay}:Q${qNum}:H${hourNumber}`;
            const copy = getQuarterHourAlertCopy(qNum, hourNumber);
            out.push({
              key,
              id: nativeNotificationIdForKey(key),
              title: copy.title,
              body: copy.body,
              at: startAt.toISOString(),
              extra: { omniSource: "omni-app", key, kind: "hour" },
            });
          });
        });
        return out;
      }

      function buildBreakNativeNotifications(nowMs, horizonMs) {
        const out = [];
        const breakStarts = [25, 55, 85, 115, 145, 175];
        forEachQuarterWindowInRange(nowMs, horizonMs, ({ qNum, qStart, opDay, preset }) => {
          if (preset) return;
          breakStarts.forEach((minute, index) => {
            const startAt = new Date(qStart.getTime() + minute * 60000);
            const atMs = startAt.getTime();
            if (atMs <= nowMs + 15000 || atMs > horizonMs) return;
            const breakIndex = index + 1;
            const key = `break:${opDay}:Q${qNum}:B${breakIndex}`;
            const copy = getQuarterBreakAlertCopy(qNum, breakIndex);
            out.push({
              key,
              id: nativeNotificationIdForKey(key),
              title: copy.title,
              body: copy.body,
              at: startAt.toISOString(),
              extra: { omniSource: "omni-app", key, kind: "break" },
            });
          });
        });
        return out;
      }

      function buildUpcomingTaskNativeNotifications(nowMs, horizonMs) {
        const out = [];
        const now = new Date(nowMs);
        const q = getQuarterState(now);
        const opDay = operationalDayKey(now);
        const plan = loadMissionPlan(opDay);
        for (let qi = 0; qi < DASHBOARD_QUARTER_COUNT; qi += 1) {
          if (getQuarterPreset(qi + 1)) continue;
          const qStart = new Date(q.dayStart.getTime() + qi * QUARTER_DURATION_MS);
          const defs = [
            { slot: 1, startMin: 0, kind: "mission" },
            { slot: 2, startMin: 30, kind: "mission" },
            { slot: 3, startMin: 60, kind: "mission" },
            { slot: 4, startMin: 90, kind: "mission" },
            { slot: 5, startMin: 120, kind: "recovery" },
            { slot: 6, startMin: 150, kind: "recovery" },
          ];
          defs.forEach((d) => {
            if (d.kind !== "mission") return;
            const startAt = new Date(qStart.getTime() + d.startMin * 60000);
            const triggerAt = new Date(startAt.getTime() - 5 * 60000);
            const atMs = triggerAt.getTime();
            if (atMs <= nowMs + 15000 || atMs > horizonMs) return;
            const planned = getPlannedMission(plan, qi + 1, d.slot);
            if (!planned.missionName && !planned.operation) return;
            const label = d.kind === "mission"
              ? `${planned.operation || "Operation"} - ${planned.missionName || "Mission Task"}`
              : `Recovery - ${planned.missionName || "UNASSIGNED"}`;
            const key = `upcoming:${opDay}:Q${qi + 1}:S${d.slot}:${startAt.toISOString()}`;
            out.push({
              key,
              id: nativeNotificationIdForKey(key),
              title: "Upcoming Task",
              body: `Q${qi + 1} Block ${d.slot} in 5m: ${label}`,
              at: triggerAt.toISOString(),
              extra: { omniSource: "omni-app", key, kind: "upcoming" },
            });
          });
        }
        return out;
      }

      function buildChecklistNativeNotifications(nowMs, horizonMs) {
        if (!Array.isArray(checklistItems)) return [];
        const pending = checklistItems.filter((x) => !x.done);
        if (!pending.length) return [];
        const intervalMs = 3 * 60 * 60 * 1000;
        const nextAtMs = Math.ceil((nowMs + 60000) / intervalMs) * intervalMs;
        if (nextAtMs <= nowMs + 15000 || nextAtMs > horizonMs) return [];
        const preview = pending.slice(0, 2).map((x) => x.text).join(" | ");
        const key = `checklist-native:${Math.floor(nextAtMs / intervalMs)}`;
        return [{
          key,
          id: nativeNotificationIdForKey(key),
          title: "Checklist Pending",
          body: `${pending.length} item(s) pending. ${preview}`,
          at: new Date(nextAtMs).toISOString(),
          extra: { omniSource: "omni-app", key, kind: "checklist" },
        }];
      }

      function buildNativeNotificationRows() {
        if (!notificationSettings.enabled) return [];
        const nowMs = Date.now();
        const horizonMs = nowMs + (72 * 60 * 60 * 1000);
        let rows = [];
        if (notificationSettings.reminder) rows = rows.concat(buildReminderNativeNotifications(nowMs, horizonMs));
        if (notificationSettings.quarter) {
          rows = rows.concat(buildQuarterNativeNotifications(nowMs, horizonMs));
          rows = rows.concat(buildHourNativeNotifications(nowMs, horizonMs));
          rows = rows.concat(buildBreakNativeNotifications(nowMs, horizonMs));
        }
        if (notificationSettings.upcoming) rows = rows.concat(buildUpcomingTaskNativeNotifications(nowMs, horizonMs));
        if (notificationSettings.checklist) rows = rows.concat(buildChecklistNativeNotifications(nowMs, horizonMs));
        rows = rows.filter((row) => row && row.key && row.at).sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
        const deduped = [];
        const seen = new Set();
        rows.forEach((row) => {
          if (seen.has(row.key)) return;
          seen.add(row.key);
          deduped.push(row);
        });
        return deduped.filter((row) => !notificationWithinQuietHours(new Date(row.at))).slice(0, 56);
      }

      async function cancelManagedNativeNotifications(plugin, rows) {
        const snapshot = Array.isArray(rows) ? rows : readNativeNotificationSnapshot();
        const ids = [...new Set(snapshot.map((row) => Number(row?.id)).filter((id) => Number.isInteger(id) && id > 0))];
        if (!ids.length) return;
        await plugin.cancel({ notifications: ids.map((id) => ({ id })) }).catch(() => {});
      }

      async function refreshNativeNotifications(options = {}) {
        const plugin = getLocalNotificationsPlugin();
        if (!plugin) return false;
        const prompt = options.prompt === true;
        if (!notificationSettings.enabled) {
          await cancelManagedNativeNotifications(plugin);
          writeNativeNotificationSnapshot([]);
          return false;
        }
        const granted = await ensureNativeNotificationPermission({ prompt, showNotice: prompt });
        if (!granted) {
          await cancelManagedNativeNotifications(plugin);
          writeNativeNotificationSnapshot([]);
          return false;
        }
        const nextRows = buildNativeNotificationRows();
        await cancelManagedNativeNotifications(plugin);
        if (nextRows.length) {
          await plugin.schedule({
            notifications: nextRows.map((row) => ({
              id: row.id,
              title: row.title,
              body: row.body,
              schedule: { at: new Date(row.at) },
              sound: nativeNotificationSoundName(row?.extra?.kind || ""),
              threadIdentifier: OMNI_NOTIFICATION_THREAD_ID,
              extra: row.extra,
            })),
          });
        }
        writeNativeNotificationSnapshot(nextRows);
        return true;
      }

      async function initNativeNotifications() {
        const plugin = getLocalNotificationsPlugin();
        if (!plugin || nativeNotificationListenersBound) {
          if (plugin) queueNativeNotificationRefresh(300, { prompt: false });
          return;
        }
        nativeNotificationListenersBound = true;
        plugin.addListener("localNotificationReceived", (notification) => {
          const key = String(notification?.extra?.key || "");
          pushNotification(String(notification?.title || "Alert"), String(notification?.body || ""), key, String(notification?.extra?.kind || ""));
        }).catch(() => {});
        plugin.addListener("localNotificationActionPerformed", (result) => {
          const notification = result?.notification;
          const key = String(notification?.extra?.key || "");
          pushNotification(String(notification?.title || "Alert"), String(notification?.body || ""), key, String(notification?.extra?.kind || ""));
        }).catch(() => {});
        await ensureNativeNotificationPermission({ prompt: notificationSettings.enabled, showNotice: false });
        queueNativeNotificationRefresh(300, { prompt: false });
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
        recordSyncCenterEvent("manual_sync", { message: "Manual sync triggered." });
        if (currentView === "settings") renderSyncCenter();
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
            upcoming: parsed?.upcoming !== false,
            checklist: parsed?.checklist !== false,
            sound: String(parsed?.sound || "matrix"),
            quietEnabled: !!parsed?.quietEnabled,
            quietStart: String(parsed?.quietStart || "22:00"),
            quietEnd: String(parsed?.quietEnd || "07:00"),
          };
        } catch (e) {
          notificationSettings = {
            enabled: true,
            quarter: true,
            reminder: true,
            upcoming: true,
            checklist: true,
            sound: "matrix",
            quietEnabled: false,
            quietStart: "22:00",
            quietEnd: "07:00",
          };
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
        const upcomingEl = document.getElementById("notify-upcoming");
        const checklistEl = document.getElementById("notify-checklist");
        const quietEnabledEl = document.getElementById("notify-quiet-enabled");
        const quietStartEl = document.getElementById("notify-quiet-start");
        const quietEndEl = document.getElementById("notify-quiet-end");
        const soundEl = document.getElementById("notify-sound");
        if (enabledEl) enabledEl.checked = !!notificationSettings.enabled;
        if (quarterEl) quarterEl.checked = !!notificationSettings.quarter;
        if (reminderEl) reminderEl.checked = !!notificationSettings.reminder;
        if (upcomingEl) upcomingEl.checked = !!notificationSettings.upcoming;
        if (checklistEl) checklistEl.checked = !!notificationSettings.checklist;
        if (quietEnabledEl) quietEnabledEl.checked = !!notificationSettings.quietEnabled;
        if (quietStartEl) quietStartEl.value = notificationSettings.quietStart || "22:00";
        if (quietEndEl) quietEndEl.value = notificationSettings.quietEnd || "07:00";
        if (soundEl) soundEl.value = notificationSettings.sound || "matrix";
        renderNotificationHistory();
      }

      function saveNotificationSettings() {
        const enabledEl = document.getElementById("notify-enabled");
        const quarterEl = document.getElementById("notify-quarter");
        const reminderEl = document.getElementById("notify-reminder");
        const upcomingEl = document.getElementById("notify-upcoming");
        const checklistEl = document.getElementById("notify-checklist");
        const quietEnabledEl = document.getElementById("notify-quiet-enabled");
        const quietStartEl = document.getElementById("notify-quiet-start");
        const quietEndEl = document.getElementById("notify-quiet-end");
        const soundEl = document.getElementById("notify-sound");
        notificationSettings = {
          enabled: !!enabledEl?.checked,
          quarter: !!quarterEl?.checked,
          reminder: !!reminderEl?.checked,
          upcoming: !!upcomingEl?.checked,
          checklist: !!checklistEl?.checked,
          sound: String(soundEl?.value || "matrix"),
          quietEnabled: !!quietEnabledEl?.checked,
          quietStart: String(quietStartEl?.value || "22:00"),
          quietEnd: String(quietEndEl?.value || "07:00"),
        };
        localStorage.setItem(notificationSettingsKey(), JSON.stringify(notificationSettings));
        queueNativeNotificationRefresh(100, { prompt: true });
        if (currentView === "settings") renderSyncCenter();
      }

      function resetNotificationField(field) {
        const defaults = {
          enabled: true,
          quarter: true,
          reminder: true,
          upcoming: true,
          checklist: true,
          sound: "matrix",
          quietEnabled: false,
          quietStart: "22:00",
          quietEnd: "07:00",
        };
        const enabledEl = document.getElementById("notify-enabled");
        const quarterEl = document.getElementById("notify-quarter");
        const reminderEl = document.getElementById("notify-reminder");
        const upcomingEl = document.getElementById("notify-upcoming");
        const checklistEl = document.getElementById("notify-checklist");
        const quietEnabledEl = document.getElementById("notify-quiet-enabled");
        const quietStartEl = document.getElementById("notify-quiet-start");
        const quietEndEl = document.getElementById("notify-quiet-end");
        const soundEl = document.getElementById("notify-sound");
        if (field === "enabled" && enabledEl) enabledEl.checked = defaults.enabled;
        if (field === "quarter" && quarterEl) quarterEl.checked = defaults.quarter;
        if (field === "reminder" && reminderEl) reminderEl.checked = defaults.reminder;
        if (field === "upcoming" && upcomingEl) upcomingEl.checked = defaults.upcoming;
        if (field === "checklist" && checklistEl) checklistEl.checked = defaults.checklist;
        if (field === "sound" && soundEl) soundEl.value = defaults.sound;
        if (field === "quiet") {
          if (quietEnabledEl) quietEnabledEl.checked = defaults.quietEnabled;
          if (quietStartEl) quietStartEl.value = defaults.quietStart;
          if (quietEndEl) quietEndEl.value = defaults.quietEnd;
        }
        saveNotificationSettings();
      }

      function resetNotificationSettings() {
        localStorage.removeItem(notificationSettingsKey());
        loadNotificationSettings();
        queueNativeNotificationRefresh(100, { prompt: true });
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

      function inferNotificationKind(title = "", key = "", kind = "") {
        const explicit = String(kind || "").trim().toLowerCase();
        if (explicit) return explicit;
        const rawKey = String(key || "").trim().toLowerCase();
        if (rawKey.startsWith("quarter:")) return "quarter";
        if (rawKey.startsWith("hour:")) return "hour";
        if (rawKey.startsWith("break:")) return "break";
        if (rawKey.startsWith("rem:")) return "reminder";
        if (rawKey.startsWith("upcoming:")) return "upcoming";
        if (rawKey.startsWith("checklist:")) return "checklist";
        if (rawKey.startsWith("test:")) return "test";
        const rawTitle = String(title || "").trim().toLowerCase();
        if (rawTitle.includes("quarter")) return "quarter";
        if (rawTitle.includes("hour")) return "hour";
        if (rawTitle.includes("break")) return "break";
        if (rawTitle.includes("reminder")) return "reminder";
        return "generic";
      }

      function notificationToneFromKind(kind = "") {
        const value = String(kind || "").trim().toLowerCase();
        if (value === "quarter") return "quarter";
        if (value === "hour" || value === "upcoming") return "hour";
        if (value === "break") return "break";
        if (value === "reminder") return "reminder";
        return "neutral";
      }

      function nativeNotificationSoundName(kind = "") {
        const value = inferNotificationKind("", "", kind);
        if (value === "quarter") return "omni_quarter_beep.wav";
        if (value === "hour") return "omni_hour_beep.wav";
        if (value === "break") return "omni_break_beep.wav";
        return "omni_alert_beep.wav";
      }

      function notificationSoundPattern(kind = "") {
        const value = inferNotificationKind("", "", kind);
        if (value === "quarter") {
          return [{ f: 784, t: 0.07 }, { f: 1046, t: 0.08 }, { f: 1318, t: 0.12 }];
        }
        if (value === "hour" || value === "upcoming") {
          return [{ f: 659, t: 0.08 }, { f: 880, t: 0.12 }];
        }
        if (value === "break") {
          return [{ f: 440, t: 0.07 }, { f: 349, t: 0.07 }, { f: 440, t: 0.11 }];
        }
        if (value === "reminder" || value === "test") {
          return [{ f: 698, t: 0.08 }, { f: 523, t: 0.12 }];
        }
        if (value === "checklist") {
          return [{ f: 523, t: 0.06 }, { f: 523, t: 0.12 }];
        }
        return [{ f: 698, t: 0.08 }, { f: 523, t: 0.12 }];
      }

      function notificationSoundProfile(mode = "") {
        const value = String(mode || "matrix").trim().toLowerCase();
        if (value === "ping") {
          return { oscType: "sine", peakGain: 0.085, spacing: 0.02, stretch: 0.92 };
        }
        if (value === "soft") {
          return { oscType: "triangle", peakGain: 0.06, spacing: 0.045, stretch: 1.05 };
        }
        return { oscType: "triangle", peakGain: 0.12, spacing: 0.03, stretch: 1 };
      }

      function logNotificationHistory(title, message, key, kind = "") {
        const historyId = `h_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
        const resolvedKind = inferNotificationKind(title, key, kind);
        notificationHistory.push({
          id: historyId,
          key: key || "",
          title: String(title || ""),
          message: String(message || ""),
          kind: resolvedKind,
          createdAt: new Date().toISOString(),
          dismissedAt: "",
        });
        saveNotificationHistory();
        return historyId;
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
          <div class="notify-history-row notify-tone-${escapeHtmlAttr(notificationToneFromKind(x.kind || ""))}">
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

      function playNotificationSound(kind = "") {
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
          const seq = notificationSoundPattern(kind);
          const profile = notificationSoundProfile(mode);
          let at = ctx.currentTime;
          seq.forEach((x) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            const duration = x.t * profile.stretch;
            o.type = profile.oscType;
            o.frequency.value = x.f;
            g.gain.setValueAtTime(0.0001, at);
            g.gain.exponentialRampToValueAtTime(profile.peakGain, at + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, at + duration);
            o.connect(g);
            g.connect(ctx.destination);
            o.start(at);
            o.stop(at + duration + 0.02);
            at += duration + profile.spacing;
          });
        } catch (e) {}
      }

      async function testNotificationSound() {
        saveNotificationSettings();
        playNotificationSound("test");
        const plugin = getLocalNotificationsPlugin();
        if (!plugin) return;
        const granted = await ensureNativeNotificationPermission({ prompt: true, showNotice: true });
        if (!granted) return;
        const key = `test:${Date.now()}`;
        await plugin.schedule({
          notifications: [{
            id: nativeNotificationIdForKey(key),
            title: "OMNI Test Alert",
            body: "Phone notifications are active.",
            schedule: { at: new Date(Date.now() + 2000) },
            sound: nativeNotificationSoundName("test"),
            threadIdentifier: OMNI_NOTIFICATION_THREAD_ID,
            extra: { omniSource: "omni-app", key, kind: "test" },
          }],
        }).catch(() => {});
        themedNotice("Test phone alert scheduled.");
      }

      function pushNotification(title, message, key, kind = "") {
        if (!notificationSettings.enabled) return;
        if (notificationWithinQuietHours(new Date())) return;
        if (key && isNotificationFired(key)) return;
        const host = document.getElementById("notify-overlay");
        if (!host) return;
        const id = `n_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
        const resolvedKind = inferNotificationKind(title, key, kind);
        const tone = notificationToneFromKind(resolvedKind);
        const historyId = logNotificationHistory(title, message, key, resolvedKind);
        const card = document.createElement("div");
        card.className = `notify-card notify-tone-${tone}`;
        card.id = id;
        card.setAttribute("data-history-id", historyId);
        card.setAttribute("data-key", key || "");
        card.setAttribute("data-kind", resolvedKind);
        card.innerHTML = `
          <button class="x-btn notify-close" type="button" onclick="dismissNotification('${id}')">X</button>
          <div class="notify-title">${escapeHtmlAttr(title)}</div>
          <div class="notify-msg">${escapeHtmlAttr(message)}</div>
        `;
        host.prepend(card);
        if (host.children.length > 6) host.removeChild(host.lastElementChild);
        playNotificationSound(resolvedKind);
        if (key) rememberNotificationKey(key);
      }

      function dismissNotification(id) {
        const el = document.getElementById(id);
        const historyId = el ? String(el.getAttribute("data-history-id") || "") : "";
        if (historyId) {
          const row = notificationHistory.find((x) => String(x.id) === historyId);
          if (row && !row.dismissedAt) row.dismissedAt = new Date().toISOString();
          saveNotificationHistory();
          renderNotificationHistory();
        }
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
        for (let qi = 0; qi < DASHBOARD_QUARTER_COUNT; qi += 1) {
          if (getQuarterPreset(qi + 1)) continue;
          const qStart = new Date(q.dayStart.getTime() + qi * QUARTER_DURATION_MS);
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
              kind: d.kind,
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
        const useNative = nativeNotificationsActive();
        if (notificationSettings.quarter && !useNative) {
          const now = new Date();
          const nowMs = now.getTime();
          const q = getQuarterState(now);
          const opDay = operationalDayKey(now);
          const qKey = `quarter:${opDay}:Q${q.quarterIndex}`;
          const quarterDiffSec = Math.floor((nowMs - q.quarterStart.getTime()) / 1000);
          if (quarterDiffSec >= 0 && quarterDiffSec <= 55 && !isNotificationFired(qKey)) {
            const copy = getQuarterAlertCopy(q.quarterIndex);
            pushNotification(copy.title, copy.body, qKey, "quarter");
          }
          if (Number(q.minuteInQuarter || 0) >= 60) {
            const hourNumber = Number(q.minuteInQuarter || 0) >= 120 ? 3 : 2;
            const hKey = `hour:${opDay}:Q${q.quarterIndex}:H${hourNumber}`;
            const hourStart = new Date(q.quarterStart.getTime() + (hourNumber - 1) * 60 * 60000);
            const hourDiffSec = Math.floor((nowMs - hourStart.getTime()) / 1000);
            if (hourDiffSec >= 0 && hourDiffSec <= 55 && !isNotificationFired(hKey)) {
              const copy = getQuarterHourAlertCopy(q.quarterIndex, hourNumber);
              pushNotification(copy.title, copy.body, hKey, "hour");
            }
          }
          const breakIndex = currentBreakIndexFromQuarterState(q);
          if (breakIndex > 0) {
            const bKey = `break:${opDay}:Q${q.quarterIndex}:B${breakIndex}`;
            const breakStarts = [25, 55, 85, 115, 145, 175];
            const breakStart = new Date(q.quarterStart.getTime() + breakStarts[breakIndex - 1] * 60000);
            const breakDiffSec = Math.floor((nowMs - breakStart.getTime()) / 1000);
            if (breakDiffSec >= 0 && breakDiffSec <= 55 && !isNotificationFired(bKey)) {
              const copy = getQuarterBreakAlertCopy(q.quarterIndex, breakIndex);
              pushNotification(copy.title, copy.body, bKey, "break");
            }
          }
        }
        if (notificationSettings.reminder && !useNative && routineData && Array.isArray(routineData.reminders)) {
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
                pushNotification("Reminder", `${r.title} (${leadText})`, key, "reminder");
              }
            });
          });
        }
        const nextBlock = useNative ? null : getNextPlannedBlockInfo(new Date());
        if (notificationSettings.upcoming && nextBlock && nextBlock.kind === "mission" && nextBlock.mins >= 0 && nextBlock.mins <= 5) {
          const key = `upcoming:${nextBlock.key}`;
          pushNotification("Upcoming Task", `Q${nextBlock.quarter} Block ${nextBlock.slot} in ${nextBlock.mins}m: ${nextBlock.label}`, key, "upcoming");
        }
        if (notificationSettings.checklist && Array.isArray(checklistItems)) {
          const pending = checklistItems.filter((x) => !x.done);
          if (pending.length) {
            const bucket = Math.floor(Date.now() / (3 * 60 * 60 * 1000)); // every 3 hours
            const key = `checklist:${operationalDayKey(new Date())}:${bucket}`;
            const preview = pending.slice(0, 2).map((x) => x.text).join(" | ");
            pushNotification("Checklist Pending", `${pending.length} item(s) pending. ${preview}`, key, "checklist");
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
          const local = runOfflineTerminalCode(mode, code);
          if (local) {
            outEl.textContent = `mode=${escapeHtmlAttr(mode)} exit=${Number(local.exitCode || 0)} time=${Number(local.durationMs || 0)}ms [offline]\n\n${local.stdout || ""}${local.stderr ? `\n[stderr]\n${local.stderr}` : ""}`;
            return;
          }
          outEl.textContent = `Error: ${e.message}`;
        }
      }

      function splitTopLevelArgs(text) {
        const out = [];
        let current = "";
        let depth = 0;
        let quote = "";
        for (let i = 0; i < String(text || "").length; i += 1) {
          const ch = text[i];
          const prev = i > 0 ? text[i - 1] : "";
          if (quote) {
            current += ch;
            if (ch === quote && prev !== "\\") quote = "";
            continue;
          }
          if (ch === "'" || ch === "\"") {
            quote = ch;
            current += ch;
            continue;
          }
          if (ch === "[" || ch === "(") {
            depth += 1;
            current += ch;
            continue;
          }
          if (ch === "]" || ch === ")") {
            depth = Math.max(0, depth - 1);
            current += ch;
            continue;
          }
          if (ch === "," && depth === 0) {
            out.push(current.trim());
            current = "";
            continue;
          }
          current += ch;
        }
        if (current.trim()) out.push(current.trim());
        return out;
      }

      function formatOfflineTerminalValue(value) {
        if (Array.isArray(value)) return `[${value.map((item) => formatOfflineTerminalValue(item)).join(", ")}]`;
        if (value === null || value === undefined) return "";
        return String(value);
      }

      function evaluateOfflinePythonExpression(expr, env) {
        const raw = String(expr || "").trim();
        if (!raw) return "";
        if ((raw.startsWith("'") && raw.endsWith("'")) || (raw.startsWith("\"") && raw.endsWith("\""))) {
          return raw.slice(1, -1).replace(/\\n/g, "\n");
        }
        if (/^-?\d+(?:\.\d+)?$/.test(raw)) return Number(raw);
        if (/^\[.*\]$/.test(raw)) {
          const inner = raw.slice(1, -1).trim();
          if (!inner) return [];
          return splitTopLevelArgs(inner).map((part) => evaluateOfflinePythonExpression(part, env));
        }
        if (/^range\((.+)\)$/.test(raw)) {
          const match = raw.match(/^range\((.+)\)$/);
          const count = Number(evaluateOfflinePythonExpression(match[1], env) || 0);
          return Array.from({ length: Math.max(0, count) }, (_, idx) => idx);
        }
        if (/^(sqrt|len|sum|sorted)\((.*)\)$/.test(raw)) {
          const match = raw.match(/^(sqrt|len|sum|sorted)\((.*)\)$/);
          const fn = match[1];
          const value = evaluateOfflinePythonExpression(match[2], env);
          if (fn === "sqrt") return Math.sqrt(Number(value || 0));
          if (fn === "len") return Array.isArray(value) || typeof value === "string" ? value.length : 0;
          if (fn === "sum") return Array.isArray(value) ? value.reduce((sum, item) => sum + Number(item || 0), 0) : 0;
          if (fn === "sorted") return Array.isArray(value) ? value.slice().sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true })) : [];
        }
        if (Object.prototype.hasOwnProperty.call(env, raw)) return env[raw];
        if (!/^[\w\s+\-*/%()[\],.'"]+$/.test(raw)) throw new Error(`Unsupported offline python expression: ${raw}`);
        const scopeNames = Object.keys(env);
        const scopeValues = scopeNames.map((key) => env[key]);
        return Function(...scopeNames, "sqrt", "len", "sum", "sorted", `return (${raw});`)(
          ...scopeValues,
          (value) => Math.sqrt(Number(value || 0)),
          (value) => (Array.isArray(value) || typeof value === "string" ? value.length : 0),
          (value) => (Array.isArray(value) ? value.reduce((sum, item) => sum + Number(item || 0), 0) : 0),
          (value) => (Array.isArray(value) ? value.slice().sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true })) : [])
        );
      }

      function runOfflinePython(code) {
        const startedAt = Date.now();
        const env = {};
        const stdout = [];
        const stderr = [];
        const lines = String(code || "").replace(/\t/g, "  ").split(/\r?\n/);

        const executeBlock = (blockLines) => {
          for (let i = 0; i < blockLines.length; i += 1) {
            const rawLine = blockLines[i];
            const line = String(rawLine || "").trim();
            if (!line || line.startsWith("#")) continue;
            if (/^from\s+math\s+import\s+sqrt$/.test(line)) {
              env.sqrt = Math.sqrt;
              continue;
            }
            const forMatch = line.match(/^for\s+([A-Za-z_]\w*)\s+in\s+range\((.+)\):$/);
            if (forMatch) {
              const indent = rawLine.match(/^\s*/)[0].length;
              const nested = [];
              i += 1;
              while (i < blockLines.length) {
                const nextRaw = blockLines[i];
                if (!String(nextRaw || "").trim()) {
                  nested.push("");
                  i += 1;
                  continue;
                }
                const nextIndent = nextRaw.match(/^\s*/)[0].length;
                if (nextIndent <= indent) {
                  i -= 1;
                  break;
                }
                nested.push(nextRaw.slice(Math.min(nextIndent, indent + 2)));
                i += 1;
              }
              const rangeCount = Number(evaluateOfflinePythonExpression(forMatch[2], env) || 0);
              for (let loopIndex = 0; loopIndex < Math.max(0, rangeCount); loopIndex += 1) {
                env[forMatch[1]] = loopIndex;
                executeBlock(nested);
              }
              continue;
            }
            const assignMatch = line.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/);
            if (assignMatch) {
              env[assignMatch[1]] = evaluateOfflinePythonExpression(assignMatch[2], env);
              continue;
            }
            const printMatch = line.match(/^print\((.*)\)$/);
            if (printMatch) {
              const parts = splitTopLevelArgs(printMatch[1]);
              const rendered = parts.map((part) => formatOfflineTerminalValue(evaluateOfflinePythonExpression(part, env)));
              stdout.push(rendered.join(" "));
              continue;
            }
            stderr.push(`Unsupported offline python line: ${line}`);
          }
        };

        try {
          executeBlock(lines);
        } catch (e) {
          stderr.push(String(e?.message || e));
        }
        return {
          stdout: stdout.join("\n"),
          stderr: stderr.join("\n"),
          exitCode: stderr.length ? 1 : 0,
          durationMs: Date.now() - startedAt,
        };
      }

      function expandOfflineBashText(text, env) {
        return String(text || "").replace(/\$([A-Za-z_]\w*)/g, (_, key) => String(env[key] ?? ""));
      }

      function runOfflineBash(code) {
        const startedAt = Date.now();
        const env = { PWD: "/omni", USER: "omni", SHELL: "/bin/bash" };
        const files = ["OperationDir", "assets", "data", "ManagementApp.html", "MissionBriefing.md", "ProbeSkill.md", "OfficialProbeManuel.md"];
        const stdout = [];
        const stderr = [];
        const lines = String(code || "").split(/\r?\n/);

        const runCommand = (command) => {
          const line = String(command || "").trim();
          if (!line || line.startsWith("#")) return;
          const inlineLoop = line.match(/^for\s+([A-Za-z_]\w*)\s+in\s+(.+?);\s*do\s+(.+?)\s*;\s*done$/);
          if (inlineLoop) {
            const values = inlineLoop[2].trim().split(/\s+/).filter(Boolean);
            values.forEach((value) => {
              env[inlineLoop[1]] = value;
              runCommand(expandOfflineBashText(inlineLoop[3], env));
            });
            return;
          }
          if (/^pwd$/.test(line)) {
            stdout.push(env.PWD);
            return;
          }
          if (/^ls(?:\s+-la?)?$/.test(line)) {
            stdout.push(files.join("\n"));
            return;
          }
          if (/^whoami$/.test(line)) {
            stdout.push(env.USER);
            return;
          }
          if (/^date$/.test(line)) {
            stdout.push(new Date().toString());
            return;
          }
          if (/^uname(?:\s+-a)?$/.test(line)) {
            stdout.push("OMNI iPhone Sandbox");
            return;
          }
          if (/^cd\b/.test(line)) {
            const target = line.replace(/^cd\s*/, "").trim();
            env.PWD = target ? (target.startsWith("/") ? target : `${env.PWD}/${target}`.replace(/\/+/g, "/")) : "/omni";
            return;
          }
          if (/^echo\s+/.test(line)) {
            stdout.push(expandOfflineBashText(line.replace(/^echo\s+/, ""), env).replace(/^["']|["']$/g, ""));
            return;
          }
          if (/^printf\s+/.test(line)) {
            const text = expandOfflineBashText(line.replace(/^printf\s+/, ""), env).replace(/^["']|["']$/g, "");
            stdout.push(text.replace(/\\n/g, "\n"));
            return;
          }
          if (/^cat\s+/.test(line)) {
            const target = line.replace(/^cat\s+/, "").trim();
            stdout.push(`offline preview of ${target}`);
            return;
          }
          if (/^help$/.test(line)) {
            stdout.push("Offline bash supports: pwd, ls, whoami, date, uname, cd, echo, printf, cat, for ...; do ...; done");
            return;
          }
          stderr.push(`Unsupported offline bash command: ${line}`);
        };

        lines.forEach((line) => runCommand(line));
        return {
          stdout: stdout.join("\n"),
          stderr: stderr.join("\n"),
          exitCode: stderr.length ? 1 : 0,
          durationMs: Date.now() - startedAt,
        };
      }

      function runOfflineTerminalCode(mode, code) {
        if (!shouldPreferOfflineSnapshots()) return null;
        if (String(mode || "") === "bash") return runOfflineBash(code);
        return runOfflinePython(code);
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
        renderOperationFocus();
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
        renderOperationFocus();
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
          {
            text: "Create a new Control Manuel",
            subtext: "Perception; Understanding; Cortisol, Dopamine, Serotonin; Dopamine is the drive system; Cortisol is the body's notification and alert system; Both are limited systems and can invert or destabilize if they are not regulated enough; Systems; History; Survival; Fight, Flight, Freeze; Capability; Computational ability; Intention; Knowledge hierarchy; Frustration and Habits; Computational and Non-Computational life; Selfish Gain; Perceived value and actual value; Scripts as an intermedium; Protecting against scripts; The more you open your servers and accept scripts, the easier it is to get pulled in; Focus can act as a shield unless the focus itself is a script; Anything can trigger a script: sound, sight, exposure; What type of life do you want: computational or non-computational?; There is no wrong answer because life is limited; At this point there is no value in comfort when the environment, house, and foundation were built by the father system; Money may be self-made through skill, but without independent structure such as a house or job, identity and leverage stay exposed; External Systems and their influence; System Optimisation; Fate Model; Fork Model; PCP; Cognitive Distortion based on exposure; Gender Influence; Gender timeline of ability and capability; Culture and religion then Law; Monopoly systems; Syntax, Systems, Security, learning the basic components; Different levels of society are gated by syntax, finance, wealth, and entry systems; Most people we see are usually in our own category; The world is far larger than we think; Beyond survival: enjoy life, reject complacency, test your limits, and go for it; Probing, indexing, data analysis, OSINT, and seeing what can be achieved; Reference the opening chapter of Official Probe Manuel",
            overwriteSubtext: true,
          },
        ];
      }

      function mergeChecklistSeedItems() {
        const existing = new Set(
          checklistItems.map((x) => `${String(x.text || "").toLowerCase()}::${String(x.subtext || "").toLowerCase()}`)
        );
        for (const seed of checklistSeedItems()) {
          const text = String(seed.text || "").trim();
          const subtext = String(seed.subtext || "").trim();
          const overwriteSubtext = !!seed.overwriteSubtext;
          if (!text) continue;
          const existingItem = checklistItems.find((x) => String(x.text || "").trim().toLowerCase() === text.toLowerCase());
          if (existingItem) {
            if (overwriteSubtext && subtext && String(existingItem.subtext || "").trim() !== subtext) {
              existing.delete(`${text.toLowerCase()}::${String(existingItem.subtext || "").trim().toLowerCase()}`);
              existingItem.subtext = subtext;
              existing.add(`${text.toLowerCase()}::${subtext.toLowerCase()}`);
            }
            continue;
          }
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

      function migrateChecklistSeedItems() {
        checklistItems = (Array.isArray(checklistItems) ? checklistItems : []).filter((item) => {
          const text = String(item?.text || "").trim().toLowerCase();
          const subtext = String(item?.subtext || "").trim().toLowerCase();
          if (text === "protecting against scripts" && subtext === "control manuel") return false;
          return true;
        });
      }

      function loadChecklistItems() {
        try {
          const raw = localStorage.getItem(checklistStorageKey());
          const parsed = raw ? JSON.parse(raw) : [];
          checklistItems = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          checklistItems = [];
        }
        migrateChecklistSeedItems();
        mergeChecklistSeedItems();
        saveChecklistItems();
        renderChecklist();
      }

      function saveChecklistItems() {
        localStorage.setItem(checklistStorageKey(), JSON.stringify(checklistItems));
        queueNativeNotificationRefresh(250, { prompt: false });
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

      function stripMissionTextMarkup(text) {
        return String(text || "")
          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
          .replace(/\*\*([^*]+)\*\*/g, "$1")
          .replace(/__([^_]+)__/g, "$1")
          .replace(/`([^`]+)`/g, "$1")
          .replace(/<\/?[^>]+>/g, "")
          .replace(/\s+/g, " ")
          .trim();
      }

      const MISSION_SEMANTIC_FIELD_ALIASES = {
        Mission: [
          "mission",
          "mission brief",
          "mission plan",
          "mission overview",
          "mission outline",
          "mission summary",
          "instagram probe mission",
          "instagram engagement test",
          "social experiment",
          "experiment brief",
        ],
        Objective: [
          "goal",
          "objective",
          "purpose",
          "mission objective",
          "test objective",
          "today s goal",
          "primary goal",
          "mission definition",
        ],
        Target: [
          "target",
          "target audience",
          "audience",
          "users",
          "target layers",
          "who what is being targeted",
        ],
        Platform: [
          "platform",
          "system",
          "platform system",
        ],
        Execution: [
          "execution",
          "strategy",
          "approach",
          "method",
          "move",
          "content",
          "content strategy",
          "content type",
          "content idea",
          "post format",
          "structure",
          "message",
          "slides",
          "example theme",
          "example statement",
        ],
        Metric: [
          "metric",
          "metrics",
          "measurement",
          "measure",
          "success metric",
          "success measure",
          "success indicator",
          "success condition",
          "proxy metric",
          "outcome metric",
          "key metric",
          "measurement window",
        ],
        Hypothesis: [
          "hypothesis",
          "mechanism",
          "psychological lever",
          "psychological trigger",
          "core emotion angle",
          "latent variable",
          "trigger",
          "angle",
          "tone",
          "variables",
          "experiment variables",
        ],
        "Probe Plan": [
          "probe plan",
          "probe",
          "test",
          "experiment",
          "evaluation window",
          "test window",
          "test duration",
          "observation period",
          "observation",
          "deploy",
        ],
        Checklist: [
          "execution checklist",
          "immediate execution checklist",
          "checklist",
          "execution steps",
          "execution block",
          "steps",
          "action block",
        ],
        "Open Questions": [
          "open questions",
          "questions",
          "unknown block",
          "assumptions",
          "hook question",
        ],
        "Next Action": [
          "next action",
          "first move",
          "next move",
          "decision",
          "continue stop pivot",
        ],
        Outcome: [
          "outcome",
          "result summary",
          "delta vs expected",
          "result",
        ],
      };

      function missionSemanticSlug(value) {
        return stripMissionTextMarkup(value)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, " ")
          .trim();
      }

      function missionCanonicalFieldKey(label) {
        const slug = missionSemanticSlug(label);
        if (!slug) return "";
        for (const [canonical, aliases] of Object.entries(MISSION_SEMANTIC_FIELD_ALIASES)) {
          if ([canonical, ...(Array.isArray(aliases) ? aliases : [])].some((alias) => missionSemanticSlug(alias) === slug)) {
            return canonical;
          }
        }
        return "";
      }

      function missionLooksLikeDocumentTitle(value) {
        const clean = normalizeMissionSectionTitle(value);
        const slug = missionSemanticSlug(clean);
        if (!clean || !slug) return false;
        if (missionCanonicalFieldKey(clean) === "Mission") return true;
        if (slug.includes("mission") || slug.includes("probe") || slug.includes("experiment") || slug.includes("brief")) {
          return clean.split(/\s+/).length <= 8;
        }
        return false;
      }

      function missionSectionLooksLikeStandaloneLabel(value, nextLine = "") {
        const clean = normalizeMissionSectionTitle(value);
        if (!clean) return false;
        if (/^[-*_]{3,}$/.test(clean)) return false;
        if (parseMissionFieldLine(clean) || missionBulletText(clean)) return false;
        if (/[.!?]$/.test(clean)) return false;
        const words = clean.split(/\s+/).filter(Boolean);
        if (!words.length || words.length > 6) return false;
        if (!nextLine) return false;
        return !!missionCanonicalFieldKey(clean);
      }

      function normalizeMissionSectionTitle(value) {
        return stripMissionTextMarkup(
          String(value || "")
            .replace(/^#+\s*/, "")
            .replace(/[：:]\s*$/, "")
        );
      }

      function missionSectionKey(value) {
        return normalizeMissionSectionTitle(value).toLowerCase();
      }

      function missionBulletText(line) {
        const raw = String(line || "").trim();
        const match = raw.match(/^[-*+]\s+(.+)$/) || raw.match(/^\d+\.\s+(.+)$/);
        return match ? stripMissionTextMarkup(match[1]) : "";
      }

      function parseMissionFieldLine(line) {
        const clean = stripMissionTextMarkup(String(line || "").trim())
          .replace(/^[-*+]\s+/, "")
          .replace(/^\d+\.\s+/, "")
          .trim();
        if (!clean) return null;
        const match = clean.match(/^([A-Za-z][A-Za-z0-9 '&()\/+._-]{0,96})\s*:\s*(.*)$/);
        if (!match) return null;
        return {
          key: normalizeMissionSectionTitle(match[1]),
          value: stripMissionTextMarkup(match[2]),
        };
      }

      function parseMissionStructuredDocument(text) {
        const lines = String(text || "").replace(/\r\n/g, "\n").split("\n");
        const sections = [];
        let title = "";
        let current = { title: "Overview", lines: [] };
        const pushCurrent = () => {
          if (!current) return;
          const hasLines = current.lines.some((line) => String(line || "").trim());
          const cleanTitle = normalizeMissionSectionTitle(current.title);
          if (!cleanTitle && !hasLines) return;
          if (cleanTitle === "Overview" && !hasLines) return;
          sections.push({
            title: cleanTitle || "Overview",
            lines: current.lines.slice(),
          });
        };
        lines.forEach((rawLine) => {
          const line = String(rawLine || "").trimEnd();
          if (/^[-*_]{3,}\s*$/.test(String(line || "").trim())) {
            current.lines.push("");
            return;
          }
          const heading = line.match(/^(#{1,4})\s+(.+)$/);
          if (heading) {
            const headingTitle = normalizeMissionSectionTitle(heading[2]);
            if (heading[1].length === 1 && !title) {
              title = headingTitle;
              return;
            }
            pushCurrent();
            current = { title: headingTitle || "Section", lines: [] };
            return;
          }
          current.lines.push(line);
        });
        pushCurrent();
        return { title, sections };
      }

      function normalizeMissionProfileSections(text) {
        const parsed = parseMissionStructuredDocument(text);
        let derivedTitle = normalizeMissionSectionTitle(parsed.title);
        const sections = [];
        const pushSection = (section) => {
          if (!section) return;
          const normalizedSection = {
            title: normalizeMissionSectionTitle(section.title),
            rows: (Array.isArray(section.rows) ? section.rows : []).filter((row) => row.key),
            bullets: (Array.isArray(section.bullets) ? section.bullets : []).filter(Boolean),
            paragraphs: (Array.isArray(section.paragraphs) ? section.paragraphs : []).filter(Boolean),
          };
          if (normalizedSection.title || normalizedSection.rows.length || normalizedSection.bullets.length || normalizedSection.paragraphs.length) {
            sections.push(normalizedSection);
          }
        };
        parsed.sections.forEach((section) => {
          let current = {
            title: normalizeMissionSectionTitle(section.title),
            rows: [],
            bullets: [],
            paragraphs: [],
          };
          let lastType = "";
          const flushCurrent = () => {
            pushSection(current);
            current = { title: "", rows: [], bullets: [], paragraphs: [] };
            lastType = "";
          };
          const lines = Array.isArray(section.lines) ? section.lines : [];
          for (let idx = 0; idx < lines.length; idx += 1) {
            const trimmed = String(lines[idx] || "").trim();
            if (!trimmed) {
              lastType = "";
              continue;
            }
            const field = parseMissionFieldLine(trimmed);
            if (field) {
              const canonicalKey = missionCanonicalFieldKey(field.key);
              current.rows.push({
                key: canonicalKey || normalizeMissionSectionTitle(field.key),
                value: field.value,
              });
              lastType = `row:${current.rows.length - 1}`;
              continue;
            }
            const bullet = missionBulletText(trimmed);
            if (bullet) {
              current.bullets.push(bullet);
              lastType = `bullet:${current.bullets.length - 1}`;
              continue;
            }
            const plain = stripMissionTextMarkup(trimmed);
            if (!plain) continue;
            const nextLine = lines.slice(idx + 1).map((line) => stripMissionTextMarkup(String(line || "").trim())).find(Boolean) || "";
            const currentHasContent = current.rows.length || current.bullets.length || current.paragraphs.length;
            if (!derivedTitle && !currentHasContent && missionLooksLikeDocumentTitle(plain)) {
              derivedTitle = plain;
              continue;
            }
            if (missionSectionLooksLikeStandaloneLabel(plain, nextLine)) {
              const label = missionCanonicalFieldKey(plain) || normalizeMissionSectionTitle(plain);
              if (!currentHasContent && (!current.title || missionSectionKey(current.title) === "overview")) {
                current.title = label;
              } else if (missionSectionKey(current.title) === missionSectionKey(label) && !currentHasContent) {
                current.title = label;
              } else {
                flushCurrent();
                current.title = label;
              }
              continue;
            }
            if (lastType.startsWith("row:")) {
              const rowIndex = Number(lastType.split(":")[1]);
              if (current.rows[rowIndex]) current.rows[rowIndex].value = current.rows[rowIndex].value ? `${current.rows[rowIndex].value} ${plain}` : plain;
              continue;
            }
            if (lastType.startsWith("bullet:")) {
              const bulletIndex = Number(lastType.split(":")[1]);
              if (current.bullets[bulletIndex]) current.bullets[bulletIndex] = `${current.bullets[bulletIndex]} ${plain}`.trim();
              continue;
            }
            current.paragraphs.push(plain);
            lastType = `paragraph:${current.paragraphs.length - 1}`;
          }
          flushCurrent();
        });
        return {
          title: derivedTitle || normalizeMissionSectionTitle(parsed.title),
          sections,
        };
      }

      function missionSectionSummary(section) {
        if (!section) return "";
        if (section.rows.length) return String(section.rows[0]?.value || "").trim();
        if (section.paragraphs.length) return String(section.paragraphs[0] || "").trim();
        if (section.bullets.length) return String(section.bullets[0] || "").trim();
        return "";
      }

      function findMissionSection(sections, names = []) {
        const wanted = new Set((Array.isArray(names) ? names : [names]).map((name) => missionSectionKey(name)));
        return (Array.isArray(sections) ? sections : []).find((section) => wanted.has(missionSectionKey(section?.title || ""))) || null;
      }

      function firstMissionValue(...values) {
        for (const value of values) {
          const clean = stripMissionTextMarkup(value);
          if (clean) return clean;
        }
        return "";
      }

      function collectMissionFieldMap(sections) {
        const fieldMap = {};
        (Array.isArray(sections) ? sections : []).forEach((section) => {
          section.rows.forEach((row) => {
            if (row.key && row.value && !fieldMap[row.key]) fieldMap[row.key] = row.value;
            const canonicalKey = missionCanonicalFieldKey(row.key);
            if (canonicalKey && row.value && !fieldMap[canonicalKey]) fieldMap[canonicalKey] = row.value;
          });
          const sectionSummary = firstMissionValue(...section.paragraphs, ...section.bullets);
          if (section.title && sectionSummary && !fieldMap[section.title]) fieldMap[section.title] = sectionSummary;
          const canonicalSectionKey = missionCanonicalFieldKey(section.title);
          if (canonicalSectionKey && sectionSummary && !fieldMap[canonicalSectionKey]) fieldMap[canonicalSectionKey] = sectionSummary;
        });
        return fieldMap;
      }

      function buildMissionProfileData(text, kind = "brief", meta = {}) {
        const normalized = normalizeMissionProfileSections(text);
        const sections = normalized.sections;
        const fieldMap = collectMissionFieldMap(sections);
        const isDebrief = String(kind || "").toLowerCase() === "debrief";
        const summary = isDebrief
          ? firstMissionValue(
              fieldMap["Outcome"],
              fieldMap["Outcome"],
              fieldMap["Delta vs expected"],
              fieldMap["Metric"],
              fieldMap["Decision"],
              missionSectionSummary(findMissionSection(sections, ["Result Summary", "Measurements", "Decision", "Outcome", "Metric"]))
            )
          : firstMissionValue(
              fieldMap["Objective"],
              fieldMap["Today’s goal"],
              fieldMap["Primary goal"],
              fieldMap["Objective"],
              fieldMap["Purpose"],
              fieldMap["Mission Definition"],
              fieldMap["Execution"],
              missionSectionSummary(findMissionSection(sections, ["Objective", "Purpose", "Mission Definition", "Execution", "Overview", "Context"]))
            );
        const title = firstMissionValue(
          fieldMap["Mission"],
          normalized.title,
          meta.name,
          isDebrief ? "Mission Debrief" : "Mission Brief"
        );
        const operation = firstMissionValue(fieldMap["Operation"], meta.operation);
        const status = firstMissionValue(fieldMap["Status"], meta.status, isDebrief ? "COMPLETE" : "PENDING");
        const target = firstMissionValue(
          fieldMap["Target"],
          fieldMap["Who/what is being targeted"],
          fieldMap["Target"],
          fieldMap["Target audience"],
          fieldMap["Audience"],
          missionSectionSummary(findMissionSection(sections, ["Target", "Target Layers", "Audience"]))
        );
        const nextMove = isDebrief
          ? firstMissionValue(
              fieldMap["Next Action"],
              fieldMap["Next action"],
              fieldMap["Continue / Stop / Pivot"],
              fieldMap["Decision"],
              fieldMap["Probe Plan"],
              missionSectionSummary(findMissionSection(sections, ["Next Probe", "Decision", "Probe Plan"]))
            )
          : firstMissionValue(
              fieldMap["Next Action"],
              fieldMap["First move"],
              fieldMap["Move"],
              fieldMap["Next action"],
              fieldMap["Execution"],
              fieldMap["Probe Plan"],
              missionSectionSummary(findMissionSection(sections, ["Next Action", "Plan", "First Probe", "Execution", "Probe Plan"]))
            );
        const metric = firstMissionValue(
          fieldMap["Metric"],
          fieldMap["Metrics"],
          fieldMap["Success condition"],
          fieldMap["Success Metric"],
          fieldMap["Proxy metric"]
        );
        const platform = firstMissionValue(fieldMap["Platform"], fieldMap["Platform / System"], fieldMap["System"]);
        const highlightRows = (isDebrief
          ? [
              { key: "Operation", value: operation },
              { key: "Mission", value: firstMissionValue(fieldMap["Mission"], meta.name, title) },
              { key: "Status", value: status },
              { key: "Outcome", value: firstMissionValue(fieldMap["Outcome"], summary) },
              { key: "Decision", value: firstMissionValue(fieldMap["Continue / Stop / Pivot"], fieldMap["Decision"]) },
              { key: "Metric", value: metric },
              { key: "Next Probe", value: nextMove },
            ]
          : [
              { key: "Operation", value: operation },
              { key: "Mission", value: firstMissionValue(fieldMap["Mission"], meta.name, title) },
              { key: "Status", value: status },
              { key: "Objective", value: firstMissionValue(fieldMap["Objective"], fieldMap["Primary goal"], fieldMap["Today’s goal"], summary) },
              { key: "Target", value: target },
              { key: "Platform", value: platform },
              { key: "Metric", value: metric },
              { key: "Next Move", value: nextMove },
            ])
          .filter((row) => row.value);
        return {
          kind: isDebrief ? "debrief" : "brief",
          title,
          summary,
          status,
          sections,
          fieldMap,
          highlights: highlightRows,
        };
      }

      function buildMissionProfileSignals(profile) {
        const out = [];
        const seen = new Set();
        const push = (key, value) => {
          const cleanKey = normalizeMissionSectionTitle(key);
          const cleanValue = stripMissionTextMarkup(value);
          if (!cleanKey || !cleanValue) return;
          const sig = `${cleanKey.toLowerCase()}::${cleanValue.toLowerCase()}`;
          if (seen.has(sig)) return;
          seen.add(sig);
          out.push({ key: cleanKey, value: cleanValue });
        };
        (profile?.highlights || []).forEach((row) => push(row.key, row.value));
        (profile?.sections || []).forEach((section) => {
          section.rows.forEach((row) => push(row.key, row.value));
          if (!section.rows.length) push(section.title, missionSectionSummary(section));
        });
        return out.slice(0, 14);
      }

      function buildMissionProfileSectionHtml(section) {
        const rowHtml = [];
        section.rows.forEach((row) => {
          rowHtml.push(`
            <div class="mission-dossier-row">
              <div class="mission-dossier-key">${escapeHtmlAttr(row.key)}</div>
              <div class="mission-dossier-value">${escapeHtmlAttr(row.value || "—")}</div>
            </div>
          `);
        });
        section.bullets.forEach((item, index) => {
          rowHtml.push(`
            <div class="mission-dossier-row">
              <div class="mission-dossier-key">ITEM ${index + 1}</div>
              <div class="mission-dossier-value">${escapeHtmlAttr(item)}</div>
            </div>
          `);
        });
        section.paragraphs.forEach((item, index) => {
          rowHtml.push(`
            <div class="mission-dossier-row">
              <div class="mission-dossier-key">${index === 0 ? "SUMMARY" : "NOTE"}</div>
              <div class="mission-dossier-value">${escapeHtmlAttr(item)}</div>
            </div>
          `);
        });
        return `
          <section class="mission-dossier-block">
            <div class="mission-dossier-block-title">${escapeHtmlAttr(section.title || "Section")}</div>
            <div class="mission-dossier-block-body">
              ${rowHtml.join("") || `<div class="mission-dossier-empty">No structured details in this section yet.</div>`}
            </div>
          </section>
        `;
      }

      function buildMissionProfileHtml(text, kind = "brief", meta = {}) {
        const cleanText = String(text || "").trim();
        if (!cleanText) {
          return `<div class="mission-dossier-empty">Paste a consistent ${String(kind || "brief").toLowerCase()} template to auto-fill this profile offline.</div>`;
        }
        const profile = buildMissionProfileData(cleanText, kind, meta);
        const sectionHtml = profile.sections.map((section) => buildMissionProfileSectionHtml(section)).join("");
        const highlightsHtml = profile.highlights.length
          ? `<div class="mission-profile-highlights">
              ${profile.highlights.map((row) => `
                <div class="mission-highlight-card">
                  <span class="mission-highlight-key">${escapeHtmlAttr(row.key)}</span>
                  <span class="mission-highlight-value">${escapeHtmlAttr(row.value)}</span>
                </div>
              `).join("")}
            </div>`
          : "";
        return `
          <div class="mission-profile-stack">
            <div class="mission-profile-hero">
              <div class="mission-profile-kicker">${profile.kind === "debrief" ? "DEBRIEF PROFILE" : "BRIEF PROFILE"} :: OFFLINE STRUCTURED VIEW</div>
              <div class="mission-profile-name">${escapeHtmlAttr(profile.title)}</div>
              <div class="mission-profile-subdesc">${escapeHtmlAttr(profile.summary || "Structured fields will appear here as you paste the template.")}</div>
            </div>
            ${highlightsHtml}
            <div class="mission-profile-sections">
              ${sectionHtml || `<div class="mission-dossier-empty">No structured sections detected yet.</div>`}
            </div>
          </div>
        `;
      }

      function findDefaultMissionCommandPath() {
        if (missionCommandSelectedPath && allMissions.some((item) => String(item?.path || "") === String(missionCommandSelectedPath))) {
          return missionCommandSelectedPath;
        }
        const active = allMissions.find((item) => String(item?.status || "").toUpperCase() === "IN_PROGRESS");
        if (active?.path) return String(active.path);
        const pending = allMissions.find((item) => String(item?.status || "").toUpperCase() === "PENDING");
        if (pending?.path) return String(pending.path);
        return String(allMissions[0]?.path || "");
      }

      async function loadMissionCommandData(path) {
        const missionPath = String(path || "").trim();
        if (!missionPath) return null;
        if (missionCommandCache[missionPath]) return missionCommandCache[missionPath];
        const meta = missionMetaFromPath(missionPath);
        const [briefRes, debriefRes] = await Promise.all([
          fetch(`/api/mission/brief?mission_path=${encodeURIComponent(missionPath)}`, { cache: "no-store" }),
          fetch(`/api/mission/debrief?mission_path=${encodeURIComponent(missionPath)}`, { cache: "no-store" }),
        ]);
        const briefData = briefRes.ok ? await briefRes.json().catch(() => ({ content: "" })) : { content: "" };
        const debriefData = debriefRes.ok ? await debriefRes.json().catch(() => ({ content: "" })) : { content: "" };
        const payload = {
          meta,
          brief: String(briefData?.content || ""),
          debrief: String(debriefData?.content || ""),
          briefLatest: briefData?.latest || null,
          debriefLatest: debriefData?.latest || null,
        };
        missionCommandCache[missionPath] = payload;
        return payload;
      }

      function buildMissionCommandActionsHtml(state) {
        if (!state) return `<div class="mission-dossier-empty">No mission selected.</div>`;
        const briefProfile = buildMissionProfileData(state.brief || "", "brief", state.meta || {});
        const debriefProfile = buildMissionProfileData(state.debrief || "", "debrief", state.meta || {});
        const blockers = [
          briefProfile.fieldMap["Risk"],
          briefProfile.fieldMap["Biggest blocker"],
          briefProfile.fieldMap["Constraint"],
          debriefProfile.fieldMap["Blocker"],
          debriefProfile.fieldMap["Failure point"],
        ].map((x) => String(x || "").trim()).filter(Boolean);
        const nextMove = firstMissionValue(
          briefProfile.fieldMap["Next action"],
          briefProfile.fieldMap["First move"],
          briefProfile.fieldMap["Move"],
          debriefProfile.fieldMap["Next action"],
          debriefProfile.fieldMap["Next Probe"],
          debriefProfile.fieldMap["Decision"],
          "No next move detected yet."
        );
        const metrics = [
          briefProfile.fieldMap["Proxy metric"],
          briefProfile.fieldMap["Metric"],
          briefProfile.fieldMap["Success condition"],
          debriefProfile.fieldMap["Outcome"],
        ].map((x) => String(x || "").trim()).filter(Boolean);
        return `
          <div class="mission-profile-stack">
            <div class="mission-highlight-card">
              <span class="mission-highlight-key">Next Move</span>
              <span class="mission-highlight-value">${escapeHtmlAttr(nextMove)}</span>
            </div>
            <div class="mission-highlight-card">
              <span class="mission-highlight-key">Blockers</span>
              <span class="mission-highlight-value">${escapeHtmlAttr(blockers.join(" | ") || "No blockers parsed yet.")}</span>
            </div>
            <div class="mission-highlight-card">
              <span class="mission-highlight-key">Metrics</span>
              <span class="mission-highlight-value">${escapeHtmlAttr(metrics.join(" | ") || "No metrics parsed yet.")}</span>
            </div>
            <div class="settings-actions">
              <button class="confirm-btn" type="button" onclick="openSelectedMissionCommandEditor()">OPEN MISSION</button>
              <button class="confirm-btn" type="button" onclick="switchView('mission-probe')">OPEN MISSION + PROBE</button>
              <button class="confirm-btn" type="button" onclick="switchView('mission-log')">OPEN MISSION LOG</button>
            </div>
          </div>
        `;
      }

      function renderMissionCommandOptions() {
        const opSelect = document.getElementById("mission-command-operation-filter");
        const missionSelect = document.getElementById("mission-command-select");
        if (!opSelect || !missionSelect) return;
        const ops = ["ALL"].concat([...new Set(allMissions.map((item) => String(item?.operation || "").trim()).filter(Boolean))]);
        const currentOp = String(opSelect.value || "ALL");
        opSelect.innerHTML = ops.map((op) => `<option value="${escapeHtmlAttr(op)}" ${op === currentOp ? "selected" : ""}>${escapeHtmlAttr(op)}</option>`).join("");
        const filtered = allMissions.filter((item) => currentOp === "ALL" || String(item?.operation || "").trim() === currentOp);
        const preferred = missionCommandSelectedPath || findDefaultMissionCommandPath();
        if (!filtered.some((item) => String(item?.path || "") === preferred)) {
          missionCommandSelectedPath = String(filtered[0]?.path || "");
        } else {
          missionCommandSelectedPath = preferred;
        }
        missionSelect.innerHTML = filtered.map((item) => `
          <option value="${escapeHtmlAttr(item.path || "")}" ${String(item.path || "") === String(missionCommandSelectedPath || "") ? "selected" : ""}>
            ${escapeHtmlAttr(item.operation || "Operation")} :: ${escapeHtmlAttr(item.name || "Mission")} :: ${escapeHtmlAttr(item.status || "PENDING")}
          </option>
        `).join("") || `<option value="">No missions</option>`;
      }

      async function renderMissionCommand() {
        renderMissionCommandOptions();
        const summaryHost = document.getElementById("mission-command-summary");
        const actionsHost = document.getElementById("mission-command-actions");
        const briefHost = document.getElementById("mission-command-brief-profile");
        const debriefHost = document.getElementById("mission-command-debrief-profile");
        if (!summaryHost || !actionsHost || !briefHost || !debriefHost) return;
        const path = String(document.getElementById("mission-command-select")?.value || missionCommandSelectedPath || findDefaultMissionCommandPath());
        missionCommandSelectedPath = path;
        if (!path) {
          summaryHost.innerHTML = `<div class="mission-dossier-empty">No mission available yet.</div>`;
          actionsHost.innerHTML = `<div class="mission-dossier-empty">Create or sync a mission first.</div>`;
          briefHost.innerHTML = `<div class="mission-dossier-empty">No brief loaded.</div>`;
          debriefHost.innerHTML = `<div class="mission-dossier-empty">No debrief loaded.</div>`;
          return;
        }
        summaryHost.innerHTML = `<div class="routine-ex-note">Loading mission command state...</div>`;
        try {
          const state = await loadMissionCommandData(path);
          const briefProfile = buildMissionProfileData(state?.brief || "", "brief", state?.meta || {});
          const debriefProfile = buildMissionProfileData(state?.debrief || "", "debrief", state?.meta || {});
          summaryHost.innerHTML = `
            <div class="mission-profile-highlights">
              <div class="mission-highlight-card"><span class="mission-highlight-key">Operation</span><span class="mission-highlight-value">${escapeHtmlAttr(state?.meta?.operation || "—")}</span></div>
              <div class="mission-highlight-card"><span class="mission-highlight-key">Mission</span><span class="mission-highlight-value">${escapeHtmlAttr(state?.meta?.name || "—")}</span></div>
              <div class="mission-highlight-card"><span class="mission-highlight-key">Status</span><span class="mission-highlight-value">${escapeHtmlAttr(state?.meta?.status || "PENDING")}</span></div>
              <div class="mission-highlight-card"><span class="mission-highlight-key">Brief Saved</span><span class="mission-highlight-value">${escapeHtmlAttr(state?.briefLatest?.created_at ? formatLocalDateTime(state.briefLatest.created_at) : (state?.brief ? "Offline only" : "No brief yet"))}</span></div>
              <div class="mission-highlight-card"><span class="mission-highlight-key">Debrief Saved</span><span class="mission-highlight-value">${escapeHtmlAttr(state?.debriefLatest?.created_at ? formatLocalDateTime(state.debriefLatest.created_at) : (state?.debrief ? "Offline only" : "No debrief yet"))}</span></div>
              <div class="mission-highlight-card"><span class="mission-highlight-key">Objective</span><span class="mission-highlight-value">${escapeHtmlAttr(briefProfile.summary || "No structured objective parsed yet.")}</span></div>
            </div>
          `;
          actionsHost.innerHTML = buildMissionCommandActionsHtml(state);
          briefHost.innerHTML = buildMissionProfileHtml(state?.brief || "", "brief", state?.meta || {});
          debriefHost.innerHTML = state?.debrief
            ? buildMissionProfileHtml(state.debrief, "debrief", state.meta || {})
            : `<div class="mission-dossier-empty">No debrief saved yet for this mission.</div>`;
        } catch (e) {
          summaryHost.innerHTML = `<div class="mission-dossier-empty">Mission command load failed: ${escapeHtmlAttr(e?.message || "Unknown error")}</div>`;
          actionsHost.innerHTML = `<div class="mission-dossier-empty">Open the mission directly and resave the brief if needed.</div>`;
          briefHost.innerHTML = `<div class="mission-dossier-empty">No brief loaded.</div>`;
          debriefHost.innerHTML = `<div class="mission-dossier-empty">No debrief loaded.</div>`;
        }
      }

      function onMissionCommandSelectionChange() {
        const missionSelect = document.getElementById("mission-command-select");
        missionCommandSelectedPath = String(missionSelect?.value || "");
        renderMissionCommand();
      }

      function onMissionCommandOperationChange() {
        missionCommandSelectedPath = "";
        renderMissionCommand();
      }

      function refreshMissionCommand() {
        if (missionCommandSelectedPath) delete missionCommandCache[missionCommandSelectedPath];
        renderMissionCommand();
      }

      function openSelectedMissionCommandEditor() {
        const path = String(document.getElementById("mission-command-select")?.value || missionCommandSelectedPath || "");
        if (!path) {
          themedNotice("Select a mission first.");
          return;
        }
        openMissionEditor(path);
      }

      function openGymExerciseBySection(section, exId) {
        const targetSection = String(section || "").trim();
        const targetId = String(exId || "").trim();
        if (!targetSection || !targetId || !routineData?.catalog) return false;
        const top = Array.isArray(routineData.topCategories)
          ? routineData.topCategories.find((cat) => getTopCategorySections(cat).includes(targetSection))
          : "";
        const rows = Array.isArray(routineData.catalog[targetSection]) ? routineData.catalog[targetSection] : [];
        const idx = rows.findIndex((row) => String(row?.id || "") === targetId);
        if (!top || idx < 0) return false;
        gymCurrentCategory = top;
        gymCurrentSubcategory = targetSection;
        switchView("gym-planner");
        openExerciseViewer(top, idx);
        return true;
      }

      function buildGlobalSearchResults() {
        const q = String(globalSearchQuery || "").trim().toLowerCase();
        const scope = String(globalSearchScope || "all");
        if (!q) return [];
        const results = [];
        const allow = (...buckets) => scope === "all" || buckets.includes(scope);
        const push = (type, title, subtitle, body, payload = {}) => {
          const blob = [type, title, subtitle, body].join(" ").toLowerCase();
          if (!blob.includes(q)) return;
          results.push({ type, title, subtitle, body, payload });
        };
        if (allow("missions")) {
          allMissions.forEach((item) => push("MISSION", item?.name || "Mission", `${item?.operation || ""} :: ${item?.status || "PENDING"}`, item?.path || "", { missionPath: item?.path || "" }));
        }
        if (allow("operations")) {
          allOps.forEach((item) => push("OPERATION", item?.name || "Operation", item?.path || "", item?.status || "", { operationName: item?.name || "" }));
        }
        if (allow("intel")) {
          allBlackbook.forEach((item) => push("BLACKBOOK", item?.Mission || item?.Probe_ID || "Blackbook", item?.Operation || "", [item?.Description, item?.Notes, item?.Hypothesis].join(" "), { blackbookQuery: item?.Probe_ID || item?.Mission || "" }));
          allHvi.forEach((item) => push("HVI", item?.handle || "Target", item?.category || item?.Status || "", [item?.brief, item?.description, item?.handle].join(" "), { hviQuery: item?.handle || "" }));
          allDatawells.forEach((item) => push("DATAWELL", item?.title || "Datawell", item?.sourceType || item?.platform || "", [item?.description, item?.community, item?.painpoints, item?.entryPoints, item?.notes, item?.tags, item?.link].join(" "), { datawellId: item?.id || "" }));
        }
        if (allow("docs")) {
          booksCatalog.forEach((item) => push("BOOK", item?.title || item?.file || "Manual", item?.path || item?.file || "", item?.sourcePath || "", { bookPath: item?.path || item?.file || "", title: item?.title || item?.file || "Manual", sourcePath: item?.sourcePath || item?.file || "" }));
          blueprintCatalog.forEach((item) => push("ORACLE", item?.title || item?.file || "Oracle Doc", item?.file || "", item?.sourcePath || "", { blueprintFile: item?.file || "", title: item?.title || item?.file || "", sourcePath: item?.sourcePath || item?.file || "" }));
        }
        if (allow("routine")) {
          (checklistItems || []).forEach((item) => push("CHECKLIST", item?.text || "Checklist", item?.subtext || "", item?.done ? "done" : "pending", { view: "checklist" }));
          ["morning", "night"].forEach((period) => {
            (routineData?.[period] || []).forEach((item) => {
              push("ROUTINE", item?.title || "Routine Task", period.toUpperCase(), [item?.desc, ...(Array.isArray(item?.descChecks) ? item.descChecks.map((row) => row.text) : [])].join(" "), { routinePeriod: period });
            });
          });
          if (routineData?.postingTemplate) {
            push("POSTING TEMPLATE", routineData.postingTemplate.title || "Posting Template", "TIMELINE BOARD", routineData.postingTemplate.subtitle || "", { view: "posting-template" });
            (routineData.postingTemplate.items || []).forEach((item) => {
              push("POSTING STAGE", item?.title || "Stage", "POSTING TEMPLATE", item?.subtext || "", { view: "posting-template" });
            });
          }
          (routineData?.reminders || []).forEach((item) => push("REMINDER", item?.title || "Reminder", formatReminderWhen(item?.when), item?.desc || "", { view: "checklist" }));
          (routineData?.journal || []).forEach((item) => push("JOURNAL", item?.title || "Journal", formatJournalTime(item?.at), item?.desc || "", { view: "journal" }));
        }
        if (allow("gym")) {
          Object.keys(routineData?.catalog || {}).forEach((section) => {
            (routineData.catalog[section] || []).forEach((row) => {
              push("GYM", row?.name || "Exercise", section, [row?.desc, row?.targets, row?.source].join(" "), { gymSection: section, gymId: row?.id || "" });
            });
          });
        }
        return results.slice(0, 120);
      }

      function renderGlobalSearch() {
        const host = document.getElementById("global-search-results");
        if (!host) return;
        globalSearchResults = buildGlobalSearchResults();
        if (!String(globalSearchQuery || "").trim()) {
          host.innerHTML = `<div class="mission-dossier-empty">Type to search across the app.</div>`;
          return;
        }
        if (!globalSearchResults.length) {
          host.innerHTML = `<div class="mission-dossier-empty">No matches for "${escapeHtmlAttr(globalSearchQuery)}".</div>`;
          return;
        }
        host.innerHTML = globalSearchResults.map((row, idx) => `
          <div class="global-search-row">
            <div class="global-search-copy">
              <div class="global-search-type">${escapeHtmlAttr(row.type)}</div>
              <div class="global-search-title">${escapeHtmlAttr(row.title || "Untitled")}</div>
              <div class="global-search-sub">${escapeHtmlAttr(row.subtitle || "")}</div>
              <div class="global-search-body">${escapeHtmlAttr(row.body || "")}</div>
            </div>
            <button class="confirm-btn" type="button" onclick="openGlobalSearchResult(${idx})">OPEN</button>
          </div>
        `).join("");
      }

      function setGlobalSearch() {
        globalSearchQuery = String(document.getElementById("global-search-input")?.value || "").trim();
        globalSearchScope = String(document.getElementById("global-search-scope")?.value || "all");
        renderGlobalSearch();
      }

      function openGlobalSearchResult(index) {
        const row = globalSearchResults[Number(index)];
        if (!row) return;
        if (row.payload?.missionPath) {
          openMissionEditor(row.payload.missionPath);
          return;
        }
        if (row.payload?.operationName) {
          const input = document.getElementById("operation-search-input");
          if (input) input.value = row.payload.operationName;
          operationSearchQuery = String(row.payload.operationName || "").trim().toLowerCase();
          switchView("operations");
          renderOperations();
          return;
        }
        if (row.payload?.bookPath) {
          openBlueprintCard(row.payload.bookPath, row.payload.title, row.payload.sourcePath, "", 0, "", row.payload.bookPath);
          return;
        }
        if (row.payload?.blueprintFile) {
          openBlueprintCard(row.payload.blueprintFile, row.payload.title, row.payload.sourcePath, "md", 0, "", row.payload.blueprintFile);
          return;
        }
        if (row.payload?.hviQuery) {
          const input = document.getElementById("hvi-search-input");
          if (input) input.value = row.payload.hviQuery;
          hviSearchQuery = String(row.payload.hviQuery || "").trim().toLowerCase();
          switchView("hvi-intel");
          renderHvi();
          return;
        }
        if (row.payload?.datawellId) {
          switchView("datawells");
          openDatawellPopup(row.payload.datawellId);
          return;
        }
        if (row.payload?.blackbookQuery) {
          const input = document.getElementById("blackbook-search-input");
          const opsInput = document.getElementById("blackbook-search-input-ops");
          if (input) input.value = row.payload.blackbookQuery;
          if (opsInput) opsInput.value = row.payload.blackbookQuery;
          blackbookSearchQuery = String(row.payload.blackbookQuery || "").trim().toLowerCase();
          switchView("mission-log");
          renderBlackbook();
          return;
        }
        if (row.payload?.routinePeriod) {
          openRoutineView(row.payload.routinePeriod);
          return;
        }
        if (row.payload?.view) {
          switchView(row.payload.view);
          return;
        }
        if (row.payload?.gymSection && row.payload?.gymId) {
          openGymExerciseBySection(row.payload.gymSection, row.payload.gymId);
        }
      }

      function extractBriefVariables(text) {
        const profile = buildMissionProfileData(text, "brief", {});
        return buildMissionProfileSignals(profile);
      }

      function renderBriefProfilePreview() {
        const host = document.getElementById("brief-profile-preview");
        const editor = document.getElementById("brief-content");
        if (!host || !editor) return;
        const missionPath = getBriefSelectedMissionPath();
        const mission = allMissions.find((item) => String(item?.path || "") === String(missionPath || ""));
        host.innerHTML = buildMissionProfileHtml(editor.value || "", "brief", {
          operation: String(mission?.operation || "").trim(),
          name: String(mission?.name || "").trim(),
          status: String(mission?.status || "").trim(),
        });
      }

      function onBriefEditorInput() {
        const editor = document.getElementById("brief-content");
        if (!editor) return;
        briefVariables = extractBriefVariables(editor.value || "");
        renderBriefVariables();
        renderBriefProfilePreview();
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
        onBriefEditorInput();
      }

      function getBriefSelectedMissionPath() {
        const sel = document.getElementById("brief-mission-select");
        return sel ? (sel.value || "") : "";
      }

      function missionBlackbookProbeId(missionPath) {
        const ident = parseMissionIdentityFromPath(missionPath || "");
        return `MISSION:${ident.operation || "ProjectTitle"}:${ident.safeMission || "NEW_MISSION"}`;
      }

      function findMissionBlackbookEntry(missionPath) {
        const probeId = missionBlackbookProbeId(missionPath);
        const ident = parseMissionIdentityFromPath(missionPath || "");
        const op = String(ident.operation || "").trim().toLowerCase();
        const mission = String(ident.displayName || "").trim().toLowerCase();
        return allBlackbook.find((item) => {
          const itemProbeId = String(item?.Probe_ID || "").trim();
          if (itemProbeId && itemProbeId === probeId) return true;
          const itemOp = String(item?.Operation || "").trim().toLowerCase();
          const itemMission = String(item?.Mission || "").trim().toLowerCase();
          return Boolean(op && mission && itemOp === op && itemMission === mission);
        }) || null;
      }

      function missionStatusToBlackbookStatus(status, fallback = "IN_PROGRESS") {
        const clean = String(status || "").trim().toUpperCase();
        if (["PENDING", "IN_PROGRESS", "COMPLETE", "BLOCKED"].includes(clean)) return clean;
        return String(fallback || "IN_PROGRESS").trim().toUpperCase();
      }

      function buildMissionBlackbookNotes(profile) {
        if (!profile || typeof profile !== "object") return "";
        const fieldMap = profile.fieldMap || {};
        const parts = [
          firstMissionValue(fieldMap["Target"], fieldMap["Audience"]),
          firstMissionValue(fieldMap["Execution"], fieldMap["Strategy"], fieldMap["Approach"], fieldMap["Method"], fieldMap["Content"]),
          firstMissionValue(fieldMap["Probe Plan"], fieldMap["Test"], fieldMap["Experiment"]),
          firstMissionValue(fieldMap["Checklist"]),
          firstMissionValue(fieldMap["Open Questions"]),
          firstMissionValue(fieldMap["Next Action"], fieldMap["Next action"], fieldMap["First move"], fieldMap["Move"]),
        ].map((x) => String(x || "").trim()).filter(Boolean);
        return [...new Set(parts)].join(" | ");
      }

      function missionBlackbookMetaNotes(meta, notes) {
        const cleanNotes = String(notes || "").replace(/^\s*Mission ID:\s*[^|]+(?:\s*\|\s*Created:\s*[^|]+)?\s*\|?\s*/i, "").trim();
        const parts = [];
        if (meta?.mission_id) parts.push(`Mission ID: ${String(meta.mission_id).trim()}`);
        if (meta?.created_at) parts.push(`Created: ${normalizeMissionCreatedAt(meta.created_at)}`);
        if (cleanNotes) parts.push(cleanNotes);
        return parts.filter(Boolean).join(" | ");
      }

      function buildBlackbookPayloadFromMissionBrief(missionPath, content, options = {}) {
        const baseMeta = missionMetaFromPath(missionPath);
        const meta = {
          ...baseMeta,
          operation: String(options.operation || baseMeta.operation || "").trim(),
          name: String(options.name || baseMeta.name || "").trim(),
          mission_id: String(options.mission_id || baseMeta.mission_id || "").trim(),
          created_at: normalizeMissionCreatedAt(options.created_at || baseMeta.created_at || ""),
          status: String(options.status || baseMeta.status || "").trim() || "PENDING",
        };
        const profile = buildMissionProfileData(content || "", "brief", meta);
        const probeId = missionBlackbookProbeId(missionPath);
        const existing = findMissionBlackbookEntry(missionPath) || {};
        const now = new Date();
        const fieldMap = profile.fieldMap || {};
        const description = firstMissionValue(
          profile.summary,
          fieldMap["Execution"],
          fieldMap["Strategy"],
          fieldMap["Approach"],
          fieldMap["Method"],
          fieldMap["Content"],
          existing.Description
        );
        const hypothesis = firstMissionValue(
          fieldMap["Hypothesis"],
          fieldMap["Mechanism"],
          fieldMap["Psychological Lever"],
          fieldMap["Psychological Trigger"],
          fieldMap["Angle"],
          fieldMap["Probe Plan"],
          existing.Hypothesis
        );
        const platform = firstMissionValue(fieldMap["Platform"], fieldMap["System"], existing.Platform);
        const resultMetric = firstMissionValue(
          fieldMap["Metric"],
          fieldMap["Metrics"],
          fieldMap["Success condition"],
          fieldMap["Success Metric"],
          fieldMap["Proxy metric"],
          existing.Result_Quantitative
        );
        const notes = missionBlackbookMetaNotes(meta, firstMissionValue(buildMissionBlackbookNotes(profile), existing.Notes));
        return {
          Probe_ID: probeId,
          Date: String(existing.Date || todayYmd()),
          Time: String(existing.Time || now.toISOString().slice(11, 16)),
          Operation: String(meta.operation || existing.Operation || "").trim(),
          Mission: String(meta.name || existing.Mission || "").trim(),
          Status: missionStatusToBlackbookStatus(options.status || meta.status || existing.Status, "IN_PROGRESS"),
          Description: description,
          Hypothesis: hypothesis,
          Platform: platform,
          Result_Quantitative: resultMetric,
          Notes: notes,
        };
      }

      async function syncBlackbookFromMissionBrief(missionPath, content, options = {}) {
        const briefText = String(content || "").trim();
        if (!missionPath || !briefText) return null;
        const payload = buildBlackbookPayloadFromMissionBrief(missionPath, briefText, options);
        const res = await fetch("/api/blackbook/upsert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Blackbook sync failed." }));
          throw new Error(err.error || "Blackbook sync failed.");
        }
        return payload;
      }

      function onBriefOperationFilterChange() {
        renderBriefMissionOptions();
      }

      function onBriefMissionChange() {
        const phaseInput = document.getElementById("brief-phase");
        if (phaseInput) phaseInput.value = "1";
        renderBriefProfilePreview();
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
          renderBriefProfilePreview();
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
          await syncBlackbookFromMissionBrief(missionPath, editor.value, { status: "IN_PROGRESS" });
          await loadBriefForSelectedMission();
          await fetchData();
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
        onBriefEditorInput();
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
            renderBriefProfilePreview();
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
                try {
                  await syncBlackbookFromMissionBrief(missionPath, briefContent, {
                    status: "IN_PROGRESS",
                    operation: data?.operation || opInput.value || "",
                    name: data?.name || nameInput.value || "",
                    mission_id: data?.mission_id || "",
                    created_at: data?.created_at || "",
                  });
                } catch (bbErr) {
                  msgEl.innerHTML = `<span style="color:var(--warning-yellow);">MISSION + BRIEF SAVED. BLACKBOOK WARNING: ${escapeHtmlAttr(bbErr?.message || "BLACKBOOK SYNC FAILED.")}</span>`;
                }
                msgEl.innerHTML = `<span style="color:var(--term-green);">SUCCESS + BRIEF SAVED. ${escapeHtmlAttr(String(data?.mission_id || ""))}${data?.created_at ? ` :: ${escapeHtmlAttr(String(data.created_at || ""))}` : ""}</span>`;
              }
            } else {
              msgEl.innerHTML = `<span style="color:var(--term-green);">SUCCESS. ${escapeHtmlAttr(String(data?.mission_id || ""))}${data?.created_at ? ` :: ${escapeHtmlAttr(String(data.created_at || ""))}` : ""}</span>`;
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
            selectedOperation = String(data?.operation || opInput.value || "").trim();
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

      function missionMetaFromPath(path) {
        const missionPath = String(path || missionEditorPath || "").trim();
        const row = allMissions.find((item) => String(item?.path || "") === missionPath) || null;
        const parsed = parseMissionIdentityFromPath(missionPath);
        return {
          path: missionPath,
          operation: String(row?.operation || parsed.operation || "").trim(),
          name: String(row?.name || parsed.displayName || missionPath.split("/").pop() || "Mission").trim(),
          mission_id: String(row?.mission_id || "").trim(),
          created_at: normalizeMissionCreatedAt(row?.created_at || row?.date || ""),
          status: String(row?.status || "PENDING").trim() || "PENDING",
        };
      }

      function buildMissionIntelSignalsHtml(profile) {
        const signals = buildMissionProfileSignals(profile);
        if (!signals.length) {
          return `<div class="mission-dossier-empty">No structured fields detected yet. Keep the template consistent and this section will auto-fill offline.</div>`;
        }
        return signals.map((row) => `
          <div class="mission-intel-var-row">
            <div class="mission-intel-var-key">${escapeHtmlAttr(row.key)}</div>
            <div class="mission-intel-var-value">${escapeHtmlAttr(row.value)}</div>
          </div>
        `).join("");
      }

      function syncMissionIntelContentState() {
        const textEl = document.getElementById("intel-mission-content");
        const content = String(textEl?.value || "");
        if (missionPopupSection === "brief") missionEditorBriefContent = content;
        else missionEditorDebriefContent = content;
        return content;
      }

      function renderMissionIntelPreview() {
        const previewHost = document.getElementById("intel-mission-profile");
        const varsHost = document.getElementById("intel-mission-vars");
        if (!previewHost || !varsHost) return;
        const meta = missionMetaFromPath(missionEditorPath);
        const content = syncMissionIntelContentState();
        const kind = missionPopupSection === "debrief" ? "debrief" : "brief";
        const profile = buildMissionProfileData(content, kind, meta);
        previewHost.innerHTML = buildMissionProfileHtml(content, kind, meta);
        varsHost.innerHTML = buildMissionIntelSignalsHtml(profile);
      }

      function focusMissionIntelEditor() {
        const body = document.getElementById("intel-body");
        const textEl = document.getElementById("intel-mission-content");
        if (body) body.scrollTop = 0;
        if (!textEl) return;
        try {
          textEl.focus({ preventScroll: true });
        } catch (_) {
          textEl.focus();
        }
        textEl.scrollIntoView({ block: "start", behavior: "smooth" });
      }

      function buildMissionIntelEditorHtml(meta) {
        const isDebrief = missionPopupSection === "debrief";
        const content = isDebrief ? missionEditorDebriefContent : missionEditorBriefContent;
        const toggleLabel = isDebrief ? "◀ BRIEF" : "NEXT ▶ DEBRIEF";
        const helperText = isDebrief
          ? "Page 2 debrief uses the same structured parser, so outcome and next probe still render offline."
          : "Paste your consistent brief template here. The profile on the right auto-fills offline without AI.";
        const varsTitle = isDebrief ? "// DEBRIEF SIGNALS" : "// STRUCTURED FIELDS";
        return `
          <div class="mission-intel-grid">
            <section class="mission-intel-editor-card">
              <div class="mission-intel-card-head">
                <div class="mission-intel-toolbar">
                  <div>
                    <strong>${isDebrief ? "// PAGE 2 / DEBRIEF" : "// ADD / EDIT BRIEF"}</strong>
                    <div class="routine-ex-note">${escapeHtmlAttr(helperText)}</div>
                  </div>
                  <div class="hvi-inline-actions">
                    <button class="submit-btn" type="button" onclick="focusMissionIntelEditor()">EDIT TEXT</button>
                    <button class="confirm-btn" type="button" onclick="toggleMissionIntelSection()" id="intel-mission-toggle">${toggleLabel}</button>
                  </div>
                </div>
              </div>
              <div class="mission-intel-card-body">
                <div class="mission-intel-meta">
                  <div class="form-group">
                    <label>Mission ID</label>
                    <input id="intel-mission-id" type="text" value="${escapeHtmlAttr(meta.mission_id || "")}" readonly />
                  </div>
                  <div class="form-group">
                    <label>Created</label>
                    <input id="intel-mission-created" type="text" value="${escapeHtmlAttr(meta.created_at || "")}" readonly />
                  </div>
                  <div class="form-group">
                    <label>Operation</label>
                    <input id="intel-mission-op" type="text" value="${escapeHtmlAttr(meta.operation || "")}" readonly />
                  </div>
                  <div class="form-group">
                    <label>Mission</label>
                    <input id="intel-mission-name" type="text" value="${escapeHtmlAttr(meta.name || "")}" readonly />
                  </div>
                  <div class="form-group">
                    <label>Status</label>
                    <select id="intel-mission-status" onchange="updateMissionStatus('${escapeJsString(meta.path || "")}', this.value)">
                      <option value="PENDING" ${(meta.status || "PENDING") === "PENDING" ? "selected" : ""}>PENDING</option>
                      <option value="IN_PROGRESS" ${(meta.status || "") === "IN_PROGRESS" ? "selected" : ""}>IN_PROGRESS</option>
                      <option value="COMPLETE" ${(meta.status || "") === "COMPLETE" ? "selected" : ""}>COMPLETE</option>
                      <option value="BLOCKED" ${(meta.status || "") === "BLOCKED" ? "selected" : ""}>BLOCKED</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Path</label>
                    <input type="text" value="${escapeHtmlAttr(meta.path || "")}" readonly />
                  </div>
                </div>
                <div class="form-group">
                  <label id="intel-mission-content-label">${isDebrief ? "Debrief" : "Brief"}</label>
                  <textarea id="intel-mission-content" class="mission-intel-textarea" placeholder="${isDebrief ? "Paste mission debrief..." : "Paste mission brief..."}">${escapeHtmlAttr(content || "")}</textarea>
                </div>
                <div class="mission-intel-vars">
                  <strong style="color:var(--warning-yellow);">${varsTitle}</strong>
                  <div id="intel-mission-vars"></div>
                </div>
                ${buildMissionEditorDatawellPanelHtml(meta.path)}
              </div>
            </section>
            <section class="mission-intel-preview-card">
              <div class="mission-intel-card-head">
                <strong>${isDebrief ? "// OFFLINE DEBRIEF PROFILE" : "// OFFLINE BRIEF PROFILE"}</strong>
                <div class="routine-ex-note">${isDebrief ? "Outcome, measurements, decisions, and next probe render here as you type." : "Mission, objective, target, plan, risks, and next move render here as you type."}</div>
              </div>
              <div id="intel-mission-profile" class="mission-intel-card-body"></div>
            </section>
          </div>
        `;
      }

      function renderMissionIntelEditor() {
        const body = document.getElementById("intel-body");
        const titleEl = document.getElementById("intel-title");
        const subtitle = document.getElementById("intel-subtitle");
        const saveBtn = document.getElementById("intel-save-btn");
        const delBtn = document.getElementById("intel-delete-btn");
        if (!body || !titleEl || !subtitle || !saveBtn || !delBtn) return;
        const meta = missionMetaFromPath(missionEditorPath);
        titleEl.textContent = missionPopupSection === "debrief" ? "// MISSION DEBRIEF" : "// MISSION BRIEF";
        subtitle.textContent = [meta.mission_id, meta.operation, meta.name, meta.created_at].filter(Boolean).join(" :: ");
        body.innerHTML = buildMissionIntelEditorHtml(meta);
        saveBtn.style.display = "";
        delBtn.style.display = "none";
        const textEl = document.getElementById("intel-mission-content");
        if (textEl) {
          textEl.addEventListener("input", () => renderMissionIntelPreview());
          requestAnimationFrame(() => {
            if (body) body.scrollTop = 0;
            try {
              textEl.focus({ preventScroll: true });
            } catch (_) {
              textEl.focus();
            }
            textEl.scrollIntoView({ block: "start" });
          });
        }
        renderMissionIntelPreview();
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
          overlay.classList.add("fullscreen");
          if (modal) modal.classList.add("intel-modal-full", "mission-intel-modal");
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
          intelPopupType = "mission";
          renderMissionIntelEditor();
          overlay.classList.add("active");
          overlay.setAttribute("aria-hidden", "false");
        } catch (e) {
          const overlay = document.getElementById("intel-overlay");
          const modal = overlay ? overlay.querySelector(".intel-modal") : null;
          if (overlay) overlay.classList.remove("fullscreen", "active");
          if (modal) modal.classList.remove("intel-modal-full", "mission-intel-modal");
          alert("Open mission failed: " + e.message);
        }
      }

      function toggleMissionIntelSection() {
        if (intelPopupType !== "mission") return;
        syncMissionIntelContentState();
        if (missionPopupSection === "brief") {
          if (!String(missionEditorBriefContent).trim() && !missionEditorHasBrief) {
            themedNotice("Save or paste Brief first, then open Debrief.");
            return;
          }
          missionPopupSection = "debrief";
        } else {
          missionPopupSection = "brief";
        }
        renderMissionIntelEditor();
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
          if (missionEditorMode === "mission" && missionEditorSection === "brief") {
            await syncBlackbookFromMissionBrief(missionEditorPath, content, { status: "IN_PROGRESS" });
          }
          await fetchData();
          if (missionEditorMode === "mission") {
            if (missionEditorSection === "brief") {
              missionEditorBriefContent = content || "";
              missionEditorHasBrief = Boolean(String(missionEditorBriefContent).trim());
              missionEditorNextBriefPhase += 1;
              themedNotice("Brief saved. Blackbook updated.");
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
            (m.mission_id || "").toLowerCase().includes(missionSearchQuery) ||
            m.operation.toLowerCase().includes(missionSearchQuery) ||
            (m.created_at || m.date || "").toLowerCase().includes(missionSearchQuery) ||
            (m.status || "").toLowerCase().includes(missionSearchQuery)
          );
        }

        tbody.innerHTML = filtered.map(m => `
          <tr ondblclick="openMissionEditor('${escapeJsString(m.path)}')" title="Double-click to open mission brief">
            <td data-label="Created">${escapeHtmlAttr(normalizeMissionCreatedAt(m.created_at || m.date || ""))}</td>
            <td data-label="Operation">${m.operation}</td>
            <td data-label="Mission">
              <span class="mission-entry-meta">${escapeHtmlAttr(m.mission_id || "MIS-000")}</span>
              <span class="mission-link status-${String(m.status || "PENDING").toLowerCase().replace(/_/g, "-")}" onclick="openMissionEditor('${escapeJsString(m.path)}')" title="Open full mission brief">${m.name}</span>
            </td>
            <td data-label="Status">
              <select class="${missionStatusClass(m.status)}" onchange="onMissionStatusChange(this, '${escapeJsString(m.path)}')">
                <option value="PENDING" ${m.status === "PENDING" ? "selected" : ""}>PENDING</option>
                <option value="IN_PROGRESS" ${m.status === "IN_PROGRESS" ? "selected" : ""}>IN_PROGRESS</option>
                <option value="COMPLETE" ${m.status === "COMPLETE" ? "selected" : ""}>COMPLETE</option>
                <option value="BLOCKED" ${m.status === "BLOCKED" ? "selected" : ""}>BLOCKED</option>
              </select>
            </td>
            <td data-label="Actions" style="text-align: center;">
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

      function getRoutineItems(period) {
        return Array.isArray(routineData?.[period]) ? routineData[period] : [];
      }

      function getRoutineProgress(period) {
        const items = getRoutineItems(period);
        const total = items.length;
        const done = items.filter((item) => !!item?.done).length;
        const pendingItems = items.filter((item) => !item?.done);
        const subchecksTotal = items.reduce((sum, item) => sum + (Array.isArray(item?.descChecks) ? item.descChecks.length : 0), 0);
        const subchecksDone = items.reduce((sum, item) => sum + (Array.isArray(item?.descChecks) ? item.descChecks.filter((check) => !!check?.done).length : 0), 0);
        return {
          total,
          done,
          pending: Math.max(0, total - done),
          pendingItems,
          subchecksTotal,
          subchecksDone,
        };
      }

      function getQuarterPreset(quarterNum) {
        const qNum = Number(quarterNum);
        if (qNum === 1) {
          const progress = getRoutineProgress("morning");
          return {
            kind: "routine",
            period: "morning",
            title: "Morning Routine",
            tileSummary: progress.total ? `${progress.done}/${progress.total} done` : "No tasks",
            detailCopy: "Live morning checklist. Changes here update the routines page too.",
          };
        }
        if (qNum === 6) {
          const progress = getRoutineProgress("night");
          return {
            kind: "routine",
            period: "night",
            title: "Night Routine",
            tileSummary: progress.total ? `${progress.done}/${progress.total} done` : "No tasks",
            detailCopy: "Live night checklist. Changes here update the routines page too.",
          };
        }
        if (qNum === 7) {
          return {
            kind: "sleep",
            title: "Sleep Window",
            tileSummary: "22:00 shutdown",
            detailCopy: "Wind down, lock in recovery, and shut the system down for sleep.",
          };
        }
        if (qNum === 8) {
          return {
            kind: "sleep",
            title: "Sleep Window",
            tileSummary: "Protected sleep",
            detailCopy: "Protected sleep block. No active dashboard work should be scheduled here.",
          };
        }
        return null;
      }

      function getQuarterAlertCopy(quarterNum) {
        const preset = getQuarterPreset(quarterNum);
        if (!preset) {
          return {
            title: "QUARTER START",
            body: `Q${quarterNum}/${DASHBOARD_QUARTER_COUNT} is live now.`,
          };
        }
        if (preset.kind === "routine") {
          const progress = getRoutineProgress(preset.period);
          const nextNames = progress.pendingItems.slice(0, 2).map((item) => item.title).filter(Boolean);
          return {
            title: preset.title,
            body: progress.pending
              ? `${progress.pending} task(s) pending. ${nextNames.length ? `Next: ${nextNames.join(" / ")}` : "Open dashboard or routines to begin."}`
              : "All tasks are already marked complete.",
          };
        }
        return {
          title: preset.title,
          body: preset.detailCopy,
        };
      }

      function getQuarterHourAlertCopy(quarterNum, hourNumber) {
        const preset = getQuarterPreset(quarterNum);
        const hourLabel = `hour ${Math.max(1, Math.min(3, Number(hourNumber) || 1))}/3`;
        if (preset?.kind === "routine") {
          return {
            title: "HOUR START",
            body: `${preset.title.toUpperCase()} ${hourLabel} is live now.`,
          };
        }
        if (preset?.kind === "sleep") {
          return {
            title: "HOUR START",
            body: `${preset.title.toUpperCase()} ${hourLabel} is live. Stay quiet and protected.`,
          };
        }
        return {
          title: "HOUR START",
          body: `Q${quarterNum}/${DASHBOARD_QUARTER_COUNT} ${hourLabel} is live now.`,
        };
      }

      function getQuarterBreakAlertCopy(quarterNum, breakIndex) {
        const labels = {
          1: "after block 1",
          2: "after block 2",
          3: "after block 3",
          4: "after block 4",
          5: "after recovery block 5",
          6: "final reset window",
        };
        const idx = Math.max(1, Math.min(6, Number(breakIndex) || 1));
        return {
          title: "BREAK START",
          body: `Q${quarterNum}/${DASHBOARD_QUARTER_COUNT} break ${idx}/6 is live now (${labels[idx]}).`,
        };
      }

      function currentBreakIndexFromQuarterState(state) {
        if (!state || state.preset || state.cadence !== "BREAK") return 0;
        const minute = Number(state.minuteInQuarter || 0);
        if (minute < 30) return 1;
        if (minute < 60) return 2;
        if (minute < 90) return 3;
        if (minute < 120) return 4;
        if (minute < 150) return 5;
        return 6;
      }

      function forEachQuarterWindowInRange(nowMs, horizonMs, callback) {
        const baseDayStart = getQuarterState(new Date(nowMs)).dayStart;
        const dayMs = 24 * 60 * 60 * 1000;
        for (let dayOffset = -1; dayOffset <= 4; dayOffset += 1) {
          const dayStart = new Date(baseDayStart.getTime() + dayOffset * dayMs);
          for (let qi = 0; qi < DASHBOARD_QUARTER_COUNT; qi += 1) {
            const qNum = qi + 1;
            const qStart = new Date(dayStart.getTime() + qi * QUARTER_DURATION_MS);
            const qEnd = new Date(qStart.getTime() + QUARTER_DURATION_MS);
            if (qEnd.getTime() <= nowMs + 15000 || qStart.getTime() > horizonMs) continue;
            callback({
              qNum,
              qStart,
              qEnd,
              opDay: operationalDayKey(new Date(qStart.getTime() + 1000)),
              preset: getQuarterPreset(qNum),
            });
          }
        }
      }

      function renderDashboardRoutineQuarter(period, quarterNum) {
        const preset = getQuarterPreset(quarterNum);
        const items = getRoutineItems(period);
        const progress = getRoutineProgress(period);
        return `
          <div class="quarter-slot routine-quarter-slot">
            <div class="quarter-slot-time">
              <strong>${escapeHtmlAttr(preset?.title || "Routine")}</strong>:
              ${progress.done}/${progress.total || 0} complete
            </div>
            <div class="quarter-preset-copy">${escapeHtmlAttr(preset?.detailCopy || "")}</div>
            <div class="quarter-routine-actions">
              <button class="confirm-btn routine-mini-btn" type="button" onclick="openRoutineView('${escapeJsString(period)}')">OPEN ROUTINES</button>
            </div>
            <div class="quarter-routine-list">
              ${items.map((item) => `
                <div class="quarter-routine-card ${item.done ? "done" : ""}">
                  <button class="quarter-routine-task ${item.done ? "done" : ""}" type="button" onclick="toggleRoutineTask('${escapeJsString(period)}','${escapeJsString(item.id)}')">
                    <strong>${escapeHtmlAttr(item.title)}</strong>
                    <span>${escapeHtmlAttr(item.desc || "") || "Tap to mark complete."}</span>
                  </button>
                  ${Array.isArray(item.descChecks) && item.descChecks.length ? `
                    <div class="quarter-routine-checks">
                      ${item.descChecks.map((check) => `
                        <button class="quarter-routine-check ${check.done ? "done" : ""}" type="button" onclick="toggleRoutineDescCheck('${escapeJsString(period)}','${escapeJsString(item.id)}','${escapeJsString(check.id)}')">
                          ${escapeHtmlAttr(check.text)}
                        </button>
                      `).join("")}
                    </div>
                  ` : ""}
                </div>
              `).join("") || `<div class="quarter-preset-copy">No routine tasks yet.</div>`}
            </div>
          </div>
        `;
      }

      function renderDashboardSleepQuarter(quarterNum) {
        const preset = getQuarterPreset(quarterNum);
        return `
          <div class="quarter-slot sleep-quarter-slot">
            <div class="quarter-slot-time"><strong>${escapeHtmlAttr(preset?.title || "Sleep Window")}</strong></div>
            <div class="quarter-preset-copy">${escapeHtmlAttr(preset?.detailCopy || "")}</div>
            <div class="quarter-sleep-note">No mission or recovery blocks should be scheduled here.</div>
          </div>
        `;
      }

      function getQuarterState(now = new Date()) {
        const dayStart = new Date(now);
        dayStart.setHours(4, 0, 0, 0);
        if (now < dayStart) dayStart.setDate(dayStart.getDate() - 1);
        const elapsedMs = now - dayStart;
        const quarterIndex = Math.min(DASHBOARD_QUARTER_COUNT - 1, Math.floor(elapsedMs / QUARTER_DURATION_MS));
        const quarterStart = new Date(dayStart.getTime() + quarterIndex * QUARTER_DURATION_MS);
        const quarterEnd = new Date(quarterStart.getTime() + QUARTER_DURATION_MS);
        const minuteInQuarter = Math.floor((now - quarterStart) / 60000);
        const hourInQuarter = Math.max(1, Math.min(3, Math.floor((now - quarterStart) / (60 * 60 * 1000)) + 1));
        const preset = getQuarterPreset(quarterIndex + 1);

        let phase = "RECOVERY";
        let cadence = "Eat / Read / Exercise / Checklist";
        let currentBlock = 0;
        let inWork = false;
        let blockStart = null;
        let blockEnd = null;
        if (preset?.kind === "routine") {
          phase = "ROUTINE WINDOW";
          cadence = preset.title;
          blockStart = quarterStart;
          blockEnd = quarterEnd;
        } else if (preset?.kind === "sleep") {
          phase = "SLEEP WINDOW";
          cadence = preset.title;
          blockStart = quarterStart;
          blockEnd = quarterEnd;
        } else if (minuteInQuarter < 120) {
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
          minuteInQuarter,
          hourInQuarter,
          phase,
          cadence,
          currentBlock,
          inWork,
          blockStart,
          blockEnd,
          dayStart,
          preset,
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
        queueNativeNotificationRefresh(250, { prompt: false });
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
        const dayLine = `OPERATION DAY: ${opDay}`;
        const quarterLine = `Q${quarter.quarterIndex}/${DASHBOARD_QUARTER_COUNT} H${quarter.hourInQuarter}/3: [${formatUkHm(now)}]`;

        let taskLine = "BREAK";
        let focusMissionText = "Operation - Mission Task";
        let focusMissionHref = "";
        let focusMissionEditorPath = "";
        let focusRoutinePeriod = "";
        if (quarter.preset?.kind === "routine") {
          const progress = getRoutineProgress(quarter.preset.period);
          const nextTitles = progress.pendingItems.slice(0, 2).map((item) => item.title).filter(Boolean);
          taskLine = quarter.preset.title.toUpperCase();
          focusMissionText = progress.total
            ? `${progress.done}/${progress.total} tasks complete${nextTitles.length ? ` • Next: ${nextTitles.join(" / ")}` : progress.pending ? "" : " • COMPLETE"}`
            : "No routine tasks set yet.";
          focusRoutinePeriod = quarter.preset.period;
        } else if (quarter.preset?.kind === "sleep") {
          taskLine = "SLEEP WINDOW";
          focusMissionText = quarter.preset.detailCopy || "Protected sleep window.";
        } else {
          const focusSlot = quarter.currentBlock > 0 ? getPlannedMission(plan, quarter.quarterIndex, quarter.currentBlock) : null;
          focusMissionText = focusSlot && (focusSlot.operation || focusSlot.missionName)
            ? `${focusSlot.operation || "Operation"} - ${focusSlot.missionName || "Mission Task"}`
            : "Operation - Mission Task";
          focusMissionHref = focusSlot ? missionHrefFromPath(focusSlot.missionPath) : "";
          focusMissionEditorPath = focusSlot?.missionPath || "";
          const taskNumber = Math.min(4, Math.max(1, quarter.currentBlock || 1));
          if (quarter.cadence !== "BREAK") {
            if (quarter.currentBlock >= 1 && quarter.currentBlock <= 4) {
              taskLine = `TASK ${taskNumber}/4`;
            } else if (quarter.currentBlock >= 5 && quarter.currentBlock <= 6) {
              taskLine = `RECOVERY ${quarter.currentBlock - 4}/2`;
            }
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
        if (!Number.isInteger(selectedQuarterPanel) || selectedQuarterPanel < 1 || selectedQuarterPanel > DASHBOARD_QUARTER_COUNT) {
          selectedQuarterPanel = quarter.quarterIndex;
        }

        const renderQuarterSlots = (qNum) => {
          const preset = getQuarterPreset(qNum);
          if (preset?.kind === "routine") return renderDashboardRoutineQuarter(preset.period, qNum);
          if (preset?.kind === "sleep") return renderDashboardSleepQuarter(qNum);
          const qStart = new Date(quarter.dayStart.getTime() + (qNum - 1) * QUARTER_DURATION_MS);
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

        const quarterGrid = Array.from({ length: DASHBOARD_QUARTER_COUNT }).map((_, i) => {
          const qNum = i + 1;
          const start = new Date(quarter.dayStart.getTime() + i * QUARTER_DURATION_MS);
          const end = new Date(start.getTime() + QUARTER_DURATION_MS);
          const active = qNum === quarter.quarterIndex;
          const viewed = qNum === selectedQuarterPanel;
          const preset = getQuarterPreset(qNum);
          const tileSub = preset
            ? `${preset.title}${preset.tileSummary ? ` | ${preset.tileSummary}` : ""}${active ? " | LIVE" : ""}`
            : `Blocks 1-4 Missions | 5-6 Recovery${active ? " | LIVE" : ""}`;
          return `
            <div class="quarter-tile ${viewed ? "active" : ""} ${preset ? `preset-${preset.kind}` : ""}" onclick="setQuarterPanel(${qNum})">
              <div class="quarter-tile-head">Q${qNum} ${formatHm(start)}-${formatHm(end)}</div>
              <div class="quarter-tile-sub">${escapeHtmlAttr(tileSub)}</div>
            </div>
          `;
        }).join("");

        const detailStart = new Date(quarter.dayStart.getTime() + (selectedQuarterPanel - 1) * QUARTER_DURATION_MS);
        const detailEnd = new Date(detailStart.getTime() + QUARTER_DURATION_MS);
        const detailPreset = getQuarterPreset(selectedQuarterPanel);
        const selectedQuarterSlots = renderQuarterSlots(selectedQuarterPanel);

        container.innerHTML = `
          <div class="focus-header" ondblclick="toggleQuarterDetailPanel()">
            <div class="focus-day">${dayLine}</div>
            <div class="focus-quarter">${quarterLine}</div>
            <div class="focus-phase">
              ${taskLine}:
              ${focusRoutinePeriod
                ? `<span class="mission-link status-in-progress" onclick="openRoutineView('${escapeJsString(focusRoutinePeriod)}')" style="color: var(--warning-yellow); font-weight: bold; text-decoration: underline;">[${escapeHtmlAttr(focusMissionText)}]</span>`
                : focusMissionHref
                ? `<span class="mission-link status-in-progress" onclick="openMissionEditor('${escapeJsString(focusMissionEditorPath)}')" style="color: var(--warning-yellow); font-weight: bold; text-decoration: underline;">[${escapeHtmlAttr(focusMissionText)}]</span>`
                : `[${escapeHtmlAttr(focusMissionText)}]`}
            </div>
          </div>
          <div class="quarter-grid">${quarterGrid}</div>
          <div class="quarter-detail-panel" ondblclick="toggleQuarterDetailPanel()">
            <div class="quarter-carousel-head" ondblclick="toggleQuarterDetailPanel()">
              <div class="quarter-detail-title">${detailPreset ? `${escapeHtmlAttr(detailPreset.title.toUpperCase())} | Q${selectedQuarterPanel}` : `Q${selectedQuarterPanel} DETAIL`}: ${formatHm(detailStart)}-${formatHm(detailEnd)}</div>
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
        if (!Number.isInteger(n) || n < 1 || n > DASHBOARD_QUARTER_COUNT) return;
        selectedQuarterPanel = n;
        renderOperationFocus();
      }

      function onQuarterTileDoubleClick(qNum) {
        const n = Number(qNum);
        if (!Number.isInteger(n) || n < 1 || n > DASHBOARD_QUARTER_COUNT) return;
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

      function isNativeRuntime() {
        const protocol = String(window.location?.protocol || "");
        return Boolean(window.Capacitor) || protocol === "capacitor:" || protocol === "file:";
      }

      function isNativeLanDevSession() {
        const protocol = String(window.location?.protocol || "");
        const port = String(window.location?.port || "");
        return isNativeRuntime() && (protocol === "http:" || protocol === "https:") && port === "8099";
      }

      function shouldPreferOfflineSnapshots() {
        if (isNativeLanDevSession()) return false;
        const protocol = String(window.location?.protocol || "");
        return Boolean(window.Capacitor) || protocol === "capacitor:" || protocol === "file:";
      }

      async function pollLiveDevBuildVersion() {
        if (!isNativeLanDevSession()) return;
        try {
          const res = await nativeWindowFetch("/api/dev/version", { cache: "no-store" });
          if (!res.ok) return;
          const payload = await res.json().catch(() => null);
          const nextVersion = String(payload?.version || "").trim();
          if (!nextVersion) return;
          if (liveDevBuildVersion && liveDevBuildVersion !== nextVersion) {
            setTimeout(() => window.location.reload(), 120);
            return;
          }
          liveDevBuildVersion = nextVersion;
        } catch (_) {}
      }

      function initLiveDevReload() {
        if (!isNativeLanDevSession()) return;
        if (liveDevReloadTimerId) {
          clearInterval(liveDevReloadTimerId);
          liveDevReloadTimerId = 0;
        }
        pollLiveDevBuildVersion();
        liveDevReloadTimerId = setInterval(pollLiveDevBuildVersion, 1500);
      }

      async function fetchJsonPath(path) {
        const res = await fetch(path, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
        return res.json();
      }

      async function fetchJsonSmart(endpoint) {
        const offlineData = offlineReadDataForEndpoint(endpoint);
        if (offlineData !== undefined) return offlineData;
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
          } else if (currentView === "global-search") {
            renderGlobalSearch();
          } else if (currentView === "settings") {
            renderSyncCenter();
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
        initTerminalAppTitle();
        initMatrixRain();
        window.addEventListener("resize", initMatrixRain);
        loadGymPhotoManifest().catch(() => {});
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
        loadDatawells();
        loadMissionDatawellLinks();
        loadHviLayoutTemplate();
        loadAppearanceSettings();
        loadNotificationSettings();
        loadPerformanceSettings();
        loadPrivacySettings();
        initMobileMenuGestures();
        initLiveDevReload();
        refreshRuntimeModeState().catch(() => {});
        refreshMacIphoneLiveState().catch(() => {});
        initNativeNotifications().catch(() => {});
        queueOmniCalendarSync(700, { prompt: true });
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
            if (e.target === exerciseOverlay) requestCloseExerciseViewer();
          });
        }
        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape") {
            const confirmOverlay = document.getElementById("confirm-overlay");
            const promptOverlay = document.getElementById("prompt-overlay");
            const noticeOverlay = document.getElementById("notice-overlay");
            if (confirmOverlay?.classList.contains("active") || promptOverlay?.classList.contains("active") || noticeOverlay?.classList.contains("active")) {
              return;
            }
            const overlay = document.getElementById("mission-editor-overlay");
            if (overlay && overlay.classList.contains("active")) closeMissionEditor();
            const intel = document.getElementById("intel-overlay");
            if (intel && intel.classList.contains("active")) closeIntelPopup();
            const doc = document.getElementById("doc-overlay");
            if (doc && doc.classList.contains("active")) closeDocPopup();
            const rem = document.getElementById("reminder-overlay");
            if (rem && rem.classList.contains("active")) closeReminderPopup();
            const exv = document.getElementById("exercise-overlay");
            if (exv && exv.classList.contains("active")) requestCloseExerciseViewer();
            closeAllAddPopups();
          }
        });
        document.addEventListener("keydown", onAppUndoRedoShortcut);
        fetchData();
        runNotificationEngine();
        scheduleFetchDataPolling();
        setInterval(runNotificationEngine, NOTIFICATION_ENGINE_INTERVAL_MS);
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "hidden") {
            if (privacySettings.autoLockOnBackground && lockUnlocked && getLockConfig()) lockNow();
            return;
          }
          if (document.visibilityState === "visible") {
            queueNativeNotificationRefresh(200, { prompt: false });
            queueOmniCalendarSync(200, { prompt: false });
          }
        });
        window.addEventListener("focus", () => {
          queueNativeNotificationRefresh(200, { prompt: false });
          queueOmniCalendarSync(200, { prompt: false });
        });
        setInterval(() => queueNativeNotificationRefresh(0, { prompt: false }), 15 * 60 * 1000);
        setInterval(() => queueOmniCalendarSync(0, { prompt: false }), 15 * 60 * 1000);
        switchView('dashboard');
      }

      document.addEventListener("DOMContentLoaded", () => {
        loadPrivacySettings();
        if (privacySettings.lockOnLaunch) {
          lockUnlocked = false;
          initLockScreen();
          return;
        }
        lockUnlocked = true;
        hideLockOverlay();
        startAppOnce();
      });
    
