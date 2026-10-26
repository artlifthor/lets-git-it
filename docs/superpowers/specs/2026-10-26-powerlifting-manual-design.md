# Powerlifting Programming Manual — Design Spec

- **Date:** 2026-10-26
- **Status:** Draft, awaiting owner review
- **Owner:** artlifthor
- **Repository:** `artlifthor/lets-git-it`

---

## 1. Purpose

A free, mobile-friendly website that teaches **powerlifting programming** from
beginner fundamentals through advanced coaching and meet day. It is written for
**coaches** as both a study text and a quick reference.

### Success criteria

1. A coach can read the manual front to back, from basic to advanced, like a textbook.
2. A coach can find any topic in seconds via search or the sidebar, on a phone or laptop.
3. Every claim can be traced to a named book or a peer-reviewed study.
4. Content stays current through a monthly, human-approved research update.

### Out of scope (version 1)

- User accounts, logins, saved data
- Program builder (sample programs are shown inside chapters instead)
- Calculators (1RM, RPE chart, plate calculator), planned as a later version
- Paid features, comments, forums

---

## 2. Sub-projects and build order

The work is split into three sub-projects. Each gets its **own implementation
plan**, written and approved before it is built.

| # | Sub-project | Delivers | Depends on |
|---|---|---|---|
| 1 | **The app** | Working website: structure, chapter template, search, evidence labels, auto-publishing, 2 complete sample chapters | — |
| 2 | **The content** | All chapters in Section 5, written in batches (one Part at a time), each reviewed by the owner | 1 |
| 3 | **Research updater** | Monthly scheduled agent that proposes peer-reviewed research updates as pull requests | 1, 2 |

---

## 3. Technology

| Concern | Choice | Why |
|---|---|---|
| Site framework | **Astro Starlight** (documentation-site tool) | Built-in sidebar, search, mobile layout, dark mode; chapters are plain text files |
| Chapter format | **MDX** (Markdown + small components) | Easy to read, edit, and review in pull requests |
| Search | **Pagefind** (built into Starlight) | Full-text search, works without a server |
| Hosting | **GitHub Pages** at `https://artlifthor.github.io/lets-git-it/` | Free; renaming the repo or adding a custom domain later is optional |
| Publishing | **GitHub Actions** workflow on every merge to `main` | No manual uploading |
| Prerequisite | **Node.js** (LTS) installed on the owner's computer | Required to run Astro locally; not currently installed |

The empty `frontend/` and `backend/` folders are removed; the project has no server.

---

## 4. Site structure

```
Home ................ what the manual is, how to use it, how evidence is labeled
Part 1 · Foundations (Beginner)
Part 2 · Building Programs (Intermediate)
Part 3 · Advanced Programming (Advanced)
Part 4 · Peaking & Competition
Part 5 · Technique & Injury Management
References .......... every book and study cited, in one place
```

### File layout

```
src/content/docs/
├── index.mdx                      Home
├── foundations/                   Part 1
│   ├── 01-what-is-powerlifting.mdx
│   └── ...
├── building-programs/             Part 2
├── advanced/                      Part 3
├── peaking/                       Part 4
├── technique-injury/              Part 5
└── references.mdx
src/data/library.json              The book library (Section 6)
src/components/                    Evidence label, chapter header, sample-program table
```

Chapters are ordered by their number prefix, so the sidebar and Previous/Next
buttons follow the book order.

---

## 5. Chapter outline

Planned chapters, final wording to be confirmed in sub-project 2. ★ marks the
owner's own topic idea.

### Part 1 · Foundations (Beginner)
1. What powerlifting is: the sport, federations, raw vs. equipped, scoring (DOTS / IPF GL)
2. Stress, recovery, and adaptation: SRA curve, fitness–fatigue model
3. The core training principles: specificity, overload, fatigue management, variation, phase potentiation, individual difference
4. Training variables: volume, intensity, frequency, density, tempo, exercise selection
5. Measuring intensity: %1RM, reps in reserve (RIR), RPE
6. Progressive overload: the ways to progress and when to use each
7. The novice lifter: linear progression and its sample programs
8. Exercise selection basics: competition lifts, variations, accessories
9. Session structure and warm-ups
10. Recovery fundamentals: sleep, nutrition, stress
11. Tracking training: training logs, estimated 1RM, simple progress metrics

