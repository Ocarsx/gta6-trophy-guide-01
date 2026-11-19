// Leonida Legend — GTA VI trophy guide & tracker.
// Loads app/data/trophies.json (the official 55), renders the checklist,
// saves earned ticks in localStorage, and offers export / import, filters
// and a spoiler mode. Everything runs offline; no network request is made
// except the local fetch of data/trophies.json.
const STORAGE_KEY = 'leonida-legend-progress-v1';
const SPOILER_KEY = 'leonida-legend-spoiler-v1';
const DATA_URL = 'data/trophies.json';

const KIND_LABELS = {
  story: 'Story', mission: 'Story mission', side: 'Side strand',
  activity: 'Activity', collectible: 'Collectible', exploration: 'Exploration',
  combat: 'Combat & crime', misc: 'Miscellaneous',
};

// Roadmap stages, built only from the official trophy descriptions:
// the order to earn the trophies in. Each stage names trophies by id.
const ROADMAP_STAGES = [
  { title: 'Stage 1 — Play the story', body: 'Chapters 1 to 4, the named story missions and the finale. All of these unlock from story progress alone.', ids: [2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 7] },
  { title: 'Stage 2 — Side strands & strangers', body: 'Finish the stranger strands and the side characters\' final missions before the finale, so nothing is left behind.', ids: [25, 22, 23, 24, 26, 27, 29] },
  { title: 'Stage 3 — Activities', body: 'Shooting range, drone races, races, fishing, arcade, meditation and bowling — the repeatable activities.', ids: [17, 18, 19, 20, 21, 28, 46, 16, 15, 32] },
  { title: 'Stage 4 — Collectibles & exploration', body: 'Cards, WAiNK It spots, vehicles, garages and the full map of Leonida. Explore as you go; sweep up the rest now.', ids: [30, 31, 35, 54, 55, 42] },
  { title: 'Stage 5 — Combat, crime & chaos', body: 'Combat Focus, robberies, vaults, armored trucks and gang operations. Bring a fast getaway car.', ids: [36, 39, 41, 40, 43, 38, 51] },
  { title: 'Stage 6 — Money, choices & the platinum', body: 'Launder marked bills, spend in shops, make choices, then check 100% completion. The platinum pops with the last trophy.', ids: [52, 53, 48, 49, 50, 47, 44, 45, 37, 33, 34, 14, 1] },
];

const listEl = document.getElementById('trophyList');
const roadmapEl = document.getElementById('roadmap');
const statusLine = document.getElementById('statusLine');
const resultCountEl = document.getElementById('resultCount');
const searchInput = document.getElementById('search');
const gradeFilter = document.getElementById('gradeFilter');
const kindFilter = document.getElementById('kindFilter');
const earnedFilter = document.getElementById('earnedFilter');
const missableOnly = document.getElementById('missableOnly');
const spoilerToggle = document.getElementById('spoilerToggle');

let trophies = [];
let earned = loadProgress();
let spoilerMode = localStorage.getItem(SPOILER_KEY) === '1';
spoilerToggle.checked = spoilerMode;

