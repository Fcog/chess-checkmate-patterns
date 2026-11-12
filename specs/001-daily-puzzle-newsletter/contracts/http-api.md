# Contract: newsletter HTTP endpoints (Supabase Edge Functions)

Base URL: `https://<ref>.supabase.co/functions/v1`. The site reads it from `PUBLIC_NEWSLETTER_API`.

All functions:
- are deployed with `--no-verify-jwt`;
- use the service role inside;
- accept and return JSON (`Content-Type: application/json`).

The three browser-facing functions answer `OPTIONS` and allow only `SITE_URL` as the origin, plus `http://localhost:4321` when `ALLOWED_ORIGINS` includes it. Error bodies are `{ "ok": false, "error": "<code>" }`.

## POST /newsletter-subscribe

Called by the homepage form.

Request:
```json
{ "email": "reader@example.com", "website": "" }
```

| Step | Condition | Response |
|---|---|---|
| 1 | `website` is not empty (honeypot) | `200 {"ok":true}`, nothing stored or sent |
| 2 | The email, after trim and lower-case, fails `^[^\s@]+@[^\s@]+\.[^\s@]+$`, or is over 320 characters | `400 {"ok":false,"error":"invalid-email"}` |
| 3 | 5 or more attempts from `ip_hash` in the last hour | `429 {"ok":false,"error":"rate-limited"}` |
| 4 | The attempt is recorded, then the address is handled as in the [data-model.md](../data-model.md#state-transitions) state table | `200 {"ok":true}` |
| – | Resend or database failure | `500 {"ok":false,"error":"server"}`. The browser stores no marker |

The response is the same for new, pending and already active addresses (FR-005). There is no `already` flag, unlike in the reference, so the form can't be used to check whether an address is subscribed.

## POST /newsletter-confirm

Called by `/newsletter/confirm?token=…`.

Request `{ "token": "<uuid>" }` → `200` with:

| Result | Body |
|---|---|
| Was `pending`, not expired | `{"ok":true,"result":"confirmed","firstSend":"2026-11-12T07:00:00Z"}` |
| Already `active` | `{"ok":true,"result":"already"}` |
| Unknown, expired or unsubscribed token, or not a valid UUID | `{"ok":true,"result":"invalid"}` |

## POST /newsletter-unsubscribe

There are two ways in:
1. The `/newsletter/unsubscribe?token=…` page sends a JSON body `{ "token": "<uuid>" }`.
2. RFC 8058 one-click: `POST /newsletter-unsubscribe?token=<uuid>` with the form body `List-Unsubscribe=One-Click`.

| Result | Status and body |
|---|---|
| Was `active` or `pending` | `200 {"ok":true,"result":"unsubscribed"}` |
| Already `unsubscribed` | `200 {"ok":true,"result":"unsubscribed"}` (repeating it is harmless) |
| Unknown token | `200 {"ok":true,"result":"invalid"}` |

`GET` returns `405`, so link scanners cannot unsubscribe anyone (research R9).

## POST /daily-newsletter

Called by pg_cron. Requires `Authorization: Bearer <CRON_SECRET>`, otherwise it returns `401`.

| Query | Meaning |
|---|---|
| none | Normal run. If today's send is already finished, it returns `{"ok":true,"skipped":"already-sent-today"}` |
| `retry=1` | The 07:30 backup job. Like a normal run, but first retries today's `failed` batches once, under their original idempotency keys |
| `force=1` | The same as `retry=1`, for a manual run. Neither ever re-sends rows that are `sent` |

Response:
```json
{ "ok": true, "day": "2026-11-12", "puzzle": "k3x9a", "recipients": 812, "sent": 810, "failed": 2, "continued": false }
```
`continued: true` means the time budget ran out, and the function has called itself again to finish (research R6).

`500` is returned if the catalogue can't be fetched or the database fails. In that case nothing is marked as sent.

## POST /resend-webhook

Called by Resend. Its Svix signature headers (`svix-id`, `svix-timestamp`, `svix-signature`) are checked against `RESEND_WEBHOOK_SECRET`. A request that fails the check gets `401`.

| Event | Effect |
|---|---|
| `email.bounced` with `bounce.type = "Permanent"` | The matching active subscriber becomes `unsubscribed`, with reason `bounce` |
| `email.complained` | Becomes `unsubscribed`, with reason `complaint` |
| anything else | No effect |

Always `200 {"ok":true}` once the signature is valid, so Resend doesn't retry.

## Secrets

| Name | Used by |
|---|---|
| `RESEND_API_KEY` | subscribe, daily |
| `FROM_EMAIL` (`Chess Patterns <puzzles@mail.chess-patterns.com>`) | subscribe, daily |
| `SITE_URL` (`https://www.chess-patterns.com`, no trailing slash) | everything (CORS, links, catalogue) |
| `ALLOWED_ORIGINS` (optional, comma-separated) | browser-facing functions |
| `IP_HASH_SECRET` | subscribe |
| `CRON_SECRET` (also stored in Vault for pg_cron) | daily |
| `RESEND_WEBHOOK_SECRET` | resend-webhook |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided by Supabase automatically.
