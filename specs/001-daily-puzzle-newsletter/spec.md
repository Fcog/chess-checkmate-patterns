# Feature Specification: Daily puzzle newsletter

**Feature Branch**: `main` (no feature branch was created for this spec)

**Created**: 2026-11-10

**Status**: Draft

**Input**: User description: "create a newsletter using the service Resend that will send a daily email to the users that submit their email in a CTA located in the homepage. The email will contain a puzzle, possible a snapshot, of an exercise and when the user clicks to solve it, he is redirected to the puzzle page. The CTA will not show anymore using local storage if the user submitted the form."

## Clarifications

### Session 2026-11-11

- Q: How should the chess board appear in the email? → A: A picture of the board, made in advance for every practice puzzle and hosted on the site, with a text description.
- Q: To limit sign-ups to 5 per hour from one source, what may we keep about the visitor's network (IP) address? → A: Only a scrambled, one-way copy (hash) of it, used for the hourly limit and deleted after 24 hours.
- Q: Should the daily email go out at 08:00 Amsterdam time all year, or at a fixed 07:00 UTC? → A: 07:00 UTC all year (08:00 in winter, 09:00 in summer in the Netherlands).

### Session 2026-11-12

- Q: Should the newsletter count email opens and clicks? → A: Clicks only. No open tracking; "Solve it" links carry a newsletter tag counted by the site's existing analytics.

## User Scenarios & Testing *(mandatory)*

Visitors who enjoy the puzzles have no reason to come back unless they remember to. A daily email with one puzzle gives them that reason: they see a position in their inbox, click "Solve it", and land on the puzzle on the site.

### User Story 1 - Subscribe from the homepage (Priority: P1)

A visitor on the homepage sees a short call to action ("Get a chess puzzle in your inbox every day"), enters their email address and submits. The page tells them to check their inbox, and the call to action does not appear again in that browser. They click the link in the confirmation email, and their subscription starts.

**Why this priority**: Without subscribers there is no newsletter. Collecting addresses is the first slice that delivers value, and it can ship before the first email is sent.

**Independent Test**: Open the homepage and submit a valid email address. Check that a "check your inbox" message is shown, a confirmation email arrives, and the address becomes an active subscriber after its link is clicked. Then reload the homepage and check the call to action is gone.

**Acceptance Scenarios**:

1. **Given** a visitor on the homepage who has never subscribed in this browser, **When** they enter a valid email address and submit, **Then** the form is replaced by a message asking them to check their inbox and click the confirmation link, and a confirmation email is sent.
2. **Given** a visitor who has received the confirmation email, **When** they click its link within 7 days, **Then** they see a page saying they are subscribed and when the first puzzle will arrive, and they receive the next daily email.
3. **Given** a visitor who never clicks the confirmation link, **When** daily sends run, **Then** they receive no puzzle emails, and 7 days after the last confirmation email their address is deleted.
4. **Given** a visitor who clicks a confirmation link that has expired or was already used, **When** the page opens, **Then** they see a clear message, with a link back to the homepage to subscribe again (or, if already confirmed, a message saying they are already subscribed).
5. **Given** a visitor who has submitted the form in this browser, **When** they visit the homepage again later, **Then** the call to action is not shown.
6. **Given** a visitor who enters an invalid email address, **When** they submit, **Then** they see a clear message saying what to fix, nothing is stored, and the call to action is still shown on later visits.
7. **Given** a visitor whose submission fails (for example, they have no connection), **When** they submit, **Then** they see a message asking them to try again, and the call to action is still shown on later visits.
8. **Given** an address that is already subscribed, **When** it is submitted again, **Then** the visitor sees the same success message (without being told the address was already on the list), and no duplicate subscriber is created.

---

### User Story 2 - Receive a daily puzzle and solve it on the site (Priority: P1)

A subscriber receives one email a day. It shows a puzzle position as an image of the board, says whose move it is and what the task is (for example "White to play and mate in 2"), and has a "Solve it" button. Clicking the button opens that exact puzzle on the site, ready to play.

