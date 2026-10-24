export type Exercise = {
  id: string;
  patternId: string;
  fen: string;
  solution: string[];
  hint?: string;
};

/** Checkmate patterns currently available in the Practice section filter. */
export const practicePatternIds: string[] = ['back-rank'];

/** Practice exercises. */
export const exercises: Exercise[] = [
  {
    id: 'back-rank-1',
    patternId: 'back-rank',
    fen: '4rrk1/ppp2ppp/8/3p2q1/3P2b1/2PB2P1/PP3QP1/4RRK1 w - - 0 1',
    solution: ['Qxf7+', 'Rxf7', 'Rxe8+', 'Rf8', 'Rexf8#'],
    hint: 'Eliminate the defenders of the back rank starting with a sacrifice on f7.',
  },
  {
    id: 'back-rank-2',
    patternId: 'back-rank',
    fen: '4rbk1/3Q1ppp/3p4/3P4/3q4/B7/P5PP/5R1K b - - 0 1',
    solution: ['Qf2', 'Rg1', 'Re1', 'Rxe1', 'Qxe1#'],
    hint: 'Attack the rook on f1 and overload the first rank.',
  },
  {
    id: 'back-rank-3',
    patternId: 'back-rank',
    fen: '4rrk1/2Q2Rpp/2p5/p7/3q4/8/2P3PP/5R1K w - - 0 1',
    solution: ['Qe7', 'Rxe7', 'Rxf8#'],
    hint: 'Interfere with the e8 rook and deflect it from defending f8.',
  },
  {
    id: 'back-rank-4',
    patternId: 'back-rank',
    fen: '5rk1/QR4p1/4p2p/4N3/p3Pn2/q6r/5PP1/4R1K1 b - - 0 1',
    solution: ['Ne2+', 'Kf1', 'Ng3+', 'Kg1', 'Rh1#'],
    hint: 'Use the knight to check and clear the h-file for the rook on h3.',
  },
  {
    id: 'back-rank-5',
    patternId: 'back-rank',
    fen: '4k3/p3np2/1p2p3/3pP1QP/5P2/P2q4/2r3PR/4R1K1 b - - 0 1',
    solution: ['Qd4+', 'Kh1', 'Qe3', 'Qh4', 'Rc1', 'Rxc1', 'Qxc1+', 'Qe1', 'Qxe1#'],
    hint: 'Force the king into the corner with a check, then attack the e1 rook to invade the first rank.',
  },
];
