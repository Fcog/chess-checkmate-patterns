# Quickstart: Validate Progressive Hint Reveal

## Prerequisites

```bash
npm install
```

## Automated checks

```bash
npm test          # Vitest: includes nextHintMove / hintShapes cases in src/lib/puzzle.test.ts
npm run typecheck # astro check
```

Expected: all tests pass. The new tests cover:
- `nextHintMove` returns `{from,to}` for `line[ply]`, and returns `null` past the end of the line.
- `hintShapes` returns `[]`, then a circle, then an arrow for steps 0, 1 and 2.

## Manual scenarios (`npm run dev`)

1. **Piece then move (US1, US2)**: Open a pattern lesson. Press **Hint**. Check that **Reveal piece** appears under the hint text. Press it: the piece to move is circled. Press **Reveal move**: an arrow shows the move, and the button reads "Move revealed" and is disabled.
2. **Hidden before hint (FR-002)**: On a fresh puzzle, check there's no reveal button.
3. **Multi-move reset (US3)**: In Practice, open a mate in 2 or 3 (for example `anastasia-7`). Press Hint, then Reveal piece. Play the correct move. After the opponent's reply, the circle is gone and the button reads "Reveal piece". Pressing it circles the piece for the new move.
4. **Black to move**: Open `two-knights-3` (Black to move, flipped board). Check that the circle and arrow land on the knight and the queen's square (`Qh2`).
5. **Wrong move**: After Reveal piece, play a wrong move. While the refutation is shown, there are no shapes and the button is disabled. Once the position is put back, the circle returns.
6. **Clearing (FR-009)**: With shapes showing, press Show solution, Reset or Next. In each case no shapes remain and the reveal button is hidden (until Hint is pressed again).
7. **Quiz mode**: Open a quiz exercise. Check there's no reveal button.
