/** Minimal Resend REST client (https://resend.com/docs/api-reference). Uses global fetch. */

export type Email = {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
};

/** Resend's API. RESEND_API_URL overrides it, for a local mock in tests (quickstart.md). */
export const RESEND_API = 'https://api.resend.com';
export const BATCH_LIMIT = 100;

async function post(
  apiKey: string,
  path: string,
  body: unknown,
  extra: Record<string, string> = {},
  baseUrl = RESEND_API,
) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...extra,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Resend ${path} failed: ${res.status} ${text}`);
  return text ? JSON.parse(text) : {};
}

/** Sends one email and returns its Resend id. */
export async function sendEmail(apiKey: string, email: Email, baseUrl = RESEND_API): Promise<string> {
  const data = await post(apiKey, '/emails', email, {}, baseUrl);
  return data.id as string;
}

/**
 * Sends up to 100 emails in one call. The idempotency key makes a repeat of the same batch
 * (within 24 hours) a no-op at Resend, so a resumed send can't email anyone twice.
 * Returns the Resend ids, in the same order as `emails`.
 */
export async function sendBatch(
  apiKey: string,
  emails: Email[],
  idempotencyKey: string,
  baseUrl = RESEND_API,
): Promise<string[]> {
  if (emails.length > BATCH_LIMIT) throw new Error(`A batch holds at most ${BATCH_LIMIT} emails`);
  if (emails.length === 0) return [];
  const data = await post(apiKey, '/emails/batch', emails, { 'Idempotency-Key': idempotencyKey }, baseUrl);
  return ((data.data ?? []) as { id: string }[]).map((d) => d.id);
}
