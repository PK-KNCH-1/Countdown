/* Countdown — static exam data.
   Everything here describes the Cambridge IGCSE Feb/March 2027 series, Zone 4 (India).
   Nothing in this file is personal data. */

const SUBJECTS = [
  { id: 'bio', code: 'BI', name: 'Biology', syl: '0610', hue: 150, papers: [
    { id: 'p2', n: 2, name: 'Multiple choice' },
    { id: 'p4', n: 4, name: 'Theory' },
    { id: 'p6', n: 6, name: 'Alternative to Practical' } ] },
  { id: 'chem', code: 'CH', name: 'Chemistry', syl: '0620', hue: 20, papers: [
    { id: 'p2', n: 2, name: 'Multiple choice' },
    { id: 'p4', n: 4, name: 'Theory' },
    { id: 'p6', n: 6, name: 'Alternative to Practical' } ] },
  { id: 'phys', code: 'PH', name: 'Physics', syl: '0625', hue: 205, papers: [
    { id: 'p2', n: 2, name: 'Multiple choice' },
    { id: 'p4', n: 4, name: 'Theory' },
    { id: 'p6', n: 6, name: 'Alternative to Practical' } ] },
  { id: 'ict', code: 'IC', name: 'ICT', syl: '0417', hue: 262, papers: [
    { id: 'p1', n: 1, name: 'Theory' },
    { id: 'p2', n: 2, name: 'Practical A' },
    { id: 'p3', n: 3, name: 'Practical B' } ] },
  { id: 'maths', code: 'MA', name: 'Mathematics', syl: '0607', hue: 45, papers: [
    { id: 'p2', n: 2, name: 'Extended' },
    { id: 'p4', n: 4, name: 'Extended' },
    { id: 'p6', n: 6, name: 'Extended' } ] },
  { id: 'econ', code: 'EC', name: 'Economics', syl: '0455', hue: 320, papers: [
    { id: 'p1', n: 1, name: 'Multiple choice' },
    { id: 'p2', n: 2, name: 'Structured questions' } ] },
  { id: 'tamil', code: 'TA', name: 'Tamil', syl: null, hue: 95, papers: [
    { id: 'p1', n: 1, name: 'Paper 1' },
    { id: 'p2', n: 2, name: 'Paper 2' } ] },
  { id: 'eng', code: 'EN', name: 'English', syl: '0500', hue: 355, papers: [
    { id: 'p1', n: 1, name: 'Reading' },
    { id: 'p2', n: 2, name: 'Writing' } ] },
];

/* Display order: most recent series first within a year. */
const SERIES = [
  { id: 'ON', name: 'Oct/Nov', long: 'October/November', month: 10 },
  { id: 'MJ', name: 'May/June', long: 'May/June', month: 5 },
  { id: 'FM', name: 'Feb/March', long: 'February/March', month: 2 },
];

const YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016];
const TARGET_YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
/* Subjects whose past papers go further back than YEARS. Tamil: May/June, Paper 1 and Paper 2, from 2010. */
const EXTRA_YEARS = { tamil: [2015, 2014, 2013, 2012, 2011, 2010] };

/* Which variants genuinely exist, by subject → series → paper. */
const PP_AVAILABILITY = (() => {
  const std = (ids) => ({
    FM: Object.fromEntries(ids.map((p) => [p, [2]])),
    MJ: Object.fromEntries(ids.map((p) => [p, [1, 2, 3]])),
    ON: Object.fromEntries(ids.map((p) => [p, [1, 2, 3]])),
  });
  return {
    bio: std(['p2', 'p4', 'p6']),
    chem: std(['p2', 'p4', 'p6']),
    phys: std(['p2', 'p4', 'p6']),
    maths: std(['p2', 'p4', 'p6']),
    econ: std(['p1', 'p2']),
    eng: std(['p1', 'p2']),
    ict: {
      FM: { p1: [2], p2: [1], p3: [1] },
      MJ: { p1: [1, 2, 3], p2: [1, 2], p3: [1, 2] },
      ON: { p1: [1, 2, 3], p2: [2], p3: [3] },
    },
    tamil: {
      FM: {},
      MJ: { p1: [1], p2: [1] },
      ON: {},
    },
  };
})();

/* ICT practicals are made of sections that can be practised on their own (syllabus 0417 sections
   17–21; older papers call databases "data manipulation" and spreadsheets "data analysis").
   Each section is ticked off separately and counts as its share of the paper. */
