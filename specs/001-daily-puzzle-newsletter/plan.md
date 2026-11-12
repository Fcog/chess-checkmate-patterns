# Implementation Plan: Daily puzzle newsletter

**Branch**: `main` (no feature branch; Spec Kit reports `001-daily-puzzle-newsletter` from `.specify/feature.json`) | **Date**: 2026-11-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-daily-puzzle-newsletter/spec.md`

## Summary

A homepage call to action collects email addresses with double opt-in. Every day at 07:00 UTC, each confirmed subscriber gets the same practice puzzle: a board picture, the side to move, the task and a "Solve it" button that opens the puzzle's existing share page (`/<topic>/practice/<code>`). No puzzle repeats until all have been sent.

The static Astro site stays static. At build time it also produces a board PNG for every practice puzzle, and a spoiler-free catalogue of the puzzles (`/newsletter/puzzles.json`). Everything that runs on a server lives in Supabase, following the owner's reference newsletter:

- Postgres tables.
- Five Edge Functions: subscribe, confirm, unsubscribe, daily send and the Resend webhook.
- pg_cron for the 07:00 send (with a 07:30 backup run that finishes an interrupted send) and the nightly clean-up.

Resend sends the email. It uses the batch API with idempotency keys, so a send can be re-run without anyone getting a second email. Its webhooks unsubscribe addresses that hard-bounce or report spam.

## Technical Context

**Language/Version**: TypeScript 6 for the site (Astro 7, React 18, run with Node 26 at build time). TypeScript for the Edge Functions, which run on Deno in Supabase. SQL for the Postgres migrations.

**Primary Dependencies**:
- Existing: Astro, React, chess.js, Vercel Analytics.
- New, site build only: `@resvg/resvg-js`, which turns an SVG into a PNG. The board pictures use the cburnett piece SVGs already shipped in `chessground/assets/chessground.cburnett.css`.
- New, backend: Supabase (Postgres, Edge Functions, pg_cron, pg_net, Vault) and the Resend REST API.
- The site gets no Supabase SDK. It calls the functions with `fetch`.

**Storage**:
- Supabase Postgres in an EU region (Frankfurt), described in [data-model.md](./data-model.md).
- Browser `localStorage` key `checkmate-patterns:newsletter`, which hides the call to action after a successful submit.

**Testing**: Vitest.
- **Unit tests:** the pure modules under `supabase/functions/_shared/` (email rendering, validation, puzzle choice, tokens). They have no Deno globals, so vitest imports them directly. `npm test` will also cover `supabase/functions`.
- **Build test:** `tests/build.test.ts` checks the built PNGs, the catalogue, the call to action and the privacy page.
- **Full check:** an end-to-end run against a local Supabase (`supabase start`), described in [quickstart.md](./quickstart.md).

**Target Platform**: the static site on Vercel. Edge Functions on Supabase (Deno). Emails in Gmail, Apple Mail and Outlook (SC-007).

**Project Type**: a static website with a small serverless backend.

**Performance Goals**:
- The confirmation email is sent within 2 minutes (SC-001). It is sent while the subscribe request is being handled, which takes under 2 seconds.
- The daily send finishes within 1 hour (SC-002). At 100 recipients per batch call, 10,000 subscribers is 100 calls.

**Constraints**:
- Data stays in the EU (GDPR), with a data processing agreement (DPA) signed with both Supabase and Resend.
- The email never names the pattern (FR-011). The catalogue and the database only use share codes.
- Edge Functions have a 150 s wall-clock limit on the free plan, so the send works in batches and can be resumed (research R6).
- **Resend free plan: 100 emails a day.** Beyond about 90 subscribers this needs Resend Pro.

**Scale/Scope**: 240 practice puzzles today, which is about an 8-month cycle. Fewer than 10,000 subscribers expected. The work touches 5 functions, 1 migration, 2 new pages, 1 island component, the 404 page and the privacy page.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the unfilled template, so it sets no project principles to check against. **Gate: PASS (no gates).**

Instead, the plan was checked against conventions already in this repo:
- Data stays in TypeScript modules.
- Spoiler-free share codes.
- `npm test` and `npm run test:build` must pass.
- Placeholders in the legal pages make `test:build` fail.

The design keeps all four. Re-checked after Phase 1: still PASS.

## Project Structure

### Documentation (this feature)

```text
specs/001-daily-puzzle-newsletter/
├── plan.md              # This file
├── research.md          # Phase 0: decisions R1–R13
├── data-model.md        # Phase 1: tables, states, retention
├── quickstart.md        # Phase 1: local end-to-end validation
├── contracts/
│   ├── http-api.md      # The Edge Function endpoints
│   ├── puzzle-catalogue.md  # /newsletter/puzzles.json and the board PNGs
│   └── email.md         # Content and headers of both emails
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── env.d.ts                      # NEW: types PUBLIC_NEWSLETTER_API
├── lib/
│   ├── puzzle-task.ts            # NEW: task and side text for an exercise, taken out of [code].astro
│   ├── board-image.ts            # NEW: FEN → board SVG (cburnett pieces) → PNG, build time only
│   └── newsletter.ts             # NEW: localStorage marker, functions URL, next send time
├── components/react/
│   └── NewsletterSignup.tsx      # NEW: homepage call to action (email + honeypot)
└── pages/
    ├── index.astro               # adds <NewsletterSignup client:load />
    ├── privacy.astro             # rewritten newsletter section (FR-018)
    ├── 404.astro                 # friendly message for a removed puzzle's link
    ├── [topic]/practice/[code].astro  # uses puzzle-task.ts
    └── newsletter/
        ├── confirm.astro         # NEW: ?token= → confirm function
        ├── unsubscribe.astro     # NEW: ?token= → unsubscribe function
        ├── puzzles.json.ts       # NEW: static endpoint, the puzzle catalogue
        └── board/[code].png.ts   # NEW: static endpoint, one PNG per puzzle

