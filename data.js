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
