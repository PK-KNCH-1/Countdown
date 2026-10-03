/* Countdown — IGCSE revision tracker. Plain JS, no build step. */
'use strict';

/* ───────────── small utilities ───────────── */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const plural = (n, one, many) => `${n} ${n === 1 ? one : (many || one + 's')}`;
const fmtNum = (n, d = 1) => (Math.round(n * 10 ** d) / 10 ** d).toFixed(d).replace(/\.0+$/, '');

const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayISO = () => iso(new Date());
const dayNum = (s) => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d) / 86400000; };
const fromDayNum = (n) => { const d = new Date(n * 86400000); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`; };
const addDays = (s, n) => fromDayNum(dayNum(s) + n);
const daysUntil = (s) => dayNum(s) - dayNum(todayISO());
const dateObj = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
function fmtDate(s, style = 'short') {
  const d = dateObj(s);
  if (style === 'long') return `${d.toLocaleDateString('en-GB', { weekday: 'short' })} ${d.getDate()} ${d.toLocaleDateString('en-GB', { month: 'short' })} ${d.getFullYear()}`;
  if (style === 'day') return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  if (style === 'dm') return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${d.toLocaleDateString('en-GB', { weekday: 'short' })} ${d.getDate()} ${d.toLocaleDateString('en-GB', { month: 'short' })}`;
}
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function uid() {
  const a = new Uint8Array(9);
  crypto.getRandomValues(a);
  return [...a].map((b) => 'abcdefghijkmnopqrstuvwxyz23456789'[b % 33]).join('');
}

/* ───────────── exam data lookups ───────────── */

const PREVIEW = !!(window.COUNTDOWN_CONFIG && window.COUNTDOWN_CONFIG.preview);
const SUBJ = Object.fromEntries(SUBJECTS.map((s) => [s.id, s]));
const ALL_SP = SUBJECTS.flatMap((s) => s.papers.map((p) => `${s.id}_${p.id}`));
const SERIES_BY_ID = Object.fromEntries(SERIES.map((s) => [s.id, s]));
const SER_SHORT = { ON: 'O/N', MJ: 'M/J', FM: 'F/M' };
const EXAM_BY_SP = {};
const EXAMS_BY_DATE = {};
for (const x of EXAMS) {
  EXAM_BY_SP[`${x.s}_${x.p}`] = x;
  (EXAMS_BY_DATE[x.date] = EXAMS_BY_DATE[x.date] || []).push(x);
}
const LAST_EXAM = EXAMS[EXAMS.length - 1].date;

const splitSp = (sp) => { const i = sp.indexOf('_'); return { s: sp.slice(0, i), p: sp.slice(i + 1) }; };
const paperOf = (sId, pId) => SUBJ[sId].papers.find((p) => p.id === pId);
const variants = (sId, ser, pId) => ((PP_AVAILABILITY[sId] || {})[ser] || {})[pId] || [];
const seriesOffered = (sId, ser) => SUBJ[sId].papers.some((p) => variants(sId, ser, p.id).length);
const pkey = (s, p, y, ser, v) => `${s}_${p}_${y}_${ser}_${v}`;
function parseKey(k) {
  const [s, p, y, ser, v] = k.split('_');
  return { s, p, y: Number(y), ser, v: Number(v), sp: `${s}_${p}` };
}
function compCode(sId, pId, v) {
  const s = SUBJ[sId], p = paperOf(sId, pId);
  return s.syl ? `${s.syl}/${p.n}${v}` : `Paper ${p.n} v${v}`;
}
const compTail = (sId, pId, v) => `${paperOf(sId, pId).n}${v}`;
const spLabel = (sp) => { const { s, p } = splitSp(sp); return `${SUBJ[s].name} Paper ${paperOf(s, p).n}`; };
const spTag = (sp) => { const { s, p } = splitSp(sp); return `${SUBJ[s].code}${paperOf(s, p).n}`; };
const deadlineOf = (sp) => (EXAM_BY_SP[sp] ? EXAM_BY_SP[sp].date : LAST_EXAM);

/* ───────────── colour: one hue per subject, one lightness step per paper ───────────── */

function hslToRgb(h, s, l) {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}
function relLum([r, g, b]) {
  const c = (v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b);
}
const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';
const colorCache = {};
function col(sId, pId, forPrint) {
  const mode = forPrint ? 'print' : (isDark() ? 'dark' : 'light');
  const ck = `${mode}|${sId}|${pId || ''}`;
  if (colorCache[ck]) return colorCache[ck];
  const s = SUBJ[sId];
  const n = s.papers.length;
  const i = pId ? s.papers.findIndex((p) => p.id === pId) : -1;
  const step = i < 0 ? 1 : (n === 2 ? i * 2 : i);
  const Ls = mode === 'dark' ? [74, 62, 51] : [62, 50, 39];
  const S = mode === 'dark' ? 64 : 60;
  const L = Ls[step];
  const rgb = hslToRgb(s.hue, S, L);
  const lm = relLum(rgb);
  const cDark = (lm + 0.05) / 0.06, cLight = 1.05 / (lm + 0.05);
  const out = {
    bg: `hsl(${s.hue} ${S}% ${L}%)`,
    fg: cDark >= cLight ? '#0c1626' : '#ffffff',
    soft: `hsl(${s.hue} ${S}% ${L}% / ${mode === 'dark' ? 0.2 : 0.16})`,
    rgb: rgb.map((x) => Math.round(x * 255)),
  };
  colorCache[ck] = out;
  return out;
}
const swatch = (sId, pId) => `<i class="sw" style="background:${col(sId, pId).bg}" aria-hidden="true"></i>`;

/* ───────────── state, rebuilt from the record store ───────────── */

let state = { entries: {}, targets: {}, lib: {}, goals: {}, tsel: {}, quiz: {}, qdays: {} };
let derived = { doneBySp: {}, keysBySp: {}, recentKey: null };

function applyRec(k, v) {
  const i = k.indexOf('/');
  const kind = k.slice(0, i), rest = k.slice(i + 1);
  if (kind === 't') { if (v == null) delete state.targets[rest]; else state.targets[rest] = v; }
  else if (kind === 'p') { if (v == null) delete state.lib[rest]; else state.lib[rest] = v; }
  else if (kind === 'g') { if (v == null) delete state.goals[rest]; else state.goals[rest] = v; }
  else if (kind === 'ts') { if (v == null) delete state.tsel[rest]; else state.tsel[rest] = v; }
  else if (kind === 'q') { if (v == null) delete state.quiz[rest]; else state.quiz[rest] = v; }
  else if (kind === 'qd') { if (v == null) delete state.qdays[rest]; else state.qdays[rest] = v; }
  else if (kind === 'e') {
    const j = rest.indexOf('/');
    const date = rest.slice(0, j), cell = rest.slice(j + 1);
    if (v == null) {
      if (state.entries[date]) {
        delete state.entries[date][cell];
        if (!Object.keys(state.entries[date]).length) delete state.entries[date];
      }
    } else {
      (state.entries[date] = state.entries[date] || {})[cell] = v;
    }
  }
}

function rebuild() {
  state = { entries: {}, targets: {}, lib: {}, goals: {}, tsel: {}, quiz: {}, qdays: {} };
  for (const [k, r] of Object.entries(Store.rec)) if (r && r.v !== null) applyRec(k, r.v);
  derive();
}

function derive() {
  const doneBySp = {}, keysBySp = {};
  let recentKey = null, recentT = 0;
  for (const [k, r] of Object.entries(state.lib)) {
    if (!r || !r.done) continue;
    const { sp } = parseKey(k);
    doneBySp[sp] = (doneBySp[sp] || 0) + 1;
    (keysBySp[sp] = keysBySp[sp] || []).push(k);
    if (r.markedAt && r.markedAt > recentT) { recentT = r.markedAt; recentKey = k; }
  }
  derived = { doneBySp, keysBySp, recentKey };
}

/* Every write goes through here: it updates the store (which marks the record for sync) and the live state. */
function setRec(k, v) {
  if (Store.put(k, v)) { applyRec(k, v === undefined ? null : v); return true; }
  return false;
}

function commit(opts = {}) {
  Store.persist();
  derive();
  if (!opts.noRender) render();
  Sync.schedule(opts.syncDelay || 700);
}

/* ───────────── domain mutations ───────────── */

function cellOf(date, sp) { return (state.entries[date] || {})[sp]; }

function adjustDone(date, sp, delta) {
  const prev = cellOf(date, sp);
  const c = prev || { planned: 0, done: 0, auto: true };
  const done = Math.max(0, (c.done || 0) + delta);
  if (c.auto && done === 0 && !(c.planned > 0)) setRec(`e/${date}/${sp}`, null);
  else {
    const next = { planned: c.planned || 0, done };
    if (c.auto) next.auto = true;
    setRec(`e/${date}/${sp}`, next);
  }
  if ((state.entries[date] || {}).__rest) setRec(`e/${date}/__rest`, null);
}

function savePaper(key, { obt, tot, date }) {
  const prev = state.lib[key];
  const { sp } = parseKey(key);
  if (obt == null) tot = null;
  let score = null;
  if (obt != null && tot != null && tot > 0) score = Math.round((obt / tot) * 100);
  else if (obt == null && tot == null && prev && prev.score != null && prev.marksObtained == null) score = prev.score;
  const rec = {
    done: true,
    marksObtained: obt,
    marksTotal: tot,
    score,
    date: date || null,
    markedAt: (prev && prev.markedAt) || Date.now(),
  };
  if (!prev) rec.markedAt = Date.now();
  setRec(`p/${key}`, rec);
  const oldDate = prev ? prev.date : null;
  if (oldDate !== rec.date) {
    if (oldDate) adjustDone(oldDate, sp, -1);
    if (rec.date) adjustDone(rec.date, sp, +1);
  }
  return !prev;
}

function removePaper(key) {
  const prev = state.lib[key];
  if (!prev) return;
  setRec(`p/${key}`, null);
  if (prev.date) adjustDone(prev.date, parseKey(key).sp, -1);
}

/* ───────────── calculations ───────────── */

/* A subject's target is either a chosen set of years and series (every paper Cambridge set
   in them), or numbers typed by hand. Older data has only numbers; when those numbers
   match "2020–2026, every series" exactly, that selection is assumed. */
const DEFAULT_SEL = { years: TARGET_YEARS.slice().reverse(), series: ['ON', 'MJ', 'FM'] };
function countIn(sId, pId, sel) {
  let n = 0;
  for (const y of sel.years) for (const ser of sel.series) n += variants(sId, ser, pId).length;
  return n;
}
function targetSel(sId) {
  const r = state.tsel[sId];
  if (r) return r.manual ? null : { years: r.years || [], series: r.series || [] };
  const ok = SUBJ[sId].papers.every((p) => {
    const t = state.targets[`${sId}_${p.id}`];
    return t == null || Number(t) === countIn(sId, p.id, DEFAULT_SEL);
  });
  return ok ? DEFAULT_SEL : null;
}
function doneOf(sp) {
  const { s } = splitSp(sp);
  const sel = targetSel(s);
  if (!sel) return derived.doneBySp[sp] || 0;
  let n = 0;
  for (const k of derived.keysBySp[sp] || []) {
    const p = parseKey(k);
    if (sel.years.includes(p.y) && sel.series.includes(p.ser)) n++;
  }
  return n;
}
function targetOf(sp) {
  const { s, p } = splitSp(sp);
  const sel = targetSel(s);
  return sel ? countIn(s, p, sel) : (Number(state.targets[sp]) || 0);
}
function writeSel(sId, sel) {
  const years = [...new Set(sel.years)].sort((a, b) => b - a);
  const series = SERIES.map((x) => x.id).filter((id) => sel.series.includes(id));
  setRec(`ts/${sId}`, { years, series });
  for (const p of SUBJ[sId].papers) setRec(`t/${sId}_${p.id}`, countIn(sId, p.id, { years, series }));
}
function selSummary(sel) {
  if (!sel.years.length || !sel.series.length) return 'Nothing selected';
  const ys = sel.years.slice().sort((a, b) => a - b);
  const contiguous = ys.every((y, i) => i === 0 || y === ys[i - 1] + 1);
  const yTxt = ys.length === 1 ? `${ys[0]}` : contiguous ? `${ys[0]}–${ys[ys.length - 1]}` : `${ys.length} years`;
  const sTxt = sel.series.length === 3 ? 'every series' : sel.series.map((id) => SERIES_BY_ID[id].name).join(' and ');
  return `${yTxt}, ${sTxt}`;
}

function totals() {
  let target = 0, done = 0, left = 0, perDay = 0;
  const bySubj = {};
  for (const sp of ALL_SP) {
    const t = targetOf(sp), d = Math.min(doneOf(sp), t);
    target += t; done += d; left += t - d;
    const { s } = splitSp(sp);
    bySubj[s] = (bySubj[s] || 0) + d;
    const du = daysUntil(deadlineOf(sp));
    if (t - d > 0 && du >= 0) perDay += (t - d) / Math.max(1, du);
  }
  return { target, done, left, perDay, bySubj, pct: target ? (done / target) * 100 : 0 };
}

function subjStats(sId) {
  let target = 0, done = 0, raw = 0;
  const per = [];
  for (const p of SUBJ[sId].papers) {
    const sp = `${sId}_${p.id}`;
    const t = targetOf(sp), d = doneOf(sp);
    target += t; done += Math.min(d, t); raw += derived.doneBySp[sp] || 0;
    per.push({ p, t, d });
  }
  const scores = Object.entries(state.lib)
    .filter(([k, r]) => r.done && r.score != null && parseKey(k).s === sId)
    .map(([, r]) => r.score);
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  return { target, done, raw, per, avg, best: scores.length ? Math.max(...scores) : null, n: scores.length };
}

function nextExams() {
  const t = todayISO();
  return EXAMS.filter((x) => x.date >= t);
}

function weekStartOf(dateISO) {
  return addDays(dateISO, -dateObj(dateISO).getDay());
}

function papersDoneBetween(a, b) {
  let n = 0;
  for (const r of Object.values(state.lib)) if (r.done && r.date && r.date >= a && r.date <= b) n++;
  return n;
}

function defaultTotal(sp) {
  const counts = {};
  for (const [k, r] of Object.entries(state.lib)) {
    if (r.marksTotal && parseKey(k).sp === sp) counts[r.marksTotal] = (counts[r.marksTotal] || 0) + 1;
  }
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return best ? Number(best[0]) : null;
}

function goalProgress(g) {
  const keys = g.paperKeys || [];
  const done = keys.filter((k) => state.lib[k] && state.lib[k].done).length;
  return { done, total: keys.length, left: keys.length - done };
}

/* ───────────── UI state ───────────── */

