# Quickstart: Homepage Fits the Viewport

## Prerequisites

- You're on a branch that contains feature 006 (`homepage-random-exercises`) plus this feature.
- `npm install` has been run.

## Automated checks

```sh
npm test            # unit tests (unchanged behaviour)
npm run typecheck   # astro check, including the new HomeTrainer props
npm run test:build  # builds dist/ and runs tests/build.test.ts, including the homepage structure/order checks
```

Expected: everything passes. The new homepage assertions are listed in [contracts/ui.md](./contracts/ui.md#build-test-contract-testsbuildtestts).

## Manual viewport matrix

Run `npm run dev` and open `http://localhost:4321/`. For each size, set it in the browser devtools device toolbar at 100% zoom and reload. Don't make any moves before checking.

| Viewport | Expect | Spec |
|----------|--------|------|
| 1366×768 | Without scrolling, these are fully visible: the board with its controls; the info panel, h1, intro and the newsletter form with its Subscribe button (right); all three topic cards with their headings and Learn/Practice links (left). | SC-001 |
| 1440×900 | Same as above. | SC-001 |
| 1920×1080 | Same as above; the board is at least as big as at 1366×768. | SC-001 |
| 2560×900 | The board is limited by height; the side columns keep their widths. | Edge case |
| 1280×600 | Elements may scroll; the board is ≥ 280px wide and playable. | FR-003 |
| 390×844 | The board is ≥ 280px wide. Scrolling down, the order is info panel → intro → newsletter → topic cards, with the full motif lists. The h1 is visible within one screen of scrolling. | SC-002, FR-007 |

## Regression checks

1. Open `/checkmates/<any motif>` and `/checkmates/practice` at 1366×768, 1440×900 and 1920×1080, and compare the board width (devtools → `.board` → computed width) with `main`. It must be the same (SC-003).
2. On the homepage, play a few moves, reveal the pattern and press Next. The board and the left column must not move (Decision 5), and the puzzle behaves as before (FR-005).
3. Submit the newsletter form. The confirmation replaces the form, and the right column shrinks without leaving a gap.
4. Throttle the network to "Slow 4G" and reload. The intro, newsletter and cards must not jump when the island hydrates (SC-004).
