/**
 * Board pictures for the newsletter (research R3). Build time only (Node): draws a position as
 * SVG with the site's cburnett pieces and brown board, and turns it into a PNG, because Gmail
 * and Outlook don't display SVG.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';

export type Orientation = 'white' | 'black';

export const BOARD_PX = 640;
const SQUARE = BOARD_PX / 8;
const LIGHT = '#f0d9b5';
const DARK = '#b58863';

const ROLES: Record<string, string> = { k: 'king', q: 'queen', r: 'rook', b: 'bishop', n: 'knight', p: 'pawn' };

let pieces: Map<string, string> | undefined;

/**
 * The 12 piece drawings from chessground's cburnett theme, keyed "white-knight" etc., as the
 * inner markup of each 45×45 SVG.
 */
export function pieceSvgs(): Map<string, string> {
  if (pieces) return pieces;
  const css = readFileSync(
    join(process.cwd(), 'node_modules/chessground/assets/chessground.cburnett.css'),
    'utf8',
  );
  const found = new Map<string, string>();
  const rule = /piece\.(\w+)\.(white|black) \{\s*background-image: url\('data:image\/svg\+xml;base64,([^']+)'\)/g;
  for (const [, role, color, b64] of css.matchAll(rule)) {
    const svg = Buffer.from(b64, 'base64').toString('utf8');
    const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
    found.set(`${color}-${role}`, inner);
  }
  if (found.size !== 12) throw new Error(`Expected 12 cburnett pieces, found ${found.size}`);
  pieces = found;
  return found;
}

type Placed = { color: 'white' | 'black'; role: string; file: number; rank: number };

/** Pieces of a FEN with 0-based file (a = 0) and rank (1st rank = 0). */
export function placedPieces(fen: string): Placed[] {
  const rows = fen.split(' ')[0].split('/');
  const list: Placed[] = [];
  rows.forEach((row, i) => {
    let file = 0;
    for (const ch of row) {
      if (/\d/.test(ch)) {
        file += Number(ch);
        continue;
      }
      const color = ch === ch.toUpperCase() ? 'white' : 'black';
      list.push({ color, role: ROLES[ch.toLowerCase()], file, rank: 7 - i });
      file += 1;
    }
  });
  return list;
}

/** The position as an SVG, seen from `orientation`. No highlights or arrows. */
export function boardSvg(fen: string, orientation: Orientation): string {
  const svgPieces = pieceSvgs();
  const x = (file: number) => (orientation === 'white' ? file : 7 - file) * SQUARE;
  const y = (rank: number) => (orientation === 'white' ? 7 - rank : rank) * SQUARE;
  const squares: string[] = [];
  for (let file = 0; file < 8; file++) {
    for (let rank = 0; rank < 8; rank++) {
      const dark = (file + rank) % 2 === 0; // a1 is dark
      squares.push(
        `<rect data-square="${'abcdefgh'[file]}${rank + 1}" x="${x(file)}" y="${y(rank)}" width="${SQUARE}" height="${SQUARE}" fill="${dark ? DARK : LIGHT}"/>`,
      );
    }
  }
  const scale = SQUARE / 45;
  const drawn = placedPieces(fen).map(
    (p) =>
      `<g data-piece="${p.color}-${p.role}" transform="translate(${x(p.file)} ${y(p.rank)}) scale(${scale})">${svgPieces.get(`${p.color}-${p.role}`)}</g>`,
  );
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${BOARD_PX}" height="${BOARD_PX}" viewBox="0 0 ${BOARD_PX} ${BOARD_PX}">` +
    squares.join('') +
    drawn.join('') +
    '</svg>'
  );
}

export function boardPng(fen: string, orientation: Orientation): Buffer {
  const svg = boardSvg(fen, orientation);
  return new Resvg(svg, { fitTo: { mode: 'width', value: BOARD_PX } }).render().asPng();
}

const ORDER = ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn'];
const PLURAL: Record<string, string> = {
  king: 'king',
  queen: 'queens',
  rook: 'rooks',
  bishop: 'bishops',
  knight: 'knights',
  pawn: 'pawns',
};

function describe(list: Placed[]): string {
  const parts: string[] = [];
  for (const role of ORDER) {
    const squares = list
      .filter((p) => p.role === role)
      .sort((a, b) => a.file - b.file || a.rank - b.rank)
      .map((p) => `${'abcdefgh'[p.file]}${p.rank + 1}`);
    if (squares.length === 0) continue;
    parts.push(`${squares.length === 1 ? role : PLURAL[role]} ${squares.join(', ')}`);
  }
  return parts.join(', ');
}

/** Text description of the picture, for email apps that block images (FR-012). */
export function boardAlt(fen: string): string {
  const all = placedPieces(fen);
  const toMove = fen.split(' ')[1] === 'w' ? 'White' : 'Black';
  return (
    `Chess position, ${toMove} to move. ` +
    `White: ${describe(all.filter((p) => p.color === 'white'))}. ` +
    `Black: ${describe(all.filter((p) => p.color === 'black'))}.`
  );
}
