# Implementation Plan: Progressive Hint Reveal (Piece, then Move)

**Branch**: `new-hint-feature` (spec dir `003-hint-reveal-move`) | **Date**: 2026-11-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-hint-reveal-move/spec.md`

## Summary

When the text hint is visible, a single button appears under it. The first press circles the piece for the player's next solution move, and the second press draws an arrow for the full move. The state lives in `usePuzzle` as `hintStep` (0/1/2) and resets on every correct move, load, reset and show-solution. The next move comes from the existing `line[ply]` via `playSan`. Shapes are drawn with chessground's `setAutoShapes`, so they don't clash with last-move or check highlights and follow board orientation.

## Technical Context

**Language/Version**: TypeScript 6 (React 18 islands in Astro 7)

**Primary Dependencies**: chessground 9 (board and auto-shapes), chess.js 1.4 (move resolution)

**Storage**: N/A (in-memory React state only)

**Testing**: Vitest (`npm test`), `astro check` (`npm run typecheck`)

**Target Platform**: Modern browsers, desktop and mobile

**Project Type**: Static web app (Astro site with React islands)

**Performance Goals**: The reveal shows within one frame of the press (it's just a state change and a shape redraw)

**Constraints**: Don't change puzzle checking or solved tracking (FR-012). Add no new dependencies.

**Scale/Scope**: 2 trainers (`MotifTrainer`, `PracticeTrainer`), about 6 files touched and 1 new component

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the unfilled template, so it defines no principles or gates. Result: **PASS** (nothing to violate). After Phase 1, the design still adds no dependencies, persistence or new projects: **PASS**.

## Project Structure

### Documentation (this feature)

```text
specs/003-hint-reveal-move/
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
├── puzzle.ts            # + nextHintMove(), hintShapes(), HintStep
└── puzzle.test.ts       # + unit tests for the two helpers

src/components/react/
├── usePuzzle.ts         # + hintStep, advanceHint, canAdvanceHint, boardProps.shapes; resets
├── Board.tsx            # + shapes prop → api.setAutoShapes
├── HintReveal.tsx       # NEW: the single cycling button
├── MotifInfo.tsx        # render <HintReveal> under .hint
├── PracticeInfo.tsx     # render <HintReveal> under .hint
├── MotifTrainer.tsx     # pass hint props to MotifInfo
└── PracticeTrainer.tsx  # pass hint props to PracticeInfo (still off in quiz mode)

src/styles/styles.css    # + .hint-reveal button style
```

**Structure Decision**: Single Astro project. The pure logic goes in `src/lib/puzzle.ts`, next to `playSan`/`checkMove`, so it can be unit-tested. The UI wiring follows the existing pattern: hook state goes in `usePuzzle`, and presentational props are passed through the trainers into the info asides.

## Implementation Notes

1. **Lib**: `nextHintMove(fen, line, ply)` returns `{from,to}` from `playSan(fen, line[ply])`, or `null` if the move is missing or illegal (catch the error). `hintShapes(move, step)` returns `[]`, `[{orig, brush:'green'}]` or `[{orig, dest, brush:'green'}]`.
2. **Hook**: add `const [hintStep, setHintStep] = useState<HintStep>(0)`. Reset it to 0 in `load`, in `reveal`, and in the correct-move branch of `onMove`. Leave it alone in the wrong-move branch. Work out `hintMove` only when `showHint && !isDone && !busy && !displayFen`. Expose `hintStep`, `advanceHint`, `canAdvanceHint` and `boardProps.shapes`.
3. **Board**: add a separate effect `api.current?.setAutoShapes(props.shapes ?? [])` with deps `[props.shapes, props.fen, props.syncKey]`. Memoise the shapes in the hook so the reference stays stable.
4. **UI**: `HintReveal` shows "Reveal piece", "Reveal move" or "Move revealed" depending on the step. Render it in `MotifInfo` and `PracticeInfo` right after the `.hint` `<p>`, gated on `showHint && !isDone`.
5. **Styles**: `.hint-reveal` uses the same look as the existing buttons (see `.controls button`), with a small top margin.

## Complexity Tracking

No violations. This section isn't needed.
