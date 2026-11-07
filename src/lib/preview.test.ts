import { describe, expect, it } from 'vitest';
import { Chess } from 'chess.js';
import { motifs } from './motifs';
import { lineFrames, mirrorFen, mirrorSquare, numberedMoves, patternFrames } from './preview';

const patterns = motifs.filter((m) => m.goal.kind === 'mate');

describe('mirroring', () => {
  it('flips squares top to bottom', () => {
    expect(mirrorSquare('e6')).toBe('e3');
    expect(mirrorSquare('a1')).toBe('a8');
  });

  it('swaps colours, ranks, side to move and castling', () => {
    expect(mirrorFen('r3k2r/8/8/8/8/8/8/R3K2R w KQq - 0 1')).toBe(
      'r3k2r/8/8/8/8/8/8/R3K2R b Qkq - 0 1',
    );
    expect(mirrorFen('4k3/8/8/8/4P3/8/8/4K3 b - e3 0 1')).toBe('4k3/8/8/4p3/8/8/8/4K3 w - e6 0 1');
  });

  it.each(motifs)('gives back $name when mirrored twice', (pattern) => {
    expect(mirrorFen(mirrorFen(pattern.fen))).toBe(pattern.fen);
  });
});

describe.each(patterns)('pattern frames for $name', (pattern) => {
  it.each(['white', 'black'] as const)('end in checkmate by %s', (side) => {
    const frames = patternFrames(pattern, side);
    expect(frames).toHaveLength(pattern.solution.length + 1);
    const final = new Chess(frames.at(-1)!.fen);
    expect(final.isCheckmate()).toBe(true);
    // The side to move in the final position is the one that got mated.
    expect(final.turn()).toBe(side === 'white' ? 'b' : 'w');
    expect(frames.at(-1)!.check).toBe(true);
    expect(frames[0].lastMove).toBeUndefined();
  });
});

describe('lineFrames', () => {
  it('returns the start position plus one frame per move', () => {
    const start = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const frames = lineFrames(start, ['e4', 'e5', 'Qh5']);
    expect(frames).toHaveLength(4);
    expect(frames[0]).toEqual({ fen: start, check: false });
    expect(frames[1].lastMove).toEqual(['e2', 'e4']);
    expect(frames[3].lastMove).toEqual(['d1', 'h5']);
  });

  it('flags positions where the side to move is in check', () => {
    const frames = lineFrames('6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1', ['Re8#']);
    expect(frames[1].check).toBe(true);
  });
});

describe('numberedMoves', () => {
  it('numbers moves from the FEN, starting with White', () => {
    expect(numberedMoves('8/8/8/8/8/8/8/8 w - - 0 5', ['Bxf7+', 'Kxf7', 'Ng5+'])).toEqual([
      { ply: 1, number: '5.', san: 'Bxf7+' },
      { ply: 2, san: 'Kxf7' },
      { ply: 3, number: '6.', san: 'Ng5+' },
    ]);
  });

  it('uses "..." when the line starts with Black', () => {
    expect(numberedMoves('8/8/8/8/8/8/8/8 b - - 0 6', ['Kf8', 'Ne6+'])).toEqual([
      { ply: 1, number: '6...', san: 'Kf8' },
      { ply: 2, number: '7.', san: 'Ne6+' },
    ]);
  });
});
