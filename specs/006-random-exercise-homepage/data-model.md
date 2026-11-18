# Data Model: Random Exercise on the Homepage

The feature adds no persisted data. It works only with existing exercise data and keeps a small amount of in-memory state for each visit.

## Exercise (existing, `src/lib/exercises.ts`)

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Unique, used for solved tracking and the reshuffle exclusion |
| `motifId` | string | Pattern; resolved with `motifById` and hidden until solved/revealed |
| `topic` | `TopicId` | Section (`checkmates` \| `tactics` \| `attacks`), used for the "Practise" link |
| `fen`, `solution`, `alternatives?`, `hint?`, `goal`, `sound?` | — | Unchanged; drive the board, hints and quiz |

**Pool**: `exercises`, the full exported list across all sections, with no filtering.

## Visit sequence (new, React state in `HomeTrainer`)

| Field | Type | Notes |
|-------|------|-------|
| `order` | `Exercise[]` | A permutation of the pool; it starts in original order (server render) and is shuffled on mount |
| `index` | number | Position in `order` of the current exercise |
| `shown` | number | Exercises shown so far this visit; used for the "Exercise N" title |
| `revealPattern` | boolean | Reset to `false` on every navigation |
| `quizAnswer` | `boolean \| null` | Reset to `null` on every navigation |

**Validation rules**
- `order` is always a permutation of the pool, with no duplicates (FR-004).
- When a cycle starts again, `order[0].id !== previous current id` whenever the pool has 2 or more exercises.

**State transitions**

```text
mount            → order = shuffle(pool), index = 0, shown = 1, load(order[0])
Next (index+1 < n) → index += 1, shown += 1
Next (index+1 = n) → order = reshuffle(pool, current.id), index = 0, shown += 1
Previous (index>0) → index -= 1
solve / quiz right → markSolved(id)   (existing localStorage list)
```

## Solved list (existing, `useSolved`)

There is no schema change. Homepage solves are added to the same `checkmate-patterns:solved` list, which covers FR-008.
