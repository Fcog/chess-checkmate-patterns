import { families, mateIn, patterns } from '../../lib/patterns';

export type Props = {
  activeId: string;
  solved: string[];
};

export function PatternList({ activeId, solved }: Props) {
  return (
    <nav className="patterns" aria-label="Checkmate patterns">
      {families.map((family) => (
        <section key={family}>
          <h3>{family}</h3>
          {patterns.map((p) =>
            p.family !== family ? null : (
              <a
                key={p.id}
                href={`/patterns/${p.id}`}
                className={`pattern${p.id === activeId ? ' active' : ''}`}
                aria-current={p.id === activeId ? 'page' : undefined}
              >
                <span className="check" aria-hidden="true">
                  {solved.includes(p.id) ? '✓' : ''}
                </span>
                <span className="label">{p.name}</span>
                <span className="badge">M{mateIn(p)}</span>
              </a>
            ),
          )}
        </section>
      ))}
    </nav>
  );
}