const PAPER_PARTS = {
  ict_p2: [
    { id: 'doc', name: 'Document production', short: 'Documents' },
    { id: 'db', name: 'Databases', short: 'Database' },
    { id: 'pres', name: 'Presentations', short: 'Presentation' },
  ],
  ict_p3: [
    { id: 'ss', name: 'Spreadsheets', short: 'Spreadsheet' },
    { id: 'web', name: 'Website authoring', short: 'Website' },
  ],
  // Tamil Paper 1 (Composition): Section A is question 1 (a)–(c), Section B is question 2 (a)–(d).
  // The exam asks for one of each; practising them all gives seven pieces, written one at a time.
  tamil_p1: [
    { id: '1a', name: 'Section A 1(a)', short: '1a' },
    { id: '1b', name: 'Section A 1(b)', short: '1b' },
    { id: '1c', name: 'Section A 1(c)', short: '1c' },
    { id: '2a', name: 'Section B 2(a)', short: '2a' },
    { id: '2b', name: 'Section B 2(b)', short: '2b' },
    { id: '2c', name: 'Section B 2(c)', short: '2c' },
    { id: '2d', name: 'Section B 2(d)', short: '2d' },
  ],
};
/* What one part is called, where it isn't a section. */
const PART_WORD = { tamil_p1: 'question' };

/* The official final timetable, Zone 4 (India), Feb/March 2027. */
const EXAMS = [
  { date: '2027-01-27', s: 'ict', p: 'p2', title: 'Practical Test A', code: '0417/21', session: 'Morning', time: '10:00 am–12:15 pm', dur: '2h 15m' },
  { date: '2027-02-02', s: 'ict', p: 'p3', title: 'Practical Test B', code: '0417/31', session: 'Morning', time: '10:00 am–12:15 pm', dur: '2h 15m' },
  { date: '2027-02-03', s: 'maths', p: 'p2', title: 'Paper 2 Non-calculator (Extended)', code: '0607/22', session: 'Morning', time: '10:00–11:30 am', dur: '1h 30m' },
  { date: '2027-02-04', s: 'phys', p: 'p6', title: 'Alternative to Practical', code: '0625/62', session: 'Morning', time: '10:00–11:00 am', dur: '1h' },
  { date: '2027-02-05', s: 'chem', p: 'p4', title: 'Theory (Extended)', code: '0620/42', session: 'Morning', time: '10:00–11:15 am', dur: '1h 15m' },
  { date: '2027-02-08', s: 'eng', p: 'p1', title: 'Reading', code: '0500/12', session: 'Morning', time: '10:00 am–12 noon', dur: '2h' },
  { date: '2027-02-08', s: 'ict', p: 'p1', title: 'Theory', code: '0417/12', session: 'Afternoon', time: '1:15–2:45 pm', dur: '1h 30m' },
  { date: '2027-02-09', s: 'chem', p: 'p6', title: 'Alternative to Practical', code: '0620/62', session: 'Morning', time: '10:00–11:00 am', dur: '1h' },
  { date: '2027-02-10', s: 'eng', p: 'p2', title: 'Directed Writing and Composition', code: '0500/22', session: 'Morning', time: '10:00 am–12 noon', dur: '2h' },
  { date: '2027-02-12', s: 'phys', p: 'p4', title: 'Theory (Extended)', code: '0625/42', session: 'Morning', time: '10:00–11:15 am', dur: '1h 15m' },
  { date: '2027-02-15', s: 'maths', p: 'p4', title: 'Paper 4 Calculator (Extended)', code: '0607/42', session: 'Morning', time: '10:00–11:30 am', dur: '1h 30m' },
  { date: '2027-02-16', s: 'bio', p: 'p6', title: 'Alternative to Practical', code: '0610/62', session: 'Morning', time: '10:00–11:00 am', dur: '1h' },
  { date: '2027-02-17', s: 'econ', p: 'p2', title: 'Structured Questions', code: '0455/22', session: 'Morning', time: '10:00 am–12 noon', dur: '2h' },
  { date: '2027-02-18', s: 'bio', p: 'p4', title: 'Theory (Extended)', code: '0610/42', session: 'Morning', time: '10:00–11:15 am', dur: '1h 15m' },
  { date: '2027-02-23', s: 'maths', p: 'p6', title: 'Paper 6 Investigation and Modelling (Extended)', code: '0607/62', session: 'Morning', time: '10:00–11:30 am', dur: '1h 30m' },
  { date: '2027-02-26', s: 'phys', p: 'p2', title: 'Multiple Choice (Extended)', code: '0625/22', session: 'Morning', time: '10:00–10:45 am', dur: '45m' },
  { date: '2027-03-01', s: 'econ', p: 'p1', title: 'Multiple Choice', code: '0455/12', session: 'Morning', time: '10:00–11:00 am', dur: '1h' },
  { date: '2027-03-03', s: 'chem', p: 'p2', title: 'Multiple Choice (Extended)', code: '0620/22', session: 'Morning', time: '10:00–10:45 am', dur: '45m' },
  { date: '2027-03-04', s: 'bio', p: 'p2', title: 'Multiple Choice (Extended)', code: '0610/22', session: 'Morning', time: '10:00–10:45 am', dur: '45m' },
];
/* Times are the school's (The Indian Public School, Karur, timetable v1): be there 30 minutes before. */

