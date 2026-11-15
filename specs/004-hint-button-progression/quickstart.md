# Quickstart: Validate Hint Button Progression

## Automated checks

```bash
npm test          # includes hintButtonState cases in src/lib/puzzle.test.ts
npm run typecheck
```

Expected: everything passes, and the 003 tests for `nextHintMove`/`hintShapes` are unchanged.

## Manual scenarios (`npm run dev`)

1. **Three presses, one spot (US1, SC-001)**: In a pattern lesson, hover over Hint and press three times without moving the mouse. Expected: the text hint appears, then the piece is circled, then the arrow shows the move. The label reads Hint → Reveal piece → Reveal move → Move revealed (faded).
2. **No layout shift (US2, SC-002)**: Repeat at desktop width and in a narrow window (under 500 px column). Short labels read Hint → Piece → Move → Shown. Watch Reset, Show solution and Next: none of them move.
3. **Nothing under the hint (SC-003)**: With the hint text shown, there is no button beneath it in either the lesson or practice side panel.
4. **Per-move reset (US3)**: In Practice, open `anastasia-7`. Press to Reveal move, play it, and after the reply the button reads "Reveal piece" with no marks. Reset puts it back to "Hint" and hides the text hint.
5. **Keyboard (FR-009)**: Tab to Hint and press Enter four times. Focus stays on the button, including after "Move revealed", and a screen reader (VoiceOver) announces each label.
6. **Locked/finished**: The button is disabled during the opponent's reply and after the puzzle is solved or Show solution is pressed.
7. **003 regressions (SC-004)**: Black-to-move puzzle (`two-knights-3`): the marks land on the right squares. Quiz exercise: no hint button.
