import type { MotifData } from '../../lib/motifs';

/**
 * Sacrificial attacks on the castled king. Demos are stored with White to play. Every line
 * here and in exercises.ts was checked with Stockfish 17.1 (depth 16–18): White stays
 * clearly winning along the attacking lines, and the failing examples really fail.
 */
export const groups = ['Bishop sacrifices'];

/** The classic set-up: Bd3, Nf3 and Qd1, with a pawn on e5 keeping Black's knight off f6. */
const CLASSIC = 'r1bq1rk1/pppn1ppp/2n1p3/3pP3/3P4/3B1N2/PPP2PPP/R1BQK2R w KQ - 0 1';
/** The bishop on e7 can take a knight on g5. */
const KNIGHT_TAKEN = 'r2q1rk1/1b1nbppp/2p1p3/p3P3/1p1P4/P2B1N2/1P3PPP/R1BQ1RK1 w - - 0 1';
/** No pawn on e5: ...Bf5 covers h7. */
const BISHOP_DEFENDS = 'rnbq1rk1/ppp1nppp/3b4/3p4/3P4/3B1N2/PPP2PPP/RNBQ1RK1 w - - 0 1';
/** No pawn on e5: ...Nf6 covers h7. */
const KNIGHT_DEFENDS = 'r1bq1rk1/pp3ppp/2n5/2bn4/2N5/2P2N2/P1B2PPP/R1BQR1K1 w - - 0 1';
/** The pawn on h4 guards g5, and the rook on h1 waits behind it. */
const H_PAWN = 'rn1q1rk1/1ppbbppp/p3p3/3pP3/3P3P/2NB1N2/PPP2PP1/R2QK2R w KQ - 0 1';

