# BLUEPRINT_CYBER_DECK_SDR.md - Sovereign Off-Grid Communications & Reconnaissance

## 1. Core Directive: Absolute Internet Freedom (via SDR)

*   **Goal:** Establish a completely isolated, self-sustaining "Cyber Deck" capable of independent communication, reconnaissance, and data exfiltration without reliance on traditional internet infrastructure.
*   **Principle:** Leverage Software Defined Radio (SDR) for primary connectivity (radio bands, satellite, mesh networks) and tactical data acquisition.
*   **Zero-Trust by Design:** No reliance on commercial ISPs, cloud providers, or centralized services for core communication.
*   **Funding:** Initial build phase targets £0 budget, utilizing open-source software, low-cost/scavenged hardware, and leveraging "Ghost Fuel" for future upgrades (e.g., higher-end SDRs, power solutions).

## 2. Physical Architecture (The "Shell" - £0 Start)

### 2.1. Processing Unit (Single Board Computer - SBC)
*   **Requirement:** Low power, small form factor, adequate processing for SDR, multiple USB ports.
*   **Initial Candidate (£0):** Raspberry Pi 3/4 (if scavenged/existing), Orange Pi, NanoPi. Focus on robust ARM architecture.
*   **Future Upgrade:** Intel NUC/mini-PC for higher processing power if required for advanced SDR signal processing.

### 2.2. Software Defined Radio (SDR) Hardware
*   **Requirement:** Wide frequency range, decent sample rate, open-source driver support.
*   **Initial Candidate (£0-£30):** RTL-SDR dongle (e.g., RTL2832U with R820T2 tuner). Cost-effective entry point for VHF/UHF, FM, DAB, ADS-B.
*   **Future Upgrade:** HackRF One, LimeSDR, BladeRF. For wider frequency coverage (HF to GHz), full-duplex operation, and transmit capabilities for advanced mesh/satellite comms.

### 2.3. Antennas
*   **Requirement:** Portable, versatile, wideband.
*   **Initial Candidate (£0):** DIY dipole/loop antennas (cut to specific frequencies), telescopic whip antenna.
*   **Future Upgrade:** Portable Yagi (directional), discone (wideband receive), helical (satellite), mobile mesh network antennas (e.g., for LoRa/Packet Radio).

### 2.4. Power Management
*   **Requirement:** Portable, long-lasting, rechargeable.
*   **Initial Candidate (£0):** USB Power Bank (high mAh, repurposed from old devices), solar charger (small, repurposed).
*   **Future Upgrade:** Dedicated LiFePO4 battery pack with solar charging, DC-DC converters for clean power, intelligent power management system.

### 2.5. Display & Input
*   **Requirement:** Compact, low power, legible.
*   **Initial Candidate (£0):** Small portable monitor (HDMI), smartphone acting as display (VNC/SSH to SBC). Mini Bluetooth keyboard/mouse.
*   **Future Upgrade:** Integrated ruggedized touchscreen (e.g., 7-inch Raspberry Pi screen), foldable keyboard, trackball.

### 2.6. Enclosure
*   **Requirement:** Rugged, portable, EMI shielding.
*   **Initial Candidate (£0):** Repurposed Pelican-style case, waterproof ammunition box, custom 3D-printed enclosure (if access to 3D printer). Add copper tape for basic EMI shielding.
*   **Future Upgrade:** Custom-fabricated, fully shielded, ruggedized case with integrated cooling and power.

## 3. Digital Architecture (The "Brain" - £0 Start)

### 3.1. Operating System (OS)
*   **Requirement:** Lightweight, Linux-based, robust, strong security features, extensive driver support.
*   **Initial Candidate (£0):** Debian ARM (headless), Kali Nethunter (if on supported mobile device/SBC), custom minimal build with only necessary packages.
*   **Configuration:** Hardened kernel, full disk encryption, minimal attack surface, no unnecessary services.

### 3.2. SDR Software Suite
*   **Requirement:** Capable of scanning, demodulating, analyzing, and potentially transmitting various radio signals.
*   **Initial Candidate (£0):**
    *   **SDR Receiver:** GQRX, SDR++, CubicSDR (GUI-based).
    *   **Signal Processing:** GNU Radio (for custom flowgraphs, advanced modulation/demodulation, custom protocols).
    *   **Specific Tools:** `rtl_fm`, `rtl_power`, `kalibrate-rtl` (GSM sniffing), `dump1090` (ADS-B aircraft tracking), `gr-satnogs` (satellite ground station).
