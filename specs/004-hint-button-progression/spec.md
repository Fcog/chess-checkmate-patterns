# Feature Specification: Hint Button Progression (Hint → Reveal piece → Reveal move)

**Feature Branch**: `new-hint-feature`

**Created**: 2026-11-15

**Status**: Draft

**Input**: User description: "the reveal button appears too far away from the hint button, so the user has to move the mouse to get there. To improve UX, the same hint button will transition to the reveal piece and reveal move buttons instead of appearing below the hint text"

**Revises**: [003-hint-reveal-move](../003-hint-reveal-move/spec.md). The steps and board marks stay the same. Only the button's location changes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - One button walks through every hint step (Priority: P1)

A stuck learner presses **Hint** in the puzzle controls, and the text hint appears. The button they just pressed now reads **Reveal piece**. Without moving the pointer, they press again: the piece to move is marked on the board and the button reads **Reveal move**. A third press marks the full move.

**Why this priority**: This is the whole request. With the separate button under the hint text, the learner has to move from the controls bar to the side panel between steps. Keeping all steps on one button in one place removes that.

**Independent Test**: Open any puzzle with a text hint and press the Hint button three times in a row without moving the pointer. The first press shows the text hint, the second marks the piece, and the third marks the move.

**Acceptance Scenarios**:

1. **Given** a puzzle with a text hint that hasn't been shown yet, **When** the learner looks at the controls, **Then** the hint button reads "Hint" and can be pressed.
2. **Given** the learner presses "Hint", **When** the text hint appears, **Then** the same button, in the same place, now reads "Reveal piece".
3. **Given** the button reads "Reveal piece", **When** the learner presses it, **Then** the piece for the next correct move is marked on the board and the button reads "Reveal move".
4. **Given** the button reads "Reveal move", **When** the learner presses it, **Then** the full next move is marked on the board, and the button shows that everything is revealed and can't be pressed.
5. **Given** the text hint is visible, **When** the learner looks under it, **Then** there is no separate reveal button any more.

---

### User Story 2 - The button keeps its place and size (Priority: P2)

As the label changes from "Hint" to "Reveal piece" to "Reveal move", the button stays where it is, and the buttons around it (Reset, Show solution, Next) don't move. So the second and third presses land on the same spot as the first.

**Why this priority**: If the layout shifts as the label changes, the pointer could end up on a neighbouring button. That brings back the problem this feature fixes, or worse, presses the wrong control.

**Independent Test**: On desktop and mobile widths, press through all hint steps and check that no control in the row moves and the pointer stays over the hint button.

**Acceptance Scenarios**:

1. **Given** the controls row on a desktop-width screen, **When** the label changes through every step, **Then** none of the buttons in the row change position.
2. **Given** a narrow (mobile) screen where the controls use short labels, **When** the label changes through every step, **Then** the label still fits on the button and the row doesn't wrap differently.

---

### User Story 3 - Steps reset for each move (Priority: P3)

In a multi-move puzzle, after the learner plays a correct move and the opponent replies, the button goes back to "Reveal piece" for the new move, because the text hint is already showing. It doesn't go back to "Hint".

**Why this priority**: This keeps the per-move behaviour from 003 now that the steps live on the hint button.

**Independent Test**: In a mate in 2 or more, go through to "Reveal move", play the move, and after the reply check that the button reads "Reveal piece" and the board marks are gone.

**Acceptance Scenarios**:

1. **Given** the learner revealed the piece or the move and then played the correct move, **When** the opponent's reply is done, **Then** the button reads "Reveal piece" and no reveal marks are on the board.
2. **Given** a new puzzle is loaded or the puzzle is reset, **When** the learner looks at the controls, **Then** the button reads "Hint" again and the text hint is hidden.

---

### Edge Cases

- **Puzzle solved or solution shown**: The button is disabled, matching how Hint behaves today once the puzzle is finished, and any reveal marks are cleared.
- **Opponent replying or a wrong move being shown**: The button can't be pressed while the board is locked. Its label stays on the current step.
- **Wrong move after a reveal**: When the position is put back, the current step and its board marks are still there (same as 003).
- **No more moves to reveal**: Once the move is revealed, the button shows a final, disabled state ("Move revealed") until the next move or puzzle.
- **Exercise without a text hint**: Today there's no Hint button for these. That doesn't change, so there's no reveal either.
- **Quiz exercises**: No hint button is shown today, and that stays the same.
- **Keyboard users**: Focus stays on the button after each press, so pressing Enter or Space repeatedly walks through the steps, and screen readers announce the new label.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The existing hint button in the puzzle controls MUST cycle through four states in order: "Hint", then "Reveal piece", then "Reveal move", then a final disabled state ("Move revealed").
- **FR-002**: Pressing "Hint" MUST show the text hint, exactly as it does today, and change the button to "Reveal piece".
- **FR-003**: Pressing "Reveal piece" and "Reveal move" MUST mark the board exactly as specified in 003 (the piece, then the full move).
- **FR-004**: The separate reveal button under the hint text MUST be removed.
- **FR-005**: The hint button MUST stay in the same position, and the other controls MUST NOT move, as its label changes. This applies at desktop and mobile widths.
- **FR-006**: After each correct move in a multi-move puzzle, the button MUST go back to "Reveal piece" (not "Hint") while the text hint stays visible.
- **FR-007**: Loading another puzzle or resetting the current one MUST put the button back to "Hint" and hide the text hint.
- **FR-008**: The button MUST be disabled while the board is locked and once the puzzle is solved or its solution is shown.
- **FR-009**: Keyboard focus MUST stay on the button after each press, and the label change MUST be announced to assistive technology.
- **FR-010**: The change MUST apply wherever the hint button exists today: pattern lessons and practice exercises.

### Key Entities

- **Hint progress (per current move)**: Where the learner is in the sequence: hint text not shown; text shown; piece revealed; move revealed. The text step lasts for the whole puzzle. The piece and move steps reset with each new move.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A learner can go from no help to the full next move with three presses on the same spot, with no pointer movement between presses.
- **SC-002**: In 100% of tested layouts (desktop and mobile widths, both trainers), no control in the controls row moves when the hint button's label changes.
- **SC-003**: Under the hint text, no reveal control is left in any puzzle.
- **SC-004**: Everything that worked in 003 still works: correct piece and move marks, reset per move, clearing on solve, reset or next, and no reveal in quiz mode.

## Assumptions

- The button keeps the existing controls-bar style and isn't restyled beyond what's needed for a stable width.
- On narrow screens, short labels may be used (for example "Piece" and "Move"), in line with how other controls already shorten their labels.
- The final "Move revealed" state is kept, disabled, rather than turning back into "Hint", so the button doesn't seem to start over.
- The text hint, once shown, stays visible until the puzzle is reset or changed, as it does today.
- How the board marks look (circle, then arrow) doesn't change from 003.