supabase/
├── config.toml
├── migrations/
│   └── 20261111000000_newsletter.sql  # tables, RLS, claim-batch function, clean-up cron job
├── sql/
│   └── schedule-daily.sql        # per environment: 07:00 send + 07:30 backup cron jobs (secret from Vault)
└── functions/
    ├── _shared/                  # pure TS, tested with vitest (except db.ts)
    │   ├── email.ts              # renders the daily and confirmation emails (HTML + text)
    │   ├── escape.ts
    │   ├── validate.ts           # email checks, honeypot
    │   ├── subscribe.ts          # what a submit does, per subscriber state
    │   ├── ratelimit.ts          # keyed IP hash, limits
    │   ├── schedule.ts           # next 07:00 UTC send time
    │   ├── choose.ts             # picks the day's puzzle, no repeats within a cycle
    │   ├── resend.ts             # send / batch with idempotency key
    │   ├── webhook.ts            # Svix signature check, bounce/complaint mapping
    │   ├── http.ts               # CORS (site origin only), JSON responses
    │   ├── env.ts                # typed secrets
    │   ├── db.ts                 # service-role client (Deno only)
    │   └── *.test.ts
    ├── newsletter-subscribe/index.ts
    ├── newsletter-confirm/index.ts
    ├── newsletter-unsubscribe/index.ts
    ├── daily-newsletter/index.ts
    └── resend-webhook/index.ts

tests/build.test.ts               # PNG and catalogue for every exercise, call to action, privacy text
```

**Structure Decision**: the Astro site stays a single project in `src/`. The backend goes in the standard Supabase CLI layout under `supabase/`, so `supabase start`, `supabase db push` and `supabase functions deploy` work without extra setup. The site sees only static files and one URL, the public env var `PUBLIC_NEWSLETTER_API` (the functions base URL). Changes to puzzles still only touch `src/data`.

## Complexity Tracking

No constitution violations to justify. One deliberate extra piece of data:

| Addition | Why needed | Simpler alternative rejected because |
|---|---|---|
| `newsletter_deliveries` table (subscriber × day, kept 7 days) | Resuming an interrupted send without emailing anyone twice (SC-005, the "send fails partway" edge case) | A single "sent" flag per day, as in the reference, cannot resume halfway: it either re-sends everyone or skips the rest |