### Part 2 · Building Programs (Intermediate)
1. Assessing the lifter: needs analysis, training age, strengths and weak points
2. When linear progression stops: transitioning to intermediate programming
3. Periodization: history and overview (Matveyev, Verkhoshansky, Issurin)
4. Linear (traditional) periodization
5. Undulating periodization: daily and weekly
6. Block periodization: accumulation, transmutation, realization
7. Conjugate and concurrent methods
8. Volume landmarks: MV, MEV, MAV, MRV
9. Training frequency for each lift
10. Hypertrophy for powerlifters
11. Deloads and fatigue management
12. Sheiko-style programming: high frequency at submaximal intensity
13. Programming accessories
14. Building a mesocycle step by step, with a complete sample program

### Part 3 · Advanced Programming (Advanced)
1. Autoregulation: RPE/RIR-based training (RTS approach)
2. Fatigue-based autoregulation: load drops, repeats, fatigue percentages
3. Velocity-based training
4. Individual response: why lifters respond differently and how to adjust
5. Advanced weak-point analysis and variation selection
6. Special exercises and dynamic correspondence (Siff / Verkhoshansky)
7. Concurrent training: cardio and the interference effect
8. Monitoring readiness, overreaching, and overtraining
9. Annual and multi-year planning: sequencing blocks and phase potentiation
10. Special populations: masters lifters, female lifters, weight-class considerations
11. Programming around life stress and limited time

### Part 4 · Peaking & Competition
1. The science of peaking and tapering
2. Building a peaking block, with a sample 4–6 week program
3. Mock meets and testing openers
4. Making weight: water loading, cutting, and rehydration
5. Attempt selection strategy
6. Meet day: timeline, warm-ups, nutrition, caffeine, handling
7. Competition rules and commands (IPF technical rules overview)
8. After the meet: recovery and planning the next cycle

### Part 5 · Technique & Injury Management
1. Biomechanics basics: levers, moment arms, force production
2. Squat technique and variations
3. Bench press technique and variations
4. Deadlift technique: conventional vs. sumo
5. Common technical faults and fixes for each lift
6. ★ **Planes of motion:** SBD trains mostly the sagittal plane; weaknesses in the frontal and transverse planes, and the accessories that address them
7. From sticking point to accessory: diagnosing weak points in each lift
8. Mobility and movement preparation
9. Pain and common powerlifting injuries: what the evidence says
10. Programming around injury and returning to heavy training
11. Equipment: belts, sleeves, wraps, shoes

---

## 6. Sources

### The book library (`src/data/library.json`)

| Category | Book | Author(s) |
|---|---|---|
| Programming & scientific principles | *Scientific Principles of Strength Training* | Mike Israetel, Chad Wesley Smith, James Hoffmann |
| | *Powerlifting: Foundations and Methods* | Boris Sheiko |
| | *Practical Programming for Strength Training* | Mark Rippetoe, Andy Baker |
| Biomechanics, technique & injury | *The Squat Bible* | Aaron Horschig |
| | *Supertraining* | Mel C. Siff |
| Autoregulation & elite coaching | *Reactive Training Systems (RTS) Manual* | Mike Tuchscherer |
| | *The Science and Development of Muscle Hypertrophy* | Brad Schoenfeld |

Each library entry records: title, authors, edition/year, category, and the chapters that use it.

### Sourcing rules

1. **Original wording only.** Chapters explain ideas in our own words. No copied passages; short attributed quotes only.
2. **Books are cited by title and author, not page number.** The book files are not available, so page numbers cannot be verified and are never invented.
3. **Every study citation is verified** (authors, year, journal, and a working DOI or PubMed link) before it is published. A study that cannot be verified is not cited.
4. **Disagreements are shown, not hidden.** When books disagree with each other or with research, the chapter presents both sides and what the evidence currently supports.

