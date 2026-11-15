# Feature Specification: Progressive Hint Reveal (Piece, then Move)

**Feature Branch**: `new-hint-feature`

**Created**: 2026-11-15

**Status**: Draft

**Input**: User description: "when the user presses hint, a text help appear. Create below this text (when the text appears) a button that when press reveals the piece to be moved (reveal piece), with another press, the button reveals the movement."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reveal which piece to move (Priority: P1)

A learner is stuck on a checkmate puzzle. They press **Hint** and read the text hint, but still can't find the idea. Right under the hint text they see a **Reveal piece** button. Pressing it highlights the piece they should move next on the board, without telling them where it goes.

**Why this priority**: This is the core of the request and the smallest useful step. It gives a stuck learner a nudge between the text hint and the full solution, so they can still find the move themselves.

**Independent Test**: Open any puzzle that has a text hint, press Hint, then press Reveal piece. The piece that makes the next correct move is clearly marked on the board, and no target square is shown.

**Acceptance Scenarios**:

1. **Given** a puzzle whose hint text is not shown yet, **When** the learner looks at the puzzle, **Then** no Reveal piece button is visible.
2. **Given** the learner has pressed Hint and the hint text is visible, **When** they look below the hint text, **Then** a button labelled "Reveal piece" is visible.
3. **Given** the Reveal piece button is visible, **When** the learner presses it, **Then** the square of the piece that makes the next correct move is highlighted on the board, and the button label changes to "Reveal move".
4. **Given** the piece is highlighted, **When** the learner makes the correct move with that piece, **Then** the puzzle continues exactly as it does today.

---

### User Story 2 - Reveal the full move (Priority: P2)

After seeing which piece to move, the learner still can't find the right square. They press the same button again (now labelled **Reveal move**), and the board shows both the starting and destination squares of the next correct move.

**Why this priority**: This is the second step of the progressive reveal. It's only useful once Story 1 exists, but it saves the learner from jumping straight to the full solution.

**Independent Test**: After revealing the piece, press the button again. The board marks both the from-square and the to-square of the next correct move, and the learner can then play it.

**Acceptance Scenarios**:

1. **Given** the piece has been revealed, **When** the learner presses "Reveal move", **Then** the board shows the from-square and the to-square of the next correct move (for example, an arrow or two highlighted squares).
2. **Given** the full move is revealed, **When** the learner looks at the button, **Then** it is disabled or hidden, because nothing more can be revealed for this move.
3. **Given** the full move is revealed, **When** the learner plays that move, **Then** the reveal marks disappear and the puzzle continues as normal.

---

### User Story 3 - Reveal steps reset for each move in multi-move puzzles (Priority: P3)

In a longer puzzle (for example a mate in 3), the learner uses the reveal on their first move, plays it, and the opponent replies. For their next move, the reveal starts over at "Reveal piece" and points to the next correct move.

**Why this priority**: Many exercises are multi-move combinations. Without a reset, the reveal would point at a move that has already been played, or would be used up after the first move.

**Independent Test**: In a puzzle of two or more moves, use the reveal, play the move, wait for the opponent's reply, and check that the button is back to "Reveal piece" and points to the new correct move.

**Acceptance Scenarios**:

1. **Given** a multi-move puzzle where the learner used the reveal on move 1, **When** they play move 1 and the opponent replies, **Then** the board marks are cleared and the button shows "Reveal piece" again (as long as the hint text is still visible).
2. **Given** the button has reset, **When** the learner presses "Reveal piece", **Then** the highlighted piece is the one for the current move, not the previous one.

---

### Edge Cases

