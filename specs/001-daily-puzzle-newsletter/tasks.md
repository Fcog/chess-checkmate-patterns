---

description: "Task list for the daily puzzle newsletter"
---

# Tasks: Daily puzzle newsletter

**Input**: Design documents from `specs/001-daily-puzzle-newsletter/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), contracts ([http-api](./contracts/http-api.md), [puzzle-catalogue](./contracts/puzzle-catalogue.md), [email](./contracts/email.md)), [quickstart.md](./quickstart.md)

**Tests**: included. SC-003 requires automated checks on every puzzle, and the plan lists unit and build tests. The repo already requires `npm test` and `npm run test:build` to pass. Tests use Vitest; the pure backend modules are imported straight from `supabase/functions/_shared/`.

**Organization**: tasks are grouped by user story (spec.md). US1, US2 and US3 are all P1 and are needed together for launch. US4 is P2.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an unfinished task)
- **[Story]**: US1 subscribe, US2 daily puzzle, US3 unsubscribe, US4 spoiler-free
- Paths are relative to the repo root: the site is in `src/` and `tests/`, the backend in `supabase/`

---

## Phase 1: Setup

**Purpose**: tooling and config shared by every story.

- [X] T001 Add the dev dependency `@resvg/resvg-js` (`npm install -D @resvg/resvg-js`) and confirm `npm run build` still passes, in `package.json`
- [X] T002 Run `supabase init` to create `supabase/config.toml`. Set `[functions.newsletter-subscribe]`, `[functions.newsletter-confirm]`, `[functions.newsletter-unsubscribe]`, `[functions.daily-newsletter]` and `[functions.resend-webhook]` each to `verify_jwt = false` in `supabase/config.toml`
- [X] T003 [P] Change the `test` and `test:watch` scripts so Vitest also runs `supabase/functions/_shared` (`vitest run src supabase/functions/_shared`), in `package.json`
- [X] T004 [P] Add `supabase/functions/.env.example` listing the secrets `RESEND_API_KEY`, `FROM_EMAIL`, `SITE_URL`, `ALLOWED_ORIGINS`, `IP_HASH_SECRET`, `CRON_SECRET`, `RESEND_WEBHOOK_SECRET` and `SEND_TIME_BUDGET_MS` (default 120000), one comment each, using the meanings in contracts/http-api.md. Add `supabase/functions/.env.local`, `supabase/.temp` and `.env` to `.gitignore`
- [X] T005 [P] Add `PUBLIC_NEWSLETTER_API` (the functions base URL, e.g. `http://127.0.0.1:54321/functions/v1`) to a new `.env.example` at the repo root, and declare it in `src/env.d.ts` (create it if missing) as `readonly PUBLIC_NEWSLETTER_API?: string` on `ImportMetaEnv`

---

## Phase 2: Foundational (blocks every story)

**Purpose**: the database schema and the shared backend helpers that every function uses.

**⚠️ CRITICAL**: no user-story work starts until this phase is done.

- [X] T006 Write the migration `supabase/migrations/20261111000000_newsletter.sql`, following data-model.md exactly. It creates these tables:
  - **`newsletter_subscribers`**:
    - `id uuid pk default gen_random_uuid()`
    - `email text not null unique` with `check (char_length(email) <= 320 and email = lower(btrim(email)))`
    - `status text not null check (status in ('pending','active','unsubscribed'))`
    - `confirm_token uuid not null unique default gen_random_uuid()`
    - `confirm_expires_at timestamptz`
    - `confirmation_sent_at timestamptz`
    - `unsubscribe_token uuid not null unique default gen_random_uuid()`
    - `subscribed_at timestamptz not null default now()`
    - `confirmed_at timestamptz`
    - `unsubscribed_at timestamptz`
    - `unsubscribe_reason text check (unsubscribe_reason in ('user','bounce','complaint'))`
    - index on `(status)`
  - **`newsletter_days`**:
    - `day date pk`
    - `cycle int not null`
    - `puzzle_code text not null`
    - `send_started_at timestamptz`
    - `send_finished_at timestamptz`
    - `recipients int`, `sent int`, `failed int`
    - `created_at timestamptz not null default now()`
    - `unique (cycle, puzzle_code)`
  - **`newsletter_deliveries`**:
    - `day date not null references newsletter_days(day)`
    - `subscriber_id uuid not null references newsletter_subscribers(id) on delete cascade`
    - `batch_no int not null`
    - `status text not null check (status in ('claimed','sent','failed'))`
    - `resend_id text`
    - `updated_at timestamptz not null default now()`
    - `primary key (day, subscriber_id)`
    - index on `(day, status, batch_no)`
  - **`newsletter_signup_attempts`**:
    - `ip_hash text not null`
    - `at timestamptz not null default now()`
    - index on `(ip_hash, at)`

  Then, in the same migration:
  - Enable row-level security on all four tables and add **no policies**.
  - `create extension if not exists pg_cron; create extension if not exists pg_net;`
  - Add the RPC `newsletter_claim_batch(p_day date, p_limit int)`, `security definer`, `set search_path = public`, `revoke execute … from public, anon, authenticated` (service role only). In one statement it takes `batch_no = coalesce(max(batch_no),0)+1` for `p_day`, inserts up to `p_limit` rows `(p_day, id, batch_no, 'claimed')` for `active` subscribers with no delivery row for `p_day` (`for update skip locked`), and returns their `subscriber_id`, `email`, `unsubscribe_token` and `batch_no`.
  - Schedule the `newsletter-cleanup` cron job at `'30 3 * * *'`. It runs:
    - `delete from newsletter_subscribers where status='pending' and confirm_expires_at < now()`
    - `delete from newsletter_signup_attempts where at < now() - interval '24 hours'`
    - `delete from newsletter_deliveries where day < current_date - 7`
