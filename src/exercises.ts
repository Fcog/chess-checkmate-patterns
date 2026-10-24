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
];
