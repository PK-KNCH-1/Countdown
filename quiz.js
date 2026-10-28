/* Countdown — daily recall quiz and written definitions.

   Where the questions come from: the revision notes (Physics 0625, Chemistry 0620, Biology 0610,
   International Maths 0607). qn-phys.js, qn-chem.js, qn-bio.js and qn-maths.js are generated from those
   notes and register themselves with QZ.load(). This file holds the engine, the Chemistry tests deck
   (cation, anion and flame tests and the solubility rules, asked with pictures) and the written-definitions
   section. qz-econ.js adds the Economics definitions.

   Most cards are recall cards: read the question, answer it in your head or on paper, reveal the answer
   and mark yourself — knew it, partly, or didn't know. Scheduling is a Leitner system: each card sits in a
   box 1–5. "Knew it" moves it up a box and further away (1, 3, 7, 14, 30 days); "partly" keeps its box and
   brings it back sooner; "didn't know" sends it to box 1 for tomorrow and repeats it once at the end of
   today's session. Definitions are written on paper, then marked the same three ways.

   Progress is stored as records q/<card or definition id> = { b box, d due date, f first seen, r right,
   p partly, w wrong, l last seen, g last mark 2/1/0 } and qd/<date> = { n, c, p, done }, so it syncs. */

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

  /* Subjects in the quiz, in the order they're shown. Names and colours come from data.js (SUBJ). */
  const SUBJ_ORDER = ['phys', 'chem', 'bio', 'maths', 'econ'];
  const SYLLABUS = {
    chem: 'your Chemistry 0620 notes (2026–2028 syllabus)',
    phys: 'your Physics 0625 notes (2026–2028 syllabus)',
    bio: 'your Biology 0610 notes (2026–2028 syllabus)',
    maths: 'your International Maths 0607 notes (2025–2027 syllabus)',
    econ: 'the Cambridge IGCSE Economics 0455 syllabus, 2027–2029',
  };
  const TOPICS = {}; // topic id -> { name, s, hint }
  const CHAPTERS = {}; // subject -> { chapter number: [label, title] }
  function addTopics(s, map) {
    for (const [t, v] of Object.entries(map)) TOPICS[t] = typeof v === 'string' ? { name: v, s } : { ...v, s };
  }
  addTopics('chem', {
    cat: { name: 'Cation tests (pictures)', hint: 'Choose the answer' },
    an: { name: 'Anion tests (pictures)', hint: 'Choose the answer' },
    fl: { name: 'Flame tests', hint: 'Choose the answer' },
    sol: { name: 'Solubility rules', hint: 'Choose the answer' },
  });

  /* ── question bank ── */
  const CARDS = [];
  const BY_ID = {};
  function addCard(id, topic, build, extra) {
    if (BY_ID[id]) throw new Error(`Duplicate quiz card ${id}`);
    if (!TOPICS[topic]) throw new Error(`Unknown quiz topic ${topic}`);
    const c = { id, topic, s: TOPICS[topic].s, build, ch: 0, ...extra };
    CARDS.push(c);
    BY_ID[id] = c;
    return c;
  }
  // The picture deck belongs with Chemistry chapter 22, Chemical analysis.
  const add = (id, topic, build) => addCard(id, topic, build, { ch: 22 });
  const catById = Object.fromEntries(CATIONS.map((c) => [c.id, c]));
  const anById = Object.fromEntries(ANIONS.map((a) => [a.id, a]));
  const flById = Object.fromEntries(FLAMES.map((f) => [f.id, f]));

  /* ── picture language ──
     Stripes = the solid stays (precipitate insoluble in excess, or an insoluble salt).
       Diagonal stripes for aqueous sodium hydroxide, horizontal for aqueous ammonia.
     Coloured border with a clear middle = a precipitate formed and then dissolved in excess
       (or a soluble salt). A filled middle is the colour of the solution left behind.
     Dashed outline = no precipitate. Bubbles = a gas is given off. */
  const PC = { white: '#f2f2ee', cream: '#e9d7a2', yellow: '#f1cf2f', green: '#56b04f', lightblue: '#8fd0f5', redbrown: '#c0592f', darkblue: '#2f55e0', brown: '#8a5a2b', purple: '#a24fd0' };
  const CAT_VIS = {
    al: { naoh: { k: 'dissolve', p: 'white' }, nh3: { k: 'stay', p: 'white' } },
    nh4: { naoh: { k: 'gas', g: 'NH<sub>3</sub>' }, nh3: null },
    ca: { naoh: { k: 'stay', p: 'white' }, nh3: { k: 'none' } },
    cr: { naoh: { k: 'dissolve', p: 'green' }, nh3: { k: 'stay', p: 'green' } },
    cu: { naoh: { k: 'stay', p: 'lightblue' }, nh3: { k: 'dissolve', p: 'lightblue', s: 'darkblue' } },
    fe2: { naoh: { k: 'stay', p: 'green', top: 'brown' }, nh3: { k: 'stay', p: 'green', top: 'brown' } },
    fe3: { naoh: { k: 'stay', p: 'redbrown' }, nh3: { k: 'stay', p: 'redbrown' } },
    zn: { naoh: { k: 'dissolve', p: 'white' }, nh3: { k: 'dissolve', p: 'white' } },
  };
  const AN_VIS = {
    co3: { v: { k: 'gas', g: 'CO<sub>2</sub>' }, tag: 'dilute acid', cap: 'fizzes: CO<sub>2</sub>' },
    cl: { v: { k: 'stay', p: 'white' }, tag: 'AgNO<sub>3</sub>', cap: 'white ppt.' },
    br: { v: { k: 'stay', p: 'cream' }, tag: 'AgNO<sub>3</sub>', cap: 'cream ppt.' },
    i: { v: { k: 'stay', p: 'yellow' }, tag: 'AgNO<sub>3</sub>', cap: 'yellow ppt.' },
    no3: { v: { k: 'gas', g: 'NH<sub>3</sub>' }, tag: 'NaOH + Al foil', cap: 'NH<sub>3</sub> gas' },
    so4: { v: { k: 'stay', p: 'white' }, tag: 'Ba(NO<sub>3</sub>)<sub>2</sub>', cap: 'white ppt.' },
    so3: { v: { k: 'decolour', p: 'purple' }, tag: 'acidified KMnO<sub>4</sub>', cap: 'purple → colourless' },
  };
  const FL_HEX = { li: '#d8312c', na: '#f2c21b', k: '#b48ad8', ca: '#f0743a', ba: '#9bd56b', cu: '#2fb5a2' };

  function tube(v, reagent, size) {
    const sz = size ? ` qzv-${size}` : '';
    if (!v) return `<span class="qzv-tube qzv-blank${sz}" role="img" aria-label="no test"></span>`;
    const st = [];
    if (v.p) st.push(`--pc:${PC[v.p]}`);
    if (v.s) st.push(`--sc:${PC[v.s]}`);
    if (v.top) st.push(`--tc:${PC[v.top]}`);
    const cls = ['qzv-tube', `qzv-${v.k}`, reagent ? `qzv-${reagent}` : 'qzv-gen', v.s ? 'qzv-sol' : '', v.top ? 'qzv-top' : ''].filter(Boolean).join(' ') + sz;
    let inner = '';
    if (v.k === 'gas') inner = '<svg viewBox="0 0 64 40" aria-hidden="true"><circle cx="14" cy="28" r="4"/><circle cx="26" cy="18" r="3"/><circle cx="38" cy="27" r="5"/><circle cx="50" cy="15" r="3.5"/><circle cx="22" cy="8" r="2.5"/><circle cx="44" cy="6" r="2"/></svg>';
    if (v.k === 'decolour') inner = '<b aria-hidden="true">→</b>';
    const aria = { stay: 'precipitate stays', dissolve: v.s ? 'precipitate dissolves, coloured solution' : 'precipitate dissolves', none: 'no precipitate', gas: 'gas given off', decolour: 'colour disappears', part: 'partially soluble' }[v.k];
    return `<span class="${cls}" style="${st.join(';')}" role="img" aria-label="${aria}">${inner}</span>`;
  }
  function tubeCap(v) {
    if (!v) return 'no test';
    if (v.k === 'stay') return v.top ? 'stays, browns on top' : 'ppt. stays';
    if (v.k === 'dissolve') return v.s ? 'dissolves: dark blue' : 'dissolves';
    if (v.k === 'none') return 'no ppt.';
    if (v.k === 'gas') return `${v.g} gas`;
    return '';
  }
  function catVisual(c) {
    const V = CAT_VIS[c.id];
    const fig = (v, r, tag) => `<figure class="qzv-fig"><figcaption class="qzv-tag qzv-tag-${r}">${tag}</figcaption>${tube(v, r)}<span class="qzv-cap">${tubeCap(v)}</span></figure>`;
    return `<div class="qzv-pair">${fig(V.naoh, 'naoh', 'NaOH')}${fig(V.nh3, 'nh3', 'NH<sub>3</sub>')}</div>`;
  }
  function anVisual(a) {
    const V = AN_VIS[a.id];
    return `<div class="qzv-pair"><figure class="qzv-fig"><figcaption class="qzv-tag">${V.tag}</figcaption>${tube(V.v, null)}<span class="qzv-cap">${V.cap}</span></figure></div>`;
  }
  const SOL_COLS = [['nak', 'Na<sup>+</sup> K<sup>+</sup><br>NH<sub>4</sub><sup>+</sup>'], ['ag', 'Ag<sup>+</sup>'], ['pb', 'Pb<sup>2+</sup>'], ['ba', 'Ba<sup>2+</sup>'], ['ca', 'Ca<sup>2+</sup>'], ['oth', 'most<br>others']];
  // S soluble, I insoluble, P partially soluble, '' not covered by the six rules
  const SOL_GRID = [
    ['b', 'Nitrates', 'NO<sub>3</sub><sup>−</sup>', ['S', 'S', 'S', 'S', 'S', 'S']],
    ['c', 'Chlorides', 'Cl<sup>−</sup>', ['S', 'I', 'I', 'S', 'S', 'S']],
    ['d', 'Sulfates', 'SO<sub>4</sub><sup>2−</sup>', ['S', '', 'I', 'I', 'I', 'S']],
    ['e', 'Carbonates', 'CO<sub>3</sub><sup>2−</sup>', ['S', 'I', 'I', 'I', 'I', 'I']],
    ['f', 'Hydroxides', 'OH<sup>−</sup>', ['S', '', 'I', '', 'P', 'I']],
  ];
  function solCell(x) {
    if (x === 'S') return tube({ k: 'dissolve', p: 'white' }, null, 'sm');
    if (x === 'I') return tube({ k: 'stay', p: 'white' }, null, 'sm');
    if (x === 'P') return tube({ k: 'part', p: 'white' }, null, 'sm');
    return '<span class="qzv-dash" aria-label="not covered">–</span>';
  }
  function solGridHTML(highlightRow) {
    return `<div class="ov-wrap qzv-gridwrap"><table class="qzv-grid"><thead><tr><th></th>${SOL_COLS.map(([, h]) => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>
      ${SOL_GRID.map(([key, name, ion, cells]) => `<tr class="${highlightRow === key ? 'hl' : ''}"><th scope="row">${name}<small>${ion}</small></th>${cells.map((x, i) => `<td class="${highlightRow === 'a' && i === 0 ? 'hl' : ''}">${solCell(x)}</td>`).join('')}</tr>`).join('')}
    </tbody></table></div>`;
  }
  function legendHTML(kind) {
    const item = (t, label) => `<li>${t}<span>${label}</span></li>`;
    if (kind === 'sol') {
      return `<ul class="qzv-legend">${item(tube({ k: 'dissolve', p: 'white' }, null, 'sm'), 'soluble')}${item(tube({ k: 'stay', p: 'white' }, null, 'sm'), 'insoluble')}${item(tube({ k: 'part', p: 'white' }, null, 'sm'), 'partially soluble')}${item('<span class="qzv-dash">–</span>', 'not in the rules')}</ul>`;
    }
    return `<ul class="qzv-legend">
      ${item(tube({ k: 'stay', p: 'white' }, 'naoh', 'sm'), 'ppt. stays in excess NaOH')}
      ${item(tube({ k: 'stay', p: 'white' }, 'nh3', 'sm'), 'ppt. stays in excess NH<sub>3</sub>')}
      ${item(tube({ k: 'dissolve', p: 'white' }, null, 'sm'), 'ppt. dissolves in excess')}
      ${item(tube({ k: 'dissolve', p: 'lightblue', s: 'darkblue' }, null, 'sm'), 'filled: colour of the solution')}
      ${item(tube({ k: 'none' }, null, 'sm'), 'no ppt.')}
      ${item(tube({ k: 'gas', g: '' }, null, 'sm'), 'gas given off')}
    </ul>`;
  }

  const catFact = (c) => `<div class="qzv-fact"><div class="qzv-txt"><b>${c.ion}</b> (${c.name}). Aqueous sodium hydroxide: ${c.naoh}. Aqueous ammonia: ${c.nh3 || 'no test'}.</div>${catVisual(c)}</div>`;
  const anFact = (a) => `<div class="qzv-fact"><div class="qzv-txt"><b>${a.ion}</b> (${a.name}). Test: ${a.test}. Result: ${a.result}.</div>${anVisual(a)}</div>`;
  const flFact = (f) => `<div class="qzv-fact"><div class="qzv-txt"><b>${f.ion}</b> (${f.name}) gives a <b>${f.colour}</b> flame.</div><span class="qzv-flame qzv-flame-lg" style="--fc:${FL_HEX[f.id]}" aria-hidden="true"></span></div>`;

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
    explain: `${catFact(catById.al)}${catFact(catById.zn)}`,
  }));
  add('cat-pair-fe', 'cat', () => ({
    prompt: 'How does aqueous sodium hydroxide tell Fe<sup>2+</sup> from Fe<sup>3+</sup>?',
    ...mcq('Fe<sup>2+</sup> gives a green ppt.; Fe<sup>3+</sup> gives a red-brown ppt.', [
      'Fe<sup>2+</sup> gives a red-brown ppt.; Fe<sup>3+</sup> gives a green ppt.',
      'Fe<sup>2+</sup> ppt. dissolves in excess; Fe<sup>3+</sup> ppt. does not.',
      'Both give a green ppt.; only Fe<sup>3+</sup> turns brown on standing.',
    ]),
    explain: `${catFact(catById.fe2)}${catFact(catById.fe3)}`,
  }));
  add('cat-pair-crfe', 'cat', () => ({
    prompt: 'Cr<sup>3+</sup> and Fe<sup>2+</sup> both give a green ppt. with aqueous sodium hydroxide. What tells them apart?',
    ...mcq('In excess sodium hydroxide, the Cr<sup>3+</sup> ppt. dissolves but the Fe<sup>2+</sup> ppt. does not.', [
      'In excess sodium hydroxide, the Fe<sup>2+</sup> ppt. dissolves but the Cr<sup>3+</sup> ppt. does not.',
      'In excess aqueous ammonia, the Fe<sup>2+</sup> ppt. dissolves but the Cr<sup>3+</sup> ppt. does not.',
      'Nothing: they can only be told apart with a flame test.',
    ]),
    explain: `${catFact(catById.cr)}${catFact(catById.fe2)}`,
  }));
  add('cat-pair-white', 'cat', () => ({
    prompt: 'Ca<sup>2+</sup>, Al<sup>3+</sup> and Zn<sup>2+</sup> all give a white ppt. with aqueous sodium hydroxide. Which ppt. does <b>not</b> dissolve in excess?',
    ...mcq('Ca<sup>2+</sup>', ['Al<sup>3+</sup>', 'Zn<sup>2+</sup>', 'All three dissolve']),
    explain: `${catFact(catById.ca)}${catFact(catById.al)}${catFact(catById.zn)}`,
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
      explain: `Rule: ${RULES[key]}${solGridHTML(key)}`,
    }));
  }
  for (const [id, name, ans, rule] of COMPOUNDS) {
    add(`sol-c-${id}`, 'sol', () => ({
      prompt: `Is <b>${name}</b> soluble in water?`,
      options: [S, I, P].map((o) => ({ html: o, correct: o === ans })),
      explain: `<div class="qzv-fact"><div class="qzv-txt">${name.charAt(0).toUpperCase() + name.slice(1)} is <b>${ans.toLowerCase()}</b>. Rule: ${RULES[rule]}</div>${tube({ k: ans === S ? 'dissolve' : ans === I ? 'stay' : 'part', p: 'white' }, null)}</div>`,
    }));
  }

  /* ── decks generated from the revision notes ──
     data = { chapters: { n: [label, title] }, topics: { id: [name, hint] },
              cards: [[id, topic, chapter, question html, answer html, ext, hint]],
              defs: [[id, chapter, term html, definition html, note html, ext]] } */
  function load(s, data) {
    CHAPTERS[s] = { ...(CHAPTERS[s] || {}), ...data.chapters };
    for (const [t, [name, hint]] of Object.entries(data.topics)) TOPICS[t] = { name, hint, s };
    for (const [id, topic, ch, q, a, ext, hint] of data.cards) {
      const c = addCard(id, topic, null, { ch, ext: !!ext });
      c.build = () => ({ type: 'recall', prompt: q, hint: hint || TOPICS[topic].hint || 'Recall', answer: a, explain: a });
    }
    for (const [id, ch, term, def, note, ext] of data.defs) addDef({ id, s, ch, term, def, note, ext: !!ext });
  }

  /* ── definitions to write out by hand ── */
  const DEFS = [];
  const DEF_BY_ID = {};
  function addDef(d) {
    if (DEF_BY_ID[d.id] || BY_ID[d.id]) throw new Error(`Duplicate definition ${d.id}`);
    DEFS.push(d);
    DEF_BY_ID[d.id] = d;
  }
  const defsOf = (s) => DEFS.filter((d) => d.s === s);
  const boldDef = (t) => t.replace(/\{([^}]+)\}/g, '<b>$1</b>');
  const plainDef = (t) => t.replace(/[{}]/g, '');
  const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  /* Economics (qz-econ.js) writes its definitions with key words in braces; each topic acts as a chapter. */
  function defs(s, topic, list) {
    const chs = CHAPTERS[s] || (CHAPTERS[s] = {});
    if (!chs[topic]) chs[topic] = [String(Object.keys(chs).length + 1), TOPICS[topic].name.replace(/^Definitions: /, '')];
    for (const d of list) {
      addDef({ id: d.id, s, ch: topic, term: d.term.replace(/:$/, ''), def: `<p>${cap(boldDef(d.text))}.</p>`, note: d.note ? `<p>${d.note}</p>` : '', ext: false });
    }
  }

  /* Chapters of a subject in order (numbers first, in number order; then named ones in the order added). */
  function chaptersOf(s) {
    const chs = CHAPTERS[s] || {};
    return Object.keys(chs).map((k) => (/^\d+$/.test(k) ? Number(k) : k));
  }
  const chLabel = (s, ch) => { const c = (CHAPTERS[s] || {})[ch]; return c ? c[0] : String(ch); };
  const chTitle = (s, ch) => { const c = (CHAPTERS[s] || {})[ch]; return c ? c[1] : ''; };

  /* The order new cards are introduced in, per subject: chapter by chapter, and inside a chapter the
     content types take turns (a formula, a key point, a difference…), so a session never drags. */
  const roundRobin = (lists) => {
    const out = [];
    for (let i = 0; lists.some((l) => i < l.length); i++) for (const l of lists) if (i < l.length) out.push(l[i]);
    return out;
  };
  const ORDER = {};
  function subjectOrder(s) {
    if (ORDER[s]) return ORDER[s];
    const out = [];
    for (const ch of chaptersOf(s)) {
      const inCh = CARDS.filter((c) => c.s === s && c.ch === ch);
      const topics = [...new Set(inCh.map((c) => c.topic))];
      out.push(...roundRobin(topics.map((t) => inCh.filter((c) => c.topic === t).map((c) => c.id))));
    }
    for (const c of CARDS) if (c.s === s && !out.includes(c.id)) out.push(c.id);
    return (ORDER[s] = out);
  }

  /* ── helpers ── */
  const fr = (a, b) => `<span class="fr"><span>${a}</span><span>${b}</span></span>`;
  const SHEETS = {};
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
  function mcq(right, wrong) {
    const opts = [{ html: right, correct: true }, ...wrong.slice(0, 3).map((w) => ({ html: w, correct: false }))];
    return { options: shuffle(opts) };
  }

  return {
    CARDS, BY_ID, TOPICS, CHAPTERS, SUBJ_ORDER, SYLLABUS, SHEETS, CATIONS, ANIONS, FLAMES, RULES, GAS_TESTS,
    DEFS, DEF_BY_ID, defsOf, boldDef, plainDef,
    load, addTopics, addCard, defs, chaptersOf, chLabel, chTitle, subjectOrder, roundRobin,
    known: (id) => !!(BY_ID[id] || DEF_BY_ID[id]),
    shuffle, mcq, pickDistinct, fr, tube, PC, catVisual, anVisual, solGridHTML, legendHTML, FL_HEX,
  };
})();

