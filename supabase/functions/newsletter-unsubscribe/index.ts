// POST /newsletter-unsubscribe — the unsubscribe page ({token} JSON body) and RFC 8058
// one-click (?token=… with the form body List-Unsubscribe=One-Click). GET is refused so link
// scanners can't unsubscribe anyone (research R9).
import { serviceClient } from '../_shared/db.ts';
import { readEnv } from '../_shared/env.ts';
import { corsHeaders, json, preflight } from '../_shared/http.ts';
import { isUuid } from '../_shared/validate.ts';

const env = readEnv((k) => Deno.env.get(k), ['SITE_URL', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
const db = serviceClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
  const early = preflight(req, env);
  if (early) return early;
  // The one-click POST comes from the mail provider without an Origin: always allowed.
  const cors = corsHeaders(req.headers.get('Origin'), env);
  if (req.method !== 'POST') return json(405, { ok: false, error: 'method' }, cors);

  try {
    let token: unknown = new URL(req.url).searchParams.get('token');
    if (!token && (req.headers.get('Content-Type') ?? '').includes('application/json')) {
      token = (await req.json().catch(() => ({}))).token;
    }
    if (!isUuid(token)) return json(200, { ok: true, result: 'invalid' }, cors);

    const { data: row, error } = await db
      .from('newsletter_subscribers')
      .select('id, status')
      .eq('unsubscribe_token', token)
      .maybeSingle();
    if (error) throw error;
    if (!row) return json(200, { ok: true, result: 'invalid' }, cors);

    if (row.status !== 'unsubscribed') {
      const { error: updateError } = await db
        .from('newsletter_subscribers')
        .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString(), unsubscribe_reason: 'user' })
        .eq('id', row.id);
      if (updateError) throw updateError;
    }
    return json(200, { ok: true, result: 'unsubscribed' }, cors);
  } catch (err) {
    console.error('newsletter-unsubscribe failed', err);
    return json(500, { ok: false, error: 'server' }, cors);
  }
});