const ui = {
  tab: 'stats',
  lib: null,                  // { s, y, ser }
  form: null,                 // { key, ctx: 'lib' | 'goal' }
  cal: { y: null, m: null, pick: null, armed: null },
  weekOff: 0,
  goals: { draft: null, open: null },
  sheet: null,
  pendingRender: false,
  qr: false,
};

/* ───────────── render ───────────── */

function render(opts = {}) {
  const ae = document.activeElement;
  if (opts.fromRemote && ae && ae.closest && ae.closest('#main') && /INPUT|TEXTAREA|SELECT/.test(ae.tagName)) {
    ui.pendingRender = true;
    renderChrome();
    return;
  }
  ui.pendingRender = false;
  renderChrome();
  const v = ui.tab;
  if (v === 'stats') renderStats();
  else if (v === 'calendar') renderCalendar();
  else if (v === 'goals') renderGoals();
  else if (v === 'quiz') renderQuiz();
  else if (v === 'targets') renderTargets();
  else if (v === 'data') renderData();
}

function renderAll() {
  renderChrome();
  renderStats(); renderCalendar(); renderQuiz(); renderGoals(); renderTargets(); renderData();
}

function renderChrome() {
  $$('.view').forEach((el) => { el.hidden = el.dataset.view !== ui.tab; });
  $$('.tab').forEach((b) => b.setAttribute('aria-current', b.dataset.tab === ui.tab ? 'page' : 'false'));
  $('#heroBody').innerHTML = heroHTML();
  document.body.classList.toggle('qz-focus', ui.tab === 'quiz' && !!(ui.qz && ui.qz.active));
  renderSyncPill();
}

