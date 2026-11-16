# Feature Specification: Full-Width Layout

**Feature Branch**: `new-hint-feature`

**Created**: 2026-11-16

**Status**: Draft

**Input**: User description: "improve the UX by making the content full width"

## Context

Today every page sits in a centred column at most about 1,100 px wide, and the chessboard is capped at about 480 px. On a typical laptop or desktop monitor (1,440–2,560 px wide), most of the screen is empty margin, the board stays small, and the pattern list and info panel feel cramped next to it.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The trainer uses the whole screen (Priority: P1)

A learner opens a pattern lesson or a practice exercise on a wide screen. The header, the pattern/filter list, the board and the info panel spread across the full width of the window, with only a small outer margin, instead of sitting in a narrow centred column.

**Why this priority**: The trainer pages are where learners spend their time, and they lose the most from the empty margins.

**Independent Test**: Open any lesson or practice page in a 1,920 px wide window. The header, side list and info panel reach close to the window edges, and there are no wide empty side margins.

**Acceptance Scenarios**:

1. **Given** a window 1,440 px wide or more, **When** a lesson or practice page loads, **Then** the content area spans the window width apart from a small, consistent outer margin.
2. **Given** a wide window, **When** the learner looks at the header, **Then** the logo sits near the left edge and the progress and navigation sit near the right edge, lined up with the content below.
3. **Given** the window is resized from wide to narrow, **When** it crosses into tablet and phone widths, **Then** the layout falls back to today's stacked single-column layout with no horizontal scrolling.

---

### User Story 2 - A bigger board on big screens (Priority: P2)

On a wide screen, the board grows to use the extra room, so pieces are larger and easier to see and drag. The board never gets so tall that the move controls under it are pushed off screen.

**Why this priority**: Most of the benefit of the extra width comes from a bigger board, but this depends on the full-width layout from Story 1.

**Independent Test**: In a 1,920×1,080 window, the board is clearly larger than today's ~480 px, and the controls row under it is fully visible without scrolling.

**Acceptance Scenarios**:

1. **Given** a wide window with enough height, **When** a puzzle loads, **Then** the board is larger than today's maximum and fills the centre column.
2. **Given** a wide but short window (for example 1,920×800), **When** a puzzle loads, **Then** the board shrinks so that the board and the controls row under it both fit in the visible height.
3. **Given** any window size, **When** the board resizes, **Then** it stays square, the coordinates scale with it, and dragging pieces works at the new size.

---

### User Story 3 - Consistent width on every page (Priority: P3)

The homepage, topic overview pages, blog, newsletter and legal pages use the same full-width header and footer as the trainer. Long reading text keeps a comfortable line length so it stays easy to read.

**Why this priority**: This makes the site feel consistent as you move between pages. It matters less than the trainer itself.

**Independent Test**: Go from a lesson to the homepage, a blog post and the privacy page in a wide window. The header and footer edges stay in the same place on every page, and paragraphs of text are no wider than today.

**Acceptance Scenarios**:

1. **Given** a wide window, **When** the learner moves between any two pages, **Then** the header and footer keep the same left and right edges.
2. **Given** a text page (blog post, privacy, terms), **When** it's shown in a wide window, **Then** paragraph line length is no longer than it is today.
3. **Given** a page with a grid of cards or previews (homepage, topic overview), **When** it's shown in a wide window, **Then** the grid uses the extra width, for example by showing more columns, instead of leaving empty margins.

---

### Edge Cases

- **Ultra-wide screens (3,440 px and wider)**: Content shouldn't stretch into lines or panels so wide they're hard to scan. Side panels keep a sensible maximum width, and the board is limited by the window height.
- **Phones and tablets (under ~860 px)**: Behaviour stays as it is today: single column, menu toggle, and controls on one line with short labels.
- **Board inside lesson text (mini boards, line viewers)**: Small boards embedded in text pages keep their current sizes.
- **Browser zoom (up to 200%)**: The layout reflows without horizontal scrolling or overlapping elements.
- **Hint marks and highlights**: Circles, arrows, last-move and check highlights stay lined up with the squares when the board is a different size.
- **Shared puzzle preview images and newsletter emails**: These aren't affected, because they're generated separately from the page layout.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: On windows wider than the current content cap, the trainer pages (lessons and practice) MUST span the window width, apart from a consistent outer margin.
- **FR-002**: The site header and footer MUST span the same width as the page content on every page.
- **FR-003**: The board MUST grow beyond its current maximum size when the centre column and the window height allow it.
- **FR-004**: The board and the controls row directly under it MUST fit in the visible window height together on screens at least 700 px tall, without page scrolling.
- **FR-005**: The board MUST stay square, and its coordinates, highlights, hint shapes and drag-and-drop MUST keep working at every size.
- **FR-006**: The side list and the info panel MAY grow with the window but MUST NOT grow beyond a readable maximum width.
- **FR-007**: Reading text (paragraphs, lists and tables on text pages) MUST keep its current maximum line length.
- **FR-008**: Card and preview grids on overview pages MUST use the extra width (more items per row) rather than leaving side margins.
- **FR-009**: Below the existing tablet breakpoint, the layout MUST look and behave as it does today.
- **FR-010**: No page MAY scroll horizontally at any window width from 320 px up to 3,840 px, or at browser zoom up to 200%.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a 1,920 px wide window, the empty margin on each side of the trainer content is 40 px or less (today it's about 410 px).
- **SC-002**: In a 1,920×1,080 window, the board's side length is at least 40% larger than today's maximum (at least ~670 px instead of ~480 px).
- **SC-003**: In every tested window from 1,280×720 to 3,840×2,160, the board and its controls row are both fully visible without scrolling.
- **SC-004**: There is no horizontal scrolling on any page across the tested range (320 px to 3,840 px wide, and 200% zoom).
- **SC-005**: Paragraph line length on text pages doesn't increase compared with today.
- **SC-006**: Layout at phone and tablet widths (375 px, 768 px) is visually unchanged from today.

## Assumptions

- "Content full width" applies to the whole site's frame (header, footer, trainer, overview grids). Long-form reading text stays at its current readable width, because full-width paragraphs would make the experience worse.
- The extra space mainly goes to the board, limited by the window height, while the side panels stay roughly their current width or grow a little.
- A small outer margin (about 20–32 px) is kept so content doesn't touch the window edges.
- The existing tablet/phone breakpoint (~860 px) and its single-column layout stay as they are.
- Embedded mini boards, line viewers, generated share images and the newsletter email aren't changed.
- No new settings or user preference (for example a "compact" toggle) is added.
