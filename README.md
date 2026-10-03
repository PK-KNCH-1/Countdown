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

## Moving data from the old app

In the old app, export a JSON backup. In this app, open **Sync → Import backup (JSON)**
and choose **Merge** to add it, or **Replace** to make your data match the file exactly.

## Hosting

Any static host works. This copy is published with GitHub Pages. A scheduled GitHub
Action (`.github/workflows/keepalive.yml`) calls the database every few days so the
free Supabase project is never paused for inactivity.
