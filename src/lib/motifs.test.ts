import { describe, expect, it } from 'vitest';
import { Chess, validateFen } from 'chess.js';
import { exercises, practiceMotifIds, type Exercise } from './exercises';
import {
  motifById,
  motifs,
  movesToFind,
  nextMotifIndex,
  taskBadge,
  taskLabel,
  taskPrompt,
  type Motif,
} from './motifs';
import { topicById, topics } from './topics';

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

const VALUE: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

/** Material of White minus Black. */
function balance(chess: Chess): number {
  return chess
    .board()
    .flat()
    .reduce((sum, sq) => (sq ? sum + (sq.color === 'w' ? 1 : -1) * VALUE[sq.type] : sum), 0);
}

/** Plays `line` from `fen`, checking every move is legal. Returns the final position. */
function playLine(fen: string, line: string[]): Chess {
  const chess = new Chess(fen);
  line.forEach((san, ply) => {
    expect(chess.moves(), `ply ${ply} (${san})`).toContain(san);
    chess.move(san);
  });
  return chess;
}

/** What a line achieves for the side to move at `fen`: checkmate, or the material it wins. */
function expectGoalReached(puzzle: { fen: string; goal: Motif['goal'] }, line: string[]) {
  const start = new Chess(puzzle.fen);
  const hero = start.turn() === 'w' ? 1 : -1;
  const end = playLine(puzzle.fen, line);
  if (puzzle.goal.kind === 'mate') {
    expect(end.isCheckmate()).toBe(true);
  } else {
    // A minor piece or more, net of what the defender took back on the way.
    expect(hero * (balance(end) - balance(start))).toBeGreaterThanOrEqual(3);
    expect(end.history({ verbose: true }).at(-1)?.captured, 'ends on a capture').toBeTruthy();
  }
}

/**
 * Odd plies are played for the defender, so each must be its only legal move — otherwise
 * the app would be inventing a defence the position does not require.
 */
function expectForcedReplies(fen: string, line: string[]) {
  const chess = new Chess(fen);
  line.forEach((san, ply) => {
    if (ply % 2 === 1) expect(chess.moves(), `defender reply at ply ${ply}`).toEqual([san]);
    chess.move(san);
  });
}

describe('motif library', () => {
  it('has no duplicate ids, across motifs and exercises', () => {
    // Solved progress is one list of ids, so they must not clash between topics.
    const ids = [...motifs.map((m) => m.id), ...exercises.map((ex) => ex.id)];
    expect(ids).toEqual([...new Set(ids)]);
  });

  it('has no motif called "practice", which is the URL of each topic\'s practice page', () => {
    expect(motifs.map((m) => m.id)).not.toContain('practice');
  });

  it('has no duplicate names', () => {
    const names = motifs.map((m) => m.name);
    expect(names).toEqual([...new Set(names)]);
  });

  it('only uses groups declared by the topic', () => {
    for (const motif of motifs) expect(topicById(motif.topic).groups).toContain(motif.group);
  });

  it('groups every topic and group contiguously, so the sidebar order matches the array order', () => {
    const seen = motifs
      .map((m) => `${m.topic}/${m.group}`)
      .filter((key, i, all) => key !== all[i - 1]);
    expect(seen).toEqual([...new Set(seen)]);
  });

  it('has at least one motif in every topic', () => {
    for (const topic of topics) expect(motifs.some((m) => m.topic === topic.id)).toBe(true);
  });
});

describe('task texts', () => {
  const mate = motifById('epaulette')!;
  const fork = motifById('fork')!;

  it('describe a mate', () => {
    expect(taskLabel(mate)).toBe('Mate in 1');
    expect(taskBadge(mate)).toBe('M1');
    expect(taskPrompt(mate, 'white')).toBe('Find the mate in 1 for white.');
  });

  it('describe a tactic', () => {
    expect(taskLabel(fork)).toBe('Win material');
    expect(taskBadge(fork)).toBe('2 mv');
    expect(taskPrompt(fork, 'black')).toBe('Black to play and win material.');
  });
});

