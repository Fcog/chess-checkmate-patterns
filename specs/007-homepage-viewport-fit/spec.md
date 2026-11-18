# Feature Specification: Homepage Fits the Viewport

**Feature Branch**: `007-homepage-viewport-fit`

**Created**: 2026-11-18

**Status**: Draft

**Input**: User description: "change the chess board size (the homepage layout) in the homepage so that the introduction, the newsletter cta, and the sections menu are viewable in the viewport"

## Clarifications

### Session 2026-11-18

- Q: On laptop/desktop screens, how should the homepage be arranged so that the board, intro, newsletter signup and topic cards all fit in the first screen? → A: Three columns: topic cards on the left as a menu, board in the centre, intro and newsletter on the right (matching the lesson-page layout).
- Q: With three columns, where should the puzzle's info panel (task, move feedback, move list, revealed pattern) go, given the right column also holds the intro and newsletter? → A: Right column, info panel at the top, with the intro and newsletter signup below it.
- Q: On phones, where the columns stack into one, what order should the content follow, and should the topic cards collapse into a toggle? → A: Board → info panel → intro → newsletter → topic cards, with the topic cards shown in full (not collapsed).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See the whole homepage offer at a glance on a laptop or desktop (Priority: P1)

A visitor opens the homepage on a laptop or desktop. In the first screen, without scrolling, they see four things, in three columns (sections menu left, board centre, puzzle info panel then intro and newsletter right):

- the random puzzle board
- the introduction (heading and paragraph)
- the newsletter call to action
- the sections menu, meaning the topic cards (Checkmates, Tactics, Attacks) with their Learn and Practice links

Right now the board fills the screen height and pushes everything else below the fold. The visitor can't tell what the site offers or that a newsletter exists unless they scroll.

**Why this priority**: This is the problem the user raised. If the visitor sees the intro, the newsletter CTA and the sections as soon as the page opens, they understand the site and can sign up or pick a section without scrolling.

**Independent Test**: Open the homepage in a desktop browser window of each listed size. Without scrolling, check that the board, intro, newsletter CTA and all three topic card headings with their Learn/Practice links are fully visible.

**Acceptance Scenarios**:

1. **Given** a 1366×768 browser window, **When** the homepage loads, **Then** the board, the intro heading and paragraph, the newsletter signup form, and the headings plus Learn/Practice links of all three topic cards are fully visible without scrolling.
2. **Given** a 1920×1080 browser window, **When** the homepage loads, **Then** the same elements are fully visible without scrolling, and the board is at least as large as it is at 1366×768.
3. **Given** any of these windows, **When** the visitor plays moves, asks for a hint or loads the next puzzle, **Then** the puzzle works as before and none of these elements are pushed out of the first screen.

---

### User Story 2 - Usable homepage on a phone (Priority: P2)

A visitor opens the homepage on a phone. The board is still big enough to play comfortably. The puzzle info panel comes right after it, then the intro and the newsletter CTA, with the topic cards in full at the end.

**Why this priority**: A phone screen can't fit all four elements at once. The fix must not make the board too small to play on phones, and the page should still lead quickly from the board to the intro and newsletter.

**Independent Test**: Open the homepage at 390×844. Check that the board is at least 280px wide and pieces can be moved by touch. Check that the intro heading is reached within one screen-height of scrolling.

**Acceptance Scenarios**:

1. **Given** a 390×844 viewport, **When** the homepage loads, **Then** the board is at least 280px wide and fully playable by touch.
2. **Given** a 390×844 viewport, **When** the visitor scrolls down by at most one screen height, **Then** the intro heading and the start of the newsletter CTA are visible.

---

### User Story 3 - Other pages are unaffected (Priority: P3)

A visitor working through motif lessons or practice pages still gets the same large board they have today.

**Why this priority**: This is a safeguard, not new value. The smaller board is for the homepage only, where the board shares the first screen with other content.

**Independent Test**: Open a motif page and a practice page at 1440×900 before and after the change, and compare the board size.

**Acceptance Scenarios**:

1. **Given** a motif or practice page, **When** it loads at any viewport size, **Then** the board size is the same as before this change.

