# Powerlifting Manual Site (Sub-project 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish the Powerlifting Programming Manual website: structure, chapter template and checks, evidence labels, References, a self-updating PAP National Records page, and two complete sample chapters.

**Architecture:** An Astro Starlight static site. Chapters are MDX files under `src/content/docs/<part>/`. Small Node scripts (tested with Node's built-in test runner) check chapter structure before every build and refresh PAP records from PAP's published Google Sheet into a JSON snapshot. GitHub Actions run checks on pull requests, deploy to GitHub Pages on `main`, and refresh PAP records monthly.

**Tech Stack:** Node.js 24 LTS, Astro + `@astrojs/starlight` (latest), `starlight-links-validator`, `gray-matter`, `csv-parse`, `node:test`, GitHub Actions, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-10-26-powerlifting-manual-design.md`

## Global Constraints

- Owner is a non-coder: every task's final report explains what changed in plain language.
- Owner wants to see progress in their browser: after Tasks 1, 3, 7, 8, and 9, start `npm run preview -- --open` in the background so the site opens in a browser tab at `http://localhost:4321/lets-git-it/`, and tell the owner what to look at.
- Site URL: `site: 'https://artlifthor.github.io'`, `base: '/lets-git-it'`.
- Node 24 LTS locally and in CI (`actions/setup-node` with `node-version: 24`).
- Chapter `level` values: `beginner | intermediate | advanced | competition | technique`.
- Part folder → required level: `foundations`→`beginner`, `building-programs`→`intermediate`, `advanced`→`advanced`, `peaking`→`competition`, `technique-injury`→`technique`.
- Required chapter sections, in order (level-2 headings): `In one minute`, `Prerequisites`, `Common mistakes`, `Key takeaways`, `Sources`. `Sample program` is optional.
- Evidence labels, exact text: `Strong evidence`, `Moderate evidence`, `Emerging evidence`, `Coaching practice`.
- Books cited by title and author only, never page numbers. Studies cited only after their DOI is confirmed to resolve.
- Original wording only; no copied passages from books.
- PAP data shown exactly as PAP publishes it (strings, no corrections). Lifters' birth years are never stored or shown.
- PAP records refresh: monthly, automatic, no AI; on any safety-check failure publish nothing and open a GitHub issue.
- The research agent (sub-project 3) never merges; nothing in this plan auto-merges chapter content.
- Never commit to `main` directly from a session; work on branch `build/manual-site` and merge by pull request.

## Review Focus

1. **A division/sex with no records at all** (today: Women's Master IV). The page shows "No records set yet." and does not render empty tables or crash. Tested in Task 5 and verified in Task 7.
2. **Google returns an HTML page instead of CSV** (sheet unpublished, rate-limited, sign-in wall) **or one tab fails.** Nothing is written, problems are reported, exit code 2. Tested in Task 6.
3. **PAP renames a column or section** (e.g., `BIRTH YR` → `AGE`, or a new section). Parsing fails loudly for that tab, never silently mis-assigns columns. Tested in Task 5.
4. **Chapter author writes `## Key Takeaways` (different capitalization) or puts sections out of order, or uses the wrong level for its Part.** Capitalization is accepted; order and level mismatches fail the build with a readable message. Tested in Task 2.
5. **Wide tables on a phone** (6-column records tables, sample-program tables). The table scrolls sideways inside its own box; the page itself never scrolls sideways. Manually verified at 375 px width in Tasks 7 and 8.

---

## File Structure

```
astro.config.mjs                      Starlight config: site/base, sidebar, plugins, component override
package.json                          scripts: dev, build, preview, test, check:chapters, pap:update
src/content.config.ts                 docs schema extended with optional level, lastReviewed
src/content/docs/
  index.mdx                           Home (splash)
  foundations/index.mdx … technique-injury/index.mdx   Part overview pages (5)
  foundations/05-measuring-intensity.mdx               Sample chapter 1
  building-programs/06-block-periodization.mdx         Sample chapter 2
  references.mdx                      References page
  pap-records.mdx                     PAP National Records page
src/lib/evidence.mjs                  EVIDENCE_LEVELS
src/lib/levels.mjs                    LEVEL_LABELS, formatReviewed()
src/components/Evidence.astro         Inline evidence badge
src/components/PageTitle.astro        Starlight override: title + level badge + last reviewed
src/components/References.astro       Renders library.json + studies.json
src/components/PapRecords.astro       Renders records.json
src/data/library.json                 The 7 books
src/data/studies.json                 Verified studies
src/data/pap-records/records.json     PAP snapshot
scripts/lib/chapter-check.mjs         checkChapter(), isChapterPath()
scripts/check-chapters.mjs            CLI over src/content/docs
scripts/pap/tabs.mjs                  Sheet IDs, tab gids, csvUrl()
scripts/pap/parse.mjs                 parseNotes(), parseDivision()
scripts/pap/update.mjs                fetchRecords(), countRecords(), safetyProblems(), sameRecords(), CLI
tests/*.test.mjs, tests/fixtures/pap/*.csv
.github/workflows/checks.yml, deploy.yml, pap-records.yml
```

---

### Task 1: Scaffold the Starlight site

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/content.config.ts`, `src/content/docs/index.mdx`, `src/content/docs/{foundations,building-programs,advanced,peaking,technique-injury}/index.mdx`, `.gitignore`
- Modify: `README.md`
- Delete: `frontend/`, `backend/`

**Interfaces:**
- Produces: npm scripts `dev`, `build`, `preview`, `test` (`node --test`); sidebar groups that later tasks append to.

- [ ] **Step 1: Scaffold in the scratchpad, then move into the repo**

Run `npm create astro@latest <scratchpad>/site -- --template starlight --no-install --no-git --skip-houston --yes`. Copy `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/`, `public/` into `C:\project`. Delete the template's example pages under `src/content/docs/` (`guides/`, `reference/`, `index.mdx`). Remove `frontend/` and `backend/`.

- [ ] **Step 2: Install dependencies**

Run: `npm install` then `npm install -D starlight-links-validator gray-matter csv-parse`.
Expected: exits 0; `node_modules/` exists.

- [ ] **Step 3: Configure `astro.config.mjs`**

Set `site`/`base` per Global Constraints; Starlight `title: 'Powerlifting Programming Manual'`; `plugins: [starlightLinksValidator()]`; sidebar:

```js
sidebar: [
  { label: 'Home', link: '/' },
  { label: 'Part 1 · Foundations (Beginner)', autogenerate: { directory: 'foundations' } },
  { label: 'Part 2 · Building Programs (Intermediate)', autogenerate: { directory: 'building-programs' } },
  { label: 'Part 3 · Advanced Programming (Advanced)', autogenerate: { directory: 'advanced' } },
  { label: 'Part 4 · Peaking & Competition', autogenerate: { directory: 'peaking' } },
  { label: 'Part 5 · Technique & Injury Management', autogenerate: { directory: 'technique-injury' } },
],
```

- [ ] **Step 4: Extend the content schema in `src/content.config.ts`**

`docsSchema({ extend: z.object({ level: z.enum(['beginner','intermediate','advanced','competition','technique']).optional(), lastReviewed: z.coerce.date().optional() }) })`.

- [ ] **Step 5: Write Home and the five Part overview pages**

Home (`template: splash`): one-paragraph purpose from spec Section 1, "How to use this manual" (read Parts in order, or search), an "Evidence labels" section listing the four labels and meanings from spec Section 6 (plain text for now; Task 3 swaps in badges), and a hero action linking to Part 1. Each Part `index.mdx`: `title` = the sidebar label, `sidebar: { order: 0, label: 'Overview' }`, one-sentence description, and the Part's planned chapters from spec Section 5 as a plain numbered list (no links).

- [ ] **Step 6: Set scripts, `.gitignore`, README**

`package.json` scripts: `"test": "node --test"` (keep template `dev`/`build`/`preview`). `.gitignore`: `node_modules/`, `dist/`, `.astro/`, `pap-problems.md`. README: what the project is, `npm install`, `npm run dev`, link to the spec.

- [ ] **Step 7: Verify the build**

Run: `npm run build`
Expected: exits 0; `dist/index.html` and `dist/foundations/index.html` exist; `dist/pagefind/` exists (search index).

- [ ] **Step 8: Commit**

`git add -A && git commit -m "Scaffold Starlight site with Home and Part overviews"`

---

### Task 2: Chapter checks (structure + metadata)

**Files:**
- Create: `scripts/lib/chapter-check.mjs`, `scripts/check-chapters.mjs`, `tests/chapter-check.test.mjs`
- Modify: `package.json` (scripts)

**Interfaces:**
- Produces: `PART_LEVELS: Record<string,string>`, `REQUIRED_SECTIONS: string[]`, `isChapterPath(relPath: string): boolean`, `checkChapter(relPath: string, source: string): string[]` (empty array = valid). `relPath` is POSIX, relative to `src/content/docs`.

- [ ] **Step 1: Write the failing tests**

Build the valid fixture inline: frontmatter `title`, `level: beginner`, `lastReviewed: 2026-10-26`, body with the five required `##` headings in order.

```js
test('valid chapter passes', () => assert.deepEqual(checkChapter('foundations/05-x.mdx', VALID), []));
test('missing level', () => assert.match(checkChapter(p, withoutLevel).join('\n'), /level/));
test('level must match part', () => assert.match(checkChapter('foundations/05-x.mdx', withLevel('advanced')).join('\n'), /must be "beginner"/));
test('bad lastReviewed', () => assert.match(checkChapter(p, withReviewed('soon')).join('\n'), /lastReviewed/));
test('missing section', () => assert.match(checkChapter(p, without('Key takeaways')).join('\n'), /Key takeaways/));
test('out of order', () => assert.match(checkChapter(p, swapped('Key takeaways','Sources')).join('\n'), /order/));
test('heading case ignored', () => assert.deepEqual(checkChapter(p, VALID.replace('## Key takeaways','## Key Takeaways')), []));
test('isChapterPath', () => {
  assert.equal(isChapterPath('peaking/02-x.mdx'), true);
  assert.equal(isChapterPath('foundations/index.mdx'), false);
  assert.equal(isChapterPath('references.mdx'), false);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL, cannot find module `scripts/lib/chapter-check.mjs`.

- [ ] **Step 3: Implement `scripts/lib/chapter-check.mjs`**

Parse frontmatter with `gray-matter`. Sections = level-2 headings (`^## `), trimmed, compared case-insensitively; report each missing one by name, and report "sections out of order" if present ones aren't in `REQUIRED_SECTIONS` order (extra headings like `Sample program` are ignored). `lastReviewed` must be a valid Date (YAML parses `2026-10-26` to Date). Messages name the field, e.g. `level must be "beginner" for chapters in foundations/`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS (8 tests).

- [ ] **Step 5: Implement CLI `scripts/check-chapters.mjs` and wire into build**

Walk `src/content/docs` recursively; for each `isChapterPath` file print `<relPath>: <error>` per error; exit 1 if any, else print `Chapter check: N chapters OK`. Scripts: `"check:chapters": "node scripts/check-chapters.mjs"`, `"build": "node scripts/check-chapters.mjs && astro build"`.

- [ ] **Step 6: Verify build-blocking works**

Create a temporary `src/content/docs/foundations/99-temp.mdx` with only a title; run `npm run build`.
Expected: exits 1 and prints `foundations/99-temp.mdx: ...level...`. Delete the file; `npm run build` exits 0.

- [ ] **Step 7: Commit**

`git commit -m "Add chapter structure checks to the build"`

---

### Task 3: Evidence badges and chapter header

**Files:**
- Create: `src/lib/evidence.mjs`, `src/lib/levels.mjs`, `src/components/Evidence.astro`, `src/components/PageTitle.astro`, `tests/labels.test.mjs`
- Modify: `astro.config.mjs` (`components: { PageTitle: './src/components/PageTitle.astro' }`), `src/content/docs/index.mdx`

**Interfaces:**
- Produces: `EVIDENCE_LEVELS = { strong: 'Strong evidence', moderate: 'Moderate evidence', emerging: 'Emerging evidence', practice: 'Coaching practice' }`; `LEVEL_LABELS = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced', competition: 'Peaking & Competition', technique: 'Technique & Injury' }`; `formatReviewed(date: Date): string`; MDX usage `<Evidence level="strong" />`.

- [ ] **Step 1: Write the failing tests**

```js
test('evidence labels', () => assert.deepEqual(Object.values(EVIDENCE_LEVELS),
  ['Strong evidence','Moderate evidence','Emerging evidence','Coaching practice']));
test('level labels cover all levels', () => assert.deepEqual(Object.keys(LEVEL_LABELS),
  ['beginner','intermediate','advanced','competition','technique']));
test('formatReviewed', () => assert.equal(formatReviewed(new Date('2026-10-26')), 'October 26, 2026'));
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test` → FAIL, modules missing.

- [ ] **Step 3: Implement `evidence.mjs`, `levels.mjs`**

`formatReviewed` uses `Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test` → PASS.

- [ ] **Step 5: Implement components**

`Evidence.astro`: inline pill showing `EVIDENCE_LEVELS[level]`; unknown `level` → `throw new Error(\`Unknown evidence level "${level}"\`)`. Colors from Starlight tokens so dark mode works: strong `--sl-color-green`, moderate `--sl-color-blue`, emerging `--sl-color-orange`, practice `--sl-color-purple` (text) with the matching `-low` variant as background. `PageTitle.astro`: render Starlight's default `PageTitle`, then, when `Astro.locals.starlightRoute.entry.data.level` exists, a level badge (`LEVEL_LABELS`) and `Last reviewed: <formatReviewed(lastReviewed)>`. On Home, replace the plain label list with `<Evidence>` badges.

- [ ] **Step 6: Verify**

Run: `npm run build`, then `grep -c "Coaching practice" dist/index.html`.
Expected: build exits 0; count ≥ 1.

- [ ] **Step 7: Commit**

`git commit -m "Add evidence badges and chapter header"`

---

### Task 4: Book library, studies, and References page

**Files:**
- Create: `src/data/library.json`, `src/data/studies.json` (starts `[]`), `src/components/References.astro`, `src/content/docs/references.mdx`, `tests/data.test.mjs`
- Modify: `astro.config.mjs` (sidebar: append `{ label: 'References', slug: 'references' }`)

**Interfaces:**
- Produces: library entry `{ id, title, authors: string[], year: number, category: 'programming'|'technique'|'autoregulation', chapters: string[] }`; study entry `{ id, authors: string, year: number, title, journal, doi, chapters: string[] }`. `chapters` holds paths like `foundations/05-measuring-intensity` (no extension). Category headings: `Programming & Scientific Principles`, `Biomechanics, Technique & Injury`, `Autoregulation & Modern Elite Coaching`.

- [ ] **Step 1: Write the failing tests**

```js
test('library has the 7 owner books', () => assert.deepEqual(library.map(b => b.title).sort(), [
  'Powerlifting: Foundations and Methods', 'Practical Programming for Strength Training',
  'Reactive Training Systems (RTS) Manual', 'Scientific Principles of Strength Training',
  'Supertraining', 'The Science and Development of Muscle Hypertrophy', 'The Squat Bible'].sort()));
test('ids unique across library and studies', ...);
test('study DOIs well-formed', () => studies.forEach(s => assert.match(s.doi, /^10\.\d{4,9}\/\S+$/)));
test('chapters references exist', () => [...library, ...studies].flatMap(x => x.chapters)
  .forEach(c => assert.ok(existsSync(`src/content/docs/${c}.mdx`), c)));
```

- [ ] **Step 2: Run tests to verify they fail** → `npm test` FAIL (files missing).

- [ ] **Step 3: Write `library.json`**

Authors and categories per spec Section 6. Starting edition/years: Scientific Principles of Strength Training 2015; Powerlifting: Foundations and Methods 2018; Practical Programming for Strength Training 3rd ed. 2014; The Squat Bible 2017; Supertraining 6th ed. 2003; RTS manual 2008; The Science and Development of Muscle Hypertrophy 2nd ed. 2021. Confirm each year/edition with one web search per book; use the publisher's value where it differs. `chapters: []` for now (Tasks 8–9 fill them).

- [ ] **Step 4: Implement `References.astro` and `references.mdx`**

Books grouped by category heading, each as *Title*, Authors (Year). Then "Studies", sorted by `authors`, each with title, journal, year, and `https://doi.org/<doi>` link. Empty studies → "No studies cited yet."

- [ ] **Step 5: Run tests and build**

Run: `npm test && npm run build` → PASS, exits 0; `grep -c "The Squat Bible" dist/references/index.html` ≥ 1.

- [ ] **Step 6: Commit** → `git commit -m "Add book library and References page"`

---

### Task 5: PAP sheet parser

**Files:**
- Create: `scripts/pap/tabs.mjs`, `scripts/pap/parse.mjs`, `tests/pap-parse.test.mjs`, `tests/fixtures/pap/{notes,m-open,w-m4}.csv`

**Interfaces:**
- Produces:
  - `tabs.mjs`: `PUBHTML_URL` (spec Section 4 URL), `csvUrl(gid: string): string` → `https://docs.google.com/spreadsheets/d/e/2PACX-1vS4JeBSzpYmQs_0DbwAl4_GxRuaJH5PtFIJfi0495yLij-KrwDQ8T7rI1Ioiuh2_NMniiAF9oCuvn-Q/pub?single=true&output=csv&gid=<gid>`, `NOTES_GID = '899996039'`, `DIVISIONS: { id, label, men, women }[]` in this order:

    | id | label | men gid | women gid |
    |---|---|---|---|
    | open | Open | 766057938 | 2086559126 |
    | developmental | Developmental | 532281181 | 296089497 |
    | high-school | High School | 1627891034 | 611350165 |
    | college | College | 1666921488 | 328715554 |
    | sub-junior | Sub-Junior | 1399004078 | 956687203 |
    | junior | Junior | 1267231825 | 1997247131 |
    | novice | Novice | 1547865314 | 1212624755 |
    | master-1 | Master I | 715181860 | 1427110172 |
    | master-2 | Master II | 1633793004 | 1460269758 |
    | master-3 | Master III | 1768641426 | 188377833 |
    | master-4 | Master IV | 903288025 | 1577657337 |

  - `parse.mjs`: `SECTIONS = { 'SQUAT': 'squat', 'BENCH PRESS': 'bench', 'DEADLIFT': 'deadlift', 'TOTAL': 'total', 'SINGLE-LIFT BENCH PRESS': 'benchOnly' }`; `parseNotes(csv: string): { lastUpdated: string, notes: string[] }`; `parseDivision(csv: string): Record<'squat'|'bench'|'deadlift'|'total'|'benchOnly', Rec[]>` where `Rec = { weightClass: string, lifter: string|null, team: string|null, kg: string|null, date: string|null, venue: string|null }`.

Sheet layout (verified 2026-10-26): row 1 is a multi-line title; a header row `,,TEAM,BIRTH YR,KG,DATE,VENUE`; then section rows (`SQUAT ` with trailing space, etc.) each followed by weight-class rows `class,lifter,team,birthYr,kg,date,venue`, separated by blank rows; a footer row `,New records:,N`. Vacant classes have only column 0 filled. Note: PAP's Women Master IV tab title says "MASTER 3"; labels come from `DIVISIONS`, never from titles.

- [ ] **Step 1: Save fixtures**

Copy from the scratchpad `pap/` folder (`notes.csv`, `m_open.csv`, `W_M4.csv`) to `tests/fixtures/pap/notes.csv`, `m-open.csv`, `w-m4.csv`; if absent, download with `curl -sL "$(csvUrl gid)"` for gids 899996039, 766057938, 1577657337.

- [ ] **Step 2: Write the failing tests**

```js
test('parseNotes', () => {
  const n = parseNotes(read('notes.csv'));
  assert.equal(n.lastUpdated, 'July 13, 2026');
  assert.equal(n.notes.length, 9);
  assert.match(n.notes[3], /^Sub-Junior lifters are allowed to break Junior records/);
});
test('parseDivision: men open', () => {
  const d = parseDivision(read('m-open.csv'));
  assert.equal(d.squat.length, 8);
  assert.deepEqual(d.squat[0], { weightClass: '59', lifter: 'Aeron Paul Casamayor', team: 'Hellside',
    kg: '217.5', date: '2/20/2024', venue: '2024 Raw Nationals' });
  assert.ok(!('birthYear' in d.squat[0]));
  assert.ok(d.total.length > 0 && d.benchOnly.length > 0);
});
test('parseDivision: all vacant', () => {
  const d = parseDivision(read('w-m4.csv'));
  assert.equal(d.squat.length, 8);
  assert.ok(Object.values(d).flat().every(r => r.lifter === null));
});
test('changed column throws', () => assert.throws(() => parseDivision(read('m-open.csv').replace('BIRTH YR', 'AGE')), /columns/));
test('unknown section throws', () => assert.throws(() => parseDivision(read('m-open.csv').replace('DEADLIFT,', 'DEADLIFTS,')), /section/));
```

(If the fixture's first squat row or lastUpdated differs because it was re-downloaded, update these expected values to match the fixture.)

- [ ] **Step 3: Run tests to verify they fail** → `npm test` FAIL.

- [ ] **Step 4: Implement `tabs.mjs` and `parse.mjs`**

Parse CSV with `csv-parse/sync` (`relax_column_count: true`); trim every cell. A row is a section header when its trimmed col 0 is a `SECTIONS` key and cols 1–6 are empty; an all-uppercase non-numeric col 0 that isn't a key → throw `Unknown section "<name>"`. Header row check: cols 2–6 must equal `TEAM, BIRTH YR, KG, DATE, VENUE` → else throw `Unexpected columns: ...`. Skip rows with empty col 0. Empty cells → `null`. `parseNotes`: `lastUpdated` = text after `Last Updated:`; notes = lines matching `^\d+\.` with the number stripped; throw if no `Last Updated`.

- [ ] **Step 5: Run tests to verify they pass** → `npm test` PASS.

- [ ] **Step 6: Commit** → `git commit -m "Add PAP records sheet parser"`

---

### Task 6: PAP update script and first snapshot

**Files:**
- Create: `scripts/pap/update.mjs`, `tests/pap-update.test.mjs`, `src/data/pap-records/records.json`
- Modify: `package.json` (`"pap:update": "node scripts/pap/update.mjs"`)

**Interfaces:**
- Consumes: Task 5 `DIVISIONS`, `NOTES_GID`, `csvUrl`, `PUBHTML_URL`, `parseNotes`, `parseDivision`.
- Produces: `records.json` shape `{ source: string, lastUpdated: string, notes: string[], divisions: { id, label, men: DivisionRecords, women: DivisionRecords }[] }`; `fetchRecords(fetchText: (url: string) => Promise<string>): Promise<{ data, problems: string[] }>`; `countRecords(data): number` (rows with non-null lifter); `safetyProblems(newData, oldData | null): string[]`; `sameRecords(a, b): boolean`. CLI exit codes: `0` ok (changed or unchanged), `2` safety problems (writes `pap-problems.md`, does not touch `records.json`), other = crash. When `GITHUB_OUTPUT` is set, appends `changed=true|false` and `summary=<text>`.

- [ ] **Step 1: Write the failing tests**

Fake `fetchText`: notes gid → notes fixture; every other gid → m-open fixture.

```js
test('all tabs ok', async () => {
  const { data, problems } = await fetchRecords(fake);
  assert.deepEqual(problems, []);
  assert.equal(data.divisions.length, 11);
  assert.equal(data.lastUpdated, 'July 13, 2026');
});
test('HTML instead of CSV is a problem', async () => {
  const { problems } = await fetchRecords(fakeWith('2086559126', '<!DOCTYPE html><html>'));
  assert.equal(problems.length, 1);
  assert.match(problems[0], /Open \(women\)/);
});
test('drop over 5% is a problem', () => assert.match(safetyProblems(withCount(90), withCount(100)).join(), /5%/));
test('drop of 5% or less is fine', () => assert.deepEqual(safetyProblems(withCount(95), withCount(100)), []));
test('first run has no previous copy', () => assert.deepEqual(safetyProblems(withCount(10), null), []));
test('sameRecords', () => { assert.ok(sameRecords(a, structuredClone(a))); assert.ok(!sameRecords(a, changedOneKg(a))); });
```

- [ ] **Step 2: Run tests to verify they fail** → `npm test` FAIL.

- [ ] **Step 3: Implement `update.mjs`**

Response text starting with `<` (after trim) → problem `"<Label> (<men|women>): not CSV (sheet may be unpublished or moved)"`; parse errors → same prefix + message. Drop rule: `old && count(new) < count(old) * 0.95` → `"Record count dropped more than 5% (<old> → <new>)"`. CLI runs only when executed directly (`import.meta.url === pathToFileURL(process.argv[1]).href`), uses global `fetch`, writes JSON with 2-space indent and trailing newline, summary `PAP records updated: <count> records (as of <lastUpdated>)`.

- [ ] **Step 4: Run tests to verify they pass** → `npm test` PASS.

- [ ] **Step 5: Create the first snapshot**

Run: `npm run pap:update`
Expected: exit 0, prints `PAP records updated: ~589 records (as of July 13, 2026)` (count may differ if PAP updated); `src/data/pap-records/records.json` exists and contains no `BIRTH`/`birthYear` keys. Run again → prints unchanged.

- [ ] **Step 6: Commit** → `git commit -m "Add PAP records updater and first snapshot"`

---

### Task 7: PAP National Records page

**Files:**
- Create: `src/components/PapRecords.astro`, `src/content/docs/pap-records.mdx`
- Modify: `astro.config.mjs` (sidebar: insert `{ label: 'PAP National Records', slug: 'pap-records' }` before References), `src/content/docs/foundations/index.mdx` (link to the records page)

**Interfaces:**
- Consumes: `records.json` (Task 6).

- [ ] **Step 1: Implement the page**

`pap-records.mdx`: title `PAP National Records`, `tableOfContents: false`, renders `<PapRecords />`. Component: header `Official PAP raw (classic) records as of <lastUpdated>. Source: Powerlifting Association of the Philippines` (link `source`); PAP's notes in a `<details>` titled "PAP record rules"; outer Starlight `<Tabs>` with one `<TabItem>` per division label; inside each, `<Tabs syncKey="pap-sex">` with `Men` / `Women`. Per sex: if every row is vacant → paragraph `No records set yet.`; else one `<h3>` + table per section (`Squat`, `Bench press`, `Deadlift`, `Total`, `Single-lift bench press`) with columns `Class (kg) | Lifter | Team | Kg | Date | Meet`; vacant rows show `—`. Tables sit in a wrapper with `overflow-x: auto`.

- [ ] **Step 2: Verify the build output**

Run: `npm run build`, then
`grep -c "Aeron Paul Casamayor" dist/pap-records/index.html` (≥ 1),
`grep -c "No records set yet." dist/pap-records/index.html` (≥ 1),
`grep -ci "birth" dist/pap-records/index.html` (0).

- [ ] **Step 3: Phone-width check**

Run `npm run preview`; open `/lets-git-it/pap-records/` at 375 px width (browser dev tools or Claude in Chrome). Expected: tabs usable, tables scroll inside their box, page has no sideways scroll, Men/Women choice persists when switching divisions.

- [ ] **Step 4: Commit** → `git commit -m "Add PAP National Records page"`

---

### Task 8: Sample chapter: Measuring intensity (%1RM, RIR, RPE)

**Files:**
- Create: `src/content/docs/foundations/05-measuring-intensity.mdx`
- Modify: `src/data/studies.json`, `src/data/library.json` (`chapters`)

- [ ] **Step 1: Verify candidate studies**

For each, run `curl -sI https://doi.org/<doi>` and confirm a 30x redirect, then confirm title/authors/year/journal on the landing page; drop any that fail:
- Zourdos et al., 2016, J Strength Cond Res, `10.1519/JSC.0000000000001049`. Novel RIR-based RPE scale.
- Helms et al., 2016, Strength Cond J, `10.1519/SSC.0000000000000218`. Applying the RIR-based RPE scale.
- Helms et al., 2018, Front Physiol, `10.3389/fphys.2018.00247`. RPE vs. %1RM loading.
Add verified ones to `studies.json` with `chapters: ['foundations/05-measuring-intensity']`.

- [ ] **Step 2: Write the chapter**

Frontmatter: `title: 'Measuring Intensity: %1RM, RIR, and RPE'`, description, `level: beginner`, `lastReviewed: <today>`, `sidebar: { order: 5 }`. Sections in template order (spec Section 7). Cover: what %1RM is and its limits (day-to-day readiness, rep-max variation between lifters); RIR and the 1–10 RPE scale with a reference table (RPE 10 = 0 RIR … RPE 6 = 4+ RIR); accuracy of RIR ratings (better closer to failure, improves with experience); when to use each with novices vs. experienced lifters. Use `<Evidence>` on each key claim. Sample program: one 4-day week showing the same plan written in %1RM and in RPE (sets × reps @ load). Prerequisites: unwritten chapters as plain text (`Part 1 · Ch. 4 Training variables`), no links. Sources: Israetel/Hoffmann/Smith, Tuchscherer (RTS), Rippetoe/Baker where used, plus verified studies. Original wording only. Update `library.json` `chapters` for each book cited.

- [ ] **Step 3: Verify**

Run: `npm test && npm run build`
Expected: PASS; `Chapter check: 1 chapters OK`; no link-validator errors. Preview at 375 px: tables scroll inside their box.

- [ ] **Step 4: Commit** → `git commit -m "Add sample chapter: Measuring intensity"`

---

### Task 9: Sample chapter: Block periodization

**Files:**
- Create: `src/content/docs/building-programs/06-block-periodization.mdx`
- Modify: `src/data/studies.json`, `src/data/library.json`

- [ ] **Step 1: Verify candidate studies** (same procedure as Task 8 Step 1)
- Issurin, 2010, Sports Med, `10.2165/11319770-000000000-00000`. Periodization: new horizons / block training.
- Painter et al., 2012, J Strength Cond Res, `10.1519/JSC.0b013e318234ebe5`. Daily undulating vs. block periodization.
- Williams et al., 2017, Sports Med, `10.1007/s40279-017-0734-y`. Periodized vs. non-periodized meta-analysis.

- [ ] **Step 2: Write the chapter**

Frontmatter: `title: 'Block Periodization'`, `level: intermediate`, `sidebar: { order: 6 }`. Cover: the three block types (accumulation, transmutation, realization), residual training effects, block lengths, how it differs from linear and undulating models, how the owner's books treat it (Israetel et al.; contrast with Sheiko's concurrent, high-frequency approach), and what the research does and does not show (evidence labels; state honestly where evidence is limited). Sample program: a 12-week plan (accumulation 5 wk → transmutation 4 wk → realization 3 wk) with one sample week per block (S/B/D, sets × reps @ RPE or %1RM). Prerequisites link to `/lets-git-it/foundations/05-measuring-intensity/`; other prerequisites as plain text.

- [ ] **Step 3: Verify** → `npm test && npm run build` PASS; `Chapter check: 2 chapters OK`; `grep -c "Strong evidence\|Moderate evidence\|Emerging evidence\|Coaching practice" dist/building-programs/06-block-periodization/index.html` ≥ 1.

- [ ] **Step 4: Owner review**

Ask the owner to read both chapters in `npm run preview` (or later on the live site) and note anything inaccurate; apply their corrections before Task 11.

- [ ] **Step 5: Commit** → `git commit -m "Add sample chapter: Block periodization"`

---

### Task 10: GitHub Actions workflows

**Files:**
- Create: `.github/workflows/checks.yml`, `.github/workflows/deploy.yml`, `.github/workflows/pap-records.yml`

**Interfaces:**
- Produces: required status check job name `build` (checks.yml), deploy workflow file name `deploy.yml` (triggered by pap-records.yml).

- [ ] **Step 1: `checks.yml`**: on `pull_request`; job `build`: checkout, setup-node 24 (`cache: npm`), `npm ci`, `npm test`, `npm run build`.

- [ ] **Step 2: `deploy.yml`**: on `push` to `main` and `workflow_dispatch`; permissions `contents: read, pages: write, id-token: write`; job `build` (same steps as checks + `actions/upload-pages-artifact@v3` with `path: dist`); job `deploy` (`needs: build`, environment `github-pages`, `actions/deploy-pages@v4`).

- [ ] **Step 3: `pap-records.yml`**: on `schedule: cron '0 1 1 * *'` (1st of each month, 09:00 Philippine time) and `workflow_dispatch`; permissions `contents: write, issues: write, actions: write`. Steps: checkout, setup-node, `npm ci`; run updater capturing exit code without failing (`set +e; npm run pap:update; echo "code=$?" >> "$GITHUB_OUTPUT"`); if code is `2` → `gh issue create --title "PAP records update blocked" --body-file pap-problems.md`; if code is neither 0 nor 2 → fail the job; if `changed == 'true'` → `npm test && npm run build`, commit `src/data/pap-records/records.json` as `github-actions[bot]` with message `Update PAP records (<summary>)`, `git push`, then `gh workflow run deploy.yml` (pushes made with `GITHUB_TOKEN` do not trigger `deploy.yml` on their own). `GH_TOKEN: ${{ github.token }}` for `gh` steps.

- [ ] **Step 4: Validate syntax**

Run: `npx --yes @action-validator/cli .github/workflows/checks.yml` (repeat per file).
Expected: no errors.

- [ ] **Step 5: Commit** → `git commit -m "Add CI checks, Pages deploy, and monthly PAP records refresh"`

---

### Task 11: Publish (with the owner)

Outward-facing: confirm with the owner before pushing and before merging.

- [ ] **Step 1: Install and sign in to GitHub CLI**

Run: `winget install --id GitHub.cli -e`. Ask the owner to run `! gh auth login` (GitHub.com → HTTPS → browser login).
Expected: `gh auth status` shows logged in as `artlifthor`.

- [ ] **Step 2: Enable GitHub Pages (Actions source)**

Run: `gh api -X POST repos/artlifthor/lets-git-it/pages -f build_type=workflow`
Expected: JSON with `"build_type": "workflow"`.

- [ ] **Step 3: Push and open the pull request**

Push `build/manual-site`; `gh pr create --base main` titled `Build the Powerlifting Programming Manual site` with a plain-language summary.
Expected: `checks.yml` job `build` passes on the PR.

- [ ] **Step 4: Protect `main`**

Create a repository ruleset via `gh api repos/artlifthor/lets-git-it/rulesets` targeting `main`: rules `required_status_checks` (context `build`) and `non_fast_forward`; bypass actors: Repository admin role (`actor_type: RepositoryRole`, `actor_id: 5`) and GitHub Actions app (`actor_type: Integration`, `actor_id: 15368`) so the records job can push. If the Integration bypass is rejected, stop and report to the owner rather than weakening the rule silently.

- [ ] **Step 5: Merge (owner approves)**

After the owner says yes: `gh pr merge --merge`.
Expected: `deploy.yml` succeeds; `curl -s -o /dev/null -w "%{http_code}" https://artlifthor.github.io/lets-git-it/` → `200`.

- [ ] **Step 6: Run the records refresh once**

Run: `gh workflow run pap-records.yml`, then `gh run watch`.
Expected: success; either "unchanged" or a new commit on `main` followed by a deploy.

- [ ] **Step 7: Acceptance walk-through with the owner**

Go through spec Section 10's checklist on the live site (phone and desktop), including searching "RPE".
