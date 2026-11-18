# Research: Homepage Fits the Viewport

## Starting point (branch `homepage-random-exercises`)

- `src/pages/index.astro` renders `<HomeTrainer client:load />`. That island renders `.app > Header + .layout.no-menu > main + PracticeInfo`. After it comes `article.page-text.legal`, which holds the h1, the intro, `<NewsletterSignup client:load />` and `ul.topic-cards`.
- Board sizing (`src/styles/styles.css`):
  - `.board { max-width: 480px }` everywhere.
  - At `min-width: 861px`: `main > .board { max-width: min(100%, calc(100svh - var(--board-chrome))) }`, with `--board-chrome: 190px`.
  - At 1366×768 that gives a ~578px board plus its controls, which fill the window. All the other content falls below the fold.
- The lesson pages use `.layout` with three columns, `minmax(220px,280px) | minmax(0,1fr) | minmax(240px,340px)`, and collapse to one column at `max-width: 860px`.

## Decision 1: How the intro and topic cards get into the island's grid

- **Decision**: `HomeTrainer` owns the grid and takes two named slots from Astro:
  - `about`: the h1 and intro paragraph
  - `sections`: the topic cards list

  Astro passes named slots to React islands as camelCase props that hold server-rendered HTML. `HomeTrainer` imports and renders `NewsletterSignup` directly as a React child.
- **Rationale**:
  - The info panel, which is in the island, and the intro, which is in Astro, have to share one right-hand column. One component has to own that column.
  - Slots keep the prose and links in the static HTML for SEO, and the build tests keep checking the h1.
  - Rendering `NewsletterSignup` inside the island avoids nesting a hydrated island inside a slot. It also adds almost no JS, because both are already on the page.
- **Alternatives considered**:
  - *Grid in Astro, with HomeTrainer returning main and info as grid items (via `astro-island { display: contents }`)*: the right column would still need a wrapper around the info panel and the intro, and that wrapper can't cross the island boundary. Rejected.
  - *Move all homepage content into React (pass `topics`/`motifs` data as props)*: it works, but the prose moves out of the `.astro` page and the island's hydration payload grows. Rejected.

## Decision 2: DOM order vs visual order

- **Decision**: The DOM order is `main` (board and controls), then `.home-side` (info panel, about, newsletter), then `nav.home-sections` (topic cards). On ≥861px, `grid-template-areas: "sections board side"` moves the sections into the left column. On ≤860px the default single column shows the DOM order.
- **Rationale**: This gives the phone order chosen in Clarification 3 with no duplicated markup. Screen readers read the puzzle first, which matches what the page is for.
- **Trade-off**: On desktop, keyboard Tab order (board, side, sections) differs from the left-to-right visual order. This is acceptable, because the board is the primary action. Lesson pages have their menu first, which is the reverse; this is documented in the contract.
- **Alternatives considered**: putting the sections first in the DOM, then using `order` on mobile. Rejected: it needs the same amount of CSS and gives screen readers a worse order.

## Decision 3: Board size

- **Decision**:
  - Keep the existing desktop rule `min(100%, 100svh - var(--board-chrome))`.
  - On the homepage only, add a lower bound so the board is never under 280px: `max-width: max(280px, min(100%, calc(100svh - var(--board-chrome))))`, with `min-width: min(280px, 100%)`.
  - Lesson and practice pages are untouched.
- **Rationale**:
  - In three columns the board's height no longer pushes content down, because the other content sits beside it, not below it. So the board doesn't need to shrink below the lesson-page size.
  - At 1366×768 the centre column is about 646px wide (1366 − 2×27 padding − 280 − 340 − 2×24 gaps). The board is limited by height to about 578px, the same as lesson pages.
  - The 280px floor covers short windows (height under ~470px), where the page should scroll rather than squash the board (FR-003).
- **Alternatives considered**: a smaller homepage-only `--board-chrome`, such as 260px. It isn't needed with three columns and would make the board smaller for no benefit. Keep it as a fallback if manual checks show the controls overflowing.

## Decision 4: Fitting the side columns in the window height

The height budget at 1366×768 is about 768 − ~80px (header and padding) ≈ **690px** per column.

- **Left (sections)**:
  - On ≥861px, each card shows its heading with the count badge, the topic intro clamped to 2 lines (`-webkit-line-clamp: 2`), and the Learn/Practice links. The motif link list is hidden with `display: none`. The links stay in the HTML, and the topic pages carry the full lists.
  - The cards stack in one column with smaller padding: about 140px each, so about 450px for three.
  - The column gets `max-height: calc(100svh - <header>)` with `overflow-y: auto` as a safety net, like `.patterns` on lesson pages.
  - On phones the cards are shown in full, as today (FR-007).
- **Right (side)**:
  - Info panel before any move: about 130–170px (h2, feedback line, share button).
  - About: the h1 drops to about 20px with no top border or padding, and the intro paragraph is shortened to about 2 sentences (≈45 words, about 6 lines at 340px), so about 170px.
  - Newsletter: about 190px.
  - Gaps add about 32px, for a total of about 560px, which is under 690. The intro wording change is allowed by the spec's Assumptions.
- **Rationale**: These are the smallest changes that bring every required element above the fold at 1366×768. Larger screens have even more room.
- **Alternatives considered**:
  - Collapse the cards to a `<details>` per topic: more interaction, and it hides the Learn/Practice links. Rejected.
  - Drop the topic intros on desktop: the cards would read poorly. The 2-line clamp keeps context.

## Decision 5: Info panel growth during play

- **Decision**: The board area and the left column are separate grid items set to `align-self: start`. So growth in the right column (move list, pattern preview, solution) can't move the board or the sections. The right column grows downward and the page scrolls. This matches the edge case in the spec.

## Decision 6: Verification approach

- **Decision**:
  - Build tests (`tests/build.test.ts`) check structure: the grid class, the slots rendered inside the island HTML, and the DOM order main → info → h1 → newsletter → sections.
  - Viewport fit (SC-001 to SC-003) is checked by hand in browser devtools at the listed sizes, using quickstart.md.
- **Rationale**: There is no browser test runner in the repo, and adding Playwright for one layout check is out of proportion. The manual matrix is short and specific.
