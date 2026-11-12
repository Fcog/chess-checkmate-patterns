/**
 * Resend webhooks (research R10): Svix signature check, and which events unsubscribe an
 * address (FR-015).
 */

const TOLERANCE_S = 5 * 60;

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const bin = atob(value);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

function toBase64(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function equal(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** HMAC-SHA256 signature, base64, as Svix computes it. Exported for tests. */
export async function svixSignature(secret: string, id: string, timestamp: string, body: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    fromBase64(secret.replace(/^whsec_/, '')),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${id}.${timestamp}.${body}`));
  return toBase64(new Uint8Array(sig));
}

/**
 * Checks `svix-id`, `svix-timestamp` and `svix-signature` (space-separated `v1,<base64>`
 * entries) against the raw body. The timestamp must be within 5 minutes of `now`.
 */
export async function verifySvix(
  secret: string,
  headers: Headers,
  body: string,
  now: Date = new Date(),
): Promise<boolean> {
  const id = headers.get('svix-id');
  const timestamp = headers.get('svix-timestamp');
  const signatures = headers.get('svix-signature');
  if (!id || !timestamp || !signatures || !secret) return false;
  if (Math.abs(now.getTime() / 1000 - Number(timestamp)) > TOLERANCE_S) return false;
  const expected = await svixSignature(secret, id, timestamp, body);
  return signatures
    .split(' ')
    .map((entry) => entry.split(','))
    .some(([version, sig]) => version === 'v1' && sig !== undefined && equal(sig, expected));
}

export type WebhookEvent = {
  type?: string;
  data?: { to?: string[]; bounce?: { type?: string } };
};

/** `bounce` for a hard bounce, `complaint` for a spam report, otherwise null. */
export function webhookAction(event: WebhookEvent): 'bounce' | 'complaint' | null {
  if (event.type === 'email.bounced') return event.data?.bounce?.type === 'Permanent' ? 'bounce' : null;
  if (event.type === 'email.complained') return 'complaint';
  return null;
}
