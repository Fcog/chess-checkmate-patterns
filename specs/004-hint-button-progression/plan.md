# Implementation Plan: Hint Button Progression (Hint → Reveal piece → Reveal move)

**Branch**: `new-hint-feature` (spec dir `004-hint-button-progression`) | **Date**: 2026-11-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-hint-button-progression/spec.md`

## Summary

The reveal steps from feature 003 move onto the existing Hint button in the controls bar. That one button cycles Hint → Reveal piece → Reveal move → Move revealed, so the learner presses the same spot each time. The reveal logic from 003 (`nextHintMove`, `hintShapes`, `hintStep` in `usePuzzle`) is reused as it is. A small pure function, `hintButtonState`, works out the button state. A new `HintButton` renders all labels stacked in one grid cell so its width never changes, and it uses `aria-disabled` at the final step so keyboard focus isn't lost. The under-hint `HintReveal` button from 003 is removed.

## Technical Context

**Language/Version**: TypeScript 6, React 18 islands in Astro 7

**Primary Dependencies**: chessground 9, chess.js 1.4 (unchanged)

**Storage**: N/A

**Testing**: Vitest (`npm test`), `astro check` (`npm run typecheck`)

**Target Platform**: Modern browsers, desktop and mobile

**Project Type**: Static web app (Astro and React)

**Performance Goals**: The label and board marks update on the same frame as the press

**Constraints**: No layout shift in the controls row (FR-005). Keep the 003 behaviour (SC-004). No new dependencies.

**Scale/Scope**: About 8 files touched, 1 component added (`HintButton`), 1 removed (`HintReveal`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the unfilled template, so it has no gates. **PASS** before and after design. The design removes a component and adds no dependencies.

## Project Structure

### Documentation (this feature)

```text
specs/004-hint-button-progression/
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
├── puzzle.ts                 # + HintButtonState, hintButtonState()
└── puzzle.test.ts            # + hintButtonState cases

src/components/react/
├── usePuzzle.ts              # + hintButton, pressHint
├── HintButton.tsx            # NEW: the cycling button (stacked labels, aria-disabled at the end)
├── HintReveal.tsx            # DELETED
├── PatternControls.tsx       # Hint button → <HintButton>
├── PracticeControls.tsx      # Hint button → <HintButton>
├── MotifInfo.tsx             # remove <HintReveal> and its props
├── PracticeInfo.tsx          # remove <HintReveal> and its props
├── MotifTrainer.tsx          # rewire hint props from Info to Controls
└── PracticeTrainer.tsx       # rewire hint props from Info to Controls

src/styles/styles.css         # − .hint-reveal*, + .hint-labels stacking, + aria-disabled style
```

**Structure Decision**: Single Astro project, same layout as 003. The pure state logic goes in `src/lib/puzzle.ts`, next to the 003 hint helpers.

## Implementation Notes

1. `hintButtonState(showHint, step)`: `!showHint` gives `'hint'`, then `['piece','move','done'][step]`.
2. `usePuzzle`: add `hintButton = hintButtonState(showHint, hintStep)` and `pressHint = () => (showHint ? advanceHint() : setShowHint(true))`. Leave all the 003 reset points alone.
3. `HintButton`: labels are `{hint:['Hint','Hint'], piece:['Reveal piece','Piece'], move:['Reveal move','Move'], done:['Move revealed','Shown']}`. Wrap each `ButtonLabel` in a `<span>` (with `is-active` on the current one) inside `<span className="hint-labels">`. In the `done` state: `aria-disabled`, and a click does nothing.
4. Controls disabled rule: `isDone || busy || ((state === 'piece' || state === 'move') && !canAdvanceHint)`.
5. Trainers: pass `hintState={puzzle.hintButton}`, `canAdvanceHint={puzzle.canAdvanceHint}` and `onPressHint={puzzle.pressHint}` to the controls, and drop the props going to the Info components.
6. CSS: stacking rules, plus `[aria-disabled='true']` styled like `:disabled`. Make sure `:hover:not(:disabled)` also excludes `[aria-disabled='true']`.

## Complexity Tracking

No violations.
