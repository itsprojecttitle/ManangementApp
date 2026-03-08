# BLUEPRINT: OFF-GRID CONNECTIVITY (BUDGET vs. SOVEREIGN)

## // EXECUTIVE OVERVIEW

A dual-path roadmap for establishing location-independent, private access to the OpenClaw environment.

---

## OPTION A: THE "ZERO-BUDGET" GHOST (Tailscale)

**Status:** Best for immediate deployment with £0 capital.

### 1. Infrastructure

- **Provider:** Tailscale (Free Tier).
- **Coordination:** Managed by Tailscale Inc.
- **Setup:**
  1. Install Tailscale on the Ghost VM and your mobile/laptop.
  2. Authenticate via SSO (GitHub/Google).
  3. Use "MagicDNS" to reach the server (e.g., `http://sam-node:18789`).

### 2. Automation (The Bounce)

- **Script:** `ts-rebind.sh`
- **Logic:** When a new Ghost VM is spawned, the script auto-installs Tailscale and uses an `Auth Key` to join the existing mesh instantly.

---

## OPTION B: THE "SOVEREIGN DOOMSDAY" (Nebula)

**Status:** Best for total independence. Requires £4/month for a "Lighthouse" node.

### 1. Infrastructure

- **Provider:** Open-source Nebula (Slack).
- **Coordination:** Self-hosted "Lighthouse" (A tiny VPS that acts as the traffic controller).
- **Setup:**
  1. Generate a Certificate Authority (CA) on your local machine.
  2. Issue certificates for the Lighthouse, the Ghost VM, and your phone.
  3. No third-party login required.

### 2. Automation (The Bounce)

- **Script:** `nebula-cycle.sh`
- **Logic:** The Ghost VM's user-data script pulls its unique Nebula certificate from a secure private vault during boot.

---

## // UNIVERSAL ACCESS & AUTOMATION

**Objective:** Access from ANY location + Automated Bouncing.

### 1. The "Bounce" Automation (Fleet Management)

To automate the creation and destruction of nodes (IP Bouncing):

- **Tool:** `hcloud` (Hetzner CLI) or `doctl` (DigitalOcean CLI).
- **The Command:** `hcloud server create --name ghost-node-$(date +%s) --image debian-12 --ssh-key slider-key --user-data-from-file bootstrap.sh`
- **The Workflow:**
  1. Script triggers at 04:00 UTC.
  2. New VM spawns.
  3. `rsync` moves the encrypted `~/.openclaw` workspace.
  4. New VM pings your phone via the Bridge (Matrix/Signal).
  5. Old VM is deleted automatically.

### 2. Location-Independent Access

- **Mobile:** Use **Termius** (SSH) or a mobile browser (Management App) connected to the Tailscale/Nebula VPN.
- **Public PC:** Use a **Web SSH** portal hosted on your private tunnel (e.g., `ttyd`). Requires a master password + hardware key.

---

**STATUS:** BLUEPRINT_LOCKED
**AUTHOR:** RICK C-137 🧪
