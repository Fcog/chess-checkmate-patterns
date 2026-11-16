# Research: Full-Width Layout

These findings come from reading `src/styles/styles.css`, `src/layouts/Page.astro` and `src/pages/index.astro`, and from `node_modules/chessground/dist/events.js`. No `NEEDS CLARIFICATION` items were left.

## Current width constraints (baseline)

| Rule | Value | Effect |
|------|-------|--------|
| `.app` (`styles.css`, around line 26) | `max-width: 1100px` | Caps the header and trainer shell (lessons, practice, and the header on text pages) |
| `.page-text` (around line 618) | `max-width: 1100px` | Caps the text pages' container |
| `.page-text > *` (around line 626) | `max-width: 720px` | Reading line length, which **also caps `.topic-cards`**, so home cards can't grow |
| `.site-footer` (around line 843) | `max-width: 1100px` | Caps the footer |
| `.layout` (around line 158) | `230px minmax(0,1fr) 260px` | Fixed side columns |
| `.board` (around line 317) and `.empty-state` (around line 105) | `max-width: 480px` | Caps the board and its empty placeholder |
| `@media (max-width: 860px)` | single column | Tablet and phone layout (must stay as it is) |

## R1. One shared frame width

- **Decision**: Add the custom properties `--frame-max: 2400px` and `--frame-pad: clamp(20px, 2vw, 32px)` on `:root`. Apply `max-width: var(--frame-max)` and `padding-inline: var(--frame-pad)` to `.app`, `.page-text` and `.site-footer`, replacing the three `1100px` caps and their `20px` side padding.
- **Rationale**: A single source of truth keeps the header, content and footer edges lined up on every page (FR-002). The 2,400 px ceiling stops 4K and ultra-wide screens from stretching panels absurdly (edge case). At 1,920 px the margin is 32 px (2vw = 38 px, clamped to 32), which meets SC-001 (≤ 40 px).
- **Alternatives considered**: `max-width: none` would stretch without limit on 3,440–5,120 px screens. Separate values per container would let them drift apart.

## R2. Board size limited by both width and height

- **Decision**: Above the 860 px breakpoint, `.board` (and `.empty-state`) get `max-width: min(100%, calc(100svh - var(--board-chrome)))`, where `--board-chrome: 190px`. That's the vertical space taken by the app top padding (24), the header (~54), the layout padding-top (24), the main gap (16), the controls row (~34) and a bottom buffer (~38). Below 860 px, keep `max-width: 480px` unchanged.
- **Rationale**: This meets FR-003 and FR-004 with pure CSS and no JS measuring. At 1,920×1,080 the column is about 1,330 px wide, so the board is `min(1330, 890)` = 890 px (≥ 670 px, SC-002). At 1,280×720 the board is about 530 px and the controls stay visible (SC-003). `svh` avoids the mobile URL-bar jump.
- **Alternatives considered**: JS measuring with ResizeObserver adds code for no benefit. `vh` jumps on mobile, although it isn't used below 860 px anyway.

## R3. Chessground at new sizes

- **Finding**: Chessground 9 already re-measures on its own: `events.js` attaches `new ResizeObserver(onResize).observe(wrap)`. The coordinates use `cqw` units (the `.board` container query), and auto-shapes are SVG in board space.
- **Decision**: No JS change is needed (FR-005). Check the drag target accuracy and the hint arrows manually after resizing (quickstart).

## R4. Side columns

- **Decision**: Change `.layout` columns to `minmax(220px, 280px) minmax(0, 1fr) minmax(240px, 340px)`, using `clamp`-like bounds so the side panels can grow a little but are capped (FR-006).
- **Rationale**: The extra width goes mainly to the board column, which is the spec's assumption, while long pattern names and the info text get some breathing room.

## R5. Text pages and grids

- **Decision**: Keep `.page-text > * { max-width: 720px }` for reading text (FR-007). Add `.page-text > .topic-cards { max-width: none; }` so the home card grid (`repeat(auto-fit, minmax(280px, 1fr))`) adds columns as the width grows (FR-008). Check `src/pages/[topic]/index.astro`: its `.link-list` is reading content and stays at 720 px.
- **Rationale**: Exempting only the grids keeps prose readable.

## R6. Validation

- **Decision**: CSS only, so there are no new unit tests. `npm run build` and `npm run test:build` (`tests/build.test.ts`) catch build regressions. The layout criteria (SC-001–SC-006) are checked by hand at the listed viewport sizes using browser dev tools device sizes (quickstart).
