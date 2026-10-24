export type Family = 'Queen mates' | 'Rook mates' | 'Minor-piece mates' | 'Pawn mates';

export type Pattern = {
  id: string;
  name: string;
  family: Family;
  /** Position with the mating side to move. */
  fen: string;
  /**
   * The forced line in SAN, starting with the mating side. Even plies are the moves
   * the player has to find; odd plies are the defender's reply and get played
   * automatically, so each one must be the defender's *only* legal move.
   */
  solution: string[];
  idea: string;
  hint: string;
};

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

/** How many moves the player actually has to find. */
export function mateIn(puzzle: { solution: string[] }): number {
  return Math.ceil(puzzle.solution.length / 2);
}

export const families: Family[] = [
  'Queen mates',
  'Rook mates',
  'Minor-piece mates',
  'Pawn mates',
];

export const patterns: Pattern[] = [
  // ---------- Queen mates ----------
  {
    id: 'epaulette',
    name: 'Epaulette mate',
    family: 'Queen mates',
    fen: '3rkr2/8/1Q6/8/8/8/8/6K1 w - - 0 1',
    solution: ['Qe6#'],
    idea:
      'The king’s two retreat squares are taken by its own rooks, sitting like epaulettes ' +
      'on its shoulders. The queen only has to step in front of it.',
    hint: 'The rooks are doing your work — come close on the file.',
  },
  {
    id: 'swallow-tail',
    name: "Swallow's tail mate",
    family: 'Queen mates',
    fen: '6Q1/8/7r/7k/5P1p/8/8/K7 w - - 0 1',
    solution: ['Qg5#'],
    idea:
      'Also called the guéridon. The king’s own pieces flank it on the edge file, the pawn ' +
      'guards the queen, and the queen mates from beside it — the shape of a bird’s tail.',
    hint: 'Move next to the king on the file where your pawn defends you.',
  },
  {
    id: 'cozio',
    name: "Cozio's mate",
    family: 'Queen mates',
    fen: '6Q1/8/8/7p/5P1k/7p/8/K7 w - - 0 1',
    solution: ['Qg5#'],
    idea:
      'The dovetail. The king is sandwiched between its own pawns and the queen strikes ' +
      'from the diagonal, covering both squares in front of it.',
    hint: 'A diagonal contact check, defended by the pawn.',
  },
  {
    id: 'kill-box',
    name: 'Kill box mate',
    family: 'Queen mates',
    fen: '8/8/7R/k7/2Q5/8/8/6K1 w - - 0 1',
    solution: ['Ra6#'],
    idea:
      'The queen sits a knight’s-move away from the king and blankets a 3×3 box around it. ' +
      'The rook slides in to check, defended by the queen along the diagonal.',
    hint: 'The queen already guards the square next to the king. Put the rook there.',
  },
  {
    id: 'triangle',
    name: 'Triangle mate',
    family: 'Queen mates',
    fen: '6k1/7p/5Q2/8/8/8/8/3R2K1 w - - 0 1',
    solution: ['Rd8#'],
    idea:
      'Queen, rook and king form a triangle: the queen covers the escape squares in front ' +
      'of the king while the rook mates along the back rank.',
    hint: 'The queen has the seventh rank covered — mate on the eighth.',
  },
  {
    id: 'railroad',
    name: 'Railroad mate',
    family: 'Queen mates',
    fen: 'k7/1R6/8/8/8/8/7Q/6K1 w - - 0 1',
    solution: ['Qb8#'],
    idea:
      'Queen and rook run side by side like a train on two rails, each defending the other. ' +
      'The queen pulls up next to the king and cannot be taken.',
    hint: 'Ride the diagonal into the corner, right beside the king.',
  },
  {
    id: 'max-lange',
    name: "Max Lange's mate",
    family: 'Queen mates',
    fen: '6rk/6pp/4Q3/3B4/8/8/8/6K1 w - - 0 1',
    solution: ['Qxg8#'],
    idea:
      'The queen lands next to the king, protected by a bishop on the long light diagonal, ' +
      'while the king’s own pawns take away every other square.',
    hint: 'Take what is blocking the corner — the bishop is watching that square.',
  },
  {
    id: 'balestra',
    name: 'Balestra mate',
    family: 'Queen mates',
    fen: '6k1/8/7Q/8/8/7B/8/6K1 w - - 0 1',
    solution: ['Be6#'],
    idea:
      'A pair of scissors: the queen covers every square around the king from a distance, ' +
      'and the bishop delivers the check on the diagonal.',
    hint: 'The queen has the whole corner. Check with the other piece.',
  },
  {
    id: 'bronco',
    name: 'Bucking bronco mate',
    family: 'Queen mates',
    fen: '7k/8/3N2Q1/8/8/8/8/6K1 w - - 0 1',
    solution: ['Nf7#'],
    idea:
      'The queen takes away the whole flight zone next to the corner and the knight jumps ' +
      'in for the check the king cannot answer.',
    hint: 'The knight, not the queen, gives the final check.',
  },
  {
    id: 'stallion',
    name: 'Sneaky stallion mate',
    family: 'Queen mates',
    fen: '5rk1/5p2/2N4Q/8/8/8/8/6K1 w - - 0 1',
    solution: ['Ne7#'],
    idea:
      'Same partnership as the bronco, but the king is on the edge and blocked in by its own ' +
      'rook and pawn. The knight sneaks to a square nothing can reach.',
    hint: 'Find the knight square that checks and lands out of reach.',
  },
  {
    id: 'damiano',
    name: "Damiano's mate",
    family: 'Queen mates',
    fen: '5rk1/5pp1/6P1/8/8/8/8/6KQ w - - 0 1',
    solution: ['Qh7#'],
    idea:
      'Named for Pedro Damiano (1512). A pawn on the sixth defends the queen as she lands on ' +
      'the seventh next to the king, which is walled in by its own pieces.',
    hint: 'Your pawn guards the square beside the king.',
  },
  {
    id: 'lolli',
    name: "Lolli's mate",
    family: 'Queen mates',
    fen: '6k1/5p2/5PpQ/8/8/8/8/6K1 w - - 0 1',
    solution: ['Qg7#'],
    idea:
      'The advanced pawn protects the queen on the square directly in front of the castled ' +
      'king. Every retreat is covered by the queen herself.',
    hint: 'Step in front of the king, behind your own pawn’s protection.',
  },
  {
    id: 'greco',
    name: "Greco's mate",
    family: 'Queen mates',
    fen: '7k/6p1/8/8/2B4P/5Q2/8/6K1 w - - 0 1',
    solution: ['Qh5#'],
    idea:
      'Named for Gioachino Greco. The bishop controls the corner escape square from afar, the ' +
      'king’s own pawn blocks the rest, and the queen mates down the open file.',
    hint: 'Swing onto the file the king is standing on.',
  },
  {
    id: 'scholars',
    name: "Scholar's mate",
    family: 'Queen mates',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    solution: ['Qxf7#'],
    idea:
      'The queen and bishop both hit f7, the weakest point in the opening. The queen ' +
      'captures there protected by the bishop on c4.',
    hint: 'Take the pawn your bishop is guarding.',
  },

  // ---------- Rook mates ----------
  {
    id: 'back-rank',
    name: 'Back-rank mate',
    family: 'Rook mates',
    fen: '6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1',
    solution: ['Re8#'],
    idea:
      'The king is walled in by its own pawns on the seventh rank, so a rook or queen ' +
      'reaching the eighth rank mates on the spot.',
    hint: 'Bring the rook to the empty back rank.',
  },
  {
    id: 'blind-swine',
    name: 'Blind swine mate',
    family: 'Rook mates',
    fen: '5rk1/R6R/8/8/8/8/8/K7 w - - 0 1',
    solution: ['Rag7#'],
    idea:
      'Two rooks arrive on the seventh rank and defend each other. One checks beside the ' +
      'king, the other makes the capture impossible.',
    hint: 'Double up on the seventh — the rook already there does the defending.',
  },
  {
    id: 'lawnmower',
    name: 'Lawnmower mate',
    family: 'Rook mates',
    fen: '6k1/1R6/8/8/8/8/8/R6K w - - 0 1',
    solution: ['Ra8#'],
    idea:
      'The ladder: two major pieces cut the board in half rank by rank, mowing the king to ' +
      'the edge until one of them checks on the last one.',
    hint: 'One rook fences off the seventh rank. Check on the eighth.',
  },
  {
    id: 'h-file',
    name: 'h-file mate',
    family: 'Rook mates',
    fen: '7k/6p1/8/3B4/8/8/6K1/R7 w - - 0 1',
    solution: ['Rh1#'],
    idea:
      'The classic attack on the castled king: its own pawn blocks the escape, the bishop ' +
      'covers the square beside it, and the rook mates down the open h-file.',
    hint: 'The bishop guards the corner exit. Take the file.',
  },
  {
    id: 'opera',
    name: 'Opera mate',
    family: 'Rook mates',
    fen: '4k3/5p2/8/6B1/8/8/8/3R2K1 w - - 0 1',
    solution: ['Rd8#'],
    idea:
      'From Morphy’s game at the Paris opera. The bishop defends the rook as it lands beside ' +
      'the king and also cuts off the diagonal retreat.',
    hint: 'The bishop protects the back rank square next to the king.',
  },
  {
    id: 'mayet',
    name: "Mayet's mate",
    family: 'Rook mates',
    fen: '6k1/5p2/8/8/8/8/1B6/6KR w - - 0 1',
    solution: ['Rh8#'],
    idea:
      'The rook mates in the corner right next to the king, defended along the long dark ' +
      'diagonal by a bishop the king cannot reach.',
    hint: 'Go to the corner — look at what your bishop sees.',
  },
  {
    id: 'reti',
    name: "Réti's mate",
    family: 'Rook mates',
    fen: 'rk6/pp6/8/8/8/4B3/8/2R3K1 w - - 0 1',
    solution: ['Bf4#'],
    idea:
      'Richard Réti’s finish: the bishop checks along the diagonal, the rook covers the one ' +
      'open file, and the king’s own rook and pawns do the rest.',
    hint: 'Get on the diagonal that ends on the king.',
  },
  {
    id: 'pillsbury',
    name: "Pillsbury's mate",
    family: 'Rook mates',
    fen: '5rk1/5p1p/8/8/8/8/1B6/3R3K w - - 0 1',
    solution: ['Rg1#'],
    idea:
      'The bishop takes the corner square on the long diagonal while the rook mates down the ' +
      'file the missing pawn left open.',
    hint: 'The g-file is empty and the bishop covers h8.',
  },
  {
    id: 'morphy',
    name: "Morphy's mate",
    family: 'Rook mates',
    fen: '5r1k/5p1p/8/8/7B/8/8/K5R1 w - - 0 1',
    solution: ['Bf6#'],
    idea:
      'The rook holds the open file beside the king, so the bishop can check from the long ' +
      'diagonal with no square left to run to.',
    hint: 'The rook has g7 and g8. Check on the diagonal.',
  },
  {
    id: 'corner',
    name: 'Corner mate',
    family: 'Rook mates',
    fen: '7k/7p/3N4/8/8/8/8/K5R1 w - - 0 1',
    solution: ['Nf7#'],
    idea:
      'The rook cuts off the file next to the corner and the knight hops in to give a check ' +
      'nothing can capture or answer.',
    hint: 'The rook covers the exits — jump in with the knight.',
  },
  {
    id: 'anastasia',
    name: "Anastasia's mate",
    family: 'Rook mates',
    fen: '8/4N1pk/8/8/8/8/6K1/R7 w - - 0 1',
    solution: ['Rh1#'],
    idea:
      'The knight on e7 takes away g8 and g6, the pawn on g7 blocks the last flight ' +
      'square, and the rook mates along the open h-file.',
    hint: 'Swing the rook to the file the king is standing on.',
  },
  {
    id: 'arabian',
    name: 'Arabian mate',
    family: 'Rook mates',
    fen: '7k/pR6/5N2/8/8/8/8/6K1 w - - 0 1',
    solution: ['Rh7#'],
    idea:
      'One of the oldest known mates. Rook and knight cover every flight square of the ' +
      'cornered king, and the knight guards the rook.',
    hint: 'The rook can safely land next to the king — something is guarding it.',
  },
  {
    id: 'vukovic',
    name: "Vuković's mate",
    family: 'Rook mates',
    fen: '6k1/R6p/6NP/8/8/8/8/1K6 w - - 0 1',
    solution: ['Rg7#'],
    idea:
      'Three pieces, each with a job: the knight guards the two flight squares, the pawn ' +
      'defends the rook, and the rook checks beside the king.',
    hint: 'The pawn is the reason the rook is safe there.',
  },
  {
    id: 'hook',
    name: 'Hook mate',
    family: 'Rook mates',
    fen: '7k/6pp/5N2/4P3/8/8/8/1K5R w - - 0 1',
    solution: ['Rxh7#'],
    idea:
      'A chain of defenders shaped like a hook: pawn defends knight, knight defends rook, ' +
      'rook checks, and the king’s own pawn seals the last square.',
    hint: 'Capture your way onto the seventh — the knight is behind you.',
  },
  {
    id: 'anderssen',
    name: "Anderssen's mate",
    family: 'Rook mates',
    fen: '6k1/6P1/5K2/8/8/8/8/7R w - - 0 1',
    solution: ['Rh8#'],
    idea:
      'Adolf Anderssen’s corner finish: a protected pawn on the seventh defends the rook as ' +
      'it mates on the eighth, with the king helping from in front.',
    hint: 'The pawn defends the corner square.',
  },

  // ---------- Minor-piece mates ----------
  {
    id: 'corridor',
    name: 'Diagonal corridor mate',
    family: 'Minor-piece mates',
    fen: '6bk/7p/8/8/8/K7/8/2B5 w - - 0 1',
    solution: ['Bb2#'],
    idea:
      'A lone bishop is enough when the king has boxed itself in: the long diagonal becomes ' +
      'a corridor with no door, and the wrong-coloured defender cannot block it.',
    hint: 'Aim the bishop down the longest diagonal on the board.',
  },
  {
    id: 'bombardiers',
    name: "Bombardiers' mate",
    family: 'Minor-piece mates',
    fen: '7k/7p/8/3B4/8/8/6K1/4B3 w - - 0 1',
    solution: ['Bc3#'],
    idea:
      'Two bishops bombard the corner down parallel diagonals — one checks, the other takes ' +
      'away the only flight square.',
    hint: 'One bishop already covers g8. Bring the other to the long diagonal.',
  },
  {
    id: 'bodens',
    name: "Boden's mate",
    family: 'Minor-piece mates',
    fen: '2kr4/3p4/8/8/5B2/8/8/5BK1 w - - 0 1',
    solution: ['Ba6#'],
    idea:
      'Two bishops on crossing diagonals: one checks the king, the other covers the ' +
      'escape squares, while the king is boxed in by its own rook and pawn.',
    hint: 'The other bishop already covers b8 and c7 — check along the long light diagonal.',
  },
  {
    id: 'smothered',
    name: 'Smothered mate',
    family: 'Minor-piece mates',
    fen: '6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1',
    solution: ['Nf7#'],
    idea:
      'The king is smothered by its own rook and pawns, and only a knight can attack it ' +
      'through the wall.',
    hint: 'The knight jumps in front of the king, not next to it.',
  },
  {
    id: 'philidor',
    name: "Philidor's legacy",
    family: 'Minor-piece mates',
    fen: '5r1k/6pp/7N/8/8/1Q6/6PP/6K1 w - - 0 1',
    solution: ['Qg8+', 'Rxg8', 'Nf7#'],
    idea:
      'The smothered mate needs the rook on g8, so the queen goes there herself and ' +
      'invites the capture. Protected by the knight, she cannot be taken by the king — ' +
      'the rook has to do it, and in doing so seals the last escape square.',
    hint: 'The corner is nearly airtight. Give the rook a square it cannot refuse.',
  },
  {
    id: 'two-knights',
    name: 'Two knights mate',
    family: 'Minor-piece mates',
    fen: '7k/6pp/3N3N/8/8/8/8/6K1 w - - 0 1',
    solution: ['Ndf7#'],
    idea:
      'Knights cannot force mate alone, but when the king’s own pawns wall it in, one knight ' +
      'covers the flight square and the other checks.',
    hint: 'Only one of the two knights mates — the other is already doing its job.',
  },
  {
    id: 'suffocation',
    name: 'Suffocation mate',
    family: 'Minor-piece mates',
    fen: '5rk1/5p1p/8/8/6N1/8/1B6/6K1 w - - 0 1',
    solution: ['Nh6#'],
    idea:
      'The bishop rakes the long diagonal so the king cannot breathe on g7 or h8, its own ' +
      'rook and pawns block the rest, and the knight administers the check.',
    hint: 'The bishop owns the dark squares. Check from the light one.',
  },
  {
    id: 'collaboration',
    name: 'Collaboration mate',
    family: 'Minor-piece mates',
    fen: '7k/4N2p/8/8/8/8/8/2B3K1 w - - 0 1',
    solution: ['Bb2#'],
    idea:
      'The suffocation mate with the roles swapped: here the knight covers the flight square ' +
      'and the bishop delivers the check.',
    hint: 'The knight has g8 covered — mate on the diagonal.',
  },
  {
    id: 'blackburne',
    name: "Blackburne's mate",
    family: 'Minor-piece mates',
    fen: 'r6k/p3N3/8/8/8/3B4/8/2B3K1 w - - 0 1',
    solution: ['Bb2#'],
    idea:
      'Three minor pieces and no heavy artillery: one bishop covers h7, the knight covers ' +
      'g8, and the second bishop checks down the long diagonal.',
    hint: 'Two of the three pieces are already in place.',
  },

  // ---------- Pawn mates ----------
  {
    id: 'david',
    name: 'David and Goliath mate',
    family: 'Pawn mates',
    fen: '6nk/7p/5PP1/8/8/8/8/1K6 w - - 0 1',
    solution: ['g7#'],
    idea:
      'The humblest piece finishes the game. The pawn is defended by its neighbour, and the ' +
      'king’s own knight and pawn leave it nowhere to go.',
    hint: 'Push, don’t capture — the other pawn defends the square.',
  },
];
