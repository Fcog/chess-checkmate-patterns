import { describe, expect, it } from 'vitest';
import { boardAlt, boardPng, boardSvg, pieceSvgs } from './board-image';

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

describe('board pictures', () => {
  it('reads all 12 cburnett pieces', () => {
    expect(pieceSvgs().size).toBe(12);
  });

  it('draws 64 squares and every piece', () => {
    const svg = boardSvg(START, 'white');
    expect(svg.match(/data-square=/g)).toHaveLength(64);
    expect(svg.match(/data-piece=/g)).toHaveLength(32);
  });

  it('puts a1 bottom-left for White and a8 bottom-right for Black', () => {
    expect(boardSvg(START, 'white')).toContain('data-square="a1" x="0" y="560"');
    expect(boardSvg(START, 'black')).toContain('data-square="a8" x="560" y="560"');
  });

  it('makes a PNG', () => {
    const png = boardPng('6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1', 'white');
    expect([...png.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  });
});

describe('boardAlt', () => {
  it('lists pieces by kind, in file order', () => {
    expect(boardAlt(START)).toBe(
      'Chess position, White to move. ' +
        'White: king e1, queen d1, rooks a1, h1, bishops c1, f1, knights b1, g1, pawns a2, b2, c2, d2, e2, f2, g2, h2. ' +
        'Black: king e8, queen d8, rooks a8, h8, bishops c8, f8, knights b8, g8, pawns a7, b7, c7, d7, e7, f7, g7, h7.',
    );
  });

  it('says who is to move', () => {
    expect(boardAlt('6k1/8/8/8/8/8/8/6K1 b - - 0 1')).toBe(
      'Chess position, Black to move. White: king g1. Black: king g8.',
    );
  });
});
