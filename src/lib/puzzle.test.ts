import { describe, expect, it } from 'vitest';
import { patterns } from './patterns';
import { checkMove, playSan } from './puzzle';

const byId = (id: string) => {
  const pattern = patterns.find((p) => p.id === id);
  if (!pattern) throw new Error(`missing pattern ${id}`);
  return pattern;
};

describe('checkMove', () => {
  const epaulette = byId('epaulette'); // 3rkr2/8/1Q6/... — Qe6#

  it('accepts the solution move and marks a mate-in-1 as solved', () => {
    expect(checkMove(epaulette, epaulette.fen, 0, 'b6', 'e6')).toMatchObject({
      kind: 'correct',
      san: 'Qe6#',
      solved: true,
    });
  });

  it('rejects a legal move that does not mate', () => {
    expect(checkMove(epaulette, epaulette.fen, 0, 'b6', 'b7')).toEqual({
      kind: 'wrong',
      san: 'Qb7',
    });
  });

  it('reports an illegal move', () => {
    expect(checkMove(epaulette, epaulette.fen, 0, 'b6', 'h8')).toEqual({ kind: 'illegal' });
  });

  it('accepts any mating move on the final ply', () => {
    const alternative = { ...epaulette, solution: ['Qb8'] };
    expect(checkMove(alternative, epaulette.fen, 0, 'b6', 'e6')).toMatchObject({
      kind: 'correct',
      solved: true,
    });
  });

  it('does not mark the puzzle solved before the last ply', () => {
    const philidor = byId('philidor');
    const [first] = philidor.solution;
    const { from, to } = playSan(philidor.fen, first);
    expect(checkMove(philidor, philidor.fen, 0, from, to)).toMatchObject({
      kind: 'correct',
      san: first,
      solved: false,
    });
  });
});

describe('playSan', () => {
  it('returns the move squares and the resulting position', () => {
    const epaulette = byId('epaulette');
    const move = playSan(epaulette.fen, 'Qe6#');
    expect(move).toMatchObject({ san: 'Qe6#', from: 'b6', to: 'e6' });
    expect(move.fen.split(' ')[1]).toBe('b');
  });
});