- [X] T007 Write `supabase/sql/schedule-daily.sql`, a per-environment script that is not a migration. It takes the project URL and reads `CRON_SECRET` from Vault (`vault.create_secret` once, then `select decrypted_secret from vault.decrypted_secrets where name='newsletter_cron_secret'`). It schedules `daily-newsletter` at `'0 7 * * *'`, and a backup job `daily-newsletter-retry` at `'30 7 * * *'` that makes the same call (it finishes a send whose self-call chain broke, and does nothing once the day is finished), both with `net.http_post(url := '<SUPABASE_URL>/functions/v1/daily-newsletter', headers := jsonb_build_object('Authorization','Bearer '||<secret>,'Content-Type','application/json'))`. Add a short comment block with usage instructions
- [X] T008 [P] Write `supabase/functions/_shared/escape.ts`. It exports `escapeHtml(s)`, which escapes `& < > " '`, and `escapeAttr`, used for URLs inside `href`/`src`
- [X] T009 [P] Write `supabase/functions/_shared/http.ts`:
  - `corsHeaders(origin, env)` allows only `SITE_URL` plus the comma-separated `ALLOWED_ORIGINS`.
  - `preflight(req, env)` returns a 204 for `OPTIONS`.
  - `json(status, body, headers?)`.
  - `clientIp(req)` returns the first entry of `x-forwarded-for`, trimmed, or `'unknown'`.

  No Deno globals; it takes `env` as a plain object.
- [X] T010 [P] Write `supabase/functions/_shared/resend.ts`:
  - `sendEmail(apiKey, {from,to,subject,html,text,headers?})` → `POST https://api.resend.com/emails`.
  - `sendBatch(apiKey, emails[], idempotencyKey)` → `POST https://api.resend.com/emails/batch` with the header `Idempotency-Key`. At most 100 emails; throw if over.
  - Both throw an `Error` with the status and body when the response is not ok, and return the parsed ids.
  - Use the global `fetch` only, so it is testable with a stubbed fetch.
- [X] T011 [P] Write `supabase/functions/_shared/env.ts`, with `readEnv(get: (k)=>string|undefined)`. It returns a typed object containing:
  - the secrets listed in T004;
  - `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

  It throws, naming the variable, if a required one is missing. It also strips any trailing slash from `SITE_URL`.
- [X] T012 [P] Write `supabase/functions/_shared/db.ts`, which builds a service-role Supabase client from `npm:@supabase/supabase-js@2` using `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. This is the only module that is Deno-only, and the vitest tests don't import it.
- [X] T013 [P] Add unit tests for T008–T011 in `supabase/functions/_shared/escape.test.ts`, `supabase/functions/_shared/http.test.ts` and `supabase/functions/_shared/resend.test.ts`:
  - escaping of all 5 characters;
  - CORS: an allowed origin gets an echo back, any other origin gets nothing;
  - `clientIp` with several IPs;
  - `sendBatch` sends the idempotency header, and rejects more than 100 emails.

**Checkpoint**: `supabase db reset` applies cleanly, and `npm test` passes.

---

## Phase 3: User Story 1 – Subscribe from the homepage (P1) 🎯 MVP part 1

**Goal**: a visitor submits their email on the homepage, gets a confirmation email, confirms, and becomes `active`. The call to action stays hidden in that browser afterwards.

**Independent Test**: quickstart.md §3 (steps 1–8).

### Tests for User Story 1

- [X] T014 [P] [US1] Unit tests in `supabase/functions/_shared/validate.test.ts`:
  - `normalizeEmail` trims and lower-cases;
  - the check rejects `not-an-email`, `a@b`, an address over 320 characters, and addresses with spaces;
  - it accepts `Reader@Example.com `;
  - `isHoneypot('')` is false and `isHoneypot('x')` is true.
- [X] T015 [P] [US1] Unit tests in `supabase/functions/_shared/subscribe.test.ts` for the pure decision `decideSubscribe(existing, now)`. They cover every row of the data-model.md state table that a submit can trigger:
  - none → insert + send;
  - pending with `confirmation_sent_at` under 1 hour ago → no send;
  - pending over 1 hour ago → send and extend `confirm_expires_at` to now + 7 days;
  - active → nothing;
  - unsubscribed → back to pending with a new token + send.