- **Puzzle already solved**: Once the puzzle is solved or the solution is shown, the reveal button is hidden and any reveal marks are cleared.
- **Wrong move after a reveal**: If the learner plays a wrong move after revealing, the puzzle handles the mistake as it does today. When the position is back to the learner's turn, the current reveal step and its marks are still shown, so the learner doesn't have to start over.
- **Moving to the next puzzle or retrying**: Starting a new puzzle, or restarting the current one, resets the reveal to its first step with no marks on the board. The hint text also goes back to hidden, as it does today.
- **Opponent's turn / animation in progress**: While the opponent's reply is being played, or the board is locked, the reveal button cannot be pressed.
- **Puzzle with no text hint**: If an exercise has no hint text, there is no Hint button today, so the reveal button isn't offered either.
- **Quiz modes where hints are disabled**: Where the hint text is suppressed today, the reveal button is also not shown.
- **Several pieces of the same type could make the move**: The highlight marks the one piece that actually makes the correct move, not every piece of that type.
- **Board flipped (playing Black)**: The highlights line up with the correct squares however the board is oriented.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST show a reveal button directly below the hint text whenever the hint text is visible and the puzzle is not finished.
- **FR-002**: The system MUST NOT show the reveal button while the hint text is hidden.
- **FR-003**: The reveal button MUST have three states for the current move: (1) "Reveal piece", (2) "Reveal move", (3) fully revealed (disabled or hidden).
- **FR-004**: Pressing the button in state 1 MUST visually mark, on the board, the starting square of the next correct move for the learner, and move the button to state 2.
- **FR-005**: Pressing the button in state 2 MUST visually mark both the starting square and the destination square of the next correct move, and move the button to state 3.
- **FR-006**: The piece mark (state 1) MUST be clearly different from any existing last-move, selection or check highlight, so the learner can tell it's a hint.
- **FR-007**: The revealed move MUST always be the next correct move in the puzzle's solution for the current position, including in multi-move puzzles.
- **FR-008**: When the learner's turn moves on to a new move in the solution, the system MUST clear the reveal marks and reset the button to state 1.
- **FR-009**: When the puzzle is solved, the solution is shown, the learner moves to another puzzle, or the puzzle is restarted, the system MUST clear all reveal marks and reset the reveal state.
- **FR-010**: The reveal button MUST NOT respond while the board is locked (for example, during the opponent's reply).
- **FR-011**: The reveal feature MUST be available everywhere the text hint is available today: the pattern lessons and the practice exercises.
- **FR-012**: The reveal feature MUST NOT change how puzzles are checked or how solved status is recorded. A puzzle solved after using the reveal is recorded the same way as one solved after reading the text hint.
- **FR-013**: The button label MUST say clearly what the next press will show ("Reveal piece", then "Reveal move").

### Key Entities

- **Reveal state (per current move)**: How much of the next correct move has been shown: nothing, the piece, or the full move. It resets whenever the learner's current move changes or the puzzle resets.
- **Next correct move**: The move the learner is expected to play next in the puzzle's solution. It's described by its starting square (the piece to move) and its destination square.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In 100% of puzzles that have a text hint, the reveal button appears within one interaction (the Hint press) and sits visually below the hint text.
- **SC-002**: In every puzzle tested, including multi-move puzzles and puzzles played as Black, the highlighted piece and squares match the next move of the puzzle's solution.
- **SC-003**: A learner can go from "stuck" to seeing the full next move in at most three presses (Hint → Reveal piece → Reveal move).
- **SC-004**: After a revealed move is played, no stale reveal marks stay on the board in 100% of tested transitions (next move, solved, next puzzle, retry).
- **SC-005**: In informal testing, learners can find the correct destination square on their own after only the piece is revealed more often than they could with the text hint alone. Those cases show the piece step adds value as a separate step.

## Assumptions

- "The piece to be moved" means the piece that makes the learner's **next** move in the solution, not the final mating move.
- The reveal is shown on the board as highlights (and optionally an arrow for the full move), not as text such as "Nf6".
- One button cycles through the steps, as described in the request ("with another press, the button reveals the movement"), rather than two separate buttons.
- Using the reveal is not penalised and doesn't change solved status, matching how the text hint works today. Tracking hint usage is out of scope.
- The existing "show solution" control (if present) stays as it is. The reveal is a finer-grained step before it.
- The reveal state isn't kept after a page reload. It only lasts for the current attempt.
- The feature applies wherever the existing Hint button and hint text appear today, and nowhere else.
