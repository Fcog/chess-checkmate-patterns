# Research: Daily puzzle newsletter

Phase 0 decisions. The Technical Context in [plan.md](./plan.md) leaves no NEEDS CLARIFICATION. Each decision below records what was chosen, why, and what else was considered. The "reference" is the owner's existing Supabase and Resend newsletter in another app, pasted into `/speckit-clarify` on 2026-11-11.

## R1. Backend: Supabase in an EU region

- **Decision**: one Supabase project in an EU region (Frankfurt, `eu-central-1`). It provides Postgres for the data, Edge Functions (Deno) for the HTTP endpoints and the daily send, pg_cron and pg_net for scheduling, and Vault for the cron secret. Data processing agreements (DPAs) are signed with both Supabase and Resend.
- **Rationale**: this is the owner's choice and matches the reference app. The free plan covers this load, and an EU region keeps subscriber data in the EU (GDPR).
- **Alternatives considered**:
  - Vercel serverless functions plus a hosted database. That would need a separate store and scheduler, and would differ from the reference.
  - Resend Audiences/Broadcasts as the subscriber store. Broadcasts can't carry a per-day puzzle chosen by our own no-repeat rule, and double opt-in would still need our own code.

## R2. How the backend gets puzzle data

- **Decision**: the Astro build writes `/newsletter/puzzles.json`, a static endpoint following [contracts/puzzle-catalogue.md](./contracts/puzzle-catalogue.md). Each entry has the share code, topic, FEN, side to move, task text, share URL, image URL and alt text, but no exercise id or motif. `daily-newsletter` fetches it from `SITE_URL` at send time. The database stores only share codes.
- **Rationale**:
  - Puzzles are TypeScript in `src/data`, and the site is their single source of truth.
  - The catalogue always matches what is deployed. A removed puzzle drops out of it automatically, so it is never chosen (edge case "Puzzle removed").
  - Nothing new is exposed, because every share page is already public.
- **Alternatives considered**:
  - Copying puzzles into a Supabase table at deploy. This adds a sync step that can drift.
  - Bundling the data into the function. The function would need redeploying on every puzzle change.

## R3. Board pictures

- **Decision**: a static endpoint, `src/pages/newsletter/board/[code].png.ts`, generates one PNG per practice puzzle at build time.
  - `src/lib/board-image.ts` draws the board as SVG: brown squares like the site's board, the cburnett piece SVGs taken from `chessground/assets/chessground.cburnett.css`, and file/rank labels.
  - The board is seen from the side to move.
  - `@resvg/resvg-js` turns the SVG into a 640×640 PNG, shown at 320×320 in the email so it stays sharp on high-resolution screens.
- **Rationale**:
  - Gmail and Outlook do not display SVG, while PNG works everywhere (SC-007).
  - The pieces match the site, and building the pictures with the site needs no image service.
  - 240 puzzles at about 40 KB each add roughly 10 MB to the deploy.
- **Alternatives considered**:
  - Drawing the board in a headless browser. This is heavy at build time.
  - A board drawn with email layout code (rejected in clarification Q1).
  - Rendering pictures on request in an Edge Function. This adds a moving part, and the result needs caching anyway.
- **Licence**: the cburnett pieces (GPLv2+) already ship in the site through chessground, so nothing new is introduced.

## R4. Choosing the day's puzzle (FR-007, FR-008)

- **Decision**:
  - The `newsletter_days` table has one row per UTC day, with `cycle` and `puzzle_code`.
  - To choose a puzzle, `choose.ts` takes the catalogue codes not yet sent in the current cycle and picks one at random.
  - When none are left, the cycle number goes up by one, and every code is available again.
  - The insert uses `on conflict (day) do nothing`, so a second run on the same day reuses the stored choice.
  - If today's stored code is no longer in the catalogue, the row is re-chosen, but only while `send_started_at` is still empty.
- **Rationale**:
  - A random pick from the codes not yet sent is the same as shuffling once per cycle, and it adjusts naturally when puzzles are added or removed mid-cycle.
  - One row per day is also the history the owner looks at (FR-020).
- **Alternatives considered**:
  - Storing a shuffled order up front. It goes stale when puzzles change.
  - A purely random pick each day, as in the reference. It breaks FR-008.

## R5. Scheduling

