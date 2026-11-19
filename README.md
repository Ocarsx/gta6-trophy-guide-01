# Leonida Legend — GTA VI Trophy Guide & Tracker

![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)
![rank](https://make.fun/badge/gta6-trophy-guide-01/Ocarsx/gta6-trophy-guide-01/rank.svg)
![reward](https://make.fun/badge/gta6-trophy-guide-01/Ocarsx/gta6-trophy-guide-01/reward.svg)

An offline guide and tracker for all **55 PlayStation 5 trophies of Grand Theft Auto VI** — 1 platinum, 2 gold, 6 silver and 46 bronze. Every trophy is shown with its official name, description and grade as PlayStation publishes them, plus a guide in our own words that cites its sources, a roadmap to the platinum, and the possibly-missable trophies flagged.

## What it does

- **Checklist tracker** — tick trophies off; progress is saved in the browser (localStorage) and can be exported to a JSON file and imported back.
- **Filters & search** — filter by grade (platinum / gold / silver / bronze), by kind (story, story missions, side strands, activities, collectibles, exploration, combat & crime, miscellaneous), by earned / not yet earned, or show missable trophies only. Search by name or description.
- **Spoiler mode** — hides story trophies (name, description and guide) until you earn them.
- **Roadmap to the platinum** — six stages in the order to earn them, built only from the official trophy descriptions: story first, then side strands, activities, collectibles, combat & crime, and finally money, choices and 100% completion.
- **Cited guides** — each trophy's guide says where its facts come from (the official trophy description and the PlayStation trophy list, as published on PSNProfiles / Exophase). GTA VI releases 19 November 2026: where a method is not publicly known yet, the guide says so honestly instead of inventing mission names or locations.
- **Fully offline** — static files under `app/` with no build step; nothing is loaded over the network at runtime. No Rockstar Games logo, official artwork or game screenshot is used; the look is our own.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. `node serve.ts --port <n>` serves on another port.

## Layout

- `app/index.html` — the guide page
- `app/style.css` — the look (original CSS, no borrowed artwork)
- `app/app.js` — checklist, filters, spoiler mode, export / import, roadmap
- `app/data/trophies.json` — the official 55 trophies with guides, kinds, counts and missable flags
- `main.ts` — hands the entry in: copies `app/` and `screenshots/` to the output and writes `dossier.json`
- `serve.ts` — local static server for testing
- `screenshots/` — 3–4 real renders of the guide

## Verify the entry

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This writes `out/dossier.json` alongside `out/app/` and `out/screenshots/`.

---

Entered on [make.fun](https://make.fun/?ref=s1m1n3px&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards
