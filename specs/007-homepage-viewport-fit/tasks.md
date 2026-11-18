---

description: "Task list for Homepage Fits the Viewport"
---

# Tasks: Homepage Fits the Viewport

**Input**: Design documents from `/specs/007-homepage-viewport-fit/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui.md, quickstart.md

**Tests**: The spec doesn't ask for TDD. The build-test assertions defined in `contracts/ui.md` are included because every homepage change in this repo comes with a `tests/build.test.ts` check. Viewport fit is verified manually with quickstart.md, since the repo has no browser test runner.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

## Path Conventions

This is a single Astro project, with `src/` and `tests/` at the repository root.

---

## Phase 1: Setup

**Purpose**: Make sure the work starts from the feature-006 homepage.

- [X] T001 Create branch `007-homepage-viewport-fit` from `homepage-random-exercises`, so that `src/components/react/HomeTrainer.tsx` and `<HomeTrainer client:load />` in `src/pages/index.astro` are present. Then run `npm test` and `npm run test:build` to record a green baseline.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Restructure the homepage DOM into the three regions (see `data-model.md`). Every story depends on this.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 In `src/components/react/HomeTrainer.tsx`, add the props from `contracts/ui.md`:
  - `export type Props = { about?: ReactNode; sections?: ReactNode }`, imported with `import type { ReactNode } from 'react'`
  - Change the signature to `export function HomeTrainer({ about, sections }: Props)`
- [X] T003 In `src/components/react/HomeTrainer.tsx`:
  - Replace `<div className="layout no-menu">` with `<div className="layout home">`.
  - Keep `<main>…</main>` unchanged as the first child.
  - Wrap the existing `<PracticeInfo … showLinks />` in `<div className="home-side">`. After it, inside that wrapper, render `<div className="home-about">{about}</div>`, then `<NewsletterSignup />`, imported from `./NewsletterSignup`.
  - Close the wrapper, then render `<nav className="home-sections" aria-label="Sections">{sections}</nav>` as the last child of `.layout.home`.
  - Don't change any puzzle state, handlers or props (FR-005).
- [X] T004 Update `src/pages/index.astro` (depends on T002–T003):
  - Replace `<HomeTrainer client:load />` plus the whole `<article class="page-text legal">…</article>` with `<HomeTrainer client:load>…</HomeTrainer>`. Inside it go:
    - `<Fragment slot="about">`, holding the existing `<h1>Learn chess patterns you can spot in a real game</h1>` and the intro `<p>`
    - `<ul slot="sections" class="topic-cards">`, holding the existing `topics.map(...)` cards
  - Remove the standalone `<NewsletterSignup client:load />` and its import, since HomeTrainer renders it now.
  - In each card, move `<p class="modes topic-actions">…</p>` to directly after the `<h2>`, before `<p>{topic.intro}</p>`.
  - Keep the `link-list` markup as it is.
- [X] T005 In `src/styles/styles.css`, re-scope the styles the moved markup used to get from `.page-text`, so the homepage looks the same before any layout change:
  - Copy the `.page-text .topic-cards`, `.page-text .topic-cards h2`, `.page-text .topic-actions`, `.page-text .topic-actions .mode`, `.page-text .newsletter` and `.page-text .newsletter h2` rules so they also match under `.layout.home`. For example, use `.page-text .topic-cards, .layout.home .topic-cards { … }`. Don't change the existing `.page-text` selectors, because the blog and newsletter pages use them.
  - Add `.home-about { color: var(--muted); font-size: 15px }` and `.home-about h1 { margin: 0 0 8px; color: var(--text); font-size: 20px; line-height: 1.25 }`.
  - Add `.home-about p { margin: 0 }`.
- [X] T006 In `src/styles/styles.css`, delete the `.layout.no-menu` rule and its entry in the `@media (max-width: 860px)` block. `HomeTrainer` was its only user (checked with grep). Add `.home-side { display: flex; flex-direction: column; gap: 16px; min-width: 0 }`.
- [X] T007 Run `npm run typecheck` and `npm run dev`. Confirm the homepage renders the board, then the info panel, intro and newsletter, then the topic cards in one column, and that the puzzle and newsletter form still work.

**Checkpoint**: The DOM is in the final order (board → side → sections), with no desktop grid yet.

---

## Phase 3: User Story 1 - See the whole homepage at a glance on a laptop or desktop (Priority: P1) 🎯 MVP

**Goal**: At ≥861px, show three columns (sections | board | side). The intro, newsletter CTA and all topic card headings with their Learn/Practice links are visible without scrolling at 1366×768, 1440×900 and 1920×1080 (SC-001).

**Independent Test**: quickstart.md, the "Manual viewport matrix" rows for 1366×768, 1440×900 and 1920×1080. Check before making any moves.

### Tests for User Story 1

- [X] T008 [P] [US1] In `tests/build.test.ts`, add a `describe('homepage layout', …)` block inside the existing `built site` suite, using `const html = read('index.html')`. Assert that:
  - the HTML contains `class="layout home"`, `class="home-side"` and `class="home-sections"`
  - `html.indexOf('<main')` < `html.indexOf('class="info"')` < `html.indexOf('<h1>')` < `html.indexOf('class="newsletter"')` < `html.indexOf('class="home-sections"')`
  - for every topic in `topics`, the HTML after `class="home-sections"` contains `href="${topic.path}"` and `href="${practicePath(topic.id)}"`

### Implementation for User Story 1

- [X] T009 [US1] In `src/styles/styles.css`, add the desktop grid inside `@media (min-width: 861px)`:
  - `.layout.home { grid-template-columns: minmax(220px, 280px) minmax(0, 1fr) minmax(240px, 340px); grid-template-areas: "sections board side"; }`
  - `.layout.home > main { grid-area: board; align-self: start }`
  - `.layout.home > .home-side { grid-area: side; align-self: start }`
  - `.layout.home > .home-sections { grid-area: sections; align-self: start }`

  Because each column is its own grid item with `align-self: start`, growth in the side column never moves the board or the sections (research.md, Decision 5).
- [X] T010 [US1] In `src/styles/styles.css`, add a `--home-chrome: 110px` custom property on `:root`, next to `--board-chrome`. It is the height of the frame padding, header and layout top padding. Then, inside `@media (min-width: 861px)`, make the sections column compact:
  - `.home-sections { max-height: calc(100svh - var(--home-chrome)); overflow-y: auto; padding-right: 4px }`
  - `.layout.home .topic-cards { grid-template-columns: minmax(0, 1fr); gap: 12px; margin: 0 }`
  - `.layout.home .topic-cards > li { padding: 12px 14px }`
  - `.layout.home .topic-cards h2 { font-size: 16px }`
  - `.layout.home .topic-cards p:not(.topic-actions) { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 14px }`
  - `.layout.home .topic-cards .link-list { display: none }`
- [X] T011 [US1] In `src/pages/index.astro`, shorten the intro `<p>` in the `about` slot to about 2 sentences (about 45 words), keeping the `{exercises.length}` count. For example: "Strong players recognise patterns instead of calculating from scratch. Solve each motif on the board, then test yourself on {exercises.length} practice positions that hide which motif you're looking at." Leave the h1 text unchanged, because the build tests and SEO depend on it.
- [X] T012 [US1] In `src/styles/styles.css`, inside `@media (min-width: 861px)`, tighten the newsletter in the side column: `.layout.home .newsletter { margin: 0; padding: 14px 16px }` and `.layout.home .newsletter h2 { font-size: 16px }`. This brings the side column under about 690px before the first move at 1366×768 (research.md, Decision 4).
- [X] T013 [US1] Run `npm run dev` and go through the quickstart.md matrix rows for 1366×768, 1440×900, 1920×1080 and 2560×900.
  - If the side column or the sections column overflows at 1366×768, adjust `--home-chrome` or the compact paddings and font sizes from T010 and T012.
  - Don't make the board smaller unless that isn't enough. If it comes to that, use a homepage-only override of `--board-chrome` on `.layout.home` (research.md, Decision 3).
  - Record the final values in an "Implementation Notes" section at the end of this file.

**Checkpoint**: The MVP. The desktop homepage shows everything in the first screen.

---

## Phase 4: User Story 2 - Usable homepage on a phone (Priority: P2)

**Goal**: At ≤860px, the page is one column in the order board → info panel → intro → newsletter → topic cards, with the cards shown in full (FR-007). The board is at least 280px wide (SC-002).

**Independent Test**: quickstart.md, the rows for 390×844 and 1280×600.

### Implementation for User Story 2

- [X] T014 [US2] In `src/styles/styles.css`, add the homepage board size rules:
  - Outside any media query: `.layout.home main > .board, .layout.home main > .empty-state { min-width: min(280px, 100%) }`
  - Inside `@media (min-width: 861px)`: `.layout.home main > .board, .layout.home main > .empty-state { max-width: max(280px, min(100%, calc(100svh - var(--board-chrome)))) }`
  - This rule must come after the existing `main > .board` rule so it wins. Check that `QuizBoard`'s board element gets the same classes; if not, add its selector too.
- [X] T015 [US2] In `src/styles/styles.css`, inside `@media (max-width: 860px)`, add `.layout.home { grid-template-columns: minmax(0, 1fr) }`. Confirm that none of the desktop-only compact rules from T010 and T012 leak into phones: the motif lists are visible, the intro isn't clamped and `.home-sections` has no `max-height`.
- [X] T016 [US2] Check quickstart.md at 390×844 and 1280×600. The board must be ≥ 280px, the order must be correct, and the h1 must be visible within one screen of scrolling. If it isn't, reduce the vertical spacing in `.home-side` on phones in `src/styles/styles.css`.

**Checkpoint**: The phone layout is correct and the desktop layout from US1 is unchanged.

---

## Phase 5: User Story 3 - Other pages are unaffected (Priority: P3)

**Goal**: Lesson and practice boards keep their exact current size (FR-004, SC-003).

**Independent Test**: quickstart.md "Regression checks", step 1.

### Implementation for User Story 3

- [X] T017 [US3] Search `src/styles/styles.css` and confirm that every rule added in T005–T015 is scoped under `.layout.home`, `.home-side`, `.home-about` or `.home-sections`. The only exceptions are the `.page-text` rules copied in T005 and the `--home-chrome` variable. Also confirm that the existing `.layout`, `main > .board` and `.page-text` rules are byte-for-byte unchanged, using `git diff src/styles/styles.css`.
- [X] T018 [US3] Compare the computed `.board` width on `/checkmates/<any motif>` and `/checkmates/practice` at 1366×768, 1440×900 and 1920×1080 against the baseline branch (`homepage-random-exercises`). The difference must be 0px. Also check that `/blog` and `/newsletter/*` look unchanged, since they share the `.page-text` newsletter and h2 styles.

**Checkpoint**: All three stories work on their own.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T019 Go through the remaining quickstart.md regression checks:
  - **Step 2:** play moves, reveal the pattern, press Next. The board and the left column must not move.
  - **Step 3:** after the newsletter confirmation, no gap is left.
  - **Step 4:** on Slow 4G, there is no layout jump when the page hydrates (SC-004).
- [X] T020 [P] Run `npm test`, `npm run typecheck` and `npm run test:build`. All must pass, including the T008 assertions and the existing `/` title, description, canonical URL and h1 checks.
- [X] T021 [P] Update `specs/006-random-exercise-homepage/contracts/ui.md`'s note that `HomeTrainer` is "no props" and mounted before `article.page-text`. Point it to `specs/007-homepage-viewport-fit/contracts/ui.md` as the current contract.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies.
- **Foundational (Phase 2)**: depends on T001. T002 → T003 → T004 run in order (same component, then the page that uses its props). T005 and T006 can run once T004 is done. T007 comes last.
- **US1 (Phase 3)**: depends on Phase 2. T008 can be written in parallel with T009–T012. T009 → T010 → T012 are all in `styles.css`, so run them one after another. T011 is in `index.astro` and can run in parallel with T009/T010. T013 comes last.
- **US2 (Phase 4)**: depends on Phase 2. It is best done after US1, because T014 and T015 extend the same media blocks in `styles.css`.
- **US3 (Phase 5)**: verification only. Do it after US1 and US2.
- **Polish (Phase 6)**: after all stories.

### Within Each Story

- Write the build test (T008) first and watch it fail against the Phase 2 DOM if it hasn't been run yet. The order checks should already pass after Phase 2; the grid class check passes after T003.
- Do the CSS before the manual viewport checks.

### Parallel Opportunities

- T008 (`tests/build.test.ts`) ∥ T009–T010 (`src/styles/styles.css`) ∥ T011 (`src/pages/index.astro`).
- T020 ∥ T021.

## Parallel Example: User Story 1

```text
Task: "T008 [US1] Add homepage layout assertions in tests/build.test.ts"
Task: "T009 [US1] Add the desktop 3-column grid in src/styles/styles.css"
Task: "T011 [US1] Shorten the intro paragraph in src/pages/index.astro"
```

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 (T001), then Phase 2 (T002–T007).
2. Phase 3 (T008–T013). Stop and check the desktop matrix in quickstart.md. This alone fixes the reported problem.

### Incremental Delivery

1. Foundation: the DOM restructure is shippable on its own. It looks like today's single column, with the intro now under the info panel.
2. Add US1: desktop three columns (the MVP).
3. Add US2: phone board floor and full cards.
4. Run the US3 regression check, then the Polish tasks, then merge.

---

## Implementation Notes (2026-11-18)

**Final values** (T013):
- `--home-chrome: 110px` was kept.
- The homepage sets its own `--board-chrome: 210px` on `.layout.home` at ≥861px. The lesson-page value is 190px.
- At 1366×768 the home controls wrap to two rows (82px). With 190px they ended at 776px, below the 768px window. With 210px the board is 558px and the controls end at 756px.
- The practice pages have the same two-row overflow at 1366×768 when the controls wrap, depending on the exercise. That is outside this feature's scope (FR-004).

**Measured with headless Chrome** against `astro preview`. The script lived in a scratch directory outside the repo and nothing was added to the project.

| Viewport | Board | Controls | Info | h1 | Newsletter + Subscribe | 3 card headings + Learn/Practice |
|----------|-------|----------|------|----|------------------------|----------------------------------|
| 1366×768 | 558px ✓ | ✓ | ✓ | ✓ | ✓ (bottom 656) | ✓ (bottom 547) |
| 1440×900 | 690px ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 1920×1080 | 870px ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 2560×900 | 690px ✓ (height-bound) | ✓ | ✓ | ✓ | ✓ | ✓ |
| 1280×600 | 390px | ✓ | ✓ | ✓ | scrolls (allowed, FR-003) | ✓ |
| 390×844 | 350px ✓ (≥ 280) | ✓ | ✓ | top 724, in the first screen ✓ | below the fold | below, full motif lists ✓ |

**Regression checks:**
- **SC-003:** lesson and practice boards are 578 / 710 / 890px at the three desktop sizes. That equals `100svh − 190px`, the same as before. The existing `.layout`, `main > .board` and `.page-text` rules are unchanged; their selectors were only extended (T017).
- **T019 step 2:** with Reveal pattern, Show solution and Next, the board (top 100px, left 374px) and the sections column (top 100px, left 27px) did not move. The side column grew to 1167px.
- **SC-004 on desktop:** the board, h1 and sections are in the same place with and without JS.
- **SC-004 on phones:** the board and h1 don't move. The topic cards move down once the newsletter form mounts, because `NewsletterSignup` renders nothing before hydration so subscribers never see a flash of the form (spec 001). The cards start below the fold at 844px, so nothing visible jumps.

**Fixes beyond the original task text:**
- *Analyze F1:* `NewsletterSignup` renders nothing on the server. HomeTrainer therefore wraps it in an always-rendered `div.home-newsletter`, which the build test checks instead of `.newsletter`. `.home-newsletter:empty { display: none }` removes the 16px gap for returning subscribers (checked: the side column ends exactly at the intro).
- *Analyze U1:* the slots render once, inside `<astro-slot>`, with no `<template>` copies. The build test still strips templates as a guard.
- *Newsletter heading on phones:* it lost its 17px size from `.page-text h2`, so `.home-side .newsletter h2` now sets 17px (16px on desktop).
- *Existing homepage build tests* from 006 and 001 asserted the old structure: the trainer before `article.page-text`, and a separate `NewsletterSignup` island. They now assert the intro inside the trainer island and the newsletter wrapper inside it.

**Not done:**
- The real newsletter form submission in T019 step 3. It would subscribe a test address against the live API. The `done` state is the same component as before and only gets shorter.
- The 125% zoom row (analyze C2).

**Follow-up (2026-11-18): homepage breakpoint moved to 1290px.** At the user's request, the homepage switches from one column to three at `min-width: 1290px`, not 861px. Below 1290px the page is one column (`max-width: 1289px` overrides the 3-column `.layout` that applies from 861px), with full topic cards. Lesson pages keep 861px. Measured: 1289px wide gives one column with a 610px board; 1290px gives three columns (280 | 570 | 340) with everything in the first screen; 1366×768 and 1920×1080 are unchanged.