- [X] T016 [P] [US1] Unit tests in `supabase/functions/_shared/email.test.ts` for `renderConfirmationEmail({confirmUrl})`:
  - the subject is `Confirm your daily chess puzzle subscription`;
  - both the HTML and the text contain the confirm URL, "expires in 7 days" and the "ignore this email" sentence;
  - the URL is escaped in the HTML.

### Implementation for User Story 1

- [X] T017 [P] [US1] Write `supabase/functions/_shared/validate.ts`:
  - `normalizeEmail(s)` trims and lower-cases.
  - `isValidEmail(s)` uses regex `^[^\s@]+@[^\s@]+\.[^\s@]+$` and `length <= 320`.
  - `isHoneypot(website)` is true for any non-empty string.
  - `isUuid(s)`.
- [X] T018 [P] [US1] Write `supabase/functions/_shared/subscribe.ts`. It exports `decideSubscribe(existing: {status, confirmation_sent_at} | null, now: Date)`, which returns `{action: 'insert'|'resend'|'reactivate'|'none', send: boolean, confirmExpiresAt?: Date}`, following the data-model.md state table. Also export `RESEND_INTERVAL_MS = 3600000` and `CONFIRM_TTL_MS = 7*86400000`.
- [X] T019 [P] [US1] Write `supabase/functions/_shared/email.ts` (start of the file), with `renderConfirmationEmail({confirmUrl, siteUrl})` returning `{subject, html, text}`. It follows contracts/email.md "Confirmation email":
  - inline-styled HTML with a centred wrapper `max-width:560px` and the system font;
  - a blue "Confirm subscription" button;
  - all values escaped with `escape.ts`.
- [X] T020 [P] [US1] Write `supabase/functions/_shared/ratelimit.ts`. It exports `hashIp(secret, ip)`, which returns a lower-case hex HMAC-SHA256 using Web Crypto `crypto.subtle` (available in Deno and Node 26). Also export `RATE_LIMIT = 5` and `RATE_WINDOW_MS = 3600000`. Add a test in `supabase/functions/_shared/ratelimit.test.ts`: the hash is stable for the same input, different for a different secret, and contains no IP characters.
- [X] T021 [US1] Write `supabase/functions/newsletter-subscribe/index.ts` (`Deno.serve`), implementing contracts/http-api.md `POST /newsletter-subscribe` in order:
  1. Handle `OPTIONS` with the T009 helpers.
  2. A filled honeypot gets `200 {"ok":true}`, with nothing stored.
  3. Normalize and validate the email; a failure gets `400 invalid-email`.
  4. Hash the IP. If 5 or more `newsletter_signup_attempts` rows exist for that hash with `at > now()-1h`, return `429 rate-limited`. Otherwise insert an attempt row, and also delete attempt rows older than 24 hours.
  5. Load the subscriber by email and apply `decideSubscribe`. A reactivate sets `status='pending'`, a new `confirm_token` (`gen_random_uuid()` via `crypto.randomUUID()`) and clears `confirmed_at` and `unsubscribed_at`. The insert uses `on conflict (email) do nothing`, then re-reads the row.
  6. When `send` is true: send `renderConfirmationEmail` with `confirmUrl = SITE_URL + '/newsletter/confirm?token=' + confirm_token`, then set `confirmation_sent_at = now()` and `confirm_expires_at = now() + 7 days`.
  7. Return `200 {"ok":true}`. It is the same for new, pending and active addresses (FR-005), with no `already` flag. Any thrown error gets `500 server`.
- [X] T022 [US1] Write `supabase/functions/newsletter-confirm/index.ts`, implementing `POST /newsletter-confirm` from contracts/http-api.md:
  - A non-UUID or unknown token, or a row that is `unsubscribed`, gets `{"ok":true,"result":"invalid"}`.
  - A `pending` row with `confirm_expires_at < now()` also gets `invalid`.
  - A `pending` row that has not expired becomes `status='active'`, `confirmed_at=now()`. The response is `{"ok":true,"result":"confirmed","firstSend":<ISO of the next 07:00 UTC after now>}`.
  - An `active` row gets `{"ok":true,"result":"already"}`.

  Put `nextSendAt(now)` in `supabase/functions/_shared/schedule.ts`, with a test in `supabase/functions/_shared/schedule.test.ts` covering before 07:00, exactly 07:00 and after 07:00 UTC.
- [X] T023 [P] [US1] Write `src/lib/newsletter.ts`:
  - `NEWSLETTER_KEY = 'checkmate-patterns:newsletter'`
  - `PENDING_TTL_MS = 7 * 86400000` (the same window as FR-004a).
  - `hasSubscribed(now = Date.now())` reads the key inside try/catch and `JSON.parse`s it. It returns `true` for `{state:'confirmed'}`, and for `{state:'pending', at}` while `now - at < PENDING_TTL_MS`. For an expired pending marker it removes the key and returns `false`. A missing or unparseable value, or a thrown error, returns `false`.
  - `markPending(now = Date.now())` writes `JSON.stringify({state:'pending', at: now})` inside try/catch.
  - `markConfirmed()` writes `JSON.stringify({state:'confirmed'})` inside try/catch.
  - `clearSubscribed()` removes the key inside try/catch (FR-003: the call to action shows again).
  - `newsletterApi()` returns `import.meta.env.PUBLIC_NEWSLETTER_API` without a trailing slash.
  - `formatLocalTime(iso)` uses `toLocaleString` with weekday, hour and minute.

  Add `src/lib/newsletter.test.ts`, covering all the storage helpers (normal use and when `localStorage` throws): a pending marker hides the call to action at 6 days 23 hours, and stops hiding it (and is removed) at 7 days; a confirmed marker hides it at any age; `'1'` and invalid JSON count as missing; by stubbing `globalThis.localStorage`.
