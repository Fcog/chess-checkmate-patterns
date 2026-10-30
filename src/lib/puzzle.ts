import { Chess } from 'chess.js';

/** Anything the trainer can play through: a pattern or a practice exercise. */
export type Puzzle = {
  id: string;
  fen: string;
  solution: string[];
  hint?: string;
};

export type MoveResult =
  | { kind: 'illegal' }
  | { kind: 'wrong'; san: string }
  | { kind: 'correct'; san: string; fen: string; solved: boolean };

/**
 * Checks the player's move against the solution at `ply`. The final move counts as
 * correct whenever it mates, even if it isn't the one in the solution.
 */
export function checkMove(
  puzzle: Puzzle,
  fen: string,
  ply: number,
  from: string,
  to: string,
): MoveResult {
  const chess = new Chess(fen);
  let san: string;
  try {
    san = chess.move({ from, to, promotion: 'q' }).san;
  } catch {
    return { kind: 'illegal' };
  }

  const isFinalPly = ply + 1 >= puzzle.solution.length;
  const isExpectedMove = san === puzzle.solution[ply] || (isFinalPly && chess.isCheckmate());
  if (!isExpectedMove) return { kind: 'wrong', san };
  return { kind: 'correct', san, fen: chess.fen(), solved: isFinalPly };
}

/** Plays a move from the solution and reports where it went. */
export function playSan(fen: string, san: string) {
  const chess = new Chess(fen);
  const move = chess.move(san);
  return { san: move.san, from: move.from, to: move.to, fen: chess.fen() };
}