/* ───────────── settings and scheduling ───────────── */

const QZ_INTERVALS = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };
const QZ_MAX_DUE = 60;
const QZ_NEW_CHOICES = [10, 15, 20, 25, 30, 40, 50];
const QZ_NEW_DEFAULT = 20;
const QZ_TOPICS_OFF_DEFAULT = ['maths-given'];

/* Settings sync as one record, qs/cfg:
   { off: [subjects switched off], n: new cards a day, toff: [content types switched off],
     focus: { subject: [chapters whose new cards come first] } }. */
function qzCfg() {
  const c = state.qset || {};
  return {
    off: Array.isArray(c.off) ? c.off : [],
    n: QZ_NEW_CHOICES.includes(c.n) ? c.n : QZ_NEW_DEFAULT,
    toff: Array.isArray(c.toff) ? c.toff : QZ_TOPICS_OFF_DEFAULT,
    focus: c.focus && typeof c.focus === 'object' ? c.focus : {},
  };
}
const qzSubjHas = (s) => QZ.CARDS.some((c) => c.s === s);
const qzCardIn = (c, cfg = qzCfg()) => !cfg.off.includes(c.s) && !cfg.toff.includes(c.topic);
function qzOnSubjects() { const cfg = qzCfg(); return QZ.SUBJ_ORDER.filter((s) => qzSubjHas(s) && !cfg.off.includes(s)); }
const qzIsOn = (s) => qzOnSubjects().includes(s);
const qzTopicsOf = (s) => Object.keys(QZ.TOPICS).filter((t) => QZ.TOPICS[t].s === s && QZ.CARDS.some((c) => c.topic === t));
const qzSubjName = (s) => (SUBJ[s] ? SUBJ[s].name : s);
const qzRec = (id) => state.quiz[id];
/* A definition counts as tried only once it has been marked in the written section (it has a mark, g). */
const qdRec = (id) => { const r = state.quiz[id]; return r && r.g != null ? r : null; };

