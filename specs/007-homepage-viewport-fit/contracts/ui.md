# UI Contract: Homepage Fits the Viewport

## `HomeTrainer` (`src/components/react/HomeTrainer.tsx`), changed

```ts
import type { ReactNode } from 'react';

export type Props = {
  /** Server-rendered intro (h1 + paragraph), from the Astro `about` slot. */
  about?: ReactNode;
  /** Server-rendered topic cards, from the Astro `sections` slot. */
  sections?: ReactNode;
};

export function HomeTrainer(props: Props): JSX.Element;
```

The rendered structure. The DOM order is the phone reading order.

```html
<div class="app">
  <Header progress="N / M solved" />
  <div class="layout home">
    <main>…board + controls (or QuizBoard)…</main>
    <div class="home-side">
      <PracticeInfo … showLinks />         <!-- aside.info -->
      <div class="home-about">{about}</div>
      <NewsletterSignup />                 <!-- section.newsletter -->
    </div>
    <nav class="home-sections" aria-label="Sections">{sections}</nav>
  </div>
</div>
```

- The puzzle behaviour (state, handlers, `PracticeControls`/`QuizBoard`/`PracticeInfo` wiring) does not change (FR-005).
- `.layout.no-menu` is replaced by `.layout.home` on the homepage. Remove the `.layout.no-menu` rules if nothing else uses them.

## `src/pages/index.astro`, changed

```astro
<HomeTrainer client:load>
  <Fragment slot="about">
    <h1>Learn chess patterns you can spot in a real game</h1>
    <p>…shortened intro (≈2 sentences, keeps {exercises.length})…</p>
  </Fragment>
  <ul slot="sections" class="topic-cards">…same cards as today…</ul>
</HomeTrainer>
```

- The trailing `<article class="page-text legal">` and the separate `<NewsletterSignup client:load />` are removed.
- Each topic card keeps its markup, but the Learn/Practice links (`p.topic-actions`) move to directly after the `h2`, before the intro paragraph. Then the 2-line intro clamp never hides the links.
- Because the cards and h1 are no longer inside `.page-text`, the styles they relied on from there (h1 colour and size, `.page-text .topic-cards` grid) are re-scoped to `.home-about` and `.home-sections`.

## CSS contract (`src/styles/styles.css`)

All new rules are scoped to `.layout.home`. No existing selector changes how it renders on other pages (FR-004).

| Selector / media | Rule |
|------------------|------|
| `.layout.home` (≥861px) | `grid-template-columns: minmax(220px,280px) minmax(0,1fr) minmax(240px,340px)` and `grid-template-areas: "sections board side"` |
| `.layout.home > main` / `.home-side` / `.home-sections` | `grid-area: board` / `side` / `sections`; `align-self: start` |
| `.layout.home main > .board` (≥861px) | `max-width: max(280px, min(100%, calc(100svh - var(--board-chrome))))` |
| `.layout.home main > .board` (all widths) | `min-width: min(280px, 100%)` |
| `.home-side` | `display: flex; flex-direction: column; gap: 16px` |
| `.home-about h1` | about 20px, text colour, no top border or padding |
| `.home-sections` (≥861px) | `max-height: calc(100svh - <header height>)`, `overflow-y: auto`; cards in one column with compact padding |
| `.home-sections .topic-cards p:not(.topic-actions)` (≥861px) | clamped to 2 lines |
| `.home-sections .link-list` (≥861px) | `display: none` |
| `.layout.home` (≤860px) | one column, DOM order, cards shown in full (motif lists visible, no clamp) |

## Build-test contract (`tests/build.test.ts`)

These are added to the existing `built site` suite, using `dist/index.html`:

1. The homepage HTML contains `class="layout home"`, `class="home-side"` and `class="home-sections"`.
2. Order: the index of `<main` < `class="info"` < `<h1>` < `class="newsletter"` < `class="home-sections"`.
3. Every topic's `topic.path` and `practicePath(topic.id)` link appears inside the `home-sections` part of the HTML.
4. The existing title, description, canonical URL and h1 checks still pass for `/`.
