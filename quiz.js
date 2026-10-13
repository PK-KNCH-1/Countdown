/* Countdown — daily recall quiz.
   This file holds the quiz engine and the Chemistry deck (cation tests, anion tests, flame tests,
   solubility rules). Facts and wording follow the Cambridge IGCSE Chemistry 0620 syllabus for 2026–2028
   ("Notes for use in qualitative analysis" and the general solubility rules in 7.3).
   Other subjects live in qz-*.js and register themselves with QZ.addTopics / QZ.addCard / QZ.defs.

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

  /* Subjects in the quiz, in the order they're shown. Names and colours come from data.js (SUBJ). */
  const SUBJ_ORDER = ['chem', 'phys', 'bio', 'maths', 'econ'];
  const SYLLABUS = {
    chem: 'Cambridge IGCSE Chemistry 0620, 2026–2028 syllabus',
    phys: 'Cambridge IGCSE Physics 0625, 2026–2028 syllabus',
    bio: 'Cambridge IGCSE Biology 0610, 2026–2028 syllabus',
    maths: 'Cambridge IGCSE International Mathematics 0607 (Extended), 2025–2027 syllabus',
    econ: 'Cambridge IGCSE Economics 0455, 2027–2029 syllabus',
  };
  const TOPICS = {};
  function addTopics(s, map) { for (const [t, name] of Object.entries(map)) TOPICS[t] = { name, s }; }
  addTopics('chem', { cat: 'Cation tests', an: 'Anion tests', fl: 'Flame tests', sol: 'Solubility rules' });

  /* ── question bank ── */
  const CARDS = [];
  const BY_ID = {};
  function addCard(id, topic, build) {
    if (BY_ID[id]) throw new Error(`Duplicate quiz card ${id}`);
    if (!TOPICS[topic]) throw new Error(`Unknown quiz topic ${topic}`);
    const c = { id, topic, s: TOPICS[topic].s, build };
    CARDS.push(c);
    BY_ID[id] = c;
    return c;
  }
  const add = addCard;
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

  /* New questions are introduced in an order that mixes subjects, and topics within each subject, every day. */
  const roundRobin = (lists) => {
    const out = [];
    for (let i = 0; lists.some((l) => i < l.length); i++) for (const l of lists) if (i < l.length) out.push(l[i]);
    return out;
  };
  function subjectOrder(s) {
    const topics = Object.keys(TOPICS).filter((t) => TOPICS[t].s === s);
    return roundRobin(topics.map((t) => CARDS.filter((c) => c.topic === t).map((c) => c.id)));
  }
  function newOrder(subjects) { return roundRobin(subjects.map(subjectOrder)); }

  /* ── definitions: fill-in-the-key-words and name-the-term questions ──
     A definition is written with its key words in braces: 'the {net movement} of {water molecules} ...'.
     Each time it comes up, up to three key words are blanked and offered among tempting wrong words. */
  const OPPOSITE = {
    higher: 'lower', lower: 'higher', increase: 'decrease', decrease: 'increase', increases: 'decreases', decreases: 'increases',
    gain: 'loss', loss: 'gain', more: 'less', less: 'more', larger: 'smaller', smaller: 'larger', greater: 'smaller',
    maximum: 'minimum', minimum: 'maximum', positive: 'negative', negative: 'positive', protons: 'neutrons', neutrons: 'protons',
    single: 'double', double: 'single', identical: 'different', different: 'identical', same: 'different',
    completely: 'partially', partially: 'completely', donors: 'acceptors', acceptors: 'donors', oxidised: 'reduced', reduced: 'oxidised',
    oxidises: 'reduces', reduces: 'oxidises', haploid: 'diploid', diploid: 'haploid', 'two sets': 'a single set', 'a single set': 'two sets',
    soluble: 'insoluble', insoluble: 'soluble', 'one-way': 'two-way', towards: 'away from', fall: 'rise', rise: 'fall', fertile: 'identical',
    'unit mass': 'unit volume', 'unit volume': 'unit mass', 'unit area': 'unit length', 'unit time': 'unit distance', infinite: 'finite', finite: 'infinite',
    'next best': 'most expensive', sustained: 'one-off', willingness: 'need', ability: 'desire', 'third parties': 'consumers',
  };
  const KEYPOOL = {};
  const plainDef = (t) => t.replace(/[{}]/g, '');
  const boldDef = (t) => t.replace(/\{([^}]+)\}/g, '<b>$1</b>');
  function parseDef(text) {
    const parts = [];
    const re = /\{([^}]+)\}/g;
    let last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) parts.push({ t: text.slice(last, m.index) });
      parts.push({ k: m[1] });
      last = re.lastIndex;
    }
    if (last < text.length) parts.push({ t: text.slice(last) });
    return parts;
  }
  const lc = (w) => w.replace(/<[^>]+>/g, '').toLowerCase();
  function defExplain(d) {
    return `<p class="qz-def"><b class="qz-term">${d.term}</b> ${boldDef(d.text)}</p>${d.note ? `<p class="qz-note">${d.note}</p>` : ''}`;
  }
  /* Random filler words must never mean the same as an answer: skip near-synonyms and words that share
     most of their content words with an answer ("energy from sunlight" vs "energy from light"). */
  const SYN = [['rise', 'increase'], ['fall', 'decrease'], ['work done', 'energy'], ['energy transferred', 'energy'], ['time', 'time taken'], ['gametes', 'two gametes'], ['chemical reactions', 'metabolic reactions']];
  const STOP = new Set(['a', 'an', 'the', 'of', 'from', 'to', 'in', 'and', 'or', 'for', 'by', 'with', 'per', 'on', 'is', 'are', 'its', 'their']);
  const words = (w) => lc(w).split(/[^a-z0-9]+/).filter((x) => x && !STOP.has(x));
  function tooClose(w, answers) {
    const L = lc(w);
    for (const a of answers) {
      const A = lc(a);
      if (L.includes(A) || A.includes(L)) return true;
      if (SYN.some(([x, y]) => (x === L && y === A) || (x === A && y === L))) return true;
      const wa = new Set(words(a)), ww = words(w);
      const shared = ww.filter((x) => wa.has(x)).length;
      if (shared && shared / Math.min(wa.size, ww.length) >= 0.5) return true;
    }
    return false;
  }
  function clozeQ(s, d) {
    const parts = parseDef(d.text);
    const keyIdx = parts.map((p, i) => (p.k ? i : -1)).filter((i) => i >= 0);
    const blanks = keyIdx.length <= 3 ? keyIdx : shuffle(keyIdx.slice()).slice(0, 3).sort((a, b) => a - b);
    const answers = blanks.map((i) => parts[i].k);
    const taken = new Set(answers.map(lc));
    const wrong = [];
    const offer = (w) => { const L = lc(w); if (!taken.has(L) && !wrong.some((x) => lc(x) === L)) wrong.push(w); };
    (d.x || []).forEach(offer);
    answers.forEach((a) => { const o = OPPOSITE[lc(a)]; if (o) offer(o); });
    const want = answers.length + 1 + (answers.length > 1 ? 1 : 2);
    const pool = shuffle((KEYPOOL[s] || []).slice());
    const allKeys = keyIdx.map((i) => parts[i].k);
    for (const w of pool) { if (wrong.length >= want) break; if (!tooClose(w, allKeys)) offer(w); }
    const bank = shuffle([...answers, ...wrong.slice(0, want)]);
    // sw: groups of key words that may go in either order ("mass × velocity" = "velocity × mass")
    const swap = answers.map((a) => { const g = (d.sw || []).findIndex((grp) => grp.some((x) => lc(x) === lc(a))); return g >= 0 ? g : null; });
    return {
      type: 'cloze', prompt: `Fill in the key words: <b>${d.term.replace(/:$/, '')}</b>`, parts, blanks, answers, bank, swap,
      explain: defExplain(d),
    };
  }
  /* Mark each blank. Blanks in the same swap group are right if, together, they hold that group's words in any order. */
  function gradeCloze(q, chosen) {
    const ok = chosen.map((w, j) => w != null && lc(w) === lc(q.answers[j]));
    const groups = {};
    q.swap.forEach((g, j) => { if (g != null) (groups[g] = groups[g] || []).push(j); });
    for (const J of Object.values(groups)) {
      const left = J.map((j) => lc(q.answers[j]));
      for (const j of J) {
        const w = chosen[j] == null ? null : lc(chosen[j]);
        const k = w == null ? -1 : left.indexOf(w);
        ok[j] = k >= 0;
        if (k >= 0) left.splice(k, 1);
      }
    }
    return ok;
  }
  function nameQ(d, list) {
    const never = new Set([d.term, ...(d.nx || [])]);
    const same = list.filter((x) => !never.has(x.term) && x.g && x.g === d.g).map((x) => x.term);
    const rest = shuffle(list.filter((x) => !never.has(x.term) && !same.includes(x.term)).map((x) => x.term));
    const wrong = shuffle(same).slice(0, 3);
    for (const t of rest) { if (wrong.length >= 3) break; wrong.push(t); }
    return {
      prompt: `Which term is defined like this?<span class="qz-defq">${plainDef(d.text)}</span>`,
      ...mcq(d.term, wrong),
      explain: defExplain(d),
    };
  }
  /* defs(subject, topic, list): one fill-in card per definition, plus a name-the-term card for those in a group (g). */
  const DEFS = [];
  const defsOf = (s) => DEFS.filter((x) => x.s === s);
  function defs(s, topic, list) {
    for (const d of list) DEFS.push({ s, topic, d });
    const pool = KEYPOOL[s] || (KEYPOOL[s] = []);
    for (const d of list) for (const p of parseDef(d.text)) if (p.k && !pool.includes(p.k)) pool.push(p.k);
    for (const d of list) addCard(d.id, topic, () => clozeQ(s, d)).def = true;
    for (const d of list) if (d.g) addCard(`${d.id}-n`, topic, () => nameQ(d, list)).def = true;
  }
  const fr = (a, b) => `<span class="fr"><span>${a}</span><span>${b}</span></span>`;
  const SHEETS = {};

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

  return {
    CARDS, BY_ID, TOPICS, SUBJ_ORDER, SYLLABUS, SHEETS, CATIONS, ANIONS, FLAMES, RULES, GAS_TESTS,
    addTopics, addCard, defs, defsOf, defExplain, gradeCloze, boldDef, plainDef, newOrder, shuffle, mcq, pickDistinct, fr, tube, PC,
    catVisual, anVisual, solGridHTML, legendHTML, FL_HEX,
  };
})();