function qzIntroducedToday() {
  const t = todayISO();
  let n = 0;
  for (const c of QZ.CARDS) { const r = state.quiz[c.id]; if (r && r.f === t) n++; }
  return n;
}

function qzDueToday() {
  const t = todayISO();
  const cfg = qzCfg();
  return QZ.CARDS.filter((c) => { const r = qzRec(c.id); return r && r.d <= t && qzCardIn(c, cfg); })
    .sort((a, b) => (qzRec(a.id).d.localeCompare(qzRec(b.id).d)) || (qzRec(a.id).b - qzRec(b.id).b))
    .slice(0, QZ_MAX_DUE).map((c) => c.id);
}

/* New cards: chapter by chapter in each subject (focus chapters first), subjects taking turns. */
function qzNewOrder(subjects, cfg = qzCfg()) {
  return QZ.roundRobin(subjects.map((s) => {
    const all = QZ.subjectOrder(s).filter((id) => qzCardIn(QZ.BY_ID[id], cfg));
    const f = (cfg.focus[s] || []).map(String);
    if (!f.length) return all;
    const inF = (id) => f.includes(String(QZ.BY_ID[id].ch));
    return all.filter(inF).concat(all.filter((id) => !inF(id)));
  }));
}

function qzNewToday(limit) {
  const n = limit != null ? limit : Math.max(0, qzCfg().n - qzIntroducedToday());
  if (!n) return [];
  return qzNewOrder(qzOnSubjects()).filter((id) => !qzRec(id)).slice(0, n);
}

function qzTodayQueue() {
  return QZ.shuffle(qzDueToday()).concat(qzNewToday());
}

/* g: 2 knew it, 1 partly, 0 didn't know. */
function qzNextRec(r, g, t) {
  r = r || { b: 0, f: t, r: 0, p: 0, w: 0 };
  let b, days;
  if (g === 2) { b = Math.min(5, r.b ? r.b + 1 : 2); days = QZ_INTERVALS[b]; } // known on first sight: start at box 2
  else if (g === 1) { b = Math.max(1, r.b || 1); days = Math.max(1, Math.floor(QZ_INTERVALS[b] / 2)); }
  else { b = 1; days = 1; }
  return { b, d: addDays(t, days), f: r.f || t, r: (r.r || 0) + (g === 2 ? 1 : 0), p: (r.p || 0) + (g === 1 ? 1 : 0), w: (r.w || 0) + (g === 0 ? 1 : 0), l: t, g };
}
const qzGapText = (r, g) => {
  const t = todayISO();
  const n = Math.round((new Date(`${qzNextRec(r, g, t).d}T12:00:00`) - new Date(`${t}T12:00:00`)) / 864e5);
  return n === 1 ? 'tomorrow' : `in ${n} days`;
};

function qzGrade(id, g) {
  const t = todayISO();
  setRec(`q/${id}`, qzNextRec(qzRec(id), g, t));
  const day = state.qdays[t] || { n: 0, c: 0, p: 0, done: false };
  const left = qzTodayQueue().length;
  setRec(`qd/${t}`, { n: (day.n || 0) + 1, c: (day.c || 0) + (g === 2 ? 1 : 0), p: (day.p || 0) + (g === 1 ? 1 : 0), done: !!day.done || left === 0 });
}

function qzStreak() {
  let n = 0;
  let d = todayISO();
  if (!(state.qdays[d] && state.qdays[d].done)) d = addDays(d, -1);
  while (state.qdays[d] && state.qdays[d].done) { n++; d = addDays(d, -1); }
  return n;
}

function qzMasteryOf(cards) {
  let secure = 0, seen = 0;
  for (const c of cards) { const r = qzRec(c.id); if (r) { seen++; if (r.b >= 3) secure++; } }
  return { total: cards.length, secure, seen };
}
const qzSubjMastery = (s) => qzMasteryOf(QZ.CARDS.filter((c) => c.s === s && qzCardIn(c, { ...qzCfg(), off: [] })));

/* Ten (or n) cards to practise: unseen ones first, in the usual order, then the weakest ones you've seen. */
function qzPracticeSet(f, n = 10) {
  const cfg = qzCfg();
  const ok = (c) => (!f.s || c.s === f.s) && (f.ch == null || String(c.ch) === String(f.ch)) && (!f.t || c.topic === f.t)
    && (f.t || f.ch != null || qzCardIn(c, cfg)) && (!f.subjects || f.subjects.includes(c.s));
  const subjects = f.s ? [f.s] : (f.subjects || qzOnSubjects());
  const order = f.ch != null || f.t ? QZ.roundRobin(subjects.map((s) => QZ.subjectOrder(s))) : qzNewOrder(subjects, cfg);
  const fresh = order.filter((id) => ok(QZ.BY_ID[id]) && !qzRec(id)).slice(0, n);
  if (fresh.length >= n) return fresh;
  const weak = (r) => (r.g === 0 ? 0 : r.g === 1 ? 1 : 2) * 10 + (r.b || 0);
  const seen = QZ.shuffle(QZ.CARDS.filter((c) => ok(c) && qzRec(c.id)).map((c) => c.id))
    .sort((a, b) => weak(qzRec(a)) - weak(qzRec(b))).slice(0, n - fresh.length);
  return QZ.shuffle(fresh.concat(seen));
}

