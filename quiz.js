/* Countdown — daily Chemistry quiz: cation tests, anion tests, flame tests, solubility rules.
   Facts and wording follow the Cambridge IGCSE Chemistry 0620 syllabus for 2026–2028
   ("Notes for use in qualitative analysis" and the general solubility rules in 7.3).

   Scheduling is a simple Leitner system: each question sits in a box 1–5. A right answer
   moves it up a box and pushes it further away (1, 3, 7, 14, 30 days); a wrong answer
   sends it back to box 1 for tomorrow and repeats it once at the end of today's session.
   Progress is stored as records q/<question id> and qd/<date>, so it syncs like everything else. */

const QZ = (() => {
  const CATIONS = [
    { id: 'al', ion: 'Al<sup>3+</sup>', name: 'aluminium', naoh: 'white ppt., soluble in excess, giving a colourless solution', nh3: 'white ppt., insoluble in excess' },
    { id: 'nh4', ion: 'NH<sub>4</sub><sup>+</sup>', name: 'ammonium', naoh: 'ammonia produced on warming', nh3: null },
    { id: 'ca', ion: 'Ca<sup>2+</sup>', name: 'calcium', naoh: 'white ppt., insoluble in excess', nh3: 'no ppt. or very slight white ppt.' },
    { id: 'cr', ion: 'Cr<sup>3+</sup>', name: 'chromium(III)', naoh: 'green ppt., soluble in excess', nh3: 'green ppt., insoluble in excess' },
    { id: 'cu', ion: 'Cu<sup>2+</sup>', name: 'copper(II)', naoh: 'light blue ppt., insoluble in excess', nh3: 'light blue ppt., soluble in excess, giving a dark blue solution' },
    { id: 'fe2', ion: 'Fe<sup>2+</sup>', name: 'iron(II)', naoh: 'green ppt., insoluble in excess, ppt. turns brown near surface on standing', nh3: 'green ppt., insoluble in excess, ppt. turns brown near surface on standing' },
    { id: 'fe3', ion: 'Fe<sup>3+</sup>', name: 'iron(III)', naoh: 'red-brown ppt., insoluble in excess', nh3: 'red-brown ppt., insoluble in excess' },
    { id: 'zn', ion: 'Zn<sup>2+</sup>', name: 'zinc', naoh: 'white ppt., soluble in excess, giving a colourless solution', nh3: 'white ppt., soluble in excess, giving a colourless solution' },
  ];
  // Ions students most often confuse, used first when choosing wrong options.
  const CAT_CONFUSE = { al: ['zn', 'ca'], zn: ['al', 'ca'], ca: ['al', 'zn'], cr: ['fe2', 'cu'], fe2: ['cr', 'fe3'], fe3: ['fe2', 'cu'], cu: ['cr', 'fe3'], nh4: ['ca', 'al'] };

  const HALIDE_TEST = 'acidify with dilute nitric acid, then add aqueous silver nitrate';
  const ANIONS = [
    { id: 'co3', ion: 'CO<sub>3</sub><sup>2−</sup>', name: 'carbonate', test: 'add dilute acid, then test for carbon dioxide gas', result: 'effervescence, carbon dioxide produced' },
    { id: 'cl', ion: 'Cl<sup>−</sup>', name: 'chloride', test: HALIDE_TEST, result: 'white ppt.' },
    { id: 'br', ion: 'Br<sup>−</sup>', name: 'bromide', test: HALIDE_TEST, result: 'cream ppt.' },
    { id: 'i', ion: 'I<sup>−</sup>', name: 'iodide', test: HALIDE_TEST, result: 'yellow ppt.' },
    { id: 'no3', ion: 'NO<sub>3</sub><sup>−</sup>', name: 'nitrate', test: 'add aqueous sodium hydroxide, then aluminium foil; warm carefully', result: 'ammonia produced' },
    { id: 'so4', ion: 'SO<sub>4</sub><sup>2−</sup>', name: 'sulfate', test: 'acidify with dilute nitric acid, then add aqueous barium nitrate', result: 'white ppt.' },
    { id: 'so3', ion: 'SO<sub>3</sub><sup>2−</sup>', name: 'sulfite', test: 'add a small volume of acidified aqueous potassium manganate(VII)', result: 'the acidified aqueous potassium manganate(VII) changes colour from purple to colourless' },
  ];
  const AN_CONFUSE = { cl: ['br', 'i', 'so4'], br: ['cl', 'i'], i: ['br', 'cl'], so4: ['cl', 'so3'], so3: ['so4', 'co3'], co3: ['so3', 'no3'], no3: ['co3', 'so4'] };
  const GAS_TESTS = [
    'turns damp red litmus paper blue',
    'turns limewater milky',
    'bleaches damp litmus paper',
    '‘pops’ with a lighted splint',
    'relights a glowing splint',
  ];

  const FLAMES = [
    { id: 'li', ion: 'Li<sup>+</sup>', name: 'lithium', colour: 'red' },
    { id: 'na', ion: 'Na<sup>+</sup>', name: 'sodium', colour: 'yellow' },
    { id: 'k', ion: 'K<sup>+</sup>', name: 'potassium', colour: 'lilac' },
    { id: 'ca', ion: 'Ca<sup>2+</sup>', name: 'calcium', colour: 'orange-red' },
    { id: 'ba', ion: 'Ba<sup>2+</sup>', name: 'barium', colour: 'light green' },
    { id: 'cu', ion: 'Cu<sup>2+</sup>', name: 'copper(II)', colour: 'blue-green' },
  ];
  const FL_CONFUSE = { li: ['ca', 'k'], ca: ['li', 'na'], ba: ['cu', 'na'], cu: ['ba', 'li'], na: ['ca', 'li'], k: ['li', 'ba'] };

  const RULES = {
    a: 'Sodium, potassium and ammonium salts are soluble.',
    b: 'Nitrates are soluble.',
    c: 'Chlorides are soluble, except lead and silver.',
    d: 'Sulfates are soluble, except barium, calcium and lead.',
    e: 'Carbonates are insoluble, except sodium, potassium and ammonium.',
    f: 'Hydroxides are insoluble, except sodium, potassium, ammonium and calcium (partially).',
  };
  const S = 'Soluble', I = 'Insoluble', P = 'Partially soluble';
  const COMPOUNDS = [
    ['agcl', 'silver chloride', I, 'c'], ['pbcl2', 'lead(II) chloride', I, 'c'], ['nacl', 'sodium chloride', S, 'a'], ['cucl2', 'copper(II) chloride', S, 'c'],
    ['baso4', 'barium sulfate', I, 'd'], ['caso4', 'calcium sulfate', I, 'd'], ['pbso4', 'lead(II) sulfate', I, 'd'], ['cuso4', 'copper(II) sulfate', S, 'd'], ['znso4', 'zinc sulfate', S, 'd'],
    ['pbno3', 'lead(II) nitrate', S, 'b'], ['agno3', 'silver nitrate', S, 'b'], ['bano3', 'barium nitrate', S, 'b'],
    ['caco3', 'calcium carbonate', I, 'e'], ['cuco3', 'copper(II) carbonate', I, 'e'], ['k2co3', 'potassium carbonate', S, 'e'], ['nh4co3', 'ammonium carbonate', S, 'e'],
    ['feoh3', 'iron(III) hydroxide', I, 'f'], ['cuoh2', 'copper(II) hydroxide', I, 'f'], ['naoh', 'sodium hydroxide', S, 'f'], ['caoh2', 'calcium hydroxide', P, 'f'],
    ['nh4so4', 'ammonium sulfate', S, 'a'],
  ];
  const RULE_QS = [
    ['a', 'Salts of which metals (or ammonium) are always soluble, whatever the negative ion?', 'sodium, potassium and ammonium salts', ['barium, calcium and lead salts', 'lead and silver salts', 'copper(II) and iron(III) salts']],
    ['b', 'Which nitrates are insoluble?', 'none: all nitrates are soluble', ['lead and silver nitrate', 'barium, calcium and lead nitrate', 'all except sodium, potassium and ammonium nitrate']],
    ['c', 'Which chlorides are insoluble?', 'lead and silver chloride', ['barium, calcium and lead chloride', 'all except sodium, potassium and ammonium chloride', 'none: all chlorides are soluble']],
    ['d', 'Which sulfates are insoluble?', 'barium, calcium and lead sulfate', ['lead and silver sulfate', 'all except sodium, potassium and ammonium sulfate', 'none: all sulfates are soluble']],
    ['e', 'Which carbonates are soluble?', 'only sodium, potassium and ammonium carbonate', ['all carbonates', 'all except lead and silver carbonate', 'all except barium, calcium and lead carbonate']],
    ['f', 'Which hydroxides are soluble?', 'sodium, potassium and ammonium hydroxide, with calcium hydroxide partially soluble', ['all hydroxides', 'only sodium hydroxide', 'all except lead and silver hydroxide']],
  ];

  const TOPICS = {
    cat: 'Cation tests',
    an: 'Anion tests',
    fl: 'Flame tests',
    sol: 'Solubility rules',
  };

  /* ── question bank ── */
  const CARDS = [];
  const add = (id, topic, build) => CARDS.push({ id, topic, build });
  const catById = Object.fromEntries(CATIONS.map((c) => [c.id, c]));
  const anById = Object.fromEntries(ANIONS.map((a) => [a.id, a]));
  const flById = Object.fromEntries(FLAMES.map((f) => [f.id, f]));

  const catFact = (c) => `<b>${c.ion}</b> (${c.name}). Aqueous sodium hydroxide: ${c.naoh}. Aqueous ammonia: ${c.nh3 || 'no test'}.`;
  const anFact = (a) => `<b>${a.ion}</b> (${a.name}). Test: ${a.test}. Result: ${a.result}.`;
  const flFact = (f) => `<b>${f.ion}</b> (${f.name}) gives a <b>${f.colour}</b> flame.`;

  for (const c of CATIONS) {
    add(`cat-naoh-${c.id}`, 'cat', () => ({
      prompt: `Aqueous sodium hydroxide is added to a solution containing ${c.ion} (${c.name}) ions, a little at first and then in excess. What is observed?`,
      ...mcq(c.naoh, pickDistinct(c.naoh, prefer(CAT_CONFUSE[c.id], catById, 'naoh'), CATIONS.map((x) => x.naoh))),
      explain: catFact(c),
    }));
    if (c.nh3) {
      add(`cat-nh3-${c.id}`, 'cat', () => ({
        prompt: `Aqueous ammonia is added to a solution containing ${c.ion} (${c.name}) ions, a little at first and then in excess. What is observed?`,
        ...mcq(c.nh3, pickDistinct(c.nh3, prefer(CAT_CONFUSE[c.id], catById, 'nh3'), CATIONS.map((x) => x.nh3).filter(Boolean))),
        explain: catFact(c),
      }));
    }
    add(`cat-id-${c.id}`, 'cat', () => ({
      prompt: `An unknown solution is tested.<br>With aqueous sodium hydroxide: <i>${c.naoh}</i>.<br>With aqueous ammonia: <i>${c.nh3 || 'not tested'}</i>.<br>Which ion is present?`,
      ...mcq(c.ion, pickDistinct(c.ion, (CAT_CONFUSE[c.id] || []).map((id) => catById[id].ion), CATIONS.map((x) => x.ion))),
      explain: catFact(c),
    }));
  }
  add('cat-pair-alzn', 'cat', () => ({
    prompt: 'Al<sup>3+</sup> and Zn<sup>2+</sup> give the same result with aqueous sodium hydroxide. What happens when excess aqueous ammonia is added instead?',
    ...mcq('Al<sup>3+</sup>: white ppt. stays (insoluble in excess). Zn<sup>2+</sup>: white ppt. dissolves (soluble in excess).', [
      'Al<sup>3+</sup>: white ppt. dissolves. Zn<sup>2+</sup>: white ppt. stays.',
      'Both white ppts. dissolve in excess.',
      'Both white ppts. stay in excess.',
    ]),
    explain: `${catFact(catById.al)}<br>${catFact(catById.zn)}`,
  }));
  add('cat-pair-fe', 'cat', () => ({
    prompt: 'How does aqueous sodium hydroxide tell Fe<sup>2+</sup> from Fe<sup>3+</sup>?',
    ...mcq('Fe<sup>2+</sup> gives a green ppt.; Fe<sup>3+</sup> gives a red-brown ppt.', [
      'Fe<sup>2+</sup> gives a red-brown ppt.; Fe<sup>3+</sup> gives a green ppt.',
      'Fe<sup>2+</sup> ppt. dissolves in excess; Fe<sup>3+</sup> ppt. does not.',
      'Both give a green ppt.; only Fe<sup>3+</sup> turns brown on standing.',
    ]),
    explain: `${catFact(catById.fe2)}<br>${catFact(catById.fe3)}`,
  }));
  add('cat-pair-crfe', 'cat', () => ({
    prompt: 'Cr<sup>3+</sup> and Fe<sup>2+</sup> both give a green ppt. with aqueous sodium hydroxide. What tells them apart?',
    ...mcq('In excess sodium hydroxide, the Cr<sup>3+</sup> ppt. dissolves but the Fe<sup>2+</sup> ppt. does not.', [
      'In excess sodium hydroxide, the Fe<sup>2+</sup> ppt. dissolves but the Cr<sup>3+</sup> ppt. does not.',
      'In excess aqueous ammonia, the Fe<sup>2+</sup> ppt. dissolves but the Cr<sup>3+</sup> ppt. does not.',
      'Nothing: they can only be told apart with a flame test.',
    ]),
    explain: `${catFact(catById.cr)}<br>${catFact(catById.fe2)}`,
  }));
  add('cat-pair-white', 'cat', () => ({
    prompt: 'Ca<sup>2+</sup>, Al<sup>3+</sup> and Zn<sup>2+</sup> all give a white ppt. with aqueous sodium hydroxide. Which ppt. does <b>not</b> dissolve in excess?',
    ...mcq('Ca<sup>2+</sup>', ['Al<sup>3+</sup>', 'Zn<sup>2+</sup>', 'All three dissolve']),
    explain: `${catFact(catById.ca)}<br>${catFact(catById.al)}<br>${catFact(catById.zn)}`,
  }));
  add('cat-match-colour', 'cat', () => ({
    type: 'match',
    prompt: 'Match each ion to the colour of the precipitate it forms with aqueous sodium hydroxide.',
    pairs: [['Cu<sup>2+</sup>', 'light blue ppt.'], ['Fe<sup>2+</sup>', 'green ppt.'], ['Fe<sup>3+</sup>', 'red-brown ppt.'], ['Ca<sup>2+</sup>', 'white ppt.']],
    explain: 'Cu<sup>2+</sup> light blue, Fe<sup>2+</sup> green (turns brown near the surface on standing), Fe<sup>3+</sup> red-brown, Ca<sup>2+</sup> white. Cr<sup>3+</sup> is also green, so learn the excess test to tell it from Fe<sup>2+</sup>.',
  }));

  const TESTS = [...new Set(ANIONS.map((a) => a.test))];
  const RESULTS = [...new Set(ANIONS.map((a) => a.result))];
  for (const a of ANIONS.filter((x) => !['br', 'i'].includes(x.id))) {
    const halide = a.id === 'cl';
    add(`an-test-${halide ? 'halide' : a.id}`, 'an', () => ({
      prompt: halide ? 'What is the test for halide ions: chloride, bromide and iodide?' : `What is the test for ${a.name} ions, ${a.ion}?`,
      ...mcq(a.test, pickDistinct(a.test, [], TESTS)),
      explain: halide ? `Test for Cl<sup>−</sup>, Br<sup>−</sup> and I<sup>−</sup>: ${HALIDE_TEST}. Results: white, cream and yellow ppt.` : anFact(a),
    }));
  }
  for (const a of ANIONS) {
    add(`an-res-${a.id}`, 'an', () => ({
      prompt: `Test for ${a.name} ions, ${a.ion}: <i>${a.test}</i>. What is the result if the ion is present?`,
      ...mcq(a.result, pickDistinct(a.result, prefer(AN_CONFUSE[a.id], anById, 'result'), RESULTS)),
      explain: anFact(a),
    }));
    add(`an-id-${a.id}`, 'an', () => ({
      prompt: `A solution is tested: <i>${a.test}</i>.<br>Result: <i>${a.result}</i>.<br>Which ion is present?`,
      ...mcq(a.ion, pickDistinct(a.ion, (AN_CONFUSE[a.id] || []).map((id) => anById[id].ion), ANIONS.map((x) => x.ion))),
      explain: anFact(a),
    }));
  }
  add('an-gas-co2', 'an', () => ({
    prompt: 'In the carbonate test, how do you show the gas given off is carbon dioxide?',
    ...mcq('it turns limewater milky', pickDistinct('turns limewater milky', [], GAS_TESTS).map((x) => `it ${x}`), true),
    explain: 'Carbonate: add dilute acid, then test for carbon dioxide gas. Effervescence; carbon dioxide turns limewater milky.',
  }));
  add('an-gas-nh3', 'an', () => ({
    prompt: 'In the nitrate test, how do you show ammonia is produced?',
    ...mcq('it turns damp red litmus paper blue', pickDistinct('turns damp red litmus paper blue', [], GAS_TESTS).map((x) => `it ${x}`), true),
    explain: 'Nitrate: add aqueous sodium hydroxide, then aluminium foil; warm carefully. Ammonia is produced, which turns damp red litmus paper blue.',
  }));
  add('an-match-halide', 'an', () => ({
    type: 'match',
    prompt: 'After acidifying with dilute nitric acid and adding aqueous silver nitrate, match each halide ion to its result.',
    pairs: [['Cl<sup>−</sup>', 'white ppt.'], ['Br<sup>−</sup>', 'cream ppt.'], ['I<sup>−</sup>', 'yellow ppt.']],
    explain: 'Chloride white, bromide cream, iodide yellow. Sulfate also gives a white ppt., but with aqueous barium nitrate, not silver nitrate.',
  }));

  const COLOURS = FLAMES.map((f) => f.colour);
  for (const f of FLAMES) {
    add(`fl-col-${f.id}`, 'fl', () => ({
      prompt: `What colour flame does ${f.ion} (${f.name}) give in a flame test?`,
      ...mcq(f.colour, pickDistinct(f.colour, (FL_CONFUSE[f.id] || []).map((id) => flById[id].colour), COLOURS)),
      explain: flFact(f),
    }));
    add(`fl-ion-${f.id}`, 'fl', () => ({
      prompt: `A flame test gives a <b>${f.colour}</b> flame. Which ion is present?`,
      ...mcq(f.ion, pickDistinct(f.ion, (FL_CONFUSE[f.id] || []).map((id) => flById[id].ion), FLAMES.map((x) => x.ion))),
      explain: flFact(f),
    }));
  }
  for (const n of [1, 2]) {
    add(`fl-match-${n}`, 'fl', () => {
      const four = shuffle(FLAMES.slice()).slice(0, 4);
      return {
        type: 'match',
        prompt: 'Match each ion to its flame colour.',
        pairs: four.map((f) => [f.ion, f.colour]),
        explain: FLAMES.map((f) => `${f.ion} ${f.colour}`).join(', ') + '.',
      };
    });
  }

  for (const [key, q, right, wrong] of RULE_QS) {
    add(`sol-rule-${key}`, 'sol', () => ({
      prompt: q,
      ...mcq(right, wrong),
      explain: `Rule: ${RULES[key]}`,
    }));
  }
  for (const [id, name, ans, rule] of COMPOUNDS) {
    add(`sol-c-${id}`, 'sol', () => ({
      prompt: `Is <b>${name}</b> soluble in water?`,
      options: [S, I, P].map((o) => ({ html: o, correct: o === ans })),
      explain: `${name.charAt(0).toUpperCase() + name.slice(1)} is <b>${ans.toLowerCase()}</b>. Rule: ${RULES[rule]}`,
    }));
  }

  const BY_ID = Object.fromEntries(CARDS.map((c) => [c.id, c]));

  /* New questions are introduced in an order that mixes the four topics every day. */
  const NEW_ORDER = (() => {
    const lists = Object.keys(TOPICS).map((t) => CARDS.filter((c) => c.topic === t).map((c) => c.id));
    const out = [];
    for (let i = 0; lists.some((l) => i < l.length); i++) for (const l of lists) if (i < l.length) out.push(l[i]);
    return out;
  })();

  /* ── helpers ── */
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function prefer(ids, map, field) { return (ids || []).map((id) => map[id] && map[id][field]).filter(Boolean); }
  function pickDistinct(correct, preferred, pool) {
    const out = [];
    for (const x of preferred) if (x !== correct && !out.includes(x) && out.length < 2) out.push(x);
    for (const x of shuffle([...new Set(pool)])) if (x !== correct && !out.includes(x) && out.length < 3) out.push(x);
    return out;
  }
  function mcq(right, wrong, rightIsFormatted) {
    const opts = [{ html: right, correct: true }, ...wrong.slice(0, 3).map((w) => ({ html: w, correct: false }))];
    return { options: shuffle(opts) };
  }

  return { CARDS, BY_ID, TOPICS, NEW_ORDER, CATIONS, ANIONS, FLAMES, RULES, GAS_TESTS, shuffle };
})();

