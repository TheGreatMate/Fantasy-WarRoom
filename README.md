<p align="center">
  <img src="icon.png" width="96" alt="Fantasy War Room icon">
</p>

<h1 align="center">Fantasy Football War Room</h1>

<p align="center">
  A self-hosted fantasy football draft companion. Set your league's format, import rankings, and run a live draft board with pick-by-pick recommendations — with optional live sync to an in-progress Sleeper draft.
</p>

## Features

- **League setup** — scoring (Standard / Half / Full / Custom PPR), roster construction (QB/RB/WR/TE/FLEX/Superflex/K/D-ST/Bench), snake or linear draft, third-round reversal.
- **Import from Sleeper** — enter a username to pull your league's format, roster construction, and team names live. Falls back to a manual copy/paste flow if a live connection isn't available (e.g. when embedded somewhere that can't reach Sleeper's API directly).
- **Rankings import** — paste or upload a CSV (comma or tab separated, works with a table copied straight out of a browser). Auto-detects common columns including FantasyLife's `Consensus` rank and `Utilization Score`. Save any import as a named set (e.g. "Dynasty PPR", "Redraft Half-PPR") and reuse it instantly next time — stored server-side so it survives restarts and is shared across every device that opens the app.
- **Live draft board** — round-by-round grid, searchable/filterable player pool, tier breaks, value-vs-ADP.
- **Recommendations** — best-available, positional need, scarcity/cliff warnings, and value, all shown with plain-language reasons.
- **Live Sleeper sync** — for an in-progress Sleeper draft, picks apply automatically as they happen. For dynasty leagues, it also pulls every team's actual current roster so recommendations reflect real positional needs (not just picks made in the current draft) and already-rostered players are correctly excluded from "available."

## Quick start (Docker Compose)

```bash
git clone https://github.com/TheGreatMate/Fantasy-WarRoom.git
cd Fantasy-WarRoom
docker compose up --build -d
```

Open `http://<host>:8934/war-room.html`.

Saved rankings sets are stored in `./data/rankings.json`, mounted into the container — back that folder up if you want to preserve your saved sets.

## Quick start (Unraid)

A prebuilt image is published automatically to GHCR on every push: `ghcr.io/thegreatmate/fantasy-warroom:latest`.

**Docker tab → Add Container**, filled in manually or from the template:

- Repository: `ghcr.io/thegreatmate/fantasy-warroom:latest`
- Port: `8934` → `8934` (container → host, host side can be changed if taken)
- Path: `/app/data` → `/mnt/user/appdata/fantasy-warroom` (read/write) — this is where saved rankings live

Template URL (for Unraid's template-from-URL flow, if your setup supports it):
`https://raw.githubusercontent.com/TheGreatMate/Fantasy-WarRoom/master/unraid-template.xml`

## Using it

1. **League Format** — set your scoring and roster, or paste a Sleeper username to pull it in live.
2. **Import Rankings** — paste/upload a CSV, or reuse a previously saved set.
3. **Start the Draft** — if you connected live to a Sleeper league with an in-progress or upcoming draft, you'll see a "Live-sync picks from this Sleeper draft" option.
4. During the draft, the right-hand panel shows recommendations for whoever's on the clock, plus your own roster and (for dynasty leagues with live sync) real positional needs.

## Notes

- Auction drafts aren't supported yet — snake and linear only.
- Live Sleeper sync (auto-picks, league import, dynasty roster needs) needs the page to be able to reach `api.sleeper.app` directly from the browser. This works when self-hosted; a page embedded somewhere that blocks outbound requests will fall back to manual copy/paste import instead.
- Draft-in-progress state lives in the browser (`localStorage`), scoped per device/browser. Saved rankings sets are the one thing stored server-side, so they're the only thing shared across devices.