function qzSetCfg(patch, opts) {
  const c = { ...qzCfg(), ...patch };
  setRec('qs/cfg', { off: c.off, n: c.n, toff: c.toff, focus: c.focus });
  commit(opts);
}

/* ───────────── rendering: daily quiz ───────────── */

const lcText = (h) => String(h).replace(/<[^>]+>/g, '');
const qzMin = (n) => Math.max(2, Math.round(n * 0.3));

function renderQuiz() {
  const el = $('#v-quiz');
  const Q = ui.qz;
  if (Q && Q.active) { el.innerHTML = qzSessionHTML(Q); return; }
  if (Q && Q.finished) { el.innerHTML = qzDoneHTML(Q); return; }
  if (ui.qzMode === 'defs') { el.innerHTML = qdHTML(); return; }
  el.innerHTML = qzHomeHTML();
}

function qzModeHTML(m) {
  return `<div class="view-head"><h2 class="h">Quiz</h2></div>
    <div class="qz-mode" role="tablist" aria-label="Quiz sections">
      <button role="tab" aria-selected="${m === 'quiz'}" class="${m === 'quiz' ? 'on' : ''}" data-act="qz-mode" data-m="quiz">Daily recall</button>
      <button role="tab" aria-selected="${m === 'defs'}" class="${m === 'defs' ? 'on' : ''}" data-act="qz-mode" data-m="defs">Write definitions</button>
    </div>`;
}

function qzHomeHTML() {
  const left = qzTodayQueue().length;
  const due = qzDueToday().length, fresh = qzNewToday().length;
  const today = state.qdays[todayISO()];
  const streak = qzStreak();
  const cfg = qzCfg();
  const on = qzOnSubjects();
  const unseen = QZ.CARDS.filter((c) => on.includes(c.s) && qzCardIn(c, cfg) && !qzRec(c.id)).length;
  const last14 = [...Array(14)].map((_, i) => addDays(todayISO(), i - 13));
  const subjects = QZ.SUBJ_ORDER.filter(qzSubjHas);
  const open = ui.qzOpen;
  return `${qzModeHTML('quiz')}
    <section class="block qz-today">
      ${left
        ? `<p class="qz-big"><b>${left}</b> card${left === 1 ? '' : 's'} today</p><p class="fine">${due ? `${due} to review` : 'Nothing to review yet'}${fresh ? `, ${fresh} new` : ''}. About ${qzMin(left)} minutes.</p>
           <div class="btn-row"><button class="btn primary" data-act="qz-start">${today && today.n ? 'Continue today’s quiz' : 'Start today’s quiz'}</button><button class="btn" data-act="qz-sheet">Browse cards</button></div>`
        : `<p class="qz-big"><b>Done</b> for today</p><p class="fine">${today ? `${today.c || 0} of ${today.n} known${today.p ? `, ${today.p} partly` : ''}. ` : ''}${unseen ? `${unseen} cards you haven’t seen yet.` : 'You’ve seen every card.'}</p>
           <div class="btn-row"><button class="btn" data-act="qz-more">Practise 10 more</button><button class="btn" data-act="qz-sheet">Browse cards</button></div>`}
      <div class="qz-streakrow"><span class="qz-streak">${streak ? `${streak}-day streak` : 'Finish today’s quiz to start a streak'}</span>
        <span class="qz-days" aria-label="Last 14 days">${last14.map((d) => { const r = state.qdays[d]; return `<i class="${r && r.done ? 'on' : r && r.n ? 'part' : ''}${d === todayISO() ? ' today' : ''}" title="${fmtDate(d)}${r ? `: ${r.c || 0}/${r.n}` : ''}"></i>`; }).join('')}</span></div>
    </section>
    <details class="block qz-how"${state.qdays[todayISO()] || Object.keys(state.qdays).length > 3 ? '' : ' open'}>
      <summary>How to use it</summary>
      <ol>
        <li><b>Answer before you look.</b> Say it out loud or write it down: a formula, a value, a list, a difference. Recalling it yourself is what makes it stick.</li>
        <li><b>Show the answer and mark yourself honestly.</b> <i>Knew it</i> only if you had every key word or every part of the formula.</li>
        <li><b>Let the schedule do the rest.</b> Knew it: the card comes back later and later (3, 7, 14, 30 days). Partly: it comes back soon. Didn’t know: tomorrow, and once more at the end of today’s session.</li>
        <li><b>Little and every day</b> beats a lot once a week. Finish the day’s cards to keep your streak.</li>
      </ol>
      <p class="fine">Every card comes from your revision notes. Definitions are in <b>Write definitions</b>, where you write them on paper and mark them yourself.</p>
    </details>
    <section class="block">
      <h3 class="h">Subjects</h3>
      <p class="fine">Switch a subject or a type of card off to leave it out of the daily quiz. Open a subject to practise one chapter, or to put a chapter first for new cards while you revise it. “Secure” means known at least three times in a row, with days in between.</p>
      <ul class="qz-slist">${subjects.map((s) => qzSubjectHTML(s, cfg, open === s)).join('')}</ul>
      <div class="qz-newrow"><span id="qzNewLbl">New cards a day</span>
        <div class="qz-seg" role="radiogroup" aria-labelledby="qzNewLbl">${QZ_NEW_CHOICES.map((n) => `<button role="radio" aria-checked="${cfg.n === n}" class="${cfg.n === n ? 'on' : ''}" data-act="qz-newn" data-n="${n}">${n}</button>`).join('')}</div>
      </div>
      <p class="fine qz-pace">${qzPaceText(cfg)}</p>
    </section>`;
}

/* How long until every card has been seen at this pace. */
function qzPaceText(cfg) {
  const on = qzOnSubjects();
  const unseen = QZ.CARDS.filter((c) => on.includes(c.s) && qzCardIn(c, cfg) && !qzRec(c.id)).length;
  if (!unseen) return 'You have seen every card that is switched on.';
  const days = Math.ceil(unseen / cfg.n);
  return `${unseen} cards still to meet: about ${days} day${days === 1 ? '' : 's'} at ${cfg.n} new a day (to ${fmtDate(addDays(todayISO(), days))}).`;
}

function qzSubjectHTML(s, cfg, open) {
  const m = qzSubjMastery(s);
  const isOn = !cfg.off.includes(s);
  const c = col(s);
  const bar = (mm) => `<span class="tp-bar qz-sbar" aria-hidden="true"><i style="width:${mm.total ? (mm.secure / mm.total) * 100 : 0}%;background:${c.bg}"></i><i class="seen" style="width:${mm.total ? ((mm.seen - mm.secure) / mm.total) * 100 : 0}%;background:${c.bg}"></i></span>`;
  let body = '';
  if (open) {
    const topics = qzTopicsOf(s);
    const focus = (cfg.focus[s] || []).map(String);
    body = `<div class="qz-sbody">
      <h4 class="qz-sh">Types of card</h4>
      <ul class="qz-tlist">${topics.map((t) => {
        const tm = qzMasteryOf(QZ.CARDS.filter((x) => x.topic === t));
        const ton = !cfg.toff.includes(t);
        return `<li class="${ton ? '' : 'off'}">
          <button class="qz-sw sm" role="switch" aria-checked="${ton}" data-act="qz-ttoggle" data-t="${t}" aria-label="Include ${esc(QZ.TOPICS[t].name)} in the daily quiz"><span aria-hidden="true"></span></button>
          <button class="qz-tname" data-act="qz-prac" data-s="${s}" data-t="${t}" aria-label="Practise 10 ${esc(QZ.TOPICS[t].name)}"><b>${esc(QZ.TOPICS[t].name)}</b>${bar(tm)}</button>
          <span class="tp-n"><b>${tm.secure}</b>/${tm.total}</span></li>`;
      }).join('')}</ul>
      ${s === 'maths' && cfg.toff.includes('maths-given') ? '<p class="fine">Given formulas are off at first: they are printed in Papers 2 and 4. Switch them on to practise using them.</p>' : ''}
      <h4 class="qz-sh">Chapters</h4>
      <p class="fine">Tap a chapter to practise 10 of its cards. ★ puts a chapter first for new cards.${focus.length ? '' : ' With no ★, new cards come in chapter order.'}</p>
      <ul class="qz-clist">${QZ.chaptersOf(s).map((ch) => {
        const cards = QZ.CARDS.filter((x) => x.s === s && x.ch === ch);
        if (!cards.length) return '';
        const cm = qzMasteryOf(cards);
        const f = focus.includes(String(ch));
        return `<li>
          <button class="qz-star${f ? ' on' : ''}" aria-pressed="${f}" data-act="qz-focus" data-s="${s}" data-ch="${ch}" aria-label="${f ? 'Stop putting' : 'Put'} chapter ${esc(QZ.chLabel(s, ch))} first for new cards">${f ? '★' : '☆'}</button>
          <button class="qz-cname" data-act="qz-prac" data-s="${s}" data-ch="${ch}" aria-label="Practise chapter ${esc(QZ.chLabel(s, ch))}, ${esc(QZ.chTitle(s, ch))}"><span><b>${esc(QZ.chLabel(s, ch))}</b> ${esc(QZ.chTitle(s, ch))}</span>${bar(cm)}</button>
          <span class="tp-n"><b>${cm.secure}</b>/${cm.total}</span></li>`;
      }).join('')}</ul>
      <div class="btn-row qz-sacts"><button class="btn small" data-act="qz-prac" data-s="${s}">Practise 10 ${esc(qzSubjName(s))}</button><button class="btn small" data-act="qz-sheet" data-s="${s}">Browse ${esc(qzSubjName(s))}</button></div>
    </div>`;
  }
  return `<li class="qz-s${isOn ? '' : ' off'}${open ? ' open' : ''}">
    <div class="qz-srow">
      <button class="qz-sw" role="switch" aria-checked="${isOn}" data-act="qz-toggle" data-s="${s}" aria-label="Include ${esc(qzSubjName(s))} in the daily quiz"><span aria-hidden="true"></span></button>
      <button class="qz-sname" data-act="qz-sopen" data-s="${s}" aria-expanded="${open}"><b>${esc(qzSubjName(s))} <i class="qz-chev" aria-hidden="true">${open ? '▴' : '▾'}</i></b><small>${m.secure}/${m.total} secure${m.seen < m.total ? ` · ${m.total - m.seen} new` : ''}</small></button>
      ${bar(m)}
    </div>${body}</li>`;
}

