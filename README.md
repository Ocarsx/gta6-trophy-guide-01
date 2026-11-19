[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Ocarsx/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Ocarsx/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
# Leonida Legend II — GTA VI Trophy Guide & Tracker

An unofficial, fully offline web app that guides you to the GTA VI platinum
on PlayStation 5: **all 55 trophies** (1 platinum, 2 gold, 6 silver,
46 bronze) with their official names, descriptions and grades, plus a
step-by-step guide for every single trophy.

## What it does

- **Tracker** — check off trophies as you earn them; progress is saved in
  your browser (localStorage) and shown as "X of 55 earned" with a progress
  bar. Export your progress as JSON and import it back later.
- **55 sourced guides** — every trophy has concrete steps written in our own
  words, a tip, difficulty and time estimate, the chapter or mission it
  belongs to, and a named source line (`Source: <guide name>`). Sources
  credited: PowerPyx trophy guide, PSNProfiles, IGN GTA VI wiki,
  TrueTrophies, and the official PlayStation trophy list. No guide text is
  copied, and the app contains no external links at all — it works offline.
- **Roadmap to the platinum** — five phases in order (story, contacts &
  strangers, one big map sweep, grinds & clean-up, platinum), so you never
  have to replay the story.
- **Missable watch-list** — 7 trophies are flagged missable (partner trophies
  and one-time moments) with the chapter where each one lives, shown in the
  roadmap and filterable in the list.
- **Filters & search** — filter by grade, category (story / missable /
  collectibles / activities / other), hide earned trophies, missable-only
  view, and full-text search across names, descriptions, chapters and guide
  steps.
- **Spoiler-safe mode** — hides un-earned story trophies until you earn them.
- **Deep links** — `?view=roadmap`, `?detail=<trophy id>`,
  `?grade=<platinum|gold|silver|bronze>`.

## Run it

Node 22, standard library only, no dependencies, no build step:

```sh
node serve.ts
# open http://127.0.0.1:8080/
```

## Files

- `app/index.html` — page structure (header, progress, controls, roadmap, list, detail panel)
- `app/style.css` — original dark Vice City theme (neon pink / cyan, no external images)
- `app/app.js` — ES module: loads the data, renders the list, filters, tracker, export/import, detail view
- `app/data/trophies.json` — the official 55-trophy list from the kit starter (names, descriptions, grades)
- `app/data/guides.json` — the per-trophy guides: steps, tips, missable flag, chapter, category, named source
- `main.ts` — builds the submission (copies `app/` + `screenshots/`, writes `dossier.json`)
- `serve.ts` — tiny static server for local use
- `shots.json` — the 4 screenshot views
- `screenshots/` — 4 screenshots of the app (each ≤ 256 KiB)

## Sources (named, not linked — the app is offline)

- PowerPyx trophy guide
- PSNProfiles
- IGN GTA VI wiki
- TrueTrophies
- Official PlayStation trophy list

## Note

Unofficial fan-made guide. Not affiliated with Rockstar Games or PlayStation.
No official artwork, logos or game assets are used. Trophy names,
descriptions and grades follow the official PlayStation trophy list;
all guidance text is written in our own words.
