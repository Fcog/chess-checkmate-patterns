import { Chess, type Move, type PieceSymbol } from 'chess.js';

/** Anything the trainer can play through: a pattern or a practice exercise. */
export type Puzzle = {
  id: string;
  fen: string;
  solution: string[];
  hint?: string;
};

export type MoveResult =
  | { kind: 'illegal' }
  | { kind: 'wrong'; san: string; fen: string; to: string }
  | { kind: 'correct'; san: string; fen: string; solved: boolean };

/**
 * Checks the player's move against the solution at `ply`. Any move that gives checkmate
 * counts as correct and solves the puzzle, even if it isn't the one in the solution.
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

  if (chess.isCheckmate()) return { kind: 'correct', san, fen: chess.fen(), solved: true };
  if (san !== puzzle.solution[ply]) return { kind: 'wrong', san, fen: chess.fen(), to };
  return { kind: 'correct', san, fen: chess.fen(), solved: ply + 1 >= puzzle.solution.length };
}

/** Plays a move from the solution and reports where it went. */
export function playSan(fen: string, san: string) {
  const chess = new Chess(fen);
  const move = chess.move(san);
  return { san: move.san, from: move.from, to: move.to, fen: chess.fen() };
}

export type Reply = { san: string; from: string; to: string; fen: string };

const PIECE_VALUE: Record<PieceSymbol, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

/** Can the side to move give checkmate right now? */
function hasMateInOne(chess: Chess): boolean {
  return chess.moves().some((san) => {
    chess.move(san);
    const mate = chess.isCheckmate();
    chess.undo();
    return mate;
  });
}

/**
 * A plausible answer to the player's wrong move, to show on the board. `fen` is the position
 * after the wrong move and `movedTo` the square the player's piece went to. Prefers replies
 * that leave no mate in one, then natural-looking ones: taking the piece that just moved,
 * checks, other captures, king moves. There's no engine, so this illustrates rather than
 * proves the refutation. Returns null when the defender has no legal move (stalemate).
 */
export function refutation(fen: string, movedTo: string): Reply | null {
  const chess = new Chess(fen);
  const replies = chess.moves({ verbose: true });
  if (replies.length === 0) return null;

  const score = (move: Move): number => {
    chess.move(move);
    const allowsMate = hasMateInOne(chess);
    chess.undo();
    let natural = 0;
    if (move.to === movedTo && move.captured) natural = 4;
    else if (move.san.includes('+')) natural = 3;
    else if (move.captured) natural = 2 + PIECE_VALUE[move.captured] / 10;
    else if (move.piece === 'k') natural = 1;
    return (allowsMate ? 0 : 10) + natural;
  };

  // Highest score wins; ties keep chess.js move order, so the choice is deterministic.
  let best = replies[0];
  let bestScore = score(best);
  for (const move of replies.slice(1)) {
    const s = score(move);
    if (s > bestScore) {
      best = move;
      bestScore = s;
    }
  }
  chess.move(best);
  return { san: best.san, from: best.from, to: best.to, fen: chess.fen() };
}
