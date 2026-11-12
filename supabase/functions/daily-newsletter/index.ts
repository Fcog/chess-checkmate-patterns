// POST /daily-newsletter — the 07:00 UTC send, called by pg_cron (contracts/http-api.md,
// research R4–R6).
//
// Query: none = normal run; retry=1 = the 07:30 backup run, which also retries failed
// batches once; force=1 = the same, for a manual run. Neither ever re-sends `sent` rows.
import { choosePuzzle, type DayRow } from '../_shared/choose.ts';
import { serviceClient } from '../_shared/db.ts';
import { renderDailyEmail, type CataloguePuzzle } from '../_shared/email.ts';
import { readEnv } from '../_shared/env.ts';
import { json } from '../_shared/http.ts';
import { BATCH_LIMIT, sendBatch, type Email } from '../_shared/resend.ts';
import { utcDay } from '../_shared/schedule.ts';

declare const EdgeRuntime: { waitUntil(promise: Promise<unknown>): void };

const env = readEnv((k) => Deno.env.get(k), [
  'RESEND_API_KEY',
  'FROM_EMAIL',
  'SITE_URL',
  'CRON_SECRET',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
]);
const db = serviceClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

/** A claimed batch untouched for this long belongs to a run that died (research R6). */
const STALE_CLAIM_MS = 5 * 60 * 1000;

type Recipient = { subscriber_id: string; email: string; unsubscribe_token: string };
type DayRecord = {
  day: string;
  cycle: number;
  puzzle_code: string;
  send_started_at: string | null;
  send_finished_at: string | null;
};

function must<T>(result: { data: T; error: unknown }): T {
  if (result.error) throw result.error;
  return result.data;
}

async function loadCatalogue(): Promise<CataloguePuzzle[]> {
  const res = await fetch(`${env.SITE_URL}/newsletter/puzzles.json`);
  if (!res.ok) throw new Error(`Catalogue fetch failed: ${res.status}`);
  const body = await res.json();
  if (body.version !== 1 || !Array.isArray(body.puzzles) || body.puzzles.length === 0) {
    throw new Error('Catalogue is empty or has an unknown version');
  }
  return body.puzzles;
}

/** Today's row, choosing (or re-choosing a removed) puzzle while the send hasn't started. */
async function todaysPuzzle(day: string, catalogue: CataloguePuzzle[]): Promise<DayRecord> {
  const codes = catalogue.map((p) => p.code);
  const row = must(await db.from('newsletter_days').select('*').eq('day', day).maybeSingle()) as DayRecord | null;
  if (row && (codes.includes(row.puzzle_code) || row.send_started_at)) return row;

  const history = must(await db.from('newsletter_days').select('cycle, puzzle_code').neq('day', day)) as DayRow[];
  const { cycle, code } = choosePuzzle({ catalogueCodes: codes, history });
  if (row) {
    must(await db.from('newsletter_days').update({ cycle, puzzle_code: code }).eq('day', day).is('send_started_at', null));
  } else {
    must(
      await db
        .from('newsletter_days')
        .upsert({ day, cycle, puzzle_code: code }, { onConflict: 'day', ignoreDuplicates: true }),
    );
  }
  return must(await db.from('newsletter_days').select('*').eq('day', day).single()) as DayRecord;
}

function emailFor(puzzle: CataloguePuzzle, day: string, r: Recipient): Email {
  const rendered = renderDailyEmail({
    puzzle,
    day,
    siteUrl: env.SITE_URL,
    unsubscribeUrl: `${env.SITE_URL}/newsletter/unsubscribe?token=${r.unsubscribe_token}`,
    oneClickUrl: `${env.SUPABASE_URL}/functions/v1/newsletter-unsubscribe?token=${r.unsubscribe_token}`,
  });
  return { from: env.FROM_EMAIL, to: r.email, ...rendered };
}

/** Sends one batch with its idempotency key, then marks its rows sent or failed. */
async function sendClaimed(day: string, batchNo: number, recipients: Recipient[], puzzle: CataloguePuzzle) {
  const ids = recipients.map((r) => r.subscriber_id);
  try {
    const resendIds = await sendBatch(
      env.RESEND_API_KEY,
      recipients.map((r) => emailFor(puzzle, day, r)),
      `daily/${day}/${batchNo}`,
      env.RESEND_API_URL,
    );
    // One statement for the whole batch (the rows exist, so this only updates them).
    const updatedAt = new Date().toISOString();
    must(
      await db.from('newsletter_deliveries').upsert(
        ids.map((id, i) => ({
          day,
          subscriber_id: id,
          batch_no: batchNo,
          status: 'sent',
          resend_id: resendIds[i] ?? null,
          updated_at: updatedAt,
        })),
        { onConflict: 'day,subscriber_id' },
      ),
    );
  } catch (err) {
    console.error(`daily-newsletter batch ${day}/${batchNo} failed`, err);
    must(
      await db
        .from('newsletter_deliveries')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('day', day)
        .in('subscriber_id', ids),
    );
  }
}

