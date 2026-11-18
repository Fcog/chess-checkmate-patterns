# Feature Specification: Random Exercise on the Homepage

**Feature Branch**: `006-random-exercise-homepage`

**Created**: 2026-11-17

**Status**: Draft

**Input**: User description: "Create a more engaging homepage by showing the chess board with a random exercise from all sections, when clicking next it will show a next random exercise."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Solve a random puzzle immediately on landing (Priority: P1)

A visitor arrives on the homepage and immediately sees a playable chess board with an exercise picked at random from all sections (checkmates, tactics, attacks). They can start solving right away, without first choosing a section or navigating to another page.

**Why this priority**: This is the core of the feature. Today the homepage is text and links only; putting a live puzzle in front of the visitor is what makes the page engaging.

**Independent Test**: Open the homepage and check that a board with an exercise is shown and that moves can be played and get feedback.

**Acceptance Scenarios**:

1. **Given** a visitor opens the homepage, **When** the page has loaded, **Then** a board showing one exercise is visible above the existing introduction and topic cards.
2. **Given** the exercise is displayed, **When** the visitor plays a move, **Then** they get the same correct/incorrect feedback as in the Practice sections.
3. **Given** a visitor reloads the homepage several times, **When** each load completes, **Then** the exercise shown usually changes, and over several loads exercises from different sections appear.

---

### User Story 2 - Move on to the next random exercise (Priority: P1)

After solving an exercise, or giving up on it, the visitor clicks **Next** and gets another random exercise from any section, so they can keep training without leaving the homepage.

**Why this priority**: Without Next, the board gives a single puzzle per visit. Next turns the homepage into a continuous mixed-practice session.

**Independent Test**: Click Next repeatedly and check that each click shows a different exercise, drawn from all sections, with no repeats.

**Acceptance Scenarios**:

1. **Given** an exercise is displayed, **When** the visitor clicks Next, **Then** a different exercise replaces it.
2. **Given** the visitor keeps clicking Next, **When** every available exercise has been shown once, **Then** the cycle starts again in a new random order, and no exercise is repeated before then.
3. **Given** the current exercise is unsolved, **When** the visitor clicks Next, **Then** the next exercise is shown (solving is not required to move on).

---

### User Story 3 - See what the pattern was and continue into a section (Priority: P2)

Once the visitor solves an exercise (or chooses to reveal it), they see which section and pattern it belonged to, with links to learn that pattern and to practise that section.

**Why this priority**: This links the homepage puzzle to the site's Learn and Practice content and turns casual interest into deeper engagement. The feature is still useful without it.

**Independent Test**: Solve a homepage exercise and check that the pattern name and section appear, with working links to the pattern's page and the section's practice page.

**Acceptance Scenarios**:

1. **Given** an unsolved exercise, **When** it is displayed, **Then** the pattern name is not shown (as in Practice).
2. **Given** the visitor solves or reveals the exercise, **When** the result is shown, **Then** the pattern name and section are displayed, with links to that pattern's learning page and that section's practice page.

---

### User Story 4 - Get a hint (Priority: P3)

A visitor who is stuck can ask for a hint and gets the same step-by-step hint behaviour as elsewhere on the site.

**Why this priority**: Hints reduce frustration for beginners but are not essential to the core experience.

**Independent Test**: On a homepage exercise, request hints and check that they progress the same way as on Practice pages.

**Acceptance Scenarios**:

1. **Given** an unsolved exercise, **When** the visitor requests a hint, **Then** a hint is shown following the site's existing hint progression.

---

### Edge Cases

- "Is this sacrifice sound?" quiz-style exercises can be picked; they appear and behave exactly as in Practice.
- The side to move is clearly shown for every exercise, since exercises come from different sections and either colour may be to move.
- Visitors without JavaScript, and search engines, still get the existing homepage text, topic cards and links.
- On narrow (mobile) screens the board fits within the viewport without horizontal scrolling.
- Clicking Next rapidly several times never leaves a half-loaded or mixed-up position on the board; the board always ends on one complete exercise.
- If the visitor has already solved an exercise elsewhere on the site, it can still be picked; solved status does not exclude it.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The homepage MUST show an interactive board with one exercise, placed before the existing introduction text and topic cards. That content stays on the page.
- **FR-002**: The exercise MUST be chosen at random from all practice exercises across all sections, each one equally likely.
- **FR-003**: Visitors MUST be able to click a Next control to load a different random exercise.
- **FR-004**: Within a visit, no exercise may repeat until every exercise in the pool has been shown. After that, a new random cycle starts.
- **FR-005**: Move checking, feedback, accepted alternative solutions and solved-state tracking MUST behave the same as in the Practice sections.
- **FR-006**: The exercise's pattern and section MUST stay hidden until the exercise is solved or revealed. They are then shown with links to the pattern's learning page and the section's practice page.
- **FR-007**: Hints MUST be available on homepage exercises, with the same progression as elsewhere on the site.
- **FR-008**: Exercises solved on the homepage MUST count toward the visitor's existing solved progress.
- **FR-009**: The homepage's existing title, description, structured data and crawlable text content MUST be kept.

### Key Entities *(include if feature involves data)*

- **Exercise**: An existing practice position with its solution, any accepted alternatives, optional hint, section and pattern. No new exercises are added.
- **Visit sequence**: The random order of exercises for the current homepage visit. It tracks which exercises have already been shown so none repeats until the pool is used up.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Visitors can play their first move within 2 seconds of landing on the homepage on a typical broadband or 4G connection.
- **SC-002**: After clicking Next, the new exercise appears in under 0.5 seconds.
- **SC-003**: 50 consecutive Next clicks show no duplicate exercises and include exercises from all three sections.
- **SC-004**: At least 30% of homepage visits include at least one move on the board.
- **SC-005**: Click-throughs from the homepage to Learn and Practice pages stay at or above the level measured before this feature.

## Assumptions

- The pool is all existing practice exercises from every section. This feature adds no new content.
- Random selection is uniform. It is not weighted by section, difficulty or the visitor's history.
- Showing unsolved exercises first is out of scope for this version.
- Homepage-specific sharing (a link back to the homepage exercise) is out of scope for this version. The existing "Share puzzle" control may appear and links to the exercise's section practice page, as it does in Practice.
- A "visit" is the current page view: reloading the homepage starts a new random order.
- The homepage has no section or pattern filter. Visitors who want to focus on one section use that section's Practice page.
