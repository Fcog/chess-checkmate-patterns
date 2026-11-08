import { Chess } from 'chess.js';
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
 * Every position of a motif's demo line, from the setup to the final move. Motifs are
 * stored with White to play; for `side === 'black'` the frames are mirrored so the pattern
 * matches a puzzle the player solves with Black.
 */
export function patternFrames(
  pattern: { fen: string; solution: string[] },
  side: Side,
): Frame[] {
  const frames = lineFrames(pattern.fen, pattern.solution);
  if (side === 'white') return frames;
  return frames.map((frame) => ({
    fen: mirrorFen(frame.fen),
    lastMove: frame.lastMove && [mirrorSquare(frame.lastMove[0]), mirrorSquare(frame.lastMove[1])],
    check: frame.check,
  }));
}

/** Every position along a line of moves, starting with `fen` itself. */
export function lineFrames(fen: string, moves: string[]): Frame[] {
  const frames: Frame[] = [{ fen, check: new Chess(fen).inCheck() }];
  let current = fen;
  for (const san of moves) {
    const move = playSan(current, san);
    current = move.fen;
    frames.push({ fen: current, lastMove: [move.from, move.to], check: new Chess(current).inCheck() });
  }
  return frames;
}

export type MoveLabel = {
  /** Position index after this move (1 = after the first move). */
  ply: number;
  /** "5." before White's moves, "5..." before a line that starts with Black. */
  number?: string;
  san: string;
};

/** Moves labelled with their move numbers, counted from the FEN, for a clickable move list. */
export function numberedMoves(fen: string, moves: string[]): MoveLabel[] {
  const [, turn, , , , fullmove] = fen.split(' ');
  let number = Number(fullmove) || 1;
  let whiteToMove = turn === 'w';
  return moves.map((san, i) => {
    const label: MoveLabel = { ply: i + 1, san };
    if (whiteToMove) label.number = `${number}.`;
    else if (i === 0) label.number = `${number}...`;
    if (!whiteToMove) number += 1;
    whiteToMove = !whiteToMove;
    return label;
  });
}