function syncText() {
  if (PREVIEW) return { short: 'Preview', long: 'Sync isn\u2019t switched on in this preview.' };
  const s = Sync.status;
  if (s === 'local') return { short: 'Not synced', long: 'This device isn’t syncing yet.' };
  if (s === 'syncing') return { short: 'Syncing', long: 'Syncing…' };
  if (s === 'offline') return { short: 'Offline', long: 'You’re offline. Changes are saved on this device and will sync when you’re back online.' };
  if (s === 'error') return { short: 'Sync paused', long: Sync.message || 'Sync is paused. Changes are kept on this device.' };
  return { short: 'Synced', long: Sync.lastOk ? `Synced ${ago(Sync.lastOk)}.` : 'Synced.' };
}
function ago(t) {
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 45) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${plural(m, 'minute')} ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${plural(h, 'hour')} ago`;
  return `${plural(Math.round(h / 24), 'day')} ago`;
}
function renderSyncPill() {
  const p = $('#syncPill');
  const t = syncText();
  p.dataset.state = Sync.status;
  p.innerHTML = `<span class="sp-dot" aria-hidden="true"></span><span class="sp-txt">${esc(t.short)}</span>`;
  p.setAttribute('aria-label', `Sync: ${t.short}. Open sync settings.`);
  const card = $('#syncStatusLine');
  if (card) card.textContent = t.long;
}

/* ── Stats ── */

function renderStats() {
  const el = $('#v-stats');
  el.innerHTML = [
    syncBannerHTML(),
    overallHTML(),
    quizStatsHTML(),
    goalsStatsHTML(),
    overviewHTML(),
    subjectsHTML(),
    activityHTML(),
    examsHTML(),
    PREVIEW ? '' : `<div class="print-row"><button class="btn" data-act="print">Print or save as PDF</button></div>`,
  ].join('');
  afterLibRender(el);
}

function heroHTML() {
  const list = nextExams();
  const t = totals();
  const stats = `<div class="hero-stats">
      <div><b>${t.pct.toFixed(2)}%</b><span>overall</span></div>
      <div><b>${t.left}</b><span>papers left</span></div>
      <div><b>${list.length ? Math.max(0, daysUntil(list[0].date)) : 0}</b><span>days left</span></div>
      <div><b>${t.left && list.length ? fmtNum(t.perDay, 1) : 0}</b><span>a day needed</span></div>
    </div>`;
  if (!list.length) {
    return `<div class="hero-count hero-done"><span class="hero-number">Done</span><span class="hero-unit">every paper on the timetable is sat. Well done.</span></div>${stats}`;
  }
  const nx = list[0];
  const d = daysUntil(nx.date);
  const same = list.filter((x) => x.date === nx.date && x !== nx);
  const count = d === 0
    ? `<span class="hero-number">Today</span><span class="hero-unit">is your next paper</span>`
    : `<span class="hero-number">${d}</span><span class="hero-unit">${d === 1 ? 'day' : 'days'} to your next paper</span>`;
  return `<div class="hero-count">${count}</div>
    <p class="hero-next"><b>${esc(SUBJ[nx.s].name)} ${esc(nx.title)}</b>, ${esc(nx.code)}, ${fmtDate(nx.date, 'long')}${nx.session === 'Morning' || nx.session === 'Afternoon' ? `, ${nx.session.toLowerCase()}` : ''}</p>
    ${same.length ? `<p class="hero-also">Same day: ${same.map((x) => `${esc(SUBJ[x.s].name)} ${esc(x.title)} (${esc(x.session.toLowerCase())})`).join(', ')}</p>` : ''}
    ${stats}
    <button class="btn primary" data-act="log-today">Log today’s revision</button>`;
}

function syncBannerHTML() {
  if (PREVIEW) return `<div class="banner"><p><b>Preview.</b> This is the new version loaded with your backup from today. Try anything; changes here stay in this preview. The real website, with sync between your phone and iPad, comes next.</p></div>`;
  if (Sync.key) {
    if (Sync.status === 'error') return `<div class="banner"><p>${esc(Sync.message)}</p><button class="btn" data-act="go" data-tab="data">Open sync settings</button></div>`;
    return '';
  }
  if (!Sync.config()) return '';
  return `<div class="banner"><p>This device isn’t syncing yet. Open your private link here, or paste it on the Sync tab, to load your data.</p><button class="btn" data-act="go" data-tab="data">Set up sync</button></div>`;
}

function ringSVG(frac, size, stroke, label, color) {
  const r = (size - stroke) / 2, C = 2 * Math.PI * r;
  const f = clamp(frac, 0, 1);
  const len = f > 0 ? Math.max(f * C, stroke * 0.6) : 0;
  return `<svg class="ring" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="${esc(label)}">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-track" stroke-width="${stroke}" />
    ${len ? `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-fill" stroke-width="${stroke}" stroke-dasharray="${len} ${C}"${color ? ` style="stroke:${color}"` : ''} />` : ''}</svg>`;
}

function overallHTML() {
  const t = totals();
  const wk = weekStartOf(todayISO());
  const week = papersDoneBetween(wk, addDays(wk, 6));
  const logged = Object.values(state.lib).filter((r) => r.done).length;
  const scores = Object.values(state.lib).filter((r) => r.done && r.score != null).map((r) => r.score);
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  return `<section class="block overall">
    <h2 class="h">Overall</h2>
    <div class="overall-in">
      <div class="ring-wrap">${ringSVG(t.target ? t.done / t.target : 0, 108, 10, `${t.pct.toFixed(2)} percent of all targets done`)}
        <div class="ring-txt"><b>${t.pct.toFixed(2)}%</b><span>${t.done} of ${t.target}</span></div>
      </div>
      <dl class="pace">
        <div><dt>Done this week</dt><dd>${week}</dd></div>
        <div><dt>Papers logged</dt><dd>${logged}</dd></div>
        <div><dt>Average score</dt><dd>${avg != null ? `${avg}%` : '–'}</dd></div>
        <div><dt>Days to last exam</dt><dd>${Math.max(0, daysUntil(LAST_EXAM))}</dd></div>
      </dl>
    </div>
    <p class="fine">“A day needed” at the top spreads each paper’s remaining target over the days until that paper’s own exam. Percentages count only papers recorded in the Paper Library.</p>
  </section>`;
}

function subjectsHTML() {
  const rows = SUBJECTS.map((s) => {
    const st = subjStats(s.id);
    const pct = st.target ? (st.done / st.target) * 100 : 0;
    const open = ui.lib && ui.lib.s === s.id;
    const c = col(s.id);
    const per = st.per.map(({ p, t, d }) => `<span>P${p.n} <b>${d}</b>/${t}</span>`).join('');
    return `<div class="srow-wrap${open ? ' open' : ''}" id="subj-${s.id}">
      <button class="srow" data-act="lib-open" data-s="${s.id}" aria-expanded="${open}">
        <span class="sr-name">${swatch(s.id)}<b>${esc(s.name)}</b></span>
        <span class="sr-num"><b>${st.done}</b>/${st.target}</span>
        <span class="sr-pct">${pct.toFixed(1)}%</span>
        <span class="sr-bar" aria-hidden="true"><span style="width:${clamp(pct, 0, 100)}%;background:${c.bg}"></span></span>
        <span class="sr-per">${per}${st.avg != null ? `<span class="sr-avg">avg ${Math.round(st.avg)}%</span>` : ''}</span>
      </button>
      ${open ? libHTML(s.id) : ''}
    </div>`;
  }).join('');
  return `<section class="block"><h2 class="h">By subject <small>tap to open the paper-by-paper record</small></h2><div class="srows">${rows}</div></section>`;
}

function defaultLibPos(sId) {
  let best = null, bestT = -1;
  for (const [k, r] of Object.entries(state.lib)) {
    const p = parseKey(k);
    if (p.s !== sId || !r.done) continue;
    const t = r.markedAt || (r.date ? dayNum(r.date) * 86400000 : 1);
    if (t > bestT) { bestT = t; best = p; }
  }
  if (best) return { y: best.y, ser: best.ser };
  const ser = SERIES.find((x) => seriesOffered(sId, x.id));
  return { y: 2025, ser: ser ? ser.id : 'MJ' };
}

function yearsHTML(sId, sel, act, countFn, tsel) {
  return `<div class="years" role="group" aria-label="Year">${YEARS.map((y) => {
    const n = countFn(y);
    const off = tsel && !tsel.years.includes(y);
    return `<button type="button" class="yr${y === sel ? ' on' : ''}${off ? ' off' : ''}" data-act="${act}" data-y="${y}" aria-pressed="${y === sel}"${off ? ' title="Not in your target"' : ''}>${y}${n ? `<small>${n}</small>` : ''}</button>`;
  }).join('')}</div>`;
}

function seriesHTML(sId, sel, act, tsel) {
  return `<div class="series" role="group" aria-label="Series">${SERIES.map((x) => {
    const ok = seriesOffered(sId, x.id);
    const off = ok && tsel && !tsel.series.includes(x.id);
    return `<button type="button" class="ser${x.id === sel ? ' on' : ''}${off ? ' off' : ''}" data-act="${act}" data-ser="${x.id}" ${ok ? '' : 'disabled'} aria-pressed="${x.id === sel}">${x.name}</button>`;
  }).join('')}</div>`;
}

function tileHTML(key, opts = {}) {
  const k = parseKey(key);
  const r = state.lib[key];
  const done = r && r.done;
  const c = col(k.s, k.p);
  const recent = key === derived.recentKey;
  const style = done ? `background:${c.bg};color:${c.fg};border-color:${c.bg}` : `border-color:${c.bg}`;
  const sub = opts.sub || (done ? (r.score != null ? `${r.score}%` : 'Done') : '');
  const cls = ['tile', done ? 'done' : '', recent ? 'recent' : '', opts.sel ? 'sel' : '', ui.form && ui.form.key === key && ui.form.ctx === opts.ctx ? 'editing' : ''].filter(Boolean).join(' ');
  const label = `${compCode(k.s, k.p, k.v)} ${SERIES_BY_ID[k.ser].long} ${k.y}${done ? ', done' + (r.score != null ? `, ${r.score} percent` : '') : ''}${opts.sel ? ', selected' : ''}${recent ? ', most recent' : ''}`;
  return `<button type="button" class="${cls}" style="${style};--glow:${c.bg}" data-act="${opts.act || 'tile'}" data-key="${key}" aria-label="${esc(label)}">
    <span class="t-code">${opts.code || compTail(k.s, k.p, k.v)}</span><span class="t-sub">${esc(sub)}</span>${opts.sel ? '<span class="t-check" aria-hidden="true"></span>' : ''}</button>`;
}

function libHTML(sId) {
  const L = ui.lib;
  const s = SUBJ[sId];
  const st = subjStats(sId);
  const tsel = targetSel(sId);
  const countYear = (y) => Object.entries(state.lib).filter(([k, r]) => r.done && parseKey(k).s === sId && parseKey(k).y === y).length;
  const ser = SERIES_BY_ID[L.ser];
  const here = inTarget(tsel, L.y, L.ser);
  const blocks = s.papers.map((p) => {
    const vs = variants(sId, L.ser, p.id);
    if (!vs.length) return `<div class="pblock"><p class="pname">Paper ${p.n} <span>${esc(p.name)}</span></p><p class="na-note">Not set in ${ser.name}.</p></div>`;
    const keys = vs.map((v) => pkey(sId, p.id, L.y, L.ser, v));
    const formHere = ui.form && ui.form.ctx === 'lib' && keys.includes(ui.form.key);
    return `<div class="pblock"><p class="pname">Paper ${p.n} <span>${esc(p.name)}</span></p>
      <div class="tiles${here ? '' : ' off'}">${keys.map((k) => tileHTML(k, { ctx: 'lib' })).join('')}</div>
      ${formHere ? formHTML(ui.form.key) : ''}</div>`;
  }).join('');
  const outside = st.raw - st.done;
  const headline = tsel
    ? `<b>${st.done}</b> of ${st.target} in your target (${esc(selSummary(tsel))})${outside > 0 ? `, plus ${outside} outside it` : ''}`
    : `<b>${st.done}</b> of ${st.target} target`;
  return `<div class="lib" style="--sc:${col(sId).bg}">
    <div class="lib-head"><p>${headline}${st.avg != null ? `. Average ${Math.round(st.avg)}%, best ${st.best}%.` : '.'}</p>
      <button class="link" data-act="lib-close">Close</button></div>
    ${yearsHTML(sId, L.y, 'lib-year', countYear, tsel)}
    ${seriesHTML(sId, L.ser, 'lib-ser', tsel)}
    ${here ? '' : `<p class="na-note off-note">${ser.name} ${L.y} isn’t in your ${esc(s.name)} target. You can still record papers here; they just don’t count toward the percentage.</p>`}
    <div class="pblocks">${blocks}</div>
  </div>`;
}

function afterLibRender(root) {
  $$('.years', root).forEach((row) => {
    const yr = row.querySelector('.yr.on');
    if (yr) row.scrollLeft = yr.offsetLeft - row.clientWidth / 2 + yr.clientWidth / 2;
  });
  const f = root.querySelector('.mform input[name="obt"]');
  if (f && ui.form && ui.form.focus) { f.focus({ preventScroll: false }); ui.form.focus = false; }
}

function formHTML(key) {
  const k = parseKey(key);
  const r = state.lib[key];
  const tot = r && r.marksTotal != null ? r.marksTotal : (defaultTotal(k.sp) || '');
  const obt = r && r.marksObtained != null ? r.marksObtained : '';
  const linked = r ? !!r.date : true;
  const date = (r && r.date) || todayISO();
  const pct = obt !== '' && tot ? `${Math.round((obt / tot) * 100)}%` : (r && r.score != null && obt === '' ? `${r.score}%` : '');
  return `<form class="mform" data-form="paper" data-key="${key}" novalidate>
    <p class="mf-title"><b>${compCode(k.s, k.p, k.v)}</b> ${SERIES_BY_ID[k.ser].long} ${k.y}</p>
    <div class="mf-marks">
      <label class="fld"><span>Marks</span><input name="obt" inputmode="decimal" autocomplete="off" value="${obt}"></label>
      <label class="fld"><span>Out of</span><input name="tot" inputmode="decimal" autocomplete="off" value="${tot}"></label>
      <output class="mf-pct" aria-live="polite">${pct}</output>
    </div>
    <p class="mf-err" hidden></p>
    <div class="mf-date">
      <label class="chk"><input type="checkbox" name="link" ${linked ? 'checked' : ''}><span>Count toward a day</span></label>
      <input type="date" name="date" value="${date}" ${linked ? '' : 'disabled'} aria-label="Day to count it toward">
    </div>
    <p class="fine">Marks are optional. Untick the day for old papers you’re backfilling, so today’s numbers stay honest.</p>
    <div class="mf-act">
      <button class="btn primary" type="submit">${r ? 'Save' : 'Mark done'}</button>
      <button class="btn" type="button" data-act="form-cancel">Cancel</button>
      ${r ? `<button class="btn danger" type="button" data-act="paper-remove" data-key="${key}">Remove</button>` : ''}
    </div>
  </form>`;
}

function inTarget(sel, y, ser) {
  return !sel || (sel.years.includes(y) && sel.series.includes(ser));
}

function commonSel() {
  const counts = {};
  let best = null, bestN = 0;
  for (const sub of SUBJECTS) {
    const sel = targetSel(sub.id);
    if (!sel) continue;
    const key = JSON.stringify({ y: sel.years.slice().sort(), s: SERIES.map((x) => x.id).filter((id) => sel.series.includes(id)) });
    counts[key] = (counts[key] || 0) + 1;
    if (counts[key] > bestN) { bestN = counts[key]; best = sel; }
  }
  return best ? { sel: best, all: bestN === SUBJECTS.length } : null;
}

function overviewHTML() {
  const sels = Object.fromEntries(SUBJECTS.map((s) => [s.id, targetSel(s.id)]));
  const ySet = new Set();
  let anySel = false;
  for (const sel of Object.values(sels)) if (sel) { anySel = true; sel.years.forEach((y) => ySet.add(y)); }
  if (!anySel || Object.values(sels).some((x) => !x)) {
    // Subjects with hand-set numbers have no year range, so show every year they've touched too.
    let minY = 2020;
    for (const k of Object.keys(state.lib)) minY = Math.min(minY, parseKey(k).y);
    YEARS.filter((y) => y >= minY).forEach((y) => ySet.add(y));
  }
  const years = YEARS.filter((y) => ySet.has(y));
  const head1 = years.map((y) => `<th colspan="3" scope="colgroup">${y}</th>`).join('');
  const head2 = years.map(() => SERIES.map((x) => `<th scope="col" title="${x.long}">${SER_SHORT[x.id]}</th>`).join('')).join('');
  const body = SUBJECTS.map((s) => s.papers.map((p, pi) => {
    const c = col(s.id, p.id);
    const sel = sels[s.id];
    const cells = years.map((y) => SERIES.map((x) => {
      const vs = variants(s.id, x.id, p.id);
      if (!vs.length) return `<td class="na" title="Not offered"><span class="hatch" aria-label="Not offered"></span></td>`;
      if (!inTarget(sel, y, x.id)) return `<td class="off" title="Not in your target"><button class="ovc" data-act="ov" data-s="${s.id}" data-y="${y}" data-ser="${x.id}" aria-label="${esc(`${s.name} Paper ${p.n}, ${x.long} ${y}: not in your target`)}"><span class="offmark" aria-hidden="true"></span></button></td>`;
      const dots = vs.map((v) => {
        const k = pkey(s.id, p.id, y, x.id, v);
        const on = state.lib[k] && state.lib[k].done;
        return `<i class="dot${on ? ' on' : ''}${k === derived.recentKey ? ' recent' : ''}" style="${on ? `background:${c.bg};border-color:${c.bg}` : ''}"></i>`;
      }).join('');
      const nDone = vs.filter((v) => state.lib[pkey(s.id, p.id, y, x.id, v)]).length;
      return `<td><button class="ovc" data-act="ov" data-s="${s.id}" data-y="${y}" data-ser="${x.id}" aria-label="${esc(`${s.name} Paper ${p.n}, ${x.long} ${y}: ${nDone} of ${vs.length} done`)}">${dots}</button></td>`;
    }).join('')).join('');
    return `<tr class="${pi === 0 ? 'grp' : ''}"><th scope="row">${swatch(s.id, p.id)}${s.code} ${p.n}</th>${cells}</tr>`;
  }).join('')).join('');
  const cs = commonSel();
  const scope = cs && cs.all ? `Showing your target: ${selSummary(cs.sel)}.` : 'Showing the years in your targets.';
  return `<section class="block">
    <h2 class="h">Completion overview</h2>
    <p class="fine">${esc(scope)} One dot per variant, filled when done. Stripes mean Cambridge didn’t set that paper; a dash means it’s outside that subject’s target. Tap any cell to open it.</p>
    <div class="ov-wrap" tabindex="0" aria-label="Completion overview, scrolls sideways"><table class="ov"><thead><tr><th></th>${head1}</tr><tr><th></th>${head2}</tr></thead><tbody>${body}</tbody></table></div>
  </section>`;
}

function dayTotalsBySubj(date) {
  const e = state.entries[date] || {};
  const out = {};
  for (const [sp, c] of Object.entries(e)) {
    if (sp === '__rest' || !c) continue;
    const { s } = splitSp(sp);
    out[s] = (out[s] || 0) + (c.done || 0);
  }
  return out;
}

function stackedBars(items, maxV) {
  return items.map((it) => {
    const total = Object.values(it.by).reduce((a, b) => a + b, 0);
    const segs = SUBJECTS.filter((s) => it.by[s.id]).map((s) => `<span style="height:${(it.by[s.id] / maxV) * 100}%;background:${col(s.id).bg}" title="${esc(s.name)}: ${it.by[s.id]}"></span>`).join('');
    return `<div class="bar${it.cur ? ' cur' : ''}" role="img" aria-label="${esc(it.aria)}: ${total} done"><b>${total || ''}</b><div class="bar-col">${segs}</div><small>${esc(it.label)}</small></div>`;
  }).join('');
}

function activityHTML() {
  const mon = addDays(weekStartOf(todayISO()), ui.weekOff * 7);
  const days = [...Array(7)].map((_, i) => addDays(mon, i));
  const t = todayISO();
  const wItems = days.map((d) => ({ by: dayTotalsBySubj(d), label: dateObj(d).toLocaleDateString('en-GB', { weekday: 'narrow' }) + ' ' + dateObj(d).getDate(), aria: fmtDate(d, 'day'), cur: d === t }));
  const wMax = Math.max(1, ...wItems.map((i) => Object.values(i.by).reduce((a, b) => a + b, 0)));

  const months = [];
  let y = CAL_START.y, m = CAL_START.m;
  const now = new Date();
  const lastY = Math.min(CAL_END.y * 12 + CAL_END.m, now.getFullYear() * 12 + now.getMonth());
  while (y * 12 + m <= Math.max(lastY, CAL_START.y * 12 + CAL_START.m)) {
    const by = {};
    for (const [date] of Object.entries(state.entries)) {
      const [yy, mm] = date.split('-').map(Number);
      if (yy === y && mm - 1 === m) {
        const tb = dayTotalsBySubj(date);
        for (const [s, n] of Object.entries(tb)) by[s] = (by[s] || 0) + n;
      }
    }
    months.push({ by, label: MONTHS[m].slice(0, 3), aria: `${MONTHS[m]} ${y}`, cur: y === now.getFullYear() && m === now.getMonth() });
    m++; if (m > 11) { m = 0; y++; }
  }
  const mMax = Math.max(1, ...months.map((i) => Object.values(i.by).reduce((a, b) => a + b, 0)));
  const weekLabel = ui.weekOff === 0 ? 'This week' : ui.weekOff === -1 ? 'Last week' : `Week of ${fmtDate(mon, 'dm')}`;
  return `<section class="block">
    <h2 class="h">Calendar activity</h2>
    <p class="fine">Papers you marked as done on Calendar days.</p>
    <div class="chart-head"><h3>${weekLabel}</h3>
      <div class="seg"><button class="icon-btn" data-act="week" data-d="-1" aria-label="Previous week">‹</button><button class="icon-btn" data-act="week" data-d="1" aria-label="Next week" ${ui.weekOff >= 0 ? 'disabled' : ''}>›</button></div></div>
    <div class="bars bars-week">${stackedBars(wItems, wMax)}</div>
    <div class="chart-head"><h3>By month</h3></div>
    <div class="bars bars-month">${stackedBars(months, mMax)}</div>
  </section>`;
}

function examsHTML() {
  const list = nextExams();
  if (!list.length) return '';
  const rows = list.map((x, i) => {
    const d = daysUntil(x.date);
    const dd = dateObj(x.date);
    return `<li class="${i === 0 ? 'next' : ''}" style="--sc:${col(x.s, x.p).bg}">
      <span class="ex-date"><b>${dd.getDate()}</b>${dd.toLocaleDateString('en-GB', { month: 'short' })}</span>
      <span class="ex-main"><b>${esc(SUBJ[x.s].name)}</b> ${esc(x.title)}<small>${esc(x.code)}, ${esc(x.session.toLowerCase())}</small></span>
      <span class="ex-left">${d === 0 ? '<b>Today</b>' : `<b>${d}</b>${d === 1 ? 'day' : 'days'}`}</span></li>`;
  }).join('');
  return `<section class="block"><h2 class="h">Exam countdown</h2><ol class="exams">${rows}</ol>
    <p class="fine">Tamil isn’t on this timetable, so it has no countdown here. Check practical routes and English titles on your Statement of Entry.</p></section>`;
}

/* ── Calendar ── */

function calMonth() {
  if (ui.cal.y == null) {
    const n = new Date();
    let y = n.getFullYear(), m = n.getMonth();
    if (y * 12 + m < CAL_START.y * 12 + CAL_START.m) { y = CAL_START.y; m = CAL_START.m; }
    if (y * 12 + m > CAL_END.y * 12 + CAL_END.m) { y = CAL_END.y; m = CAL_END.m; }
    ui.cal.y = y; ui.cal.m = m;
  }
  return { y: ui.cal.y, m: ui.cal.m };
}

function armedLabel() {
  const a = ui.cal.armed;
  if (!a) return '';
  if (a.kind === 'rest') return 'rest days';
  if (a.kind === 'all') return `all ${SUBJ[a.s].name} papers`;
  return spLabel(a.sp);
}

function renderCalendar() {
  const el = $('#v-calendar');
  const { y, m } = calMonth();
  const C = ui.cal;
  const subjChips = SUBJECTS.map((s) => {
    const c = col(s.id);
    const on = C.pick === s.id;
    return `<button class="chip${on ? ' on' : ''}" data-act="cal-pick" data-s="${s.id}" style="--cb:${c.bg};--cf:${c.fg}" aria-pressed="${on}" aria-label="${esc(s.name)}">${s.code}</button>`;
  }).join('') + `<button class="chip chip-rest${C.armed && C.armed.kind === 'rest' ? ' armed' : ''}" data-act="cal-arm-rest" aria-pressed="${!!(C.armed && C.armed.kind === 'rest')}">Rest</button>`;
  let paperChips = '';
  if (C.pick) {
    const s = SUBJ[C.pick];
    paperChips = `<div class="chips chips-paper">${s.papers.map((p) => {
      const sp = `${s.id}_${p.id}`;
      const c = col(s.id, p.id);
      const armed = C.armed && C.armed.kind === 'paper' && C.armed.sp === sp;
      return `<button class="chip pchip${armed ? ' armed' : ''}" draggable="true" data-act="cal-arm" data-sp="${sp}" style="--cb:${c.bg};--cf:${c.fg}" aria-pressed="${armed}">${s.code}${p.n}<small>${esc(p.name)}</small></button>`;
    }).join('')}<button class="chip pchip pchip-all${C.armed && C.armed.kind === 'all' && C.armed.s === s.id ? ' armed' : ''}" data-act="cal-arm-all" data-s="${s.id}" style="--cb:${col(s.id).bg};--cf:${col(s.id).fg}">All ${esc(s.name)}</button></div>`;
  }
  const hint = C.armed
    ? `Tap or drag across days to add or remove ${esc(armedLabel())}. <button class="link" data-act="cal-disarm">Stop</button>`
    : (C.pick ? 'Choose a paper, then tap days to plan it.' : 'Pick a subject to plan papers onto days, or tap a day to log what you did.');

  const first = new Date(y, m, 1);
  const lead = first.getDay();
  const nDays = new Date(y, m + 1, 0).getDate();
  let cells = '';
  for (let i = 0; i < lead; i++) cells += '<div class="day blank" aria-hidden="true"></div>';
  for (let d = 1; d <= nDays; d++) cells += dayCellHTML(`${y}-${pad(m + 1)}-${pad(d)}`);
  const canPrev = y * 12 + m > CAL_START.y * 12 + CAL_START.m;
  const canNext = y * 12 + m < CAL_END.y * 12 + CAL_END.m;
  const monthSum = monthSummary(y, m);
  el.innerHTML = `
    <div class="picker">
      <div class="chips">${subjChips}</div>
      ${paperChips}
      <p class="hint">${hint}</p>
    </div>
    <div class="cal-nav">
      <button class="icon-btn" data-act="cal-month" data-d="-1" ${canPrev ? '' : 'disabled'} aria-label="Previous month">‹</button>
      <h2>${MONTHS[m]} ${y}</h2>
      <button class="icon-btn" data-act="cal-month" data-d="1" ${canNext ? '' : 'disabled'} aria-label="Next month">›</button>
      <button class="btn small" data-act="cal-today">Today</button>
    </div>
    <div class="cal-grid${C.armed ? ' armed' : ''}" id="calGrid">
      ${['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => `<div class="dow" aria-hidden="true">${d}</div>`).join('')}
      ${cells}
    </div>
    <p class="cal-sum">${monthSum}</p>
    <div class="cal-legend"><span><i class="lg-today"></i>Today</span><span><i class="lg-exam"></i>Exam day</span><span><i class="lg-rest"></i>Rest day</span></div>`;
}

function monthSummary(y, m) {
  let planned = 0, done = 0, days = 0, rest = 0;
  for (const [date, e] of Object.entries(state.entries)) {
    const [yy, mm] = date.split('-').map(Number);
    if (yy !== y || mm - 1 !== m) continue;
    if (e.__rest) rest++;
    let any = false;
    for (const [sp, c] of Object.entries(e)) {
      if (sp === '__rest' || !c) continue;
      planned += c.planned || 0; done += c.done || 0; any = true;
    }
    if (any) days++;
  }
  if (!days && !rest) return 'Nothing planned this month yet.';
  return `${MONTHS[m]}: ${plural(done, 'paper')} done of ${planned} planned, across ${plural(days, 'day')}${rest ? `, ${plural(rest, 'rest day')}` : ''}.`;
}

function dayCellHTML(date) {
  const e = state.entries[date] || {};
  const sps = Object.keys(e).filter((k) => k !== '__rest' && e[k]).sort((a, b) => ALL_SP.indexOf(a) - ALL_SP.indexOf(b));
  let planned = 0, done = 0;
  for (const sp of sps) { planned += e[sp].planned || 0; done += e[sp].done || 0; }
  const exams = EXAMS_BY_DATE[date] || [];
  const t = todayISO();
  const cls = ['day', date === t ? 'today' : '', exams.length ? 'exam' : '', e.__rest ? 'rest' : '', date < t ? 'past' : ''].filter(Boolean).join(' ');
  const shown = sps.slice(0, 4);
  const tags = shown.map((sp) => { const { s, p } = splitSp(sp); const c = col(s, p); return `<i style="background:${c.bg};color:${c.fg}">${spTag(sp)}</i>`; }).join('') + (sps.length > 4 ? `<i class="more">+${sps.length - 4}</i>` : '');
  const xtags = exams.map((x) => `<i class="xtag" style="--sc:${col(x.s, x.p).bg}">${SUBJ[x.s].code}${paperOf(x.s, x.p).n}</i>`).join('');
  const frac = planned ? `${done}/${planned}` : (done ? `${done} done` : '');
  const d = dateObj(date);
  const aria = `${fmtDate(date, 'day')}${exams.length ? ', exam: ' + exams.map((x) => `${SUBJ[x.s].name} ${x.title}`).join(' and ') : ''}${e.__rest ? ', rest day' : ''}${sps.length ? `, ${sps.map(spLabel).join(', ')}` : ''}${frac ? `, ${done} done of ${planned} planned` : ''}`;
  return `<button class="${cls}" data-day="${date}" data-act="day" aria-label="${esc(aria)}">
    <span class="dnum">${d.getDate()}</span>
    ${xtags ? `<span class="dx">${xtags}</span>` : ''}
    ${e.__rest ? '<span class="drest">Rest</span>' : `<span class="dtags">${tags}</span>`}
    ${frac ? `<span class="dfrac">${frac}</span>` : ''}
  </button>`;
}

/* Arming: apply the armed chip to a day. Returns 'add' or 'remove' for the first cell so a drag keeps one direction. */
function armedSps() {
  const a = ui.cal.armed;
  if (!a) return [];
  if (a.kind === 'paper') return [a.sp];
  if (a.kind === 'all') return SUBJ[a.s].papers.map((p) => `${a.s}_${p.id}`);
  return [];
}

function armedModeFor(date) {
  const a = ui.cal.armed;
  const e = state.entries[date] || {};
  if (a.kind === 'rest') return e.__rest ? 'remove' : 'add';
  const sps = armedSps();
  return sps.every((sp) => e[sp]) ? 'remove' : 'add';
}

const dragNotes = { kept: 0, restBlocked: 0 };
function applyArmed(date, mode) {
  const a = ui.cal.armed;
  const e = state.entries[date] || {};
  if (a.kind === 'rest') {
    if (mode === 'add') {
      const logged = Object.entries(e).some(([sp, c]) => sp !== '__rest' && c && ((c.done || 0) > 0 || (c.planned || 0) > 0));
      if (logged) { dragNotes.restBlocked++; return; }
      for (const sp of Object.keys(e)) if (sp !== '__rest') setRec(`e/${date}/${sp}`, null);
      setRec(`e/${date}/__rest`, true);
    } else setRec(`e/${date}/__rest`, null);
    return;
  }
  for (const sp of armedSps()) {
    const c = e[sp];
    if (mode === 'add' && !c) {
      setRec(`e/${date}/${sp}`, { planned: 0, done: 0 });
      if (e.__rest) setRec(`e/${date}/__rest`, null);
    } else if (mode === 'remove' && c) {
      if ((c.done || 0) > 0 || (c.planned || 0) > 0) { dragNotes.kept++; continue; }
      setRec(`e/${date}/${sp}`, null);
    }
  }
}

function refreshDayCell(date) {
  const cell = document.querySelector(`#calGrid [data-day="${date}"]`);
  if (!cell) return;
  const tmp = document.createElement('div');
  tmp.innerHTML = dayCellHTML(date).trim();
  const n = tmp.firstChild;
  n.classList.add('pulse');
  cell.replaceWith(n);
}

function finishDrag() {
  if (dragNotes.kept) toast(`Kept ${plural(dragNotes.kept, 'paper')} that already had numbers logged. Open the day to remove ${dragNotes.kept === 1 ? 'it' : 'them'}.`);
  else if (dragNotes.restBlocked) toast(`Skipped ${plural(dragNotes.restBlocked, 'day')} with papers logged. A rest day can’t have planned papers.`);
  dragNotes.kept = 0; dragNotes.restBlocked = 0;
  commit({ noRender: true });
  renderCalendar();
}

/* ── Day sheet ── */

function openDay(date, opts = {}) {
  const e = state.entries[date] || {};
  const rows = Object.keys(e).filter((k) => k !== '__rest' && e[k]).sort((a, b) => ALL_SP.indexOf(a) - ALL_SP.indexOf(b))
    .map((sp) => ({ sp, planned: e[sp].planned || 0, done: e[sp].done || 0 }));
  ui.sheet = { kind: 'day', date, rows, rest: !!e.__rest, adding: opts.adding || !rows.length, before: rows.reduce((a, r) => a + r.done, 0) };
  renderSheet();
}

const WHEEL_H = 30, WHEEL_MAX = 40;
function wheelHTML(val, field, i, label) {
  let items = '';
  for (let n = 0; n <= WHEEL_MAX; n++) items += `<div class="wi${n === val ? ' sel' : ''}" data-n="${n}">${n}</div>`;
  return `<div class="wheel-wrap"><div class="wheel" data-field="${field}" data-i="${i}" data-val="${val}" tabindex="0" role="spinbutton" aria-valuemin="0" aria-valuemax="${WHEEL_MAX}" aria-valuenow="${val}" aria-label="${esc(label)}">${items}</div></div>`;
}

function readWheels() {
  if (!ui.sheet || ui.sheet.kind !== 'day') return;
  $$('#sheetRoot .wheel').forEach((w) => {
    const i = Number(w.dataset.i), f = w.dataset.field;
    if (ui.sheet.rows[i]) ui.sheet.rows[i][f] = Number(w.dataset.val);
  });
}

function setupWheels(root) {
  $$('.wheel', root).forEach((w) => {
    const v = Number(w.dataset.val);
    w.scrollTop = v * WHEEL_H;
    let raf = 0;
    w.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const n = clamp(Math.round(w.scrollTop / WHEEL_H), 0, WHEEL_MAX);
        if (String(n) !== w.dataset.val) {
          w.dataset.val = n;
          w.setAttribute('aria-valuenow', n);
          $$('.wi.sel', w).forEach((x) => x.classList.remove('sel'));
          const it = w.children[n]; if (it) it.classList.add('sel');
        }
      });
    }, { passive: true });
    w.addEventListener('keydown', (ev) => {
      if (ev.key !== 'ArrowUp' && ev.key !== 'ArrowDown') return;
      ev.preventDefault();
      const n = clamp(Number(w.dataset.val) + (ev.key === 'ArrowUp' ? 1 : -1), 0, WHEEL_MAX);
      w.scrollTo({ top: n * WHEEL_H, behavior: 'smooth' });
    });
    w.addEventListener('click', (ev) => {
      const it = ev.target.closest('.wi');
      if (it) w.scrollTo({ top: Number(it.dataset.n) * WHEEL_H, behavior: 'smooth' });
    });
  });
}