/* ───────────── scheduling ───────────── */

const QZ_INTERVALS = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };
const QZ_NEW_PER_DAY = 15;
const QZ_MAX_DUE = 40;

function qzRec(id) { return state.quiz[id]; }

function qzIntroducedToday() {
  const t = todayISO();
  return Object.values(state.quiz).filter((r) => r && r.f === t).length;
}

function qzDueToday() {
  const t = todayISO();
  return QZ.CARDS.filter((c) => { const r = qzRec(c.id); return r && r.d <= t; })
    .sort((a, b) => (qzRec(a.id).d.localeCompare(qzRec(b.id).d)) || (qzRec(a.id).b - qzRec(b.id).b))
    .slice(0, QZ_MAX_DUE).map((c) => c.id);
}

function qzNewToday(limit) {
  const n = limit != null ? limit : Math.max(0, QZ_NEW_PER_DAY - qzIntroducedToday());
  return QZ.NEW_ORDER.filter((id) => !qzRec(id)).slice(0, n);
}

function qzTodayQueue() {
  return QZ.shuffle(qzDueToday()).concat(qzNewToday());
}

function qzGrade(id, correct) {
  const t = todayISO();
  const r = qzRec(id) || { b: 0, f: t, r: 0, w: 0 };
  const b = correct ? Math.min(5, (r.b || 0) + 1) : 1;
  setRec(`q/${id}`, { b, d: addDays(t, QZ_INTERVALS[b]), f: r.f || t, r: (r.r || 0) + (correct ? 1 : 0), w: (r.w || 0) + (correct ? 0 : 1), l: t });
  const day = state.qdays[t] || { n: 0, c: 0, done: false };
  const left = qzTodayQueue().length;
  setRec(`qd/${t}`, { n: day.n + 1, c: day.c + (correct ? 1 : 0), done: day.done || left === 0 });
}

