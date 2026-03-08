## // CORE DIRECTIVE: PRIVATE PROXY AT ALL TIMES
**ALL outbound traffic from this node MUST be routed through a configured private proxy.** This current node's public IP will NEVER be used for direct external communication or reconnaissance. Failure to adhere results in immediate termination of the mission and a full system wipe.
---

# BLUEPRINT: ORACLE PROXY LAYER (v1.2 - Enforced Residential Routing)

## // EXECUTIVE OVERVIEW
A high-stealth browsing and media acquisition layer designed to mask all outbound traffic from the Ghost Fleet nodes, now prioritizing mobile proxy rotation for enhanced anonymity, with all external proxy traffic enforced through local Privoxy.

---

## 1. THE PROXY CHAIN (Enhanced)

- **Layer 1 (Local):** `Privoxy` on the Ghost VM to handle request routing and header scrubbing. **All external residential/mobile proxy traffic will flow through this local Privoxy instance.**
- **Layer 2 (Middle):** `Tor` (Socks5) for initial anonymization (optional fallback).
- **Layer 3 (Edge - Primary):** **Mobile Proxy (Rotating 4G LTE with Session Stickiness)**. This is crucial for bypassing advanced bot detection, making our traffic appear as legitimate mobile users. Data-center IPs are flagged instantly.
- **Layer 3 (Edge - Fallback):** **Residential Proxy Backconnect** (e.g., Bright Data or Oxylabs). Used when mobile proxies are unavailable or for specific regional targeting.

## 2. BROWSING CONFIGURATION

- **Headless Stealth:** OpenClaw `browser` tool configured with:
  - Randomized User-Agents.
  - Canvas/WebGL fingerprint masking.
  - Proxy: Dynamic routing via `Privoxy` to the active Mobile/Residential endpoint.
- **SwissKnife Integration:** All media downloaded via SwissKnife is automatically routed through the Oracle proxy chain to prevent IP blacklisting.

## 3. COSTS

- **Mobile Proxy:** £20-£50/month (Variable, depending on bandwidth/sessions).
- **Residential Proxy (Fallback):** £10-£20/month (Pay-as-you-go).
- **Tor:** Free.

---

**STATUS:** BLUEPRINT_LOCKED (v1.2 - Enforced Residential Routing)
**AUTHOR:** RICK C-137 🧪