function renderSheet() {
  const root = $('#sheetRoot');
  const S = ui.sheet;
  if (!S) { root.innerHTML = ''; document.body.classList.remove('sheet-open'); return; }
  document.body.classList.add('sheet-open');
  let inner = '';
  if (S.kind === 'day') inner = daySheetHTML(S);
  else if (S.kind === 'import') inner = importSheetHTML(S);
  else if (S.kind === 'qzsheet') inner = qzSheetModalHTML();
  root.innerHTML = `<div class="sheet-bg" data-act="sheet-bg"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheetTitle">${inner}</div></div>`;
  setupWheels(root);
  const first = root.querySelector('.sheet [autofocus]') || root.querySelector('.sheet h2');
  if (first) { first.setAttribute('tabindex', '-1'); first.focus({ preventScroll: true }); }
}

function closeSheet() { ui.sheet = null; renderSheet(); }

function daySheetHTML(S) {
  const exams = EXAMS_BY_DATE[S.date] || [];
  const examHTML = exams.map((x) => `<p class="sheet-exam" style="--sc:${col(x.s, x.p).bg}">Exam: <b>${esc(SUBJ[x.s].name)}</b> ${esc(x.title)}, ${esc(x.code)}, ${esc(x.session.toLowerCase())}</p>`).join('');
  const rows = S.rows.map((r, i) => {
    const { s, p } = splitSp(r.sp);
    return `<div class="dayrow">
      <p class="dr-name">${swatch(s, p)}<b>${esc(SUBJ[s].name)}</b> Paper ${paperOf(s, p).n}</p>
      <div class="dr-wheels">
        <div class="wl"><span>Planned</span>${wheelHTML(r.planned, 'planned', i, `${spLabel(r.sp)} planned`)}</div>
        <div class="wl"><span>Done</span>${wheelHTML(r.done, 'done', i, `${spLabel(r.sp)} done`)}</div>
      </div>
      <button class="icon-btn" data-act="dayrow-del" data-i="${i}" aria-label="Remove ${esc(spLabel(r.sp))}">×</button>
    </div>`;
  }).join('');
  const have = new Set(S.rows.map((r) => r.sp));
  const chooser = S.adding ? `<div class="chooser">${SUBJECTS.map((s) => `<div class="ch-row"><span class="ch-s">${swatch(s.id)}${esc(s.name)}</span><span class="ch-ps">${s.papers.map((p) => {
    const sp = `${s.id}_${p.id}`;
    const c = col(s.id, p.id);
    return `<button class="chip pchip" data-act="dayrow-add-sp" data-sp="${sp}" ${have.has(sp) ? 'disabled' : ''} style="--cb:${c.bg};--cf:${c.fg}">${s.code}${p.n}</button>`;
  }).join('')}</span></div>`).join('')}</div>` : '';
  const logged = Object.entries(state.lib).filter(([, r]) => r.done && r.date === S.date)
    .sort((a, b) => ALL_SP.indexOf(parseKey(a[0]).sp) - ALL_SP.indexOf(parseKey(b[0]).sp));
  const loggedHTML = logged.length ? `<div class="sheet-logged"><h3>In the Paper Library for this day</h3><ul>${logged.map(([k, r]) => {
    const p = parseKey(k);
    return `<li>${swatch(p.s, p.p)}<b>${compCode(p.s, p.p, p.v)}</b> ${SER_SHORT[p.ser]} ${p.y}${r.score != null ? `<span>${r.score}%</span>` : ''}</li>`;
  }).join('')}</ul></div>` : '';
  return `<div class="sheet-h"><h2 id="sheetTitle">${fmtDate(S.date, 'day')}</h2><button class="icon-btn" data-act="sheet-close" aria-label="Close">×</button></div>
    ${examHTML}
    ${S.rest ? '<p class="sheet-rest">Rest day. Nothing planned.</p>' : `<div class="dayrows">${rows || '<p class="fine">No papers on this day yet. Add the ones you planned or did.</p>'}</div>
    <button class="btn" data-act="dayrow-toggle-add" aria-expanded="${S.adding}">${S.adding ? 'Hide paper list' : 'Add a paper'}</button>${chooser}`}
    <label class="chk sheet-restchk"><input type="checkbox" data-act="day-rest" ${S.rest ? 'checked' : ''}><span>Rest day</span></label>
    ${S.rest && S.rows.length ? '<p class="fine warn">Saving as a rest day removes the papers on this day.</p>' : ''}
    ${loggedHTML}
    <div class="sheet-f"><button class="btn primary" data-act="day-save">Save</button><button class="btn" data-act="sheet-close">Cancel</button></div>`;
}

function saveDay() {
  readWheels();
  const S = ui.sheet;
  const e = state.entries[S.date] || {};
  const prevRows = Object.fromEntries(Object.entries(e).filter(([k]) => k !== '__rest').map(([k, c]) => [k, c.done || 0]));
  const keep = new Set();
  if (S.rest) {
    for (const sp of Object.keys(e)) if (sp !== '__rest') setRec(`e/${S.date}/${sp}`, null);
    setRec(`e/${S.date}/__rest`, true);
  } else {
    for (const r of S.rows) {
      keep.add(r.sp);
      const old = e[r.sp];
      const same = old && old.planned === r.planned && old.done === r.done;
      setRec(`e/${S.date}/${r.sp}`, same ? old : { planned: r.planned, done: r.done });
    }
    for (const sp of Object.keys(e)) if (sp !== '__rest' && !keep.has(sp)) setRec(`e/${S.date}/${sp}`, null);
    setRec(`e/${S.date}/__rest`, null);
  }
  const after = S.rest ? 0 : S.rows.reduce((a, r) => a + r.done, 0);
  const grew = S.rest ? null : S.rows.find((r) => r.done > (prevRows[r.sp] || 0));
  closeSheet();
  commit();
  if (after > S.before && grew) {
    const { s } = splitSp(grew.sp);
    toast('Saved. Record which exact papers they were so your percentages count them.', {
      action: 'Open Paper Library',
      onAction: () => openLib(s, { scroll: true }),
      ms: 7000,
    });
  } else toast('Saved.');
}

