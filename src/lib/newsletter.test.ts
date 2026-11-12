import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearSubscribed,
  hasSubscribed,
  markConfirmed,
  markPending,
  NEWSLETTER_KEY,
  PENDING_TTL_MS,
} from './newsletter';

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  };
}

const throwing = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('blocked');
  },
  removeItem: () => {
    throw new Error('blocked');
  },
};

describe('newsletter marker', () => {
  beforeEach(() => vi.stubGlobal('localStorage', memoryStorage()));
  afterEach(() => vi.unstubAllGlobals());

  const t0 = Date.UTC(2026, 10, 12, 10);
  const HOUR = 60 * 60 * 1000;

  it('is missing at first', () => {
    expect(hasSubscribed(t0)).toBe(false);
  });

  it('hides the call to action while a pending marker is younger than 7 days', () => {
    markPending(t0);
    expect(hasSubscribed(t0 + PENDING_TTL_MS - HOUR)).toBe(true);
  });

  it('shows it again, and removes the marker, after 7 days unconfirmed', () => {
    markPending(t0);
    expect(hasSubscribed(t0 + PENDING_TTL_MS)).toBe(false);
    expect(localStorage.getItem(NEWSLETTER_KEY)).toBeNull();
  });

  it('keeps a confirmed marker at any age', () => {
    markConfirmed();
    expect(hasSubscribed(t0 + 365 * 24 * HOUR)).toBe(true);
  });

  it('forgets the marker on clear', () => {
    markConfirmed();
    clearSubscribed();
    expect(hasSubscribed(t0)).toBe(false);
  });

  it.each(['1', 'not json', '{"state":"pending"}', '{"state":"other"}'])('treats %s as missing', (raw) => {
    localStorage.setItem(NEWSLETTER_KEY, raw);
    expect(hasSubscribed(t0)).toBe(false);
  });

  it('copes with blocked storage', () => {
    vi.stubGlobal('localStorage', throwing);
    expect(() => markPending(t0)).not.toThrow();
    expect(() => markConfirmed()).not.toThrow();
    expect(() => clearSubscribed()).not.toThrow();
    expect(hasSubscribed(t0)).toBe(false);
  });
});
