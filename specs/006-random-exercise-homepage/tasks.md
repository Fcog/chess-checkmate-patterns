---
description: "Task list for Random Exercise on the Homepage"
---

# Tasks: Random Exercise on the Homepage

**Input**: Design documents from `specs/006-random-exercise-homepage/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui.md, quickstart.md

**Tests**: These are included because plan.md and contracts/ui.md require them: a unit test for `reshuffle` (Vitest) and homepage HTML assertions in the build test.

**Organization**: Tasks are grouped by user story so that each story can be built and tested on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the baseline is green before changing anything.

- [X] T001 Run `npm test` and `npm run typecheck` from the repo root and confirm both pass on the current `main` code, so later failures can be attributed to this feature.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add the layout modifier that the homepage trainer needs. Without it, `.layout` has a menu column first and the board would sit in the wrong column.

- [X] T002 Add `.layout.no-menu { grid-template-columns: minmax(0, 1fr) minmax(240px, 340px); }` directly after the `.layout` rule (~line 162) in src/styles/styles.css. Inside the existing `@media (max-width: 860px)` block (~line 887), add `.layout.no-menu { grid-template-columns: minmax(0, 1fr); }` next to the existing `.layout` override. The two-class selector would otherwise beat that override and break mobile.

**Checkpoint**: Foundation ready.

---

## Phase 3: User Story 1 - Solve a random puzzle immediately on landing (Priority: P1) 🎯 MVP

**Goal**: A playable board with a randomly chosen exercise from all sections appears on `/`, above the existing intro text and topic cards.

**Independent Test**: Run `npm run dev` and open `/`. A board is shown above the `<h1>`, moves get Practice-style feedback, and reloading shows different exercises from different sections. Topic cards, the newsletter form and the SEO head are unchanged.

### Tests for User Story 1

- [X] T003 [P] [US1] In tests/build.test.ts, add a `describe` block (inside the existing `describe.skipIf(!existsSync(...dist))` or in a sibling with the same guard) that reads `dist/index.html` and asserts:
  - (a) it contains `astro-island` with `HomeTrainer` in its component URL/props (match `/astro-island[^>]*HomeTrainer/`)
  - (b) it still contains `class="topic-cards"` and the existing `<h1>Learn chess patterns you can spot in a real game</h1>`
  - (c) the `astro-island` markup appears before `class="page-text`

  The existing per-page head checks already cover the title, description and JSON-LD (FR-009).

### Implementation for User Story 1

- [X] T004 [US1] Create src/components/react/HomeTrainer.tsx exporting `function HomeTrainer()` with no props.
  - **Imports**: `exercises` and `type Exercise` from `../../lib/exercises`, `shuffle` from `../../lib/helpers`, `motifById` from `../../lib/motifs`, plus `Board`, `Feedback` / `QuizFeedback`, `Header`, `PracticeControls`, `PracticeInfo`, `QuizBoard`, `usePuzzle` and `useSolved`, using the same import paths as src/components/react/PracticeTrainer.tsx.
  - **State**:
    - `const pool = exercises`, all of them with no topic filter (FR-002).
    - `order`: `useState<Exercise[]>(pool)`. The original order keeps the server and client renders identical.
    - `index`: `useState(0)`.
    - `shown`: `useState(1)`.
    - `revealPattern`: `useState(false)`.
    - `quizAnswer`: `useState<boolean | null>(null)`.
    - `const { solved, markSolved } = useSolved()` and `const puzzle = usePuzzle(order[0], markSolved)`.
  - **Navigation**: a `goTo(nextIndex, list)` callback that sets the index, resets `revealPattern` to false and `quizAnswer` to null, and calls `puzzle.load(list[nextIndex])`. Copy the `goTo` in PracticeTrainer.tsx.
  - **Mount effect**: `const shuffled = shuffle(pool); setOrder(shuffled); goTo(0, shuffled);` with deps `[goTo]`.
  - **Derived values**:
    - `const exercise = order[index]`
    - `exercisePattern = useMemo(() => motifById(exercise.motifId), [exercise])`
    - `isQuiz = exercise.goal.kind === 'quiz'`
    - `answerQuiz` copied from PracticeTrainer.tsx
  - **Render**: `<div className="app">`, then `<Header progress={`${pool.filter((ex) => solved.includes(ex.id)).length} / ${pool.length} solved`} />`, then `<div className="layout no-menu">` containing:
    - `<main>`: `QuizBoard` when it's a quiz; otherwise `<Board {...puzzle.boardProps} />` plus `PracticeControls`, wired exactly as in PracticeTrainer.tsx.
    - `PracticeInfo`, wired exactly as in PracticeTrainer.tsx, with `exerciseIndex={shown - 1}`.

    For now, pass `canGoNext={pool.length >= 2}`, `canGoPrevious={false}`, `onPrevious={() => {}}` and `onNext={() => {}}`. US2 wires them up.