function loadProgress() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return new Set(Array.isArray(raw) ? raw.filter((n) => Number.isInteger(n)) : []);
  } catch {
    return new Set();
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function loadTrophies() {
  return fetch(DATA_URL).then((r) => r.json()).then((doc) => doc.trophies);
}

function isStoryTrophy(t) {
  return t.kind === 'story' || t.kind === 'mission';
}

function trophyHiddenBySpoiler(t) {
  return spoilerMode && isStoryTrophy(t) && !earned.has(t.id);
}

function renderRoadmap() {
  roadmapEl.replaceChildren();
  for (const stage of ROADMAP_STAGES) {
    const li = document.createElement('li');
    const title = document.createElement('strong');
    title.textContent = stage.title;
    li.append(title, document.createTextNode(' — ' + stage.body));
    const names = document.createElement('div');
    names.className = 'stage-trophies';
    names.textContent = stage.ids
      .map((id) => trophies.find((t) => t.id === id))
      .filter(Boolean)
      .map((t) => {
        if (trophyHiddenBySpoiler(t)) return 'Hidden story trophy';
        return (earned.has(t.id) ? '✓ ' : '') + t.name;
      })
      .join(' · ');
    li.append(names);
    roadmapEl.append(li);
  }
  const missables = trophies.filter((t) => t.missable);
  document.getElementById('missableNote').textContent =
    'Missable trophies (' + missables.length + '): ' + missables.map((t) => t.name).join(', ') +
    '. The official descriptions do not confirm which trophies can be missed permanently, so these are the ones tied to a single story moment or a choice — keep a save before those moments. Everything else can be earned at any time.';
}

function gradeBadge(t) {
  const b = document.createElement('span');
  b.className = 'badge ' + t.grade;
  b.textContent = t.grade;
  return b;
}

function kindBadge(t) {
  const b = document.createElement('span');
  b.className = 'badge kind';
  b.textContent = KIND_LABELS[t.kind] ?? t.kind;
  return b;
}

function missableBadge() {
  const b = document.createElement('span');
  b.className = 'badge missable';
  b.textContent = 'Possibly missable';
  return b;
}

function buildCard(t) {
  const card = document.createElement('article');
  card.className = 'card' + (earned.has(t.id) ? ' earned' : '') + (t.missable ? ' missable-flag' : '');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.className = 'tick';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', 'Mark ' + t.name + ' as earned');
  box.addEventListener('change', () => toggleEarned(t.id, box.checked));
  card.append(box);

  const head = document.createElement('div');
  head.className = 'card-head';
  const name = document.createElement('h3');
  if (trophyHiddenBySpoiler(t)) {
    name.textContent = 'Hidden story trophy';
    head.append(name, gradeBadge(t));
    card.append(head);
    const hidden = document.createElement('p');
    hidden.className = 'hidden-story';
    hidden.textContent = 'Spoiler mode is on: this story trophy stays hidden until you earn it. Tick the box when you have earned it to reveal its name and guide.';
    card.append(hidden);
    return card;
  }
  name.textContent = t.name;
  head.append(name, gradeBadge(t), kindBadge(t));
  if (t.missable) head.append(missableBadge());
  card.append(head);

  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = '“' + t.description + '” — official description';
  card.append(official);

  if (t.count) {
    const count = document.createElement('p');
    count.className = 'count-line';
    count.textContent = 'Target: ' + t.count + ' (tracked by PlayStation)';
    card.append(count);
  }

  const guide = document.createElement('details');
  guide.className = 'guide';
  const summary = document.createElement('summary');
  summary.textContent = 'Guide';
  const guideText = document.createElement('p');
  guideText.textContent = t.guide;
  const source = document.createElement('p');
  source.className = 'source';
  source.textContent = 'Source: ' + (t.source ?? 'Official trophy description, PlayStation trophy list');
  guide.append(summary, guideText, source);
  card.append(guide);
  return card;
}

function trophyMatchesFilters(t) {
  const q = searchInput.value.trim().toLowerCase();
  if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
  if (gradeFilter.value !== 'all' && t.grade !== gradeFilter.value) return false;
  if (kindFilter.value !== 'all' && t.kind !== kindFilter.value) return false;
  if (earnedFilter.value === 'earned' && !earned.has(t.id)) return false;
  if (earnedFilter.value === 'remaining' && earned.has(t.id)) return false;
  if (missableOnly.checked && !t.missable) return false;
  return true;
}

function renderList() {
  const shown = trophies.filter(trophyMatchesFilters);
  listEl.replaceChildren();
  if (shown.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'No trophies match these filters. Clear the search or widen the filters.';
    listEl.append(empty);
  } else {
    for (const t of shown) listEl.append(buildCard(t));
  }
  resultCountEl.textContent = 'Showing ' + shown.length + ' of ' + trophies.length + ' trophies';
}

function updateProgress() {
  const n = earned.size;
  const total = trophies.length || 55;
  document.getElementById('progressCount').textContent = n + ' of ' + total + ' earned';
  document.getElementById('progressPercent').textContent = Math.round((n / total) * 100) + '%';
  document.getElementById('progressRemaining').textContent = (total - n) + ' to go';
  document.getElementById('progressFill').style.width = (n / total) * 100 + '%';
}

function renderAll() {
  renderRoadmap();
  renderList();
  updateProgress();
}

function toggleEarned(id, on) {
  if (on) earned.add(id);
  else earned.delete(id);
  saveProgress();
  renderAll();
}

function exportProgress() {
  const payload = {
    game: 'Grand Theft Auto VI',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
  };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
  statusLine.textContent = 'Exported ' + earned.size + ' earned trophies.';
}

function importProgress(file) {
  if (!file) return;
  file.text().then((text) => {
    const data = JSON.parse(text);
    const ids = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(ids)) throw new Error('no earned list');
    const known = new Set(trophies.map((t) => t.id));
    const valid = ids.filter((n) => Number.isInteger(n) && known.has(n));
    earned = new Set(valid);
    saveProgress();
    renderAll();
    statusLine.textContent = 'Imported ' + valid.length + ' earned trophies.';
  }).catch(() => {
    statusLine.textContent = 'Import failed: that file is not a progress export from this guide.';
  });
}

function setSpoilerMode(on) {
  spoilerMode = on;
  localStorage.setItem(SPOILER_KEY, on ? '1' : '0');
  renderRoadmap();
  renderList();
  statusLine.textContent = on ? 'Spoiler mode on: story trophies stay hidden until earned.' : 'Spoiler mode off.';
}

document.getElementById('exportBtn').addEventListener('click', exportProgress);
document.getElementById('importFile').addEventListener('change', (e) => {
  importProgress(e.target.files[0]);
  e.target.value = '';
});
document.getElementById('resetBtn').addEventListener('click', () => {
  earned = new Set();
  saveProgress();
  renderAll();
  statusLine.textContent = 'All ticks cleared.';
});
spoilerToggle.addEventListener('change', () => setSpoilerMode(spoilerToggle.checked));
for (const el of [searchInput, gradeFilter, kindFilter, earnedFilter, missableOnly]) {
  el.addEventListener(el.tagName === 'SELECT' || el.type === 'checkbox' ? 'change' : 'input', renderList);
}

loadTrophies().then((loaded) => {
  trophies = loaded;
  renderAll();
}).catch(() => {
  listEl.replaceChildren();
  const err = document.createElement('p');
  err.className = 'empty';
  err.textContent = 'Could not load the trophy list (data/trophies.json). Check the file is present and reload.';
  listEl.append(err);
});
