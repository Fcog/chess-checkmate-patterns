import { describe, expect, it } from 'vitest';
import type { Exercise } from './exercises';
import { depthOptions, filterExercises } from './practice';

const ex = (id: string, patternId: string, moves: number): Exercise => ({
  id,
  patternId,
  fen: '8/8/8/8/8/8/8/8 w - - 0 1',
  // A mate in N has 2N - 1 plies.
  solution: Array.from({ length: 2 * moves - 1 }, () => 'x'),
});

const list = [
  ex('a', 'back-rank', 1),
  ex('b', 'back-rank', 2),
  ex('c', 'smothered', 3),
  ex('d', 'smothered', 5),
  ex('e', 'back-rank', 8),
];
const ids = (exs: Exercise[]) => exs.map((e) => e.id);

describe('filterExercises', () => {
  it('returns everything with no pattern and any length', () => {
    expect(ids(filterExercises(list, [], 'any'))).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('filters by exact mate length', () => {
    expect(ids(filterExercises(list, [], 2))).toEqual(['b']);
  });

  it('groups mate in 5 and longer under 5+', () => {
    expect(ids(filterExercises(list, [], 5))).toEqual(['d', 'e']);
  });

  it('combines the pattern and length filters', () => {
    expect(ids(filterExercises(list, ['back-rank'], 5))).toEqual(['e']);
    expect(ids(filterExercises(list, ['smothered'], 1))).toEqual([]);
  });

  it('keeps the given order', () => {
    expect(ids(filterExercises([...list].reverse(), ['back-rank'], 'any'))).toEqual(['e', 'b', 'a']);
  });
});

describe('depthOptions', () => {
  it('starts with Any and ends with 5+', () => {
    expect(depthOptions[0].label).toBe('Any');
    expect(depthOptions.at(-1)?.label).toBe('5+');
  });
});