### Evidence labels

Claims in chapters carry one of four labels:

| Label | Meaning |
|---|---|
| **Strong evidence** | Supported by meta-analyses or systematic reviews with consistent findings |
| **Moderate evidence** | Supported by several peer-reviewed studies |
| **Emerging evidence** | Limited or early peer-reviewed research; may change |
| **Coaching practice** | Established practice from the library's coaches/authors; not yet well tested by research |

---

## 7. Chapter template

Every chapter has the same parts, in this order:

| Part | Required | Notes |
|---|---|---|
| Header: level badge + "Last reviewed" date | Yes | From the chapter's metadata |
| **In one minute** (summary) | Yes | 3–5 sentences |
| **Prerequisites** | Yes | Links to earlier chapters ("None" allowed in Part 1) |
| Main lesson | Yes | Headings, explanations, diagrams, evidence labels |
| **Sample program** | When relevant | Week-by-week tables (sets × reps @ load/RPE) |
| **Common mistakes** | Yes | |
| **Key takeaways** | Yes | Bullet list |
| **Sources** | Yes | Numbered list of books and verified studies |
| Previous / Next | Automatic | |

### Chapter metadata (top of each file)

```yaml
title: Block Periodization
description: One-sentence summary used in search results
level: advanced          # beginner | intermediate | advanced | competition | technique
lastReviewed: 2026-10-26
sidebar:
  order: 6
```

The site **refuses to build** if a chapter is missing `level` or `lastReviewed`.

---

## 8. Research updater (sub-project 3)

A **scheduled cloud agent** (Claude Code routine) runs **monthly**.

### What it does
1. For each chapter, searches for research published since the chapter's `lastReviewed` date.
2. Filters every candidate through the **inclusion rules** below.
3. Opens **one pull request** per month titled `Research update: <Month YYYY>` containing:
   - a summary of each qualifying study and which chapters it affects
   - proposed text changes, evidence-label changes, and new citations
   - updated `lastReviewed` dates for chapters it checked
4. If nothing qualifies, it opens no pull request.

### Inclusion rules (all must pass)
- Published in a **peer-reviewed journal**
- Has a **DOI that resolves** (or a PubMed record)
- Relevant to strength/powerlifting training in humans
- **Priority:** meta-analyses and systematic reviews first; individual peer-reviewed studies are allowed only with a lower evidence label and a note on sample size and population

### Excluded
Preprints, blogs, podcasts, social media, press releases, non-peer-reviewed articles, and supplement-industry material.

### Safety
- The agent **never merges** and never edits `main` directly. The owner reviews and merges.
- A study contradicting a chapter's existing **Strong evidence** claim is flagged for the owner's review; it is not used to rewrite the claim on its own.

---

## 9. Publishing and checks

On every pull request and every merge to `main`, GitHub Actions:

1. Builds the site. **Fails** on any error, including missing chapter metadata.
2. Checks all internal links (Starlight links-validator plugin). **Fails** on broken links.
3. Checks each chapter contains the required sections from Section 7. **Fails** if any are missing.
4. On `main` only, publishes to GitHub Pages.

A pull request cannot be merged while these checks fail.

---

## 10. Sub-project 1 acceptance criteria

Sub-project 1 is done when:

- [ ] The site runs locally (`npm run dev`) and is live on GitHub Pages
- [ ] The sidebar shows all five Parts, Home, and References
- [ ] Two complete sample chapters exist and pass every check: **Part 1 · Ch. 5 Measuring intensity (RIR/RPE)** and **Part 2 · Ch. 6 Block periodization**
- [ ] Search finds words inside those chapters
- [ ] Evidence labels and sample-program tables display correctly on phone and desktop
- [ ] The References page lists the full book library
- [ ] All three automatic checks run on pull requests
