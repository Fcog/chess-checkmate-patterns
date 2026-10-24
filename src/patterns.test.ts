import { describe, expect, it } from 'vitest';
import { Chess, validateFen } from 'chess.js';
import { exercises, type Exercise } from './exercises';
import { families, mateIn, patterns, type Pattern } from './patterns';

/**
 * Can the side to move force mate within `moves` of its own moves, starting with `san`?
 * The defender is given every legal reply, so this is a real forced-mate check rather
 * than "the defender cooperates".
 */
function forcesMateAfter(fen: string, san: string, moves: number): boolean {
  const after = new Chess(fen);
  after.move(san);
  if (after.isCheckmate()) return true;
  if (moves <= 1 || after.isGameOver()) return false;
  return after.moves().every((reply) => {
    const next = new Chess(after.fen());
    next.move(reply);
    return next.moves().some((follow) => forcesMateAfter(next.fen(), follow, moves - 1));
  });
}

/** Every move for the side to move that forces mate within `moves` moves. */
function forcingMoves(fen: string, moves: number): string[] {
  return new Chess(fen).moves().filter((san) => forcesMateAfter(fen, san, moves));
}

/**
 * Is `color` in check in this position? `Chess.inCheck()` only answers for the side to
 * move, so testing the defender means loading the position with the turn flipped.
 */
function inCheck(fen: string, color: 'w' | 'b'): boolean {
  const parts = fen.split(' ');
  parts[1] = color;
  parts[3] = '-'; // an en passant square may not be valid for the other side
  return new Chess(parts.join(' ')).inCheck();
}

describe('pattern library', () => {
  it('has no duplicate ids', () => {
    const ids = patterns.map((p) => p.id);
    expect(ids).toEqual([...new Set(ids)]);
  });

  it('has no duplicate names', () => {
    const names = patterns.map((p) => p.name);
    expect(names).toEqual([...new Set(names)]);
  });

  it('only uses declared families', () => {
    for (const pattern of patterns) expect(families).toContain(pattern.family);
  });

  it('groups every family contiguously, so the sidebar order matches the array order', () => {
    const seen = patterns.map((p) => p.family).filter((f, i, all) => f !== all[i - 1]);
    expect(seen).toEqual([...new Set(seen)]);
  });
});

describe.each(patterns.map((p): [string, Pattern] => [p.name, p]))('%s', (_name, pattern) => {
  it('has a legal FEN', () => {
    expect(validateFen(pattern.fen).ok).toBe(true);
  });

  it('starts with neither side in check', () => {
    // The mating side in check would mean solving your own problem first; the defender
    // in check would mean the position could never have arisen.
    const hero = new Chess(pattern.fen).turn();
    const defender = hero === 'w' ? 'b' : 'w';
    expect(inCheck(pattern.fen, hero), 'mating side is in check').toBe(false);
    expect(inCheck(pattern.fen, defender), 'defender is already in check').toBe(false);
  });

  it('describes itself', () => {
    expect(pattern.idea.length).toBeGreaterThan(20);
    expect(pattern.hint.length).toBeGreaterThan(10);
  });

  it('ends the line on a move by the mating side', () => {
    expect(pattern.solution.length % 2).toBe(1);
    expect(mateIn(pattern)).toBe((pattern.solution.length + 1) / 2);
  });

  it('plays out legally and ends in checkmate', () => {
    const chess = new Chess(pattern.fen);
    pattern.solution.forEach((san, ply) => {
      expect(chess.moves(), `ply ${ply} (${san})`).toContain(san);
      chess.move(san);
    });
    expect(chess.isCheckmate()).toBe(true);
  });

  it('only auto-plays defender replies that are forced', () => {
    // Odd plies are played for the defender, so each must be its only legal move —
    // otherwise the app would be inventing a defence the position does not require.
    const chess = new Chess(pattern.fen);
    pattern.solution.forEach((san, ply) => {
      if (ply % 2 === 1) {
        expect(chess.moves(), `defender reply at ply ${ply}`).toEqual([san]);
      }
      chess.move(san);
    });
  });

  it('has exactly one move that forces the mate', () => {
    // Uniqueness is what lets the app tell the player their move was wrong.
    expect(forcingMoves(pattern.fen, mateIn(pattern))).toEqual([pattern.solution[0]]);
  });
});

describe.each(exercises.map((ex): [string, Exercise] => [ex.id, ex]))('exercise %s', (_id, ex) => {
  it('references a valid patternId', () => {
    expect(patterns.some((p) => p.id === ex.patternId)).toBe(true);
  });

  it('has a legal FEN and starts with neither side in check', () => {
    expect(validateFen(ex.fen).ok).toBe(true);
    const hero = new Chess(ex.fen).turn();
    const defender = hero === 'w' ? 'b' : 'w';
    expect(inCheck(ex.fen, hero)).toBe(false);
    expect(inCheck(ex.fen, defender)).toBe(false);
  });

  it('plays out legally and ends in checkmate', () => {
    expect(ex.solution.length % 2).toBe(1);
    const chess = new Chess(ex.fen);
    ex.solution.forEach((san, ply) => {
      expect(chess.moves(), `ply ${ply} (${san})`).toContain(san);
      chess.move(san);
    });
    expect(chess.isCheckmate()).toBe(true);
  });
});
