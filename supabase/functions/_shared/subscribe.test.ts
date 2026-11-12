import { describe, expect, it } from 'vitest';
import { CONFIRM_TTL_MS, decideSubscribe } from './subscribe.ts';

const now = new Date('2026-11-12T10:00:00Z');
const minutesAgo = (m: number) => new Date(now.getTime() - m * 60_000).toISOString();

describe('decideSubscribe', () => {
  it('inserts and sends for a new address', () => {
    const d = decideSubscribe(null, now);
    expect(d).toMatchObject({ action: 'insert', send: true });
    expect(d.confirmExpiresAt?.getTime()).toBe(now.getTime() + CONFIRM_TTL_MS);
  });

  it('does not re-send to a pending address within the hour', () => {
    expect(decideSubscribe({ status: 'pending', confirmation_sent_at: minutesAgo(59) }, now)).toEqual({
      action: 'none',
      send: false,
    });
  });

  it('re-sends after an hour and extends the expiry', () => {
    const d = decideSubscribe({ status: 'pending', confirmation_sent_at: minutesAgo(61) }, now);
    expect(d).toMatchObject({ action: 'resend', send: true });
    expect(d.confirmExpiresAt?.getTime()).toBe(now.getTime() + CONFIRM_TTL_MS);
  });

  it('does nothing for an active subscriber', () => {
    expect(decideSubscribe({ status: 'active', confirmation_sent_at: minutesAgo(5) }, now)).toEqual({
      action: 'none',
      send: false,
    });
  });

  it('reactivates an unsubscribed address with a new confirmation', () => {
    expect(decideSubscribe({ status: 'unsubscribed', confirmation_sent_at: null }, now)).toMatchObject({
      action: 'reactivate',
      send: true,
    });
  });
});