- [X] T005 [US1] In src/pages/index.astro, replace `<div class="app"><Header /></div>` with `<HomeTrainer client:load />`. Replace the `Header` import with `import { HomeTrainer } from '../components/react/HomeTrainer';`. Leave the `<Base>` props (title, description, path, jsonLd) and the whole `<article class="page-text legal">` unchanged (FR-001, FR-009).
- [X] T006 [US1] Run `npm run typecheck` and `npm run test:build`. Confirm T003 passes and the existing build tests still pass. Run `npm run dev`, open `/`, and check quickstart.md rows 1–4 and 12.

**Checkpoint**: The homepage shows a playable random exercise. MVP delivered.

---

## Phase 4: User Story 2 - Move on to the next random exercise (Priority: P1)

**Goal**: **Next** loads another random exercise. Nothing repeats until the whole pool has been shown, and a new cycle never starts with the exercise just shown.

**Independent Test**: On `/`, press Next about 50 times. There are no repeats, all three sections appear, and Next works on unsolved exercises.

### Tests for User Story 2

- [X] T007 [P] [US2] Add a `describe('reshuffle')` block to src/lib/practice.test.ts, reusing the existing `ex()` helper and `list`. It should check:
  - (1) the result has the same length and the same ids as the input (sorted ids are equal);
  - (2) the input array is not mutated;
  - (3) over 200 runs, `reshuffle(list, 'a')[0].id !== 'a'` every time;
  - (4) `reshuffle([], 'a')` returns `[]`;
  - (5) `reshuffle([single], single.id)` returns `[single]` as a new array (`not.toBe` input);
  - (6) over 600 runs with no `avoidFirstId`, every id appears first at least once.

### Implementation for User Story 2

- [X] T008 [US2] In src/lib/practice.ts, add and export `reshuffle<T extends { id: string }>(list: T[], avoidFirstId?: string): T[]` (contract in contracts/ui.md). Import `shuffle` from `./helpers`, then call `const result = shuffle(list)`. If `result.length >= 2 && result[0].id === avoidFirstId`, swap index 0 with `1 + Math.floor(Math.random() * (result.length - 1))`. Return `result`. Rule from data-model.md: "When a cycle starts again, `order[0].id !== previous current id` whenever the pool has 2 or more exercises." Add a JSDoc comment matching the contract. Run `npm test` and confirm T007 passes.
- [X] T009 [US2] In src/components/react/HomeTrainer.tsx, wire up navigation:
  - **`goNext`**: if `index + 1 < order.length`, call `goTo(index + 1, order)`. Otherwise:

    ```ts
    const next = reshuffle(pool, exercise.id);
    setOrder(next);
    goTo(0, next);
    ```

    Always call `setShown((n) => n + 1)`.
  - **`goPrevious`**: if `index > 0`, call `goTo(index - 1, order)`.
  - **Props**: pass `canGoPrevious={index > 0}`, `onNext={goNext}` and `onPrevious={goPrevious}` to both `PracticeControls` and `QuizBoard`.

  Import `reshuffle` from `../../lib/practice`. Rule from data-model.md: "`order` is always a permutation of the pool, with no duplicates (FR-004)."
- [ ] T010 [US2] Check quickstart.md rows 7 and 11 in `npm run dev`. Pressing Next rapidly must end on one complete position. `usePuzzle.load` already clears pending timers, so confirm no stale reply animation shows.

**Checkpoint**: US1 and US2 together give a continuous mixed practice session on the homepage.

---

## Phase 5: User Story 3 - See what the pattern was and continue into a section (Priority: P2)

**Goal**: After an exercise is solved or revealed, the info panel shows the pattern and section with "Learn …" and "Practise …" links.

**Independent Test**: Solve, or press Reveal pattern on, a homepage exercise. The pattern name and both links appear and open the right pages. The Practice pages show no new links.

### Implementation for User Story 3