/* School exams (The Indian Public School, Karur), not Cambridge papers. They show in the hero, a Stats
   tile, the calendar and the day sheet; they don't change targets, deadlines or "days left".
   at = start time (24-hour, for ordering); short = how the paper is named in one-line summaries. */
const SCHOOL_EXAM = { name: 'Model Exam I', full: 'Grade X Model Examination I, November 2026' };
const SCHOOL_EXAMS = [
  { date: '2026-11-02', at: '09:00', s: 'eng', p: 'p1', title: 'Paper 1 (FLE)', short: 'P1', time: '9:00–11:00 am', dur: '2h' },
  { date: '2026-11-02', at: '11:30', s: 'phys', p: 'p2', title: 'Paper 2', short: 'P2', time: '11:30 am–12:15 pm', dur: '45m' },
  { date: '2026-11-02', at: '13:30', s: 'phys', p: 'p6', title: 'Paper 6', short: 'P6', time: '1:30–2:30 pm', dur: '1h' },
  { date: '2026-11-03', at: '09:00', s: 'tamil', p: 'p1', title: 'Paper 1', short: 'P1', time: '9:00–11:00 am', dur: '2h' },
  { date: '2026-11-03', at: '11:15', s: 'tamil', p: 'p2', title: 'Paper 2', short: 'P2', time: '11:15 am–1:15 pm', dur: '2h' },
  { date: '2026-11-04', at: '09:00', s: 'econ', p: 'p1', title: 'Paper 1', short: 'P1', time: '9:00–9:45 am', dur: '45m' },
  { date: '2026-11-04', at: '10:00', s: 'econ', p: 'p2', title: 'Paper 2', short: 'P2', time: '10:00 am–12:15 pm', dur: '2h 15m' },
  { date: '2026-11-05', at: '09:00', s: 'ict', p: 'p3', title: 'Paper 3 Practical B', short: 'P3', time: '9:00–11:15 am', dur: '2h 15m' },
  { date: '2026-11-05', at: '13:00', s: 'ict', p: 'p1', title: 'Paper 1 Theory', short: 'P1', time: '1:00–2:30 pm', dur: '1h 30m' },
  { date: '2026-11-06', at: '09:00', s: 'maths', p: 'p2', title: 'Paper 2', short: 'P2', time: '9:00–10:30 am', dur: '1h 30m' },
  { date: '2026-11-06', at: '10:45', s: 'maths', p: 'p4', title: 'Paper 4', short: 'P4', time: '10:45 am–12:15 pm', dur: '1h 30m' },
  { date: '2026-11-06', at: '13:00', s: 'maths', p: 'p6', title: 'Paper 6', short: 'P6', time: '1:00–2:30 pm', dur: '1h 30m' },
  { date: '2026-11-10', at: '09:00', s: 'ict', p: 'p2', title: 'Paper 2 Practical A', short: 'P2', time: '9:00–11:15 am', dur: '2h 15m' },
  { date: '2026-11-10', at: '12:30', s: 'eng', p: 'p2', title: 'Paper 2 (FLE)', short: 'P2', time: '12:30–2:30 pm', dur: '2h' },
  { date: '2026-11-11', at: '09:00', s: 'bio', p: 'p2', title: 'Paper 2', short: 'P2', time: '9:00–9:45 am', dur: '45m' },
  { date: '2026-11-11', at: '10:00', s: 'bio', p: 'p4', title: 'Paper 4', short: 'P4', time: '10:00–11:15 am', dur: '1h 15m' },
  { date: '2026-11-11', at: '13:30', s: 'bio', p: 'p6', title: 'Paper 6', short: 'P6', time: '1:30–2:30 pm', dur: '1h' },
  { date: '2026-11-12', at: '13:15', s: 'phys', p: 'p4', title: 'Paper 4', short: 'P4', time: '1:15–2:30 pm', dur: '1h 15m' },
  { date: '2026-11-16', at: '09:00', s: 'chem', p: 'p2', title: 'Paper 2', short: 'P2', time: '9:00–9:45 am', dur: '45m' },
  { date: '2026-11-16', at: '10:00', s: 'chem', p: 'p4', title: 'Paper 4', short: 'P4', time: '10:00–11:15 am', dur: '1h 15m' },
  { date: '2026-11-16', at: '13:30', s: 'chem', p: 'p6', title: 'Paper 6', short: 'P6', time: '1:30–2:30 pm', dur: '1h' },
];