/* ── Goals ── */

function sortedGoals() {
  return Object.values(state.goals).sort((a, b) => {
    const ka = goalSortKey(a), kb = goalSortKey(b);
    return ka[0] - kb[0] || (ka[0] ? kb[1].localeCompare(ka[1]) : ka[1].localeCompare(kb[1]));
  });
}

function goalState(g) {
  const pr = goalProgress(g);
  const complete = pr.total > 0 && pr.done >= pr.total;
  const d = g.deadline ? daysUntil(g.deadline) : null;
  const rate = d != null && d >= 0 ? pr.left / (d + 1) : null;
  const overdue = !complete && d != null && d < 0;
  const risk = !complete && !overdue && rate != null && rate > 1.5;
  const firstKey = (g.paperKeys || [])[0];
  const ringCol = firstKey ? col(parseKey(firstKey).s).bg : null;
  return { pr, complete, d, rate, overdue, risk, ringCol };
}

function goalHeadHTML(g, act, expanded) {
  const st = goalState(g);
  return `<button class="goal-h" data-act="${act}" data-id="${g.id}"${expanded != null ? ` aria-expanded="${expanded}"` : ''}>
      <span class="goal-ring">${ringSVG(st.pr.total ? st.pr.done / st.pr.total : 0, 52, 6, `${st.pr.done} of ${st.pr.total} done`, st.complete ? null : st.ringCol)}<b>${st.pr.done}<small>/${st.pr.total}</small></b></span>
      <span class="goal-t"><b>${esc(g.title)}</b><span>${esc(dueText(g, st.pr))}</span></span>
      ${st.risk ? `<span class="flag">Needs ${fmtNum(st.rate, 1)} a day</span>` : ''}${st.overdue ? '<span class="flag">Overdue</span>' : ''}
    </button>`;
}

function goalsStatsHTML() {
  const list = sortedGoals();
  if (!list.length) return '';
  const active = list.filter((g) => !goalState(g).complete);
  const doneCount = list.length - active.length;
  const shown = active.slice(0, 4);
  const body = shown.length
    ? `<div class="goals goals-mini">${shown.map((g) => `<article class="goal${goalState(g).risk ? ' risk' : ''}${goalState(g).overdue ? ' overdue' : ''}">${goalHeadHTML(g, 'goal-open')}</article>`).join('')}</div>`
    : '<p class="fine">Every goal is done. Set a new one on the Goals tab.</p>';
  const more = active.length > shown.length ? `${active.length - shown.length} more active` : '';
  const foot = [more, doneCount ? `${doneCount} done` : ''].filter(Boolean).join(', ');
  return `<section class="block">
    <div class="block-h"><h2 class="h">Your goals</h2><button class="link" data-act="go" data-tab="goals">All goals</button></div>
    ${body}
    ${foot ? `<p class="fine goals-foot">${esc(foot)}.</p>` : ''}
  </section>`;
}

function goalSortKey(g) {
  const pr = goalProgress(g);
  return [pr.total && pr.done >= pr.total ? 1 : 0, g.deadline || '9999'];
}

function renderGoals() {
  const el = $('#v-goals');
  const list = sortedGoals();
  const D = ui.goals.draft;
  el.innerHTML = `
    <div class="view-head"><h2 class="h">Goals</h2>${D ? '' : '<button class="btn primary" data-act="goal-new">New goal</button>'}</div>
    <p class="fine">A goal is a short list of exact papers with a deadline, like “these eight Physics papers by Sunday”. Marking a paper done anywhere counts toward every goal that includes it.</p>
    ${D ? goalEditorHTML(D) : ''}
    ${list.length ? `<div class="goals">${list.map(goalCardHTML).join('')}</div>` : (D ? '' : `<div class="empty"><p>No goals yet. Pick the papers you want finished by a date, and the app will warn you if the pace gets tight.</p><button class="btn primary" data-act="goal-new">New goal</button></div>`)}`;
  afterLibRender(el);
  const t = el.querySelector('.geditor input[name="title"]');
  if (t && D && D.focusTitle) { t.focus(); D.focusTitle = false; }
}

function goalEditorHTML(D) {
  const s = SUBJ[D.s];
  const sel = new Set(D.keys);
  const ser = SERIES_BY_ID[D.ser];
  const countYear = (y) => D.keys.filter((k) => { const p = parseKey(k); return p.s === D.s && p.y === y; }).length;
  const blocks = s.papers.map((p) => {
    const vs = variants(D.s, D.ser, p.id);
    if (!vs.length) return `<div class="pblock"><p class="pname">Paper ${p.n} <span>${esc(p.name)}</span></p><p class="na-note">Not set in ${ser.name}.</p></div>`;
    return `<div class="pblock"><p class="pname">Paper ${p.n} <span>${esc(p.name)}</span></p><div class="tiles">${vs.map((v) => {
      const k = pkey(D.s, p.id, D.y, D.ser, v);
      return tileHTML(k, { act: 'gd-tile', sel: sel.has(k), ctx: 'draft' });
    }).join('')}</div></div>`;
  }).join('');
  const doneN = D.keys.filter((k) => state.lib[k] && state.lib[k].done).length;
  const bySubj = {};
  for (const k of D.keys) { const p = parseKey(k); bySubj[p.s] = (bySubj[p.s] || 0) + 1; }
  const summary = Object.entries(bySubj).map(([sid, n]) => `<button class="sumchip" data-act="gd-subj" data-s="${sid}" style="--sc:${col(sid).bg}">${esc(SUBJ[sid].name)} <b>${n}</b></button>`).join('');
  return `<form class="geditor" data-form="goal" novalidate>
    <h3>${D.id ? 'Edit goal' : 'New goal'}</h3>
    <div class="ge-fields">
      <label class="fld grow"><span>Name</span><input name="title" value="${esc(D.title)}" placeholder="Physics Paper 4 sprint" autocomplete="off" maxlength="80"></label>
      <label class="fld"><span>Deadline</span><input type="date" name="deadline" value="${esc(D.deadline)}"></label>
    </div>
    <p class="ge-step">Choose papers</p>
    <div class="chips">${SUBJECTS.map((x) => { const c = col(x.id); return `<button type="button" class="chip${x.id === D.s ? ' on' : ''}" data-act="gd-subj" data-s="${x.id}" style="--cb:${c.bg};--cf:${c.fg}" aria-pressed="${x.id === D.s}" aria-label="${esc(x.name)}">${x.code}</button>`; }).join('')}</div>
    <div class="lib" style="--sc:${col(D.s).bg}">
      ${yearsHTML(D.s, D.y, 'gd-year', countYear)}
      ${seriesHTML(D.s, D.ser, 'gd-ser')}
      <div class="pblocks">${blocks}</div>
      <button type="button" class="link" data-act="gd-all">Select every ${esc(s.name)} paper in ${ser.name} ${D.y}</button>
    </div>
    <p class="ge-count" aria-live="polite"><b>${plural(D.keys.length, 'paper')}</b> selected${doneN ? `, ${doneN} already done` : ''}.</p>
    ${summary ? `<div class="sums">${summary}</div>` : ''}
    <p class="mf-err" hidden></p>
    <div class="mf-act"><button class="btn primary" type="submit">${D.id ? 'Save goal' : 'Create goal'}</button><button class="btn" type="button" data-act="gd-cancel">Cancel</button></div>
  </form>`;
}

function dueText(g, pr) {
  if (pr.total && pr.done >= pr.total) return `Done, all ${plural(pr.total, 'paper')}`;
  if (!g.deadline) return `${pr.left} left`;
  const d = daysUntil(g.deadline);
  if (d < 0) return `Overdue by ${plural(-d, 'day')}, ${pr.left} left`;
  if (d === 0) return `Due today, ${pr.left} left`;
  if (d === 1) return `Due tomorrow, ${pr.left} left`;
  return `Due ${fmtDate(g.deadline)}, ${plural(d, 'day')} left`;
}

