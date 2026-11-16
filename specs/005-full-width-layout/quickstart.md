# Quickstart: Validate Full-Width Layout

## Automated checks

```bash
npm test
npm run typecheck
npm run test:build     # astro build + tests/build.test.ts
```

Expected: everything passes. This is a CSS-only change, so no test counts should change.

## Manual scenarios (`npm run dev`, browser dev tools responsive mode)

Check against [contracts/layout.md](./contracts/layout.md).

| # | Viewport | Page | Expected |
|---|----------|------|----------|
| 1 | 1920×1080 | `/checkmates/anastasia` | Side margins ≤ 40 px (SC-001). Board ≥ 670 px, about 890 (SC-002). Controls visible without scrolling |
| 2 | 1280×720 | `/checkmates/practice` | Board and controls fully visible (SC-003). Side panels not squashed |
| 3 | 1920×800 | any lesson | The board shrinks to fit the height, and the controls stay visible |
| 4 | 3840×2160 | lesson and home | Content capped at about 2,400 px and centred. Side panels at most 280 px / 340 px. No horizontal scroll |
| 5 | 1920×1080 | `/`, `/blog/...`, `/privacy` | Header and footer edges line up with the lesson page. Paragraphs no wider than 720 px. Home topic cards show more columns |
| 6 | 375×812 and 768×1024 | lesson, practice, home | Looks the same as before the change (SC-006). Compare against `git stash` or production |
| 7 | 1280×800 at 200% zoom | lesson | No horizontal scroll (SC-004) |
| 8 | Resize the window from 1920 down to 900 while on a lesson | lesson | The board resizes smoothly. Dragging a piece lands on the right square. Hint circle and arrow (from 003/004) stay lined up, and so do the coordinates |
