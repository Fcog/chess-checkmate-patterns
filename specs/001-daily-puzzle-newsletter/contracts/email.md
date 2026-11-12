# Contract: emails

Both emails are rendered by `supabase/functions/_shared/email.ts`:
- as HTML (inline styles, a centred wrapper 560px at most, system font) plus a plain-text part (FR-012);
- with every value from the data HTML-escaped;
- in English.

## Daily puzzle email

| Part | Content |
|---|---|
| From | `FROM_EMAIL` |
| Subject | `Daily chess puzzle: <task>`, e.g. `Daily chess puzzle: White to play and mate in 2` |
| Preheader (hidden) | `Can you solve today's position?` |
| Body | A small grey "Daily puzzle · <date>" label, the board PNG (`width=320`, `alt` from the catalogue), a "White to move" / "Black to move" line (always, including quizzes), the task in bold, then a blue "Solve it" button linking to the catalogue `url` + `?utm_source=newsletter&utm_medium=email` |
| Footer | "You get this because you subscribed at chess-patterns.com." Links to Unsubscribe (`SITE_URL/newsletter/unsubscribe?token=<unsubscribe_token>`) and to the privacy page (`SITE_URL/privacy`). Shows the sender's name and country (FR-014) |
| Headers | `List-Unsubscribe: <https://<ref>.supabase.co/functions/v1/newsletter-unsubscribe?token=<t>>` and `List-Unsubscribe-Post: List-Unsubscribe=One-Click` |
| Text part | Side to move, task, "Solve it: <url>?utm_source=newsletter&utm_medium=email", the alt text, the unsubscribe URL and the privacy URL |
| Tracking | Resend open and click tracking off. No pixel. Clicks are counted only by the link's UTM tag (research R11) |

**Must never contain** (FR-011, checked by a unit test that renders every catalogue puzzle):
- motif names;
- topic group names;
- exercise ids;
- the solution moves;
- the hint.

## Confirmation email

| Part | Content |
|---|---|
| Subject | `Confirm your daily chess puzzle subscription` |
| Body | One sentence explaining the request, then a "Confirm subscription" button linking to `SITE_URL/newsletter/confirm?token=<confirm_token>`, "This link expires in 7 days", and "If you didn't ask for this, ignore this email and you won't hear from us again" |
| Headers | No List-Unsubscribe, because this is not a newsletter |
| Tracking | None (tracking is off for the whole sending domain) |
