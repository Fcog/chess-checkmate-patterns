import { useMemo, useState, type KeyboardEvent } from 'react';
import type { Color, Key } from 'chessground/types';
import { lineFrames, numberedMoves } from '../../lib/preview';
import { Board } from './Board';

/** Stable identity so the board effect does not re-run on every render. */
const NO_DESTS = new Map<Key, Key[]>();
const noop = () => {};

export type Props = {
  /** Starting position. Move numbers in the list are counted from its fullmove field. */
  fen: string;
  /** The line to step through, in SAN. */
  moves: string[];
  /** Board side at the bottom. Defaults to the side to move at the start. */
  orientation?: Color;
  /** Short label for screen readers, e.g. "Variation: 6...Kf8". */
  label: string;
};

/** A read-only board for articles: step through a line with buttons, arrow keys or the move list. */
export function LineViewer({ fen, moves, orientation, label }: Props) {
  const frames = useMemo(() => lineFrames(fen, moves), [fen, moves]);
  const labels = useMemo(() => numberedMoves(fen, moves), [fen, moves]);
  const [ply, setPly] = useState(0);
  const last = frames.length - 1;
  const go = (next: number) => setPly(Math.max(0, Math.min(last, next)));

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
    if (step === undefined) return;
    event.preventDefault();
    go(ply + step);
  };

  const frame = frames[ply];
  const side: Color = orientation ?? (fen.split(' ')[1] === 'w' ? 'white' : 'black');

  return (
    <figure className="line-viewer" tabIndex={0} aria-label={label} onKeyDown={onKeyDown}>
      <Board
        className="viewer"
        fen={frame.fen}
        orientation={side}
        turnColor={frame.fen.split(' ')[1] === 'w' ? 'white' : 'black'}
        dests={NO_DESTS}
        lastMove={frame.lastMove as Key[] | undefined}
        check={frame.check}
        viewOnly
        onMove={noop}
        syncKey={ply}
      />
      <div className="viewer-controls">
        <button type="button" onClick={() => go(0)} disabled={ply === 0} aria-label="Start">
          ⏮
        </button>
        <button type="button" onClick={() => go(ply - 1)} disabled={ply === 0} aria-label="Previous move">
          ◀
        </button>
        <button type="button" onClick={() => go(ply + 1)} disabled={ply === last} aria-label="Next move">
          ▶
        </button>
        <button type="button" onClick={() => go(last)} disabled={ply === last} aria-label="End">
          ⏭
        </button>
      </div>
      <ol className="viewer-moves" aria-label="Moves">
        {labels.map((move) => (
          <li key={move.ply}>
            {move.number && <span className="move-number">{move.number}</span>}
            <button
              type="button"
              className={move.ply === ply ? 'current' : undefined}
              aria-current={move.ply === ply ? 'step' : undefined}
              onClick={() => go(move.ply)}
            >
              {move.san}
            </button>
          </li>
        ))}
      </ol>
    </figure>
  );
}
