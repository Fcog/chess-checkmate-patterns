import type { ExerciseData } from '../../lib/exercises';

/** Tactical motifs currently available in the Practice section filter. */
export const practiceIds: string[] = [
  'fork',
  'pin',
  'skewer',
  'discovered-attack',
  'discovered-check',
  'double-check',
  'deflection',
  'decoy',
  'removing-the-guard',
];

/**
 * Practice exercises. Each line ends on the move that wins the material. Exercises marked
 * with a Lichess id come from the Lichess puzzle database (CC0); the tests check every
 * line with a material search (src/lib/material-search.ts).
 */
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
  {
    // Lichess puzzle hUL3N
    id: 'pin-1',
    motifId: 'pin',
    fen: '8/1p3k1p/3r2p1/2Qq1p2/1P2p3/6PP/4BP1K/8 w - - 0 43',
    solution: ['Bc4', 'Qxc4', 'Qxc4+'],
    hint: 'Black’s king and queen are on the same light diagonal. Put a defended piece between them.',
  },
  {
    // Lichess puzzle Zlwzu
    id: 'pin-2',
    motifId: 'pin',
    fen: '6rk/p3Q1p1/6r1/5b2/4p3/2B2qP1/PPP2P2/5RK1 w - - 3 28',
    solution: ['Qh4+', 'Rh6', 'Qxh6+'],
    hint: 'Black’s g7 pawn can’t move: your c3 bishop pins it to the king.',
  },
  {
    // Lichess puzzle xt1Bx
    id: 'pin-3',
    motifId: 'pin',
    fen: '2r5/p4pR1/4k1b1/3p3p/3B1R1P/r7/4KP2/8 w - - 4 29',
    solution: ['Rf6+', 'Kd7', 'Rfxg6'],
    hint: 'Drive the king onto the 7th rank, and the f7 pawn can no longer defend g6.',
  },
  {
    // Lichess puzzle fYZcS
    id: 'pin-4',
    motifId: 'pin',
    fen: '5k2/p3rppp/1b1Q4/3R4/4r1b1/P5K1/R1P2P1P/8 b - - 3 33',
    solution: ['Bc7', 'Qxc7', 'Rxc7'],
    hint: 'White’s queen and king share a dark diagonal. Step onto it with a defended piece.',
  },
  {
    // Lichess puzzle GVxOu
    id: 'pin-5',
    motifId: 'pin',
    fen: '2r5/5p1k/8/p5B1/2P5/5b2/P4P2/2R3K1 b - - 0 35',
    solution: ['Rg8', 'Rc3', 'Rxg5+'],
    hint: 'White’s g5 bishop and king are on the same file.',
  },
  {
    // Lichess puzzle 141wP
    id: 'skewer-1',
    motifId: 'skewer',
    fen: '7r/R4pp1/1p2k3/1B2p3/1P2n1n1/2r2N1p/P4PP1/5RK1 w - - 0 32',
    solution: ['Bd7+', 'Kf6', 'Bxg4'],
    hint: 'Black’s king and the g4 knight are on the same light diagonal.',
  },
  {
    // Lichess puzzle lecwb
    id: 'skewer-2',
    motifId: 'skewer',
    fen: '1r6/1P3r2/1R6/5k2/1R4p1/4p1K1/8/8 w - - 0 57',
    solution: ['Rf4+', 'Ke5', 'Rxf7'],
    hint: 'Black’s king and the f7 rook share a file.',
  },
  {
    // Lichess puzzle TxBaO
    id: 'skewer-3',
    motifId: 'skewer',
    fen: '2k5/pp4Q1/2p5/P1PpKP2/1P4P1/7q/8/8 b - - 5 57',
    solution: ['Qc3+', 'Kf4', 'Qxg7'],
    hint: 'White’s king stands on the diagonal between your queen and the g7 queen.',
  },
  {
    // Lichess puzzle Ipsq8
    id: 'skewer-4',
    motifId: 'skewer',
    fen: 'Q7/p2pk3/4p3/1P6/8/5KP1/P4P2/4q3 b - - 4 34',
    solution: ['Qh1+', 'Ke3', 'Qxa8'],
    hint: 'White’s king and queen both stand on the long light diagonal.',
  },
  {
    // Lichess puzzle 91ZxU
    id: 'skewer-5',
    motifId: 'skewer',
    fen: '8/8/6R1/4r3/p4kPP/2PK4/r7/3R4 b - - 0 36',
    solution: ['Rd5+', 'Kc4', 'Rxd1'],
    hint: 'White’s king and the d1 rook are lined up on one file.',
  },
  {
    // Lichess puzzle bVCod
    id: 'discovered-attack-1',
    motifId: 'discovered-attack',
    fen: '2r3k1/p4p2/3q2p1/8/3p2P1/P2Qr2P/1P6/3R1RK1 w - - 7 37',
    solution: ['Qxe3', 'dxe3', 'Rxd6'],
    hint: 'Black’s queen is on your rook’s file. Clear the file with a capture that has to be answered.',
  },
  {
    // Lichess puzzle Ikll5
    id: 'discovered-attack-2',
    motifId: 'discovered-attack',
    fen: '5rk1/p1r2ppp/1p2p1q1/8/3p1PP1/6Q1/PPP4R/1K4R1 w - - 3 23',
    solution: ['f5', 'exf5', 'Qxc7'],
    hint: 'Your g3 queen would hit c7 if the f4 pawn moved — with a threat of its own.',
  },
  {
    // Lichess puzzle KsWDZ
    id: 'discovered-attack-3',
    motifId: 'discovered-attack',
    fen: '2B5/2b2kpp/8/ppr5/8/1P2P2P/P4PP1/R5K1 b - - 0 24',
    solution: ['Be5', 'Rd1', 'Rxc8'],
    hint: 'Your c5 rook would attack the c8 bishop if your own bishop moved out of the way with a threat.',
  },
  {
    // Lichess puzzle uBw2i
    id: 'discovered-attack-4',
    motifId: 'discovered-attack',
    fen: '8/p4pk1/1b3p2/2q5/P7/1P1RBPPp/4P2P/R4K2 b - - 2 30',
    solution: ['Qe5', 'Rad1', 'Bxe3'],
    hint: 'Your queen blocks your bishop’s diagonal to e3. Move it with a threat of its own.',
  },
  {
    // Lichess puzzle fA1il
    id: 'discovered-attack-5',
    motifId: 'discovered-attack',
    fen: '1r1q2k1/6pp/3p1bn1/3Pp3/2P2p2/3Q1N1P/3B1PP1/R5K1 b - - 0 28',
    solution: ['e4', 'Qxe4', 'Bxa1'],
    hint: 'Your f6 bishop is aimed at a1, but your own e5 pawn is in the way.',
  },
  {
    // Lichess puzzle d1rFi
    id: 'discovered-check-1',
    motifId: 'discovered-check',
    fen: '8/3b1p2/pb2p1nk/1p1p3p/3P1N1P/P3BP1K/1P2B3/8 w - - 4 43',
    solution: ['Nxd5+', 'Kg7', 'Nxb6'],
    hint: 'Your e3 bishop is aimed at Black’s king, with your own knight in between.',
  },
  {
    // Lichess puzzle qjc7j
    id: 'discovered-check-2',
    motifId: 'discovered-check',
    fen: '4nr1k/p7/3P4/npP2bp1/5b1P/P1K5/1B3P2/3R2R1 w - - 0 33',
    solution: ['Kb4+', 'Kh7', 'Kxa5'],
    hint: 'Your b2 bishop points at h8 — and your own king is in the way.',
  },
  {
    // Lichess puzzle Mr0AH
    id: 'discovered-check-3',
    motifId: 'discovered-check',
    fen: '5rk1/1B3ppp/p2N4/2b2P2/3r1P1q/2Q5/2P3PP/1R3RK1 b - - 0 22',
    solution: ['Rc4+', 'Kh1', 'Rxc3'],
    hint: 'Your c5 bishop points at White’s king, behind your own rook.',
  },
  {
    // Lichess puzzle MlBfV
    id: 'discovered-check-4',
    motifId: 'discovered-check',
    fen: '8/Qp3kp1/2b1p3/8/2P5/5rP1/P3R1K1/8 b - - 0 37',
    solution: ['Ra3+', 'Kh3', 'Rxa7'],
    hint: 'Your c6 bishop is lined up on White’s king. Move the rook out of the way with a threat.',
  },
  {
    // Lichess puzzle uMmC4
    id: 'discovered-check-5',
    motifId: 'discovered-check',
    fen: '5r1k/p5bp/2Q3pq/4p3/4N3/2PP1B1b/PP4P1/R4N1K b - - 0 24',
    solution: ['Bd7+', 'Kg1', 'Bxc6'],
    hint: 'Your h6 queen looks down the h-file at White’s king. Your own bishop is in the way.',
  },
  {
    // Lichess puzzle acvFi
    id: 'double-check-1',
    motifId: 'double-check',
    fen: 'r5k1/2p3p1/p2b3p/1p1N4/4q3/1Q3r1P/PP1R1P2/2R2K2 w - - 0 31',
    solution: ['Nf6+', 'Kh8', 'Nxe4'],
    hint: 'Your b3 queen is lined up on Black’s king, behind your own knight.',
  },
  {
    // Lichess puzzle yncKn
    id: 'double-check-2',
    motifId: 'double-check',
    fen: 'r5k1/pp5p/r1q3p1/3N1n2/2Q5/1P6/P5PP/R6K w - - 3 26',
    solution: ['Ne7+', 'Kh8', 'Nxc6'],
    hint: 'Your c4 queen points at g8, and only your d5 knight stands in the way.',
  },
  {
    // Lichess puzzle UnfrE
    id: 'double-check-3',
    motifId: 'double-check',
    fen: 'r1b1k2N/2p5/p3p3/2qpP3/2Pn3p/3B3P/3Q2P1/R4RK1 b q - 0 22',
    solution: ['Nf3+', 'Kh1', 'Nxd2'],
    hint: 'Your c5 queen points at White’s king, with your own knight in between.',
  },
  {
    // Lichess puzzle hOSzW
    id: 'double-check-4',
    motifId: 'double-check',
    fen: '4r1k1/pp4pp/2p2p2/8/3P1q2/P1P2NnP/1P1Q2PK/3R4 b - - 7 27',
    solution: ['Nf1+', 'Kh1', 'Nxd2'],
    hint: 'Your queen and knight are lined up on White’s king. When the knight moves, both can give check.',
  },
  {
    // Lichess puzzle lwOeG
    id: 'double-check-5',
    motifId: 'double-check',
    fen: '6k1/5p2/p7/1pb5/3r2BB/5P2/PP6/4R1K1 b - - 0 32',
    solution: ['Rxg4+', 'Kf1', 'Rxh4'],
    hint: 'Your c5 bishop eyes g1 through your own rook.',
  },
  {
    // Lichess puzzle INXkm
    id: 'deflection-1',
    motifId: 'deflection',
    fen: '5rk1/ppp3p1/8/4P2p/3pQ3/1P1n3P/P1q3PN/5R1K w - - 0 28',
    solution: ['Qd5+', 'Kh7', 'Rxf8'],
    hint: 'Black’s f8 rook is guarded only by the king. A check can drive the king away.',
  },
  {
    // Lichess puzzle 6PqL8
    id: 'deflection-2',
    motifId: 'deflection',
    fen: '1r3rk1/p7/3Pb2Q/p1p1qp2/8/PP1B2P1/5R2/6K1 w - - 0 34',
    solution: ['Qg6+', 'Qg7', 'Qxe6+'],
    hint: 'Black’s queen is the only guard of the e6 bishop. Give a check it has to block.',
  },
  {
    // Lichess puzzle DWtI4
    id: 'deflection-3',
    motifId: 'deflection',
    fen: '6k1/p3bppp/3r4/2p5/4Q3/P1N1PqP1/1P3P1P/R1B3K1 b - - 0 22',
    solution: ['Rd1+', 'Nxd1', 'Qxe4'],
    hint: 'White’s queen is defended only by the c3 knight. Give the knight something else to do.',
  },
  {
    // Lichess puzzle usbgY
    id: 'deflection-4',
    motifId: 'deflection',
    fen: '4r3/p2k1ppp/2p5/2B5/8/2p5/P4PPP/3KR3 b - - 1 22',
    solution: ['c2+', 'Kxc2', 'Rxe1'],
    hint: 'The e1 rook is defended only by White’s king. A pawn check can drag it away.',
  },
  {
    // Lichess puzzle eYgM1
    id: 'deflection-5',
    motifId: 'deflection',
    fen: '8/kp4Q1/2n5/4P3/3p2K1/3q1NP1/8/8 b - - 0 47',
    solution: ['Qe4+', 'Kh3', 'Qxf3'],
    hint: 'The f3 knight is guarded only by White’s king. Check the king away from it.',
  },
  {
    // Lichess puzzle ATjKs
    id: 'decoy-1',
    motifId: 'decoy',
    fen: '8/6pk/p5rn/1p2P3/2p1Qr2/2P4q/PP4N1/3RR1K1 w - - 0 38',
    solution: ['Qxg6+', 'Kxg6', 'Nxf4+', 'Kf7', 'Nxh3'],
    hint: 'If Black’s king stood on g6, a knight jump to f4 would hit it and the queen at once.',
  },
  {
    // Lichess puzzle kllqV
    id: 'decoy-2',
    motifId: 'decoy',
    fen: '3r4/5N2/1Rn3pp/2k1pp2/4p1P1/7P/5P2/6K1 w - - 0 31',
    solution: ['Rxc6+', 'Kxc6', 'Nxd8+'],
    hint: 'The d8 rook is a knight’s jump from c6. Can you bring Black’s king there?',
  },
  {
    // Lichess puzzle MSCMc
    id: 'decoy-3',
    motifId: 'decoy',
    fen: '8/6bk/2nq3p/2N2p1P/5p2/2Q3N1/5P2/6K1 w - - 0 36',
    solution: ['Qxg7+', 'Kxg7', 'Nxf5+', 'Kf8', 'Nxd6'],
    hint: 'From f5 a knight hits g7 and d6. Get Black’s king onto g7 first.',
  },
  {
    // Lichess puzzle zLdRI
    id: 'decoy-4',
    motifId: 'decoy',
    fen: '2kr3r/pb3ppp/8/4p3/1N6/5P2/PPP2P1P/2KR1B1R b - - 0 14',
    solution: ['Rxd1+', 'Kxd1', 'Bxf3+', 'Ke1', 'Bxh1'],
    hint: 'After a trade on d1, White’s king and the h1 rook would share a diagonal through f3.',
  },
  {
    // Lichess puzzle pDhth
    id: 'decoy-5',
    motifId: 'decoy',
    fen: '7Q/pkpp4/1p4r1/4P3/2p5/4RKR1/PP1q4/8 b - - 5 34',
    solution: ['Rxg3+', 'Kxg3', 'Qxe3+'],
    hint: 'Lure White’s king onto g3, where it no longer guards the e3 rook.',
  },
  {
    // Lichess puzzle snt9V
    id: 'removing-the-guard-1',
    motifId: 'removing-the-guard',
    fen: 'r5k1/6b1/1p4pp/p2b1pN1/2Bq3Q/8/PP4PP/R6K w - - 4 34',
    solution: ['Qxd4', 'Bxd4', 'Bxd5+'],
    hint: 'Black’s d5 bishop is defended only by the queen. Trade it off.',
  },
  {
    // Lichess puzzle lp4wV
    id: 'removing-the-guard-2',
    motifId: 'removing-the-guard',
    fen: '6k1/2p1rp1p/1p1pn1p1/1Q4q1/1PP5/P5NP/4RPP1/6K1 w - - 0 31',
    solution: ['Qxg5', 'Nxg5', 'Rxe7'],
    hint: 'The e7 rook’s only guard is Black’s queen.',
  },
  {
    // Lichess puzzle INSwD
    id: 'removing-the-guard-3',
    motifId: 'removing-the-guard',
    fen: '4r2k/1pNr2pp/4q3/4P3/2QP4/1P3R1P/P5P1/6K1 b - - 6 32',
    solution: ['Qxc4', 'bxc4', 'Rxc7'],
    hint: 'White’s c7 knight is protected only by the queen.',
  },
  {
    // Lichess puzzle 2yFfG
    id: 'removing-the-guard-4',
    motifId: 'removing-the-guard',
    fen: '5r2/3k3p/p1pp4/7b/4N1r1/P2P4/1PP2R2/2K1R3 b - - 1 26',
    solution: ['Rxe4', 'Rxe4', 'Rxf2'],
    hint: 'White’s f2 rook is guarded only by the e4 knight.',
  },
  {
    // Lichess puzzle anBZh
    id: 'removing-the-guard-5',
    motifId: 'removing-the-guard',
    fen: '5rr1/pp5k/2p4p/2P1qn2/1P3R2/P7/R1Q3NP/7K b - - 1 33',
    solution: ['Rxg2', 'Qxg2', 'Qxf4'],
    hint: 'The f4 rook leans on the g2 knight for protection.',
  },
];