function qzSessionHTML(Q) {
  const item = Q.queue[Q.i];
  const q = Q.q;
  const total = Q.queue.length;
  const pct = (Q.i / total) * 100;
  const card = QZ.BY_ID[item.id];
  const rec = qzRec(item.id);
  let body;
  if (q.type === 'recall') {
    if (!Q.revealed) {
      body = `<button class="btn primary qz-show" data-act="qz-show">Show answer</button>
        <p class="fine qz-keys">Answer it in your head or on paper first.</p>`;
    } else if (item.relearn) {
      body = `<div class="qn qz-ans">${q.answer}</div>
        <button class="btn primary qz-next" data-act="qz-next">${Q.i + 1 < total ? 'Next' : 'Finish'}</button>`;
    } else {
      body = `<div class="qn qz-ans">${q.answer}</div>
        <p class="qz-gq">How did you do?</p>
        <div class="qz-grade" role="group" aria-label="Mark yourself">
          <button class="qz-g no" data-act="qz-g" data-g="0"><b>Didn’t know</b><small>${qzGapText(rec, 0)}</small></button>
          <button class="qz-g part" data-act="qz-g" data-g="1"><b>Partly</b><small>${qzGapText(rec, 1)}</small></button>
          <button class="qz-g yes" data-act="qz-g" data-g="2"><b>Knew it</b><small>${qzGapText(rec, 2)}</small></button>
        </div>`;
    }
  } else if (q.type === 'match') {
    const m = Q.match;
    body = `<div class="qz-match">
      <div class="qz-col">${m.left.map((L, i) => `<button class="qz-m${m.done.includes(i) ? ' ok' : ''}${m.sel === i ? ' sel' : ''}${m.bad && m.bad[0] === i ? ' bad' : ''}" data-act="qz-ml" data-i="${i}" ${m.done.includes(i) ? 'disabled' : ''}>${L}</button>`).join('')}</div>
      <div class="qz-col">${m.right.map((R, j) => { const usedBy = m.done.find((i) => m.answer[i] === j); return `<button class="qz-m${usedBy != null ? ' ok' : ''}${m.bad && m.bad[1] === j ? ' bad' : ''}" data-act="qz-mr" data-j="${j}" ${usedBy != null ? 'disabled' : ''}>${R}</button>`; }).join('')}</div>
    </div>
    ${Q.answered ? `<div class="qz-fb ${m.mistakes ? 'wrong' : 'right'}"><b>${m.mistakes ? `Matched with ${m.mistakes} mistake${m.mistakes === 1 ? '' : 's'}` : 'All matched first time'}</b><div class="qz-exp">${q.explain}</div></div>` : '<p class="fine">Tap an item on the left, then its match on the right.</p>'}`;
  } else {
    body = `${q.visual ? `<div class="qz-visual">${q.visual}</div>` : ''}<div class="qz-opts">${q.options.map((o, i) => {
      let cls = 'qz-opt';
      if (Q.answered) { if (o.correct) cls += ' right'; else if (i === Q.picked) cls += ' wrong'; }
      return `<button class="${cls}" data-act="qz-pick" data-i="${i}" ${Q.answered ? 'disabled' : ''}>${o.html}</button>`;
    }).join('')}</div>
    ${Q.answered ? `<div class="qz-fb ${q.options[Q.picked].correct ? 'right' : 'wrong'}"><b>${q.options[Q.picked].correct ? 'Correct' : 'Not quite'}</b><div class="qz-exp">${q.explain}</div></div>` : ''}`;
  }
  const chName = card.ch ? `Ch ${QZ.chLabel(card.s, card.ch)} ${QZ.chTitle(card.s, card.ch)}` : '';
  const tag = item.relearn ? ' · one more look' : !rec ? ' · new' : '';
  return `<div class="qz-top">
      <button class="link" data-act="qz-stop">Stop for now</button>
      ${Q.undo ? '<button class="link" data-act="qz-undo">Undo</button>' : ''}
      <span class="qz-prog" aria-hidden="true"><i style="width:${pct}%"></i></span>
      <span class="qz-count">${Q.i + 1} of ${total}</span>
    </div>
    <section class="block qz-card" style="--qc:${col(card.s).bg}">
      <p class="qz-topic"><i class="sw" style="background:${col(card.s).bg}" aria-hidden="true"></i>${esc(qzSubjName(card.s))} · ${esc(QZ.TOPICS[card.topic].name)}${tag}</p>
      ${chName ? `<p class="qz-chline">${esc(chName)}${card.ext ? ' <span class="qn-ext">EXT</span>' : ''}</p>` : ''}
      ${q.type === 'recall' ? `<p class="qz-hint">${esc(q.hint)}</p>` : ''}
      <h3 class="qz-q${q.type === 'recall' ? ' qn' : ''}">${q.prompt}</h3>
      ${body}
      ${Q.answered ? `<button class="btn primary qz-next" data-act="qz-next">${Q.i + 1 < total ? 'Next' : 'Finish'}</button>` : ''}
    </section>
    <p class="qz-under"><button class="link" data-act="qz-sheet" data-s="${card.s}" data-ch="${card.ch}">Browse this chapter</button></p>`;
}

function qzDoneHTML(Q) {
  const R = Q.results;
  const knew = R.filter((r) => r.g === 2).length, part = R.filter((r) => r.g === 1).length, no = R.filter((r) => r.g === 0).length;
  const review = R.filter((r) => r.g < 2);
  const streak = qzStreak();
  const left = qzTodayQueue().length;
  return `<div class="view-head"><h2 class="h">Quiz</h2></div>
    <section class="block qz-today">
      <p class="qz-big"><b>${knew}</b> of ${R.length} known</p>
      <p class="fine">${part ? `${part} partly, ` : ''}${no ? `${no} not yet. ` : ''}${left ? `${left} still to do today.` : `Today’s quiz is done.${streak ? ` ${streak}-day streak.` : ''}`} Cards you didn’t know come back tomorrow.</p>
      <div class="btn-row">${left ? '<button class="btn primary" data-act="qz-start">Keep going</button>' : '<button class="btn" data-act="qz-more">Practise 10 more</button>'}<button class="btn" data-act="qz-home">Back to the quiz</button></div>
    </section>
    ${review.length ? `<section class="block"><h3 class="h">Worth another look</h3><ul class="qz-review">${review.map((r) => `<li><p class="qz-rq qn">${r.prompt} <span class="qz-rtag ${r.g === 1 ? 'part' : 'no'}">${r.g === 1 ? 'partly' : 'didn’t know'}</span></p><div class="qz-ans qn">${r.explain}</div></li>`).join('')}</ul></section>` : ''}`;
}

/* ───────────── rendering: written definitions ───────────── */

const QD_SUBJ = () => QZ.SUBJ_ORDER.filter((s) => QZ.defsOf(s).length);
const QD_N = [5, 10, 15, 20];
const QD_MODES = [['due', 'Due and new'], ['weak', 'Wrong and partly'], ['new', 'Not tried yet'], ['chap', 'A chapter']];
const qdState = () => (ui.qzd = ui.qzd || { view: 'home', s: QD_SUBJ()[0], mode: 'due', ch: null, n: 10, list: [], marks: {}, rf: 'all' });

function qdStats(s) {
  const t = todayISO();
  const out = { total: 0, g2: 0, g1: 0, g0: 0, fresh: 0, due: 0 };
  for (const d of QZ.defsOf(s)) {
    out.total++;
    const r = qdRec(d.id);
    if (!r) { out.fresh++; continue; }
    out[`g${r.g}`]++;
    if (r.d <= t) out.due++;
  }
  return out;
}

