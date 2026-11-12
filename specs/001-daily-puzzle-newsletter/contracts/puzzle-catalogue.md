# Contract: puzzle catalogue and board pictures (static site output)

Both files are produced by `npm run build` and served by Vercel. The backend only reads them.

## GET /newsletter/puzzles.json

```json
{
  "version": 1,
  "puzzles": [
    {
      "code": "k3x9a",
      "topic": "checkmates",
      "fen": "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",
      "side": "white",
      "task": "White to play and mate in 2",
      "url": "https://www.chess-patterns.com/checkmates/practice/k3x9a",
      "image": "https://www.chess-patterns.com/newsletter/board/k3x9a.png",
      "alt": "Chess position, White to move. White: king g1, rook d1, pawns f2, g2, h2. Black: king g8, pawns f7, g7, h7."
    }
  ]
}
```

| Field | Rule |
|---|---|
| `code` | `shareCode(exercise.id)`. Unique within the catalogue |
| `topic` | `checkmates`, `tactics` or `attacks`. Used only to build URLs, never shown as a pattern |
| `fen` | The exercise's starting FEN |
| `side` | The side to move. The board picture is drawn from this side |
| `task` | Comes from `src/lib/puzzle-task.ts`, the same wording as the share page: `<Side> to play and mate in N`, `<Side> to play and win material`, `<Side> to play and break through`, or `Is the sacrifice sound or not?` |
| `url` | `SITE_URL + sharePath(topic, code)` |
| `image` | `SITE_URL + /newsletter/board/<code>.png` |
| `alt` | Side to move plus the piece lists, so it is readable with images off (FR-012) |

**Invariants**, checked in `tests/build.test.ts`:
- There is one entry for every exercise in `src/lib/exercises.ts`.
- The JSON contains no exercise id, `motifId`, motif name, `hint` or `solution` (FR-011).
- Every `image` file exists in `dist/`.

## GET /newsletter/board/<code>.png

- 640×640 PNG with a light/dark brown board and cburnett pieces. No coordinate labels: text would need fonts on the build machine, and the email states the side to move.
- Drawn from `side` (White at the bottom when White is to move, otherwise flipped).
- No arrows, highlights or text that could hint at the solution.
- Emails show it at `width="320" height="320"`.