*   **Relevance to Oracle:** Crucial for passive reconnaissance (OSINT via radio), establishing new comms channels, and understanding wireless environments.

### 3.3. Communication & Networking Software
*   **Requirement:** Decentralized, encrypted, resilient communication.
*   **Initial Candidate (£0):**
    *   **Mesh Networking:** Reticulum Network Stack, Yggdrasil, cjdns (for encrypted, decentralized routing over various transports including radio).
    *   **Packet Radio:** Direwolf (APRS modem), AX.25 utilities.
    *   **Satellite Communication:** Software for receiving NOAA weather satellites, amateur radio satellites (e.g., cubesats).
    *   **Encryption:** OpenVPN (if over an IP-based link), WireGuard (post-quantum readiness), GPG for file encryption.
*   **Relevance to Sovereign Bridge:** Direct implementation of `BLUEPRINT_SOVEREIGN_BRIDGE.md` for truly off-grid connectivity.

### 3.4. Reconnaissance & OSINT Tools
*   **Requirement:** Passive data collection, signal analysis, vulnerability scanning (if applicable to radio protocols).
*   **Initial Candidate (£0):**
    *   **Wireless Analysis:** Wireshark (for captured radio packets), Kismet (wireless network detector), Aircrack-ng suite.
    *   **Metadata Extraction:** Custom scripts (Python/Go) to parse captured radio data for hidden information.
    *   **Jamming/Spoofing (Passive):** Tools to identify and analyze signals for potential future active countermeasures (e.g., GPS spoofing analysis, but *not* active transmission in initial phases).
*   **Relevance to Oracle Recon/OSINT:** Expands our reconnaissance capabilities into the RF spectrum, identifying new sources of intelligence.

### 3.5. Automation & Control
*   **Requirement:** Scripting for repetitive tasks, remote access (local only), workflow management.
*   **Initial Candidate (£0):** Bash scripts, Python automation, SSH (local only for multi-user access/control), Tmux/Screen for persistent sessions.
*   **Relevance to Auto-Provisioning:** The logic from `BLUEPRINT_AUTO_PROVISIONING.md` (e.g., dynamic configuration, resource allocation) will be adapted for the Cyber Deck's internal management.

## 4. Budget & Funding (Ghost Fuel Integration)

### 4.1. Initial £0 Phase
*   **Hardware:** Repurpose existing SBCs (e.g., old Raspberry Pis), use discarded electronics (power banks, small displays). DIY antennas from wire/coax.
*   **Software:** Exclusively open-source and free software (Linux, GQRX, GNU Radio, Reticulum, etc.).
*   **Connectivity:** Utilize ISM bands, amateur radio frequencies (license-dependent for transmit), public satellite signals (NOAA).

### 4.2. "Ghost Fuel" Allocation
*   **Priority 1:** Acquire higher-end SDRs (HackRF One, LimeSDR) for expanded frequency range, duplex operation, and transmit capability.
*   **Priority 2:** Invest in robust, long-duration power solutions (LiFePO4, high-efficiency solar panels).
*   **Priority 3:** Purchase professional-grade, portable antennas for specific bands (e.g., directional Yagis for long-range point-to-point, helical for satellite).
*   **Priority 4:** Ruggedized, EMI-shielded enclosure.
*   **Priority 5:** Specialized components (e.g., GPS receivers for precise timing/location, specialized RF amplifiers).

## 5. Security & Sovereignty
*   **Isolation:** The Cyber Deck is designed to be physically and logically isolated from conventional internet.
*   **Encryption:** All critical communications and stored data must be encrypted at rest and in transit.
*   **Physical Security:** Tamper detection, remote wipe capabilities (if networked locally), secure boot.
*   **Supply Chain:** Focus on verifiable open-source hardware designs where possible, or well-understood commercial off-the-shelf (COTS) components.

## 6. Integration with Oracle
*   This blueprint becomes a cornerstone of the `Oracle` framework, providing the **physical and digital means for truly off-grid reconnaissance and communication**, independent of any external provider.
*   Insights from `The Hacker Playbook` series on stealth, evasion, and lateral movement will be directly applied to how the Cyber Deck operates and protects itself in hostile RF environments.
*   The `Infinite Ghost` model benefits from this by having a completely independent communication channel for orchestration and data exfiltration, bypassing traditional internet chokepoints.