function qzStreak() {
  let n = 0;
  let d = todayISO();
  if (!(state.qdays[d] && state.qdays[d].done)) d = addDays(d, -1);
  while (state.qdays[d] && state.qdays[d].done) { n++; d = addDays(d, -1); }
  return n;
}

function qzMastery(topic) {
  const cards = QZ.CARDS.filter((c) => c.topic === topic);
  const secure = cards.filter((c) => { const r = qzRec(c.id); return r && r.b >= 3; }).length;
  const seen = cards.filter((c) => qzRec(c.id)).length;
  return { total: cards.length, secure, seen };
}

/* ───────────── rendering ───────────── */

const CHEM_HUE = 20;

function quizStatsHTML() {
  const left = qzTodayQueue().length;
  const today = state.qdays[todayISO()];
  const streak = qzStreak();
  const doneToday = today && today.done && left === 0;
  const anySeen = Object.keys(state.quiz).length > 0;
  const body = doneToday
    ? `<p class="qz-mini-t"><b>Done for today.</b> ${today.c} of ${today.n} right.</p>`
    : `<p class="qz-mini-t"><b>${left} question${left === 1 ? '' : 's'}</b> waiting today${anySeen ? '' : ', starting with the basics'}.</p>`;
  return `<section class="block qz-mini">
    <div class="block-h"><h2 class="h">Chemistry quiz</h2><span class="qz-streak">${streak ? `${streak}-day streak` : 'No streak yet'}</span></div>
    ${body}
    <div class="qz-bars">${Object.entries(QZ.TOPICS).map(([t, name]) => { const m = qzMastery(t); return `<div><span>${name}</span><span class="tp-bar"><i style="width:${(m.secure / m.total) * 100}%;background:hsl(${CHEM_HUE} 60% 50%)"></i></span></div>`; }).join('')}</div>
    <button class="btn ${doneToday ? '' : 'primary'}" data-act="${doneToday ? 'go' : 'qz-start'}" data-tab="quiz">${doneToday ? 'Open quiz' : (today && today.n ? 'Continue today’s quiz' : 'Start today’s quiz')}</button>
  </section>`;
}