function goalCardHTML(g) {
  const st = goalState(g);
  const open = ui.goals.open === g.id;
  const keys = (g.paperKeys || []).slice().sort((a, b) => {
    const A = parseKey(a), B = parseKey(b);
    return ALL_SP.indexOf(A.sp) - ALL_SP.indexOf(B.sp) || B.y - A.y || ['ON', 'MJ', 'FM'].indexOf(A.ser) - ['ON', 'MJ', 'FM'].indexOf(B.ser) || A.v - B.v;
  });
  let body = '';
  if (open) {
    const groups = {};
    for (const k of keys) { const p = parseKey(k); (groups[p.sp] = groups[p.sp] || []).push(k); }
    body = `<div class="goal-body">${Object.entries(groups).map(([sp, ks]) => {
      const { s: sid, p: pid } = splitSp(sp);
      const formKey = ui.form && ui.form.ctx === `goal:${g.id}` && ks.includes(ui.form.key) ? ui.form.key : null;
      return `<div class="gb-subj"><p class="pname">${swatch(sid, pid)}${esc(SUBJ[sid].name)} Paper ${paperOf(sid, pid).n}</p><div class="tiles tiles-wide">${ks.map((k) => {
        const p = parseKey(k);
        return tileHTML(k, { act: 'goal-tile', ctx: `goal:${g.id}`, code: compCode(p.s, p.p, p.v).replace(/^\d{4}\//, ''), sub: `${SER_SHORT[p.ser]} ${String(p.y).slice(2)}${state.lib[k] && state.lib[k].score != null ? `, ${state.lib[k].score}%` : ''}` });
      }).join('')}</div>${formKey ? formHTML(formKey) : ''}</div>`;
    }).join('')}
      <div class="mf-act"><button class="btn" data-act="goal-edit" data-id="${g.id}">Edit</button><button class="btn danger" data-act="goal-del" data-id="${g.id}">Delete</button></div></div>`;
  }
  return `<article class="goal${st.complete ? ' complete' : ''}${st.risk ? ' risk' : ''}${st.overdue ? ' overdue' : ''}${open ? ' open' : ''}" id="goal-${g.id}">
    ${goalHeadHTML(g, 'goal-toggle', open)}${body}</article>`;
}

function newDraft(g) {
  if (g) {
    const first = g.paperKeys && g.paperKeys[0] ? parseKey(g.paperKeys[0]) : null;
    const s = first ? first.s : 'phys';
    const pos = first ? { y: first.y, ser: first.ser } : defaultLibPos(s);
    return { id: g.id, title: g.title, deadline: g.deadline, keys: [...(g.paperKeys || [])], s, y: pos.y, ser: pos.ser, createdAt: g.createdAt };
  }
  const s = 'phys';
  const pos = defaultLibPos(s);
  return { id: null, title: '', deadline: addDays(todayISO(), 7), keys: [], s, y: pos.y, ser: pos.ser, focusTitle: true };
}

/* ── Targets ── */

function targetLine(sId, vals) {
  let left = 0;
  for (const p of SUBJ[sId].papers) {
    const sp = `${sId}_${p.id}`;
    left += Math.max(0, (vals && vals[sp] != null ? vals[sp] : targetOf(sp)) - doneOf(sp));
  }
  const last = SUBJ[sId].papers.map((p) => deadlineOf(`${sId}_${p.id}`)).sort().pop();
  const days = daysUntil(last);
  if (!left) return 'Every target here is met.';
  if (days <= 0) return `${left} left.`;
  const hasExam = SUBJ[sId].papers.some((p) => EXAM_BY_SP[`${sId}_${p.id}`]);
  return `${left} left, about ${fmtNum(left / (days / 7), 1)} a week until ${hasExam ? `the last ${SUBJ[sId].name} exam` : 'the exams end'}.`;
}

function availableCount(sp) {
  const { s: sId, p } = splitSp(sp);
  return countIn(sId, p, DEFAULT_SEL);
}

function yearPickHTML(years, act, sId) {
  return `<div class="ypick" role="group" aria-label="Years">${YEARS.map((y) => {
    const on = years.includes(y);
    return `<button type="button" class="ychip${on ? ' on' : ''}" data-act="${act}" data-y="${y}"${sId ? ` data-s="${sId}"` : ''} aria-pressed="${on}">${y}</button>`;
  }).join('')}</div>`;
}

function seriesPickHTML(series, act, sId) {
  return `<div class="spick" role="group" aria-label="Series">${SERIES.map((x) => {
    const offered = !sId || seriesOffered(sId, x.id);
    const on = series.includes(x.id) && offered;
    return `<button type="button" class="ychip${on ? ' on' : ''}" data-act="${act}" data-ser="${x.id}"${sId ? ` data-s="${sId}"` : ''} aria-pressed="${on}" ${offered ? '' : 'disabled'}>${x.name}</button>`;
  }).join('')}</div>`;
}

function presetsHTML(act, sId) {
  const ds = sId ? ` data-s="${sId}"` : '';
  return `<div class="presets"><button type="button" class="link" data-act="${act}" data-p="2020"${ds}>2020–2026</button><button type="button" class="link" data-act="${act}" data-p="last3"${ds}>Last 3 years</button><button type="button" class="link" data-act="${act}" data-p="all"${ds}>Every year</button><button type="button" class="link" data-act="${act}" data-p="none"${ds}>Clear</button></div>`;
}

function presetYears(p) {
  if (p === '2020') return TARGET_YEARS.slice();
  if (p === 'last3') return [2026, 2025, 2024];
  if (p === 'all') return YEARS.slice();
  return [];
}

function renderTargets() {
  const el = $('#v-targets');
  if (!ui.tglobal) {
    const cs = commonSel();
    const base = cs ? cs.sel : DEFAULT_SEL;
    ui.tglobal = { years: base.years.slice(), series: base.series.slice() };
  }
  const G = ui.tglobal;
  const gTotal = SUBJECTS.reduce((a, s) => a + s.papers.reduce((b, p) => b + countIn(s.id, p.id, G), 0), 0);
  const nowTotal = ALL_SP.reduce((a, sp) => a + targetOf(sp), 0);
  const cs = commonSel();
  el.innerHTML = `
    <div class="view-head"><h2 class="h">Targets</h2></div>
    <p class="fine">Pick the years and series you want to cover. Each target is every paper Cambridge actually set in them, so ICT practicals and Tamil come out smaller on their own. Every percentage in the app is measured against these.</p>
    <section class="block tglobal">
      <h3 class="h">Set every subject at once</h3>
      <p class="tlabel">Years</p>${yearPickHTML(G.years, 'tg-year')}${presetsHTML('tg-preset')}
      <p class="tlabel">Series</p>${seriesPickHTML(G.series, 'tg-ser')}
      <div class="tg-apply"><button class="btn primary" data-act="tg-apply">Apply to all subjects</button><span>${gTotal} papers with this choice</span></div>
      <p class="fine tg-now">Your targets now: <b>${nowTotal} papers</b>${cs && cs.all ? `, ${esc(selSummary(cs.sel))} for every subject` : ', set per subject below'}.</p>
    </section>
    ${SUBJECTS.map((s) => targetSubjectHTML(s)).join('')}`;
}

function targetSubjectHTML(s) {
  const sel = targetSel(s.id);
  const total = s.papers.reduce((a, p) => a + targetOf(`${s.id}_${p.id}`), 0);
  const head = `<div class="tsub-h"><h3>${swatch(s.id)}${esc(s.name)}</h3><span><b>${total}</b> papers</span></div>`;
  if (!sel) {
    return `<section class="tsub block" data-s="${s.id}">${head}
      <p class="fine">Set by hand.</p>
      ${s.papers.map((p) => {
        const sp = `${s.id}_${p.id}`;
        return `<div class="trow">
          <label for="t-${sp}">Paper ${p.n} <span>${esc(p.name)}</span></label>
          <div class="stepper">
            <button class="icon-btn" data-act="t-step" data-sp="${sp}" data-d="-1" aria-label="Lower Paper ${p.n} target">−</button>
            <input id="t-${sp}" type="number" inputmode="numeric" min="0" max="999" value="${targetOf(sp)}" data-sp="${sp}" class="t-in">
            <button class="icon-btn" data-act="t-step" data-sp="${sp}" data-d="1" aria-label="Raise Paper ${p.n} target">+</button>
          </div>
          <span class="t-done">${doneOf(sp)} done</span>
        </div>`;
      }).join('')}
      <p class="tline" data-tline="${s.id}">${esc(targetLine(s.id))}</p>
      <button class="link" data-act="t-bysel" data-s="${s.id}">Choose by year and series instead</button>
    </section>`;
  }
  const open = ui.topen === s.id;
  return `<section class="tsub block${open ? ' open' : ''}" data-s="${s.id}">${head}
    <div class="tsum-row"><p class="tsum">${esc(selSummary(sel))}</p><button class="btn small" data-act="t-open" data-s="${s.id}" aria-expanded="${open}">${open ? 'Done' : 'Change'}</button></div>
    ${open ? `<p class="tlabel">Years</p>${yearPickHTML(sel.years, 't-year', s.id)}${presetsHTML('t-preset', s.id)}
    <p class="tlabel">Series</p>${seriesPickHTML(sel.series, 't-ser', s.id)}` : ''}
    <ul class="tpapers">${s.papers.map((p) => {
      const sp = `${s.id}_${p.id}`;
      const t = targetOf(sp), d = doneOf(sp);
      return `<li><span>Paper ${p.n} <small>${esc(p.name)}</small></span><span class="tp-bar" aria-hidden="true"><i style="width:${t ? clamp((d / t) * 100, 0, 100) : 0}%;background:${col(s.id, p.id).bg}"></i></span><span class="tp-n"><b>${d}</b>/${t}</span></li>`;
    }).join('')}</ul>
    <p class="tline" data-tline="${s.id}">${esc(targetLine(s.id))}</p>
    ${open ? `<button class="link" data-act="t-manual" data-s="${s.id}">Set numbers by hand instead</button>` : ''}
  </section>`;
}

function refreshTargetSubject(sId) {
  const old = document.querySelector(`.tsub[data-s="${sId}"]`);
  if (!old) { render(); return; }
  const tmp = document.createElement('div');
  tmp.innerHTML = targetSubjectHTML(SUBJ[sId]).trim();
  old.replaceWith(tmp.firstChild);
  renderChrome();
}

let targetTimer = null;
function onTargetInput(input) {
  const sp = input.dataset.sp;
  const n = clamp(parseInt(input.value, 10) || 0, 0, 999);
  const { s } = splitSp(sp);
  const vals = {};
  $$(`.tsub[data-s="${s}"] .t-in`).forEach((i) => { vals[i.dataset.sp] = clamp(parseInt(i.value, 10) || 0, 0, 999); });
  const line = $(`[data-tline="${s}"]`);
  if (line) line.textContent = targetLine(s, vals);
  clearTimeout(targetTimer);
  targetTimer = setTimeout(() => {
    if (setRec(`t/${sp}`, n)) commit({ noRender: true });
    renderChrome();
  }, 400);
}

/* ── Sync & backup ── */

function renderData() {
  const el = $('#v-data');
  if (PREVIEW) {
    const theme = LS.get('cd.theme', 'dark');
    el.innerHTML = `<div class="view-head"><h2 class="h">Sync</h2></div>
      <section class="block sync-card" data-state="local"><p class="sync-status"><span class="sp-dot" aria-hidden="true"></span><span>Sync isn\u2019t switched on in this preview.</span></p>
      <p>On the real website this tab gives you a private link for your phone and iPad, a QR code to move between them, and backup, import, CSV, PDF and print options.</p></section>
      <div class="view-head"><h2 class="h">Appearance</h2></div>
      <section class="block"><div class="seg-ctl" role="radiogroup" aria-label="Theme">
        ${[['dark', 'Dark'], ['light', 'Light'], ['auto', 'Match device']].map(([v, l]) => `<button role="radio" aria-checked="${theme === v}" data-act="theme" data-v="${v}">${l}</button>`).join('')}
      </div></section>`;
    return;
  }
  const t = syncText();
  const theme = LS.get('cd.theme', 'dark');
  const lastBackup = LS.get('cd.lastBackup', null);
  const syncBody = Sync.key ? `
      <p>Open your private link on any device to use the same data. It works without logging in, so anyone who has the link can see and change your tracker. Keep it to yourself.</p>
      <div class="btn-row">
        <button class="btn primary" data-act="copy-link">Copy private link</button>
        <button class="btn" data-act="show-qr" aria-expanded="${ui.qr}">${ui.qr ? 'Hide QR code' : 'Show QR code'}</button>
        <button class="btn" data-act="sync-now">Sync now</button>
      </div>
      ${ui.qr ? '<div class="qr" id="qrBox"><p class="fine">Scan this with the other device’s camera.</p></div>' : ''}
      <p class="fine">On iPhone or iPad, add this page to your Home Screen from Safari’s Share menu so it opens like an app. If the Home Screen version opens without your data, paste your private link on its Sync tab once.</p>`
    : `
      <p>Paste your private link to load your data on this device and keep it in sync.</p>
      <form class="connect" data-form="connect"><label class="fld grow"><span>Private link</span><input name="link" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="https://…#k=…"></label><button class="btn primary" type="submit">Connect</button></form>
      <p class="mf-err" hidden></p>`;
  el.innerHTML = `
    <div class="view-head"><h2 class="h">Sync</h2></div>
    <section class="block sync-card" data-state="${Sync.status}">
      <p class="sync-status"><span class="sp-dot" aria-hidden="true"></span><span id="syncStatusLine">${esc(t.long)}</span></p>
      ${syncBody}
    </section>
    <div class="view-head"><h2 class="h">Backup</h2></div>
    <section class="block">
      <ul class="actions">
        <li><button class="btn" data-act="export-json">Export backup (JSON)</button><span>Everything: calendar, targets, papers and goals. ${lastBackup ? `Last exported ${esc(fmtDate(lastBackup.slice(0, 10), 'long'))}.` : 'Not exported from this device yet.'}</span></li>
        <li><button class="btn" data-act="import-json">Import backup (JSON)</button><span>Load a backup from this app or the old one. You choose whether to merge or replace.</span></li>
        <li><button class="btn" data-act="export-csv">Export calendar log (CSV)</button><span>Planned and done numbers per day, for a spreadsheet.</span></li>
        <li><button class="btn" data-act="export-lib-csv">Export Paper Library (CSV)</button><span>Every paper you’ve recorded, with marks and scores.</span></li>
        <li><button class="btn" data-act="pdf">Download calendar overview (PDF)</button><span>A colour-coded plan, this month through April, four months a page.</span></li>
        <li><button class="btn" data-act="print">Print or save as PDF</button><span>Every tab, in full, through your browser’s print dialog.</span></li>
      </ul>
    </section>
    <div class="view-head"><h2 class="h">Appearance</h2></div>
    <section class="block">
      <div class="seg-ctl" role="radiogroup" aria-label="Theme">
        ${[['dark', 'Dark'], ['light', 'Light'], ['auto', 'Match device']].map(([v, l]) => `<button role="radio" aria-checked="${theme === v}" data-act="theme" data-v="${v}">${l}</button>`).join('')}
      </div>
    </section>
    <div class="view-head"><h2 class="h">This device</h2></div>
    <section class="block">
      <ul class="actions">
        ${Sync.key ? '<li><button class="btn" data-act="disconnect">Disconnect this device</button><span>Removes your data from this device only. It stays safe in the cloud and on your other devices.</span></li>' : ''}
        <li><button class="btn danger" data-act="erase">Erase all data</button><span>Deletes every calendar entry, target, paper and goal${Sync.key ? ' on every synced device' : ''}. Export a backup first.</span></li>
      </ul>
      <p class="fine">${Store.liveCount()} records on this device${Store.dirty.size ? `, ${Store.dirty.size} waiting to sync` : ''}.</p>
    </section>
    <p class="foot">Countdown, built for the Cambridge IGCSE February/March 2027 series, Zone 4 (India).</p>`;
  if (ui.qr) drawQR();
}

async function loadScript(src, globalName) {
  if (window[globalName]) return window[globalName];
  await new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = () => rej(new Error('load failed'));
    document.head.appendChild(s);
  });
  return window[globalName];
}

async function drawQR() {
  const box = $('#qrBox');
  if (!box) return;
  try {
    const qrcode = await loadScript('https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js', 'qrcode');
    const q = qrcode(0, 'M');
    q.addData(Sync.link());
    q.make();
    const holder = document.createElement('div');
    holder.className = 'qr-img';
    holder.innerHTML = q.createSvgTag({ cellSize: 5, margin: 3, scalable: true });
    box.prepend(holder);
  } catch (e) {
    box.innerHTML = '<p class="fine">The QR code needs an internet connection. Copy the link instead.</p>';
  }
}

/* ── backup / export ── */

function download(name, text, mime) {
  const blob = new Blob([text], { type: mime });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
}

function exportJSON() {
  const out = {
    version: 1,
    app: 'countdown',
    exportedAt: new Date().toISOString(),
    theme: LS.get('cd.theme', 'dark'),
    entries: state.entries,
    targets: Object.fromEntries(ALL_SP.map((sp) => [sp, targetOf(sp)])),
    targetSelection: state.tsel,
    quiz: state.quiz,
    quizDays: state.qdays,
    paperLibrary: state.lib,
    goals: Object.values(state.goals),
    lastBackup: new Date().toISOString(),
    updatedAt: Store.lastU,
  };
  download(`revision-backup-${todayISO()}.json`, JSON.stringify(out, null, 2), 'application/json');
  LS.set('cd.lastBackup', out.exportedAt);
  if (ui.tab === 'data') renderData();
}

const csvCell = (v) => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
function exportCSV() {
  const lines = [['date', 'subject', 'paper', 'planned', 'done', 'rest_day'].join(',')];
  for (const date of Object.keys(state.entries).sort()) {
    const e = state.entries[date];
    if (e.__rest) lines.push([date, '', '', '', '', 'yes'].join(','));
    for (const sp of Object.keys(e).filter((k) => k !== '__rest').sort((a, b) => ALL_SP.indexOf(a) - ALL_SP.indexOf(b))) {
      const { s, p } = splitSp(sp);
      lines.push([date, SUBJ[s].name, paperOf(s, p).n, e[sp].planned || 0, e[sp].done || 0, ''].map(csvCell).join(','));
    }
  }
  download(`revision-calendar-${todayISO()}.csv`, lines.join('\n'), 'text/csv');
}

function exportLibCSV() {
  const lines = [['subject', 'paper', 'component', 'year', 'series', 'variant', 'marks', 'out_of', 'score_percent', 'counted_on_day'].join(',')];
  const keys = Object.keys(state.lib).sort((a, b) => {
    const A = parseKey(a), B = parseKey(b);
    return ALL_SP.indexOf(A.sp) - ALL_SP.indexOf(B.sp) || B.y - A.y || A.ser.localeCompare(B.ser) || A.v - B.v;
  });
  for (const k of keys) {
    const p = parseKey(k), r = state.lib[k];
    lines.push([SUBJ[p.s].name, paperOf(p.s, p.p).n, compCode(p.s, p.p, p.v), p.y, SERIES_BY_ID[p.ser].long, p.v, r.marksObtained, r.marksTotal, r.score, r.date].map(csvCell).join(','));
  }
  download(`paper-library-${todayISO()}.csv`, lines.join('\n'), 'text/csv');
}

function readImport(obj) {
  if (!obj || typeof obj !== 'object' || (!obj.entries && !obj.paperLibrary && !obj.targets)) throw new Error('This file isn’t a Countdown backup.');
  const recs = {};
  for (const [date, e] of Object.entries(obj.entries || {})) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !e || typeof e !== 'object') continue;
    for (const [sp, c] of Object.entries(e)) {
      if (sp === '__rest') { if (c) recs[`e/${date}/__rest`] = true; continue; }
      if (!ALL_SP.includes(sp) || !c) continue;
      recs[`e/${date}/${sp}`] = { planned: Math.max(0, Number(c.planned) || 0), done: Math.max(0, Number(c.done) || 0) };
    }
  }
  for (const [sp, n] of Object.entries(obj.targets || {})) if (ALL_SP.includes(sp)) recs[`t/${sp}`] = Math.max(0, Number(n) || 0);
  for (const [sId, sel] of Object.entries(obj.targetSelection || {})) {
    if (!SUBJ[sId] || !sel || typeof sel !== 'object') continue;
    recs[`ts/${sId}`] = sel.manual ? { manual: true } : {
      years: (sel.years || []).map(Number).filter((y) => YEARS.includes(y)),
      series: (sel.series || []).filter((x) => SERIES_BY_ID[x]),
    };
  }
  for (const [k, r] of Object.entries(obj.paperLibrary || {})) {
    const p = parseKey(k);
    if (!ALL_SP.includes(p.sp) || !SERIES_BY_ID[p.ser] || !r || !r.done) continue;
    const num = (v) => (v === '' || v == null || isNaN(Number(v)) ? null : Number(v));
    const rec = { done: true, marksObtained: num(r.marksObtained), marksTotal: num(r.marksTotal), score: num(r.score), date: r.date || null };
    if (r.markedAt) rec.markedAt = Number(r.markedAt);
    recs[`p/${k}`] = rec;
  }
  for (const [id, r] of Object.entries(obj.quiz || {})) if (QZ.BY_ID[id] && r && typeof r === 'object') recs[`q/${id}`] = r;
  for (const [d, r] of Object.entries(obj.quizDays || {})) if (/^\d{4}-\d{2}-\d{2}$/.test(d) && r && typeof r === 'object') recs[`qd/${d}`] = r;
  const goals = Array.isArray(obj.goals) ? obj.goals : Object.values(obj.goals || {});
  for (const g of goals) {
    if (!g || !g.id) continue;
    recs[`g/${g.id}`] = { id: String(g.id), title: String(g.title || 'Goal'), deadline: g.deadline || null, paperKeys: (g.paperKeys || []).filter((k) => ALL_SP.includes(parseKey(k).sp)), createdAt: g.createdAt || Date.now() };
  }
  return recs;
}