/* ───────────── settings and scheduling ───────────── */

const QZ_INTERVALS = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };
const QZ_MAX_DUE = 40;
const QZ_NEW_CHOICES = [10, 15, 20, 25, 30];
const QZ_NEW_DEFAULT = 20;

/* Settings sync as one record, qs/cfg:
   { off: [subjects switched off], n: new questions a day, defs: definition questions on (default off) }. */
function qzCfg() {
  const c = state.qset || {};
  const off = Array.isArray(c.off) ? c.off : [];
  return { off, n: QZ_NEW_CHOICES.includes(c.n) ? c.n : QZ_NEW_DEFAULT, defs: c.defs === true };
}
const qzSubjHas = (s) => QZ.CARDS.some((c) => c.s === s);
/* A card is in play when its subject is on, and, for definition cards, when definition questions are on. */
const qzCardIn = (c, cfg = qzCfg()) => cfg.defs || !c.def;
const qzSubjCards = (s, cfg = qzCfg()) => QZ.CARDS.filter((c) => c.s === s && qzCardIn(c, cfg));
function qzOnSubjects() { const cfg = qzCfg(); return QZ.SUBJ_ORDER.filter((s) => qzSubjCards(s, cfg).length && !cfg.off.includes(s)); }
const qzIsOn = (s) => qzOnSubjects().includes(s);