function renderQuiz() {
  const el = $('#v-quiz');
  const Q = ui.qz;
  if (Q && Q.active) { el.innerHTML = qzSessionHTML(Q); return; }
  if (Q && Q.finished) { el.innerHTML = qzDoneHTML(Q); return; }
  const left = qzTodayQueue().length;
  const due = qzDueToday().length, fresh = qzNewToday().length;
  const today = state.qdays[todayISO()];
  const streak = qzStreak();
  const unseen = QZ.CARDS.filter((c) => !qzRec(c.id)).length;
  const last14 = [...Array(14)].map((_, i) => addDays(todayISO(), i - 13));
  el.innerHTML = `
    <div class="view-head"><h2 class="h">Chemistry quiz</h2></div>
    <p class="fine">Cation tests, anion tests, flame tests and solubility rules, using the wording in Cambridge’s 0620 syllabus. “ppt.” means precipitate, as in the exam.</p>
    <section class="block qz-today">
      ${left
        ? `<p class="qz-big"><b>${left}</b> question${left === 1 ? '' : 's'} today</p><p class="fine">${due ? `${due} to review` : 'Nothing to review yet'}${fresh ? `, ${fresh} new` : ''}. About ${Math.max(2, Math.round(left * 0.3))} minutes.</p>
           <div class="btn-row"><button class="btn primary" data-act="qz-start">${today && today.n ? 'Continue today’s quiz' : 'Start today’s quiz'}</button><button class="btn" data-act="qz-sheet">Cheat sheet</button></div>`
        : `<p class="qz-big"><b>Done</b> for today</p><p class="fine">${today ? `${today.c} of ${today.n} right today. ` : ''}${unseen ? `${unseen} questions you haven’t seen yet.` : 'You’ve seen every question.'}</p>
           <div class="btn-row"><button class="btn" data-act="qz-more">Practise 10 more</button><button class="btn" data-act="qz-sheet">Cheat sheet</button></div>`}
      <div class="qz-streakrow"><span class="qz-streak">${streak ? `${streak}-day streak` : 'Finish today’s quiz to start a streak'}</span>
        <span class="qz-days" aria-label="Last 14 days">${last14.map((d) => { const r = state.qdays[d]; return `<i class="${r && r.done ? 'on' : r && r.n ? 'part' : ''}${d === todayISO() ? ' today' : ''}" title="${fmtDate(d)}${r ? `: ${r.c}/${r.n}` : ''}"></i>`; }).join('')}</span></div>
    </section>
    <section class="block">
      <h3 class="h">How well you know each topic</h3>
      <p class="fine">“Secure” means answered right at least three times in a row, with days in between.</p>
      <ul class="tpapers">${Object.entries(QZ.TOPICS).map(([t, name]) => { const m = qzMastery(t); return `<li><span>${name}</span><span class="tp-bar" aria-hidden="true"><i style="width:${(m.secure / m.total) * 100}%;background:hsl(${CHEM_HUE} 60% 50%)"></i></span><span class="tp-n"><b>${m.secure}</b>/${m.total}</span></li>`; }).join('')}</ul>
    </section>
    <section class="block qz-sheetcard">
      <div><h3 class="h">Cheat sheet</h3><p class="fine">All four tables, word for word from the syllabus. Read it before your first quiz.</p></div>
      <button class="btn" data-act="qz-sheet">Open cheat sheet</button>
    </section>`;
}