- [X] T011 [US3] In src/components/react/PracticeInfo.tsx:
  - Add `showLinks?: boolean` to `Props` (default `false` in destructuring).
  - Import `motifPath` from `../../lib/motifs`, and `practicePath` and `topicById` from `../../lib/topics`.
  - Inside the existing `(revealPattern || isDone) && exercisePattern` fragment, after `<p className="idea">`, render the following when `showLinks` is set:

    ```tsx
    <p className="modes topic-actions">
      <a className="mode" href={motifPath(exercisePattern)}>Learn {exercisePattern.name}</a>
      <a className="mode" href={practicePath(exercise.topic)}>Practise {topicById(exercise.topic).name}</a>
    </p>
    ```

  Don't change any other behaviour, so PracticeTrainer.tsx stays unaffected.
- [X] T012 [US3] In src/components/react/HomeTrainer.tsx, pass `showLinks` to `<PracticeInfo>`. Then check quickstart.md rows 4–5 in `npm run dev`. Also confirm that `/checkmates/practice` shows no "Learn …" / "Practise …" links after solving.

**Checkpoint**: The homepage puzzle now leads into the Learn and Practice sections.

---

## Phase 6: User Story 4 - Get a hint (Priority: P3)

**Goal**: The existing hint progression works on homepage exercises.

**Independent Test**: On a homepage exercise that has a hint, pressing Hint cycles through Hint, Reveal piece and Reveal move, the same as in Practice.

### Implementation for User Story 4

- [X] T013 [US4] In src/components/react/HomeTrainer.tsx, confirm `PracticeControls` gets these props from T004, and add any that are missing:
  - `hasHint={!!exercise?.hint}`
  - `hintState={puzzle.hintButton}`
  - `canAdvanceHint={puzzle.canAdvanceHint}`
  - `onPressHint={puzzle.pressHint}`

  Also confirm `PracticeInfo` gets `showHint={isQuiz ? false : puzzle.showHint}`. Then check quickstart.md row 6 in `npm run dev`.

**Checkpoint**: All user stories are working.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T014 [P] Check quickstart.md rows 8 (quiz exercise), 9 (solved count shared with Practice) and 10 (no horizontal scroll under 860px). Fix any layout issue in src/styles/styles.css by adjusting only the `.layout.no-menu` rules.
- [X] T015 Run the full validation: `npm test`, `npm run typecheck` and `npm run test:build`. All three must pass.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (T001)**: no dependencies.
- **Foundational (T002)**: after Setup; blocks US1 rendering correctly.
- **US1 (T003–T006)**: after T002. This is the MVP.
- **US2 (T007–T010)**: after US1, because it edits HomeTrainer.tsx. T007 and T008 touch only src/lib, so they can be done in parallel with US1.
- **US3 (T011–T012)**: T011 (PracticeInfo.tsx) can run in parallel with US1 and US2. T012 needs T004.
- **US4 (T013)**: after T004. In practice it's just a check.
- **Polish (T014–T015)**: after all stories.

### Within Each Story

- Write tests (T003, T007) before the implementation they cover, and confirm they fail first.
- HomeTrainer.tsx is edited by T004, T009, T012 and T013, so those run in sequence.

### Parallel Opportunities

- T003 (tests/build.test.ts), T007 + T008 (src/lib/practice*.ts) and T011 (PracticeInfo.tsx) all touch different files and can run alongside T004.

## Parallel Example

```text
# Alongside T004 (HomeTrainer.tsx):
T003 [US1] homepage build assertions in tests/build.test.ts
T007 [US2] reshuffle unit tests in src/lib/practice.test.ts → T008 reshuffle in src/lib/practice.ts
T011 [US3] showLinks prop in src/components/react/PracticeInfo.tsx
```

## Implementation Strategy

### MVP First

1. T001 → T002 → T003–T006, which gives a random exercise on the homepage. Stop here and validate.

### Incremental Delivery

2. US2 (Next with no repeats) makes the homepage a continuous session. Ship together with the MVP if possible, since a single puzzle with a dead Next button isn't ideal.
3. US3 adds links into the sections.
4. US4 is a check: hints come from the shared controls.
5. Finish with the Polish phase.

## Implementation Notes (2026-11-17)

- Automated checks pass: `npm test` (1928 passed), `npm run typecheck` (0 errors), `npm run test:build` (881 passed, including the new homepage checks).
- In the built `dist/index.html`, the trainer sits before `article.page-text`, uses `.layout.no-menu`, and its heading reads "Exercise 1" with no pattern name.
- **Still open (manual, needs a browser)**: T010 (rapid Next) and T014 (quiz / shared solved count / under-860px layout), plus the interactive parts of T006 and T012 (quickstart.md rows 1–12).
