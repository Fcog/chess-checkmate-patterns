import { afterEach, describe, expect, it, vi } from 'vitest';
import { sendBatch, sendEmail, type Email } from './resend.ts';

const email = (to: string): Email => ({ from: 'a@x.test', to, subject: 's', html: '<p>h</p>', text: 't' });

afterEach(() => vi.unstubAllGlobals());

function stubFetch(status: number, body: unknown) {
  const fetch = vi.fn(async () => new Response(JSON.stringify(body), { status }));
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

describe('sendBatch', () => {
  it('posts to /emails/batch with the idempotency key', async () => {
    const fetch = stubFetch(200, { data: [{ id: 'e1' }, { id: 'e2' }] });
    const ids = await sendBatch('re_key', [email('a@y.test'), email('b@y.test')], 'daily/2026-11-12/1');
    expect(ids).toEqual(['e1', 'e2']);
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.resend.com/emails/batch');
    const headers = init.headers as Record<string, string>;
    expect(headers['Idempotency-Key']).toBe('daily/2026-11-12/1');
    expect(headers.Authorization).toBe('Bearer re_key');
    expect(JSON.parse(init.body as string)).toHaveLength(2);
  });

  it('rejects more than 100 emails', async () => {
    const list = Array.from({ length: 101 }, (_, i) => email(`u${i}@y.test`));
    await expect(sendBatch('k', list, 'key')).rejects.toThrow(/at most 100/);
  });

  it('throws with the status when Resend refuses', async () => {
    stubFetch(429, { message: 'rate limit' });
    await expect(sendBatch('k', [email('a@y.test')], 'key')).rejects.toThrow(/429/);
  });
});

describe('sendEmail', () => {
  it('returns the id', async () => {
    stubFetch(200, { id: 'abc' });
    await expect(sendEmail('k', email('a@y.test'))).resolves.toBe('abc');
  });
});