/* Calendar range shown in the app (inclusive months). */
const CAL_START = { y: 2026, m: 8 };  // September 2026 (0-based month)
const CAL_END = { y: 2027, m: 3 };    // April 2027

/* Revision tracker: each subject's units, in groups ({ g: heading, u: [id, name, number shown] }).
   Physics, Chemistry, Biology and Maths follow the chapters of the revision notes (the same chapters
   as the quiz); Economics (0455, 2027–2029), ICT (0417, 2026–2028), English (0500, 2027–2029) and
   Tamil (3226) follow their syllabuses. Ids are stored with each unit's status, so never reuse one. */
const UNITS = {
  bio: [{ g: '', u: [
    ['1', 'Characteristics and classification of living organisms'], ['2', 'Cells'], ['3', 'Movement into and out of cells'],
    ['4', 'Biological molecules'], ['5', 'Enzymes'], ['6', 'Plant nutrition'], ['7', 'Human nutrition'],
    ['8', 'Transport in plants'], ['9', 'Transport in animals'], ['10', 'Diseases and immunity'],
    ['11', 'Respiration and gas exchange'], ['12', 'Coordination and response'], ['13', 'Excretion and homeostasis'],
    ['14', 'Reproduction in plants'], ['15', 'Reproduction in humans'], ['16', 'Chromosomes, genes and proteins'],
    ['17', 'Variation and selection (and drugs)'], ['18', 'Organisms and their environment'],
    ['19', 'Human influences on ecosystems'], ['20', 'Biotechnology and genetic modification'],
  ] }],
  chem: [{ g: '', u: [
    ['1', 'States of matter'], ['2', 'Atomic structure'], ['3', 'Chemical bonding'], ['4', 'Chemical formulae and equations'],
    ['5', 'Chemical calculations'], ['6', 'Electrochemistry'], ['7', 'Chemical energetics'], ['8', 'Rates of reaction'],
    ['9', 'Reversible reactions and equilibrium'], ['10', 'Redox reactions'], ['11', 'Acids and bases'],
    ['12', 'Preparation of salts'], ['13', 'The Periodic Table'], ['14', 'Metallic elements and alloys'],
    ['15', 'Reactivity of metals'], ['16', 'Extraction and corrosion of metals'], ['17', 'Chemistry of our environment'],
    ['18', 'Introduction to organic chemistry'], ['19', 'Reactions of organic compounds'], ['20', 'Petrochemicals and polymers'],
    ['21', 'Experimental design and separation techniques'], ['22', 'Chemical analysis'],
  ] }],
  phys: [{ g: '', u: [
    ['1', 'Making measurements'], ['2', 'Describing motion'], ['3', 'Forces and motion'], ['4', 'Turning effects of forces'],
    ['5', 'Forces and matter'], ['6', 'Energy stores and transfers'], ['7', 'Energy resources'], ['8', 'Work and power'],
    ['9', 'The kinetic particle model of matter'], ['10', 'Thermal properties of matter'], ['11', 'Thermal energy transfers'],
    ['12', 'Sound'], ['13', 'Light'], ['14', 'Properties of waves'], ['15', 'The electromagnetic spectrum'],
    ['16', 'Magnetism'], ['17', 'Static electricity'], ['18', 'Electrical quantities'],
    ['19', 'Electric circuits and electrical safety'], ['20', 'Electromagnetic forces'], ['21', 'Electromagnetic induction'],
    ['22', 'The nuclear atom'], ['23', 'Radioactivity'], ['24', 'Earth and the Solar System'], ['25', 'Stars and the Universe'],
  ] }],
  ict: [
    { g: 'Theory (Paper 1)', u: [
      ['1', 'Types and components of computer systems'], ['2', 'Input and output devices'], ['3', 'Storage devices and media'],
      ['4', 'Networks and the effects of using them'], ['5', 'The effects of using IT'], ['6', 'ICT applications'],
      ['7', 'The systems life cycle'], ['8', 'Safety and security'], ['9', 'Audience'], ['10', 'Communication'],
    ] },
    { g: 'Practical skills (Papers 2 and 3)', u: [
      ['11', 'File management'], ['12', 'Images'], ['13', 'Layout'], ['14', 'Styles'], ['15', 'Proofing'],
      ['16', 'Graphs and charts'], ['17', 'Document production'], ['18', 'Databases'], ['19', 'Presentations'],
      ['20', 'Spreadsheets'], ['21', 'Website authoring'],
    ] },
  ],
  maths: [{ g: '', u: [
    ['1-2', 'Number', '1–2'], ['3', 'Using number'], ['4', 'Angles and bearings'], ['5', 'Triangles, quadrilaterals and polygons'],
    ['6', 'Indices, standard form and surds'], ['7', 'Introduction to algebra'], ['8', 'Simultaneous linear equations'],
    ['9', 'Symmetry, congruency and similarity'], ['10', 'Pythagoras’ theorem'], ['11', 'Coordinate geometry'],
    ['12', 'Mensuration'], ['13', 'Quadratic equations'], ['14', 'Functions 1'], ['15', 'Trigonometry'],
    ['16', 'Circle properties'], ['17', 'Vectors and transformations'], ['18', 'Sets'], ['19', 'Descriptive statistics'],
    ['20', 'Cumulative frequency diagrams and linear regression'], ['21', 'Probability'], ['22', 'Sequences'],
    ['23', 'Functions 2'], ['24', 'Modelling'],
  ] }],
  econ: [
    { g: '1 The basic economic problem', u: [
      ['1.1', 'The nature of the basic economic problem'], ['1.2', 'Factors of production'], ['1.3', 'Opportunity cost'],
      ['1.4', 'Production possibility curve (PPC) diagrams'],
    ] },
    { g: '2 The allocation of resources', u: [
      ['2.1', 'The role of markets in allocating resources'], ['2.2', 'Demand'], ['2.3', 'Supply'], ['2.4', 'Price determination'],
      ['2.5', 'Price changes'], ['2.6', 'Price elasticity of demand (PED)'], ['2.7', 'Price elasticity of supply (PES)'],
      ['2.8', 'Market economic system'], ['2.9', 'Market failure'], ['2.10', 'Mixed economic system'],
    ] },
    { g: '3 Microeconomic decision-makers', u: [
      ['3.1', 'Money and banking'], ['3.2', 'Households'], ['3.3', 'Workers'], ['3.4', 'Firms'], ['3.5', 'Firms and production'],
      ['3.6', 'Firms’ costs, revenue and objectives'], ['3.7', 'Types of markets'],
    ] },
    { g: '4 Government and the macroeconomy', u: [
      ['4.1', 'Government macroeconomic intervention'], ['4.2', 'Fiscal policy'], ['4.3', 'Monetary policy'],
      ['4.4', 'Supply-side policy'], ['4.5', 'Economic growth'], ['4.6', 'Employment and unemployment'], ['4.7', 'Inflation'],
    ] },
    { g: '5 Economic development', u: [
      ['5.1', 'Living standards'], ['5.2', 'Poverty'], ['5.3', 'Population'],
      ['5.4', 'Differences in economic development between countries'],
    ] },
    { g: '6 International trade and globalisation', u: [
      ['6.1', 'Specialisation and free trade'], ['6.2', 'Globalisation and trade restrictions'], ['6.3', 'Foreign exchange rates'],
      ['6.4', 'Current account of the balance of payments'],
    ] },
  ],
  tamil: [
    { g: 'Paper 1 Composition', u: [
      ['p1-letter', 'Letter', ''], ['p1-report', 'Report or speech', ''], ['p1-dialogue', 'Dialogue', ''],
      ['p1-narr', 'Narrative essay', ''], ['p1-desc', 'Descriptive essay', ''], ['p1-arg', 'Argumentative essay', ''],
    ] },
    { g: 'Paper 2 Translation and reading comprehension', u: [
      ['p2-t2e', 'Translation: Tamil into English', ''], ['p2-e2t', 'Translation: English into Tamil', ''],
      ['p2-comp', 'Reading comprehension', ''],
    ] },
  ],
  eng: [
    { g: 'Paper 1 Reading', u: [
      ['r1', 'Comprehension (Text A)', 'Q1'], ['r2', 'Summary, and attitudes and opinions (Text B)', 'Q2'],
      ['r3', 'Short answers and language task (Text C)', 'Q3'], ['r4', 'Extended response (Text C)', 'Q4'],
    ] },
    { g: 'Paper 2 Directed writing and composition', u: [
      ['w1', 'Directed writing: speech, letter, article or report', 'Q1'], ['w2', 'Descriptive composition', ''],
      ['w3', 'Narrative composition', ''],
    ] },
  ],
};
