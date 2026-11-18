# Research: Random Exercise on the Homepage

The Technical Context had no NEEDS CLARIFICATION items. These are the design decisions made while reading the existing code.

## 1. Reuse `PracticeTrainer` or build a new island?

- **Decision**: Build a new, small `HomeTrainer` that composes the same building blocks: `usePuzzle`, `useSolved`, `Board`, `QuizBoard`, `PracticeControls` and `PracticeInfo`.
- **Rationale**: `PracticeTrainer` is tied to one topic. It filters by `topic`, owns the filter menu, and its Header shows Learn/Practice tabs for that topic. Adding an "all topics, no filters, reshuffle on wrap" mode would add several conditionals to a component that already has a lot of state. The new island is about 100 lines of wiring, and all the behaviour (move checking, feedback, hints, quizzes, solved tracking) comes from the shared parts, so FR-005, FR-007 and FR-008 hold by construction.
- **Alternatives considered**:
  - Making `PracticeTrainer`'s `topic` optional. Rejected: more branching, and a risk of regressions on the Practice pages.
  - Extracting a shared "trainer core" hook. Rejected for now: it isn't needed with only two callers, so it can be revisited if a third appears.

## 2. How is randomness ordered (FR-002, FR-004)?

- **Decision**: Use a shuffled queue of the whole pool (Fisher–Yates, the existing `shuffle`). When the queue runs out, reshuffle, and never let the new first item be the one just shown.
- **Rationale**: Each exercise is equally likely to come first, nothing repeats within a cycle, and the reshuffle rule stops the same position appearing twice in a row at the cycle boundary (US2 scenario 1). With the current pool, SC-003 (no duplicates in 50 Next clicks) is guaranteed, not just probable.
- **Alternatives considered**:
  - Picking independently at random each time. Rejected: it allows repeats.
  - Weighting by section. Rejected: the spec assumes uniform selection.

## 3. Server rendering and hydration

- **Decision**: The server renders the pool in its original order, so the first exercise appears in the HTML. A `useEffect` shuffles after mount and loads the new first exercise, following the pattern in `PracticeTrainer`.
- **Rationale**: This avoids React hydration mismatches. `Math.random` can't run on the server, and running it there would also make the HTML differ between builds. The visible swap happens before a visitor could play a move. The pattern name is hidden by default, so the server HTML never reveals it (FR-006).
- **Alternatives considered**: `client:only="react"`. Rejected: until JS runs there would be no board at all, which causes layout shift, and it would be inconsistent with the other pages.

## 4. Sharing

- **Decision**: Keep the existing **Share puzzle** button that `PracticeInfo` already renders. It links to the exercise's section share page (`/<topic>/practice/<code>`).
- **Rationale**: It comes for free and points to an existing, working page. The spec only says homepage-specific sharing is out of scope, and this adds none: no new URL and no share-the-homepage link. The Assumptions bullet in spec.md has been reworded to say this.
- **Alternatives considered**: Adding a prop to hide sharing on the homepage. Rejected: it adds code to remove a useful affordance.

## 5. Links after solving (FR-006, US3)

- **Decision**: Add an optional `showLinks` prop to `PracticeInfo`. When it is set and the pattern is revealed or solved, the panel shows "Learn <pattern>" (`motifPath`) and "Practise <section>" (`practicePath`), styled with the existing `.modes .mode` classes.
- **Rationale**: This needs the least change. The Practice pages don't pass the prop, so they are unchanged.

## 6. Layout without a menu column

- **Decision**: Add a `.layout.no-menu` modifier with two columns (board and info). Inside the existing 860px breakpoint it falls back to one column.
- **Rationale**: `.layout` hard-codes three columns, with a menu column first. The modifier is local and doesn't affect other pages.

## 7. Previous button

- **Decision**: Keep **Previous** (from `PracticeControls`), disabled on the first exercise of the current cycle.
- **Rationale**: The spec doesn't ask for it, but going back through the queue is cheap, matches Practice, and doesn't conflict with the no-repeat rule, because revisiting is something the visitor chooses.
