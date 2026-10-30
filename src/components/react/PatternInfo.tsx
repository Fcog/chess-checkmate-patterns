import type { ReactNode } from 'react';
import { formatLine } from '../../lib/helpers';
import type { Pattern } from '../../lib/patterns';

export type Props = {
  pattern: Pattern;
  moves: number;
  played: string[];
  feedback: ReactNode;
  showHint: boolean;
  isDone: boolean;
};

export function PatternInfo({ pattern, moves, played, feedback, showHint, isDone }: Props) {
  return (
    <aside className="info">
      <h2>
        {pattern.name} <span className="badge">Mate in {moves}</span>
      </h2>
      <div aria-live="polite">{feedback}</div>
      {played.length > 0 && <p className="line">{formatLine(pattern.fen, played)}</p>}
      {(showHint || isDone) && <p className="hint">{pattern.hint}</p>}
      {isDone && <p className="idea">{pattern.idea}</p>}
    </aside>
  );
}
