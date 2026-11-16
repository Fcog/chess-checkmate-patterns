---

description: "Task list for Full-Width Layout"
---

# Tasks: Full-Width Layout

**Input**: Design documents from `specs/005-full-width-layout/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/layout.md, quickstart.md

**Tests**: None requested. This is a CSS-only change, so it's checked with the existing suites (`npm test`, `npm run test:build`) and the viewport checks in quickstart.md.

**Organization**: All edits are in `src/styles/styles.css`, so tasks within a story run in order (same file). Stories are separate increments.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [X] T001 Run `npm test`, `npm run typecheck` and `npm run test:build` from the repo root and confirm all pass before any change to `src/styles/styles.css`. Take reference screenshots of `/checkmates/anastasia`, `/checkmates/practice` and `/` at 375×812 and 768×1024 in `npm run dev` for the SC-006 comparison later.

---

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T002 In the `:root` block at the top of `src/styles/styles.css`, after `--bad`, add the layout tokens exactly as listed in data-model.md: `--frame-max: 2400px;`, `--frame-pad: clamp(16px, 2vw, 32px);`, `--board-chrome: 190px;` and `--prose-max: 720px;`.

**Checkpoint**: Nothing looks different yet, because the tokens aren't used.

---

## Phase 3: User Story 1 - The trainer uses the whole screen (Priority: P1) 🎯 MVP

**Goal**: The header and trainer shell span the window with a 16–32 px margin. Side columns are bounded.

**Independent Test**: At 1920×1080 on `/checkmates/anastasia`, the side margins are ≤ 40 px and the header's logo and progress sit near the window edges. At 768 px the layout is the same single column as before.

- [X] T003 [US1] In `src/styles/styles.css`, change `.app` (around line 26) from `max-width: 1100px; margin: 0 auto; padding: 24px 20px 48px;` to `max-width: var(--frame-max); margin: 0 auto; padding: 24px var(--frame-pad) 48px;`.
- [X] T004 [US1] In `src/styles/styles.css`, change the `.layout` rule (around line 158) from `grid-template-columns: 230px minmax(0, 1fr) 260px;` to `grid-template-columns: minmax(220px, 280px) minmax(0, 1fr) minmax(240px, 340px);`. Leave the existing `@media (max-width: 860px)` override (`minmax(0, 1fr)`) alone.
- [X] T005 [US1] In `src/styles/styles.css`, change `.site-footer` (around line 843) from `max-width: 1100px; ... padding: 20px 20px 32px;` to `max-width: var(--frame-max); ... padding: 20px var(--frame-pad) 32px;`, so the footer edges match `.app`.

**Checkpoint**: Quickstart rows 1 (margins only) and 4 (content capped at about 2,400 px) pass for lesson and practice pages.

---

## Phase 4: User Story 2 - A bigger board on big screens (Priority: P2)

**Goal**: Above 860 px, the board is `min(column width, 100svh − 190px)`, so it grows while the controls stay visible.

**Independent Test**: At 1920×1080 the board is ≥ 670 px (about 890). At 1920×800 and 1280×720 the board and controls fit without scrolling.

- [X] T006 [US2] In `src/styles/styles.css`, just before the existing `@media (max-width: 860px)` block (around line 864), add:

  ```css
  @media (min-width: 861px) {
    .board, .empty-state { max-width: min(100%, calc(100svh - var(--board-chrome))); }
  }
  ```

  Keep the base `.board { max-width: 480px }` and `.empty-state { max-width: 480px }` so the ≤ 860 px layout doesn't change. Make sure the selectors don't match `.board.mini` or `.board.viewer`; add `.board:not(.mini):not(.viewer)` if they would.
- [X] T007 [US2] In `npm run dev` at 1280×720, measure in dev tools the gap between the bottom of `.controls` and the bottom of the viewport. If the controls overflow, or the gap is over 60 px, adjust only `--board-chrome` in `:root` in `src/styles/styles.css` until the gap is 8–40 px.
- [ ] T008 [US2] Run quickstart rows 2, 3 and 8 (resize from 1920 to 900, drag a piece, Hint → Reveal piece → Reveal move) and confirm that coordinates, highlights and hint shapes stay lined up. Change nothing unless they fail (chessground re-measures through its ResizeObserver, research R3).

**Checkpoint**: SC-002 and SC-003 are met.

---

## Phase 5: User Story 3 - Consistent width on every page (Priority: P3)

**Goal**: Text pages share the frame, prose stays at 720 px, and the home card grid adds columns.

**Independent Test**: At 1920×1080, the header and footer edges on `/`, a blog post and `/privacy` line up with a lesson page. Paragraphs are ≤ 720 px. Home topic cards show more than two columns.

- [X] T009 [US3] In `src/styles/styles.css`, change `.page-text` (around line 618) from `max-width: 1100px; margin: 0 auto; padding: 0 20px 64px;` to `max-width: var(--frame-max); margin: 0 auto; padding: 0 var(--frame-pad) 64px;`.
- [X] T010 [US3] In `src/styles/styles.css`, change `.page-text > * { max-width: 720px; }` (around line 626) to `.page-text > * { max-width: var(--prose-max); }`, and directly after it add `.page-text > .topic-cards { max-width: none; }`.
- [X] T011 [US3] Run quickstart row 5. In `src/pages/[topic]/index.astro` and `src/pages/blog/`, check for any other card or preview grid that is a direct child of `.page-text` and is capped at 720 px. If there is one, add its class to the T010 exemption in `src/styles/styles.css`. Leave `.link-list` capped, because it's reading content.

**Checkpoint**: SC-005 is met, and the header and footer line up on every page.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T012 [P] Run `npm test`, `npm run typecheck` and `npm run test:build` and confirm they all still pass with no change in test counts (`src/styles/styles.css` is the only changed file)
- [X] T013 [P] Run quickstart row 6: compare 375×812 and 768×1024 against the T001 screenshots (SC-006). Any difference means a desktop rule leaked into `src/styles/styles.css` below 861 px.
- [X] T014 Run quickstart rows 4 (3840×2160) and 7 (200% zoom) and confirm there's no horizontal scroll on any page (SC-004). Fix overflow only in `src/styles/styles.css`.

---

## Dependencies & Execution Order

- **Setup (T001)** → **Foundational (T002)** → **US1 (T003–T005)** → **US2 (T006–T008)** → **US3 (T009–T011)** → **Polish (T012–T014)**
- Every implementation task edits `src/styles/styles.css`, so they run in order. Only the checks (T012, T013) can run in parallel.
- US2 and US3 each depend only on T002, but US1 should land first so the board has the wider column to grow into.

### Parallel example

```text
# after all edits:
T012 automated suites   |   T013 mobile and tablet screenshot comparison
```

---

## Implementation Strategy

### MVP (User Story 1)

T001–T005: the full-width frame for the trainer, header and footer. That's already a visible gain, with no change at phone or tablet widths.

### Incremental delivery

1. US2 (T006–T008): a bigger board that fits the window height
2. US3 (T009–T011): text pages and home grid on the same frame
3. Polish (T012–T014): regression and overflow checks
