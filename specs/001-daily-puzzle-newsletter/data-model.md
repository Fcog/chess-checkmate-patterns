# Data model: Daily puzzle newsletter

Supabase Postgres, in an EU region. Every table has row-level security switched on and **no policies**, so only the Edge Functions, using the service role, can read or write. Nothing is reachable with the anon key. All times are `timestamptz`, and a "day" is a UTC `date` (clarification Q3).

## newsletter_subscribers

This table is the spec's **Subscriber** entity. It keeps only what FR-017 allows.

| Column | Type | Rules |
|---|---|---|
| `id` | `uuid` PK | `default gen_random_uuid()` |
| `email` | `text` not null | Stored trimmed and lower-case. Unique. At most 320 characters. The format is checked in `validate.ts` before insert |
| `status` | `text` not null | One of `pending`, `active`, `unsubscribed` |
| `confirm_token` | `uuid` not null, unique | Replaced when a row moves from `unsubscribed` back to `pending` |
| `confirm_expires_at` | `timestamptz` | Set to `now() + 7 days` on every confirmation send, so a link expires 7 days after the most recent confirmation email (FR-004a). Only used while `pending` |
| `confirmation_sent_at` | `timestamptz` | Used for the once-an-hour re-send limit (FR-004b) |
| `unsubscribe_token` | `uuid` not null, unique | Never changes |
| `subscribed_at` | `timestamptz` not null | Time of the latest submit that set the row to `pending` |
| `confirmed_at` | `timestamptz` | |
| `unsubscribed_at` | `timestamptz` | |
| `unsubscribe_reason` | `text` | One of `user`, `bounce`, `complaint` (FR-015) |

Index: `(status)`, for picking recipients.

### State transitions

```text
              submit (new address)
   (none) ───────────────────────────▶ pending ──confirm link (before expiry)──▶ active
     ▲                                    │                                      │
     │        expiry passes (cleanup)     │                                      │ unsubscribe link / one-click
     └────────────────────────────────────┘                                      │ hard bounce / complaint
                                                                                 ▼
   pending ◀──────── submit again (new confirm_token, new 7-day window) ──── unsubscribed
```

| Current status | Event | Result | Email sent |
|---|---|---|---|
| none | submit | insert `pending` | confirmation |
| `pending` | submit | extend `confirm_expires_at` if a confirmation is re-sent | confirmation, if `confirmation_sent_at` is more than 1 hour ago |
| `pending` | confirm link | `active`, set `confirmed_at` | none |
| `pending` | expiry passes | row deleted | none |
| `active` | submit | no change | none. The visitor sees the same success message (FR-005) |
| `active` | confirm link | no change, answer `already` | none |
| `active` | unsubscribe, bounce or complaint | `unsubscribed`, set `unsubscribed_at` and the reason | none |
| `unsubscribed` | submit | `pending`, new `confirm_token`, `confirmed_at` and `unsubscribed_at` cleared | confirmation |
| `unsubscribed` | old confirm link | no change, answer `invalid` | none |
| any | deletion request (FR-019) | row deleted by the owner, along with its delivery rows (cascade) | none |

## newsletter_days

This table holds the spec's **Daily puzzle** entity, and the send history the owner checks for FR-020.

| Column | Type | Rules |
|---|---|---|
| `day` | `date` PK | UTC day |
| `cycle` | `int` not null | Starts at 1. Goes up by one when every catalogue code has been sent in the current cycle |
| `puzzle_code` | `text` not null | A share code from the catalogue (never the exercise id) |
| `send_started_at` | `timestamptz` | Once this is set, `puzzle_code` cannot change |
| `send_finished_at` | `timestamptz` | |
| `recipients` | `int` | Totals stored when the send finishes |
| `sent` | `int` | |
| `failed` | `int` | |

Rule: `unique (cycle, puzzle_code)`. A puzzle can appear only once per cycle (FR-008).

## newsletter_deliveries

Each row is one recipient of one day's email. It lets a send be resumed without duplicates (research R6).

| Column | Type | Rules |
|---|---|---|
| `day` | `date` | FK → `newsletter_days.day` |
| `subscriber_id` | `uuid` | FK → `newsletter_subscribers.id`, `on delete cascade` |
| `batch_no` | `int` not null | Part of the Resend idempotency key `daily/<day>/<batch_no>` |
| `status` | `text` not null | One of `claimed`, `sent`, `failed` |
| `resend_id` | `text` | |
| `updated_at` | `timestamptz` not null | |

PK `(day, subscriber_id)`. This is the database-level guarantee behind SC-005: nobody gets two emails on one day.

## newsletter_signup_attempts

Holds the short-lived hashed IP from clarification Q2.

| Column | Type | Rules |
|---|---|---|
| `ip_hash` | `text` not null | `HMAC-SHA256(IP_HASH_SECRET, ip)`, hex |
| `at` | `timestamptz` not null | `default now()` |

Index `(ip_hash, at)`. Allowed when `count(*) where ip_hash = $1 and at > now() - interval '1 hour'` is below 5.

## Retention

A cron job at `30 3 * * *` (UTC) cleans up:

| Data | Deleted when |
|---|---|
| `pending` subscribers | `confirm_expires_at < now()` (FR-004a) |
| `newsletter_signup_attempts` | `at < now() - interval '24 hours'` (Q2) |
| `newsletter_deliveries` | `day < current_date - 7` |
| `newsletter_days` | never. It holds no personal data and is needed for cycle tracking and FR-020 |
| `unsubscribed` subscribers | Kept so they are never emailed again. Deleted on request (FR-019). The privacy page says so |

## Browser: Submitted marker

Key `localStorage['checkmate-patterns:newsletter']`, holding a JSON value:

| Value | Written when | Hides the call to action? |
|---|---|---|
| `{"state":"pending","at":<ms since epoch>}` | after a `200` from subscribe | yes, while `now - at < 7 days` (the same window as FR-004a). After that it counts as missing and is removed |
| `{"state":"confirmed"}` | on the confirm page for `confirmed` or `already` | yes, with no time limit |
| missing, or a value that doesn't parse | the confirm page removes it for `invalid`; the unsubscribe page removes it after a successful unsubscribe | no |

This covers a confirmation email that never arrives: the visitor has no link to open, but the pending marker runs out after 7 days, and the call to action is back (FR-003). If reading or writing `localStorage` throws, the call to action shows as if the marker were missing.

## Site build (not stored in the database): puzzle catalogue

This is the spec's **Puzzle** entity as the backend sees it. See [contracts/puzzle-catalogue.md](./contracts/puzzle-catalogue.md). It is derived from `src/lib/exercises.ts` on every build and is never written to by the newsletter.
