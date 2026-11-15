---

description: "Task list for Hint Button Progression"
---

# Tasks: Hint Button Progression (Hint → Reveal piece → Reveal move)

**Input**: Design documents from `specs/004-hint-button-progression/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui.md, quickstart.md

**Tests**: The plan (research R6) asks for Vitest unit tests for the pure `hintButtonState` helper. There are no component tests, because the repo has no React test setup. Layout and focus are checked with the quickstart.

**Organization**: Tasks are grouped by user story. The reveal logic from 003 (`nextHintMove`, `hintShapes`, `hintStep`, `advanceHint`, `canAdvanceHint`, `boardProps.shapes`) is reused unchanged and must NOT be modified.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1, US2, US3 from spec.md

---

## Phase 1: Setup

- [X] T001 Run `npm test` and `npm run typecheck` from the repo root and confirm both pass before any change (baseline for `src/`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The derived button state and the single press action. Every story depends on these.

- [X] T002 In `src/lib/puzzle.ts`, below `hintShapes`, add `export type HintButtonState = 'hint' | 'piece' | 'move' | 'done';` and `export function hintButtonState(showHint: boolean, step: HintStep): HintButtonState`. It returns `'hint'` when `!showHint`, otherwise `(['piece', 'move', 'done'] as const)[step]`.
- [X] T003 [P] In `src/lib/puzzle.test.ts`, add `hintButtonState` to the import from `./puzzle` and add a `describe('hintButtonState')` block checking that:
  - `(false, 0)` → `'hint'`
  - `(false, 2)` → `'hint'`
  - `(true, 0)` → `'piece'`
  - `(true, 1)` → `'move'`
  - `(true, 2)` → `'done'`
- [X] T004 In `src/components/react/usePuzzle.ts`, import `hintButtonState` from `../../lib/puzzle`. Add:
  - `const hintButton = hintButtonState(showHint, hintStep);`
  - `const pressHint = useCallback(() => { if (!showHint) setShowHint(true); else advanceHint(); }, [showHint, advanceHint]);`

  Return `hintButton` and `pressHint` next to the existing `hintStep`/`canAdvanceHint`/`advanceHint`. Don't touch any existing `setHintStep(0)` reset points.

**Checkpoint**: `npm test` passes with the new cases. No UI change yet.

---

## Phase 3: User Story 1 - One button walks through every hint step (Priority: P1) 🎯 MVP

**Goal**: The existing Hint button cycles through Hint → Reveal piece → Reveal move → Move revealed, and the under-hint button is gone.

**Independent Test**: Quickstart scenarios 1 and 3. Three presses on the same spot show the text, then the piece, then the move, and nothing is rendered under the hint text.

- [X] T005 [P] [US1] Create `src/components/react/HintButton.tsx`, which exports `HintButton({ state, disabled, onPress }: { state: HintButtonState; disabled: boolean; onPress: () => void })`.
  - Define `LABELS: Record<HintButtonState, { full: string; short: string }>` as `hint: Hint/Hint`, `piece: Reveal piece/Piece`, `move: Reveal move/Move`, `done: Move revealed/Shown`.
  - Render one `<button type="button" className="hint-button" aria-label={LABELS[state].full} aria-live="polite" disabled={disabled} aria-disabled={state === 'done' || undefined} onClick={() => { if (state !== 'done') onPress(); }}>`.
  - Inside it, render `<span className="hint-labels">` containing, for every key of `LABELS` in order, `<span key={k} className={k === state ? 'is-active' : undefined}><ButtonLabel full={...} short={...} /></span>` (`ButtonLabel` comes from `./ButtonLabel`).
- [X] T006 [US1] In `src/components/react/PatternControls.tsx`:
  - Replace the props `showHint: boolean` and `onShowHint: () => void` with `hintState: HintButtonState`, `canAdvanceHint: boolean` and `onPressHint: () => void`.
  - Replace the `<button onClick={onShowHint} ...>Hint</button>` with `<HintButton state={hintState} disabled={isDone || busy || ((hintState === 'piece' || hintState === 'move') && !canAdvanceHint)} onPress={onPressHint} />`.
- [X] T007 [US1] In `src/components/react/PracticeControls.tsx`, make the same prop replacement as T006, keeping `hasHint`. Replace the Hint button inside `{hasHint && (...)}` with the same `<HintButton ... />` and the same disabled expression.
- [X] T008 [P] [US1] In `src/components/react/MotifInfo.tsx`, remove the `HintReveal` import and the `HintStep` type import. Remove the props `hintStep`, `canAdvanceHint` and `onAdvanceHint` and their destructuring. Remove the `{showHint && !isDone && (<HintReveal ... />)}` block. Keep `showHint`, which still controls the hint text.
- [X] T009 [P] [US1] In `src/components/react/PracticeInfo.tsx`, make the same removals as T008: the `HintReveal`/`HintStep` imports, the three props, and the `<HintReveal>` block. Keep `showHint`.
- [X] T010 [US1] In `src/components/react/MotifTrainer.tsx`:
  - On `<PatternControls>`, replace `showHint={puzzle.showHint}` and `onShowHint={() => puzzle.setShowHint(true)}` with `hintState={puzzle.hintButton}`, `canAdvanceHint={puzzle.canAdvanceHint}` and `onPressHint={puzzle.pressHint}`.
  - On `<MotifInfo>`, remove `hintStep`, `canAdvanceHint` and `onAdvanceHint`.
- [X] T011 [US1] In `src/components/react/PracticeTrainer.tsx`:
  - On `<PracticeControls>`, replace `showHint={puzzle.showHint}` and `onShowHint={() => puzzle.setShowHint(true)}` with `hintState={puzzle.hintButton}`, `canAdvanceHint={puzzle.canAdvanceHint}` and `onPressHint={puzzle.pressHint}`.
  - On `<PracticeInfo>`, remove `hintStep`, `canAdvanceHint` and `onAdvanceHint`, and keep `showHint={isQuiz ? false : puzzle.showHint}`. Quiz mode already doesn't render `PracticeControls`.
- [X] T012 [US1] Delete `src/components/react/HintReveal.tsx`, then confirm with `grep -rn HintReveal src` that nothing references it.

**Checkpoint**: `npm run typecheck` passes. Quickstart scenarios 1 and 3 pass, although the label width may still shift (fixed in US2).

---

## Phase 4: User Story 2 - The button keeps its place and size (Priority: P2)

**Goal**: The hint button's width is the same in every state, at desktop and mobile widths, so no control in the row moves.

**Independent Test**: Quickstart scenario 2, at desktop width and under a 500 px column.

- [X] T013 [US2] In `src/styles/styles.css`, delete the `.hint-reveal`, `.hint-reveal:hover:not(:disabled)` and `.hint-reveal:disabled` rules added by 003 (just after the `.hint` rule).
- [X] T014 [US2] In `src/styles/styles.css`, after the `.controls button:disabled` rule (around line 412), add:
  - `.hint-labels { display: inline-grid; }`
  - `.hint-labels > span { grid-area: 1 / 1; visibility: hidden; }`
  - `.hint-labels > span.is-active { visibility: visible; }`
  - `.controls button[aria-disabled='true'] { opacity: 0.4; cursor: default; }`

  Change `.controls button:hover:not(:disabled)` to `.controls button:hover:not(:disabled):not([aria-disabled='true'])`.
- [ ] T015 [US2] Check that the existing `@container (max-width: 499px)` rules (`.controls .label-full { display: none }`, `.controls .label-short { display: inline }`) still apply inside `.hint-labels` in `src/styles/styles.css`, so the stacked short labels set the narrow width. Then run quickstart scenario 2 and confirm Reset, Show solution and Next don't move.

**Checkpoint**: Quickstart scenario 2 passes.

---

## Phase 5: User Story 3 - Steps reset for each move (Priority: P3)

**Goal**: After a correct move the button reads "Reveal piece" (not "Hint"). Reset or the next puzzle brings back "Hint".

**Independent Test**: Quickstart scenario 4 on `anastasia-7`.

- [X] T016 [US3] Check in `src/components/react/usePuzzle.ts` that the correct-move branch of `onMove` resets only `hintStep` (via the existing `setHintStep(0)`) and not `showHint`, so `hintButton` becomes `'piece'`, and that `load` resets both, so it becomes `'hint'`. Change nothing unless scenario 4 fails.

**Checkpoint**: Quickstart scenarios 4 and 6 pass.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T017 [P] Run `npm test` and `npm run typecheck` and fix any failures in the touched files (`src/lib/puzzle.ts`, `src/components/react/*.tsx`)
- [X] T018 [P] Run `npx astro build` to confirm the production build still succeeds with `HintReveal.tsx` removed
- [ ] T019 Run quickstart scenarios 5 (keyboard and VoiceOver) and 7 (003 regressions: Black to move `two-knights-3`, quiz mode) from `specs/004-hint-button-progression/quickstart.md` in `npm run dev`

---

## Dependencies & Execution Order

- **Setup (T001)** → **Foundational (T002–T004)** → **US1 (T005–T012)** → **US2 (T013–T015)** → **US3 (T016)** → **Polish (T017–T019)**
- T002 → T003 and T004 (T003 is [P] with T004, since they're different files).
- In US1: T005, T008 and T009 can run in parallel. T006 and T007 depend on T005. T010 depends on T006 and T008. T011 depends on T007 and T009. T012 comes after T008–T011.
- US2 depends on US1 (`HintButton` markup must exist). US3 depends only on Foundational and US1.

### Parallel example: User Story 1

```text
T005 HintButton.tsx   |   T008 MotifInfo.tsx   |   T009 PracticeInfo.tsx
# then
T006 PatternControls.tsx   |   T007 PracticeControls.tsx
# then
T010 MotifTrainer.tsx   |   T011 PracticeTrainer.tsx
# then
T012 delete HintReveal.tsx
```

---

## Implementation Strategy

### MVP (User Story 1)

T001–T012: the single cycling button, with the under-hint button removed. Check with quickstart 1 and 3.

### Incremental delivery

1. US2 (T013–T015): stable width, no layout shift
2. US3 (T016): confirm the per-move reset with the new labels
3. Polish (T017–T019)