**Why this priority**: This is the newsletter itself. Together with User Story 1 it forms the smallest useful product.

**Independent Test**: Subscribe a test address, trigger the daily send, and check that one email arrives with a board image, the task text and a button that opens the matching puzzle on the site.

**Acceptance Scenarios**:

1. **Given** a confirmed subscriber, **When** the daily send runs, **Then** they receive exactly one email for that day containing a board image, the side to move, the task, and a "Solve it" link.
2. **Given** a subscriber who clicks "Solve it", **When** the page opens, **Then** it shows the same position as the email, with the puzzle ready to solve.
3. **Given** a subscriber whose email app does not show images, **When** they open the email, **Then** they still see the side to move, the task and the "Solve it" link, plus a short text description of the image.
4. **Given** the same day's email, **When** any two subscribers compare it, **Then** they got the same puzzle.

---

### User Story 3 - Unsubscribe (Priority: P1)

A subscriber who no longer wants the emails clicks "Unsubscribe" at the bottom of any email, and no further emails are sent to them.

**Why this priority**: Every marketing email must offer a working one-click unsubscribe, both legally and to meet email providers' sender rules. Without it the newsletter cannot launch.

**Independent Test**: Subscribe a test address, receive an email, click "Unsubscribe", see a confirmation page, and check that no email arrives at the next daily send.

**Acceptance Scenarios**:

1. **Given** a subscriber, **When** they click "Unsubscribe" in any email, **Then** they see a page confirming they have been unsubscribed, with no sign-in or extra steps.
2. **Given** a subscriber who has unsubscribed, **When** the next daily send runs, **Then** no email is sent to them.
3. **Given** a subscriber whose email app offers a built-in "unsubscribe" button for newsletters, **When** they use it, **Then** they are unsubscribed exactly as in scenario 1.
4. **Given** someone who has unsubscribed, **When** they subscribe again from the homepage, **Then** they receive a new confirmation email, and become a subscriber again once they click its link.

---

### User Story 4 - The puzzle stays a puzzle (Priority: P2)

The email does not give the answer away: it does not name the pattern or tactic (for example "Back-rank mate"), and the link does not reveal it either. The pattern name is shown only after the puzzle is solved on the site, as in Practice today.

**Why this priority**: Recognising the pattern yourself is the point of Practice. The newsletter is still usable without this, so it comes after the core stories.

**Independent Test**: Read a sent email and its link address, and check that neither contains the pattern name or the exercise id.

**Acceptance Scenarios**:

1. **Given** a daily email, **When** a subscriber reads the email text, the image description and the link address, **Then** none of them names the pattern, tactic or attack.

---

### Edge Cases

