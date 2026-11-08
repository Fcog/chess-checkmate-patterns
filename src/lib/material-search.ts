import { Chess, type Move, type PieceSymbol } from 'chess.js';

/**
 * A small material-only search, used by the tests to check tactic puzzles. There is no
 * engine in the app, so this is what proves a "win material" line works against every
 * defence, not just the one stored. Fine for puzzle-sized lines (a few plies); far too
 * slow and naive for playing chess.
 */

const VALUE: Record<PieceSymbol, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
const MATE = 1000;
/** How many plies of captures to follow after the fixed depth, so recaptures count. */
const QUIESCENCE_PLIES = 6;

/** Material balance from the point of view of the side to move. */
export function material(chess: Chess): number {
  const me = chess.turn();
  let sum = 0;
  for (const row of chess.board()) {
    for (const square of row) {
      if (square) sum += (square.color === me ? 1 : -1) * VALUE[square.type];
    }
  }
  return sum;
}

/** Captures, promotions and checks first, so alpha-beta cuts early. */
function orderedMoves(chess: Chess, capturesOnly: boolean): Move[] {
  const moves = chess.moves({ verbose: true });
  const list = capturesOnly ? moves.filter((m) => m.captured || m.promotion) : moves;
  const score = (m: Move) =>
    (m.captured ? 10 + VALUE[m.captured] * 10 - VALUE[m.piece] : 0) +
    (m.san.includes('+') ? 5 : 0) +
    (m.promotion ? 8 : 0);
  return list.sort((a, b) => score(b) - score(a));
}

function quiesce(chess: Chess, alpha: number, beta: number, plies: number): number {
  if (chess.isCheckmate()) return -MATE;
  if (chess.isStalemate() || chess.isInsufficientMaterial()) return 0;
  const inCheck = chess.inCheck();
  // Out of check, the side to move may also "stand pat" and make no capture.
  let best = inCheck ? -Infinity : material(chess);
  if (!inCheck) {
    if (best >= beta || plies <= 0) return best;
    if (best > alpha) alpha = best;
  }
  for (const move of orderedMoves(chess, !inCheck)) {
    chess.move(move);
    const value = -quiesce(chess, -beta, -alpha, plies - 1);
    chess.undo();
    if (value > best) best = value;
    if (value > alpha) alpha = value;
    if (alpha >= beta) break;
  }
  return best;
}

/** Negamax value for the side to move: `depth` plies of every move, then captures. */
function search(chess: Chess, depth: number, alpha: number, beta: number): number {
  // Quicker mates score higher.
  if (chess.isCheckmate()) return -MATE - depth;
  if (chess.isStalemate() || chess.isInsufficientMaterial()) return 0;
  if (depth <= 0) return quiesce(chess, alpha, beta, QUIESCENCE_PLIES);
  let best = -Infinity;
  for (const move of orderedMoves(chess, false)) {
    chess.move(move);
    const value = -search(chess, depth - 1, -beta, -alpha);
    chess.undo();
    if (value > best) best = value;
    if (value > alpha) alpha = value;
    if (alpha >= beta) break;
  }
  return best;
}

/** Hero's value after `san` is at least `target`? A null-window search, much cheaper than an exact value. */
function valueAtLeast(chess: Chess, plies: number, target: number): boolean {
  // The opponent's value is -hero's; hero >= target  <=>  opponent <= -target.
  return search(chess, plies, -target, -target + 1) <= -target;
}

/**
 * Material the side to move at `fen` gains by playing `san`, with best play for `plies`
 * more plies (then captures). Negative means the move loses material.
 */
export function gainAfter(fen: string, san: string, plies: number): number {
  const chess = new Chess(fen);
  const start = material(chess);
  chess.move(san);
  return -search(chess, plies, -Infinity, Infinity) - start;
}

/** Does `san` gain at least `gain` for the side to move at `fen`? */
export function gainsAtLeast(fen: string, san: string, plies: number, gain: number): boolean {
  const chess = new Chess(fen);
  const target = material(chess) + gain;
  chess.move(san);
  return valueAtLeast(chess, plies, target);
}

/**
 * Every move at `fen` that is as good as the best one for the side to move, searching
 * `plies` plies after it (then captures).
 */
export function bestMoves(fen: string, plies: number): string[] {
  const chess = new Chess(fen);
  // Best value first, with alpha-beta at the root…
  let best = -Infinity;
  for (const move of orderedMoves(chess, false)) {
    chess.move(move);
    const value = -search(chess, plies, -Infinity, -best);
    chess.undo();
    if (value > best) best = value;
  }
  // …then a cheap null-window test of each move against it.
  return chess.moves().filter((san) => {
    chess.move(san);
    const good = valueAtLeast(chess, plies, best);
    chess.undo();
    return good;
  });
}
