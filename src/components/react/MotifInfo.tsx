import type { ReactNode } from 'react';
import { formatLine } from '../../lib/helpers';
import { motifPath, taskLabel, type Motif } from '../../lib/motifs';
import { site } from '../../lib/site';
import { topicById } from '../../lib/topics';
import { ShareButton } from './ShareButton';

export type Props = {
  motif: Motif;
  played: string[];
  feedback: ReactNode;
  showHint: boolean;
  isDone: boolean;
};

export function MotifInfo({ motif, played, feedback, showHint, isDone }: Props) {
  const task = taskLabel(motif);
  return (
    <aside className="info">
      <h2>
        {motif.name} <span className="badge">{task}</span>
      </h2>
      <div aria-live="polite">{feedback}</div>
      {played.length > 0 && <p className="line">{formatLine(motif.fen, played)}</p>}
      {(showHint || isDone) && <p className="hint">{motif.hint}</p>}
      {isDone && <p className="idea">{motif.idea}</p>}
      <ShareButton
        label="Share"
        path={motifPath(motif)}
        title={`${motif.name} – ${site.name}`}
        text={`Learn the ${motif.name.toLowerCase()} — a ${topicById(motif.topic).noun} (${task.toLowerCase()}).`}
      />
    </aside>
  );
}
