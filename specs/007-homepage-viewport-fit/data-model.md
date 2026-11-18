# Data Model: Homepage Fits the Viewport

This feature doesn't add or change any data. The existing models are unchanged: `Exercise` from `src/lib/exercises.ts`, `Topic` from `src/lib/topics.ts`, and the solved and newsletter localStorage keys.

What this feature does define is a set of **layout regions**. They are listed here so the tasks and tests can refer to them by name.

## Layout regions (homepage only)

| Region | Element / class | Contents | Desktop column (≥861px) | Phone order (≤860px) |
|--------|-----------------|----------|-------------------------|----------------------|
| Board | `main` | `Board` + `PracticeControls`, or `QuizBoard` | centre (`board`) | 1 |
| Side | `div.home-side` | `PracticeInfo` → `about` slot → `NewsletterSignup` | right (`side`) | 2 (info, intro, newsletter) |
| Sections | `nav.home-sections` (`aria-label="Sections"`) | `sections` slot: `ul.topic-cards` | left (`sections`) | 3 |

## Region rules

- **Board**:
  - Width is `max(280px, min(100%, 100svh − --board-chrome))` on desktop.
  - On phones it is capped at 480px and never goes below `min(280px, 100%)`.
  - Its position never depends on how tall the other regions are.
- **Side**:
  - Stacked with a 16px gap.
  - Before the first move, its height must fit within the window height minus the header (≈690px at 768px tall).
  - It may grow beyond that during play. The page scrolls, and other regions don't move.
- **Sections**:
  - On desktop, each card shows its heading with the count badge, the intro clamped to 2 lines, and the Learn/Practice links. Motif lists are hidden.
  - On desktop the region has `max-height` set to the window height minus the header and scrolls internally if it overflows.
  - On phones it shows the full cards with motif lists, as today.

## States that affect layout

| State | Effect |
|-------|--------|
| Before the first move (initial load) | All regions must fit in the first screen on desktop (SC-001). |
| Playing / solved / pattern revealed | The side column grows; the intro and newsletter may scroll below the fold. |
| Newsletter `done` | The CTA shrinks to a confirmation message; the side column gets shorter and no gap is left. |
| Quiz exercise | `QuizBoard` replaces `Board` + controls in the Board region; the sizing rule is the same. |
