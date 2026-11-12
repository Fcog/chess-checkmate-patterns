/** Sign-up rate limit: 5 per IP per rolling hour, keyed on a scrambled IP (research R8). */

export const RATE_LIMIT = 5;
export const RATE_WINDOW_MS = 60 * 60 * 1000;

/**
 * HMAC-SHA256 of the IP under a secret key, as lower-case hex. Keyed (not a plain hash) so
 * the ~4 billion IPv4 addresses can't simply be tried one by one to reverse it.
 */
export async function hashIp(secret: string, ip: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(ip)));
  return [...sig].map((b) => b.toString(16).padStart(2, '0')).join('');
}