function importSheetHTML(S) {
  const c = { e: 0, days: new Set(), t: 0, p: 0, g: 0 };
  for (const k of Object.keys(S.recs)) {
    const kind = k.split('/')[0];
    if (kind === 'e') { c.e++; c.days.add(k.split('/')[1]); } else if (kind in c) c[kind]++;
  }
  return `<div class="sheet-h"><h2 id="sheetTitle">Import backup</h2><button class="icon-btn" data-act="sheet-close" aria-label="Close">×</button></div>
    <p>This file has <b>${plural(c.p, 'paper')}</b> in the Paper Library, <b>${plural(c.days.size, 'calendar day')}</b>, <b>${plural(c.t, 'target')}</b> and <b>${plural(c.g, 'goal')}</b>.</p>
    <ul class="actions">
      <li><button class="btn primary" data-act="import-merge">Merge with my data</button><span>Adds everything in the file. Where both have the same paper or day, the file wins. Nothing else is removed.</span></li>
      <li><button class="btn danger" data-act="import-replace">Replace all my data</button><span>Makes your data exactly match the file${Sync.key ? ', on every synced device' : ''}.</span></li>
    </ul>
    <div class="sheet-f"><button class="btn" data-act="sheet-close">Cancel</button></div>`;
}

function doImport(recs, replace) {
  if (replace) {
    for (const [k, r] of Object.entries(Store.rec)) if (r && r.v !== null && !(k in recs)) setRec(k, null);
  }
  let n = 0;
  for (const [k, v] of Object.entries(recs)) if (setRec(k, v)) n++;
  closeSheet();
  commit();
  toast(n ? `Imported. ${plural(n, 'record')} updated.` : 'Imported. Everything already matched.');
}

async function overviewPDF() {
  let jsPDFns;
  try { jsPDFns = await loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js', 'jspdf'); }
  catch (e) { toast('The PDF tool needs an internet connection. Try again online, or use Print instead.'); return; }
  const doc = new jsPDFns.jsPDF({ unit: 'mm', format: 'a4' });
  const now = new Date();
  let y = Math.max(now.getFullYear() * 12 + now.getMonth(), CAL_START.y * 12 + CAL_START.m);
  const end = CAL_END.y * 12 + CAL_END.m;
  const months = [];
  for (; y <= end; y++) months.push({ y: Math.floor(y / 12), m: y % 12 });
  const W = 210, M = 12, colW = (W - M * 2 - 8) / 2, cell = colW / 7, rowH = 15;
  const ink = [19, 33, 58], muted = [93, 109, 133];
  months.forEach((mo, i) => {
    if (i % 4 === 0) {
      if (i) doc.addPage();
      doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.setTextColor(...ink);
      doc.text('Countdown: revision plan', M, 14);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...muted);
      doc.text(`Exported ${fmtDate(todayISO(), 'long')}. Coloured bars are papers planned; red outline is an exam day.`, M, 19);
      let lx = M;
      SUBJECTS.forEach((s) => {
        const c = col(s.id, null, true).rgb;
        doc.setFillColor(...c); doc.rect(lx, 284, 3, 3, 'F');
        doc.setTextColor(...ink); doc.text(s.name, lx + 4.5, 286.6);
        lx += 4.5 + doc.getTextWidth(s.name) + 5;
      });
    }
    const slot = i % 4;
    const x0 = M + (slot % 2) * (colW + 8);
    const y0 = 28 + Math.floor(slot / 2) * 128;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...ink);
    doc.text(`${MONTHS[mo.m]} ${mo.y}`, x0, y0);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(...muted);
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach((d, j) => doc.text(d, x0 + j * cell + 1, y0 + 5));
    const lead = new Date(mo.y, mo.m, 1).getDay();
    const nDays = new Date(mo.y, mo.m + 1, 0).getDate();
    for (let d = 1; d <= nDays; d++) {
      const idx = lead + d - 1;
      const cx = x0 + (idx % 7) * cell, cy = y0 + 7 + Math.floor(idx / 7) * rowH;
      const date = `${mo.y}-${pad(mo.m + 1)}-${pad(d)}`;
      const e = state.entries[date] || {};
      const sps = Object.keys(e).filter((k) => k !== '__rest').sort((a, b) => ALL_SP.indexOf(a) - ALL_SP.indexOf(b));
      doc.setDrawColor(207, 216, 228); doc.setLineWidth(0.2);
      doc.rect(cx, cy, cell, rowH);
      sps.slice(0, 4).forEach((sp, k) => {
        const { s, p } = splitSp(sp);
        doc.setFillColor(...col(s, p, true).rgb);
        doc.rect(cx + 0.8, cy + 4.6 + k * 2.5, cell - 1.6, 2.1, 'F');
        doc.setFontSize(4.6); doc.setTextColor(255, 255, 255);
        doc.text(spTag(sp), cx + 1.3, cy + 6.2 + k * 2.5);
      });
      if (e.__rest) { doc.setFontSize(5.5); doc.setTextColor(...muted); doc.text('rest', cx + 1, cy + 8); }
      const ex = EXAMS_BY_DATE[date];
      if (ex) {
        doc.setDrawColor(200, 40, 60); doc.setLineWidth(0.6);
        doc.rect(cx + 0.3, cy + 0.3, cell - 0.6, rowH - 0.6);
        doc.setFontSize(4.8); doc.setTextColor(200, 40, 60);
        doc.text(ex.map((x) => x.code).join(' '), cx + 1, cy + rowH - 1.2);
      }
      doc.setFontSize(6.5); doc.setTextColor(...ink);
      doc.text(String(d), cx + 1, cy + 3.2);
    }
  });
  doc.save(`countdown-overview-${todayISO()}.pdf`);
}

function doPrint() {
  renderAll();
  document.body.classList.add('printing');
  setTimeout(() => {
    window.print();
    setTimeout(() => { document.body.classList.remove('printing'); render(); }, 500);
  }, 60);
}

/* ───────────── navigation & helpers ───────────── */

function go(tab, opts = {}) {
  ui.tab = tab;
  try { sessionStorage.setItem('cd.tab', tab); } catch (e) { /* ignore */ }
  render();
  if (!opts.keepScroll) window.scrollTo({ top: 0 });
}

function openLib(sId, opts = {}) {
  const pos = opts.y ? { y: opts.y, ser: opts.ser } : defaultLibPos(sId);
  ui.lib = { s: sId, y: pos.y, ser: pos.ser };
  ui.form = null;
  if (ui.tab !== 'stats') { ui.tab = 'stats'; }
  render();
  if (opts.scroll !== false) {
    const el = document.getElementById(`subj-${sId}`);
    if (el) el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }
}

let toastTimer = null;
function toast(msg, opts = {}) {
  const t = $('#toast');
  t.innerHTML = `<span>${esc(msg)}</span>${opts.action ? `<button class="link" data-toast-act>${esc(opts.action)}</button>` : ''}`;
  t.hidden = false;
  t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
  const b = t.querySelector('[data-toast-act]');
  if (b) b.onclick = () => { t.hidden = true; opts.onAction && opts.onAction(); };
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, opts.ms || 3200);
}

function confirmTap(btn, fn, label = 'Tap again to confirm') {
  if (btn.dataset.arming === '1') {
    clearTimeout(btn._ct);
    btn.dataset.arming = '';
    fn();
    return;
  }
  btn.dataset.orig = btn.textContent;
  btn.dataset.arming = '1';
  btn.textContent = label;
  btn.classList.add('arming');
  btn._ct = setTimeout(() => {
    if (!btn.isConnected) return;
    btn.dataset.arming = '';
    btn.textContent = btn.dataset.orig;
    btn.classList.remove('arming');
  }, 3500);
}

function setTheme(v) {
  LS.set('cd.theme', v);
  applyTheme();
  render();
}
function applyTheme() {
  let t = LS.get('cd.theme', 'dark');
  if (t === 'auto') t = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', t);
  const meta = document.querySelectorAll('meta[name="theme-color"]');
  meta.forEach((m) => m.setAttribute('content', t === 'light' ? '#EEF1F0' : '#12161C'));
}

function parseKeyFromLink(text) {
  const s = String(text || '').trim();
  const m = s.match(/[#&?]k=([A-Za-z0-9_-]{20,})/) || s.match(/^([A-Za-z0-9_-]{20,})$/);
  return m ? m[1] : null;
}

async function connectWith(secret, opts = {}) {
  try {
    if (Sync.key && Sync.key !== secret) {
      await Sync.syncNow();
      Sync.disconnect();
      Store.wipe();
      rebuild();
    }
    await Sync.connect(secret);
    if (!location.hash.includes(secret)) history.replaceState(null, '', `#k=${secret}`);
    rebuild();
    render();
    if (!opts.quiet) toast('Connected. This device now syncs with your other devices.');
    return true;
  } catch (e) {
    if (/unknown_vault/.test(e.message)) toast('That private link isn’t recognised. Check you copied all of it.');
    else {
      // Offline or server unreachable: keep the key and sync later.
      LS.set('cd.key', secret);
      Sync.key = secret;
      Sync.setStatus(navigator.onLine ? 'error' : 'offline', 'Couldn’t reach the sync server yet. It will try again automatically.');
      Sync.startPolling();
      render();
    }
    return false;
  }
}

/* ───────────── events ───────────── */

document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act;
  const d = el.dataset;

  if (act === 'sheet-bg') { if (ev.target === el) closeSheet(); return; }
  if (el.disabled) return;

  switch (act) {
    case 'go': go(d.tab); break;
    case 'log-today': {
      ui.cal.y = null;
      const t = todayISO();
      openDay(t, { adding: !Object.keys(state.entries[t] || {}).length });
      break;
    }
    case 'print': doPrint(); break;

    /* Paper Library */
    case 'lib-open':
      if (ui.lib && ui.lib.s === d.s) { ui.lib = null; ui.form = null; render(); }
      else openLib(d.s, { scroll: false });
      break;
    case 'lib-close': ui.lib = null; ui.form = null; render(); break;
    case 'lib-year': ui.lib.y = Number(d.y); ui.form = null; render(); break;
    case 'lib-ser': ui.lib.ser = d.ser; ui.form = null; render(); break;
    case 'tile':
      if (ui.form && ui.form.key === d.key && ui.form.ctx === 'lib') ui.form = null;
      else ui.form = { key: d.key, ctx: 'lib', focus: !state.lib[d.key] };
      render();
      break;
    case 'form-cancel': ui.form = null; render(); break;
    case 'paper-remove':
      confirmTap(el, () => {
        removePaper(d.key);
        ui.form = null;
        commit();
        toast('Removed from the Paper Library.');
      });
      break;
    case 'ov': openLib(d.s, { y: Number(d.y), ser: d.ser }); break;
    case 'week': ui.weekOff = Math.min(0, ui.weekOff + Number(d.d)); render(); break;

    /* Calendar */
    case 'cal-pick':
      if (ui.cal.pick === d.s) { ui.cal.pick = null; if (ui.cal.armed && ui.cal.armed.kind !== 'rest') ui.cal.armed = null; }
      else { ui.cal.pick = d.s; if (ui.cal.armed && ui.cal.armed.kind !== 'rest') ui.cal.armed = null; }
      render();
      break;
    case 'cal-arm':
      ui.cal.armed = ui.cal.armed && ui.cal.armed.kind === 'paper' && ui.cal.armed.sp === d.sp ? null : { kind: 'paper', sp: d.sp };
      render();
      break;
    case 'cal-arm-all':
      ui.cal.armed = ui.cal.armed && ui.cal.armed.kind === 'all' && ui.cal.armed.s === d.s ? null : { kind: 'all', s: d.s };
      render();
      break;
    case 'cal-arm-rest':
      ui.cal.armed = ui.cal.armed && ui.cal.armed.kind === 'rest' ? null : { kind: 'rest' };
      render();
      break;
    case 'cal-disarm': ui.cal.armed = null; render(); break;
    case 'cal-month': {
      let n = ui.cal.y * 12 + ui.cal.m + Number(d.d);
      n = clamp(n, CAL_START.y * 12 + CAL_START.m, CAL_END.y * 12 + CAL_END.m);
      ui.cal.y = Math.floor(n / 12); ui.cal.m = n % 12;
      render();
      break;
    }
    case 'cal-today': ui.cal.y = null; render(); break;
    case 'day':
      if (ui.cal.armed) return; // handled by pointer events
      openDay(d.day);
      break;

    /* Day sheet */
    case 'sheet-close': closeSheet(); break;
    case 'dayrow-del': readWheels(); ui.sheet.rows.splice(Number(d.i), 1); renderSheet(); break;
    case 'dayrow-toggle-add': readWheels(); ui.sheet.adding = !ui.sheet.adding; renderSheet(); break;
    case 'dayrow-add-sp':
      readWheels();
      ui.sheet.rows.push({ sp: d.sp, planned: 1, done: 0 });
      ui.sheet.rows.sort((a, b) => ALL_SP.indexOf(a.sp) - ALL_SP.indexOf(b.sp));
      renderSheet();
      break;
    case 'day-rest': readWheels(); ui.sheet.rest = el.checked; renderSheet(); break;
    case 'day-save': saveDay(); break;

    /* Goals */
    case 'goal-new': ui.goals.draft = newDraft(); ui.form = null; render(); break;
    case 'gd-cancel': ui.goals.draft = null; render(); break;
    case 'gd-subj': {
      const D = ui.goals.draft;
      D.s = d.s;
      const firstSel = D.keys.map(parseKey).find((p) => p.s === d.s);
      const pos = firstSel ? { y: firstSel.y, ser: firstSel.ser } : defaultLibPos(d.s);
      D.y = pos.y; D.ser = seriesOffered(d.s, pos.ser) ? pos.ser : (SERIES.find((x) => seriesOffered(d.s, x.id)) || SERIES[1]).id;
      render();
      break;
    }
    case 'gd-year': ui.goals.draft.y = Number(d.y); render(); break;
    case 'gd-ser': ui.goals.draft.ser = d.ser; render(); break;
    case 'gd-tile': {
      const D = ui.goals.draft;
      const i = D.keys.indexOf(d.key);
      if (i >= 0) D.keys.splice(i, 1); else D.keys.push(d.key);
      render();
      break;
    }
    case 'gd-all': {
      const D = ui.goals.draft;
      const ks = SUBJ[D.s].papers.flatMap((p) => variants(D.s, D.ser, p.id).map((v) => pkey(D.s, p.id, D.y, D.ser, v)));
      const all = ks.every((k) => D.keys.includes(k));
      if (all) D.keys = D.keys.filter((k) => !ks.includes(k));
      else for (const k of ks) if (!D.keys.includes(k)) D.keys.push(k);
      render();
      break;
    }
    case 'goal-toggle':
      ui.goals.open = ui.goals.open === d.id ? null : d.id;
      if (ui.form && String(ui.form.ctx).startsWith('goal:')) ui.form = null;
      render();
      break;
    case 'goal-tile': {
      const ctx = `goal:${ui.goals.open}`;
      if (ui.form && ui.form.key === d.key && ui.form.ctx === ctx) ui.form = null;
      else ui.form = { key: d.key, ctx, focus: !state.lib[d.key] };
      render();
      break;
    }
    case 'goal-edit': ui.goals.draft = newDraft(state.goals[d.id]); ui.form = null; render(); window.scrollTo({ top: 0 }); break;
    case 'goal-del':
      confirmTap(el, () => {
        setRec(`g/${d.id}`, null);
        ui.goals.open = null;
        commit();
        toast('Goal deleted. The papers in it are still in your Paper Library.');
      });
      break;

    /* Targets */
    case 't-step': {
      const inp = document.getElementById(`t-${d.sp}`);
      inp.value = clamp((parseInt(inp.value, 10) || 0) + Number(d.d), 0, 999);
      onTargetInput(inp);
      break;
    }
    case 't-year': case 't-ser': case 't-preset': {
      const sel = targetSel(d.s) || { years: DEFAULT_SEL.years.slice(), series: DEFAULT_SEL.series.slice() };
      const next = { years: sel.years.slice(), series: sel.series.slice() };
      if (act === 't-year') { const y = Number(d.y); next.years = next.years.includes(y) ? next.years.filter((x) => x !== y) : next.years.concat(y); }
      if (act === 't-ser') next.series = next.series.includes(d.ser) ? next.series.filter((x) => x !== d.ser) : next.series.concat(d.ser);
      if (act === 't-preset') next.years = presetYears(d.p);
      writeSel(d.s, next);
      commit({ noRender: true });
      refreshTargetSubject(d.s);
      break;
    }
    case 't-open': {
      const prev = ui.topen;
      ui.topen = ui.topen === d.s ? null : d.s;
      if (prev && prev !== d.s) refreshTargetSubject(prev);
      refreshTargetSubject(d.s);
      break;
    }
    case 't-manual':
      for (const p of SUBJ[d.s].papers) setRec(`t/${d.s}_${p.id}`, targetOf(`${d.s}_${p.id}`));
      setRec(`ts/${d.s}`, { manual: true });
      commit({ noRender: true });
      refreshTargetSubject(d.s);
      break;
    case 't-bysel':
      writeSel(d.s, DEFAULT_SEL);
      commit({ noRender: true });
      refreshTargetSubject(d.s);
      break;
    case 'tg-year': case 'tg-ser': case 'tg-preset': {
      const G = ui.tglobal;
      if (act === 'tg-year') { const y = Number(d.y); G.years = G.years.includes(y) ? G.years.filter((x) => x !== y) : G.years.concat(y); }
      if (act === 'tg-ser') G.series = G.series.includes(d.ser) ? G.series.filter((x) => x !== d.ser) : G.series.concat(d.ser);
      if (act === 'tg-preset') G.years = presetYears(d.p);
      render();
      break;
    }
    case 'tg-apply':
      confirmTap(el, () => {
        for (const sub of SUBJECTS) writeSel(sub.id, ui.tglobal);
        commit();
        toast(`Every subject now targets ${selSummary(ui.tglobal)}.`);
      }, 'Tap again to replace every target');
      break;
    case 'goal-open':
      ui.goals.open = d.id;
      ui.form = null;
      go('goals');
      setTimeout(() => { const g = document.getElementById(`goal-${d.id}`); if (g) g.scrollIntoView({ block: 'start', behavior: 'smooth' }); }, 30);
      break;

    /* Sync & backup */
    case 'copy-link': {
      const link = Sync.link();
      (navigator.clipboard ? navigator.clipboard.writeText(link) : Promise.reject())
        .then(() => toast('Private link copied. Open it on your other device.'))
        .catch(() => { prompt('Copy your private link:', link); });
      break;
    }
    case 'show-qr': ui.qr = !ui.qr; render(); break;
    case 'sync-now': Sync.syncNow({ full: true }); break;
    case 'export-json': exportJSON(); break;
    case 'import-json': $('#importFile').click(); break;
    case 'export-csv': exportCSV(); break;
    case 'export-lib-csv': exportLibCSV(); break;
    case 'pdf': overviewPDF(); break;
    case 'import-merge': doImport(ui.sheet.recs, false); break;
    case 'import-replace': confirmTap(el, () => doImport(ui.sheet.recs, true), 'Tap again to replace everything'); break;
    case 'theme': setTheme(d.v); break;
    case 'theme-toggle': setTheme(isDark() ? 'light' : 'dark'); break;
    case 'disconnect':
      confirmTap(el, async () => {
        if (Store.dirty.size) await Sync.syncNow();
        if (Store.dirty.size) { toast('Some changes haven’t synced yet. Connect to the internet first, so nothing is lost.'); return; }
        Sync.disconnect();
        Store.wipe();
        history.replaceState(null, '', location.pathname);
        rebuild();
        render();
        toast('This device is disconnected. Your data is still in the cloud.');
      }, 'Tap again to disconnect');
      break;
    case 'erase':
      confirmTap(el, () => {
        for (const [k, r] of Object.entries(Store.rec)) if (r && r.v !== null) setRec(k, null);
        ui.lib = null; ui.form = null; ui.goals = { draft: null, open: null };
        commit();
        toast('All data erased.');
      }, 'Tap again to erase everything');
      break;
    default:
      if (act.startsWith('qz-')) quizClick(el, act, d);
      break;
  }
});

