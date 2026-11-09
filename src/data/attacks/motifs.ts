import type { MotifData } from '../../lib/motifs';

/**
 * Sacrificial attacks on the king. Demos are stored with White to play. Every line here and
 * in exercises.ts was checked with Stockfish (17.1 for the Greek gift, 19 for the rest, depth
 * 16–18): White stays clearly winning along the attacking lines, and the failing examples
 * really fail. The one exception is the Fried Liver example, which the article says is only
 * a small edge with best defence.
 */
export const groups = ['Bishop sacrifices', 'Attacks on the uncastled king'];

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
/** Lasker–Bauer, Amsterdam 1889, after 14...Nxh5. */
const LASKER = 'r4rk1/1b2bppp/ppq1p3/2ppB2n/5P2/1P1BP3/P1PPQ1PP/R4RK1 w - - 0 1';
/** A knight on f6 simply takes back on h7. */
const DOUBLE_KNIGHT_F6 = 'r4rk1/1b2bppp/ppq1pn2/2ppB3/5P2/1P1BP3/P1PPQ1PP/R4RK1 w - - 0 1';
/** The f-pawn is still on f2, so no rook can swing over along the third rank. */
const DOUBLE_NO_LIFT = 'r4rk1/1b1nbppp/ppq1p3/2ppB3/8/1P1BP3/P1PPQPPP/R4RK1 w - - 0 1';
/** The rook has left f8, so the king can run that way. */
const DOUBLE_FLIGHT = 'r3r1k1/1b1nbppp/ppq1p3/2ppB3/5P2/1P1BP3/P1PPQ1PP/R4RK1 w - - 0 1';
/** Bishop in front of the queen on the c1–h6 diagonal, and a pawn on e5 keeping f6 clear. */
const BXH6 = 'r2q1rk1/pb1nbpp1/1p2p2p/3pP3/3P1B2/2PB1N2/P2Q1PPP/R4RK1 w - - 0 1';
/** The queen on e2 cannot reach h6 in one move, and a knight on f6 guards h7. */
const BXH6_SLOW_QUEEN = 'r1bq1rk1/pp2bpp1/2n1pn1p/3p4/3P4/2NBBN2/PP2QPPP/R4RK1 w - - 0 1';
/** Black has spent a tempo on ...Bd6, so e6 and f7 are short of defenders. */
const F7_KNIGHT = 'r1bqk2r/pp1n1ppp/2pbpn2/6N1/2BP4/8/PPP1QPPP/R1B1K1NR w KQkq - 0 1';
/** The bishop on g4 is loose once the knight on f3 moves with check. */
const F7_LOOSE_BISHOP = 'rn1qkbnr/ppp1pppp/3p4/8/2B1P1b1/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1';
/** The Fried Liver, after 1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5 d5 5.exd5 Nxd5. */
const FRIED_LIVER = 'r1bqkb1r/ppp2ppp/2n5/3np1N1/2B5/8/PPPP1PPP/RNBQK2R w KQkq - 0 1';
/** Black is fully developed and can castle by hand: nothing follows Bxf7+. */
const F7_TOO_EARLY = 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 1';
/** The F7_KNIGHT position with the queen still on d1, so Qxe6+ is not available. */
const F7_NO_QUEEN = 'r1bqk2r/pp1n1ppp/2pbpn2/6N1/2BP4/8/PPP2PPP/R1BQK1NR w KQkq - 0 1';

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
  {
    id: 'double-bishop-sacrifice',
    name: 'Double bishop sacrifice',
    group: 'Bishop sacrifices',
    intro:
      'Both bishops are given up to tear away the h7 and g7 pawns, then the queen and a rook ' +
      'finish off the bare king. Made famous by Lasker against Bauer in 1889, it needs one ' +
      'piece more than it first appears to.',
    fen: LASKER,
    solution: [
      'Bxh7+', 'Kxh7', 'Qxh5+', 'Kg8', 'Bxg7', 'Kxg7', 'Qg4+', 'Kh7', 'Rf3', 'e5',
      'Rh3+', 'Qh6', 'Rxh6+', 'Kxh6', 'Qd7', 'Bf6', 'Qxb7',
    ],
    idea:
      'Bxh7+ and Bxg7 remove both pawns in front of the king, and the queen comes in with ' +
      'check each time. The point is Rf3: the rook swings to the h-file and threatens mate, so ' +
      'Black has to give up the queen. Then Qd7 forks the bishops, and White ends up with ' +
      'queen and rook against two rooks and a bishop, with Black’s king still exposed.',
    hint: 'Two bishops are aimed at the king’s pawns. What if you give up both of them?',
    sections: [
      {
        heading: 'The set-up: two bishops, a queen and a rook',
        paragraphs: [
          'Look for bishops side by side aiming at h7 and g7, such as d3 and e5 here, or d3 and ' +
            'b2 on the long diagonal. The queen must be able to reach the h-file with check, ' +
            'and a rook must be able to swing across: here the f-pawn has already moved to f4, ' +
            'so Rf3–h3 is ready.',
          'The rook is the piece that is easy to forget. Without it the queen can only give ' +
            'checks, and White is two bishops down.',
        ],
      },
      {
        heading: 'Where can the king go?',
        paragraphs: [
          'After 4.Qg4+ the king has three squares, and none of them is safe. If it steps up ' +
            'to f6, the queen mates on g5. If it hides on h8 or h7, the rook lift decides, and ' +
            'giving up material only delays the end.',
        ],
        examples: [
          {
            fen: LASKER,
            moves: ['Bxh7+', 'Kxh7', 'Qxh5+', 'Kg8', 'Bxg7', 'Kxg7', 'Qg4+', 'Kf6', 'Qg5#'],
            caption: '4...Kf6 walks into mate on g5',
          },
          {
            fen: LASKER,
            moves: [
              'Bxh7+', 'Kxh7', 'Qxh5+', 'Kg8', 'Bxg7', 'Kxg7', 'Qg4+', 'Kh8', 'Rf3', 'e5',
              'Rh3+', 'Bh4', 'Rxh4+', 'Qh6', 'Rxh6#',
            ],
            caption: '4...Kh8 5.Rf3: blocking the h-file only delays the mate',
          },
          {
            fen: LASKER,
            moves: ['Bxh7+', 'Kxh7', 'Qxh5+', 'Kg8', 'Bxg7', 'Kxg7', 'Qg4+', 'Kh7', 'Rf3', 'f5', 'Rh3+', 'Bh4', 'Rxh4#'],
            caption: '5...f5 attacks the queen, but the rook check comes first',
          },
        ],
      },
      {
        heading: 'When it fails: a knight takes back on h7',
        paragraphs: [
          'With a knight on f6, the first capture is not forced to be made by the king. ' +
            'After 1.Bxh7+ Nxh7 the knight still guards the kingside, the queen has no way in, ' +
            'and White has simply lost a bishop for a pawn.',
        ],
        examples: [
          {
            fen: DOUBLE_KNIGHT_F6,
            moves: ['Bxh7+', 'Nxh7'],
            caption: '1...Nxh7: the knight takes back and the attack never starts',
          },
        ],
      },
      {
        heading: 'When it fails: no rook lift, or the king can run',
        paragraphs: [
          'With the pawn still on f2 the rook on f1 cannot reach the third rank, so after the ' +
            'checks run out White is two bishops down. And if Black’s rook has already left f8, ' +
            'the king simply walks away through that square.',
        ],
        examples: [
          {
            fen: DOUBLE_NO_LIFT,
            moves: ['Bxh7+', 'Kxh7', 'Qh5+', 'Kg8', 'Bxg7', 'Kxg7', 'Qg4+', 'Kf6'],
            caption: 'The pawn on f2 shuts the rook in, and the king is safe enough',
          },
          {
            fen: DOUBLE_FLIGHT,
            moves: ['Bxh7+', 'Kxh7', 'Qh5+', 'Kg8', 'Bxg7', 'Kxg7', 'Qg4+', 'Kf8'],
            caption: '4...Kf8: with the rook gone from f8, the king runs',
          },
        ],
      },
    ],
  },
  {
    id: 'bxh6-sacrifice',
    name: 'Bxh6 sacrifice',
    group: 'Bishop sacrifices',
    intro:
      'When Black has played ...h6, that pawn can become a target. The bishop takes it, the ' +
      'g-pawn takes back, and the queen lands on h6 next to a king with no pawn cover left.',
    fen: BXH6,
    solution: [
      'Bxh6', 'gxh6', 'Qxh6', 'f5', 'exf6', 'Nxf6', 'Qg6+', 'Kh8', 'Ng5', 'Bc8',
      'Qh6+', 'Kg8', 'Bh7+', 'Kh8', 'Bf5+', 'Kg8', 'Nxe6', 'Bxe6', 'Bxe6+',
    ],
    idea:
      'Qxh6 threatens mate on h7 at once, so Black has no time to regroup. ...f5 is the only ' +
      'real try, and after exf6 Nxf6 the queen and knight keep the king boxed in. The bishop ' +
      'then uses discovered checks to step closer, and White wins back the piece with a ' +
      'crushing attack.',
    hint: 'The h6 pawn is guarded only by the g-pawn. What happens if the queen lands there?',
    sections: [
      {
        heading: 'The set-up: bishop in front of the queen',
        paragraphs: [
          'The bishop has to be in front of the queen on the c1–h6 diagonal, so that the queen ' +
            'can recapture on h6 straight away. Then check three things. 1. The queen really ' +
            'reaches h6 in one move. 2. A bishop on the b1–h7 diagonal makes Qh7 a mate threat. ' +
            '3. A pawn on e5 or a similar grip keeps Black’s knight away from f6.',
          'Black does not have to take. Declining usually leaves White a clean pawn up with ' +
            'the bishop still aimed at the king, so the sacrifice is often good on that basis ' +
            'alone.',
        ],
      },
      {
        heading: 'When Black defends badly',
        paragraphs: [
          'Most natural replies lose on the spot, because the queen and bishop are already ' +
            'aimed at h7.',
        ],
        examples: [
          {
            fen: BXH6,
            moves: ['Bxh6', 'gxh6', 'Qxh6', 'Re8', 'Qh7+', 'Kf8', 'Qh8#'],
            caption: '2...Re8 makes room, but the queen mates in the corner',
          },
          {
            fen: BXH6,
            moves: ['Bxh6', 'gxh6', 'Qxh6', 'f5', 'exf6', 'Rxf6', 'Qh7+', 'Kf8', 'Qh8+', 'Kf7', 'Ng5#'],
            caption: '3...Rxf6 4.Qh7+: the knight joins with mate on g5',
          },
        ],
      },
      {
        heading: 'When it fails: the queen arrives too late',
        paragraphs: [
          'Here the queen is on e2, so it needs two moves to reach h6, and the knight on f6 ' +
            'already guards h7. Black takes the bishop and has time to win a central pawn as ' +
            'well.',
        ],
        examples: [
          {
            fen: BXH6_SLOW_QUEEN,
            moves: ['Bxh6', 'gxh6', 'Ne5', 'Nxd4'],
            caption: 'The queen is a move short, and Black is a piece up',
          },
        ],
      },
    ],
  },
  {
    id: 'f7-sacrifice',
    name: 'Sacrifice on f7',
    group: 'Attacks on the uncastled king',
    intro:
      'Before Black castles, f7 is guarded only by the king. A bishop or knight takes it, the ' +
      'king is dragged into the open, and the rest of White’s pieces arrive with check.',
    fen: F7_KNIGHT,
    solution: ['Nxf7', 'Kxf7', 'Qxe6+', 'Kg6', 'Bd3+', 'Kh5', 'Qh3#'],
    idea:
      'Nxf7 forks the queen and the rook, so Black more or less has to take. Then Qxe6+ rips ' +
      'away the last pawn in front of the king, and it can only run forward. Bd3+ drives it to ' +
      'the h-file, where the queen mates on h3.',
    hint: 'f7 is guarded only by the king, and the bishop and queen both look at e6.',
    sections: [
      {
        heading: 'The set-up: king in the centre',
        paragraphs: [
          'Look for a king still on e8, with f7 guarded only by the king, and a bishop on the ' +
            'a2–g8 diagonal or a knight on g5 aimed at it. What matters most is the next move: ' +
            'the sacrifice works when another piece can follow with check, so the king never ' +
            'gets time to step back.',
          'Before you take, ask what you have after ...Kxf7. In this position the queen on the ' +
            'e-file provides the follow-up.',
        ],
      },
      {
        heading: 'A bishop version: the loose piece on g4',
        paragraphs: [
          'Sometimes the sacrifice wins material instead of mating. With Black’s bishop on g4 ' +
            'unguarded, 1.Bxf7+ Kxf7 2.Ng5+ moves the knight with check and uncovers the queen ' +
            'on d1, which takes the bishop. White ends up a pawn ahead with the safer king.',
        ],
        examples: [
          {
            fen: F7_LOOSE_BISHOP,
            moves: ['Bxf7+', 'Kxf7', 'Ng5+', 'Ke8', 'Qxg4'],
            caption: '2.Ng5+ uncovers the queen, and the bishop on g4 falls',
          },
          {
            fen: F7_LOOSE_BISHOP,
            moves: ['Bxf7+', 'Kd7', 'Ne5+', 'dxe5', 'Qxg4+'],
            caption: 'Declining with 1...Kd7 is worse: Ne5+ and the queen takes on g4 with check',
          },
        ],
      },
      {
        heading: 'The Fried Liver: dangerous, not decisive',
        paragraphs: [
          'After 1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5 d5 5.exd5 Nxd5 the knight sacrifice 6.Nxf7 ' +
            'is the most famous f7 attack of all. Black’s king is driven to e6 and has to ' +
            'survive a long, unpleasant defence.',
          'It is not a forced win, though. With exact defence engines give White only a small ' +
            'edge, so treat it as a dangerous practical weapon rather than a refutation.',
        ],
        examples: [
          {
            fen: FRIED_LIVER,
            moves: ['Nxf7', 'Kxf7', 'Qf3+', 'Ke6', 'Nc3', 'Nb4'],
            caption: 'The king is stuck on e6, but with ...Nb4 Black can hold on',
          },
        ],
      },
      {
        heading: 'When it fails: nothing follows the check',
        paragraphs: [
          'In a quiet position with Black’s pieces developed, Bxf7+ just gives away a bishop. ' +
            'After 2.Ng5+ the king steps to g8 and White has no second wave. The same goes for ' +
            'Nxf7 when the queen is not ready: here it is on d1 rather than e2, so Qxe6+ does ' +
            'not exist.',
        ],
        examples: [
          {
            fen: F7_TOO_EARLY,
            moves: ['Bxf7+', 'Kxf7', 'Ng5+', 'Kg8'],
            caption: '2...Kg8: the king is safe and White is a bishop down for a pawn',
          },
          {
            fen: F7_NO_QUEEN,
            moves: ['Nxf7', 'Kxf7', 'Bxe6+', 'Kxe6'],
            caption: 'With the queen on d1, the second sacrifice simply loses another piece',
          },
        ],
      },
    ],
  },
];
