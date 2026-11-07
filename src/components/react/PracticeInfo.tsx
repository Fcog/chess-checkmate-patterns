import type { ReactNode } from 'react';
import type { Exercise } from '../../lib/exercises';
import { formatLine } from '../../lib/helpers';
import { taskLabel, type Motif } from '../../lib/motifs';
import { site } from '../../lib/site';
import { sharePath } from '../../lib/topics';
import { shareCode } from '../../lib/share';
import { PatternPreview } from './PatternPreview';
import { ShareButton } from './ShareButton';

export type Props = {
  exercise: Exercise | undefined;
  exercisePattern: Motif | undefined;
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
                <span className="badge">{taskLabel(exercise)}</span>
              </>
            ) : (
              <>
                Exercise {exerciseIndex + 1} <span className="badge">{taskLabel(exercise)}</span>
              </>
            )}
          </h2>
          <div aria-live="polite">{feedback}</div>
          {played.length > 0 && <p className="line">{formatLine(exercise.fen, played)}</p>}
          {(showHint || isDone) && exercise.hint && <p className="hint">{exercise.hint}</p>}
          <ShareButton
            label="Share puzzle"
            path={sharePath(exercise.topic, shareCode(exercise.id))}
            title={`Chess puzzle – ${site.name}`}
            text={
              exercise.goal.kind === 'mate'
                ? `Can you find the mate in ${moves}?`
                : `Can you ${exercise.goal.label.toLowerCase()}?`
            }
          />
          {(revealPattern || isDone) && exercisePattern && (
            <>
              <PatternPreview
                key={exercise.id}
                pattern={exercisePattern}
                side={exercise.fen.split(' ')[1] === 'w' ? 'white' : 'black'}
              />
              <p className="idea">{exercisePattern.idea}</p>
            </>
          )}
        </>
      ) : (
        <>
          <h2>
            Motif: <span className="badge">Hidden by default</span>
          </h2>
          <p className="feedback">No exercises match the current filter.</p>
        </>
      )}
    </aside>
  );
}