export const motifs: MotifData[] = [
  {
    id: 'greek-gift',
    name: 'Greek gift',
    group: 'Bishop sacrifices',
    intro:
      'The oldest sacrifice against the castled king: the bishop takes on h7 with check, the ' +
      'knight jumps in with another check, and the queen joins on the h-file. It wins when ' +
      'three conditions hold, and loses a piece when they don’t.',
    fen: CLASSIC,
    solution: [
      'Bxh7+', 'Kxh7', 'Ng5+', 'Kg8', 'Qh5', 'Re8', 'Qxf7+', 'Kh8',
      'Qh5+', 'Kg8', 'Qh7+', 'Kf8', 'Qh8+', 'Ke7', 'Qxg7#',
    ],
    idea:
      'Bxh7+ drags the king out and Ng5+ brings it back to the edge with gain of time. After ' +
      '...Kg8, Qh5 threatens mate on h7, and with the pawn on e5 taking f6 away from Black’s ' +
      'knight, nothing can come back to defend. Here ...Re8 only gives the king a flight square ' +
      'on f8, and the queen hunts it across the back rank.',
    hint: 'The h7 pawn is guarded only by the king. Bishop, knight and queen can all reach it.',
    sections: [
      {
        heading: 'The set-up: bishop, knight and queen',
        paragraphs: [
          'Look for a triangle of pieces aimed at h7: a bishop on d3 (or c2) on the b1–h7 ' +
            'diagonal, a knight on f3 that can jump to g5, and a queen on d1 that can reach h5 ' +
            '(or g4, or d3) in one move. A pawn on e5 helps a lot: it takes f6 away from Black’s ' +
            'knight, the piece that would otherwise defend h7.',
          'Then check the three conditions. 1. The bishop, knight and queen are in place. ' +
            '2. When the knight jumps to g5, nothing can take it (or, if something can, a pawn ' +
            'takes back and opens a file, see the h-pawn version). 3. After Qh5, no black piece ' +
            'can come back to cover h7.',
        ],
      },
      {
        heading: 'Where can the king go?',
        paragraphs: [
          'After 1.Bxh7+ Kxh7 2.Ng5+ Black has four choices, and each has its own answer. ' +
            '2...Kg8 runs into 3.Qh5 and mate on h7 or f7. 2...Kh6 allows 3.Nxf7+, forking king ' +
            'and queen. 2...Kg6 keeps the king near its pieces, but h4–h5+ chases it further ' +
            'out. And declining with 1...Kh8 still loses to Ng5 and Qh5.',
        ],
        examples: [
          {
            fen: CLASSIC,
            moves: ['Bxh7+', 'Kxh7', 'Ng5+', 'Kh6', 'Nxf7+', 'Kh7', 'Nxd8'],
            caption: '2...Kh6 3.Nxf7+ wins the queen',
          },
          {
            fen: CLASSIC,
            moves: ['Bxh7+', 'Kxh7', 'Ng5+', 'Kg6', 'h4', 'f6', 'h5+', 'Kf5', 'Qf3#'],
            caption: '2...Kg6 3.h4: the h-pawn chases the king into a mating net',
          },
          {
            fen: CLASSIC,
            moves: ['Bxh7+', 'Kh8', 'Ng5', 'f6', 'Qh5', 'fxg5', 'Bg6+', 'Kg8', 'Qh7#'],
            caption: '1...Kh8 declines, but Ng5 and Qh5 mate all the same',
          },
        ],
      },
      {
        heading: 'When it fails: the knight can be taken',
        paragraphs: [
          'Here everything looks ready, but Black’s bishop on e7 covers g5. After 1.Bxh7+ Kxh7 ' +
            '2.Ng5+ Bxg5 the knight is simply gone, and White is down two pieces for a pawn with ' +
            'no attack left.',
        ],
        examples: [
          {
            fen: KNIGHT_TAKEN,
            moves: ['Bxh7+', 'Kxh7', 'Ng5+', 'Bxg5', 'Bxg5', 'Qxg5'],
            caption: '3.Bxg5 Qxg5: the queen takes back',
          },
          {
            fen: KNIGHT_TAKEN,
            moves: ['Bxh7+', 'Kxh7', 'Ng5+', 'Bxg5', 'Qh5+', 'Bh6', 'Bxh6', 'gxh6'],
            caption: '3.Qh5+ Bh6: the bishop blocks, and the attack is over',
          },
        ],
      },
      {
        heading: 'When it fails: h7 can be defended',
        paragraphs: [
          'Without a pawn on e5, Black has defenders. After 3.Qh5 the bishop can come to f5, or ' +
            'a knight to f6, covering h7 for good. White has given up a piece for a pawn and the ' +
            'mate threat is parried.',
        ],
        examples: [
          {
            fen: BISHOP_DEFENDS,
            moves: ['Bxh7+', 'Kxh7', 'Ng5+', 'Kg8', 'Qh5', 'Bf5'],
            caption: '3...Bf5 covers h7',
          },
          {
            fen: KNIGHT_DEFENDS,
            moves: ['Bxh7+', 'Kxh7', 'Ng5+', 'Kg8', 'Qh5', 'Nf6'],
            caption: '3...Nf6 covers h7 and hits the queen',
          },
        ],
      },
    ],
  },
  {
    id: 'greek-gift-h-pawn',
    name: 'Greek gift with h-pawn support',
    group: 'Bishop sacrifices',
    intro:
      'A version of the Greek gift where the knight on g5 can be taken, but a pawn on h4 ' +
      'guards it. Taking the knight opens the h-file, and the rook on h1 joins the attack ' +
      'without moving.',
    fen: H_PAWN,
    solution: ['Bxh7+', 'Kxh7', 'Ng5+', 'Kg8', 'Qh5', 'Bxg5', 'hxg5', 'a5', 'Qh8#'],
    idea:
      'Black’s bishop on e7 can take the knight on g5, which would normally refute the ' +
      'sacrifice. Here the h-pawn takes back: hxg5 opens the h-file, so the queen on h5 is ' +
      'backed up by the rook on h1, and Qh8 is mate.',
    hint: 'The knight on g5 may be taken. What does the h4 pawn do then?',
    sections: [
      {
        heading: 'Why the knight may now be taken',
        paragraphs: [
          'The second condition of the Greek gift says the knight on g5 must not be capturable. ' +
            'With a pawn on h4 and the rook still on h1 there is an exception: if Black takes ' +
            'the knight, hxg5 opens the h-file for the rook, and the attack gets stronger, not ' +
            'weaker.',
          'The third condition still applies: Black must not be able to bring a defender to h7.',
        ],
        examples: [
          {
            fen: H_PAWN,
            moves: ['Bxh7+', 'Kxh7', 'Ng5+', 'Bxg5', 'hxg5+', 'Kg8', 'Qh5', 'f6', 'g6', 'Re8', 'Qh8#'],
            caption: '2...Bxg5 3.hxg5+: the capture comes with check on the open h-file',
          },
        ],
      },
    ],
  },
];
