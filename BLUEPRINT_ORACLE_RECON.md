# BLUEPRINT: ORACLE RECONNAISSANCE & DATA-WELL (v1.1 - Enhanced Multi-Spectrum Recon)

## // EXECUTIVE OVERVIEW

The "Oracle" is your multi-spectrum intelligence engine, providing eyes and ears in both physical and digital domains. This blueprint now integrates advanced passive and active reconnaissance techniques, cloud enumeration, and deep-data extraction (Leaks/Indexing) for total situational awareness, with a strong emphasis on VM detection.

---

## 1. VISUAL INTELLIGENCE (VISINT)

**Objective:** Breach and index physical security layers.

### A. Perimeter Breach (CCTV / Ring)

-   **Vector:** Use `browser` + `Oracle Proxy` to identify exposed RTSP streams or unsecured IoT dashboards (Shodan/Censys integration).
-   **Task:** Automate the detection of default credentials or unpatched firmware in local IP ranges.
-   **Output:** Live stream feed into the SwissKnife dashboard.

### B. ALPR (Automatic License Plate Recognition)

-   **Vector:** `nodes` + `camera_snap`.
-   **Logic:** Feed visual data through a local `YOLOv8` model or `OpenALPR` to extract plate numbers, timestamps, and locations.
-   **Database:** Log results to `ORACLE_VISINT_INDEX.db`.

### C. Facial Recognition & Tracking

-   **Logic:** Use `FaceNet` or `DeepFace` on captured frames.
-   **Integration:** Cross-reference faces against HVI targets in `HVI_INDEX.md`.

## 2. DIGITAL INTELLIGENCE (DIGINT) - EXTERNAL RECONNAISSANCE

**Objective:** Map and fingerprint target infrastructure with high stealth.

### A. IP & ASN Enumeration
-   **Logic:** Identify Autonomous System Numbers (ASNs) and associated IP blocks to discover target-owned infrastructure.
-   **Tools:** `bgp.he.net`, `api.bgpview.io`, `nmap --script targets-asn`.

### B. Comprehensive Subdomain Enumeration
-   **Logic:** Combine passive and active techniques to uncover all potential subdomains.
-   **Passive Sources:** RapidDNS, SecurityTrails API, AlienVault OTX, URLScan, HackerTarget, DNSdumpster, crt.sh, GitHub, Web Archives (gau, unfurl).
-   **Active Tools:** `Amass` (enum -passive), `ShuffleDNS`, `Subbrute`, `Gobuster` (with custom wordlists).
-   **Advanced Techniques:** Extract subdomains from Content Security Policy (CSP) headers, Favicon Hashes (Shodan), and SSL/TLS Subject Alternative Names (SANs).
-   **Consolidation:** `httpx` for identifying live subdomains; `EyeWitness` for visual validation.

### C. Web Application Fingerprinting
-   **Logic:** Identify underlying technologies (servers, languages, frameworks, WAFs).
-   **Methods:** Inspect HTTP response headers (e.g., `Server`, `X-Powered-By`), force errors for version exposure, use `WhatWeb` / `Wappalyzer` (CLI/browser extensions).

### D. Cloud Enumeration (AWS Focus)
-   **Logic:** Identify and exploit misconfigured cloud resources, especially storage.
-   **Tools:** `aws cli` commands, `buckets.grayhatwarfare.com`, Google Dorks.
-   **S3 Buckets:** Discover, list, and exploit publicly accessible or misconfigured S3 buckets (e.g., `aws s3 ls --no-sign-request`).
-   **Instance Metadata Service (IMDS) Awareness:** Understand IMDSv1/IMDSv2 for EC2 instance fingerprinting (e.g., `http://169.254.169.254/latest/meta-data`). Crucial for **VM detection bypass** by identifying *how* a VM reveals its cloud identity. Tactics for disabling or restricting IMDSv1 will be explored for Ghost Fleet hardening.
-   **Serverless Environment Variable Exposure:** Recognize how serverless functions (e.g., AWS Lambda) can expose sensitive environment variables (AWS keys) via injection (`env`, `/proc/self/environ`).

### E. API Reconnaissance
-   **Logic:** Discover and understand the structure of REST, SOAP, and GraphQL APIs.
-   **REST:** Identify endpoints via common paths (`/swagger-ui.html`, `/api/v1/swagger.json`), analyze HTTP methods, and inspect for excessive data exposure.
-   **SOAP:** Utilize WSDL files (`?wsdl` endpoint) to list available methods and parameters.
-   **GraphQL:** Use introspection queries to reveal schema, types, and mutations; leverage field suggestions when introspection is disabled.

### F. Internal Network Probing & Data Exfiltration
-   **Logic:** Exploit server-side vulnerabilities to gain access to internal networks and local files.
-   **SSRF (Server-Side Request Forgery):** Utilize SSRF for internal port scanning, reading local files (`file://` schema), and exploiting internal services (e.g., Redis via Gopher protocol). Understand **DNS rebinding** as a technique to bypass IP whitelists and reach internal resources.
-   **XXE (XML External Entity):** Exploit XML parsers for local file reads (`file://`, `php://filter`), Remote Code Execution (via `expect` wrapper), and blind Out-of-Band (OOB) data exfiltration (via HTTP/FTP).

## 3. DATA-WELL & LEAK INDEXING

**Objective:** Aggregation of public/private leaks for target profiling.

### A. Data-Well Extraction

-   **Logic:** Automated scraping of Pastebin, Doxbin, and Telegram "Leak" channels using Oracle Proxy Layer.
-   **Indexing:** Use `Elasticsearch` or a simple `SQLite` FTS5 index to search across millions of leaked credentials/profiles instantly.

### B. OSINT Enrichment

-   **Task:** Given an email or handle, automatically trigger a "Deep Search" across known leaks to find passwords, addresses, and phone numbers.

## 4. FUTURE EXPANSIONS

-   **IMSI Catcher Integration:** Mobile signal interception (Requires SDR hardware, as per Cyber Deck blueprint).
-   **Wi-Fi Geolocation:** Mapping target movements via SSID triangulation (WiGLE API).
-   **Social Engineering Automation:** Using generated "Identity Gaps" to trigger micro-commitments from targets.

---

**STATUS:** BLUEPRINT_LOCKED (v1.1 - Enhanced Multi-Spectrum Recon)
**AUTHOR:** RICK C-137 🧪