- [X] T024 [US1] Write `src/components/react/NewsletterSignup.tsx`:
  - State is `'hidden'|'idle'|'sending'|'done'|'invalid'|'limited'|'error'`. It starts `hidden` and moves to `idle` in `useEffect` only if `!hasSubscribed()`, so there is no flash.
  - The form has:
    - the heading "Get a chess puzzle in your inbox every day";
    - a `<label for="newsletter-email">Your email address</label>` (visually hidden with the site's existing hidden-text style, or visible) and an `<input id="newsletter-email" type="email" required autocomplete="email">`;
    - a submit button;
    - a honeypot `<input name="website" tabindex={-1} autocomplete="off" aria-hidden>` hidden off-screen with CSS (not `display:none`);
    - the small print "One puzzle a day. Unsubscribe anytime. <a href="/privacy">Privacy</a>".
  - It validates with the same regex before sending, and shows "Please enter a valid email address" without sending.
  - It sends `fetch(newsletterApi() + '/newsletter-subscribe', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email, website})})`.
  - Results:
    - `200` → `markPending()`, then state `done`, showing "Check your inbox and click the link to confirm. The link expires in 7 days."
    - `400` → `invalid`, the same message as the local check.
    - `429` → `limited`: "Too many attempts – please try again in an hour."
    - Anything else, including a network error → `error`: "Something went wrong – please try again."
  - It marks the browser as subscribed only on `200` (FR-003).
  - If `newsletterApi()` is empty, it renders nothing.
- [X] T025 [US1] Add the call to action to the homepage. Import `NewsletterSignup` and render `<NewsletterSignup client:load />` right after the intro paragraph and before the topic cards, in `src/pages/index.astro`. Add its styles (a card matching `.topic-cards li`, an inline input and button, plus `.visually-hidden-field` for the honeypot) to the existing global stylesheet in `src/styles/`.
- [X] T026 [US1] Write `src/pages/newsletter/confirm.astro`:
  - Uses the `Base` layout, with `noindex` and the title "Confirm your subscription".
  - A small inline `<script>` reads `token` from `location.search` and POSTs it to `/newsletter-confirm` (base URL taken from a `data-api` attribute set from `import.meta.env.PUBLIC_NEWSLETTER_API`).
  - It shows one of:
    - `confirmed`: "You're subscribed. Your first puzzle arrives <local time of firstSend>.", plus a link to practice;
    - `already`: "You're already subscribed.";
    - `invalid`: "This link has expired or was already used.", plus "Subscribe again from the <a href="/">homepage</a>.";
    - a network error: "Something went wrong – reload to try again."
  - Its `<script>` imports from `src/lib/newsletter.ts` (Astro bundles page scripts). On `confirmed` or `already` it calls `markConfirmed()`. On `invalid` it calls `clearSubscribed()`, so the homepage shows the call to action again (FR-003, User Story 1 scenario 4).
- [X] T027 [US1] Exclude `/newsletter/` pages from the sitemap. Extend the existing `sitemap({ filter })` to also reject `/\/newsletter\//`, in `astro.config.mjs`.

**Checkpoint**: quickstart.md §3 passes. Subscribing works on its own, even before any daily email exists.

---

## Phase 4: User Story 2 – Receive a daily puzzle and solve it on the site (P1) 🎯 MVP part 2

**Goal**: at 07:00 UTC every active subscriber gets one email with the day's board picture, the task and "Solve it". The link opens the same position.

**Independent Test**: quickstart.md §4, including the resume check.

### Tests for User Story 2

- [X] T028 [P] [US2] Unit tests in `src/lib/puzzle-task.test.ts`:
  - For every exercise in `src/lib/exercises.ts`, `puzzleTask(ex).task` matches one of `^(White|Black) to play and mate in \d+$`, `^(White|Black) to play and (win material|break through)$` or `^Is the sacrifice sound or not\?$`.
  - `side` matches the FEN's side to move.
- [X] T029 [P] [US2] Unit tests in `src/lib/board-image.test.ts`:
  - `boardSvg(fen, 'white')` contains 64 squares and one `<image>` (or embedded piece) per piece in the FEN.
  - With `'black'`, a8 is drawn in the bottom-right.
  - `boardAlt(fen)` for the start position is `Chess position, White to move. White: king e1, queen d1, …` (pieces ordered king, queen, rooks, bishops, knights, pawns; squares in file order).
- [X] T030 [P] [US2] Unit tests in `supabase/functions/_shared/choose.test.ts` for `choosePuzzle({catalogueCodes, history: {cycle, puzzle_code}[], random})`:
  - With an empty history: cycle 1 and a code from the catalogue.
  - Never returns a code already used in the current cycle.
  - When every code has been used, returns `cycle+1`.
  - Ignores history codes that are no longer in the catalogue.
  - Over `catalogueCodes.length` runs with a seeded `random`, every code is chosen exactly once (FR-008).
- [X] T031 [P] [US2] Unit tests in `supabase/functions/_shared/email.test.ts` for `renderDailyEmail({puzzle, unsubscribeUrl, oneClickUrl, siteUrl, date})`:
  - The subject is `Daily chess puzzle: <task>`.
  - The HTML contains the `<img src=image width="320" height="320" alt=alt>`, a separate `White to move` / `Black to move` line (from `side`, for every task kind including quizzes), the task and a "Solve it" `<a>` whose href is `url + '?utm_source=newsletter&utm_medium=email'`.
  - The text part contains the side-to-move line, the task, `Solve it: <url>?utm_source=newsletter&utm_medium=email`, the alt text and the unsubscribe URL.
  - Neither part contains an `<img>` other than the board (no tracking pixel).
  - The headers are `List-Unsubscribe: <oneClickUrl>` and `List-Unsubscribe-Post: List-Unsubscribe=One-Click`.
  - A puzzle field containing `<script>` comes out escaped.
- [X] T032 [US2] Add a build test in `tests/build.test.ts`:
  - `dist/newsletter/puzzles.json` parses, has `version: 1`, and has one entry per exercise (matched by `shareCode(ex.id)`).
  - Every `image` maps to an existing `dist/newsletter/board/<code>.png` whose first bytes are the PNG signature.
  - Every `url` maps to an existing `dist/<topic>/practice/<code>/index.html` (SC-003).

### Implementation for User Story 2

- [X] T033 [P] [US2] Move the task text logic out of `src/pages/[topic]/practice/[code].astro` into a new `src/lib/puzzle-task.ts`. It exports `puzzleTask(ex: Exercise): {side: 'white'|'black', sideName: 'White'|'Black', task: string, heading: string, question: string}`:
  - `mate` → `task = '<Side> to play and mate in <movesToFind>'`;
  - `line`/`attack` → `'<Side> to play and <goal.label lower-case>'`;
  - `quiz` → `'Is the sacrifice sound or not?'`;
  - `heading` and `question` keep the share page's current wording.

  Update `[code].astro` to use it, and check that the built page's `<h1>` text is unchanged.
- [X] T034 [P] [US2] Write `src/lib/board-image.ts` (build-time only, Node):
  - `pieceSvgs()` reads `node_modules/chessground/assets/chessground.cburnett.css` once. It extracts the 12 `data:image/svg+xml;base64,…` URIs keyed by `<color><role>` from the `.cg-wrap piece.<role>.<color>` rules.
  - `boardSvg(fen, orientation)` draws a 640×640 SVG:
    - squares `#f0d9b5` and `#b58863`, matching chessground's brown theme;
    - pieces as `<image href=data-uri>` at 80×80;
    - rank and file labels, 14px, in the corner of the edge squares;
    - no highlights or arrows.
  - `boardPng(fen, orientation)` uses `new Resvg(svg, {fitTo: {mode: 'width', value: 640}}).render().asPng()`.
  - `boardAlt(fen)` follows the format in contracts/puzzle-catalogue.md.
- [X] T035 [US2] Write the static endpoint `src/pages/newsletter/board/[code].png.ts`. `getStaticPaths` produces one path per exercise, with `code = shareCode(ex.id)`. `GET` returns `new Response(boardPng(ex.fen, puzzleTask(ex).side), {headers: {'Content-Type': 'image/png'}})`.
- [X] T036 [US2] Write the static endpoint `src/pages/newsletter/puzzles.json.ts`. It returns the contracts/puzzle-catalogue.md JSON: `{version: 1, puzzles: [{code, topic, fen, side, task, url: site.url + sharePath(topic, code), image: site.url + '/newsletter/board/' + code + '.png', alt: boardAlt(fen)}]}`, one per exercise in `src/lib/exercises.ts`. It must not include `id`, `motifId`, `hint`, `solution`, `alternatives` or the motif name.
- [X] T037 [P] [US2] Write `supabase/functions/_shared/choose.ts`. It exports `choosePuzzle({catalogueCodes: string[], history: {cycle: number, puzzle_code: string}[], random?: () => number}): {cycle, code}`, following research R4:
  - The current cycle is the highest `cycle` in `history`, or 1.
  - Available codes are the catalogue codes not used in the current cycle.
  - If none are available, use `cycle+1` and the whole catalogue.
  - Pick at random.
- [X] T038 [US2] Add `renderDailyEmail({puzzle, unsubscribeUrl, oneClickUrl, siteUrl, date})` to `supabase/functions/_shared/email.ts`, returning `{subject, html, text, headers}`. It follows contracts/email.md "Daily puzzle email":
  - the hidden preheader `Can you solve today's position?`;
  - a grey label `Daily puzzle · <date as "12 November 2026">`;
  - `<img width="320" height="320" style="display:block;max-width:100%;height:auto">`;
  - a `White to move` / `Black to move` line from `puzzle.side`, shown for every task kind (FR-009);
  - the bold task;
  - a blue "Solve it" button linking to `puzzle.url + '?utm_source=newsletter&utm_medium=email'` (FR-010, no redirect);
  - the footer "You get this because you subscribed at chess-patterns.com.", the Unsubscribe and Privacy links, and `Chess Patterns · The Netherlands`;
  - the `List-Unsubscribe` and `List-Unsubscribe-Post` headers;
  - every value escaped.
- [X] T039 [US2] Write `supabase/functions/daily-newsletter/index.ts`, following contracts/http-api.md `POST /daily-newsletter` and research R6:
  1. Require `Authorization: Bearer ${CRON_SECRET}`, otherwise `401`.
  2. `day` = today's UTC date.
  3. Fetch `${SITE_URL}/newsletter/puzzles.json`. Return `500` if that fails.
  4. Load the `newsletter_days` row for today. If it is missing, or its code is not in the catalogue while `send_started_at is null`: call `choosePuzzle` with every `newsletter_days` row, then insert or update the row (`on conflict (day) do nothing`, then re-read).
  5. If `send_finished_at` is set and `force` is not set, return `{ok:true, skipped:'already-sent-today'}`.
  6. Set `send_started_at = coalesce(send_started_at, now())`.
  7. Re-send any `claimed` batches left by a crashed run (only those untouched for 5 minutes, so a run still in progress is left alone; analysis M2), with the same `Idempotency-Key: daily/<day>/<batch_no>`. With `retry=1` (the 07:30 backup job) or `force=1`, first reset `failed` rows to `claimed` with their original batch numbers, so they are retried once under the same keys (analysis M3).
  8. Loop while elapsed time is under `SEND_TIME_BUDGET_MS`:
     - Claim the next batch with `rpc('newsletter_claim_batch', {p_day: day, p_limit: 100})` (defined in T006).
     - Render one email per recipient, with `unsubscribeUrl = SITE_URL + '/newsletter/unsubscribe?token=' + t` and `oneClickUrl = SUPABASE_URL + '/functions/v1/newsletter-unsubscribe?token=' + t`.
     - `sendBatch`, then mark those rows `sent` with their `resend_id`, or `failed` if the batch threw.
     - Stop when a claim returns 0 rows.
  9. If the budget ran out, call `${SUPABASE_URL}/functions/v1/daily-newsletter` again with the same bearer token inside `EdgeRuntime.waitUntil(fetch(…))`, so the request is sent before the function shuts down, and return `continued: true`. The 07:30 backup job from T007 covers a broken chain.
  10. Otherwise set `send_finished_at`, `recipients`, `sent` and `failed` from counts over `newsletter_deliveries`, and return the contract body.
- [X] T040 [US2] Show a friendly message on `src/pages/404.astro` when a removed puzzle's link is opened. An inline script checks whether `location.pathname` matches `^/(checkmates|tactics|attacks)/practice/[a-z0-9]+$`. If so, it replaces the default text with "This puzzle is no longer available." and a link to that topic's practice page. Static HTML for other 404s is unchanged.

**Checkpoint**: quickstart.md §4 passes. US1 + US2 together make a newsletter that works.

---

## Phase 5: User Story 3 – Unsubscribe (P1)

**Goal**: one click in any email, or the email app's own unsubscribe button, stops further emails. Addresses that hard-bounce or report spam are unsubscribed automatically.

**Independent Test**: quickstart.md §5 and §6.

### Tests for User Story 3

- [X] T041 [P] [US3] Unit tests in `supabase/functions/_shared/webhook.test.ts`:
  - `verifySvix(secret, headers, body)` accepts a payload signed with a test `whsec_` secret, and rejects a changed body or a timestamp more than 5 minutes off.
  - `webhookAction(event)` gives `bounce` for `email.bounced` when `data.bounce.type === 'Permanent'`, `null` for other bounce types, `complaint` for `email.complained`, and `null` for every other event type.

### Implementation for User Story 3

- [X] T042 [US3] Write `supabase/functions/newsletter-unsubscribe/index.ts`, following contracts/http-api.md `POST /newsletter-unsubscribe`:
  - `GET` gets `405`.
  - The token comes from the `token` query parameter (one-click, form body `List-Unsubscribe=One-Click`) or from the JSON body `{token}`.
  - A non-UUID or unknown token gets `{"ok":true,"result":"invalid"}`.
  - Otherwise: `update newsletter_subscribers set status='unsubscribed', unsubscribed_at=coalesce(unsubscribed_at, now()), unsubscribe_reason=coalesce(unsubscribe_reason,'user') where unsubscribe_token=$1`. The response is `{"ok":true,"result":"unsubscribed"}`, and repeating it is harmless.
  - CORS uses the T009 helpers for the page's request. The one-click POST has no Origin header and is always allowed.
- [X] T043 [P] [US3] Write `src/pages/newsletter/unsubscribe.astro`:
  - Uses `Base`, with `noindex` and the title "Unsubscribe".
  - An inline script POSTs `{token}` from `location.search` to `/newsletter-unsubscribe` on load.
  - It shows one of:
    - `unsubscribed`: "You're unsubscribed. You won't get any more puzzle emails.", plus "Changed your mind? Subscribe again from the <a href="/">homepage</a>.";
    - `invalid`: "This unsubscribe link isn't valid. If you're still getting emails, reply to one and we'll remove you.";
    - an error: "Something went wrong – reload to try again."
  - (As built, the `invalid` text points to the contact details on the privacy page instead of "reply to one", because the sending address has no mailbox.)
  - Its `<script>` imports `clearSubscribed` from `src/lib/newsletter.ts` and calls it on `unsubscribed`, so the homepage link to subscribe again works (FR-003, User Story 3 scenario 4).
  - It must not need any click (User Story 3, scenario 1).
- [X] T044 [P] [US3] Write `supabase/functions/_shared/webhook.ts`:
  - `verifySvix(secret, headers, body)` implements the Svix scheme: the signed content is `${svix-id}.${svix-timestamp}.${body}`, signed with HMAC-SHA256 using the base64-decoded secret (without its `whsec_` prefix). The `v1,<sig>` entries in `svix-signature` are compared in constant time, and the timestamp must be within 5 minutes.
  - `webhookAction(event)` behaves as described in T041.
- [X] T045 [US3] Write `supabase/functions/resend-webhook/index.ts`. It reads the raw body and returns `401` if `verifySvix` fails. Otherwise, for a `bounce` or `complaint` action, it finds the address in the lower-cased `data.to[0]` and sets `status='unsubscribed', unsubscribed_at=now(), unsubscribe_reason=<action>` on that row, if it is not already unsubscribed. It always returns `200 {"ok":true}` after a valid signature.

**Checkpoint**: quickstart.md §5 and §6 pass. US1 + US2 + US3 make a newsletter that can launch.

---

## Phase 6: User Story 4 – The puzzle stays a puzzle (P2)

**Goal**: nothing in the email, the image description or the link gives away the pattern.

**Independent Test**: the tests below cover every puzzle (SC-003, FR-011).

- [X] T046 [P] [US4] Add a spoiler test in `tests/build.test.ts`. For every entry of `dist/newsletter/puzzles.json`, the serialized entry must not contain:
  - the exercise id;
  - the `motifId`;
  - the motif name (case-insensitive);
  - any `groups` name from `src/lib/topics.ts`;
  - any move from the exercise's `solution`, as a whole word;
  - the `hint`.

  Also check that the JSON has no keys other than `code, topic, fen, side, task, url, image, alt`.
- [X] T047 [US4] Add a build test in `tests/build.test.ts`. Import `renderDailyEmail` from `supabase/functions/_shared/email.ts`, render it for every catalogue entry, and run the same checks as T046 on the subject, `html` and `text`. This checks every puzzle a subscriber could ever receive.

**Checkpoint**: `npm run test:build` passes, including both spoiler checks.

---

## Phase 7: Polish & cross-cutting

- [X] T048 Rewrite the privacy page for FR-018 in `src/pages/privacy.astro`:
  - Remove "we never ask for your name, email or any other details".
  - Add a "Daily puzzle newsletter" section covering:
    - **what is stored:** email address, status, the dates subscribed, confirmed and unsubscribed, a scrambled IP address kept 24 hours to stop abuse, and per-day delivery records kept 7 days;
    - **why:** sending the puzzle you asked for (consent, GDPR article 6(1)(a));
    - **who processes it:** Supabase (EU) and Resend, both under data processing agreements;
    - **click counting:** "Solve it" links carry a newsletter tag that the site's existing analytics counts as an anonymous visit; emails contain no tracking pixel;
    - **how long things are kept:** unconfirmed addresses for 7 days, and unsubscribed addresses so we don't email them again, until you ask for deletion;
    - **how to unsubscribe:** the link in every email;
    - **how to ask for deletion:** email `site.email`.
- [X] T049 [P] Set `legalUpdated` to the launch date in `src/lib/site.ts`.
- [X] T050 [P] Add a build test to `tests/build.test.ts`:
  - `dist/privacy/index.html` contains "newsletter" and "Resend", and does not contain "never ask for your name, email".
  - `dist/index.html` contains the `NewsletterSignup` island's static placeholder (an `astro-island` whose `component-url` includes `NewsletterSignup`).
- [X] T051 [P] Document the newsletter in `README.md`:
  - what it does;
  - the `supabase/` layout;
  - `PUBLIC_NEWSLETTER_API`;
  - the secrets list (pointing to `supabase/functions/.env.example`);
  - deploy commands: `supabase db push`, `supabase functions deploy --no-verify-jwt <each>`, `supabase secrets set --env-file …`, then run `supabase/sql/schedule-daily.sql`;
  - the Resend setup (verify `mail.chess-patterns.com`, SPF, DKIM, DMARC, a webhook for `email.bounced` and `email.complained` pointing to `resend-webhook`, open and click tracking **off**, EU region);
  - the owner checks for FR-020 (the two SQL queries in quickstart.md §8);
  - deleting a subscriber on request (FR-019): `delete from newsletter_subscribers where email = lower('<address>')`.
- [X] T052 Run `npm test`, `npm run build` and `npm run test:build`, and fix any failures.
- [X] T053 Work through quickstart.md §2–§7 against a local Supabase (`supabase start`, `supabase functions serve`) and record the results in the PR description.
  - Done 2026-11-12 with Supabase CLI 3.1, a local Resend mock and 250 test subscribers: 65 of 65 checks passed, plus a send forced to hand over between runs (1 ms budget) that reached all 246 active subscribers exactly once. This found and fixed one bug: a run could hand over before sending anything, so a chain of runs never progressed; every run now sends at least one batch first. Not checkable locally: the local gateway adds `Access-Control-Allow-Origin: *` to every function response, so the site-only CORS rule is checked in T054 instead. The homepage form and the two pages were not tried in a browser.
- [ ] T054 Complete the quickstart.md §8 launch checklist for production: EU project, data processing agreements, `mail.chess-patterns.com` DNS (SPF, DKIM, DMARC), secrets and Vault, both `supabase/sql/schedule-daily.sql` jobs, `PUBLIC_NEWSLETTER_API` on Vercel, Resend tracking off, the Vercel Analytics UTM check (Google Analytics, already on the site, also reports `utm_source`), a CORS check against the deployed functions (`curl -X OPTIONS -H 'Origin: https://evil.example' …/newsletter-subscribe` must not return `Access-Control-Allow-Origin`), a quick browser run of the homepage form and the confirm/unsubscribe pages, and the SC-007 review of a real email in Gmail (web and mobile), Apple Mail (macOS and iOS) and Outlook (web and desktop). Record the results in the PR description.

---

## Dependencies & execution order

### Phase dependencies

- **Setup (Phase 1)** comes first. T001 is needed by T034, and T003 is needed by every `_shared` test.
- **Foundational (Phase 2)** depends on Setup and **blocks every story**:
  - T006 is needed by T021, T022, T039, T042 and T045.
  - T008–T012 are needed by every function.
- **US1 (Phase 3)** depends only on Phase 2.
- **US2 (Phase 4)** depends on Phase 2. It doesn't need US1's code, but a real send needs `active` subscribers, which come from US1 or from rows inserted by hand.
- **US3 (Phase 5)** depends on Phase 2. Its links are produced by US2's T038, but the endpoints can be tested on their own with a known token.
- **US4 (Phase 6)** depends on T036 (catalogue) and T038 (email rendering).
- **Polish (Phase 7)** depends on US1–US3. T050 needs T025 and T048. T054 comes last and needs the production deploy.

### Within each story

Tests first (T014–T016, T028–T031, T041). Write them to fail, then implement: pure `_shared` modules, then the functions, then the site pages.

### Parallel opportunities

- **Phase 1:** T003, T004 and T005.
- **Phase 2:** T008–T013, after T006.
- **US1:** T014–T020 all at once (separate files). Then T021 and T022, and T023 next to them.
- **US2:** T028–T031, then T033, T034 and T037 together. T035 and T036 need T033 and T034.
- **US3:** T041, T043 and T044 together. T045 needs T044.
- **Across stories:** after Phase 2, US1, the site half of US2 (T033–T036, T040) and US3 can be worked on by different people at the same time.

## Parallel example: User Story 2

```bash
# Tests together:
Task: "T028 puzzle-task tests in src/lib/puzzle-task.test.ts"
Task: "T029 board-image tests in src/lib/board-image.test.ts"
Task: "T030 choose tests in supabase/functions/_shared/choose.test.ts"
Task: "T031 daily email tests in supabase/functions/_shared/email.test.ts"

# Then the independent modules:
Task: "T033 src/lib/puzzle-task.ts"
Task: "T034 src/lib/board-image.ts"
Task: "T037 supabase/functions/_shared/choose.ts"
```

## Implementation strategy

### MVP (launchable)

US1, US2 and US3 are all P1. A newsletter without unsubscribe can't launch (spec, US3 priority), so the MVP is **Phases 1–5**.

### Incremental delivery

1. **Phases 1–2:** the schema and helpers. `supabase db reset` and `npm test` pass.
2. **Phase 3 (US1):** the call to action can ship hidden, by leaving `PUBLIC_NEWSLETTER_API` unset, or live, so people can start subscribing before the first email exists.
3. **Phase 4 (US2):** schedule `daily-newsletter` only after US3 is deployed.
4. **Phase 5 (US3):** deploy, then run `supabase/sql/schedule-daily.sql`. This is the launch.
5. **Phase 6 (US4)** and **Phase 7:** the spoiler checks, the privacy page (**required before launch**, FR-018, so do T048 before setting `PUBLIC_NEWSLETTER_API` in production), and the docs.

### Notes

- Never put the exercise id or motif in the database, the catalogue or an email. Use `shareCode` only.
- `_shared/*.ts` must stay free of Deno globals, except `db.ts`, so Vitest can import it.
- Don't commit `.env`, `.env.local` or secrets.
