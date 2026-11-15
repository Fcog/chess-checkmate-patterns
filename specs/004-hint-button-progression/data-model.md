# Data Model: Hint Button Progression

This is client-side, short-lived state only. Nothing is persisted, and nothing changes in `Puzzle`, `Exercise` or `Motif`.

## Inputs (existing, from 003)

| Field | Owner | Reset when |
|-------|-------|------------|
| `showHint: boolean` | `usePuzzle` | `load` (new puzzle or reset) |
| `hintStep: 0 \| 1 \| 2` | `usePuzzle` | `load`, each correct player move, `reveal` |

## HintButtonState (derived, new)

`hintButtonState(showHint, hintStep)`:

| `showHint` | `hintStep` | State | Full label | Short label | Press does |
|------------|------------|-------|------------|-------------|------------|
| false | any | `hint` | Hint | Hint | `setShowHint(true)` |
| true | 0 | `piece` | Reveal piece | Piece | `advanceHint()` → step 1 |
| true | 1 | `move` | Reveal move | Move | `advanceHint()` → step 2 |
| true | 2 | `done` | Move revealed | Shown | nothing (`aria-disabled`) |

### Transitions

```text
hint --press--> piece --press--> move --press--> done
piece|move|done --correct move--> piece      (showHint stays true, hintStep → 0)
any --load / reset / next puzzle--> hint
```

## Disabled rules

- `disabled` (real attribute) when `isDone || busy || (state !== 'hint' && state !== 'done' && !canAdvanceHint)`.
- `aria-disabled="true"` with presses ignored when `state === 'done'`, so focus is kept.
- The button isn't rendered when the exercise has no hint (`hasHint` false). That's existing practice behaviour, and quiz mode doesn't render the controls at all.
