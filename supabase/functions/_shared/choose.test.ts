import { describe, expect, it } from 'vitest';
import { choosePuzzle, type DayRow } from './choose.ts';

/** Deterministic random numbers in [0, 1). */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 2 ** 32;
    return s / 2 ** 32;
  };
}

const codes = ['a1', 'b2', 'c3', 'd4', 'e5'];

describe('choosePuzzle', () => {
  it('starts cycle 1 with any catalogue code', () => {
    const { cycle, code } = choosePuzzle({ catalogueCodes: codes, history: [] });
    expect(cycle).toBe(1);
    expect(codes).toContain(code);
  });

  it('never repeats a code within a cycle', () => {
    const history: DayRow[] = [
      { cycle: 1, puzzle_code: 'a1' },
      { cycle: 1, puzzle_code: 'b2' },
      { cycle: 1, puzzle_code: 'c3' },
      { cycle: 1, puzzle_code: 'd4' },
    ];
    expect(choosePuzzle({ catalogueCodes: codes, history })).toEqual({ cycle: 1, code: 'e5' });
  });

  it('starts a new cycle once every code has been sent', () => {
    const history = codes.map((c) => ({ cycle: 3, puzzle_code: c }));
    expect(choosePuzzle({ catalogueCodes: codes, history }).cycle).toBe(4);
  });

  it('ignores codes that are no longer in the catalogue', () => {
    const history = [...codes.slice(0, 4), 'gone'].map((c) => ({ cycle: 1, puzzle_code: c }));
    expect(choosePuzzle({ catalogueCodes: codes, history })).toEqual({ cycle: 1, code: 'e5' });
  });

  it('sends every code exactly once per cycle (FR-008)', () => {
    const catalogue = Array.from({ length: 40 }, (_, i) => `p${i}`);
    const random = seeded(7);
    const history: DayRow[] = [];
    for (let day = 0; day < catalogue.length; day++) {
      const pick = choosePuzzle({ catalogueCodes: catalogue, history, random });
      expect(pick.cycle).toBe(1);
      history.push({ cycle: pick.cycle, puzzle_code: pick.code });
    }
    expect(new Set(history.map((h) => h.puzzle_code)).size).toBe(catalogue.length);
    expect(choosePuzzle({ catalogueCodes: catalogue, history, random }).cycle).toBe(2);
  });
});
