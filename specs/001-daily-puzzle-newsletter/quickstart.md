# Quickstart: validate the daily puzzle newsletter

These are run-and-check scenarios that prove the feature works from start to finish. For endpoint details see [contracts/http-api.md](./contracts/http-api.md). For tables and states see [data-model.md](./data-model.md).

## Prerequisites

- Node 26 and `npm install`.
- Docker, and the Supabase CLI (`brew install supabase/tap/supabase`).
- A Resend account with a test API key. For local runs, send to `delivered@resend.dev` / `bounced@resend.dev` / `complained@resend.dev` (Resend's test inboxes) or to your own address.
- `supabase/functions/.env.local`, not committed, containing:
  - `RESEND_API_KEY`, `FROM_EMAIL`, `IP_HASH_SECRET`, `CRON_SECRET`, `RESEND_WEBHOOK_SECRET`;
  - `SITE_URL=http://localhost:4321`.
- `.env` for the site: `PUBLIC_NEWSLETTER_API=http://127.0.0.1:54321/functions/v1`.

## 1. Unit and build checks

```bash
npm test               # src + supabase/functions/_shared (rendering, validation, choice, escaping)
npm run test:build     # builds, then checks a PNG + catalogue entry per exercise, no spoilers, CTA, privacy text
```

Expected: everything passes, including the test that renders every catalogue puzzle and finds no motif name, id, hint or solution in either email part.

## 2. Run locally

Notes from the first local run (2026-11-12):
- Docker Desktop puts its CLI in `~/.docker/bin`; add it to `PATH` if `docker` isn't found.
- To test without a Resend account, set `RESEND_API_URL=http://host.docker.internal:8787` in `.env.local` and run a small mock that records emails (see `supabase/functions/.env.example`).
- The functions run in Docker, so `SITE_URL` must be reachable from there, e.g. `http://host.docker.internal:4322` with `python3 -m http.server 4322 --bind 0.0.0.0 --directory dist`. `astro preview` rejects that host name.
- The local gateway adds `Access-Control-Allow-Origin: *` to every function response, so the site-only CORS rule can only be checked against the deployed project (§8).

```bash
supabase start && supabase db reset          # applies the migration
supabase functions serve --env-file supabase/functions/.env.local
npm run build && npm run preview -- --port 4321   # the catalogue and PNGs must be served
```

## 3. Subscribe (User Story 1)

1. Open `http://localhost:4321/`. The call to action shows.
2. Submit `not-an-email`. You should see an inline error, and nothing stored.
3. Submit `delivered@resend.dev`. You should see "Check your inbox". Reload: the call to action is gone, and `localStorage['checkmate-patterns:newsletter']` is `{"state":"pending","at":…}`. Change `at` to 8 days ago in devtools and reload: the call to action is back, and the key is gone (a confirmation email that never arrived).
4. `select status, confirmation_sent_at from newsletter_subscribers;` should show `pending`.
5. Submit the same address again from a private window. The message is the same, and `confirmation_sent_at` is unchanged (it was less than an hour ago).
6. Open `/newsletter/confirm?token=<confirm_token>`. You should see "You're subscribed", with the time of the first send. The status is now `active`. Open it again and you should see "already subscribed". In devtools the marker now reads `{"state":"confirmed"}`. Open a link with an unknown token: you should see the expired message, the marker is removed, and the homepage shows the call to action again.
7. Rate limit: 6 quick submissions with `curl` from one IP should end with a `429` on the sixth.
8. Honeypot: `curl -d '{"email":"x@y.zz","website":"spam"}'` should return `200`, and no row is created.

## 4. Daily send (User Stories 2 and 4)

```bash
curl -X POST http://127.0.0.1:54321/functions/v1/daily-newsletter \
  -H "Authorization: Bearer $CRON_SECRET"
```

Expected:
- `{"ok":true,"sent":N,...}`.
- The `newsletter_days` row for today has a `puzzle_code`, and `send_finished_at` is set.
- In the email, the PNG matches the position on the "Solve it" page. A "White to move" / "Black to move" line is shown, also for a quiz puzzle. The "Solve it" link goes straight to the site with `?utm_source=newsletter&utm_medium=email`, and the HTML has no image besides the board.
- Run the command again: it returns `skipped: already-sent-today` and sends no new emails.
- With images turned off, the email still shows the task, the link and the alt text.

**Resume:** make the function stop early (set `SEND_TIME_BUDGET_MS=1` in the env) with 3 or more active subscribers, then run it again. Each subscriber should have exactly one `newsletter_deliveries` row with status `sent`.

## 5. Unsubscribe (User Story 3)

1. Open the email's Unsubscribe link. You should see "You're unsubscribed", with no clicks needed. `localStorage['checkmate-patterns:newsletter']` is gone, and the homepage shows the call to action again.
2. `curl -X POST "$API/newsletter-unsubscribe?token=<t>" -d 'List-Unsubscribe=One-Click'` should return `200`.
3. `curl "$API/newsletter-unsubscribe?token=<t>"` (a GET) should return `405`.
4. The next send with `force=1` (or the next day) should send nothing to this address.
5. Subscribing again from the homepage should give a new confirmation email. The old confirm link should show the invalid message.

## 6. Bounces and complaints (FR-015)

Subscribe and confirm `bounced@resend.dev` and `complained@resend.dev`, then run the send. Point a Resend webhook at a tunnel to `resend-webhook`. Both rows should end up `unsubscribed`, with reasons `bounce` and `complaint`.

## 7. Clean-up (FR-004a, Q2)

Set a pending row's `confirm_expires_at` in the past and an attempt row's `at` 25 hours ago. Run the clean-up job's SQL (`select cron.schedule …` body). Both rows should be gone.

## 8. Before launch

- Supabase project in the EU region. DPAs accepted with Supabase and Resend.
- `mail.chess-patterns.com` verified in Resend (SPF, DKIM), and a DMARC record published.
- Secrets set with `supabase secrets set`. `CRON_SECRET` stored in Vault. The 07:00 send and 07:30 backup jobs scheduled (`supabase/sql/schedule-daily.sql`), plus the clean-up job from the migration.
- Resend open and click tracking turned off for `mail.chess-patterns.com`. Vercel Analytics shows UTM parameters (research R11).
- Vercel env var `PUBLIC_NEWSLETTER_API` set, and the site redeployed.
- Privacy page updated (FR-018) and `site.legalUpdated` bumped.
- The email checked by eye in Gmail (web and mobile), Apple Mail (macOS and iOS) and Outlook (web and desktop) (SC-007).
- Owner's checks for FR-020: `select count(*) from newsletter_subscribers where status='active';` and `select * from newsletter_days order by day desc limit 7;`.
