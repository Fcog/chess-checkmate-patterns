export type Exercise = {
  id: string;
  patternId: string;
  fen: string;
  solution: string[];
  hint?: string;
};

/** Checkmate patterns currently available in the Practice section filter. */
export const practicePatternIds: string[] = ['back-rank', 'anastasia', 'railroad', 'max-lange', 'damiano'];

/** Practice exercises. */
export const exercises: Exercise[] = [
  {
    id: 'back-rank-1',
    patternId: 'back-rank',
    fen: '4rrk1/ppp2ppp/8/3p2q1/3P2b1/2PB2P1/PP3QP1/4RRK1 w - - 0 1',
    solution: ['Qxf7+', 'Rxf7', 'Rxe8+', 'Rf8', 'Rexf8#'],
    hint: 'Black\'s back rank is held only by the two rooks. Can you overload them?',
  },
  {
    id: 'back-rank-2',
    patternId: 'back-rank',
    fen: '4rbk1/3Q1ppp/3p4/3P4/3q4/B7/P5PP/5R1K b - - 0 1',
    solution: ['Qf2', 'Rg1', 'Re1', 'Rxe1', 'Qxe1#'],
    hint: 'White\'s king has no escape square, and only the f1 rook guards the first rank. How can you overload it?',
  },
  {
    id: 'back-rank-3',
    patternId: 'back-rank',
    fen: '4rrk1/2Q2Rpp/2p5/p7/3q4/8/2P3PP/5R1K w - - 0 1',
    solution: ['Qe7', 'Rxe7', 'Rxf8#'],
    hint: 'The f8 rook depends on the e8 rook for protection. Can you cut them off from each other?',
  },
  {
    id: 'back-rank-4',
    patternId: 'back-rank',
    fen: '5rk1/QR4p1/4p2p/4N3/p3Pn2/q6r/5PP1/4R1K1 b - - 0 1',
    solution: ['Ne2+', 'Kf1', 'Ng3+', 'Kg1', 'Rh1#'],
    hint: 'The rook on h3 is aiming at h1, but the king guards that square. Your knight can change that with tempo.',
  },
  {
    id: 'back-rank-5',
    patternId: 'back-rank',
    fen: '4k3/p3np2/1p2p3/3pP1QP/5P2/P2q4/2r3PR/4R1K1 b - - 0 1',
    solution: ['Qd4+', 'Kh1', 'Qe3', 'Qh4', 'Rc1', 'Rxc1', 'Qxc1+', 'Qe1', 'Qxe1#'],
    hint: 'White\'s first rank is guarded only by the e1 rook. Use checks and threats to give it too much work.',
  },
  {
    id: 'anastasia-1',
    patternId: 'anastasia',
    fen: 'k2r3r/pppN1pp1/3n3q/1P6/Q3R1P1/2P4p/P4P1P/R5K1 w - - 0 1',
    solution: ['Qxa7+', 'Kxa7', 'Ra4#'],
    hint: 'The knight on d7 already boxes in the king. Which file would finish the job if it were open?',
  },
  {
    id: 'anastasia-2',
    patternId: 'anastasia',
    fen: '5r2/1k3p2/p2qp3/1p4Q1/3P1n2/8/5PPP/R4RK1 b - - 0 1',
    solution: ['Ne2+', 'Kh1', 'Qxh2+', 'Kxh2', 'Rh8+', 'Qh5', 'Rxh5#'],
    hint: 'Knight checks can take squares away from the king. Then think about what the f8 rook could do on an open h-file.',
  },
  {
    id: 'anastasia-3',
    patternId: 'anastasia',
    fen: '2br1r2/5Rbk/1q2P1p1/5P2/P6N/1P6/2P3P1/4K2Q w - - 0 1',
    solution: ['Nxg6+', 'Kg8', 'Ne7#'],
    hint: 'Your queen already owns the h-file. The g6 pawn is the only thing shielding the king.',
  },
  {
    id: 'anastasia-4',
    patternId: 'anastasia',
    fen: '1k2r2r/p1p2pb1/Bpp2Nb1/4B3/4p2q/6pP/5QP1/R6K w - - 0 1',
    solution: ['Qxb6+', 'axb6', 'Nd7+', 'Ka7', 'Bc8#'],
    hint: 'Your a1 rook is waiting behind your own bishop. Break open the king\'s shelter and the rook will do the rest.',
  },
  {
    id: 'anastasia-5',
    patternId: 'anastasia',
    fen: '1r3rk1/5ppp/8/q1p2N2/2Bp1N2/1p4P1/PP3PP1/K2RR3 w - - 0 1',
    solution: ['Ne7+', 'Kh8', 'Nfg6+', 'fxg6', 'Nxg6+', 'hxg6', 'Rh1#'],
    hint: 'Both knights are close to the king. If the h-file were open, a rook could get there in one move.',
  },
  {
    id: 'anastasia-6',
    patternId: 'anastasia',
    fen: '2k3r1/ppp5/3q4/PP3pnp/3Pp3/4P2P/2Q2PP1/2R2RK1 b - - 0 1',
    solution: ['Nf3+', 'Kh1', 'Qh2#'],
    hint: 'White\'s kingside dark squares are weak. Your queen and knight work well together near h2.',
  },
  {
    id: 'railroad-1',
    patternId: 'railroad',
    fen: 'r1b4R/2q1b1p1/p3pkP1/4p3/1p2P3/5P2/PPP3Q1/K7 w - - 0 1',
    solution: ['Rh5', 'Qxc2', 'Qg5#'],
    hint: 'Your queen wants a square right next to the king, but she needs support. Look for a quiet rook move.',
  },
  {
    id: 'max-lange-1',
    patternId: 'max-lange',
    fen: '3r3r/8/k7/p3p2q/1p3p2/6P1/2Q2PBP/6K1 w - - 0 1',
    solution: ['Qc6+', 'Ka7', 'Qb7#'],
    hint: 'Your bishop on g2 reaches all the way to the queenside. Can the queen work with it?',
  },
  {
    id: 'damiano-1',
    patternId: 'damiano',
    fen: '1k5r/p4p2/1p1Pp3/2Nq4/1P3Pp1/P5Pp/8/4RQK1 b - - 0 1',
    solution: ['h2+', 'Kf2', 'Qf3#'],
    hint: 'Your pawns on g4 and h3 are close to the king. A pawn check could take away a key escape square.',
  },
  {
    id: 'damiano-2',
    patternId: 'damiano',
    fen: '2r2rk1/6p1/2q3P1/5p2/8/5P2/PPP5/2K2QNR w - - 0 1"',
    solution: ['Rh8+', 'Kxh8', 'Qh3+', 'Kg8', 'Qh7#'],
    hint: 'The pawn on g6 already guards a key square next to the king. What would it take to get your queen there?',
  },
  {
    id: 'damiano-3',
    patternId: 'damiano',
    fen: '3r1r2/5p1k/5Pp1/4p2P/1p6/pPqB4/P1P5/1K3QNR w - - 0 1',
    solution: ['hxg6+', 'Kg8', 'Rh8+', 'Kxh8', 'Qh3+', 'Kg8', 'Qh7#'],
    hint: 'Your h5 pawn can break open the king\'s shelter. Then think about how to get your queen onto the h-file.',
  },
  {
    id: 'damiano-4',
    patternId: 'damiano',
    fen: 'bq4k1/6p1/r4pP1/4pP1P/1pp1n3/5N2/1PK3B1/2QR3R b - - 0 1',
    solution: ['b3+', 'Kb1', 'Ra1+', 'Kxa1', 'Qa7+', 'Kb1', 'Qa2#'],
    hint: 'Your queenside pawns are close to White\'s king. Could one of them support your queen on a square right next to it?',
  },
  {
    id: 'damiano-5',
    patternId: 'damiano',
    fen: '2r1kb2/1p5q/p1npp3/1P3ppn/P1PP3p/3NPP2/1B1NQ1PP/2R2R1K b - - 0 1',
    solution: ['Ng3+', 'hxg3', 'hxg3+', 'Kg1', 'Qh2#'],
    hint: 'Your queen is already lined up on the h-file, with only a few pieces in her way. Look for a way to clear it.',
  },
  {
    id: 'damiano-6',
    patternId: 'damiano',
    fen: '3r1rk1/1p3pp1/1qp3P1/2nnp3/p7/3B1P2/PPP3P1/1K1QR2R w - - 0 1',
    solution: ['Rh8+', 'Kxh8', 'Rh1+', 'Kg8', 'Rh8+', 'Kxh8', 'Qh1+', 'Kg8', 'Qh7#'],
    hint: 'Your rooks and queen can all reach the h-file. Which square next to the king is already covered for you?',
  },
  {
    id: 'max-lange-2',
    patternId: 'max-lange',
    fen: 'r1b1nrk1/pp3pp1/2n5/2Pp2q1/1P1B4/P2Bp3/1Q6/2K4R w - - 0 1',
    solution: ['Rh8+', 'Kxh8', 'Qh2+', 'Bh3', 'Qxh3+', 'Qh6', 'Qxh6+', 'Kg8', 'Qh7#'],
    hint: 'Your bishop on d3 is aimed at h7. The h-file is the road there, even if it costs material to open.',
  },
];
