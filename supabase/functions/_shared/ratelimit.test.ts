import { describe, expect, it } from 'vitest';
import { hashIp } from './ratelimit.ts';

describe('hashIp', () => {
  it('is stable, keyed and hides the address', async () => {
    const a = await hashIp('secret', '203.0.113.7');
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(await hashIp('secret', '203.0.113.7')).toBe(a);
    expect(await hashIp('other', '203.0.113.7')).not.toBe(a);
    expect(a).not.toContain('203');
  });
});
