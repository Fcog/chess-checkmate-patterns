---

description: "Task list for Progressive Hint Reveal (Piece, then Move)"
---

# Tasks: Progressive Hint Reveal (Piece, then Move)

**Input**: Design documents from `specs/003-hint-reveal-move/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui.md, quickstart.md

**Tests**: The plan (research R5, quickstart) asks for Vitest unit tests for the two pure helpers in `src/lib/puzzle.ts`. There are no component tests, because the repo has no React test setup. The UI is checked by hand with the quickstart scenarios.

**Organization**: Tasks are grouped by user story so each one can be built and tested on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story the task belongs to (US1, US2, US3)

## Path Conventions

This is a single Astro project. Logic goes in `src/lib/`, React islands in `src/components/react/`, and styles in `src/styles/styles.css`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Check the baseline before making changes.

- [X] T001 Run `npm test` and `npm run typecheck` from the repo root and confirm both pass on the current branch before any change (baseline for `src/`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Pure helpers, the hint-step state in the hook, and board shape support. Every story depends on these.

**⚠️ CRITICAL**: No user story work can start until this phase is complete.

- [X] T002 In `src/lib/puzzle.ts`, add `export type HintStep = 0 | 1 | 2;` and `export function nextHintMove(fen: string, line: string[], ply: number): { from: string; to: string } | null`. It returns `null` when `line[ply]` is undefined. Otherwise it calls the existing `playSan(fen, line[ply])` inside try/catch, returns `{ from, to }`, and returns `null` if the move throws (illegal).
- [X] T003 In `src/lib/puzzle.ts`, add `export function hintShapes(move: { from: string; to: string } | null, step: HintStep): { orig: string; dest?: string; brush: string }[]`. It returns `[]` when `move` is null or `step === 0`, `[{ orig: move.from, brush: 'green' }]` for step 1, and `[{ orig: move.from, dest: move.to, brush: 'green' }]` for step 2.
- [X] T004 [P] In `src/lib/puzzle.test.ts`, add a `describe('nextHintMove')` block:
  - (a) the epaulette motif (`byId('epaulette')`, solution `Qe6#`) at ply 0 returns `{ from: 'b6', to: 'e6' }`
  - (b) a two-move line at ply 2 of a 3-ply line returns the third move's squares. Use `{ fen: '6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1', line: ['Kf1','h6','Re8#'] }` with fen advanced via `playSan`, and expect `{ from: 'e1', to: 'e8' }`
  - (c) ply past the end returns `null`
  - (d) an illegal SAN returns `null`
- [X] T005 [P] In `src/lib/puzzle.test.ts`, add a `describe('hintShapes')` block checking that step 0 → `[]`, step 1 → one circle shape with `orig` only, step 2 → one arrow with `orig` and `dest`, and a null move with any step → `[]`
- [X] T006 In `src/components/react/Board.tsx`:
  - Import `type { DrawShape } from 'chessground/draw'`.
  - Add the optional prop `shapes?: DrawShape[]`.
  - Add a separate `useEffect` that calls `api.current?.setAutoShapes(props.shapes ?? [])` with deps `[props.shapes, props.fen, props.syncKey]`. Declare it after the existing sync effect so the shapes are redrawn after `api.set`.
- [X] T007 In `src/components/react/usePuzzle.ts`, add the hint state:
  - Add `const [hintStep, setHintStep] = useState<HintStep>(0);`.
  - Reset it with `setHintStep(0)` inside `load`, inside `reveal` (show solution), and in the correct-move branch of `onMove` (next to `setPly(nextPly)`).
  - Do NOT reset it in the wrong-move branch (spec edge case: the reveal is kept after a wrong move).
- [X] T008 In `src/components/react/usePuzzle.ts`, derive the hint move and expose the new API:
  - `const hintMove = useMemo(() => (showHint && !isDone && !busy && !displayFen ? nextHintMove(fen, line, ply) : null), [...])`
  - `const shapes = useMemo(() => hintShapes(hintMove, hintStep), [hintMove, hintStep])`, memoised so `Board` gets a stable reference
  - `const canAdvanceHint = showHint && !isDone && !busy && hintMove !== null && hintStep < 2`
  - `const advanceHint = useCallback(() => { if (canAdvanceHint) setHintStep((s) => (s + 1) as HintStep); }, [canAdvanceHint])`
  - Return `hintStep`, `canAdvanceHint` and `advanceHint`, and add `shapes` to `boardProps`. Cast the shapes to chessground `DrawShape[]` (the `orig`/`dest` strings are square keys).

**Checkpoint**: `npm test` passes with the new helper tests, and `npm run typecheck` passes. There's no visible UI change yet.

---

## Phase 3: User Story 1 - Reveal which piece to move (Priority: P1) 🎯 MVP

**Goal**: Once the hint text is visible, a "Reveal piece" button appears under it. Pressing it circles the piece for the next correct move.

**Independent Test**: Open any pattern lesson, press Hint, and check that "Reveal piece" appears under the hint text. Press it and check that the correct piece is circled, with no destination shown.

- [X] T009 [P] [US1] Create `src/components/react/HintReveal.tsx`, which exports `HintReveal({ step, disabled, onReveal }: { step: HintStep; disabled: boolean; onReveal: () => void })`. It renders a single `<button type="button" className="hint-reveal" onClick={onReveal} disabled={disabled}>`. The label is "Reveal piece" when `step === 0`, and "Reveal move" when `step === 1` (step 2 is handled in US2).
- [X] T010 [P] [US1] Add a `.hint-reveal` rule to `src/styles/styles.css` near the `.hint` rule (around line 506). Copy the look of `.controls button` (around line 396), including its `:hover:not(:disabled)` and `:disabled` states, and add `margin-top: 8px`.
- [X] T011 [US1] In `src/components/react/MotifInfo.tsx`:
  - Add the props `hintStep: HintStep`, `canAdvanceHint: boolean` and `onAdvanceHint: () => void`.
  - Right after the `.hint` `<p>`, render `{showHint && !isDone && <HintReveal step={hintStep} disabled={!canAdvanceHint} onReveal={onAdvanceHint} />}`.
