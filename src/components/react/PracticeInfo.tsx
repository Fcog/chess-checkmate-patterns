import type { ReactNode } from 'react';
import type { Exercise } from '../../lib/exercises';
import { formatLine } from '../../lib/helpers';
import type { Pattern } from '../../lib/patterns';

export type Props = {
  exercise: Exercise | undefined;
  exercisePattern: Pattern | undefined;
  exerciseIndex: number;
  moves: number;
  played: string[];
  feedback: ReactNode;
  showHint: boolean;
  isDone: boolean;
  revealPattern: boolean;
};

export function PracticeInfo({
  exercise,
  exercisePattern,
  exerciseIndex,
  moves,
  played,
  feedback,
  showHint,
  isDone,
  revealPattern,
}: Props) {
  return (
    <aside className="info">
      {exercise ? (
        <>
          <h2>
            {revealPattern || isDone ? (
              <>
                {exercisePattern?.name ?? 'Exercise'}{' '}
                <span className="badge">Mate in {moves}</span>
              </>
            ) : (
              <>
                Exercise {exerciseIndex + 1} <span className="badge">Mate in {moves}</span>
              </>
            )}
          </h2>
          <div aria-live="polite">{feedback}</div>
          {played.length > 0 && <p className="line">{formatLine(exercise.fen, played)}</p>}
          {(showHint || isDone) && exercise.hint && <p className="hint">{exercise.hint}</p>}
          {isDone && exercisePattern && <p className="idea">{exercisePattern.idea}</p>}
        </>
      ) : (
        <>
          <h2>
            Pattern: <span className="badge">Hidden by default</span>
          </h2>
          <p className="feedback">No exercises match the current filter.</p>
        </>
      )}
    </aside>
  );
}
