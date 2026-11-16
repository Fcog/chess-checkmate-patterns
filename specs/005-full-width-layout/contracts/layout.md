# Layout Contract: Full-Width Layout

This is the visual contract each page container must meet. It's checked by hand at the viewports in [quickstart.md](../quickstart.md).

| Container | ≥ 861 px | ≤ 860 px |
|-----------|----------|----------|
| `.app` (header, trainer shell) | `max-width: var(--frame-max)`, `padding-inline: var(--frame-pad)`, centred | unchanged (padding becomes `var(--frame-pad)`, so 20 px at phone widths, as today) |
| `.page-text` (text pages) | same frame as `.app` | same |
| `.page-text > *` | `max-width: var(--prose-max)` (720 px) | same |
| `.page-text > .topic-cards` | `max-width: none` (grid adds columns) | capped at 720 px, as today |
| `.site-footer` | same frame as `.app` | same |
| `.layout` | `minmax(220px,280px) minmax(0,1fr) minmax(240px,340px)` | `minmax(0,1fr)` (existing media query) |
| `.board`, `.empty-state` | `max-width: min(100%, calc(100svh - var(--board-chrome)))` | `max-width: 480px` (existing) |
| `.board.mini`, `.board.viewer` | unchanged (228 px / 336 px) | unchanged |

## Invariants

- No horizontal overflow from 320 px to 3,840 px, or at 200% zoom.
- The left edges of `.app`, `.page-text` and `.site-footer` are equal at every width.
- At ≥ 861 px wide and ≥ 700 px tall, the bottom of `.controls` is at or above `100svh`.
