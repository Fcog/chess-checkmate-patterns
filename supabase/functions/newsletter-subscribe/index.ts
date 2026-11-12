// POST /newsletter-subscribe — the homepage form (contracts/http-api.md).
import { serviceClient } from '../_shared/db.ts';
import { renderConfirmationEmail } from '../_shared/email.ts';
import { readEnv } from '../_shared/env.ts';
import { clientIp, corsHeaders, json, preflight } from '../_shared/http.ts';
import { hashIp, RATE_LIMIT, RATE_WINDOW_MS } from '../_shared/ratelimit.ts';
import { sendEmail } from '../_shared/resend.ts';
import { decideSubscribe, type SubscriberState } from '../_shared/subscribe.ts';
import { isHoneypot, isValidEmail, normalizeEmail } from '../_shared/validate.ts';

const env = readEnv((k) => Deno.env.get(k), [
  'RESEND_API_KEY',
  'FROM_EMAIL',
  'SITE_URL',
  'IP_HASH_SECRET',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
]);
const db = serviceClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
  const early = preflight(req, env);
  if (early) return early;
  const cors = corsHeaders(req.headers.get('Origin'), env);
  if (req.method !== 'POST') return json(405, { ok: false, error: 'method' }, cors);

  try {
    const body = await req.json().catch(() => ({}));

    // 1. Honeypot: pretend it worked, store nothing.
    if (isHoneypot(body.website)) return json(200, { ok: true }, cors);

    // 2. Address check.
    const email = normalizeEmail(typeof body.email === 'string' ? body.email : '');
    if (!isValidEmail(email)) return json(400, { ok: false, error: 'invalid-email' }, cors);

    // 3. Rate limit on the scrambled IP (kept 24 hours).
    const ipHash = await hashIp(env.IP_HASH_SECRET, clientIp(req));
    const now = new Date();
    await db
      .from('newsletter_signup_attempts')
      .delete()
      .lt('at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString());
    const { count, error: countError } = await db
      .from('newsletter_signup_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gt('at', new Date(now.getTime() - RATE_WINDOW_MS).toISOString());
    if (countError) throw countError;
    if ((count ?? 0) >= RATE_LIMIT) return json(429, { ok: false, error: 'rate-limited' }, cors);
    const { error: attemptError } = await db.from('newsletter_signup_attempts').insert({ ip_hash: ipHash });
    if (attemptError) throw attemptError;

    // 4. Apply the state table.
    const { data: existing, error: readError } = await db
      .from('newsletter_subscribers')
      .select('id, status, confirmation_sent_at, confirm_token')
      .eq('email', email)
      .maybeSingle();
    if (readError) throw readError;

    const decision = decideSubscribe(existing as SubscriberState | null, now);
    let row = existing as { id: string; confirm_token: string } | null;

    if (decision.action === 'insert') {
      const { error } = await db
        .from('newsletter_subscribers')
        .upsert({ email, status: 'pending' }, { onConflict: 'email', ignoreDuplicates: true });
      if (error) throw error;
      const { data, error: reread } = await db
        .from('newsletter_subscribers')
        .select('id, confirm_token')
        .eq('email', email)
        .single();
      if (reread) throw reread;
      row = data;
    } else if (decision.action === 'reactivate') {
      const { data, error } = await db
        .from('newsletter_subscribers')
        .update({
          status: 'pending',
          confirm_token: crypto.randomUUID(),
          subscribed_at: now.toISOString(),
          confirmed_at: null,
          unsubscribed_at: null,
          unsubscribe_reason: null,
        })
        .eq('id', row!.id)
        .select('id, confirm_token')
        .single();
      if (error) throw error;
      row = data;
    }

    // 5. Send the confirmation email, then record when it went out.
    if (decision.send && row) {
      const confirmUrl = `${env.SITE_URL}/newsletter/confirm?token=${row.confirm_token}`;
      const rendered = renderConfirmationEmail({ confirmUrl, siteUrl: env.SITE_URL });
      await sendEmail(env.RESEND_API_KEY, { from: env.FROM_EMAIL, to: email, ...rendered }, env.RESEND_API_URL);
      const { error } = await db
        .from('newsletter_subscribers')
        .update({
          confirmation_sent_at: now.toISOString(),
          confirm_expires_at: decision.confirmExpiresAt!.toISOString(),
        })
        .eq('id', row.id);
      if (error) throw error;
    }

    // Same answer for new, pending and active addresses (FR-005).
    return json(200, { ok: true }, cors);
  } catch (err) {
    console.error('newsletter-subscribe failed', err);
    return json(500, { ok: false, error: 'server' }, cors);
  }
});
