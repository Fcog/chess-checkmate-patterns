import { describe, expect, it } from 'vitest';
import { clientIp, corsHeaders, json, preflight } from './http.ts';

const env = { SITE_URL: 'https://www.chess-patterns.com', ALLOWED_ORIGINS: ['http://localhost:4321'] };

describe('corsHeaders', () => {
  it('echoes an allowed origin', () => {
    expect(corsHeaders('https://www.chess-patterns.com', env)['Access-Control-Allow-Origin']).toBe(
      'https://www.chess-patterns.com',
    );
    expect(corsHeaders('http://localhost:4321', env)['Access-Control-Allow-Origin']).toBe(
      'http://localhost:4321',
    );
  });

  it('gives nothing to other origins, or none', () => {
    expect(corsHeaders('https://evil.example', env)).toEqual({});
    expect(corsHeaders(null, env)).toEqual({});
  });
});

describe('preflight', () => {
  it('answers OPTIONS with 204', () => {
    const req = new Request('https://x.test', {
      method: 'OPTIONS',
      headers: { Origin: 'https://www.chess-patterns.com' },
    });
    const res = preflight(req, env);
    expect(res?.status).toBe(204);
    expect(res?.headers.get('Access-Control-Allow-Origin')).toBe('https://www.chess-patterns.com');
  });

  it('ignores other methods', () => {
    expect(preflight(new Request('https://x.test', { method: 'POST' }), env)).toBeNull();
  });
});

describe('json', () => {
  it('builds a JSON response', async () => {
    const res = json(400, { ok: false }, { 'X-Test': '1' });
    expect(res.status).toBe(400);
    expect(res.headers.get('Content-Type')).toBe('application/json');
    expect(res.headers.get('X-Test')).toBe('1');
    expect(await res.json()).toEqual({ ok: false });
  });
});

describe('clientIp', () => {
  const req = (xff?: string) =>
    new Request('https://x.test', { headers: xff ? { 'x-forwarded-for': xff } : {} });

  it('takes the first forwarded address', () => {
    expect(clientIp(req(' 203.0.113.7 , 10.0.0.1, 10.0.0.2'))).toBe('203.0.113.7');
  });

  it('falls back to "unknown"', () => {
    expect(clientIp(req())).toBe('unknown');
  });
});
