// POST /resend-webhook — Resend events (contracts/http-api.md): hard bounces and spam
// complaints unsubscribe the address (FR-015).
import { serviceClient } from '../_shared/db.ts';
import { readEnv } from '../_shared/env.ts';
import { json } from '../_shared/http.ts';
import { verifySvix, webhookAction, type WebhookEvent } from '../_shared/webhook.ts';

const env = readEnv((k) => Deno.env.get(k), ['RESEND_WEBHOOK_SECRET', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
const db = serviceClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json(405, { ok: false, error: 'method' });
  const body = await req.text();
  if (!(await verifySvix(env.RESEND_WEBHOOK_SECRET, req.headers, body))) {
    return json(401, { ok: false, error: 'signature' });
  }

  try {
    const event = JSON.parse(body) as WebhookEvent;
    const action = webhookAction(event);
    const email = event.data?.to?.[0]?.trim().toLowerCase();
    if (action && email) {
      const { error } = await db
        .from('newsletter_subscribers')
        .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString(), unsubscribe_reason: action })
        .eq('email', email)
        .neq('status', 'unsubscribed');
      if (error) throw error;
    }
  } catch (err) {
    // Logged, but still 200: a retry from Resend wouldn't fix a bad payload.
    console.error('resend-webhook failed', err);
  }
  return json(200, { ok: true });
});