function qdPick(s, mode, ch, n) {
  const all = QZ.defsOf(s);
  const t = todayISO();
  const weakKey = (d) => { const r = qdRec(d.id); return (r.g === 0 ? 0 : 1) * 1e9 + Number(String(r.l || '').replace(/-/g, '')); };
  if (mode === 'chap') return all.filter((d) => String(d.ch) === String(ch)).map((d) => d.id);
  if (mode === 'new') return all.filter((d) => !qdRec(d.id)).slice(0, n).map((d) => d.id);
  if (mode === 'weak') return all.filter((d) => { const r = qdRec(d.id); return r && r.g < 2; }).sort((a, b) => weakKey(a) - weakKey(b)).slice(0, n).map((d) => d.id);
  const due = all.filter((d) => { const r = qdRec(d.id); return r && r.d <= t; })
    .sort((a, b) => (qdRec(a.id).g - qdRec(b.id).g) || qdRec(a.id).d.localeCompare(qdRec(b.id).d));
  const fresh = all.filter((d) => !qdRec(d.id));
  return due.concat(fresh).slice(0, n).map((d) => d.id);
}

const qdDot = (r) => `<i class="qd-dot ${r ? `g${r.g}` : 'new'}" aria-hidden="true"></i>`;
const qdMarkName = (g) => ['Wrong', 'Partly', 'Correct'][g];

function qdHTML() {
  const D = qdState();
  if (!QD_SUBJ().includes(D.s)) D.s = QD_SUBJ()[0];
  if (D.view === 'write') return qdWriteHTML(D);
  if (D.view === 'mark') return qdMarkHTML(D);
  if (D.view === 'done') return qdDoneHTML(D);
  if (D.view === 'review') return qdReviewHTML(D);
  const s = D.s;
  const st = qdStats(s);
  const c = col(s);
  const chs = QZ.chaptersOf(s).filter((ch) => QZ.defsOf(s).some((d) => String(d.ch) === String(ch)));
  if (D.mode === 'chap' && !chs.map(String).includes(String(D.ch))) D.ch = chs[0];
  const pick = qdPick(s, D.mode, D.ch, D.n);
  const seg = (k, n) => `<i style="width:${st.total ? (n / st.total) * 100 : 0}%" class="${k}"></i>`;
  return `${qzModeHTML('defs')}
    <section class="block">
      <p class="fine qd-intro">Write definitions <b>on paper</b>, word for word, then mark yourself against the notes: <b>correct</b> (every key word), <b>partly</b> or <b>wrong</b>. The app remembers your marks and brings the wrong and partly ones back first.</p>
      <div class="qz-stabs qd-stabs" role="tablist" aria-label="Subject">${QD_SUBJ().map((x) => `<button role="tab" aria-selected="${x === s}" class="${x === s ? 'on' : ''}" data-act="qd-s" data-s="${x}" style="--sc:${col(x).bg}">${esc(qzSubjName(x))}</button>`).join('')}</div>
      <div class="qd-sum">
        <span class="qd-bar" aria-hidden="true">${seg('g2', st.g2)}${seg('g1', st.g1)}${seg('g0', st.g0)}</span>
        <ul class="qd-legend">
          <li>${qdDot({ g: 2 })}<b>${st.g2}</b> correct</li><li>${qdDot({ g: 1 })}<b>${st.g1}</b> partly</li>
          <li>${qdDot({ g: 0 })}<b>${st.g0}</b> wrong</li><li>${qdDot(null)}<b>${st.fresh}</b> not tried</li>
        </ul>
        <p class="fine">${st.total} ${esc(qzSubjName(s))} definitions${st.due ? ` · <b>${st.due}</b> due to write again` : ''}.</p>
      </div>
    </section>
    <section class="block qd-setup" style="--sc:${c.bg}">
      <h3 class="h">Start a written test</h3>
      <p class="qd-lbl">Which definitions</p>
      <div class="qd-chips">${QD_MODES.map(([k, l]) => `<button class="qd-chip${D.mode === k ? ' on' : ''}" aria-pressed="${D.mode === k}" data-act="qd-mode" data-m="${k}">${l}</button>`).join('')}</div>
      ${D.mode === 'chap'
        ? `<p class="qd-lbl">Chapter</p><div class="qd-chips qd-chs">${chs.map((ch) => { const n = QZ.defsOf(s).filter((d) => String(d.ch) === String(ch)).length; return `<button class="qd-chip${String(D.ch) === String(ch) ? ' on' : ''}" aria-pressed="${String(D.ch) === String(ch)}" data-act="qd-ch" data-ch="${ch}" title="${esc(QZ.chTitle(s, ch))}"><b>${esc(QZ.chLabel(s, ch))}</b> ${esc(QZ.chTitle(s, ch))} <small>${n}</small></button>`; }).join('')}</div>`
        : `<p class="qd-lbl">How many</p><div class="qz-seg" role="radiogroup" aria-label="How many">${QD_N.map((n) => `<button role="radio" aria-checked="${D.n === n}" class="${D.n === n ? 'on' : ''}" data-act="qd-n" data-n="${n}">${n}</button>`).join('')}</div>`}
      <p class="fine qd-count">${pick.length ? `${pick.length} definition${pick.length === 1 ? '' : 's'} ready.` : D.mode === 'weak' ? 'Nothing marked wrong or partly yet.' : D.mode === 'new' ? 'You have tried every definition in this subject.' : 'Nothing due.'}</p>
      <div class="btn-row"><button class="btn primary" data-act="qd-start" ${pick.length ? '' : 'disabled'}>Show me the terms</button><button class="btn" data-act="qd-review">All my marks</button></div>
    </section>`;
}

function qdItem(id) { return QZ.DEF_BY_ID[id]; }
const qdChTag = (d) => `<small class="qd-ch">${typeof d.ch === 'number' ? `Ch ${esc(QZ.chLabel(d.s, d.ch))}` : esc(QZ.chTitle(d.s, d.ch))}</small>`;

function qdWriteHTML(D) {
  return `<div class="view-head"><h2 class="h">Write these definitions</h2></div>
    <section class="block qd-sheet">
      <p class="fine">${esc(qzSubjName(D.s))}. Write each one on paper, word for word, without looking. Then tap <b>Mark my answers</b>.</p>
      <ol class="qd-terms">${D.list.map((id) => { const d = qdItem(id); const r = qdRec(id); return `<li><span class="qd-term">${d.term}</span>${d.ext && !/qn-ext/.test(d.term) ? ' <span class="qn-ext">EXT</span>' : ''} ${qdChTag(d)}${r ? ` ${qdDot(r)}` : ''}</li>`; }).join('')}</ol>
      <div class="btn-row"><button class="btn primary" data-act="qd-tomark">Mark my answers</button><button class="btn" data-act="qd-cancel">Cancel</button></div>
    </section>`;
}

function qdMarkHTML(D) {
  const done = D.list.filter((id) => D.marks[id] != null).length;
  return `<div class="view-head"><h2 class="h">Mark your definitions</h2></div>
    <p class="fine">Compare each answer with the notes. <b>Correct</b> only if every key word is there. ${done} of ${D.list.length} marked.</p>
    <ol class="qd-marklist">${D.list.map((id, i) => {
      const d = qdItem(id);
      const g = D.marks[id];
      return `<li class="block qd-mi${g != null ? ` m${g}` : ''}">
        <p class="qd-mt"><span class="qd-num">${i + 1}</span><span class="qd-term">${d.term}</span> ${qdChTag(d)}</p>
        <div class="qn qd-def">${d.def}</div>
        ${d.note ? `<details class="qd-note"><summary>Notes</summary><div class="qn">${d.note}</div></details>` : ''}
        <div class="qd-grade" role="radiogroup" aria-label="Your mark for ${esc(lcText(d.term))}">
          ${[2, 1, 0].map((k) => `<button role="radio" aria-checked="${g === k}" class="qd-g g${k}${g === k ? ' on' : ''}" data-act="qd-g" data-id="${id}" data-g="${k}">${qdMarkName(k)}</button>`).join('')}
        </div>
      </li>`;
    }).join('')}</ol>
    <div class="btn-row qd-savebar"><button class="btn primary" data-act="qd-save" ${done ? '' : 'disabled'}>${done < D.list.length && done ? `Save ${done} mark${done === 1 ? '' : 's'}` : 'Save marks'}</button><button class="btn" data-act="qd-backwrite">Back to the terms</button></div>`;
}

function qdDoneHTML(D) {
  const ids = Object.keys(D.saved || {});
  const n = (g) => ids.filter((id) => D.saved[id] === g).length;
  const again = ids.filter((id) => D.saved[id] < 2);
  return `${qzModeHTML('defs')}
    <section class="block qz-today">
      <p class="qz-big"><b>${n(2)}</b> of ${ids.length} correct</p>
      <p class="fine">${n(1) ? `${n(1)} partly, ` : ''}${n(0) ? `${n(0)} wrong. ` : ''}Wrong ones come back tomorrow, partly ones soon, correct ones later and later.</p>
      <div class="btn-row">${again.length ? '<button class="btn primary" data-act="qd-again">Write the missed ones again</button>' : ''}<button class="btn" data-act="qd-home">Back</button></div>
    </section>
    ${again.length ? `<section class="block"><h3 class="h">Learn these</h3><ul class="qz-review">${again.map((id) => { const d = qdItem(id); return `<li><p class="qz-rq"><span class="qd-term">${d.term}</span> <span class="qz-rtag ${D.saved[id] === 1 ? 'part' : 'no'}">${D.saved[id] === 1 ? 'partly' : 'wrong'}</span></p><div class="qn qd-def">${d.def}</div></li>`; }).join('')}</ul></section>` : ''}`;
}

