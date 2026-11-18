# Implementation Plan: Random Exercise on the Homepage

**Branch**: `006-random-exercise-homepage` | **Date**: 2026-11-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/006-random-exercise-homepage/spec.md`

## Summary

The homepage gets a playable board above its existing text. The board shows a random exercise drawn from every section's practice exercises. **Next** walks a shuffled order of the whole pool. When the order runs out, a fresh shuffle starts, and its first exercise is never the one just shown.

A new `HomeTrainer` island wires together parts that already exist, so moves, feedback, hints, quizzes and solved progress behave exactly as in Practice. It reuses:

- `usePuzzle`, `useSolved`, `Board`, `QuizBoard`, `PracticeControls` and `PracticeInfo` from `src/components/react/`
- `shuffle` from `src/lib/helpers.ts`

`PracticeInfo` gets one optional prop that shows "Learn this pattern" and "Practise <section>" links once the exercise is solved or revealed. A pure helper, `reshuffle`, in `src/lib/practice.ts` handles the no-repeat-across-cycles rule and is unit-tested.

## Technical Context

**Language/Version**: TypeScript 6, React 18 islands in Astro 7

**Primary Dependencies**: chessground 9, chess.js 1.4 (unchanged, no new dependencies)

**Storage**: Existing `localStorage` solved list (`checkmate-patterns:solved`) via `useSolved`. Nothing new is persisted.

**Testing**: Vitest (`npm test`) for `reshuffle`. Build test (`npm run test:build`, `tests/build.test.ts`) for homepage HTML. `astro check` (`npm run typecheck`).

**Target Platform**: Static site on Vercel, modern desktop and mobile browsers

**Project Type**: Static web app (Astro and React islands)

**Performance Goals**: Board playable within 2 s of landing (SC-001). Next renders in under 0.5 s (SC-002). Next is a local state change, with no network.

**Constraints**:
- The SEO head, JSON-LD and crawlable homepage text must not change (FR-009).
- The server-rendered HTML must not name the pattern (FR-006).
- No hydration mismatch: the server renders the pool's first exercise and the shuffle happens after mount, the same pattern `PracticeTrainer` uses.

**Scale/Scope**: About 6 files touched, 1 component added (`HomeTrainer`). The pool is every exercise in `src/lib/exercises.ts`, across the 3 sections.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the unfilled template, so it has no gates. **PASS** before and after design. The design adds no dependencies and reuses existing components rather than forking them.

## Project Structure

### Documentation (this feature)

```text
specs/006-random-exercise-homepage/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/ui.md
└── tasks.md             # created by /speckit-tasks
```

### Source Code (repository root)

```text
src/lib/
├── practice.ts                 # + reshuffle(list, avoidFirstId)
└── practice.test.ts            # + reshuffle cases

src/components/react/
├── HomeTrainer.tsx             # NEW: homepage board, random order across all sections
└── PracticeInfo.tsx            # + optional `showLinks` prop (pattern page + section practice links)

src/pages/index.astro           # <div class="app"><Header/></div> → <HomeTrainer client:load />
src/styles/styles.css           # + .layout.no-menu (two columns; one column under 860px)
tests/build.test.ts             # + homepage contains the trainer island and still has topic cards
```

**Structure Decision**: Single Astro project, same layout as features 004 and 005. The pure ordering logic goes in `src/lib/practice.ts` next to the other Practice helpers. The UI is one new island that composes existing components.

## Implementation Notes

1. `reshuffle(list, avoidFirstId)`: call `shuffle(list)`. If there are at least 2 items and the first one has id `avoidFirstId`, swap it with a random other position. This keeps the order uniform apart from that one exclusion.
2. `HomeTrainer`:
   - `pool = exercises`, all of them.
   - Initial state is `order = pool` in its original order, so server and client render the same thing. A mount effect then sets `order = shuffle(pool)` and calls `load(order[0])`.
   - `goNext`: if `index + 1 < order.length`, go to `index + 1`. Otherwise call `reshuffle(pool, current.id)` and go to 0.
   - `goPrevious`: `index - 1`. Disabled at 0, through `canGoPrevious = index > 0`.
   - `shown` counts exercises seen this visit and drives the "Exercise N" title.
   - Quiz handling is copied from `PracticeTrainer` (`quizAnswer`, `answerQuiz`, `QuizBoard`). `revealPattern` is reset on every navigation.
3. Rendering: `<div className="app">`, then `<Header progress={`${solvedCount} / ${pool.length} solved`} />` with no topic and no menu. Below it, `<div className="layout no-menu">` holds `<main>` (board and controls) and `<PracticeInfo … showLinks />`.
4. `PracticeInfo`, when `showLinks && (revealPattern || isDone) && exercisePattern`: render `<p className="modes topic-actions">`. It holds `<a className="mode" href={motifPath(pattern)}>Learn {pattern.name}</a>` and `<a className="mode" href={practicePath(exercise.topic)}>Practise {topic.name}</a>`, which reuses the existing homepage card link styles.
5. CSS: add `.layout.no-menu { grid-template-columns: minmax(0, 1fr) minmax(240px, 340px); }`. Repeat it with `minmax(0, 1fr)` inside the `max-width: 860px` media query, because the two-class selector would otherwise beat `.layout` there.
6. `index.astro`: swap the header-only `.app` div for `<HomeTrainer client:load />` and drop the unused `Header` import. Everything below (`article.page-text`, the newsletter and the topic cards) stays.

## Complexity Tracking

No violations.