- **Decision**:
  - pg_cron job `daily-newsletter` at `0 7 * * *`. pg_cron runs in UTC, which matches clarification Q3. The job calls the function with `net.http_post` and the header `Authorization: Bearer <CRON_SECRET>`, read from Vault.
  - The function checks this secret itself. It is deployed with `--no-verify-jwt` so the service-role key never appears in a cron command.
  - A second cron job at `30 3 * * *` runs the clean-up SQL from [data-model.md](./data-model.md#retention).
- **Rationale**: this is the reference's approach, but with a dedicated secret in Vault instead of the service key written into the job.
- **Alternatives considered**:
  - Vercel Cron. It would split scheduling across two platforms.
  - GitHub Actions schedule. Its start time is not guaranteed and can run late.

## R6. Sending in batches, resumable and never twice (FR-006, SC-002, SC-005)

- **Decision**:
  1. The function marks the day as started (`send_started_at`).
  2. It works through the recipients in rounds. Each round claims up to 100 confirmed subscribers who have no `newsletter_deliveries` row for today, by inserting rows with a new `batch_no` in one transaction (`insert … select … for update skip locked`).
  3. It calls Resend `POST /emails/batch` with `Idempotency-Key: daily/<day>/<batch_no>`.
  4. It marks the claimed rows `sent` (storing the Resend id) or `failed`.
  5. It stops when nothing is left, or when about 120 s have passed. It always sends at least one batch before checking the time, so a chain of runs always makes progress (found in local testing). In that case it calls itself again inside `EdgeRuntime.waitUntil(fetch(…))`, so the request is sent before the function shuts down, and returns. A backup cron job at 07:30 UTC makes the same call, which finishes the day if the chain of self-calls ever breaks, and does nothing once the day is finished.
  6. A new run first re-sends any batch still `claimed` (left by a crashed run) with the same idempotency key. Resend ignores the duplicate within 24 hours.
  7. Finally it sets `send_finished_at` and stores the totals.

  Only batches left `claimed` for more than 5 minutes count as abandoned, so the 07:30 backup run never re-sends a batch that a still-running chain is sending. The backup run (`?retry=1`) and a manual `?force=1` also retry `failed` batches once, under their original keys. All of these need the cron secret, and none re-sends `sent` rows.
- **Rationale**: the reference guarantees once a day with a single `sent_at` flag, but a run that dies halfway could never finish. Per-recipient rows plus Resend idempotency keys make the send resumable without duplicates. Batches of 100 keep about 10,000 subscribers to 100 API calls, which fits Resend's rate limit (about 2 requests a second, so roughly 1 minute in total).
- **Alternatives considered**:
  - One `send` call per recipient. Slow, and it hits the rate limit.
  - Resend Broadcasts. It needs Resend Audiences (see R1).
- **Data note**: delivery rows link an address to a day. They are kept for only 7 days ([data-model.md](./data-model.md#retention)) and are mentioned on the privacy page.

## R7. Tokens, confirmation expiry and re-sending (FR-004, FR-004a, FR-004b)

- **Decision**:
  - Each subscriber has two random 122-bit UUID tokens: `confirm_token` and `unsubscribe_token`. The unsubscribe token never changes, so links in old emails keep working.
  - Every time a confirmation email is sent, `confirm_expires_at = now() + 7 days` and `confirmation_sent_at = now()` are set. The token stays the same, so the latest email and any earlier one both work.
  - Submitting a pending address re-sends the email only if `confirmation_sent_at < now() - 1 hour`. Otherwise the request does nothing, but the visitor still sees the normal success message.
  - The nightly clean-up deletes pending rows whose `confirm_expires_at` has passed.
  - Confirming only moves an address from `pending` to `active`, and the token is kept:
    - A second click finds an `active` row and answers `already`.
    - An expired link finds no row, because the clean-up deleted it, and answers `invalid`.
    - A confirm link for an `unsubscribed` row also answers `invalid`. An old link can never quietly re-subscribe someone, unlike in the reference.
  - Re-subscribing after unsubscribing returns the row to `pending` with a new `confirm_token`.
- **Rationale**: the expiry window restarts on every re-send, which is what a visitor who re-submits on day 6 would expect.
- **Alternatives considered**:
  - A new token on every re-send. It breaks the earlier email for no real security gain.
  - Signed links that carry no database state (JWT-style). Expiry would still need state, because of the 1-hour re-send limit.

## R8. Abuse protection (FR-016)

- **Decision**:
  - A honeypot input named `website`. A non-empty value gets `200 {ok:true}` and nothing else happens.
  - A rate limit of 5 submissions per IP per rolling hour. The IP is the first entry of `x-forwarded-for`, which Supabase sets.
  - Only `ip_hash = HMAC-SHA256(IP_HASH_SECRET, ip)` is stored, in `newsletter_signup_attempts(ip_hash, at)`. Rows older than 24 hours are deleted by the nightly clean-up and by a query run on each request.
  - Over the limit, the function returns `429 rate-limited`, and the form shows "Too many attempts – try again in an hour".
- **Rationale**: this follows clarification Q2. A keyed hash, rather than a plain SHA-256, is used because there are only about 4 billion IPv4 addresses, so a plain hash could be reversed by trying them all.
- **Alternatives considered**: a CAPTCHA (Turnstile). It adds a third-party script and its own consent questions, and is not needed at this scale. It could be added later if abuse shows up.

## R9. Unsubscribe (FR-013, User Story 3)

- **Decision**:
  - **Link in the email:** `https://www.chess-patterns.com/newsletter/unsubscribe?token=<unsubscribe_token>`. On load, that static page sends `POST newsletter-unsubscribe {token}` and shows the result.
  - **Email headers:**
    - `List-Unsubscribe: <https://<ref>.supabase.co/functions/v1/newsletter-unsubscribe?token=<t>>, <mailto:unsubscribe@…?subject=<t>>`
    - `List-Unsubscribe-Post: List-Unsubscribe=One-Click`

    Gmail's and Apple Mail's own buttons POST straight to the function (RFC 8058).
  - Unsubscribing sets `status = unsubscribed` and `unsubscribed_at`, and repeating it is harmless. The address is kept so it can't be sent to again, until it re-subscribes through double opt-in.
- **Rationale**:
  - Unsubscribing only by POST means email security scanners, which open links with GET, cannot unsubscribe people by accident.
  - The page still needs no clicks, because its own script sends the POST.
- **Alternatives considered**: unsubscribing on a plain GET request, as the reference does through its page. It is vulnerable to link scanners if the endpoint is ever opened directly, and offers no RFC 8058 one-click support.
- **mailto**: the second header entry is optional. It is left out unless the sending domain gets a mailbox.

## R10. Bounces and spam complaints (FR-015)

- **Decision**:
  - A Resend webhook sends `email.bounced` and `email.complained` events to the `resend-webhook` function. The function verifies the Svix signature with `RESEND_WEBHOOK_SECRET`.
  - On a hard bounce (`bounce.type = "Permanent"`) or any complaint, it sets `status = unsubscribed` and records `unsubscribe_reason` (`bounce` or `complaint`).
  - Soft bounces are ignored.
- **Rationale**: these are Resend's own event types, and they protect the sending reputation.
- **Alternatives considered**: polling Resend for delivery status. More work, and slower.

## R11. Measuring clicks (SC-008)

- **Decision** (owner, 2026-11-12: clicks only):
  - Resend open and click tracking stay **off** for the sending domain. There is no tracking pixel, and links go straight to the site.
  - "Solve it" links get `?utm_source=newsletter&utm_medium=email`. The site's existing Vercel Analytics counts these visits anonymously. The share page ignores the query string.
  - SC-008 is measured as newsletter visits ÷ emails sent, where `sent` comes from `newsletter_days`.
  - The privacy page explains the tag. No extra consent text is needed on the call to action.
- **Rationale**: an open-tracking pixel needs consent under EU rules and makes the email heavier. Counting clicks reuses analytics the site already has, and keeps FR-010's direct link.
- **Alternatives considered**:
  - Resend open and click tracking. SC-008 could then be measured per opened email, but it needs pixel consent and rewrites links through a redirect.
  - No tracking at all, which leaves SC-008 unmeasurable.
- **Launch check**: confirm that the Vercel Analytics plan in use shows UTM parameters. If it doesn't, filter page views by referrer-less visits to `/…/practice/<code>` on send days as a rough count, or upgrade the plan.

## R12. Homepage call to action

- **Decision**:
  - `NewsletterSignup.tsx` is a React island (`client:load`). It renders nothing until mounted, then shows the form only if `localStorage['checkmate-patterns:newsletter']` is missing. This avoids a flash of the form for people who have subscribed.
  - It sets the marker only on `200`, as `{state:'pending', at}`. The confirm page upgrades it to `{state:'confirmed'}`, or removes it when a link is `invalid`. The unsubscribe page removes it on success. A pending marker older than 7 days is ignored, so a visitor whose confirmation email never arrived gets the call to action back without needing a link (FR-003, [data-model.md](./data-model.md#browser-submitted-marker)).
  - Alternative rejected: a plain `'1'` flag. It can't tell "submitted, never confirmed" from "confirmed", so a lost confirmation email hides the call to action in that browser for good.
  - If `localStorage` throws, the form still works, and only the marker is skipped (edge case).
  - It has a hidden honeypot field (off-screen, `tabindex=-1`, `autocomplete=off`) and a link to `/privacy`.
  - The functions base URL comes from `import.meta.env.PUBLIC_NEWSLETTER_API`. CORS allows only `SITE_URL` (and `http://localhost:4321` locally), unlike the reference's `*`.
- **Rationale**: it follows the site's existing island and `checkmate-patterns:` storage-key patterns.
- **Alternatives considered**: rendering the form in Astro and hiding it with an inline script. It works, but form states (sending, error, rate limited) are simpler in React.

## R13. Sending domain and DNS

- **Decision**: send from `Chess Patterns <puzzles@mail.chess-patterns.com>`. Verify the `mail.` subdomain in Resend (SPF, DKIM, MX for bounces) and add a DMARC record (`p=none`, then tighten later). Use Resend's EU region.
- **Rationale**: a subdomain keeps the reputation of newsletter mail separate from the main domain. Gmail and Yahoo require SPF, DKIM, DMARC and one-click unsubscribe from bulk senders.
