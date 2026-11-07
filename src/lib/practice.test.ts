import { describe, expect, it } from 'vitest';
import type { Exercise } from './exercises';
import { depthOptions, filterExercises, noFilter, type PracticeFilter } from './practice';

const ex = (id: string, motifId: string, moves: number, topic: Exercise['topic'] = 'checkmates'): Exercise => ({
  id,
  motifId,
  topic,
  goal: { kind: 'mate' },
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
  ex('f', 'fork', 2, 'tactics'),
];
const by = (filter: Partial<PracticeFilter>) => ({ ...noFilter, ...filter });
const ids = (exs: Exercise[]) => exs.map((e) => e.id);

describe('filterExercises', () => {
  it('returns everything with no motif and any length', () => {
    expect(ids(filterExercises(list, noFilter))).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
  });



  it('filters by exact length', () => {
    expect(ids(filterExercises(list, by({ depth: 2 })))).toEqual(['b', 'f']);
  });

  it('groups 5 moves and longer under 5+', () => {
    expect(ids(filterExercises(list, by({ depth: 5 })))).toEqual(['d', 'e']);
  });

  it('combines the motif and length filters', () => {
    expect(ids(filterExercises(list, by({ motifIds: ['back-rank'], depth: 5 })))).toEqual(['e']);
    expect(ids(filterExercises(list, by({ motifIds: ['smothered'], depth: 1 })))).toEqual([]);
  });

  it('keeps the given order', () => {
    expect(ids(filterExercises([...list].reverse(), by({ motifIds: ['back-rank'] })))).toEqual([
      'e',
      'b',
      'a',
    ]);
  });
});

describe('depthOptions', () => {
  it('starts with Any and ends with 5+', () => {
    expect(depthOptions[0].label).toBe('Any');
    expect(depthOptions.at(-1)?.label).toBe('5+');
  });
});
