import type { ExerciseData } from '../../lib/exercises';

/** Attacking motifs currently available in the Practice section filter. */
export const practiceIds: string[] = [
  'greek-gift',
  'greek-gift-h-pawn',
  'double-bishop-sacrifice',
  'bxh6-sacrifice',
  'f7-sacrifice',
];

const CLASSIC = 'r1bq1rk1/pppn1ppp/2n1p3/3pP3/3P4/3B1N2/PPP2PPP/R1BQK2R w KQ - 0 1';
const PAWNS_A3_C3 = 'r2q1rk1/pp2nppp/2n1p3/2ppP3/3P4/P1PB1N2/2P2PPP/R1BQ1RK1 w - - 0 1';
const QUEEN_G4 = 'r1b2rk1/pp2bppp/4p3/q1npP3/6Q1/2NB1N2/PPP2PPP/2KR3R w - - 0 1';
const H_PAWN = 'rn1q1rk1/1ppbbppp/p3p3/3pP3/3P3P/2NB1N2/PPP2PP1/R2QK2R w KQ - 0 1';
const LASKER = 'r4rk1/1b2bppp/ppq1p3/2ppB2n/5P2/1P1BP3/P1PPQ1PP/R4RK1 w - - 0 1';
const BXH6 = 'r2q1rk1/pb1nbpp1/1p2p2p/3pP3/3P1B2/2PB1N2/P2Q1PPP/R4RK1 w - - 0 1';
const F7_KNIGHT = 'r1bqk2r/pp1n1ppp/2pbpn2/6N1/2BP4/8/PPP1QPPP/R1B1K1NR w KQkq - 0 1';
const F7_LOOSE_BISHOP = 'rn1qkbnr/ppp1pppp/3p4/8/2B1P1b1/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1';

/**
 * Practice exercises. Most are variations of the same few positions: the player plays the
 * attack, and the defender picks a different defence in each one. Lines were checked with
 * Stockfish (17.1 for the Greek gift, 19 for the rest, depth 16–18); White is clearly winning
 * at every step.
 *
 * Quiz exercises (`goal: quiz`) only ask whether the sacrifice works. `solution` is the line
 * shown after the answer: the refutation when `sound` is false, the main line when true.
 */
