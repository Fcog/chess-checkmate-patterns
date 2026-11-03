import { describe, expect, it } from 'vitest';
import { exercises } from './exercises';
import { patterns } from './patterns';
import { exerciseByCode, shareCode } from './share';

describe('share codes', () => {
  const codes = exercises.map((ex) => shareCode(ex.id));

  it('are five lowercase letters or digits', () => {
    for (const code of codes) expect(code).toMatch(/^[a-z0-9]{5}$/);
  });

  it('are unique for every exercise', () => {
    expect(new Set(codes).size).toBe(exercises.length);
  });

  it('lead back to the same exercise', () => {
    for (const ex of exercises) expect(exerciseByCode(shareCode(ex.id))?.id).toBe(ex.id);
  });

  it('do not give away the pattern', () => {
    for (const code of codes) {
      for (const pattern of patterns) expect(code).not.toContain(pattern.id);
    }
  });

  it('are stable', () => {
    expect(shareCode('back-rank-1')).toBe(shareCode('back-rank-1'));
    expect(exerciseByCode('zzzzz')).toBeUndefined();
  });
});