function qzRec(id) { return state.quiz[id]; }

function qzIntroducedToday() {
  const t = todayISO();
  return Object.values(state.quiz).filter((r) => r && r.f === t).length;
}

function qzDueToday(subjects) {
  const t = todayISO();
  const on = new Set(subjects || qzOnSubjects());
  const cfg = qzCfg();
  return QZ.CARDS.filter((c) => { const r = qzRec(c.id); return on.has(c.s) && qzCardIn(c, cfg) && r && r.d <= t; })
    .sort((a, b) => (qzRec(a.id).d.localeCompare(qzRec(b.id).d)) || (qzRec(a.id).b - qzRec(b.id).b))
    .slice(0, QZ_MAX_DUE).map((c) => c.id);
}

function qzNewToday(limit, subjects) {
  const n = limit != null ? limit : Math.max(0, qzCfg().n - qzIntroducedToday());
  const cfg = qzCfg();
  return QZ.newOrder(subjects || qzOnSubjects()).filter((id) => !qzRec(id) && qzCardIn(QZ.BY_ID[id], cfg)).slice(0, n);
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

function qzMasteryOf(cards) {
  const secure = cards.filter((c) => { const r = qzRec(c.id); return r && r.b >= 3; }).length;
  const seen = cards.filter((c) => qzRec(c.id)).length;
  return { total: cards.length, secure, seen };
}
const qzMastery = (topic) => qzMasteryOf(QZ.CARDS.filter((c) => c.topic === topic && qzCardIn(c)));
const qzSubjMastery = (s) => qzMasteryOf(qzSubjCards(s));

/* ───────────── rendering ───────────── */

const qzSubjName = (s) => (SUBJ[s] ? SUBJ[s].name : s);

function renderQuiz() {
  const el = $('#v-quiz');
  const Q = ui.qz;
  if (Q && Q.active) { el.innerHTML = qzSessionHTML(Q); return; }
  if (Q && Q.finished) { el.innerHTML = qzDoneHTML(Q); return; }
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
  el.innerHTML = `
    <div class="view-head"><h2 class="h">Daily quiz</h2></div>
    <p class="fine">A few minutes a day on the things you have to know by heart: tests, equations, values and definitions, worded the way each Cambridge syllabus words them.</p>
    <section class="block qz-today">
      ${left
        ? `<p class="qz-big"><b>${left}</b> question${left === 1 ? '' : 's'} today</p><p class="fine">${due ? `${due} to review` : 'Nothing to review yet'}${fresh ? `, ${fresh} new` : ''}. About ${Math.max(2, Math.round(left * 0.3))} minutes.</p>
           <div class="btn-row"><button class="btn primary" data-act="qz-start">${today && today.n ? 'Continue today’s quiz' : 'Start today’s quiz'}</button><button class="btn" data-act="qz-sheet">Cheat sheets</button></div>`
        : `<p class="qz-big"><b>Done</b> for today</p><p class="fine">${today ? `${today.c} of ${today.n} right today. ` : ''}${unseen ? `${unseen} questions you haven’t seen yet.` : 'You’ve seen every question.'}</p>
           <div class="btn-row"><button class="btn" data-act="qz-more">Practise 10 more</button><button class="btn" data-act="qz-sheet">Cheat sheets</button></div>`}
      <div class="qz-streakrow"><span class="qz-streak">${streak ? `${streak}-day streak` : 'Finish today’s quiz to start a streak'}</span>
        <span class="qz-days" aria-label="Last 14 days">${last14.map((d) => { const r = state.qdays[d]; return `<i class="${r && r.done ? 'on' : r && r.n ? 'part' : ''}${d === todayISO() ? ' today' : ''}" title="${fmtDate(d)}${r ? `: ${r.c}/${r.n}` : ''}"></i>`; }).join('')}</span></div>
    </section>
    <section class="block">
      <h3 class="h">Subjects</h3>
      <p class="fine">Switch a subject off to leave it out of the daily quiz. “Secure” means answered right at least three times in a row, with days in between.</p>
      <ul class="qz-slist">${subjects.map((s) => {
        const m = qzSubjMastery(s);
        const onlyDefs = !m.total; // e.g. Economics, which is all definitions
        const isOn = !cfg.off.includes(s) && !onlyDefs;
        const c = col(s);
        const topics = Object.keys(QZ.TOPICS).filter((t) => QZ.TOPICS[t].s === s && QZ.CARDS.some((x) => x.topic === t && qzCardIn(x, cfg)));
        if (onlyDefs) {
          return `<li class="qz-s off"><div class="qz-srow">
            <button class="qz-sw" role="switch" aria-checked="false" disabled aria-label="${esc(qzSubjName(s))} has only definition questions"><span aria-hidden="true"></span></button>
            <span class="qz-sname"><b>${esc(qzSubjName(s))}</b><small>Definitions only: on when definition questions are on</small></span>
            <button class="btn small" data-act="qz-sheet" data-s="${s}">Cheat sheet</button></div></li>`;
        }
        return `<li class="qz-s${isOn ? '' : ' off'}${open === s ? ' open' : ''}">
          <div class="qz-srow">
            <button class="qz-sw" role="switch" aria-checked="${isOn}" data-act="qz-toggle" data-s="${s}" aria-label="Include ${esc(qzSubjName(s))} in the daily quiz"><span aria-hidden="true"></span></button>
            <button class="qz-sname" data-act="qz-sopen" data-s="${s}" aria-expanded="${open === s}"><b>${esc(qzSubjName(s))}</b><small>${m.secure}/${m.total} secure${m.seen < m.total ? ` · ${m.total - m.seen} new` : ''}</small></button>
            <span class="tp-bar qz-sbar" aria-hidden="true"><i style="width:${m.total ? (m.secure / m.total) * 100 : 0}%;background:${c.bg}"></i><i class="seen" style="width:${m.total ? ((m.seen - m.secure) / m.total) * 100 : 0}%;background:${c.bg}"></i></span>
          </div>
          ${open === s ? `<ul class="tpapers qz-topics">${topics.map((t) => { const tm = qzMastery(t); return `<li><span>${esc(QZ.TOPICS[t].name)}</span><span class="tp-bar" aria-hidden="true"><i style="width:${(tm.secure / tm.total) * 100}%;background:${c.bg}"></i></span><span class="tp-n"><b>${tm.secure}</b>/${tm.total}</span></li>`; }).join('')}</ul>
            <div class="btn-row qz-sacts"><button class="btn small" data-act="qz-prac" data-s="${s}">Practise 10 ${esc(qzSubjName(s))}</button><button class="btn small" data-act="qz-sheet" data-s="${s}">${esc(qzSubjName(s))} cheat sheet</button></div>` : ''}
        </li>`;
      }).join('')}</ul>
      <div class="qz-defrow">
        <button class="qz-sw" role="switch" aria-checked="${cfg.defs}" data-act="qz-defs" aria-labelledby="qzDefLbl"><span aria-hidden="true"></span></button>
        <div><b id="qzDefLbl">Definition questions</b><small>${cfg.defs ? 'On: fill-in-the-key-words questions for Chemistry, Physics, Biology and Economics definitions.' : 'Off: learn definitions from your definitions document or the cheat sheets instead.'}</small></div>
      </div>
      <div class="qz-newrow"><span id="qzNewLbl">New questions a day</span>
        <div class="qz-seg" role="radiogroup" aria-labelledby="qzNewLbl">${QZ_NEW_CHOICES.map((n) => `<button role="radio" aria-checked="${cfg.n === n}" class="${cfg.n === n ? 'on' : ''}" data-act="qz-newn" data-n="${n}">${n}</button>`).join('')}</div>
      </div>
    </section>
    <section class="block qz-sheetcard">
      <div><h3 class="h">Cheat sheets</h3><p class="fine">Everything in the quiz on one page per subject. Read one before you start a new subject.</p></div>
      <div class="qz-sheetbtns">${subjects.map((s) => `<button class="btn small" data-act="qz-sheet" data-s="${s}" style="--sc:${col(s).bg}"><i class="sw" style="background:${col(s).bg}" aria-hidden="true"></i>${esc(qzSubjName(s))}</button>`).join('')}</div>
    </section>`;
}

/* Chemistry cheat sheet: the four test tables, then the definitions. */
function qzChemSheetHTML() {
  return `<div class="qz-sheet">
    <nav class="qz-jump" aria-label="Jump to">
      <button data-act="qz-jump" data-to="qzs-cat">Cations</button><button data-act="qz-jump" data-to="qzs-an">Anions</button><button data-act="qz-jump" data-to="qzs-fl">Flame tests</button><button data-act="qz-jump" data-to="qzs-sol">Solubility</button>${QZ.defsOf('chem').length ? '<button data-act="qz-jump" data-to="qzs-def">Definitions</button>' : ''}
    </nav>
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
    <p class="fine">Gas tests used above: carbon dioxide turns limewater milky; ammonia turns damp red litmus paper blue.</p>
    <h4 id="qzs-fl">Flame tests</h4>
    <ul class="qz-flames">${QZ.FLAMES.map((f) => `<li><i class="qzv-flame" style="--fc:${QZ.FL_HEX[f.id]}" aria-hidden="true"></i><span class="qz-ion">${f.ion} <small>${f.name}</small></span><b>${f.colour}</b></li>`).join('')}</ul>
    <p class="fine">The colour dots are only a memory aid. In the exam, use the colour words exactly as listed.</p>
    <h4 id="qzs-sol">Solubility rules for salts</h4>
    ${QZ.legendHTML('sol')}
    ${QZ.solGridHTML()}
    <p class="fine">“Most others” means salts of other metals, such as copper(II), iron or zinc. A dash means the six rules don’t cover it.</p>
    <ol class="qz-rules">${Object.values(QZ.RULES).map((r) => `<li>${r}</li>`).join('')}</ol>
    ${QZ.defsOf('chem').length ? `<h4 id="qzs-def">Definitions</h4>${qzDefsListHTML('chem')}` : ''}
  </div>`;
}
QZ.SHEETS.chem = qzChemSheetHTML;

/* Every definition for a subject, grouped by topic, key words in bold. */
function qzDefsListHTML(s, topics) {
  const groups = {};
  for (const { topic, d } of QZ.defsOf(s)) if (!topics || topics.includes(topic)) (groups[topic] = groups[topic] || []).push(d);
  return Object.entries(groups).map(([t, list]) => `<h5 class="qz-sh5">${esc(QZ.TOPICS[t].name.replace(/^Definitions: /, ''))}</h5>
    <dl class="qz-defs">${list.map((d) => `<div><dt>${d.term}</dt><dd>${QZ.boldDef(d.text)}${d.note ? `<small>${d.note}</small>` : ''}</dd></div>`).join('')}</dl>`).join('');
}

function qzSheetModalHTML(S) {
  const subjects = QZ.SUBJ_ORDER.filter(qzSubjHas);
  const s = subjects.includes(S && S.s) ? S.s : subjects[0];
  return `<div class="sheet-h"><h2 id="sheetTitle">${esc(qzSubjName(s))} cheat sheet</h2><button class="icon-btn" data-act="sheet-close" aria-label="Close">×</button></div>
    <div class="qz-stabs" role="tablist" aria-label="Subject">${subjects.map((x) => `<button role="tab" aria-selected="${x === s}" class="${x === s ? 'on' : ''}" data-act="qz-sheet" data-s="${x}" style="--sc:${col(x).bg}">${esc(qzSubjName(x))}</button>`).join('')}</div>
    <p class="fine">From the ${QZ.SYLLABUS[s]}. Key words are in bold: they are what the examiner looks for.</p>
    ${QZ.SHEETS[s] ? QZ.SHEETS[s]() : qzDefsListHTML(s)}
    <div class="sheet-f"><button class="btn" data-act="sheet-close">Close</button></div>`;
}

function qzClozeHTML(Q) {
  const q = Q.q, C = Q.cloze;
  const text = q.parts.map((p, i) => {
    if (p.t) return p.t;
    const j = q.blanks.indexOf(i);
    if (j < 0) return p.k;
    const f = C.fill[j];
    if (Q.answered) {
      const ok = C.ok[j];
      return `<span class="qz-blank ${ok ? 'right' : 'wrong'}">${ok ? q.bank[f] : `<s>${f != null ? q.bank[f] : '—'}</s> ${q.answers[j]}`}</span>`;
    }
    return `<button class="qz-blank${f != null ? ' full' : ''}${C.active === j ? ' active' : ''}" data-act="qz-bl" data-j="${j}" aria-label="${f != null ? `Blank ${j + 1}: ${lcText(q.bank[f])}. Tap to clear.` : `Blank ${j + 1}, empty`}">${f != null ? q.bank[f] : '&nbsp;'}</button>`;
  }).join('');
  const used = new Set(C.fill.filter((x) => x != null));
  const allFilled = C.fill.every((x) => x != null);
  return `<p class="qz-cloze">${text}</p>
    ${Q.answered ? '' : `<div class="qz-bank" aria-label="Word bank">${q.bank.map((w, i) => `<button class="qz-chip${used.has(i) ? ' used' : ''}" data-act="qz-ch" data-i="${i}" ${used.has(i) ? 'disabled' : ''}>${w}</button>`).join('')}</div>
      <p class="fine">${allFilled ? 'Happy with it? Check your answer.' : 'Tap a word to put it in the highlighted gap. Tap a filled gap to clear it.'}</p>
      ${allFilled ? '<button class="btn primary qz-check" data-act="qz-check">Check</button>' : ''}`}
    ${Q.answered ? `<div class="qz-fb ${Q.correct ? 'right' : 'wrong'}"><b>${Q.correct ? 'Correct' : `${C.ok.filter(Boolean).length} of ${C.ok.length} right`}</b><div class="qz-exp">${q.explain}</div></div>` : ''}`;
}
const lcText = (h) => String(h).replace(/<[^>]+>/g, '');

function qzOrderHTML(Q) {
  const q = Q.q, O = Q.order;
  const done = O.placed.length;
  return `<ol class="qz-placed">${q.items.map((it, i) => `<li class="${i < done ? 'ok' : ''}">${i < done ? it : '&nbsp;'}</li>`).join('')}</ol>
    ${Q.answered ? '' : `<div class="qz-bank">${O.shuffled.map((i) => `<button class="qz-chip${O.placed.includes(i) ? ' used' : ''}${O.bad === i ? ' bad' : ''}" data-act="qz-or" data-i="${i}" ${O.placed.includes(i) ? 'disabled' : ''}>${q.items[i]}</button>`).join('')}</div>
      <p class="fine">Tap them in order, starting with ${q.first}.</p>`}
    ${Q.answered ? `<div class="qz-fb ${O.mistakes ? 'wrong' : 'right'}"><b>${O.mistakes ? `In order, with ${O.mistakes} slip${O.mistakes === 1 ? '' : 's'}` : 'All in order first time'}</b><div class="qz-exp">${q.explain}</div></div>` : ''}`;
}

function qzSessionHTML(Q) {
  const item = Q.queue[Q.i];
  const q = Q.q;
  const total = Q.queue.length;
  const pct = (Q.i / total) * 100;
  const card = QZ.BY_ID[item.id];
  let body;
  if (q.type === 'match') {
    const m = Q.match;
    body = `<div class="qz-match">
      <div class="qz-col">${m.left.map((L, i) => `<button class="qz-m${m.done.includes(i) ? ' ok' : ''}${m.sel === i ? ' sel' : ''}${m.bad && m.bad[0] === i ? ' bad' : ''}" data-act="qz-ml" data-i="${i}" ${m.done.includes(i) ? 'disabled' : ''}>${L}</button>`).join('')}</div>
      <div class="qz-col">${m.right.map((R, j) => { const usedBy = m.done.find((i) => m.answer[i] === j); return `<button class="qz-m${usedBy != null ? ' ok' : ''}${m.bad && m.bad[1] === j ? ' bad' : ''}" data-act="qz-mr" data-j="${j}" ${usedBy != null ? 'disabled' : ''}>${R}</button>`; }).join('')}</div>
    </div>
    ${Q.answered ? `<div class="qz-fb ${m.mistakes ? 'wrong' : 'right'}"><b>${m.mistakes ? `Matched with ${m.mistakes} mistake${m.mistakes === 1 ? '' : 's'}` : 'All matched first time'}</b><div class="qz-exp">${q.explain}</div></div>` : `<p class="fine">Tap an item on the left, then its match on the right.</p>`}`;
  } else if (q.type === 'cloze') {
    body = qzClozeHTML(Q);
  } else if (q.type === 'order') {
    body = qzOrderHTML(Q);
  } else {
    body = `${q.visual ? `<div class="qz-visual">${q.visual}</div>` : ''}<div class="qz-opts">${q.options.map((o, i) => {
      let cls = 'qz-opt';
      if (Q.answered) { if (o.correct) cls += ' right'; else if (i === Q.picked) cls += ' wrong'; }
      return `<button class="${cls}" data-act="qz-pick" data-i="${i}" ${Q.answered ? 'disabled' : ''}>${o.html}</button>`;
    }).join('')}</div>
    ${Q.answered ? `<div class="qz-fb ${q.options[Q.picked].correct ? 'right' : 'wrong'}"><b>${q.options[Q.picked].correct ? 'Correct' : 'Not quite'}</b><div class="qz-exp">${q.explain}</div></div>` : ''}`;
  }
  return `<div class="qz-top">
      <button class="link" data-act="qz-stop">Stop for now</button>
      <button class="link" data-act="qz-sheet" data-s="${card.s}">Cheat sheet</button>
      <span class="qz-prog" aria-hidden="true"><i style="width:${pct}%"></i></span>
      <span class="qz-count">${Q.i + 1} of ${total}</span>
    </div>
    <section class="block qz-card" style="--qc:${col(card.s).bg}">
      <p class="qz-topic"><i class="sw" style="background:${col(card.s).bg}" aria-hidden="true"></i>${esc(qzSubjName(card.s))} · ${esc(QZ.TOPICS[card.topic].name)}${item.relearn ? ' · one more try' : ''}${!qzRec(item.id) && !item.relearn ? ' · new' : ''}</p>
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
  return `<div class="view-head"><h2 class="h">Daily quiz</h2></div>
    <section class="block qz-today">
      <p class="qz-big"><b>${right}</b> of ${Q.results.length} right</p>
      <p class="fine">${left ? `${left} still to do today.` : `Today’s quiz is done.${streak ? ` ${streak}-day streak.` : ''}`} Questions you missed come back tomorrow.</p>
      <div class="btn-row">${left ? '<button class="btn primary" data-act="qz-start">Keep going</button>' : '<button class="btn" data-act="qz-more">Practise 10 more</button>'}<button class="btn" data-act="qz-home">Back to quiz home</button></div>
    </section>
    ${wrong.length ? `<section class="block"><h3 class="h">Worth another look</h3><ul class="qz-review">${wrong.map((r) => `<li><p>${r.prompt}</p><div class="qz-ans">${r.explain}</div></li>`).join('')}</ul></section>` : ''}`;
}

/* ───────────── session control ───────────── */

function qzBuild(item) {
  const card = QZ.BY_ID[item.id];
  const q = card.build();
  ui.qz.q = q;
  ui.qz.answered = false;
  ui.qz.picked = null;
  ui.qz.correct = null;
  if (q.type === 'match') {
    const order = QZ.shuffle(q.pairs.map((_, i) => i));
    ui.qz.match = {
      left: q.pairs.map((p) => p[0]),
      right: order.map((i) => q.pairs[i][1]),
      answer: q.pairs.map((_, i) => order.indexOf(i)),
      done: [], sel: null, mistakes: 0, bad: null,
    };
  }
  if (q.type === 'cloze') ui.qz.cloze = { fill: q.blanks.map(() => null), active: 0, ok: [] };
  if (q.type === 'order') ui.qz.order = { shuffled: QZ.shuffle(q.items.map((_, i) => i)), placed: [], mistakes: 0, bad: null };
}

function qzStart(queueIds) {
  const ids = (queueIds || qzTodayQueue()).filter((id) => QZ.BY_ID[id]);
  if (!ids.length) { toast('Nothing left for today. Practise more if you like.'); render(); return; }
  ui.qz = { active: true, queue: ids.map((id) => ({ id })), i: 0, results: [] };
  qzBuild(ui.qz.queue[0]);
  go('quiz');
}

function qzAnswer(correct) {
  const Q = ui.qz;
  const item = Q.queue[Q.i];
  Q.answered = true;
  Q.correct = correct;
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

/* Ten questions to practise: unseen ones first (in the usual order), then the weakest ones you've seen. */
function qzPracticeSet(subjects, n = 10) {
  const cfg = qzCfg();
  const fresh = QZ.newOrder(subjects).filter((id) => !qzRec(id) && qzCardIn(QZ.BY_ID[id], cfg)).slice(0, n);
  if (fresh.length >= n) return QZ.shuffle(fresh);
  const seen = QZ.shuffle(QZ.CARDS.filter((c) => subjects.includes(c.s) && qzCardIn(c, cfg) && qzRec(c.id)).map((c) => c.id))
    .sort((a, b) => (qzRec(a).b || 0) - (qzRec(b).b || 0)).slice(0, n - fresh.length);
  return QZ.shuffle(fresh.concat(seen));
}

function qzSetCfg(patch) {
  const c = { ...qzCfg(), ...patch };
  setRec('qs/cfg', { off: c.off, n: c.n, defs: c.defs });
  commit();
}

function quizClick(el, act, d) {
  const Q = ui.qz;
  switch (act) {
    case 'qz-start': qzStart(); break;
    case 'qz-more': qzStart(qzPracticeSet(qzOnSubjects())); break;
    case 'qz-prac': qzStart(qzPracticeSet([d.s])); break;
    case 'qz-toggle': {
      const { off } = qzCfg();
      const turningOff = !off.includes(d.s);
      if (turningOff && qzOnSubjects().length <= 1) { toast('Keep at least one subject in the quiz.'); break; }
      qzSetCfg({ off: turningOff ? [...off, d.s] : off.filter((x) => x !== d.s) });
      break;
    }
    case 'qz-sopen': ui.qzOpen = ui.qzOpen === d.s ? null : d.s; renderQuiz(); break;
    case 'qz-newn': qzSetCfg({ n: Number(d.n) }); break;
    case 'qz-defs': {
      const on = !qzCfg().defs;
      qzSetCfg({ defs: on });
      toast(on ? 'Definition questions are back in the daily quiz.' : 'Definition questions are off. Your progress on them is kept.');
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
    case 'qz-ch': {
      if (!Q || Q.answered || !Q.cloze) return;
      const C = Q.cloze;
      let j = C.active != null && C.fill[C.active] == null ? C.active : C.fill.indexOf(null);
      if (j < 0) return;
      C.fill[j] = Number(d.i);
      const nextEmpty = C.fill.findIndex((x, k) => x == null && k > j);
      C.active = nextEmpty >= 0 ? nextEmpty : C.fill.indexOf(null);
      renderQuiz();
      break;
    }
    case 'qz-bl': {
      if (!Q || Q.answered || !Q.cloze) return;
      const j = Number(d.j);
      Q.cloze.fill[j] = null;
      Q.cloze.active = j;
      renderQuiz();
      break;
    }
    case 'qz-check': {
      if (!Q || Q.answered || !Q.cloze) return;
      const C = Q.cloze;
      C.ok = QZ.gradeCloze(Q.q, C.fill.map((f) => (f == null ? null : Q.q.bank[f])));
      qzAnswer(C.ok.every(Boolean));
      break;
    }
    case 'qz-or': {
      if (!Q || Q.answered || !Q.order) return;
      const O = Q.order, i = Number(d.i);
      if (i === O.placed.length) {
        O.placed.push(i); O.bad = null;
        if (O.placed.length === Q.q.items.length) { qzAnswer(O.mistakes === 0); return; }
      } else {
        O.mistakes++; O.bad = i;
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
    case 'qz-sheet': {
      const s = d.s || ui.qzSheetS || qzOnSubjects()[0];
      ui.qzSheetS = s;
      const was = ui.sheet && ui.sheet.kind === 'qzsheet';
      ui.sheet = { kind: 'qzsheet', s };
      renderSheet();
      if (was) { const sh = document.querySelector('.sheet'); if (sh) sh.scrollTop = 0; }
      break;
    }
    case 'qz-jump': {
      const t = document.getElementById(d.to);
      if (t) t.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      break;
    }
    default: break;
  }
}