describe.each(motifs.map((m): [string, Motif] => [m.name, m]))('%s', (_name, motif) => {
  it('has a legal FEN', () => {
    expect(validateFen(motif.fen).ok).toBe(true);
  });

  it('starts with White to move and neither side in check', () => {
    // Demos are mirrored for Black in Practice, so they are stored from White's side.
    expect(new Chess(motif.fen).turn()).toBe('w');
    expect(inCheck(motif.fen, 'w'), 'hero is in check').toBe(false);
    expect(inCheck(motif.fen, 'b'), 'defender is already in check').toBe(false);
  });

  it('describes itself', () => {
    expect(motif.intro.length).toBeGreaterThan(20);
    expect(motif.idea.length).toBeGreaterThan(20);
    expect(motif.hint.length).toBeGreaterThan(10);
  });

  it('ends the line on a move by the hero', () => {
    expect(motif.solution.length % 2).toBe(1);
    expect(movesToFind(motif)).toBe((motif.solution.length + 1) / 2);
  });

  it('plays out legally and reaches its goal', () => {
    expectGoalReached(motif, motif.solution);
  });

  it('only auto-plays defender replies that are forced', () => {
    expectForcedReplies(motif.fen, motif.solution);
  });

  it.runIf(motif.goal.kind === 'mate')('has exactly one move that forces the mate', () => {
    // Uniqueness is what lets the app tell the player their move was wrong.
    expect(forcingMoves(motif.fen, movesToFind(motif))).toEqual([motif.solution[0]]);
  });
});

describe.each(exercises.map((ex): [string, Exercise] => [ex.id, ex]))('exercise %s', (_id, ex) => {
  it('references a valid motif', () => {
    expect(motifById(ex.motifId)?.topic).toBe(ex.topic);
  });

  it('has a legal FEN and starts with neither side in check', () => {
    expect(validateFen(ex.fen).ok).toBe(true);
    const hero = new Chess(ex.fen).turn();
    const defender = hero === 'w' ? 'b' : 'w';
    expect(inCheck(ex.fen, hero)).toBe(false);
    expect(inCheck(ex.fen, defender)).toBe(false);
  });

  it.each(ex.alternatives ?? [])('has a valid alternative line %#', (...line) => {
    expect(line).toHaveLength(ex.solution.length);
    expect(line).not.toEqual(ex.solution);
    expectGoalReached(ex, line);
  });

  it('plays out legally and reaches its goal', () => {
    expect(ex.solution.length % 2).toBe(1);
    expectGoalReached(ex, ex.solution);
  });

  it.runIf(ex.goal.kind === 'line')('only auto-plays forced defender replies', () => {
    // Mate exercises may pick the main defence; a tactic's line must not be dodgeable.
    expectForcedReplies(ex.fen, ex.solution);
  });
});

describe('practice filters', () => {
  it('has a filter for every motif that has exercises, and no empty filters', () => {
    const used = [...new Set(exercises.map((ex) => ex.motifId))].sort();
    expect([...practiceMotifIds].sort()).toEqual(used);
  });
});

describe('nextMotifIndex', () => {
  const list = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];

  it('goes to the next pattern when nothing is solved', () => {
    expect(nextMotifIndex(list, 0, [])).toBe(1);
  });

  it('skips patterns that are already solved', () => {
    expect(nextMotifIndex(list, 0, ['b', 'c'])).toBe(3);
  });

  it('wraps round to the start of the list', () => {
    expect(nextMotifIndex(list, 2, ['d'])).toBe(0);
  });

  it('ignores whether the current pattern is solved', () => {
    expect(nextMotifIndex(list, 1, ['b'])).toBe(2);
  });

  it('falls back to the next pattern when everything is solved', () => {
    expect(nextMotifIndex(list, 3, ['a', 'b', 'c', 'd'])).toBe(0);
    expect(nextMotifIndex(list, 1, ['a', 'b', 'c', 'd'])).toBe(2);
  });
});