- [X] T012 [US1] In `src/components/react/PracticeInfo.tsx`, add the same three props. Right after the `.hint` `<p>`, render `{showHint && !isDone && exercise.hint && <HintReveal step={hintStep} disabled={!canAdvanceHint} onReveal={onAdvanceHint} />}`.
- [X] T013 [US1] In `src/components/react/MotifTrainer.tsx`, pass `hintStep={puzzle.hintStep}`, `canAdvanceHint={puzzle.canAdvanceHint}` and `onAdvanceHint={puzzle.advanceHint}` to `<MotifInfo>`. `Board` already receives `shapes` through `{...puzzle.boardProps}`.
- [X] T014 [US1] In `src/components/react/PracticeTrainer.tsx`, pass the same three props to `<PracticeInfo>`. Use `canAdvanceHint={isQuiz ? false : puzzle.canAdvanceHint}` so quiz mode stays hint-free, alongside the existing `showHint={isQuiz ? false : ...}`.

**Checkpoint**: Quickstart scenarios 1 (piece part), 2, 4 and 7 pass.

---

## Phase 4: User Story 2 - Reveal the full move (Priority: P2)

**Goal**: A second press on the same button draws an arrow from the piece to its destination. After that, the button is used up for this move.

**Independent Test**: After Reveal piece, press "Reveal move". An arrow shows from → to, and the button reads "Move revealed" and is disabled.

- [X] T015 [US2] In `src/components/react/HintReveal.tsx`, handle `step === 2`: the label becomes "Move revealed" and the button is always disabled (`disabled={disabled || step === 2}`).
- [X] T016 [US2] Check `src/components/react/usePuzzle.ts`: `hintShapes(hintMove, 2)` produces the arrow, and `canAdvanceHint` is false at step 2. Adjust only if the manual check shows a problem. Then run quickstart scenario 1 in full.

**Checkpoint**: Quickstart scenario 1 passes end to end.

---

## Phase 5: User Story 3 - Reveal steps reset for each move in multi-move puzzles (Priority: P3)

**Goal**: After each correct move and the opponent's reply, the reveal goes back to "Reveal piece" and points at the new move.

**Independent Test**: In a mate in 2 or more (for example `anastasia-7`), reveal, play the correct move, and check that after the reply the shapes are gone and the button reads "Reveal piece" for the new move.

- [X] T017 [US3] In `src/components/react/usePuzzle.ts`, confirm the reset added in T007 runs in the correct-move branch. Also confirm that while the opponent's reply is pending (`busy === true`) `hintMove` is `null`, so no stale shapes are drawn. If shapes flash during the reply, move `setHintStep(0)` to the start of the correct-move branch, before `setBusy(true)`.
- [X] T018 [US3] In `src/components/react/usePuzzle.ts`, confirm that after a wrong move `hintStep` is kept and the shapes come back once `displayFen` clears (quickstart scenario 5). Then run quickstart scenarios 3, 5 and 6.

**Checkpoint**: All quickstart scenarios pass.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T019 [P] Run `npm test` and `npm run typecheck` from the repo root and fix any failures in the touched files (`src/lib/puzzle.ts`, `src/components/react/*.tsx`)
- [X] T020 [P] Check accessibility in `src/components/react/HintReveal.tsx`: the button is reachable by keyboard and its label changes are announced, either because it sits inside the existing `aria-live` region or by adding `aria-live="polite"` on a wrapper if not.
- [ ] T021 Run the whole of `specs/003-hint-reveal-move/quickstart.md` in `npm run dev`, including the mobile width (the controls collapse around `styles.css` line 453), and confirm the button layout under the hint text.

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (T001)** → **Foundational (T002–T008)** → **US1 (T009–T014)** → **US2 (T015–T016)** → **US3 (T017–T018)** → **Polish (T019–T021)**
- US2 needs US1, because it extends the same button. US3 needs only Foundational and US1, because the reset logic lives in T007 and US3 checks it.

### Within phases

- T002 → T003 (same file). T004 and T005 can run in parallel once T002 and T003 are done (same test file, but separate `describe` blocks; do them in order if one agent does both).
- T006 is independent of T002–T005 (different file).
- T007 → T008 (same file), and both depend on T002 and T003.
- T009 and T010 can run in parallel. T011 and T012 depend on T009. T013 depends on T011, and T014 depends on T012.

### Parallel example: User Story 1

```text
T009 Create HintReveal.tsx
T010 Add .hint-reveal CSS
# then
T011 MotifInfo.tsx   |   T012 PracticeInfo.tsx
# then
T013 MotifTrainer.tsx |  T014 PracticeTrainer.tsx
```

---

## Implementation Strategy

### MVP (User Story 1 only)

1. T001–T008 (foundation, with tested helpers)
2. T009–T014, which gives the piece reveal under the hint
3. Stop and check with quickstart scenarios 1 (piece), 2, 4 and 7

### Incremental delivery

1. Add US2 (T015–T016), which gives the full move arrow
2. Add US3 checks (T017–T018), so multi-move puzzles reset cleanly
3. Polish (T019–T021)
