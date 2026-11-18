# UI Contract: Random Exercise on the Homepage

## `src/lib/practice.ts` (pure, unit-tested)

```ts
/**
 * A new random order of `list`. When `list` has 2 or more items, the first item's id is never
 * `avoidFirstId`, so a fresh cycle can't repeat the exercise that was just shown.
 */
export function reshuffle<T extends { id: string }>(list: T[], avoidFirstId?: string): T[];
```

- It returns a new array and leaves `list` unchanged.
- The result is a permutation of `list`: same length, same items.
- An empty list or a single item is returned as a copy.

## `HomeTrainer` (new, `src/components/react/HomeTrainer.tsx`)

```ts
export function HomeTrainer(): JSX.Element; // no props
```

- It renders `.app` containing a `Header` (no `topic`, no `menu`, `progress="<solved> / <pool> solved"`) and then `.layout.no-menu`.
- `main` shows either `QuizBoard` (`goal.kind === 'quiz'`) or `Board` with `PracticeControls`. It is wired the same way as `PracticeTrainer`, apart from:
  - `canGoNext = pool.length >= 2`
  - `canGoPrevious = index > 0`
- The info panel is `PracticeInfo` with `exerciseIndex = shown - 1` and `showLinks`.
- It is mounted in `src/pages/index.astro` as `<HomeTrainer client:load />`, before `article.page-text`.

## `PracticeInfo`: addition

```ts
showLinks?: boolean; // default false
```

When `showLinks && (revealPattern || isDone) && exercisePattern`, it renders:

```html
<p class="modes topic-actions">
  <a class="mode" href="{motifPath(pattern)}">Learn {pattern.name}</a>
  <a class="mode" href="{practicePath(exercise.topic)}">Practise {topic.name}</a>
</p>
```

Existing callers (`PracticeTrainer`) don't pass the prop, so they are unchanged.

## CSS

```css
.layout.no-menu { grid-template-columns: minmax(0, 1fr) minmax(240px, 340px); }
@media (max-width: 860px) { .layout.no-menu { grid-template-columns: minmax(0, 1fr); } }
```

## Homepage HTML (checked by `tests/build.test.ts`)

- `dist/index.html` contains an `astro-island` for `HomeTrainer` and a `.cg-wrap` or board container.
- It still contains `class="topic-cards"`, the `<h1>`, the newsletter form and the existing `<title>`, description and JSON-LD.
- It does not contain the first exercise's motif name inside the trainer's `<h2>`.
