# UI Contract: Hint Button Progression

## `src/lib/puzzle.ts` (pure, unit-tested)

```ts
export type HintButtonState = 'hint' | 'piece' | 'move' | 'done';
export function hintButtonState(showHint: boolean, step: HintStep): HintButtonState;
```

## `usePuzzle` (`src/components/react/usePuzzle.ts`): additions

```ts
hintButton: HintButtonState;   // hintButtonState(showHint, hintStep)
pressHint: () => void;         // !showHint → setShowHint(true); else advanceHint()
```

Existing fields stay: `showHint`, `setShowHint`, `hintStep`, `canAdvanceHint`, `advanceHint`, `boardProps.shapes`.

## `HintButton` (new, `src/components/react/HintButton.tsx`)

```ts
type Props = {
  state: HintButtonState;
  disabled: boolean;     // isDone || busy || (state in piece|move && !canAdvanceHint)
  onPress: () => void;
};
```

- One `<button className="hint-button" aria-label={fullLabel} aria-live="polite">`.
- Renders all four `<ButtonLabel>`s inside `<span className="hint-labels">`. The active one has class `is-active`.
- `state === 'done'` → `aria-disabled="true"`, `onClick` does nothing, and the real `disabled` attribute isn't set.

## Controls

- `PatternControls` and `PracticeControls` replace `showHint: boolean` + `onShowHint` with `hintState: HintButtonState`, `canAdvanceHint: boolean` and `onPressHint: () => void`, and render `<HintButton>` where the Hint button is today. `PracticeControls` keeps `hasHint`.

## Removed

- `src/components/react/HintReveal.tsx` and `.hint-reveal*` CSS.
- The `hintStep`, `canAdvanceHint` and `onAdvanceHint` props on `MotifInfo` and `PracticeInfo`.

## CSS (`src/styles/styles.css`)

```css
.hint-labels { display: inline-grid; }
.hint-labels > * { grid-area: 1 / 1; visibility: hidden; }  /* each ButtonLabel wrapper */
.hint-labels > .is-active { visibility: visible; }
.controls button[aria-disabled='true'] { opacity: 0.4; cursor: default; }
```
