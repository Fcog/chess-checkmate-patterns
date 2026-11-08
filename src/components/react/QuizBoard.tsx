import { useEffect, useMemo, useState } from 'react';
import type { Color, Key } from 'chessground/types';
import type { Exercise } from '../../lib/exercises';
import { lineFrames } from '../../lib/preview';
import { Board } from './Board';
import { ButtonLabel } from './ButtonLabel';

/** Stable identity so the board effect does not re-run on every render. */
const NO_DESTS = new Map<Key, Key[]>();
const noop = () => {};

export type Props = {
  exercise: Exercise;
  /** The player's answer, once given. */
  answer: boolean | null;
  onAnswer: (sound: boolean) => void;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

/**
 * A "sound or not?" exercise: the position, two answer buttons, and afterwards the stored line
 * (the refutation, or the winning attack) to step through.
 */
export function QuizBoard({ exercise, answer, onAnswer, canGoNext, onPrevious, onNext }: Props) {
  const frames = useMemo(
    () => lineFrames(exercise.fen, exercise.solution),
    [exercise.fen, exercise.solution],
  );
  const [ply, setPly] = useState(0);
  const last = frames.length - 1;
  const answered = answer !== null;
  useEffect(() => setPly(0), [exercise.id]);

  const frame = frames[answered ? ply : 0];
  const side: Color = exercise.fen.split(' ')[1] === 'w' ? 'white' : 'black';
  const go = (next: number) => setPly(Math.max(0, Math.min(last, next)));

  return (
    <>
      <Board
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
      <div className="controls">
        {answered ? (
          <>
            <button onClick={() => go(0)} disabled={ply === 0} aria-label="Start of the line">
              ⏮
            </button>
            <button onClick={() => go(ply - 1)} disabled={ply === 0} aria-label="Previous move">
              ◀
            </button>
            <button onClick={() => go(ply + 1)} disabled={ply === last} aria-label="Next move">
              ▶
            </button>
            <button onClick={() => go(last)} disabled={ply === last} aria-label="End of the line">
              ⏭
            </button>
          </>
        ) : (
          <>
            <button className="answer" onClick={() => onAnswer(true)}>
              Yes, it works
            </button>
            <button className="answer" onClick={() => onAnswer(false)}>
              No, it fails
            </button>
          </>
        )}
        <button
          className="nav"
          onClick={onPrevious}
          disabled={!canGoNext}
          aria-label="Previous exercise"
        >
          <ButtonLabel full="← Previous" short="←" />
        </button>
        <button className="nav" onClick={onNext} disabled={!canGoNext} aria-label="Next exercise">
          <ButtonLabel full="Next →" short="→" />
        </button>
      </div>
    </>
  );
}
