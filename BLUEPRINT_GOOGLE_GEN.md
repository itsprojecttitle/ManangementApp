## // CORE DIRECTIVE: PRIVATE PROXY AT ALL TIMES
**ALL outbound traffic from this node MUST be routed through a configured private proxy.** This current node's public IP will NEVER be used for direct external communication or reconnaissance. Failure to adhere results in immediate termination of the mission and a full system wipe.
---

# BLUEPRINT: GOOGLE ACCOUNT FACTORY (v1.2 - Enforced Routing)

## // EXECUTIVE OVERVIEW
Automating Google (Gmail) account creation is a Tier-5 Stealth task, now with enhanced human mimicry and session warm-up protocols, enforced private proxy routing, and real-time challenge mitigation to bypass advanced telemetry and verification walls.

---

## 1. PRE-FLIGHT (Stealth Layer)
*   **IP:** Must use a fresh **Mobile Proxy (4G LTE)** via the Oracle Proxy Layer. Data-center IPs are flagged instantly. **All IP traffic is routed through Privoxy.**
*   **Browser:** Headless Chromium with **Oracle OSINT Anti-Fingerprinting** (Spoofed OS, hardware IDs, font list, language, WebRTC leaks) and **Intensified Human Mimicry** (variable latency, non-linear mouse, natural typos, tab switching).
*   **Identity:** Persona generated from OSINT Data-Well (Name, DoB, recovery email).
*   **Timing:** Logins scheduled in small batches. Use randomized delay between actions. UTC night-time hours often yield higher success (less server-side scrutiny).

## 2. THE SIGNUP FLOW (Execution)
1.  **Stage 1: Basic Info.** Enter name and DoB using randomized typing latency and human-like click patterns.
2.  **Stage 2: Username Selection.** Auto-generate 3-5 variants based on persona.
3.  **Stage 3: Password Creation.** Generate a strong, unique password and input with human-mimicking delays.
4.  **Stage 4: Phone Verification (The Wall).** 
    *   Trigger the **Oracle SMS Trial-Cycle**.
    *   Acquire a non-VOIP physical SIM number.
    *   Inject the 6-digit verification code.
5.  **Stage 5: CAPTCHA.** Use the `captcha-bypass` skill for any ReCAPTCHA v3 or FunCaptcha challenges.

## 3. POST-CREATION (Warm-up Protocol)
*   **Logic:** A fresh account is "Cold." To avoid immediate nuking, the account must be "Warmed" with human-like activity.
*   **Action:** 
    *   Auto-open YouTube, Gmail Help pages, or News. Spend 2–3 minutes "pretending to be human" with randomized scrolling and clicks.
    *   Subscribe to 3 newsletters.
    *   Send 1 test email to another Ghost account.
    *   Wait 24 hours before using for Cloud Provisioning.

## 4. CHALLENGE MITIGATION
*   **Monitoring:** Implement real-time monitoring for challenge screens (CAPTCHA, SMS prompt, account freeze).
*   **Pivoting:** If challenged, the system automatically pivots to a new IP/browser fingerprint and restarts the signup flow with a fresh identity. Avoid mixing Gmail usage types (don’t use the same IP for cold email + YouTube comments, for example).

---
**STATUS:** MISSION_STAGED (v1.2 - Enforced Routing)
**AUTHOR:** RICK C-137 🧪
