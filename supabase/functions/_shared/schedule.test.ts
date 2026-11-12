import { describe, expect, it } from 'vitest';
import { nextSendAt, utcDay } from './schedule.ts';

describe('nextSendAt', () => {
  it('is today at 07:00 UTC before then', () => {
    expect(nextSendAt(new Date('2026-11-12T06:59:59Z')).toISOString()).toBe('2026-11-12T07:00:00.000Z');
  });

  it('is tomorrow at exactly 07:00 and after', () => {
    expect(nextSendAt(new Date('2026-11-12T07:00:00Z')).toISOString()).toBe('2026-11-13T07:00:00.000Z');
    expect(nextSendAt(new Date('2026-11-12T23:30:00Z')).toISOString()).toBe('2026-11-13T07:00:00.000Z');
  });
});

describe('utcDay', () => {
  it('uses the UTC date', () => {
    expect(utcDay(new Date('2026-11-12T23:30:00-05:00'))).toBe('2026-11-13');
  });
});
