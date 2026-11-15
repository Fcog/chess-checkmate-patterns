# Data Model: Progressive Hint Reveal

This is client-side, short-lived state only. Nothing is persisted, and the shapes of `Puzzle`, `Exercise` and `Motif` don't change.

## HintStep

`0 | 1 | 2`, held in `usePuzzle`.

| Value | Meaning | Button label | Board shapes |
|-------|---------|--------------|--------------|
| 0 | Nothing revealed | "Reveal piece" | none |
| 1 | Piece revealed | "Reveal move" | circle on `from` |
| 2 | Move revealed | disabled ("Move revealed") | arrow `from → to` |

### Transitions

```text
0 --advanceHint--> 1 --advanceHint--> 2
any --load / reset / next puzzle--> 0
any --correct player move (ply advances)--> 0
any --reveal (show solution)--> 0
wrong move (reverted) --> unchanged
```

`advanceHint` does nothing when `busy`, `isDone`, `!showHint`, `hintStep === 2`, or there's no next move.

## HintMove

`{ from: Key; to: Key }`, worked out from state on each render and never stored:

```text
hintMove = (showHint && !isDone && !busy && !displayFen)
  ? nextHintMove(fen, line, ply)   // playSan(fen, line[ply]) → { from, to }; null if line[ply] is missing or illegal
  : null
```

## Board shapes

`DrawShape[]`, worked out by `hintShapes(hintMove, hintStep)`:

- `hintMove == null` or `step 0` → `[]`
- `step 1` → `[{ orig: from, brush: 'green' }]`
- `step 2` → `[{ orig: from, dest: to, brush: 'green' }]`

## Validation rules

- `hintMove` always matches `line[ply]`, so it follows the line the player is on, including alternatives (FR-007).
- The shapes are empty whenever the reveal button is hidden (FR-002, FR-009) or the board is locked (FR-010).
