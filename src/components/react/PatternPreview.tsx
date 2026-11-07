import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Key } from 'chessground/types';
import type { Motif } from '../../lib/motifs';
import { patternFrames, type Side } from '../../lib/preview';
import { Board } from './Board';

/** Stable identity so the board effect does not re-run on every render. */
const NO_DESTS = new Map<Key, Key[]>();
const noop = () => {};
const FIRST_MOVE_DELAY = 700;
const MOVE_STEP = 900;

export type Props = {
  pattern: Motif;
  /** The side the player plays; the demo is mirrored to match it. */
  side: Side;
};

/** A small board that plays through a motif's demo line, for "Reveal pattern". */
export function PatternPreview({ pattern, side }: Props) {
  const frames = useMemo(() => patternFrames(pattern, side), [pattern, side]);
  const [index, setIndex] = useState(0);

  const timers = useRef<number[]>([]);
  const clearTimers = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  }, []);

  const play = useCallback(() => {
    clearTimers();
    setIndex(0);
    for (let i = 1; i < frames.length; i++) {
      timers.current.push(
        window.setTimeout(() => setIndex(i), FIRST_MOVE_DELAY + (i - 1) * MOVE_STEP),
      );
    }
  }, [clearTimers, frames]);

  useEffect(() => {
    play();
    return clearTimers;
  }, [play, clearTimers]);

  const frame = frames[index];
  const turnColor = frame.fen.split(' ')[1] === 'w' ? 'white' : 'black';

  return (
    <figure className="pattern-preview">
      <Board
        className="mini"
        coordinates={false}
        fen={frame.fen}
        orientation={side}
        turnColor={turnColor}
        dests={NO_DESTS}
        lastMove={frame.lastMove as Key[] | undefined}
        check={frame.check}
        viewOnly
        onMove={noop}
        syncKey={index}
      />
      <figcaption>
        <span>{pattern.goal.kind === 'mate' ? 'How the pattern mates' : 'How the tactic works'}</span>
        <button type="button" className="replay-button" onClick={play}>
          ↻ Replay
        </button>
      </figcaption>
    </figure>
  );
}
