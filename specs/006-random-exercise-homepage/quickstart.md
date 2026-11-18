# Quickstart: Validate the Random Exercise Homepage

## Prerequisites

- Node and the repo dependencies installed (`npm install`).

## Automated checks

```bash
npm test             # includes reshuffle unit tests (src/lib/practice.test.ts)
npm run typecheck    # astro check
npm run test:build   # builds, then checks dist/index.html (see contracts/ui.md, "Homepage HTML")
```

All three should pass.

## Manual validation (`npm run dev`, open `/`)

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Load `/` | A board with an exercise is shown above the intro text. Topic cards and the newsletter form are still below it. (US1, FR-001, FR-009) |
| 2 | Reload 5–10 times | The first exercise changes, and exercises from different sections appear. (US1-3) |
| 3 | Play a correct move, then a wrong one | Feedback is the same as on `/checkmates/practice`. (FR-005) |
| 4 | Before solving | The title reads "Exercise N" and the pattern name is hidden. (FR-006) |
| 5 | Solve it, or press Reveal pattern | The pattern name, preview and "Learn …" / "Practise …" links appear, and both links open the right pages. (US3) |
| 6 | Press Hint repeatedly | Hint → Reveal piece → Reveal move, the same as in Practice. (FR-007) |
| 7 | Press Next about 50 times, noting each position | No repeats; positions from all three sections appear. Next also works on unsolved exercises. (US2, SC-003) |
| 8 | Reach a "Does the sacrifice work?" exercise | The quiz buttons and line viewer behave as in Practice. (Edge cases) |
| 9 | Solve an exercise, then open that section's Practice page | The solved count includes it. (FR-008) |
| 10 | Narrow the window to under 860px, or use a phone | One column and no horizontal scroll. (Edge cases) |
| 11 | Click Next rapidly about 10 times | The board ends on one complete position, with no stale move animation. (Edge cases) |
| 12 | View the page source of `/` | The title, description and JSON-LD are unchanged, and no pattern name appears in the trainer heading. (FR-009, FR-006) |
