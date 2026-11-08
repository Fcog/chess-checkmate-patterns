import { motifPath, motifsOf, taskBadge } from '../../lib/motifs';
import { topicById, type TopicId } from '../../lib/topics';

export type Props = {
  topic: TopicId;
  activeId: string;
  solved: string[];
};

export function MotifList({ topic, activeId, solved }: Props) {
  const { name, groups } = topicById(topic);
  const motifs = motifsOf(topic);
  return (
    <nav className="patterns" aria-label={name}>
      {groups.map((group) => (
        <section key={group}>
          <h3>{group}</h3>
          {motifs.map((m) =>
            m.group !== group ? null : (
              <a
                key={m.id}
                href={motifPath(m)}
                className={`pattern${m.id === activeId ? ' active' : ''}`}
                aria-current={m.id === activeId ? 'page' : undefined}
              >
                <span className="check" aria-hidden="true">
                  {solved.includes(m.id) ? '✓' : ''}
                </span>
                <span className="label">{m.name}</span>
                <span className="badge">{taskBadge(m)}</span>
              </a>
            ),
          )}
        </section>
      ))}
    </nav>
  );
}
