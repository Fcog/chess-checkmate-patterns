# Implementation Plan: Full-Width Layout

**Branch**: `new-hint-feature` (spec dir `005-full-width-layout`) | **Date**: 2026-11-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-full-width-layout/spec.md`

## Summary

Replace the three hard-coded `1100px` caps (`.app`, `.page-text`, `.site-footer`) with a shared frame of `--frame-max: 2400px` and `--frame-pad: clamp(20px, 2vw, 32px)`, so every page spans the window with lined-up edges. Above the 860 px breakpoint, the board is sized by `min(column width, 100svh − 190px)`, so it grows on large screens while board and controls always fit the viewport height. Side columns get bounded `minmax` widths. Prose stays at 720 px, and only the home `.topic-cards` grid is exempt so it adds columns. Chessground already re-measures through its own ResizeObserver, so this is a CSS-only change.

## Technical Context

**Language/Version**: CSS (in `src/styles/styles.css`); no TypeScript changes planned

**Primary Dependencies**: Astro 7 static pages; chessground 9 (resizes itself via ResizeObserver)

**Storage**: N/A

**Testing**: `npm test`, `npm run typecheck`, `npm run test:build`; manual viewport checks (quickstart)

**Target Platform**: Modern browsers (`svh`, `min()`, `clamp()` and container queries are already used in the codebase)

**Project Type**: Static web app

**Performance Goals**: No layout shift on load. Resizing is smooth (it's handled by chessground)

**Constraints**: Phone and tablet layout (≤ 860 px) unchanged. Prose ≤ 720 px. No horizontal scroll from 320 to 3,840 px or at 200% zoom

**Scale/Scope**: 1 file (`src/styles/styles.css`), about 10 rules. No markup changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is the unfilled template, so it has no gates. **PASS** before and after design.

## Project Structure

### Documentation (this feature)

```text
specs/005-full-width-layout/
├── plan.md
├── research.md
├── data-model.md          # layout tokens
├── quickstart.md
├── contracts/layout.md    # per-container width contract
└── tasks.md               # created by /speckit-tasks
```

### Source Code (repository root)

```text
src/styles/styles.css
  :root                    + --frame-max, --frame-pad, --board-chrome, --prose-max
  .app                     1100px → frame tokens
  .layout                  fixed 230/260 → bounded minmax columns
  .board, .empty-state     480px stays as the base; ≥861px → min(100%, 100svh − chrome)
  .page-text               1100px → frame tokens
  .page-text > *           720px → var(--prose-max)
  .page-text > .topic-cards  NEW: max-width: none
  .site-footer             1100px → frame tokens
```

**Structure Decision**: Single stylesheet edit. The tablet breakpoint is `max-width: 860px`, so the new desktop rules go in a matching `@media (min-width: 861px)` block. That way the ≤ 860 px cascade stays byte-for-byte the same in effect.

## Implementation Notes

1. Add the tokens to the existing `:root` block. Don't hard-code values anywhere else.
2. `.app`, `.page-text` and `.site-footer`: `max-width: var(--frame-max); padding-left/right: var(--frame-pad);`. Keep their existing top and bottom padding.
3. Add `@media (min-width: 861px)` with `.layout` columns, `.board, .empty-state { max-width: min(100%, calc(100svh - var(--board-chrome))); }`, and keep `aspect-ratio: 1`.
4. `.page-text > .topic-cards { max-width: none; }`.
5. If the measured header and controls height differs from 190 px (check in dev tools at 1,280×720), adjust `--board-chrome` only.

## Complexity Tracking

No violations.