/** Re-sends batches still `claimed` by a run that died, under their original keys. */
async function resendStale(day: string, puzzle: CataloguePuzzle) {
  const cutoff = new Date(Date.now() - STALE_CLAIM_MS).toISOString();
  const rows = must(
    await db
      .from('newsletter_deliveries')
      .select('batch_no, subscriber_id, newsletter_subscribers(email, unsubscribe_token)')
      .eq('day', day)
      .eq('status', 'claimed')
      .lt('updated_at', cutoff),
  ) as unknown as {
    batch_no: number;
    subscriber_id: string;
    newsletter_subscribers: { email: string; unsubscribe_token: string } | null;
  }[];
  const batches = new Map<number, Recipient[]>();
  for (const row of rows) {
    if (!row.newsletter_subscribers) continue;
    const list = batches.get(row.batch_no) ?? [];
    list.push({ subscriber_id: row.subscriber_id, ...row.newsletter_subscribers });
    batches.set(row.batch_no, list);
  }
  for (const [batchNo, recipients] of batches) await sendClaimed(day, batchNo, recipients, puzzle);
}

async function counts(day: string) {
  const rows = must(await db.from('newsletter_deliveries').select('status').eq('day', day)) as { status: string }[];
  const n = (s: string) => rows.filter((r) => r.status === s).length;
  return { recipients: rows.length, sent: n('sent'), failed: n('failed'), claimed: n('claimed') };
}

Deno.serve(async (req) => {
  if (req.headers.get('Authorization') !== `Bearer ${env.CRON_SECRET}`) {
    return json(401, { ok: false, error: 'unauthorized' });
  }
  const started = Date.now();
  const url = new URL(req.url);
  const retryFailed = url.searchParams.get('retry') === '1' || url.searchParams.get('force') === '1';

  try {
    const now = new Date();
    const day = utcDay(now);
    const catalogue = await loadCatalogue();
    const row = await todaysPuzzle(day, catalogue);
    const puzzle = catalogue.find((p) => p.code === row.puzzle_code);
    if (!puzzle) throw new Error(`Puzzle ${row.puzzle_code} is no longer in the catalogue`);

    const before = await counts(day);
    if (row.send_finished_at && !(retryFailed && before.failed > 0)) {
      return json(200, { ok: true, skipped: 'already-sent-today', day });
    }

    // Retry failed batches once: back to claimed, marked stale so they go out below, with
    // their original batch numbers (same idempotency keys, so nothing can go out twice).
    if (retryFailed && before.failed > 0) {
      must(
        await db
          .from('newsletter_deliveries')
          .update({ status: 'claimed', updated_at: new Date(0).toISOString() })
          .eq('day', day)
          .eq('status', 'failed'),
      );
      must(await db.from('newsletter_days').update({ send_finished_at: null }).eq('day', day));
    }

    if (!row.send_started_at) {
      must(await db.from('newsletter_days').update({ send_started_at: now.toISOString() }).eq('day', day));
    }

    await resendStale(day, puzzle);

    // Every run sends at least one batch before checking the time budget, so a chain of
    // runs always makes progress even when the setup above was slow.
    let continued = false;
    for (;;) {
      const claimed = must(
        await db.rpc('newsletter_claim_batch', { p_day: day, p_limit: BATCH_LIMIT }),
      ) as (Recipient & { batch_no: number })[];
      if (!claimed || claimed.length === 0) break;
      await sendClaimed(day, claimed[0].batch_no, claimed, puzzle);
      if (Date.now() - started > env.SEND_TIME_BUDGET_MS) {
        continued = true;
        break;
      }
    }

    if (continued) {
      // Hand over to a fresh run; waitUntil keeps this one alive until the request is out.
      EdgeRuntime.waitUntil(
        fetch(`${env.SUPABASE_URL}/functions/v1/daily-newsletter`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${env.CRON_SECRET}`, 'Content-Type': 'application/json' },
          body: '{}',
        }),
      );
      const c = await counts(day);
      return json(200, { ok: true, day, puzzle: puzzle.code, ...c, continued: true });
    }

    const c = await counts(day);
    // Another run may still be sending its batches; it finishes the day itself.
    if (c.claimed === 0) {
      must(
        await db
          .from('newsletter_days')
          .update({
            send_finished_at: new Date().toISOString(),
            recipients: c.recipients,
            sent: c.sent,
            failed: c.failed,
          })
          .eq('day', day),
      );
    }
    return json(200, {
      ok: true,
      day,
      puzzle: puzzle.code,
      recipients: c.recipients,
      sent: c.sent,
      failed: c.failed,
      continued: false,
    });
  } catch (err) {
    // Nothing is marked as sent on an error (contracts/http-api.md).
    console.error('daily-newsletter failed', err);
    return json(500, { ok: false, error: 'server' });
  }
});
