# Data Model: Full-Width Layout

There's no application data. The only "model" is a small set of layout tokens (CSS custom properties) that every container reads.

## Layout tokens (`:root` in `src/styles/styles.css`)

| Token | Value | Used by | Rule |
|-------|-------|---------|------|
| `--frame-max` | `2400px` | `.app`, `.page-text`, `.site-footer` | The shared outer width ceiling, so every page's edges line up |
| `--frame-pad` | `clamp(20px, 2vw, 32px)` | same | Outer side margin: 20 px on phones and tablets (as today), 32 px from about 1,600 px up (2vw, clamped to 20–32 px) |
| `--board-chrome` | `190px` | `.board`, `.empty-state` (≥ 861 px only) | Vertical space reserved for the header and controls, so board + controls fit in `100svh` |
| `--prose-max` | `720px` | `.page-text > *` | Reading line length, unchanged from today |

## Derived sizes (≥ 861 px)

```text
board side = min(centre column width, 100svh − --board-chrome)
side list  = between 220px and 280px
info panel = between 240px and 340px
```

## Unchanged (≤ 860 px)

The single-column layout, `.board { max-width: 480px }`, the menu toggle and the container-query short labels all stay as they are today.