---

### Edge Cases

- **Very short windows** (e.g. 1280×600, or a laptop with large browser toolbars): the board stops shrinking at its minimum playable size. Anything that doesn't fit is reached by scrolling, and the board is not squeezed further.
- **Very wide but short windows** (e.g. 2560×900): the board is limited by height, not width. The side columns keep their size, and the centre column stays centred instead of stretching the board.
- **Info panel grows during play** (move list gets long, pattern revealed, solution shown): the panel's growth MUST NOT push the board or the left column. If the right column overflows, the intro and newsletter may move below the fold while the visitor is playing. On first load, before any move, they MUST be visible.
- **Tall sections menu**: if a topic card's motif links don't fit in the left column's height, the column handles it (e.g. the motif lists are truncated or the column scrolls on its own), so the page itself doesn't need to scroll to reach the card headings and Learn/Practice links.
- **Puzzle feedback, hint text or "next" controls change height after a move**: the intro, CTA and sections must not jump in or out of view in a way that disorients the visitor.
- **Newsletter CTA already completed** (the visitor subscribed, so the CTA shows a short confirmation or is hidden): the layout should still look balanced, with no large empty gap.
- **Browser zoom at 125%**: the page should degrade to scrolling and the board stays playable. It doesn't have to fit everything in one screen.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: On the homepage, the puzzle board MUST be sized against the available screen height so it leaves room for the introduction, newsletter CTA and sections menu. It MUST NOT fill the whole screen height on its own.
- **FR-002**: On laptop and desktop screens (from 1366×768 up), the homepage MUST use three columns, matching the lesson-page layout. The left column holds the sections menu: the topic cards, each with its heading and Learn/Practice links. The centre column holds the board and its puzzle controls. The right column holds the puzzle info panel (task, move feedback, move list, revealed pattern) at the top, then the introduction, then the newsletter CTA. All three columns MUST be visible in the first screen.
- **FR-003**: The homepage board MUST NOT become smaller than a minimum playable size of 280px wide. When the screen is too small to fit everything at that size, the remaining content MUST be reachable by scrolling.
- **FR-004**: Board sizes on all other pages (motif lessons, practice pages) MUST stay unchanged.
- **FR-005**: All homepage puzzle interactions (making moves, hints, feedback, loading the next puzzle) MUST work and look the same as before. Only sizes and positions change.
- **FR-006**: The page MUST NOT visibly jump while it loads. The space for the board is reserved from the first paint, so the intro, CTA and sections don't move when the board becomes interactive.
- **FR-007**: On phones, the columns MUST stack into one, in this order: board (with its puzzle controls), puzzle info panel, introduction, newsletter CTA, sections menu. The sections menu MUST be shown in full as the topic cards, not collapsed behind a toggle.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At 1366×768, 1440×900 and 1920×1080, the board, intro, newsletter CTA and all three topic card headings with Learn/Practice links are 100% visible without scrolling.
- **SC-002**: At 390×844, the board is at least 280px wide, and the intro heading is visible after scrolling at most one screen height.
- **SC-003**: On motif and practice pages, the board size differs by 0px from its size before the change at 1366×768, 1440×900 and 1920×1080.
- **SC-004**: No visible layout jump of the intro, CTA or sections while the homepage loads.
- **SC-005**: More visitors use the newsletter CTA and section links from the homepage than before. Compare signups and section clicks per homepage visit over the two weeks before and after the change.

## Assumptions

- "Sections menu" means the homepage topic cards (Checkmates, Tactics, Attacks with their Learn/Practice links). It does not mean the site header navigation, which is already always visible at the top.
- For the sections menu, it is enough that each card's heading and Learn/Practice links are visible in the left column. The longer per-card lists of individual motif links may be shortened or scroll inside the column.
- This builds on the random-exercise homepage board from feature 006 (`homepage-random-exercises` branch).
- The intro text and the newsletter CTA keep their current wording. Only layout and sizing change, though the intro may be shortened slightly if it can't fit otherwise.
- 280px is the smallest board that stays comfortable to play, matching common chess-site minimums on phones.
