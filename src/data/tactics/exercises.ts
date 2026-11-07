import type { ExerciseData } from '../../lib/exercises';

/** Tactical motifs currently available in the Practice section filter. */
export const practiceIds: string[] = ['fork'];

/** Practice exercises. Each line ends on the move that wins the material. */
export const exercises: ExerciseData[] = [
  {
    id: 'fork-1',
    motifId: 'fork',
    fen: '2q2rk1/5ppp/8/3N4/8/8/5PPP/6K1 w - - 0 1',
    solution: ['Ne7+', 'Kh8', 'Nxc8'],
    hint: 'Black’s king and queen are a knight’s jump apart from the same square.',
  },
  {
    id: 'fork-2',
    motifId: 'fork',
    fen: 'r4bk1/6pp/8/8/8/8/5PPP/3Q2K1 w - - 0 1',
    solution: ['Qd5+', 'Kh8', 'Qxa8'],
    hint: 'The a8 rook and the g8 king share a light square on the long diagonals.',
  },
  {
    id: 'fork-3',
    motifId: 'fork',
    fen: '6k1/R3bppp/8/8/8/8/6PP/5BK1 b - - 0 1',
    solution: ['Bc5+', 'Kh1', 'Bxa7'],
    hint: 'One diagonal leads to the king, the other to the rook. Find where they cross.',
  },
  {
    id: 'fork-4',
    motifId: 'fork',
    fen: '6k1/5ppp/8/8/3n4/8/5PPP/2Q2RK1 b - - 0 1',
    solution: ['Ne2+', 'Kh1', 'Nxc1'],
    hint: 'White’s king is boxed in by its own pawns and rook. A knight check hits more than the king.',
  },
  {
    id: 'fork-5',
    motifId: 'fork',
    fen: '3q2k1/5ppp/8/8/8/8/6PP/R4BK1 b - - 0 1',
    solution: ['Qd4+', 'Kh1', 'Qxa1'],
    hint: 'The a1 rook is undefended. Which check also lines up with it?',
  },
];
