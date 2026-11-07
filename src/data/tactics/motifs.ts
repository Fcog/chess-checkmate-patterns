import type { MotifData } from '../../lib/motifs';

/** Tactical motifs, grouped by how they work. Demos are stored with White to play. */
export const groups = ['Double attacks'];

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
];
