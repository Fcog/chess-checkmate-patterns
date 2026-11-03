import { Chess } from 'chess.js';
import type { Pattern } from './patterns';
import { playSan } from './puzzle';

export type Side = 'white' | 'black';

export type Frame = {
  fen: string;
  lastMove?: [string, string];
  check: boolean;
};

/** The same square seen from the other side: same file, rank flipped (e6 → e3). */
export function mirrorSquare(square: string): string {
  return square[0] + (9 - Number(square[1]));
}

const swapCase = (text: string) =>
  [...text].map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join('');

/** Flips the board top to bottom and swaps the colours, so White's pattern becomes Black's. */
export function mirrorFen(fen: string): string {
  const [placement, turn, castling, enPassant, ...counters] = fen.split(' ');
  const mirroredCastling =
    castling === '-'
      ? '-'
      : [...swapCase(castling)].sort((a, b) => 'KQkq'.indexOf(a) - 'KQkq'.indexOf(b)).join('');
  return [
    swapCase(placement.split('/').reverse().join('/')),
    turn === 'w' ? 'b' : 'w',
    mirroredCastling,
    enPassant === '-' ? '-' : mirrorSquare(enPassant),
    ...counters,
  ].join(' ');
}

/**
 * Every position of a pattern's mating line, from the setup to the checkmate. Patterns are
 * stored with White mating; for `side === 'black'` the frames are mirrored so the pattern
 * matches a puzzle the player solves with Black.
 */
export function patternFrames(pattern: Pattern, side: Side): Frame[] {
  const frames: Frame[] = [{ fen: pattern.fen, check: new Chess(pattern.fen).inCheck() }];
  let fen = pattern.fen;
  for (const san of pattern.solution) {
    const move = playSan(fen, san);
    fen = move.fen;
    frames.push({ fen, lastMove: [move.from, move.to], check: new Chess(fen).inCheck() });
  }
  if (side === 'white') return frames;
  return frames.map((frame) => ({
    fen: mirrorFen(frame.fen),
    lastMove: frame.lastMove && [mirrorSquare(frame.lastMove[0]), mirrorSquare(frame.lastMove[1])],
    check: frame.check,
  }));
}
