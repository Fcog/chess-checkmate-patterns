# UI Contract: Progressive Hint Reveal

These are internal interfaces between the lib, the hook and the components. They're the boundaries that the tasks and tests target.

## `src/lib/puzzle.ts` (pure, unit-tested)

```ts
/** The next move the player is expected to make, or null if there is none or it's illegal. */
export function nextHintMove(fen: string, line: string[], ply: number): { from: string; to: string } | null;

export type HintStep = 0 | 1 | 2;

/** Board shapes for the current reveal step. Empty for step 0 or when move is null. */
export function hintShapes(
  move: { from: string; to: string } | null,
  step: HintStep,
): { orig: string; dest?: string; brush: string }[];
```

## `usePuzzle` (`src/components/react/usePuzzle.ts`): new return fields

```ts
hintStep: HintStep;
advanceHint: () => void;      // 0→1→2; does nothing when locked, done, hint hidden or at 2
canAdvanceHint: boolean;      // showHint && !isDone && !busy && hintMove !== null && hintStep < 2
boardProps.shapes: DrawShape[]; // hintShapes(hintMove, hintStep)
```

## `Board` (`src/components/react/Board.tsx`)

- New optional prop `shapes?: DrawShape[]`.
- When it changes (and on `fen`/`syncKey` re-sync), call `api.setAutoShapes(shapes ?? [])`.

## `HintReveal` (new, `src/components/react/HintReveal.tsx`)

```ts
type Props = { step: HintStep; disabled: boolean; onReveal: () => void };
```

- Renders one `<button className="hint-reveal">`.
- Label: step 0 → "Reveal piece", step 1 → "Reveal move", step 2 → "Move revealed" (disabled).
- `disabled` when `!canAdvanceHint`.

## Placement

- `MotifInfo` and `PracticeInfo` take new props: `hintStep`, `canAdvanceHint`, `onAdvanceHint`.
- Render `<HintReveal>` straight after the `.hint` paragraph, only when `showHint && !isDone` (and, in `PracticeInfo`, `exercise.hint` exists). Quiz mode already passes `showHint={false}`, so the button stays hidden there.