function qdReviewHTML(D) {
  const s = D.s;
  const t = todayISO();
  const F = [['all', 'All'], ['0', 'Wrong'], ['1', 'Partly'], ['2', 'Correct'], ['new', 'Not tried'], ['due', 'Due']];
  const keep = (d) => {
    const r = qdRec(d.id);
    if (D.rf === 'all') return true;
    if (D.rf === 'new') return !r;
    if (D.rf === 'due') return r && r.d <= t;
    return r && String(r.g) === D.rf;
  };
  const groups = QZ.chaptersOf(s).map((ch) => [ch, QZ.defsOf(s).filter((d) => String(d.ch) === String(ch) && keep(d))]).filter(([, l]) => l.length);
  return `<div class="detail-head"><button class="back" data-act="qd-home"><span aria-hidden="true">‹</span> Definitions</button><h2 class="h">${esc(qzSubjName(s))}: your marks</h2></div>
    <div class="qd-chips qd-filter">${F.map(([k, l]) => `<button class="qd-chip${D.rf === k ? ' on' : ''}" aria-pressed="${D.rf === k}" data-act="qd-rf" data-f="${k}">${l}</button>`).join('')}</div>
    ${groups.length ? groups.map(([ch, list]) => `<section class="block qd-rgroup"><h3 class="qz-sh">${typeof ch === 'number' ? `Ch ${esc(QZ.chLabel(s, ch))} · ` : ''}${esc(QZ.chTitle(s, ch))}</h3>
      ${list.map((d) => { const r = qdRec(d.id); return `<details class="qd-row"><summary>${qdDot(r)}<span class="qd-term">${d.term}</span><small>${r ? `${qdMarkName(r.g)} · ${fmtDate(r.l)}` : 'not tried'}</small></summary><div class="qn qd-def">${d.def}</div>${d.note ? `<div class="qn qd-rnote">${d.note}</div>` : ''}</details>`; }).join('')}
    </section>`).join('') : '<p class="fine">Nothing here yet.</p>'}`;
}

/* ───────────── browse sheet ───────────── */

function qzDefsListHTML(s, chs) {
  const groups = {};
  for (const d of QZ.defsOf(s)) if (!chs || chs.map(String).includes(String(d.ch))) (groups[d.ch] = groups[d.ch] || []).push(d);
  return Object.entries(groups).map(([ch, list]) => `${chs ? '' : `<h5 class="qz-sh5">${esc(QZ.chTitle(s, ch))}</h5>`}
    <dl class="qz-defs qn">${list.map((d) => `<div><dt>${d.term}</dt><dd>${d.def}${d.note ? `<small>${d.note}</small>` : ''}</dd></div>`).join('')}</dl>`).join('');
}

function qzChemTablesHTML() {
  return `<div class="qz-sheet">
    <h4 id="qzs-cat">Tests for aqueous cations</h4>
    ${QZ.legendHTML('cat')}
    <ul class="qz-list">${QZ.CATIONS.map((c) => `<li class="qz-vcard">
      <div class="qz-vtop"><p class="qz-ion">${c.ion} <small>${c.name}</small></p>${QZ.catVisual(c)}</div>
      <dl><dt>Aqueous sodium hydroxide</dt><dd>${c.naoh}</dd><dt>Aqueous ammonia</dt><dd>${c.nh3 || '–'}</dd></dl>
    </li>`).join('')}</ul>
    <h4 id="qzs-an">Tests for anions</h4>
    <ul class="qz-list">${QZ.ANIONS.map((a) => `<li class="qz-vcard">
      <div class="qz-vtop"><p class="qz-ion">${a.ion} <small>${a.name}</small></p>${QZ.anVisual(a)}</div>
      <dl><dt>Test</dt><dd>${a.test}</dd><dt>Result</dt><dd>${a.result}</dd></dl>
    </li>`).join('')}</ul>
    <h4 id="qzs-fl">Flame tests</h4>
    <ul class="qz-flames">${QZ.FLAMES.map((f) => `<li><i class="qzv-flame" style="--fc:${QZ.FL_HEX[f.id]}" aria-hidden="true"></i><span class="qz-ion">${f.ion} <small>${f.name}</small></span><b>${f.colour}</b></li>`).join('')}</ul>
    <p class="fine">The colour dots are only a memory aid. In the exam, use the colour words exactly as listed.</p>
    <h4 id="qzs-sol">Solubility rules for salts</h4>
    ${QZ.legendHTML('sol')}
    ${QZ.solGridHTML()}
    <p class="fine">“Most others” means salts of other metals, such as copper(II), iron or zinc. A dash means the six rules don’t cover it.</p>
    <ol class="qz-rules">${Object.values(QZ.RULES).map((r) => `<li>${r}</li>`).join('')}</ol>
  </div>`;
}
QZ.SHEETS.chem = qzChemTablesHTML;

function qzSheetModalHTML(S) {
  const subjects = QZ.SUBJ_ORDER.filter((x) => qzSubjHas(x) || QZ.defsOf(x).length);
  const s = subjects.includes(S && S.s) ? S.s : subjects[0];
  const chs = QZ.chaptersOf(s).filter((ch) => QZ.CARDS.some((c) => c.s === s && c.ch === ch) || QZ.defsOf(s).some((d) => String(d.ch) === String(ch)));
  const extra = s === 'chem' ? [['tables', 'Test tables']] : [];
  let ch = S && S.ch != null && S.ch !== '' ? S.ch : (extra.length ? 'tables' : chs[0]);
  if (ch !== 'tables' && !chs.map(String).includes(String(ch))) ch = chs[0];
  let content;
  if (ch === 'tables') content = qzChemTablesHTML();
  else if (!qzSubjHas(s)) content = qzDefsListHTML(s, [ch]);
  else {
    const cards = QZ.CARDS.filter((c) => c.s === s && String(c.ch) === String(ch) && c.build && QZ.TOPICS[c.topic].hint !== 'Choose the answer');
    const topics = [...new Set(cards.map((c) => c.topic))];
    const defs = QZ.defsOf(s).filter((d) => String(d.ch) === String(ch));
    content = `${defs.length ? `<h4 class="qb-h">Definitions</h4>${qzDefsListHTML(s, [ch])}` : ''}
      ${topics.map((t) => `<h4 class="qb-h">${esc(QZ.TOPICS[t].name)}</h4><dl class="qb-list qn">${cards.filter((c) => c.topic === t).map((c) => { const q = c.build(); return `<div><dt>${q.prompt}</dt><dd>${q.answer}</dd></div>`; }).join('')}</dl>`).join('')}
      ${s === 'chem' && String(ch) === '22' ? '<p class="fine">The cation, anion and flame tests with pictures are under <b>Test tables</b>.</p>' : ''}`;
  }
  const chips = [...extra, ...chs.map((x) => [x, `${QZ.chLabel(s, x)}`])];
  return `<div class="sheet-h"><h2 id="sheetTitle">Browse: ${esc(qzSubjName(s))}</h2><button class="icon-btn" data-act="sheet-close" aria-label="Close">×</button></div>
    <div class="qz-stabs" role="tablist" aria-label="Subject">${subjects.map((x) => `<button role="tab" aria-selected="${x === s}" class="${x === s ? 'on' : ''}" data-act="qz-sheet" data-s="${x}" data-ch="" style="--sc:${col(x).bg}">${esc(qzSubjName(x))}</button>`).join('')}</div>
    <div class="qb-chs" role="tablist" aria-label="Chapter">${chips.map(([k, l]) => `<button role="tab" aria-selected="${String(k) === String(ch)}" class="${String(k) === String(ch) ? 'on' : ''}" data-act="qz-sheet" data-s="${s}" data-ch="${k}" title="${esc(k === 'tables' ? 'Test tables' : QZ.chTitle(s, k))}">${esc(l)}</button>`).join('')}</div>
    <h3 class="qb-title">${ch === 'tables' ? 'Chemistry test tables' : `${typeof ch === 'number' ? `Chapter ${esc(QZ.chLabel(s, ch))}: ` : ''}${esc(QZ.chTitle(s, ch))}`}</h3>
    <p class="fine">From ${QZ.SYLLABUS[s]}.</p>
    <div class="qb-body">${content}</div>
    <div class="sheet-f"><button class="btn" data-act="sheet-close">Close</button></div>`;
}

/* ───────────── session control ───────────── */

function qzBuild(item) {
  const card = QZ.BY_ID[item.id];
  const q = card.build();
  Object.assign(ui.qz, { q, answered: false, revealed: false, picked: null, correct: null });
  if (q.type === 'match') {
    const order = QZ.shuffle(q.pairs.map((_, i) => i));
    ui.qz.match = { left: q.pairs.map((p) => p[0]), right: order.map((i) => q.pairs[i][1]), answer: q.pairs.map((_, i) => order.indexOf(i)), done: [], sel: null, mistakes: 0, bad: null };
  }
}

function qzStart(queueIds) {
  const ids = (queueIds || qzTodayQueue()).filter((id) => QZ.BY_ID[id]);
  if (!ids.length) { toast('Nothing left for today. Practise more if you like.'); render(); return; }
  ui.qz = { active: true, queue: ids.map((id) => ({ id })), i: 0, results: [], undo: null };
  qzBuild(ui.qz.queue[0]);
  go('quiz');
  window.scrollTo({ top: 0 });
}

const qzReduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
function qzAdvance() {
  const Q = ui.qz;
  Q.i++;
  if (Q.i >= Q.queue.length) { ui.qz = { finished: true, results: Q.results }; render(); window.scrollTo({ top: 0 }); return; }
  qzBuild(Q.queue[Q.i]);
  renderQuiz();
  renderChrome();
  const top = document.querySelector('.qz-top');
  if (top && top.getBoundingClientRect().top < 0) top.scrollIntoView({ block: 'start' });
}

/* Multiple-choice and matching cards (the Chemistry picture deck): right = knew it, wrong = didn't know. */
function qzAnswer(correct) {
  const Q = ui.qz;
  const item = Q.queue[Q.i];
  Q.answered = true;
  Q.correct = correct;
  Q.undo = null;
  if (!item.relearn) {
    qzGrade(item.id, correct ? 2 : 0);
    Q.results.push({ id: item.id, g: correct ? 2 : 0, prompt: Q.q.prompt, explain: Q.q.explain });
    if (!correct) Q.queue.push({ id: item.id, relearn: true });
    commit({ noRender: true });
  }
  renderQuiz();
  renderChrome();
  const next = document.querySelector('.qz-next');
  if (next) next.scrollIntoView({ block: 'nearest', behavior: qzReduced() ? 'auto' : 'smooth' });
}

function qzGradeRecall(g) {
  const Q = ui.qz;
  if (!Q || !Q.active || !Q.revealed || Q.q.type !== 'recall') return;
  const item = Q.queue[Q.i];
  if (item.relearn) { qzAdvance(); return; }
  const t = todayISO();
  const clone = (x) => (x ? JSON.parse(JSON.stringify(x)) : null);
  Q.undo = { i: Q.i, id: item.id, t, rec: clone(state.quiz[item.id]), day: clone(state.qdays[t]), pushed: g === 0 };
  qzGrade(item.id, g);
  Q.results.push({ id: item.id, g, prompt: Q.q.prompt, explain: Q.q.answer });
  if (g === 0) Q.queue.push({ id: item.id, relearn: true });
  commit({ noRender: true });
  qzAdvance();
}

function qzUndo() {
  const Q = ui.qz;
  const U = Q && Q.undo;
  if (!U) return;
  setRec(`q/${U.id}`, U.rec);
  setRec(`qd/${U.t}`, U.day);
  Q.results.pop();
  if (U.pushed) Q.queue.pop();
  commit({ noRender: true });
  Q.i = U.i;
  qzBuild(Q.queue[Q.i]);
  Q.revealed = true;
  Q.undo = null;
  renderQuiz();
  renderChrome();
}

function qdSave() {
  const D = qdState();
  const t = todayISO();
  D.saved = {};
  for (const id of D.list) {
    const g = D.marks[id];
    if (g == null) continue;
    setRec(`q/${id}`, qzNextRec(qzRec(id), g, t));
    D.saved[id] = g;
  }
  D.view = 'done';
  commit();
  window.scrollTo({ top: 0 });
}

function quizClick(el, act, d) {
  const Q = ui.qz;
  const D = act.startsWith('qd-') ? qdState() : null;
  switch (act) {
    case 'qz-mode': ui.qzMode = d.m; if (d.m === 'defs') qdState().view = qdState().view === 'review' ? 'review' : 'home'; renderQuiz(); break;
    case 'qz-start': qzStart(); break;
    case 'qz-more': qzStart(qzPracticeSet({})); break;
    case 'qz-prac': {
      const f = { s: d.s || null, ch: d.ch != null && d.ch !== '' ? (/^\d+$/.test(d.ch) ? Number(d.ch) : d.ch) : null, t: d.t || null };
      const ids = qzPracticeSet(f);
      if (!ids.length) { toast('No cards there.'); break; }
      qzStart(ids);
      break;
    }
    case 'qz-toggle': {
      const { off } = qzCfg();
      const turningOff = !off.includes(d.s);
      if (turningOff && qzOnSubjects().length <= 1) { toast('Keep at least one subject in the quiz.'); break; }
      qzSetCfg({ off: turningOff ? [...off, d.s] : off.filter((x) => x !== d.s) });
      break;
    }
    case 'qz-ttoggle': {
      const { toff } = qzCfg();
      qzSetCfg({ toff: toff.includes(d.t) ? toff.filter((x) => x !== d.t) : [...toff, d.t] });
      break;
    }
    case 'qz-focus': {
      const { focus } = qzCfg();
      const cur = (focus[d.s] || []).map(String);
      const next = cur.includes(String(d.ch)) ? cur.filter((x) => x !== String(d.ch)) : [...cur, String(d.ch)];
      qzSetCfg({ focus: { ...focus, [d.s]: next } });
      toast(next.includes(String(d.ch)) ? `New ${qzSubjName(d.s)} cards will come from chapter ${QZ.chLabel(d.s, /^\d+$/.test(d.ch) ? Number(d.ch) : d.ch)} first.` : 'Chapter back in the usual order.');
      break;
    }
    case 'qz-sopen': ui.qzOpen = ui.qzOpen === d.s ? null : d.s; renderQuiz(); break;
    case 'qz-newn': qzSetCfg({ n: Number(d.n) }); break;
    case 'qz-show':
      if (!Q || !Q.active || Q.revealed) return;
      Q.revealed = true;
      renderQuiz();
      { const a = document.querySelector('.qz-grade') || document.querySelector('.qz-next'); if (a) a.scrollIntoView({ block: 'nearest', behavior: qzReduced() ? 'auto' : 'smooth' }); }
      break;
    case 'qz-g': qzGradeRecall(Number(d.g)); break;
    case 'qz-undo': qzUndo(); break;
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
    case 'qz-next': if (Q && Q.active) qzAdvance(); break;
    case 'qz-stop':
      ui.qz = Q && Q.results && Q.results.length ? { finished: true, results: Q.results } : null;
      render();
      break;
    case 'qz-home': ui.qz = null; render(); break;
    case 'qz-sheet': {
      const s = d.s || (ui.sheet && ui.sheet.kind === 'qzsheet' ? ui.sheet.s : null) || qzOnSubjects()[0];
      const ch = d.ch != null && d.ch !== '' ? (/^\d+$/.test(d.ch) ? Number(d.ch) : d.ch) : null;
      const was = ui.sheet && ui.sheet.kind === 'qzsheet';
      ui.sheet = { kind: 'qzsheet', s, ch };
      renderSheet();
      if (was) { const sh = document.querySelector('.sheet'); if (sh) sh.scrollTop = 0; }
      break;
    }
    /* written definitions */
    case 'qd-s': D.s = d.s; D.ch = null; renderQuiz(); break;
    case 'qd-mode': D.mode = d.m; renderQuiz(); break;
    case 'qd-ch': D.ch = /^\d+$/.test(d.ch) ? Number(d.ch) : d.ch; renderQuiz(); break;
    case 'qd-n': D.n = Number(d.n); renderQuiz(); break;
    case 'qd-start':
      D.list = qdPick(D.s, D.mode, D.ch, D.n);
      if (!D.list.length) return;
      D.marks = {};
      D.view = 'write';
      renderQuiz();
      window.scrollTo({ top: 0 });
      break;
    case 'qd-tomark': D.view = 'mark'; renderQuiz(); window.scrollTo({ top: 0 }); break;
    case 'qd-backwrite': D.view = 'write'; renderQuiz(); window.scrollTo({ top: 0 }); break;
    case 'qd-cancel': D.view = 'home'; renderQuiz(); break;
    case 'qd-g': {
      D.marks[d.id] = Number(d.g);
      const y = window.scrollY;
      renderQuiz();
      window.scrollTo({ top: y });
      break;
    }
    case 'qd-save': qdSave(); break;
    case 'qd-again': {
      const again = Object.keys(D.saved || {}).filter((id) => D.saved[id] < 2);
      D.list = again; D.marks = {}; D.view = 'write';
      renderQuiz();
      window.scrollTo({ top: 0 });
      break;
    }
    case 'qd-home': D.view = 'home'; renderQuiz(); window.scrollTo({ top: 0 }); break;
    case 'qd-review': D.view = 'review'; renderQuiz(); window.scrollTo({ top: 0 }); break;
    case 'qd-rf': D.rf = d.f; renderQuiz(); break;
    default: break;
  }
}

/* Keyboard: Space shows the answer; 1, 2, 3 mark it (didn't know, partly, knew it); U undoes. */
document.addEventListener('keydown', (ev) => {
  if (typeof ui === 'undefined' || ui.tab !== 'quiz' || ui.sheet || ev.metaKey || ev.ctrlKey || ev.altKey) return;
  const Q = ui.qz;
  if (!Q || !Q.active || !Q.q || Q.q.type !== 'recall') return;
  const ae = document.activeElement;
  if (ae && /INPUT|TEXTAREA|SELECT/.test(ae.tagName)) return;
  if (!Q.revealed && ev.key === ' ') { ev.preventDefault(); quizClick(null, 'qz-show', {}); return; }
  if (Q.revealed && ['1', '2', '3'].includes(ev.key)) { ev.preventDefault(); if (Q.queue[Q.i].relearn) qzAdvance(); else qzGradeRecall(Number(ev.key) - 1); return; }
  if ((ev.key === 'u' || ev.key === 'U') && Q.undo) { ev.preventDefault(); qzUndo(); }
});