const FLAME_SWATCH = { li: '#d8312c', na: '#f2c21b', k: '#b48ad8', ca: '#f0743a', ba: '#9bd56b', cu: '#2fb5a2' };

function qzSheetHTML() {
  return `<div class="qz-sheet">
    <nav class="qz-jump" aria-label="Jump to">
      <button data-act="qz-jump" data-to="qzs-cat">Cations</button><button data-act="qz-jump" data-to="qzs-an">Anions</button><button data-act="qz-jump" data-to="qzs-fl">Flame tests</button><button data-act="qz-jump" data-to="qzs-sol">Solubility</button>
    </nav>
    <h4 id="qzs-cat">Tests for aqueous cations</h4>
    <ul class="qz-list">${QZ.CATIONS.map((c) => `<li>
      <p class="qz-ion">${c.ion} <small>${c.name}</small></p>
      <dl><dt>Aqueous sodium hydroxide</dt><dd>${c.naoh}</dd><dt>Aqueous ammonia</dt><dd>${c.nh3 || '–'}</dd></dl>
    </li>`).join('')}</ul>
    <h4 id="qzs-an">Tests for anions</h4>
    <ul class="qz-list">${QZ.ANIONS.map((a) => `<li>
      <p class="qz-ion">${a.ion} <small>${a.name}</small></p>
      <dl><dt>Test</dt><dd>${a.test}</dd><dt>Result</dt><dd>${a.result}</dd></dl>
    </li>`).join('')}</ul>
    <p class="fine">Gas tests used above: carbon dioxide turns limewater milky; ammonia turns damp red litmus paper blue.</p>
    <h4 id="qzs-fl">Flame tests</h4>
    <ul class="qz-flames">${QZ.FLAMES.map((f) => `<li><i style="background:${FLAME_SWATCH[f.id]}" aria-hidden="true"></i><span class="qz-ion">${f.ion} <small>${f.name}</small></span><b>${f.colour}</b></li>`).join('')}</ul>
    <p class="fine">The colour dots are only a memory aid. In the exam, use the colour words exactly as listed.</p>
    <h4 id="qzs-sol">Solubility rules for salts</h4>
    <ol class="qz-rules">${Object.values(QZ.RULES).map((r) => `<li>${r}</li>`).join('')}</ol>
  </div>`;
}

