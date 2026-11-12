import { describe, expect, it } from 'vitest';
import { svixSignature, verifySvix, webhookAction } from './webhook.ts';

const secret = 'whsec_' + btoa('test-secret-key-for-webhooks!!');
const body = JSON.stringify({ type: 'email.bounced', data: { to: ['a@b.test'] } });
const now = new Date('2026-11-12T10:00:00Z');
const timestamp = String(Math.floor(now.getTime() / 1000));

async function headersFor(payload: string, ts = timestamp) {
  const sig = await svixSignature(secret, 'msg_1', ts, payload);
  return new Headers({ 'svix-id': 'msg_1', 'svix-timestamp': ts, 'svix-signature': `v1,bogus v1,${sig}` });
}

describe('verifySvix', () => {
  it('accepts a correctly signed payload', async () => {
    expect(await verifySvix(secret, await headersFor(body), body, now)).toBe(true);
  });

  it('rejects a changed body', async () => {
    expect(await verifySvix(secret, await headersFor(body), body + ' ', now)).toBe(false);
  });

  it('rejects an old timestamp', async () => {
    const old = String(Number(timestamp) - 6 * 60);
    expect(await verifySvix(secret, await headersFor(body, old), body, now)).toBe(false);
  });

  it('rejects missing headers', async () => {
    expect(await verifySvix(secret, new Headers(), body, now)).toBe(false);
  });
});

describe('webhookAction', () => {
  it('unsubscribes on a hard bounce only', () => {
    expect(webhookAction({ type: 'email.bounced', data: { bounce: { type: 'Permanent' } } })).toBe('bounce');
    expect(webhookAction({ type: 'email.bounced', data: { bounce: { type: 'Transient' } } })).toBeNull();
  });

  it('unsubscribes on a complaint', () => {
    expect(webhookAction({ type: 'email.complained' })).toBe('complaint');
  });

  it('ignores everything else', () => {
    expect(webhookAction({ type: 'email.delivered' })).toBeNull();
    expect(webhookAction({})).toBeNull();
  });
});