export const exercises: ExerciseData[] = [
  // ---------- Greek gift: the classic set-up ----------
  {
    id: 'greek-gift-1',
    motifId: 'greek-gift',
    fen: CLASSIC,
    solution: [
      'Bxh7+', 'Kxh7', 'Ng5+', 'Kg8', 'Qh5', 'Re8', 'Qxf7+', 'Kh8',
      'Qh5+', 'Kg8', 'Qh7+', 'Kf8', 'Qh8+', 'Ke7', 'Qxg7#',
    ],
    hint: 'After ...Re8 the king wants to run to f8. Take f7 with check first, then keep checking.',
  },
  {
    id: 'greek-gift-2',
    motifId: 'greek-gift',
    fen: CLASSIC,
    solution: ['Bxh7+', 'Kxh7', 'Ng5+', 'Kh6', 'Nxf7+', 'Kh7', 'Nxd8'],
    hint: 'If the king steps up to h6, the knight can give check and hit the queen at the same time.',
  },
  {
    id: 'greek-gift-3',
    motifId: 'greek-gift',
    fen: CLASSIC,
    solution: ['Bxh7+', 'Kxh7', 'Ng5+', 'Kg6', 'h4', 'f6', 'h5+', 'Kf5', 'Qf3#'],
    hint: 'Against ...Kg6, bring the h-pawn up to chase the king further out.',
  },
  {
    id: 'greek-gift-4',
    motifId: 'greek-gift',
    fen: CLASSIC,
    solution: ['Bxh7+', 'Kh8', 'Ng5', 'f6', 'Qh5', 'fxg5', 'Bg6+', 'Kg8', 'Qh7#'],
    hint: 'If Black declines with ...Kh8, the bishop stays on h7 and the knight and queen still join in.',
  },
  {
    id: 'greek-gift-5',
    motifId: 'greek-gift',
    fen: CLASSIC,
    solution: [
      'Bxh7+', 'Kh8', 'Ng5', 'g6', 'h4', 'Kg7', 'h5', 'Rh8',
      'Nxe6+', 'fxe6', 'hxg6', 'Qe7', 'Bh6#',
    ],
    hint: 'When ...g6 shuts the h-file, the h-pawn breaks it open again. The dark squares round the king are weak.',
  },
  {
    id: 'greek-gift-6',
    motifId: 'greek-gift',
    fen: PAWNS_A3_C3,
    solution: [
      'Bxh7+', 'Kxh7', 'Ng5+', 'Kg8', 'Qh5', 'Re8', 'Qh7+', 'Kf8',
      'Qh8+', 'Ng8', 'Nh7+', 'Ke7', 'Bg5+', 'f6', 'Qxg7#',
    ],
    hint: 'When the king runs towards f8, keep it in the net with queen checks, then let the knight and the c1 bishop join.',
  },
  {
    id: 'greek-gift-7',
    motifId: 'greek-gift',
    fen: PAWNS_A3_C3,
    solution: ['Bxh7+', 'Kxh7', 'Ng5+', 'Kg6', 'Qg4', 'f5', 'exf6', 'Kxf6', 'Qxe6#'],
    hint: 'Against ...Kg6, put the queen behind the knight on the g-file: every knight move becomes a discovered check.',
  },
  {
    id: 'greek-gift-8',
    motifId: 'greek-gift',
    fen: QUEEN_G4,
    solution: [
      'Bxh7+', 'Kxh7', 'Qh5+', 'Kg8', 'h4', 'Re8', 'Ng5', 'Bxg5+', 'hxg5', 'Kf8',
      'g6', 'Bd7', 'Qg5', 'Kg8', 'Rh8+', 'Kxh8', 'gxf7', 'Rf8', 'Rh1#',
    ],
    hint: 'Here the queen comes first and the h-pawn backs up the knight. Once the h-file opens, the rooks finish the job.',
  },
  {
    id: 'greek-gift-9',
    motifId: 'greek-gift',
    fen: QUEEN_G4,
    solution: [
      'Bxh7+', 'Kxh7', 'Qh5+', 'Kg8', 'h4', 'Re8', 'Ng5', 'Bxg5+', 'hxg5', 'Kf8',
      'g6', 'Ke7', 'Qg5+', 'Kd7', 'gxf7', 'Rf8', 'Qxg7', 'Qd8', 'Rh8', 'Rxh8', 'f8=Q+',
    ],
    hint: 'If the king escapes to the centre, the g-pawn takes on f7 and heads for promotion.',
  },
  {
    id: 'greek-gift-10',
    motifId: 'greek-gift',
    fen: QUEEN_G4,
    solution: [
      'Bxh7+', 'Kxh7', 'Qh5+', 'Kg8', 'h4', 'Re8', 'Ng5', 'Bxg5+', 'hxg5', 'Kf8',
      'g6', 'fxg6', 'Qxg6', 'Bd7', 'Rh7', 'Ke7', 'Qf6#',
    ],
    hint: 'After ...fxg6 the queen takes back, and the rook on the open h-file cuts the king off.',
  },
  // ---------- Greek gift with h-pawn support ----------
  {
    id: 'greek-gift-h-pawn-1',
    motifId: 'greek-gift-h-pawn',
    fen: H_PAWN,
    solution: ['Bxh7+', 'Kxh7', 'Ng5+', 'Kg8', 'Qh5', 'Bxg5', 'hxg5', 'a5', 'Qh8#'],
    hint: 'If the bishop takes the knight on g5, take back with the pawn: the rook on h1 now sees the h-file.',
  },
  {
    id: 'greek-gift-h-pawn-2',
    motifId: 'greek-gift-h-pawn',
    fen: H_PAWN,
    solution: ['Bxh7+', 'Kxh7', 'Ng5+', 'Kg8', 'Qh5', 'Bxg5', 'hxg5', 'f5', 'g6', 'Re8', 'Qh8#'],
    hint: 'If ...f5 gives the king air, push the g-pawn to take f7 and h7 away again.',
  },
  {
    id: 'greek-gift-h-pawn-3',
    motifId: 'greek-gift-h-pawn',
    fen: H_PAWN,
    solution: ['Bxh7+', 'Kxh7', 'Ng5+', 'Kh6', 'Qd3', 'f6', 'Qh7#'],
    hint: 'Against ...Kh6, the queen aims at h7 from d3, along the bishop’s old diagonal.',
  },
  {
    id: 'greek-gift-h-pawn-4',
    motifId: 'greek-gift-h-pawn',
    fen: H_PAWN,
    solution: ['Bxh7+', 'Kxh7', 'Ng5+', 'Kh6', 'Qd3', 'Rh8', 'Nxf7+', 'Kh5', 'Nxd8'],
    hint: 'If ...Rh8 guards h7, the knight on g5 has a check that also attacks the queen.',
  },
  {
    id: 'greek-gift-h-pawn-5',
    motifId: 'greek-gift-h-pawn',
    fen: H_PAWN,
    solution: ['Bxh7+', 'Kxh7', 'Ng5+', 'Kh6', 'Qd3', 'g6', 'h5', 'Kg7', 'Nxf7', 'Rxf7', 'hxg6'],
    hint: 'When ...g6 blocks the diagonal, the h-pawn levers it open. Give back the knight to rip the king’s cover away.',
  },
  {
    id: 'greek-gift-h-pawn-6',
    motifId: 'greek-gift-h-pawn',
    fen: H_PAWN,
    solution: [
      'Bxh7+', 'Kxh7', 'Ng5+', 'Kh6', 'Qd3', 'g6', 'h5', 'Kxg5', 'Qe3+', 'Kf5',
      'g3', 'gxh5', 'Qf3+', 'Kg6', 'Qxh5+', 'Kg7', 'Qh7#',
    ],
    hint: 'If the king grabs the knight, it is far from home. Check it with the queen and take away its squares with the g-pawn.',
  },
  {
    id: 'greek-gift-h-pawn-7',
    motifId: 'greek-gift-h-pawn',
    fen: H_PAWN,
    solution: [
      'Bxh7+', 'Kxh7', 'Ng5+', 'Kh6', 'Qd3', 'g6', 'h5', 'Bxg5', 'hxg6+', 'Kg7',
      'Rh7+', 'Kg8', 'gxf7+', 'Rxf7', 'Qg6+', 'Kf8', 'Qxf7#',
    ],
    hint: 'If the bishop takes the knight, open the h-file with check: the rook joins on h7.',
  },
  {
    id: 'greek-gift-h-pawn-8',
    motifId: 'greek-gift-h-pawn',
    fen: H_PAWN,
    solution: ['Bxh7+', 'Kxh7', 'Ng5+', 'Bxg5', 'hxg5+', 'Kg8', 'Qh5', 'f6', 'g6', 'Re8', 'Qh8#'],
    hint: 'If the bishop takes on g5 at once, the pawn takes back with a discovered check from the rook on h1.',
  },
  // ---------- Greek gift: sound or not? ----------
  {
    id: 'greek-gift-quiz-1',
    motifId: 'greek-gift',
    fen: 'r2q1rk1/1b1nbppp/2p1p3/p3P3/1p1P4/P2B1N2/1P3PPP/R1BQ1RK1 w - - 0 1',
    solution: ['Bxh7+', 'Kxh7', 'Ng5+', 'Bxg5', 'Bxg5', 'Qxg5'],
    goal: { kind: 'quiz' },
    sound: false,
    hint:
      'No. The bishop on e7 covers g5, so after 2.Ng5+ Bxg5 the knight is gone and White is two ' +
      'pieces down for a pawn. Condition 2 fails: the knight must not be capturable on g5.',
  },
  {
    id: 'greek-gift-quiz-2',
    motifId: 'greek-gift',
    fen: 'rnbq1rk1/ppp1nppp/3b4/3p4/3P4/3B1N2/PPP2PPP/RNBQ1RK1 w - - 0 1',
    solution: ['Bxh7+', 'Kxh7', 'Ng5+', 'Kg8', 'Qh5', 'Bf5'],
    goal: { kind: 'quiz' },
    sound: false,
    hint:
      'No. With no white pawn on e5, the c8 bishop comes to f5 and covers h7, and the mate ' +
      'threat is gone. Condition 3 fails: Black can defend h7.',
  },
  {
    id: 'greek-gift-quiz-3',
    motifId: 'greek-gift',
    fen: 'r1bq1rk1/pp3ppp/2n5/2bn4/2N5/2P2N2/P1B2PPP/R1BQR1K1 w - - 0 1',
    solution: ['Bxh7+', 'Kxh7', 'Ng5+', 'Kg8', 'Qh5', 'Nf6'],
    goal: { kind: 'quiz' },
    sound: false,
    hint:
      'No. The knight on d5 jumps back to f6, covering h7 and hitting the queen. Condition 3 ' +
      'fails: there is no pawn on e5 to keep that knight out.',
  },
  {
    id: 'greek-gift-quiz-4',
    motifId: 'greek-gift',
    fen: 'r1bqr1k1/1pp2ppp/1nn1p3/p3P3/1b1P4/2N2N2/PPB2PPP/R1BQ1RK1 w - - 0 1',
    solution: ['Bxh7+', 'Kxh7', 'Ng5+', 'Qxg5', 'Bxg5'],
    goal: { kind: 'quiz' },
    sound: true,
    hint:
      'Yes. The bishop on c2 sees h7, only the queen can take a knight on g5, and the pawn on ' +
      'e5 keeps Black’s knights off f6. Against 2...Kg8 3.Qh5 Black is lost, so the main line ' +
      'gives up the queen for the knight. Declining with 1...Kf8 still leaves White a pawn up ' +
      'with a strong attack.',
  },
  {
    id: 'greek-gift-quiz-5',
    motifId: 'greek-gift',
    fen: 'rnbq1rk1/pppn1ppp/4p3/3pP3/1b1P4/2NB1N2/PPP2PPP/R1BQK2R w - - 0 1',
    solution: ['Bxh7+', 'Kxh7', 'Ng5+', 'Kg8', 'Qd3', 'f5', 'Qh3', 'Qxg5', 'Bxg5'],
    goal: { kind: 'quiz' },
    sound: true,
    hint:
      'Yes. All three conditions hold: bishop, knight and queen are ready, only Black’s queen ' +
      'can take on g5, and the pawn on e5 keeps the d7 knight off f6. Black ends up giving the ' +
      'queen for the knight to stop the mate on h7.',
  },
  {
    id: 'greek-gift-quiz-6',
    motifId: 'greek-gift',
    fen: 'r1bq1rk1/pp1n1ppp/2n1p3/3pP3/3P4/P1PB1N2/5PPP/R1BQ1RK1 w - - 0 1',
    solution: ['Bxh7+', 'Kxh7', 'Ng5+', 'Kg8', 'Qh5', 'Qxg5', 'Bxg5'],
    goal: { kind: 'quiz' },
    sound: true,
    hint:
      'Yes. Only Black’s queen covers g5, and nothing can reach h7 after Qh5, because the pawn ' +
      'on e5 keeps Black’s knights off f6. Black has to give the queen for the knight.',
  },
  // ---------- Double bishop sacrifice ----------
  {
    id: 'double-bishop-sacrifice-1',
    motifId: 'double-bishop-sacrifice',
    fen: LASKER,
    solution: [
      'Bxh7+', 'Kxh7', 'Qxh5+', 'Kg8', 'Bxg7', 'Kxg7', 'Qg4+', 'Kh7', 'Rf3', 'e5',
      'Rh3+', 'Qh6', 'Rxh6+', 'Kxh6', 'Qd7', 'Bf6', 'Qxb7',
    ],
    hint: 'After the second bishop goes, the rook on f1 has a road to the h-file. Later the queen can fork the bishops.',
  },
  {
    id: 'double-bishop-sacrifice-2',
    motifId: 'double-bishop-sacrifice',
    fen: LASKER,
    solution: ['Bxh7+', 'Kh8', 'Qxh5', 'Rfd8', 'Bd3+', 'Kg8', 'Qh7+', 'Kf8', 'Qh8#'],
    hint: 'If the king declines with ...Kh8, take the knight. The bishop can then step away with a discovered check.',
  },
  {
    id: 'double-bishop-sacrifice-3',
    motifId: 'double-bishop-sacrifice',
    fen: LASKER,
    solution: ['Bxh7+', 'Kxh7', 'Qxh5+', 'Kg8', 'Bxg7', 'Kxg7', 'Qg4+', 'Kf6', 'Qg5#'],
    hint: 'If the king steps forward to f6, look for a queen move that covers everything around it.',
  },
  {
    id: 'double-bishop-sacrifice-4',
    motifId: 'double-bishop-sacrifice',
    fen: LASKER,
    solution: [
      'Bxh7+', 'Kxh7', 'Qxh5+', 'Kg8', 'Bxg7', 'Kxg7', 'Qg4+', 'Kh8', 'Rf3', 'e5',
      'Rh3+', 'Bh4', 'Rxh4+', 'Qh6', 'Rxh6#',
    ],
    hint: 'The rook lift works against ...Kh8 too. Every block on the h-file can simply be taken.',
  },
  {
    id: 'double-bishop-sacrifice-5',
    motifId: 'double-bishop-sacrifice',
    fen: LASKER,
    solution: [
      'Bxh7+', 'Kxh7', 'Qxh5+', 'Kg8', 'Bxg7', 'Kxg7', 'Qg4+', 'Kh7', 'Rf3', 'Bg5',
      'Qxg5', 'e5', 'Rh3+', 'Qh6', 'Rxh6#',
    ],
    hint: 'When ...Bg5 blocks the g-file, the queen can take it: the rook is still coming to h3.',
  },
  {
    id: 'double-bishop-sacrifice-6',
    motifId: 'double-bishop-sacrifice',
    fen: LASKER,
    solution: [
      'Bxh7+', 'Kxh7', 'Qxh5+', 'Kg8', 'Bxg7', 'Kxg7', 'Qg4+', 'Kh7', 'Rf3', 'f5',
      'Rh3+', 'Bh4', 'Rxh4#',
    ],
    hint: 'If ...f5 hits the queen, ignore it: the rook gives check first.',
  },
  {
    id: 'double-bishop-sacrifice-quiz-1',
    motifId: 'double-bishop-sacrifice',
    fen: 'r4rk1/1b2bppp/ppq1pn2/2ppB3/5P2/1P1BP3/P1PPQ1PP/R4RK1 w - - 0 1',
    solution: ['Bxh7+', 'Nxh7'],
    goal: { kind: 'quiz' },
    sound: false,
    hint:
      'No. The knight on f6 takes back on h7, so the king never has to step out and the queen ' +
      'has no way in. White has just lost a bishop for a pawn.',
  },
  {
    id: 'double-bishop-sacrifice-quiz-2',
    motifId: 'double-bishop-sacrifice',
    fen: 'r4rk1/1b1nbppp/ppq1p3/2ppB3/8/1P1BP3/P1PPQPPP/R4RK1 w - - 0 1',
    solution: ['Bxh7+', 'Kxh7', 'Qh5+', 'Kg8', 'Bxg7', 'Kxg7', 'Qg4+', 'Kf6'],
    goal: { kind: 'quiz' },
    sound: false,
    hint:
      'No. The pawn on f2 shuts the rook in, so it cannot swing to the h-file. Once the queen ' +
      'runs out of checks, White is two bishops down.',
  },
  {
    id: 'double-bishop-sacrifice-quiz-3',
    motifId: 'double-bishop-sacrifice',
    fen: 'r3r1k1/1b1nbppp/ppq1p3/2ppB3/5P2/1P1BP3/P1PPQ1PP/R4RK1 w - - 0 1',
    solution: ['Bxh7+', 'Kxh7', 'Qh5+', 'Kg8', 'Bxg7', 'Kxg7', 'Qg4+', 'Kf8'],
    goal: { kind: 'quiz' },
    sound: false,
    hint:
      'No. Black’s rook has left f8, so the king escapes that way. The rook lift comes too ' +
      'late, and White is two bishops down.',
  },
  {
    id: 'double-bishop-sacrifice-quiz-4',
    motifId: 'double-bishop-sacrifice',
    fen: '2r2rk1/pbqn1ppp/1p6/3p4/2P5/2BB2P1/P3QP1P/3R1RK1 w - - 0 1',
    solution: [
      'Bxh7+', 'Kxh7', 'Qh5+', 'Kg8', 'Bxg7', 'Kxg7', 'Qg5+', 'Kh7', 'Rd4', 'Qxc4',
      'Rh4+', 'Qxh4', 'Qxh4+',
    ],
    goal: { kind: 'quiz' },
    sound: true,
    hint:
      'Yes. This is Nimzowitsch–Tarrasch, St Petersburg 1914, with the colours reversed. The ' +
      'bishops take both pawns, and the rook on d1 swings over along the fourth rank. Black ' +
      'has to give up the queen.',
  },
  // ---------- Bxh6 sacrifice ----------
  {
    id: 'bxh6-sacrifice-1',
    motifId: 'bxh6-sacrifice',
    fen: BXH6,
    solution: [
      'Bxh6', 'gxh6', 'Qxh6', 'f5', 'exf6', 'Nxf6', 'Qg6+', 'Kh8', 'Ng5', 'Bc8',
      'Qh6+', 'Kg8', 'Bh7+', 'Kh8', 'Bf5+', 'Kg8', 'Nxe6', 'Bxe6', 'Bxe6+',
    ],
    hint: 'Take en passant to open the f-file, then bring the knight to g5. The bishop’s discovered checks do the rest.',
  },
  {
    id: 'bxh6-sacrifice-2',
    motifId: 'bxh6-sacrifice',
    fen: BXH6,
    solution: [
      'Bxh6', 'gxh6', 'Qxh6', 'f5', 'exf6', 'Nxf6', 'Qg6+', 'Kh8', 'Ng5', 'Qd7',
      'Qh6+', 'Kg8', 'Bh7+', 'Kh8', 'Bf5+',
    ],
    hint: 'With the queen on d7, a discovered check from the bishop also attacks it.',
  },
  {
    id: 'bxh6-sacrifice-3',
    motifId: 'bxh6-sacrifice',
    fen: BXH6,
    solution: ['Bxh6', 'gxh6', 'Qxh6', 'f5', 'exf6', 'Rxf6', 'Qh7+', 'Kf8', 'Qh8+', 'Kf7', 'Ng5#'],
    hint: 'If the rook takes on f6, the queen checks along the edge and the knight delivers mate.',
  },
  {
    id: 'bxh6-sacrifice-4',
    motifId: 'bxh6-sacrifice',
    fen: BXH6,
    solution: ['Bxh6', 'gxh6', 'Qxh6', 'f5', 'exf6', 'Bxf6', 'Qh7#'],
    hint: 'After ...Bxf6 nothing covers h7 any more.',
  },
  {
    id: 'bxh6-sacrifice-5',
    motifId: 'bxh6-sacrifice',
    fen: BXH6,
    solution: ['Bxh6', 'gxh6', 'Qxh6', 'Re8', 'Qh7+', 'Kf8', 'Qh8#'],
    hint: 'Moving the rook gives the king f8, but the h8 square is now free for the queen.',
  },
  {
    id: 'bxh6-sacrifice-6',
    motifId: 'bxh6-sacrifice',
    fen: BXH6,
    solution: ['Bxh6', 'gxh6', 'Qxh6', 'Bg5', 'Qh7#'],
    hint: 'Hitting the queen does not help if you can mate first.',
  },
  {
    id: 'bxh6-sacrifice-quiz-1',
    motifId: 'bxh6-sacrifice',
    fen: 'r1bq1rk1/pp2bpp1/2n1pn1p/3p4/3P4/2NBBN2/PP2QPPP/R4RK1 w - - 0 1',
    solution: ['Bxh6', 'gxh6', 'Ne5', 'Nxd4'],
    goal: { kind: 'quiz' },
    sound: false,
    hint:
      'No. The queen on e2 is not on the c1–h6 diagonal, so it cannot take back on h6, and ' +
      'the knight on f6 guards h7. Black is a piece up and picks off the d4 pawn too.',
  },
  {
    id: 'bxh6-sacrifice-quiz-2',
    motifId: 'bxh6-sacrifice',
    fen: 'r1bq1rk1/pp2bpp1/2n1pn1p/3p4/3P4/2NBBN2/PPP2PPP/R2Q1RK1 w - - 0 1',
    solution: ['Bxh6', 'gxh6', 'Qd2', 'Kg7'],
    goal: { kind: 'quiz' },
    sound: false,
    hint:
      'No. With the queen on d1 it takes a move to reach the diagonal, and ...Kg7 guards h6. ' +
      'White is a bishop down for a pawn with nothing to show for it.',
  },
  {
    id: 'bxh6-sacrifice-quiz-3',
    motifId: 'bxh6-sacrifice',
    fen: 'r1bq1rk1/pp1nbpp1/2n1p2p/3pP3/3P4/2NBBN2/PPPQ1PPP/R4RK1 w - - 0 1',
    solution: ['Bxh6', 'gxh6', 'Qxh6', 'f5', 'exf6', 'Rxf6', 'Qh7+', 'Kf8', 'Qh8+', 'Kf7', 'Ng5#'],
    goal: { kind: 'quiz' },
    sound: true,
    hint:
      'Yes. The bishop is in front of the queen, Qxh6 comes at once, and the pawn on e5 keeps ' +
      'Black’s knights off f6, so the threat of Qh7 mate is very hard to meet.',
  },
  // ---------- Sacrifice on f7 ----------
  {
    id: 'f7-sacrifice-1',
    motifId: 'f7-sacrifice',
    fen: F7_KNIGHT,
    solution: ['Nxf7', 'Kxf7', 'Qxe6+', 'Kg6', 'Bd3+', 'Kh5', 'Qh3#'],
    hint: 'Once the king comes out to g6, keep checking: the bishop drives it to the h-file.',
  },
  {
    id: 'f7-sacrifice-2',
    motifId: 'f7-sacrifice',
    fen: F7_KNIGHT,
    solution: ['Nxf7', 'Kxf7', 'Qxe6+', 'Kf8', 'Qf7#'],
    hint: 'If the king goes back, the bishop on c4 supports the queen on f7.',
  },
  {
    id: 'f7-sacrifice-3',
    motifId: 'f7-sacrifice',
    fen: F7_KNIGHT,
    solution: ['Nxf7', 'Qe7', 'Nxh8', 'Kf8', 'Bxe6'],
    hint: 'If Black declines, the knight on f7 still attacks the rook on h8.',
  },
  {
    id: 'f7-sacrifice-4',
    motifId: 'f7-sacrifice',
    fen: F7_LOOSE_BISHOP,
    solution: ['Bxf7+', 'Kxf7', 'Ng5+', 'Ke8', 'Qxg4'],
    hint: 'The knight on f3 is the only thing between your queen and the loose bishop on g4.',
  },
  {
    id: 'f7-sacrifice-5',
    motifId: 'f7-sacrifice',
    fen: F7_LOOSE_BISHOP,
    solution: ['Bxf7+', 'Kxf7', 'Ng5+', 'Kf6', 'Qxg4'],
    hint: 'Wherever the king goes after the knight check, the queen on d1 can take on g4.',
  },
  {
    id: 'f7-sacrifice-6',
    motifId: 'f7-sacrifice',
    fen: F7_LOOSE_BISHOP,
    solution: ['Bxf7+', 'Kd7', 'Ne5+', 'dxe5', 'Qxg4+'],
    hint: 'If the king declines to d7, a knight check on e5 opens the queen’s path with tempo.',
  },
  {
    id: 'f7-sacrifice-quiz-1',
    motifId: 'f7-sacrifice',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 1',
    solution: ['Bxf7+', 'Kxf7', 'Ng5+', 'Kg8'],
    goal: { kind: 'quiz' },
    sound: false,
    hint:
      'No. After 2.Ng5+ the king steps to g8 and is perfectly safe. No other white piece can ' +
      'join in, so White is simply a bishop down for a pawn.',
  },
  {
    id: 'f7-sacrifice-quiz-2',
    motifId: 'f7-sacrifice',
    fen: 'r1bqk2r/pp1n1ppp/2pbpn2/6N1/2BP4/8/PPP2PPP/R1BQK1NR w KQkq - 0 1',
    solution: ['Nxf7', 'Kxf7', 'Bxe6+', 'Kxe6'],
    goal: { kind: 'quiz' },
    sound: false,
    hint:
      'No. The queen is on d1 instead of e2, so there is no Qxe6+. Black takes the knight, and ' +
      'a second sacrifice on e6 just loses another piece.',
  },
  {
    id: 'f7-sacrifice-quiz-3',
    motifId: 'f7-sacrifice',
    fen: 'r1bqk2r/pp1nbppp/2p1pn2/6N1/2BP4/8/PPP1QPPP/R1B1K1NR w KQkq - 0 1',
    solution: ['Nxf7', 'Kxf7', 'Qxe6+', 'Kf8', 'Qf7#'],
    goal: { kind: 'quiz' },
    sound: true,
    hint:
      'Yes. The queen on e2 follows up with Qxe6+, and the bishop on c4 supports it. The king ' +
      'has no safe square: ...Kf8 runs into Qf7 mate, and ...Kg6 into Bd3+ and Qh3 mate.',
  },
  {
    id: 'f7-sacrifice-quiz-4',
    motifId: 'f7-sacrifice',
    fen: 'rn1qkbnr/ppp1pppp/3p4/8/2B1P1b1/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
    solution: ['Bxf7+', 'Kxf7', 'Ng5+', 'Ke8', 'Qxg4'],
    goal: { kind: 'quiz' },
    sound: true,
    hint:
      'Yes. The bishop on g4 is unguarded, so Ng5+ uncovers the queen with check and White ' +
      'wins the piece back, staying a pawn up with Black’s king stuck in the centre.',
  },
];
