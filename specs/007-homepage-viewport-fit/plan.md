# Implementation Plan: Homepage Fits the Viewport

**Branch**: `007-homepage-viewport-fit` (built on `homepage-random-exercises`) | **Date**: 2026-11-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-homepage-viewport-fit/spec.md`

## Summary

Lay out the homepage in three columns, like the lesson pages:

- **Left:** the topic cards ("sections menu").
- **Centre:** the random-exercise board and its controls.
- **Right:** the puzzle info panel, then the intro, then the newsletter CTA.

Today the board fills the window height and the intro, CTA and cards sit below it in a separate `article`.

`HomeTrainer` will own the grid. The Astro page passes the intro and the topic cards in as named slots, as static server-rendered HTML. `HomeTrainer` renders `NewsletterSignup` itself, so no island is nested inside another.

The DOM order is board → side column → sections. That is the phone order (FR-007). On desktop, `grid-template-areas` moves the sections into the left column.

The board keeps the existing desktop height rule. It gets a 280px minimum on the homepage only. The side columns are compacted to fit within the window height:

- Topic cards on desktop show their heading, Learn/Practice links and a 2-line intro, without the motif lists.
- The intro heading and text are smaller.

## Technical Context

**Language/Version**: TypeScript 5 (strict), Astro 7, React 18

**Primary Dependencies**: Astro (`@astrojs/react`), chessground, chess.js. No new dependencies.

**Storage**: N/A. Layout only; the existing solved/newsletter localStorage is untouched.

**Testing**: Vitest. `npm test` runs unit tests; `npm run test:build` builds and checks the static HTML in `tests/build.test.ts`. There is no browser test runner, so viewport fit is checked manually (see quickstart.md).

**Target Platform**: Static site in modern evergreen browsers, desktop and mobile.

**Project Type**: Static web app (Astro pages with React islands).

**Performance Goals**: No new JS beyond moving `NewsletterSignup` into the `HomeTrainer` island. No layout shift on load (FR-006).

**Constraints**:
- Other pages' board sizes must not change (FR-004), so every new rule is scoped under a homepage-only class.
- Homepage content must still be in the server-rendered HTML (SEO).

**Scale/Scope**: 1 page, 2 components, about 80 lines of CSS.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the unfilled template, so it sets no principles or gates. Instead, I checked against the conventions the repo follows in practice (specs 005 and 006):

| Check | Status |
|-------|--------|
| One shared frame and layout grid (spec 005): reuse `.layout`, `--frame-*` and `--board-chrome` instead of new layout systems | ✅ Reuses `.layout` with a `home` modifier |
| Static HTML carries the SEO content (title, h1, intro, internal links), checked by `tests/build.test.ts` | ✅ Intro and cards stay server-rendered via slots |
| No new dependencies for small features | ✅ None |
| Behaviour changes covered by tests | ✅ Build test for structure and order; manual viewport matrix for fit |

Post-design re-check: still passes. No violations, so Complexity Tracking is empty.

## Project Structure

### Documentation (this feature)

```text
specs/007-homepage-viewport-fit/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (layout regions; no persisted data)
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── ui.md            # Phase 1 output (component props, DOM/CSS contract)
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit-tasks, not created here)
```

### Source Code (repository root)

```text
src/
├── pages/
│   └── index.astro                    # Pass intro + topic cards to HomeTrainer as named slots; drop the trailing <article>
├── components/react/
│   ├── HomeTrainer.tsx                # Owns the 3-column grid: main | side (info, about, newsletter) | sections
│   └── NewsletterSignup.tsx           # Unchanged; now rendered inside HomeTrainer
└── styles/
    └── styles.css                     # .layout.home grid areas, compact side columns, homepage board min size
tests/
└── build.test.ts                      # Homepage structure + DOM order assertions
```

**Structure Decision**: This is the existing single Astro project, and no new directories are needed. The changes stay in the homepage page, the homepage island and the shared stylesheet. All new CSS is scoped under `.layout.home`.

## Phase 0: Research

See [research.md](./research.md). Every Technical Context item is resolved, and nothing is left as NEEDS CLARIFICATION. The main decisions:

1. Use named Astro slots into `HomeTrainer`, not an Astro-side grid split across islands.
2. DOM order follows the phone order, and `grid-template-areas` places the columns on desktop.
3. Keep the board's height rule as it is; the side columns are what get compacted.
4. Hide the motif link lists on desktop and clamp the topic intros to 2 lines.
5. Add a homepage-only 280px minimum for the board.

## Phase 1: Design

- [data-model.md](./data-model.md): layout regions, their contents, order, and height budgets.
- [contracts/ui.md](./contracts/ui.md): `HomeTrainer` props, slot names, DOM and class contract, CSS contract, and the build-test assertions.
- [quickstart.md](./quickstart.md): how to run it and the viewport matrix to check SC-001 to SC-004.

## Complexity Tracking

No violations.
