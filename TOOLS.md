# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### GaaS — Infraestructura

- **VPS:** Hostinger, Ubuntu 24.04, Node 24
- **IP:** 2.25.183.239
- **Dashboard (Vercel):** https://apexmont-dashboard.vercel.app
- **API:** http://2.25.183.239:3456
- **Servicio:** `gaas-api.service` (systemd)
- **Proxy Vercel → VPS:** `/api/gaas/[...path]`
- **Repo GaaS:** `Pablovelazquezb/apexmont-gaas`
- **Repo Agent Dashboard:** `Pablovelazquezb/apexmont-agent-dashboard`
- **GitHub Token:** (almacenado localmente en `~/.git-credentials`)
- **GitHub Email:** `pablovelazquezbremont@gmail.com`
- **Ruta en VPS:** `/root/apexmont-gaas`
- **SSH:** `ssh root@2.25.183.239`
- **Pass:** `h;jhU;yb0y.RDXo?`

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

## Related

- [Agent workspace](/concepts/agent-workspace)
