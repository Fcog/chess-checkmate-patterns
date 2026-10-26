export type Exercise = {
  id: string;
  patternId: string;
  fen: string;
  solution: string[];
  hint?: string;
};

/** Checkmate patterns currently available in the Practice section filter. */
export const practicePatternIds: string[] = ['back-rank', 'anastasia'];

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
  {
    id: 'anastasia-1',
    patternId: 'anastasia',
    fen: 'k2r3r/pppN1pp1/3n3q/1P6/Q3R1P1/2P4p/P4P1P/R5K1 w - - 0 1',
    solution: ['Qxa7+', 'Kxa7', 'Ra4#'],
    hint: 'Sacrifice the queen on a7 to open the a-file while the knight on d7 controls b8 and b6.',
  },
  {
    id: 'anastasia-2',
    patternId: 'anastasia',
    fen: '5r2/1k3p2/p2qp3/1p4Q1/3P1n2/8/5PPP/R4RK1 b - - 0 1',
    solution: ['Ne2+', 'Kh1', 'Qxh2+', 'Kxh2', 'Rh8+', 'Qh5', 'Rxh5#'],
    hint: 'Check with the knight to take g1 and g3, then sacrifice the queen to open the h-file.',
  },
  {
    id: 'anastasia-3',
    patternId: 'anastasia',
    fen: '2br1r2/5Rbk/1q2P1p1/5P2/P6N/1P6/2P3P1/4K2Q w - - 0 1',
    solution: ['Nxg6+', 'Kg8', 'Ne7#'],
    hint: 'The queen already owns the h-file. Use the knight to drive the king off it.',
  },
  {
    id: 'anastasia-4',
    patternId: 'anastasia',
    fen: '1k2r2r/p1p2pb1/Bpp2Nb1/4B3/4p2q/6pP/5QP1/R6K w - - 0 1',
    solution: ['Qxb6+', 'axb6', 'Nd7+', 'Ka7', 'Bc8#'],
    hint: 'Sacrifice the queen to open the a-file, then let the knight and bishop clear the way for the rook.',
  },
  {
    id: 'anastasia-5',
    patternId: 'anastasia',
    fen: '1r3rk1/5ppp/8/q1p2N2/2Bp1N2/1p4P1/PP3PP1/K2RR3 w - - 0 1',
    solution: ['Ne7+', 'Kh8', 'Nfg6+', 'fxg6', 'Nxg6+', 'hxg6', 'Rh1#'],
    hint: 'Drive the king into the corner, then give up both knights to rip open the h-file.',
  },
];