document.addEventListener('submit', (ev) => {
  const f = ev.target;
  if (!f.dataset || !f.dataset.form) return;
  ev.preventDefault();
  if (f.dataset.form === 'paper') submitPaperForm(f);
  else if (f.dataset.form === 'goal') submitGoal(f);
  else if (f.dataset.form === 'connect') {
    const key = parseKeyFromLink(f.elements.namedItem('link').value);
    const err = f.parentElement.querySelector('.mf-err');
    if (!key) { err.textContent = 'Paste the whole private link. It ends with #k= followed by a long code.'; err.hidden = false; return; }
    connectWith(key);
  }
});

function numOrNull(v) {
  const s = String(v || '').trim().replace(',', '.');
  if (!s) return null;
  const n = Number(s);
  return isFinite(n) ? n : NaN;
}

function submitPaperForm(f) {
  const key = f.dataset.key;
  const F = f.elements;
  const obt = numOrNull(F.namedItem('obt').value), tot = numOrNull(F.namedItem('tot').value);
  const err = f.querySelector('.mf-err');
  const fail = (m) => { err.textContent = m; err.hidden = false; };
  if (Number.isNaN(obt) || Number.isNaN(tot)) return fail('Marks need to be numbers.');
  if (obt != null && tot == null) return fail('Add what it was out of, or clear the marks.');
  if (tot != null && tot <= 0) return fail('“Out of” needs to be more than zero.');
  if (obt != null && tot != null && obt > tot) return fail('Marks can’t be more than the total.');
  if (obt != null && obt < 0) return fail('Marks can’t be negative.');
  const date = F.namedItem('link').checked ? (F.namedItem('date').value || todayISO()) : null;
  const isNew = savePaper(key, { obt, tot, date });
  ui.form = null;
  commit();
  const k = parseKey(key);
  toast(isNew ? `${compCode(k.s, k.p, k.v)} marked done${date ? `, counted on ${fmtDate(date, 'dm')}` : ''}.` : 'Saved.');
}

function submitGoal(f) {
  const D = ui.goals.draft;
  D.title = f.elements.namedItem('title').value.trim();
  D.deadline = f.elements.namedItem('deadline').value;
  const err = f.querySelector('.mf-err');
  const fail = (m) => { err.textContent = m; err.hidden = false; };
  if (!D.title) return fail('Give the goal a name.');
  if (!D.deadline) return fail('Pick a deadline.');
  if (!D.keys.length) return fail('Select at least one paper.');
  const id = D.id || uid();
  setRec(`g/${id}`, { id, title: D.title, deadline: D.deadline, paperKeys: D.keys.slice(), createdAt: D.createdAt || Date.now() });
  ui.goals.draft = null;
  ui.goals.open = id;
  commit();
  toast(D.id ? 'Goal saved.' : 'Goal created.');
}

document.addEventListener('input', (ev) => {
  const t = ev.target;
  if (t.classList.contains('t-in')) { onTargetInput(t); return; }
  const f = t.form;
  if (f && f.dataset.form === 'paper') {
    const obt = numOrNull(f.elements.namedItem('obt').value), tot = numOrNull(f.elements.namedItem('tot').value);
    const out = f.querySelector('.mf-pct');
    out.textContent = obt != null && tot && !Number.isNaN(obt) && !Number.isNaN(tot) ? `${Math.round((obt / tot) * 100)}%` : '';
    f.querySelector('.mf-err').hidden = true;
  }
  if (f && f.dataset.form === 'goal' && ui.goals.draft) {
    if (t.name === 'title') ui.goals.draft.title = t.value;
    if (t.name === 'deadline') ui.goals.draft.deadline = t.value;
  }
});

document.addEventListener('change', (ev) => {
  const t = ev.target;
  if (t.name === 'link' && t.form && t.form.dataset.form === 'paper') t.form.elements.namedItem('date').disabled = !t.checked;
  if (t.id === 'importFile' && t.files && t.files[0]) {
    const file = t.files[0];
    t.value = '';
    file.text().then((txt) => {
      try {
        const recs = readImport(JSON.parse(txt));
        ui.sheet = { kind: 'import', recs };
        renderSheet();
      } catch (e) {
        toast(e.message && e.message.startsWith('This file') ? e.message : 'That file couldn’t be read. Choose a .json backup.');
      }
    });
  }
});

document.addEventListener('focusout', () => {
  setTimeout(() => {
    const ae = document.activeElement;
    if (ui.pendingRender && !(ae && ae.closest && ae.closest('#main') && /INPUT|TEXTAREA|SELECT/.test(ae.tagName))) render();
  }, 0);
});

document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' && ui.sheet) closeSheet();
});

/* Calendar press-and-drag. */
let drag = null;
document.addEventListener('pointerdown', (ev) => {
  if (!ui.cal.armed || ui.tab !== 'calendar') return;
  const cell = ev.target.closest('#calGrid [data-day]');
  if (!cell) return;
  ev.preventDefault();
  const date = cell.dataset.day;
  drag = { mode: armedModeFor(date), seen: new Set([date]), id: ev.pointerId };
  applyArmed(date, drag.mode);
  refreshDayCell(date);
});
document.addEventListener('pointermove', (ev) => {
  if (!drag || ev.pointerId !== drag.id) return;
  const hit = document.elementFromPoint(ev.clientX, ev.clientY);
  const cell = hit && hit.closest('#calGrid [data-day]');
  if (!cell || drag.seen.has(cell.dataset.day)) return;
  drag.seen.add(cell.dataset.day);
  applyArmed(cell.dataset.day, drag.mode);
  refreshDayCell(cell.dataset.day);
});
const endDrag = (ev) => { if (drag && (!ev || ev.pointerId === drag.id)) { drag = null; finishDrag(); } };
document.addEventListener('pointerup', endDrag);
document.addEventListener('pointercancel', endDrag);

/* Desktop: drag a paper chip onto a day. */
document.addEventListener('dragstart', (ev) => {
  const chip = ev.target.closest && ev.target.closest('.pchip[data-sp]');
  if (!chip) return;
  ev.dataTransfer.setData('text/plain', chip.dataset.sp);
  ev.dataTransfer.effectAllowed = 'copy';
});
document.addEventListener('dragover', (ev) => {
  if (ev.target.closest && ev.target.closest('#calGrid [data-day]')) ev.preventDefault();
});
document.addEventListener('drop', (ev) => {
  const cell = ev.target.closest && ev.target.closest('#calGrid [data-day]');
  if (!cell) return;
  ev.preventDefault();
  const sp = ev.dataTransfer.getData('text/plain');
  if (!ALL_SP.includes(sp)) return;
  const date = cell.dataset.day;
  if (!cellOf(date, sp)) {
    setRec(`e/${date}/${sp}`, { planned: 0, done: 0 });
    if ((state.entries[date] || {}).__rest) setRec(`e/${date}/__rest`, null);
    commit({ noRender: true });
    renderCalendar();
  }
});

window.addEventListener('beforeprint', () => { if (!document.body.classList.contains('printing')) renderAll(); });
window.addEventListener('afterprint', () => { if (!document.body.classList.contains('printing')) render(); });
matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => { if (LS.get('cd.theme', 'dark') === 'auto') { applyTheme(); render(); } });

/* ───────────── app object used by sync.js ───────────── */

const App = {
  toast,
  onRemoteChange() { rebuild(); render({ fromRemote: true }); },
};
window.App = App;

/* ───────────── start ───────────── */

function scheduleMidnight() {
  const n = new Date();
  const next = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1, 0, 0, 5);
  setTimeout(() => { render(); scheduleMidnight(); }, next - n);
}

function init() {
  Store.load();
  if (PREVIEW && !Store.liveCount() && window.COUNTDOWN_SEED) {
    for (const [k, v] of Object.entries(window.COUNTDOWN_SEED)) Store.put(k, v);
    Store.dirty.clear();
    Store.persist();
  }
  Sync.init();
  Sync.onChange(() => {
    renderSyncPill();
    if (ui.tab === 'data') {
      const card = $('.sync-card');
      if (card) card.dataset.state = Sync.status;
    }
  });
  applyTheme();
  try { const t = sessionStorage.getItem('cd.tab'); if (t) ui.tab = t; } catch (e) { /* ignore */ }
  rebuild();
  render();

  const linkKey = PREVIEW ? null : parseKeyFromLink(location.hash);
  if (linkKey && Sync.config() && linkKey !== Sync.key) {
    connectWith(linkKey);
  } else if (Sync.enabled()) {
    if (!location.hash.includes('k=')) history.replaceState(null, '', `#k=${Sync.key}`);
    Sync.syncNow({ full: true });
    Sync.startPolling();
  }
  scheduleMidnight();

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline support is optional */ });
  }
}

init();
