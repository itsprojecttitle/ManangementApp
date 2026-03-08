# BLUEPRINT: GHOST FLEET (v1.0)

## // EXECUTIVE OVERVIEW

A framework for total decoupling of the OpenClaw Brain (Workspace) from the Body (VM/Host), allowing for rapid migration and location independence.

---

## 1. THE INFRASTRUCTURE

- **Providers:** Hetzner, Vultr, or DigitalOcean (API-driven).
- **Mesh Network:** **Tailscale**. Every node joins a private "Tailnet" for a static internal IP.
- **Disk Encryption:** The `~/.openclaw` workspace resides in a **LUKS-encrypted partition** or a **VeraCrypt container**.

## 2. THE MIGRATION PROTOCOL (`ghost-migrate.sh`)

1.  **Snapshot:** Create a compressed archive of the encrypted workspace.
2.  **Spawn:** Use the provider CLI (e.g., `hcloud server create`) to spin up a fresh Debian 12 instance in a different region.
3.  **Inject:** Install Tailscale and `openclaw` via automated bootstrap.
4.  **Transfer:** `rsync` the workspace over the Tailnet to the new node.
5.  **Nuke:** Once the new node is verified active, the old server is wiped and deleted.

## 3. COSTS

- **VM (Active):** £5/month.
- **Tailscale:** Free Tier.

---

**STATUS:** BLUEPRINT_LOCKED
**AUTHOR:** RICK C-137 🧪
