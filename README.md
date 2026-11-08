# Chess Patterns

Live at **[chess-patterns.com](https://www.chess-patterns.com)**.

An interactive trainer for the chess patterns strong players recognise at a glance. Each topic has a **Learn** section (one motif at a time, with explanations) and a **Practice** section (blind puzzles that hide which motif you're looking at):

- **Checkmates** (`/checkmates`): 39 classic mating patterns — Anastasia's, Arabian, Boden's, back-rank, Epaulette and more.
- **Tactics** (`/tactics`): forks, pins, skewers, discovered and double checks, deflection, decoy and removing the guard.
- **Attacks** (`/attacks`): the Greek gift sacrifice (Bxh7+) and its h-pawn version — the set-up, when it works and when it fails, every main defence, and "Sound or not?" quiz positions.

---

## Tech Stack

- **Site framework:** [Astro](https://astro.build/) — a static HTML page per motif (`/<topic>/<id>`), a practice page per topic (`/<topic>/practice`) and a share page per exercise, with per-page SEO tags and a generated sitemap
- **Interactive UI:** [React](https://react.dev/) islands with [TypeScript](https://www.typescriptlang.org/)
- **Chess Logic & Validation:** [`chess.js`](https://github.com/jhlywa/chess.js) — FEN parsing, legal move generation, SAN formatting, and check/checkmate detection
- **Chessboard UI:** [`chessground`](https://github.com/lichess-org/chessground) — Lichess's interactive board library
- **Testing:** [Vitest](https://vitest.dev/) — automated verification of the entire puzzle library, plus build checks of every generated page
- **Persistence:** Browser `localStorage` (`checkmate-patterns:solved`, the original key, kept so existing progress survives the rename)
- **Hosting:** [Vercel](https://vercel.com/) (`vercel.json` holds the redirects, including the old `checkmate-patterns.com` domain)

The site name and URL live in `src/lib/site.ts`; topics in `src/lib/topics.ts`; content in `src/data/<topic>/`.

---

## Features

### Interactive Puzzle Board
- **Legal Move Enforcement:** Computes legal destinations from the current FEN via `chess.js` and feeds them into `chessground` so only valid moves can be played.
- **Wrong-Move Snapback:** Playing a legal move that doesn't force mate displays feedback (`"<move> does not force mate. Try again."`) and automatically snaps the piece back after a short delay.
- **Multi-Move Forced Replies:** For multi-move patterns (such as *Philidor's legacy*), the defender's forced response is automatically played after a brief delay so the player can complete the mating sequence.
- **Live SAN Move List:** Displays the played line in standard algebraic notation as moves are made on the board.

### Learning Tools & Controls
- **Hint:** Reveals a tactical nudge for the current pattern without giving away the exact square.
- **Show Solution:** Steps through the remaining moves of the solution automatically with timed animations (`750ms` per ply).
- **Pattern Idea Breakdown:** Once a puzzle is solved (or revealed), displays a prose explanation of the geometry, piece coordination, and historical context behind the checkmate pattern.
- **Reset & Next Pattern:** Quickly retry the current position or cycle to the next pattern in the catalog.

### Progress Tracking
- Tracks solved puzzles across sessions in `localStorage` (note: revealing a solution does not mark the puzzle as solved).
- Displays a live `solved / total` counter in the header and checkmarks (`✓`) next to completed patterns in the sidebar.

### Verified Puzzle Integrity
The test suite (`src/lib/patterns.test.ts`) validates every pattern in the catalog to ensure:
- Every FEN is legal and starts with neither king in check.
- Every solution plays out legally and ends in checkmate.
- Every auto-played defender reply is strictly forced (the defender's only legal move).
- Every puzzle has a **unique** first move that forces mate within the target move count.

---

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Run the puzzle validation test suite
npm test

# Type-check and build for production
npm run build

# Build, then check the generated pages (titles, canonical URLs, sitemap)
npm run test:build
```

## Project Structure

```
src/
  pages/                 index.astro, practice.astro, 404.astro, patterns/[id].astro
  layouts/Base.astro     shared <head>: SEO tags, analytics, view transitions
  components/            Astro components (SeoHead, PatternArticle)
  components/react/      interactive trainer: PatternTrainer, PracticeTrainer, Board, usePuzzle, …
  lib/                   pattern and exercise data, puzzle logic, sounds, helpers
  styles/styles.css
tests/build.test.ts      checks the built HTML in dist/
```
