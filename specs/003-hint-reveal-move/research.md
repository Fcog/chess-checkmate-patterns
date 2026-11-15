# Research: Progressive Hint Reveal

No `NEEDS CLARIFICATION` items were left in Technical Context. The decisions below settle the open design points by reading the existing code.

## R1. Where the "next correct move" comes from

- **Decision**: Use `line[ply]`, played from the current `fen` with the existing `playSan` (`src/lib/puzzle.ts`), to get `{ from, to }`. Wrap it in a pure helper `nextHintMove(fen, line, ply)`.
- **Rationale**: `usePuzzle` already tracks `line`, which switches to an alternative line when the player picks one in `checkMove`, and `ply`, which only counts confirmed moves. On the player's turn, `line[ply]` is exactly the move the trainer expects, so the hint follows alternatives automatically. `playSan` already gives `from`/`to`.
- **Alternatives considered**: Always using `puzzle.solution[ply]`. That's wrong once the player has followed an alternative line. Searching all `solutionLines` for a match is unnecessary because `line` already holds the chosen line.

## R2. How to draw the reveal on the board

- **Decision**: Use chessground auto-shapes (`api.setAutoShapes`). The piece step draws a circle on the from-square (`{ orig: from, brush: 'green' }`). The move step draws an arrow (`{ orig: from, dest: to, brush: 'green' }`).
- **Rationale**: Chessground is already the board library, and drawing is on by default. Auto-shapes are separate from user-drawn shapes and from the `lastMove`/`check` highlights, which meets FR-006. They follow the board orientation automatically, which covers the Black-side edge case. No new dependency or CSS overlay is needed.
- **Alternatives considered**: `highlight.custom` squares (a CSS class per square). These are easy to confuse with last-move highlights and can't show direction. A text hint like "Nf6" is ruled out by a spec assumption.

## R3. Where the reveal button lives and who owns the state

- **Decision**: The state (`hintStep: 0 | 1 | 2`) and the action (`advanceHint`) live in `usePuzzle`, next to `showHint`. A small presentational component, `HintReveal`, is rendered directly under the `.hint` paragraph in both `MotifInfo` and `PracticeInfo`.
- **Rationale**: `usePuzzle` already resets `showHint` in `load`, and it owns `ply`, `busy` and the solved state. Those are the triggers for every reset in FR-008 and FR-009. The spec puts the button below the hint text, which is rendered in the info asides, not in the controls bar.
- **Alternatives considered**: Putting the state in each trainer component would duplicate the reset logic in `MotifTrainer` and `PracticeTrainer`. Putting the button in `PatternControls`/`PracticeControls` would place it away from the hint text and go against the spec.

## R4. When to reset the step

- **Decision**: Set `hintStep` back to 0 in `load` (which covers next puzzle and reset), on each correct move by the player (the `ply` advance in `onMove`), and in `reveal` (show solution). Keep it unchanged when a wrong move is reverted. Hide the shapes while `displayFen` is set or the board is busy.
- **Rationale**: This matches the edge cases in the spec. A wrong move puts the same position back, so the same reveal still applies.

## R5. Testing approach

- **Decision**: Unit-test the pure helpers (`nextHintMove`, `hintShapes`) in `src/lib/puzzle.test.ts` with Vitest, which is the existing pattern. Check the UI by hand using the quickstart.
- **Rationale**: The repo has no React component test setup, and adding one isn't justified for this feature.