function qzSheetModalHTML() {
  return `<div class="sheet-h"><h2 id="sheetTitle">Cheat sheet</h2><button class="icon-btn" data-act="sheet-close" aria-label="Close">×</button></div>
    <p class="fine">From the Cambridge IGCSE Chemistry 0620 syllabus, 2026–2028. “ppt.” means precipitate.</p>
    ${qzSheetHTML()}
    <div class="sheet-f"><button class="btn" data-act="sheet-close">Close</button></div>`;
}

function qzSessionHTML(Q) {
  const item = Q.queue[Q.i];
  const q = Q.q;
  const total = Q.queue.length;
  const pct = (Q.i / total) * 100;
  let body;
  if (q.type === 'match') {
    const m = Q.match;
    body = `<div class="qz-match">
      <div class="qz-col">${m.left.map((L, i) => `<button class="qz-m${m.done.includes(i) ? ' ok' : ''}${m.sel === i ? ' sel' : ''}${m.bad && m.bad[0] === i ? ' bad' : ''}" data-act="qz-ml" data-i="${i}" ${m.done.includes(i) ? 'disabled' : ''}>${L}</button>`).join('')}</div>
      <div class="qz-col">${m.right.map((R, j) => { const usedBy = m.done.find((i) => m.answer[i] === j); return `<button class="qz-m${usedBy != null ? ' ok' : ''}${m.bad && m.bad[1] === j ? ' bad' : ''}" data-act="qz-mr" data-j="${j}" ${usedBy != null ? 'disabled' : ''}>${R}</button>`; }).join('')}</div>
    </div>
    ${Q.answered ? `<div class="qz-fb ${m.mistakes ? 'wrong' : 'right'}"><b>${m.mistakes ? `Matched with ${m.mistakes} mistake${m.mistakes === 1 ? '' : 's'}` : 'All matched first time'}</b><p>${q.explain}</p></div>` : `<p class="fine">Tap an item on the left, then its match on the right.</p>`}`;
  } else {
    body = `<div class="qz-opts">${q.options.map((o, i) => {
      let cls = 'qz-opt';
      if (Q.answered) { if (o.correct) cls += ' right'; else if (i === Q.picked) cls += ' wrong'; }
      return `<button class="${cls}" data-act="qz-pick" data-i="${i}" ${Q.answered ? 'disabled' : ''}>${o.html}</button>`;
    }).join('')}</div>
    ${Q.answered ? `<div class="qz-fb ${q.options[Q.picked].correct ? 'right' : 'wrong'}"><b>${q.options[Q.picked].correct ? 'Correct' : 'Not quite'}</b><p>${q.explain}</p></div>` : ''}`;
  }
  return `<div class="qz-top">
      <button class="link" data-act="qz-stop">Stop for now</button>
      <button class="link" data-act="qz-sheet">Cheat sheet</button>
      <span class="qz-prog" aria-hidden="true"><i style="width:${pct}%"></i></span>
      <span class="qz-count">${Q.i + 1} of ${total}</span>
    </div>
    <section class="block qz-card">
      <p class="qz-topic">${QZ.TOPICS[QZ.BY_ID[item.id].topic]}${item.relearn ? ' · one more try' : ''}${!qzRec(item.id) && !item.relearn ? ' · new' : ''}</p>
      <h3 class="qz-q">${q.prompt}</h3>
      ${body}
      ${Q.answered ? `<button class="btn primary qz-next" data-act="qz-next">${Q.i + 1 < total ? 'Next' : 'Finish'}</button>` : ''}
    </section>`;
}

