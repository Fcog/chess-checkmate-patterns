import type { ExerciseData } from '../../lib/exercises';

/** Attacking motifs currently available in the Practice section filter. */
export const practiceIds: string[] = ['greek-gift', 'greek-gift-h-pawn'];

const CLASSIC = 'r1bq1rk1/pppn1ppp/2n1p3/3pP3/3P4/3B1N2/PPP2PPP/R1BQK2R w KQ - 0 1';
const PAWNS_A3_C3 = 'r2q1rk1/pp2nppp/2n1p3/2ppP3/3P4/P1PB1N2/2P2PPP/R1BQ1RK1 w - - 0 1';
const QUEEN_G4 = 'r1b2rk1/pp2bppp/4p3/q1npP3/6Q1/2NB1N2/PPP2PPP/2KR3R w - - 0 1';
const H_PAWN = 'rn1q1rk1/1ppbbppp/p3p3/3pP3/3P3P/2NB1N2/PPP2PP1/R2QK2R w KQ - 0 1';

/**
 * Practice exercises. Most are variations of the same few positions: the player plays the
 * attack, and the defender picks a different defence in each one. Lines were checked with
 * Stockfish 17.1 (depth 16–18); White is clearly winning at every step.
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
];
