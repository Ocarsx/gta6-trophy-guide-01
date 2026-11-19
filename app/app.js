// Leonida Legend II — offline trophy tracker for GTA VI (PS5).
// Loads the official trophy list and the per-trophy guides, renders the
// checklist, and keeps earned state in localStorage. No network requests.

const STORAGE_KEY = 'leonida-legend-2-earned-v1';
const SPOILER_KEY = 'leonida-legend-2-spoiler-v1';

const $ = (sel) => document.querySelector(sel);
const listEl = $('#trophyList');
const emptyMsg = $('#emptyMsg');
const countLine = $('#countLine');
const progressText = $('#progressText');
const progressPct = $('#progressPct');
const progressFill = $('#progressFill');
const statusMsg = $('#statusMsg');

let trophies = [];
let guides = {};
let earned = new Set();
let spoilerOn = false;

try {
  earned = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
} catch { earned = new Set(); }
spoilerOn = localStorage.getItem(SPOILER_KEY) === '1';

function saveEarned() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned])); } catch { /* storage full/blocked */ }
}

function guideFor(t) { return guides[String(t.id)] || {}; }

function isSpoilerHidden(t) {
  const g = guideFor(t);
  return spoilerOn && g.category === 'story' && !earned.has(t.id);
}

function matchesFilters(t) {
  const q = $('#search').value.trim().toLowerCase();
  const grade = $('#gradeFilter').value;
  const cat = $('#categoryFilter').value;
  const g = guideFor(t);
  if (grade && t.grade !== grade) return false;
  if (cat && g.category !== cat) return false;
  if ($('#hideEarned').checked && earned.has(t.id)) return false;
  if ($('#missableOnly').checked && !g.missable) return false;
  if (q) {
    const hay = [t.name, t.description, g.chapter || '', g.category || '', (g.steps || []).join(' ')].join(' ').toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function renderList() {
  const visible = trophies.filter(matchesFilters);
  listEl.innerHTML = '';
  emptyMsg.hidden = visible.length > 0;
  countLine.textContent = `Showing ${visible.length} of ${trophies.length} trophies · ${earned.size} earned`;
  for (const t of visible) {
    const g = guideFor(t);
    const row = document.createElement('article');
    row.className = 'trophy' + (earned.has(t.id) ? ' earned' : '') + (isSpoilerHidden(t) ? ' spoiler-hidden' : '');
    row.dataset.id = t.id;

    const checkWrap = document.createElement('span');
    checkWrap.className = 'trophy-check';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Mark ${t.name} as earned`);
    box.addEventListener('change', (ev) => {
      ev.stopPropagation();
      if (box.checked) earned.add(t.id); else earned.delete(t.id);
      saveEarned();
      renderList();
      renderProgress();
    });
    checkWrap.appendChild(box);

    const dot = document.createElement('span');
    dot.className = `grade-dot grade-${t.grade}`;
    dot.title = t.grade;

    const body = document.createElement('div');
    body.className = 'trophy-body';
    const top = document.createElement('div');
    top.className = 'trophy-top';
    const name = document.createElement('span');
    name.className = 'trophy-name';
    name.textContent = isSpoilerHidden(t) ? 'Hidden story trophy' : t.name;
    if (earned.has(t.id)) {
      const tag = document.createElement('span');
      tag.className = 'earned-tag';
      tag.textContent = '✓ Earned';
      name.appendChild(tag);
    }
    top.appendChild(name);
    const desc = document.createElement('div');
    desc.className = 'trophy-desc';
    desc.textContent = isSpoilerHidden(t) ? 'Enable spoiler-safe mode off, or earn this trophy, to reveal it.' : t.description;
    body.appendChild(top);
    body.appendChild(desc);

    const meta = document.createElement('div');
    meta.className = 'trophy-meta';
    const gradeLabel = document.createElement('span');
    gradeLabel.className = 'grade-label';
    gradeLabel.textContent = t.grade;
    meta.appendChild(gradeLabel);
    meta.appendChild(document.createTextNode(g.chapter || ''));
    if (g.missable) {
      meta.appendChild(document.createElement('br'));
      const badge = document.createElement('span');
      badge.className = 'badge-missable';
      badge.textContent = '⚠ Missable';
      meta.appendChild(badge);
    }

    row.appendChild(checkWrap);
    row.appendChild(dot);
    row.appendChild(body);
    row.appendChild(meta);
    body.addEventListener('click', () => openDetail(t.id));
    listEl.appendChild(row);
  }
}

function renderProgress() {
  const n = earned.size;
  const pct = Math.round((n / Math.max(trophies.length, 1)) * 100);
  progressText.textContent = `${n} of ${trophies.length} earned`;
  progressPct.textContent = `${pct}%`;
  progressFill.style.width = `${pct}%`;
}

function renderMissableList() {
  const list = trophies.filter((t) => guideFor(t).missable);
  const el = $('#missableList');
  el.textContent = list.map((t) => `${t.name} — ${guideFor(t).chapter || ''}`).join(' · ');
}

function openDetail(id) {
  const t = trophies.find((x) => x.id === id);
  if (!t) return;
  const g = guideFor(t);
  const panel = $('#detail');
  const body = $('#detailBody');
  body.innerHTML = '';
  const h = document.createElement('h2');
  h.textContent = t.name;
  body.appendChild(h);
  const meta = document.createElement('div');
  meta.className = 'detail-meta';
  meta.innerHTML = '';
  const parts = [
    ['Grade', t.grade],
    ['Category', g.category || '—'],
    ['Chapter / area', g.chapter || '—'],
    ['Difficulty', g.difficulty || '—'],
    ['Time', g.time || '—'],
    ['Missable', g.missable ? 'Yes — do during the story' : 'No'],
  ];
  for (const [k, v] of parts) {
    const s = document.createElement('span');
    const b = document.createElement('b');
    b.textContent = `${k}: `;
    s.appendChild(b);
    s.appendChild(document.createTextNode(v));
    meta.appendChild(s);
  }
  body.appendChild(meta);
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = `Official description: ${t.description}`;
  body.appendChild(desc);
  const stepsTitle = document.createElement('h3');
  stepsTitle.textContent = 'How to earn it';
  body.appendChild(stepsTitle);
  const ol = document.createElement('ol');
  for (const step of g.steps || ['Follow the official description above.']) {
    const li = document.createElement('li');
    li.textContent = step;
    ol.appendChild(li);
  }
  body.appendChild(ol);
  if (g.tips) {
    const tip = document.createElement('p');
    tip.className = 'tip';
    tip.textContent = `Tip: ${g.tips}`;
    body.appendChild(tip);
  }
  const src = document.createElement('p');
  src.className = 'source-line';
  src.innerHTML = '';
  const strong = document.createElement('strong');
  strong.textContent = `Source: ${g.source || 'official PlayStation trophy list'}`;
  src.appendChild(strong);
  src.appendChild(document.createTextNode(' — guidance written in our own words; the named guide is credited for the route, not quoted.'));
  body.appendChild(src);
  panel.hidden = false;
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function closeDetail() {
  $('#detail').hidden = true;
}

function flashStatus(msg) {
  statusMsg.textContent = msg;
  setTimeout(() => { statusMsg.textContent = ''; }, 4000);
}

function exportProgress() {
  const data = { game: 'Grand Theft Auto VI', guide: 'Leonida Legend II', earned: [...earned].sort((a, b) => a - b), exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leonida-legend-2-progress.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  flashStatus('Progress exported.');
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      const ids = Array.isArray(data) ? data : data.earned;
      if (!Array.isArray(ids)) throw new Error('bad file');
      const valid = ids.filter((id) => trophies.some((t) => t.id === id));
      earned = new Set(valid);
      saveEarned();
      renderList();
      renderProgress();
      flashStatus(`Imported ${valid.length} earned trophies.`);
    } catch {
      flashStatus('Import failed: not a valid progress file.');
    }
  };
  reader.readAsText(file);
}

function applyUrlParams() {
  const params = new URLSearchParams(location.search);
  const grade = params.get('grade');
  if (grade) { $('#gradeFilter').value = grade; renderList(); }
  const detailId = Number(params.get('detail'));
  if (params.get('view') === 'roadmap') {
    document.getElementById('roadmap').scrollIntoView();
  }
  if (detailId) openDetail(detailId);
}

async function init() {
  const [tRes, gRes] = await Promise.all([fetch('data/trophies.json'), fetch('data/guides.json')]);
  const tData = await tRes.json();
  trophies = tData.trophies || [];
  guides = await gRes.json();

  $('#spoilerToggle').checked = spoilerOn;
  $('#search').addEventListener('input', renderList);
  $('#gradeFilter').addEventListener('change', renderList);
  $('#categoryFilter').addEventListener('change', renderList);
  $('#hideEarned').addEventListener('change', renderList);
  $('#missableOnly').addEventListener('change', renderList);
  $('#spoilerToggle').addEventListener('change', (ev) => {
    spoilerOn = ev.target.checked;
    try { localStorage.setItem(SPOILER_KEY, spoilerOn ? '1' : '0'); } catch { /* ignore */ }
    renderList();
  });
  $('#exportBtn').addEventListener('click', exportProgress);
  $('#importBtn').addEventListener('click', () => $('#importFile').click());
  $('#importFile').addEventListener('change', (ev) => {
    if (ev.target.files[0]) importProgress(ev.target.files[0]);
    ev.target.value = '';
  });
  $('#resetBtn').addEventListener('click', () => {
    if (confirm('Clear all earned trophies?')) {
      earned = new Set();
      saveEarned();
      renderList();
      renderProgress();
      flashStatus('Progress reset.');
    }
  });
  $('#detailClose').addEventListener('click', closeDetail);

  renderList();
  renderProgress();
  renderMissableList();
  applyUrlParams();
}

init();
