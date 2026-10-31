# Countdown

A revision tracker for the Cambridge IGCSE February/March 2027 series, Zone 4 (India).
Plain HTML, CSS and JavaScript with no build step. It runs offline, and it syncs
between devices through a small Supabase database.

## Files

| File | What it does |
|---|---|
| `index.html` | Page structure: header, the five tabs, toast and sheet containers |
| `style.css` | All styling, light and dark themes, print layout |
| `data.js` | Exam data only: subjects, timetable, which past-paper variants exist |
| `sync.js` | Local record store and cloud sync |
| `app.js` | Everything you see and do: Stats, Paper Library, Calendar, Goals, Targets, Sync |
| `quiz.js` | Quiz engine: daily multiple-choice quiz (scheduling, marking), written definitions, browse sheet, and the Chemistry picture deck (cation, anion and flame tests, solubility) |
| `qn-phys.js`, `qn-chem.js`, `qn-bio.js`, `qn-maths.js` | Quiz decks generated from the revision notes — pure-memory cards only (formulas, units and values, laws and rules, tests and equations, short facts) and the definitions the syllabus asks for word for word, each with its multiple-choice options |
| `qn-econ.js` | Economics quiz deck: definitions, formulas and lists, generated from the Economics notes |
| `katex/` | KaTeX stylesheet and fonts, used to display the maths formulas |
| `config.js` | Supabase project URL and its public (publishable) key |
| `sw.js` | Service worker that keeps the app usable offline |
| `supabase/schema.sql` | Tables and the two sync functions |

## How sync works

Every piece of data is a small record with its own timestamp: one per Paper Library
entry, target, goal, and Calendar cell. Devices send only what changed and fetch only
what is new. When two devices edit the same record, the newer edit wins; edits to
different records never collide. Deletions are stored as empty records so they reach
every device too.

There are no accounts. A private link (`…/#k=<key>`) identifies your data. The
database tables are closed to the public API; the page can only call `cd_pull` and
`cd_push`, and both refuse any key that isn't registered. Only a hash of the key is
stored in the database. Anyone holding the link can read and change the tracker,
so keep it private.

Without a link the app still works fully on one device, using browser storage.

## Quiz

**Daily quiz.** Every card is multiple choice and comes from the revision notes for Physics 0625, Chemistry 0620,
Biology 0610, International Maths 0607 and Economics 0455: the definitions the syllabus asks for word for word,
formulas, units and values, laws and rules, tests and equations, short facts and lists. Explaining and applying are
left to past papers. The right option is the notes' own wording; the wrong ones change one or two key words. They
were written by hand for each item (from the notes and the syllabus only) and usually come as two changed words in
every combination, so the answer can't be found by picking the wording most options share. After answering, the
words that differ are highlighted (green: as in the notes; struck out: changed) and the full answer from the notes
is shown. Long items have several versions (e.g. one per gas test), picked at random. Cards follow a Leitner
schedule (1, 3, 7, 14, 30 days): right moves a card up a box, wrong sends it back to tomorrow and repeats it once
at the end of the session. New cards come chapter by chapter, subjects and types of card taking turns; a ★ on a
chapter puts its new cards first. Subjects and types of card can be switched off, and any chapter or type can be
practised on its own. Keyboard: 1–4 choose an option, Enter goes on.

**Write definitions.** The same definitions, written out by hand: the app lists the terms; you write the definitions on paper, then mark each one correct,
partly or wrong against the notes. Marks are kept per definition and scheduled the same way, so wrong and partly
ones come back first. *All my marks* shows every definition with its latest mark.

Progress is stored as records `q/<id>` (box, due date, counts, last mark) and `qd/<date>`, and settings as
`qs/cfg`, so it syncs between devices. The `qn-*.js` decks are generated from the notes and the hand-written option lists; regenerate them
rather than editing them by hand.

## Moving data from the old app

In the old app, export a JSON backup. In this app, open **Sync → Import backup (JSON)**
and choose **Merge** to add it, or **Replace** to make your data match the file exactly.

## Hosting

Any static host works. This copy is published with GitHub Pages. A scheduled GitHub
Action (`.github/workflows/keepalive.yml`) calls the database every few days so the
free Supabase project is never paused for inactivity.