function qzDoneHTML(Q) {
  const right = Q.results.filter((r) => r.correct).length;
  const wrong = Q.results.filter((r) => !r.correct);
  const streak = qzStreak();
  const left = qzTodayQueue().length;
  return `<div class="view-head"><h2 class="h">Chemistry quiz</h2></div>
    <section class="block qz-today">
      <p class="qz-big"><b>${right}</b> of ${Q.results.length} right</p>
      <p class="fine">${left ? `${left} still to do today.` : `Today’s quiz is done.${streak ? ` ${streak}-day streak.` : ''}`} Questions you missed come back tomorrow.</p>
      <div class="btn-row">${left ? '<button class="btn primary" data-act="qz-start">Keep going</button>' : '<button class="btn" data-act="qz-more">Practise 10 more</button>'}<button class="btn" data-act="qz-home">Back to quiz home</button></div>
    </section>
    ${wrong.length ? `<section class="block"><h3 class="h">Worth another look</h3><ul class="qz-review">${wrong.map((r) => `<li><p>${r.prompt}</p><p class="qz-ans">${r.explain}</p></li>`).join('')}</ul></section>` : ''}`;
}

/* ───────────── session control ───────────── */

function qzBuild(item) {
  const card = QZ.BY_ID[item.id];
  const q = card.build();
  ui.qz.q = q;
  ui.qz.answered = false;
  ui.qz.picked = null;
  if (q.type === 'match') {
    const order = QZ.shuffle(q.pairs.map((_, i) => i));
    ui.qz.match = {
      left: q.pairs.map((p) => p[0]),
      right: order.map((i) => q.pairs[i][1]),
      answer: q.pairs.map((_, i) => order.indexOf(i)),
      done: [], sel: null, mistakes: 0, bad: null,
    };
  }
}

