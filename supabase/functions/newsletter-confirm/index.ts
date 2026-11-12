// POST /newsletter-confirm — the confirm page (contracts/http-api.md).
import { serviceClient } from '../_shared/db.ts';
import { readEnv } from '../_shared/env.ts';
import { corsHeaders, json, preflight } from '../_shared/http.ts';
import { nextSendAt } from '../_shared/schedule.ts';
import { isUuid } from '../_shared/validate.ts';

const env = readEnv((k) => Deno.env.get(k), ['SITE_URL', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
const db = serviceClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
  const early = preflight(req, env);
  if (early) return early;
  const cors = corsHeaders(req.headers.get('Origin'), env);
  if (req.method !== 'POST') return json(405, { ok: false, error: 'method' }, cors);

  try {
    const { token } = await req.json().catch(() => ({}));
    if (!isUuid(token)) return json(200, { ok: true, result: 'invalid' }, cors);

    const { data: row, error } = await db
      .from('newsletter_subscribers')
      .select('id, status, confirm_expires_at')
      .eq('confirm_token', token)
      .maybeSingle();
    if (error) throw error;

    const now = new Date();
    if (!row || row.status === 'unsubscribed') return json(200, { ok: true, result: 'invalid' }, cors);
    if (row.status === 'active') return json(200, { ok: true, result: 'already' }, cors);
    if (!row.confirm_expires_at || Date.parse(row.confirm_expires_at) < now.getTime()) {
      return json(200, { ok: true, result: 'invalid' }, cors);
    }

    // Only pending → active; the guard on status makes a double click harmless.
    const { error: updateError } = await db
      .from('newsletter_subscribers')
      .update({ status: 'active', confirmed_at: now.toISOString() })
      .eq('id', row.id)
      .eq('status', 'pending');
    if (updateError) throw updateError;

    return json(200, { ok: true, result: 'confirmed', firstSend: nextSendAt(now).toISOString() }, cors);
  } catch (err) {
    console.error('newsletter-confirm failed', err);
    return json(500, { ok: false, error: 'server' }, cors);
  }
});
