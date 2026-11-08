import type { MotifData } from '../../lib/motifs';

/**
 * Tactical motifs, grouped by how they work. Demos are stored with White to play. Demos
 * marked with a Lichess id come from the Lichess puzzle database (CC0).
 */
export const groups = ['Double attacks', 'Line tactics', 'Discoveries', 'Removing defenders'];

export const motifs: MotifData[] = [
  // ---------- Double attacks ----------
  {
    id: 'fork',
    name: 'Fork',
    group: 'Double attacks',
    intro:
      'One piece attacks two targets at once, and the opponent can only save one of them. ' +
      'Knights are the classic forking piece, but every piece can do it.',
    fen: 'r3kb2/3ppp2/8/1N6/5B2/8/8/6K1 w - - 0 1',
    solution: ['Nc7+', 'Kd8', 'Nxa8'],
    idea:
      'The knight checks the king and hits the rook in the same move. The king has to step ' +
      'aside, and the rook in the corner falls. A check is the strongest prong of a fork: the ' +
      'opponent has no time to save the other piece.',
    hint: 'Check with the knight from a square that also attacks the rook.',
  },
  // ---------- Line tactics ----------
  {
    id: 'pin',
    name: 'Pin',
    group: 'Line tactics',
    intro:
      'A piece can’t move because it would expose something more valuable behind it — often ' +
      'its own king. Pinned pieces can’t run, and often can’t defend either.',
    fen: '4k2r/3q1ppp/8/8/P7/8/5PPP/5BK1 w - - 0 1',
    solution: ['Bb5', 'Qxb5', 'axb5'],
    idea:
      'The bishop steps between the king and the queen. The queen can’t leave the diagonal ' +
      'without exposing the king, so the best it can do is take the bishop, and the pawn takes ' +
      'back. A pin against the king is absolute: the pinned piece may not move off the line at all.',
    hint: 'Black’s king and queen stand on the same diagonal. Put a defended piece between them.',
  },
  {
    id: 'skewer',
    name: 'Skewer',
    group: 'Line tactics',
    intro:
      'A pin in reverse: attack a valuable piece, and when it moves out of the way, take the ' +
      'piece standing behind it on the same line.',
    fen: '6q1/pp6/4k3/8/8/8/5PPP/5BK1 w - - 0 1',
    solution: ['Bc4+', 'Kd6', 'Bxg8'],
    idea:
      'The bishop checks the king along the diagonal. The king has to step aside, and that ' +
      'opens the line to the queen behind it. Skewers are strongest with a check, so the ' +
      'front piece has no choice.',
    hint: 'The king and the queen share a light diagonal. Check the king along it.',
  },
  // ---------- Discoveries ----------
  {
    id: 'discovered-attack',
    name: 'Discovered attack',
    group: 'Discoveries',
    intro:
      'Move one piece out of the way of another, and the piece behind attacks. If the moving ' +
      'piece makes a threat of its own, the opponent faces two at once.',
    fen: '3q2k1/p4pp1/8/8/8/3B4/5PPP/3R2K1 w - - 0 1',
    solution: ['Bh7+', 'Kxh7', 'Rxd8'],
    idea:
      'The bishop leaves the d-file with check, and the rook behind it now hits the queen. ' +
      'Black has to deal with the check first, so the queen falls. Giving up the bishop on h7 ' +
      'doesn’t matter: a queen is worth three of them.',
    hint: 'Your rook and Black’s queen are on the same file, with your bishop in between.',
  },
  {
    id: 'discovered-check',
    name: 'Discovered check',
    group: 'Discoveries',
    intro:
      'A discovered attack where the uncovered piece gives check. The moving piece is free to ' +
      'go anywhere, since the opponent must answer the check first.',
    // Lichess puzzle 8mayg
    fen: 'r7/pp4p1/3kbp1p/1P1N4/4P3/8/P1K3PP/3R4 w - - 4 33',
    solution: ['Nb6+', 'Kc5', 'Nxa8'],
    idea:
      'The knight jumps out of the rook’s way, and the rook on d1 checks the king. Black has ' +
      'to move the king, and the knight, now on b6, takes the rook in the corner.',
    hint: 'Your d1 rook is aimed at Black’s king. Where can the knight go to attack something?',
  },
  {
    id: 'double-check',
    name: 'Double check',
    group: 'Discoveries',
    intro:
      'A discovered check where the moving piece gives check too. Nothing can block two checks ' +
      'or capture two pieces at once, so the king has to move.',
    fen: '4k3/1q4pp/8/2P5/4N3/8/6PP/4R1K1 w - - 0 1',
    solution: ['Nd6+', 'Kd8', 'Nxb7+'],
    idea:
      'The knight checks from d6 and uncovers the rook’s check on the e-file. Black can’t take ' +
      'the knight or block, only move the king, and the knight on d6 also hits the queen on b7.',
    hint: 'Your rook and knight can both check the king at once. Which knight move also hits the queen?',
  },
  // ---------- Removing defenders ----------
  {
    id: 'deflection',
    name: 'Deflection',
    group: 'Removing defenders',
    intro:
      'Force a defending piece to leave its post, then take what it was guarding.',
    // Lichess puzzle OkMxb
    fen: '4kr2/1p6/3P2p1/7p/2P5/5R2/6K1/8 w - - 3 42',
    solution: ['d7+', 'Kxd7', 'Rxf8'],
    idea:
      'Black’s king is the only guard of the f8 rook. The pawn check drags the king to d7, ' +
      'and from there it no longer protects f8. A pawn for a rook.',
    hint: 'The f8 rook is guarded only by the king. Check the king with your pawn.',
  },
  {
    id: 'decoy',
    name: 'Decoy',
    group: 'Removing defenders',
    intro:
      'Also called attraction. Sacrifice to lure a piece — usually the king — onto a square ' +
      'where another tactic, such as a fork, hits it.',
    // Lichess puzzle dO7E0
    fen: '5rk1/7q/5pNQ/1p6/p3PP2/8/P5PK/8 w - - 3 40',
    solution: ['Qxh7+', 'Kxh7', 'Nxf8+'],
    idea:
      'The queens come off on h7, and Black’s king has to recapture there. On h7 the king ' +
      'stands a knight’s jump from f8, so the knight takes the rook with check.',
    hint: 'On h7 Black’s king would be a knight’s jump from the f8 rook.',
  },
  {
    id: 'removing-the-guard',
    name: 'Removing the guard',
    group: 'Removing defenders',
    intro:
      'Capture or trade off the piece that defends something, then take the piece it was ' +
      'protecting.',
    // Lichess puzzle gRRoo
    fen: '5r1k/pp5p/2pq1r2/4Q2p/6P1/1B3R1P/PP3P2/5K2 w - - 1 33',
    solution: ['Qxd6', 'Rxd6', 'Rxf8+'],
    idea:
      'The f8 rook has two guards: the queen and the f6 rook. Trading queens on d6 forces the ' +
      'f6 rook to recapture, and with both guards gone the f3 rook takes on f8 with check.',
    hint: 'Count the guards of the f8 rook, then trade one of them off.',
  },
];
