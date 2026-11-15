# Research: Hint Button Progression

No `NEEDS CLARIFICATION` items were left. The decisions below settle the design points by reading the code from feature 003 (commit `8dd034c`).

## R1. Reuse the 003 reveal logic as it is

- **Decision**: Keep `nextHintMove`, `hintShapes`, `HintStep` (`src/lib/puzzle.ts`) and `hintStep`/`advanceHint`/`canAdvanceHint`/`boardProps.shapes` (`usePuzzle`) unchanged. Only the control that triggers them moves.
- **Rationale**: The spec changes where the control sits, not what it reveals (FR-003, SC-004). The 003 helpers are already unit-tested.
- **Alternatives considered**: Merging `showHint` and `hintStep` into one 4-value state. That would mean rewriting tested reset logic for no user benefit, so I rejected it. Instead, a pure function works out the button state from the two existing values.

## R2. Working out the button state

- **Decision**: Add `export type HintButtonState = 'hint' | 'piece' | 'move' | 'done'` and `hintButtonState(showHint, step)` in `src/lib/puzzle.ts`. `!showHint` gives `hint`, and steps 0, 1 and 2 give `piece`, `move` and `done`. Add `pressHint()` to `usePuzzle`: if `!showHint` it calls `setShowHint(true)`, otherwise `advanceHint()`.
- **Rationale**: This is pure and testable, and it keeps both trainers free of branching logic. FR-006 (back to "Reveal piece", not "Hint", after a move) comes for free: `showHint` stays true while `hintStep` resets to 0.

## R3. No layout shift as the label changes (FR-005)

- **Decision**: The hint button renders **all four labels** stacked in one CSS grid cell (`display: inline-grid`, each label at `grid-area: 1 / 1`). Only the active one is shown; the others use `visibility: hidden`. The button is always as wide as its widest label, so neither it nor its neighbours ever move. Each label is a `ButtonLabel` (full and short), so the existing container-query short labels keep working on narrow screens.
- **Rationale**: Unlike a fixed `min-width`, this needs no magic pixel numbers and follows the font and short-label rules automatically. `visibility: hidden` also removes the inactive labels from the accessibility tree.
- **Alternatives considered**: A fixed `min-width` in `ch` is fragile across fonts and the two label sets. Measuring with JS is overkill.

## R4. Focus and announcements (FR-009)

- **Decision**: Render the same `<button>` element in every state, so React keeps the DOM node and its focus. Set `aria-label` to the current full label. In the final `done` state, use `aria-disabled="true"` and ignore presses, instead of the `disabled` attribute, so the browser doesn't drop focus from the button the user just pressed. Use the real `disabled` only for `isDone`, `busy` (board locked) or no next move. Add `aria-live="polite"` to the button.
- **Rationale**: Browsers blur a focused element when it becomes `disabled`, which would break keyboard flow at the last step.

## R5. Removing the 003 under-hint button

- **Decision**: Delete `src/components/react/HintReveal.tsx` and its `.hint-reveal` CSS. Remove the `hintStep`/`canAdvanceHint`/`onAdvanceHint` props from `MotifInfo` and `PracticeInfo` and their trainer wiring.
- **Rationale**: FR-004, SC-003. Leaving dead code behind invites drift.

## R6. Testing

- **Decision**: Add Vitest cases for `hintButtonState` in `src/lib/puzzle.test.ts`. Check layout and focus by hand (quickstart).
- **Rationale**: Same approach as 003. The repo has no component test harness.
