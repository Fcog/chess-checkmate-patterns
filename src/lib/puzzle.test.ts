import { describe, expect, it } from 'vitest';
import { patterns } from './patterns';
import { Chess } from 'chess.js';
import { checkMove, playSan, refutation } from './puzzle';

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
    expect(checkMove(epaulette, epaulette.fen, 0, 'b6', 'b7')).toMatchObject({
      kind: 'wrong',
      san: 'Qb7',
      to: 'b7',
    });
  });

  it('accepts a checkmate that comes earlier than the solution', () => {
    // Back-rank: Re8 mates at once, even though the stored line is longer.
    const puzzle = { id: 'test', fen: '6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1', solution: ['Kf1', 'h6', 'Re8#'] };
    expect(checkMove(puzzle, puzzle.fen, 0, 'e1', 'e8')).toMatchObject({
      kind: 'correct',
      san: 'Re8#',
      solved: true,
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

describe('refutation', () => {
  it('plays a legal reply and reports the resulting position', () => {
    const epaulette = byId('epaulette');
    const wrong = checkMove(epaulette, epaulette.fen, 0, 'b6', 'b7');
    if (wrong.kind !== 'wrong') throw new Error('expected a wrong move');
    const reply = refutation(wrong.fen, wrong.to);
    expect(reply).not.toBeNull();
    const chess = new Chess(wrong.fen);
    expect(chess.moves()).toContain(reply?.san);
    chess.move(reply!.san);
    expect(reply?.fen).toBe(chess.fen());
  });

  it('avoids a reply that walks into mate in one', () => {
    // Black to move: every reply except Kh8 (Re8#) survives the next move.
    const reply = refutation('6k1/5ppp/8/8/8/8/8/4R1K1 b - - 0 1', 'e1');
    expect(reply?.san).not.toBe('Kh8');
    const after = new Chess(reply!.fen);
    const mates = after.moves().filter((san) => {
      after.move(san);
      const mate = after.isCheckmate();
      after.undo();
      return mate;
    });
    expect(mates).toEqual([]);
  });

  it('takes the piece that just moved when it is free to', () => {
    // White's queen has just landed on b7 next to Black's king, unprotected.
    expect(refutation('k7/1Q6/8/8/8/8/8/6K1 b - - 0 1', 'b7')?.san).toBe('Kxb7');
  });

  it('returns null when the defender is stalemated', () => {
    expect(refutation('k7/2Q5/1K6/8/8/8/8/8 b - - 0 1', 'c7')).toBeNull();
  });
});