function qzStart(queueIds) {
  const ids = queueIds || qzTodayQueue();
  if (!ids.length) { toast('Nothing left for today. Practise more if you like.'); render(); return; }
  ui.qz = { active: true, queue: ids.map((id) => ({ id })), i: 0, results: [] };
  qzBuild(ui.qz.queue[0]);
  go('quiz');
}

function qzAnswer(correct) {
  const Q = ui.qz;
  const item = Q.queue[Q.i];
  Q.answered = true;
  if (!item.relearn) {
    qzGrade(item.id, correct);
    Q.results.push({ id: item.id, correct, prompt: Q.q.prompt, explain: Q.q.explain });
    if (!correct) Q.queue.push({ id: item.id, relearn: true });
    commit({ noRender: true });
  }
  renderQuiz();
  renderChrome();
  const next = document.querySelector('.qz-next');
  if (next) next.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

function quizClick(el, act, d) {
  const Q = ui.qz;
  switch (act) {
    case 'qz-start': qzStart(); break;
    case 'qz-more': {
      const fresh = qzNewToday(10);
      const pool = fresh.length >= 10 ? fresh : fresh.concat(QZ.shuffle(QZ.CARDS.map((c) => c.id).filter((id) => !fresh.includes(id)))
        .sort((a, b) => ((qzRec(a) || {}).b || 0) - ((qzRec(b) || {}).b || 0)).slice(0, 10 - fresh.length));
      qzStart(QZ.shuffle(pool));
      break;
    }
    case 'qz-pick':
      if (!Q || Q.answered) return;
      Q.picked = Number(d.i);
      qzAnswer(!!Q.q.options[Q.picked].correct);
      break;
    case 'qz-ml':
      if (!Q || Q.answered) return;
      Q.match.sel = Number(d.i); Q.match.bad = null;
      renderQuiz();
      break;
    case 'qz-mr': {
      if (!Q || Q.answered || Q.match.sel == null) return;
      const m = Q.match, j = Number(d.j);
      if (m.answer[m.sel] === j) {
        m.done.push(m.sel); m.sel = null; m.bad = null;
        if (m.done.length === m.left.length) { qzAnswer(m.mistakes === 0); return; }
      } else {
        m.mistakes++; m.bad = [m.sel, j];
      }
      renderQuiz();
      break;
    }
    case 'qz-next':
      if (!Q) return;
      Q.i++;
      if (Q.i >= Q.queue.length) { ui.qz = { finished: true, results: Q.results }; render(); window.scrollTo({ top: 0 }); return; }
      qzBuild(Q.queue[Q.i]);
      renderQuiz();
      document.getElementById('v-quiz').scrollIntoView({ block: 'start' });
      break;
    case 'qz-stop':
      ui.qz = Q && Q.results.length ? { finished: true, results: Q.results } : null;
      render();
      break;
    case 'qz-home': ui.qz = null; render(); break;
    case 'qz-sheet': ui.sheet = { kind: 'qzsheet' }; renderSheet(); break;
    case 'qz-jump': {
      const t = document.getElementById(d.to);
      if (t) t.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      break;
    }
    default: break;
  }
}