- **Puzzles run out**: when every puzzle has been sent once, the cycle starts again in a new order. A puzzle is never repeated until all puzzles have been sent.
- **Puzzle removed or changed on the site**: a puzzle that no longer exists is never chosen. An old email whose puzzle has been removed links to a friendly page that offers today's practice instead of an error.
- **Address bounces or marked as spam**: an address that hard-bounces, or whose owner marks an email as spam, is unsubscribed automatically so the newsletter keeps a good sending reputation.
- **Daily send fails partway**: if a send is interrupted, it resumes without sending anyone the same day's email twice.
- **Local storage unavailable** (for example private browsing, or storage blocked): subscribing still works, but the call to action may show again on a later visit. Re-submitting is harmless (User Story 1, scenario 8).
- **Different browser or device**: the call to action shows again in a browser that has never submitted the form. This is accepted, because the site has no accounts.
- **Automated sign-ups**: bots submitting many addresses are blocked or slowed down. An address entered by someone else gets only the confirmation email, and nothing more unless its owner clicks the link (FR-004).
- **Confirmation email not received**: a visitor who never sees the confirmation email (spam folder, typo) can submit the form again: 7 days after submitting, if they haven't confirmed in that browser, the call to action is back on the homepage (sooner if they open an expired link, or from any browser that still shows it). A pending address gets the confirmation email again (FR-004b), and a mistyped address is simply never confirmed and is deleted after 7 days.
- **Old email opened later**: the "Solve it" link in any past email keeps opening the same puzzle for as long as that puzzle exists on the site.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The homepage MUST show a call to action with a one-line description of the newsletter, an email field and a submit button. Nothing else (name, preferences) is asked for.
- **FR-002**: The call to action MUST validate the email address before submitting, and MUST show a clear message for an invalid address.
- **FR-003**: After a successful submission, the browser MUST remember it, and the homepage MUST NOT show the call to action in that browser again. A failed or invalid submission MUST NOT hide it. The browser MUST forget the submission, so the call to action shows again, when a confirmation link opens as expired or invalid, when the visitor unsubscribes on the unsubscribe page, and when 7 days have passed since the submission without the subscription being confirmed in that browser.
- **FR-004**: New subscribers MUST confirm their address (double opt-in). Submitting the form sends one confirmation email with a link, and the address receives daily puzzles only after that link is clicked. Clicking it shows a page confirming the subscription and when the first puzzle will arrive.
- **FR-004a**: A confirmation link MUST expire 7 days after the most recent confirmation email for that address. Addresses not confirmed by then MUST be deleted, and can subscribe again from the homepage.
- **FR-004b**: Submitting an address that is still waiting for confirmation MUST re-send the confirmation email, at most once per hour per address.
- **FR-005**: Submitting an address that is already subscribed MUST NOT create a duplicate, and MUST show the same message as a new subscription.
- **FR-006**: Each confirmed subscriber MUST receive at most one newsletter email per day, sent at 07:00 UTC every day. A "day" is a UTC calendar day. If the send is started again on a day it already ran, it MUST send nothing.
- **FR-007**: Every subscriber MUST receive the same puzzle on a given day, chosen from the site's practice puzzles across all topics (Checkmates, Tactics and Attacks).
- **FR-008**: Puzzles MUST NOT repeat until every available puzzle has been sent once.
- **FR-009**: Each email MUST contain a picture of the board position from the solver's side (made in advance for every practice puzzle and hosted on the site, so it does not depend on the email app drawing anything), the side to move, the task (as shown on the site, for example "Mate in 2", "Win material", "Break through" or "Sound or not?"), and a clearly visible "Solve it" link.
- **FR-010**: The "Solve it" link MUST open the site's page for that exact puzzle, using the same spoiler-free link the site already uses for sharing practice puzzles. The link goes straight to the site (no redirect through the email service) and carries only a tag marking the visit as coming from the newsletter.
- **FR-011**: The email text, image description and link MUST NOT reveal the pattern, tactic or attack name, or the exercise id.
- **FR-012**: The email MUST still be usable with images turned off: the task, side to move and "Solve it" link are plain text, and the image has a text description. Every email (daily puzzle and confirmation) MUST also include a plain-text version for email apps that do not show formatted email.
- **FR-013**: Every email MUST include a one-click unsubscribe link and support email apps' built-in unsubscribe button. Unsubscribing MUST take effect before the next daily send.
- **FR-014**: Every email MUST identify who sends it and why the recipient is receiving it, with a link to the privacy page.
- **FR-015**: Addresses that hard-bounce, or whose owners report an email as spam, MUST be unsubscribed automatically.
- **FR-016**: The subscription form MUST be protected against automated abuse: at most 5 submissions per hour from one network (IP) address, and a hidden field that people never fill in (submissions that fill it are silently ignored). Over the limit, the visitor sees a message asking them to try again later. To apply the limit, only a one-way scrambled copy (hash) of the IP address is kept, and it is deleted after 24 hours.
- **FR-017**: The newsletter MUST store only: the subscriber's email address and subscription status; the dates they subscribed, confirmed and unsubscribed, and why they were unsubscribed (their request, a bounce or a spam report); the data needed to run the subscription (the confirmation and unsubscribe link codes, and when the last confirmation email was sent and expires); a record of which addresses got each day's email, kept for 7 days; and the short-lived scrambled IP address from FR-016. Emails MUST NOT contain open-tracking pixels.
- **FR-018**: The privacy page MUST be updated before launch to explain what is stored for the newsletter (including the scrambled IP address kept for 24 hours to stop abuse, and the 7-day delivery record), how clicks from the email are counted, why, who processes it (the email sending service), how to unsubscribe, and how to ask for the address to be deleted. Its current statement that the site never asks for an email address MUST be removed. The call to action MUST link to the privacy page.
- **FR-019**: A subscriber MUST be able to have their address deleted completely on request, not just unsubscribed.
- **FR-020**: The site owner MUST be able to see how many people are subscribed, and whether each day's send succeeded.

