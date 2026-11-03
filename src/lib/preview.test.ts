import { describe, expect, it } from 'vitest';
import { Chess } from 'chess.js';
import { patterns } from './patterns';
import { mirrorFen, mirrorSquare, patternFrames } from './preview';

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

  it.each(patterns)('gives back $name when mirrored twice', (pattern) => {
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