### Key Entities

- **Subscriber**: one email address that asked for the newsletter. Holds the address, its status (pending confirmation, active, or unsubscribed), and the dates it subscribed, confirmed and unsubscribed. Only active subscribers receive daily puzzles, and pending addresses are deleted after 7 days. Each address appears once.
- **Daily puzzle**: the puzzle chosen for one date. Holds the date and the puzzle it refers to, and is shared by every email sent that day. Together, these records also track which puzzles have already been sent in the current cycle.
- **Puzzle**: one of the site's existing practice puzzles, with its position, side to move, task, spoiler-free share link and a board picture hosted on the site (made in advance for every practice puzzle). The newsletter reuses these and never changes them.
- **Submitted marker**: a flag kept in the visitor's browser recording that they have submitted the form (and when), or that they confirmed. It is used only to hide the call to action, and a submission left unconfirmed for 7 days stops hiding it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor can submit the form in under 30 seconds, and the confirmation email arrives within 2 minutes in at least 99% of cases.
- **SC-002**: On a typical day, at least 99% of active subscribers receive that day's email within 1 hour of the scheduled send time.
- **SC-003**: 100% of "Solve it" links in sent emails open the same position as the email image, in automated checks on every puzzle.
- **SC-004**: 100% of unsubscribe requests take effect before the next daily send.
- **SC-005**: No subscriber ever receives two newsletter emails on the same day.
- **SC-006**: After submitting the form, a visitor sees no call to action on the homepage on any later visit in the same browser, as long as browser storage is available. The only exceptions are the FR-003 cases (unconfirmed after 7 days, an expired link opened, or unsubscribed).
- **SC-007**: The email reads correctly, with or without images, in Gmail (web and mobile), Apple Mail (macOS and iOS) and Outlook (web and desktop).
- **SC-008**: Within 3 months of launch, "Solve it" visits from the newsletter reach at least 10% of the emails sent, as a measure of whether the newsletter brings learners back.

## Assumptions

- **Audience and language**: the newsletter is in English, like the site, and is free. The reference newsletter's second language is out of scope.
- **Send time**: one fixed time for everyone, 07:00 UTC all year (08:00 in winter and 09:00 in summer in the Netherlands, where the site is run). Per-subscriber time zones are out of scope.
- **Puzzle source**: puzzles come from the existing practice exercises, mixed across all topics. No new puzzles are written for the newsletter, and the email does not include the answer.
- **Order**: the order of puzzles is shuffled once per cycle, so consecutive days are not all from the same topic.
- **No preferences**: subscribers cannot choose topics, difficulty or frequency in this version.
- **No accounts**: the newsletter is separate from any sign-in, and hiding the call to action is per browser only, as requested. The reference newsletter's sign-up toggle for logged-in users is out of scope because the site has no accounts.
- **Placement**: the call to action appears only on the homepage. Other pages are out of scope.
- **Email sending service: Resend**: as decided by the project owner, emails are sent through Resend. The requirements above stay written in terms of what subscribers experience.
- **Server side: Supabase, following a reference newsletter**: the site is fully static today. Accepting form submissions, storing subscribers, choosing the daily puzzle, sending on a schedule and handling unsubscribes run on Supabase, following the owner's existing newsletter in another app (the "reference newsletter"). The static site stays as it is.
- **EU privacy rules apply**: the site is run from the Netherlands, so collecting email addresses for a newsletter falls under GDPR. The spec keeps stored data to a minimum, requires clear consent and easy unsubscribing, and requires the privacy page update before launch.
