import { families, mateIn, patterns } from './patterns';

export type Props = {
  activeIndex: number;
  solved: string[];
  onSelect: (index: number) => void;
};

export function PatternList({ activeIndex, solved, onSelect }: Props) {
  return (
    <nav className="patterns">
      {families.map((family) => (
        <section key={family}>
          <h3>{family}</h3>
          {patterns.map((p, i) =>
            p.family !== family ? null : (
              <button
                key={p.id}
                className={`pattern${i === activeIndex ? ' active' : ''}`}
                onClick={() => onSelect(i)}
                aria-current={i === activeIndex}
              >
                <span className="check" aria-hidden="true">
                  {solved.includes(p.id) ? '✓' : ''}
                </span>
                <span className="label">{p.name}</span>
                <span className="badge">M{mateIn(p)}</span>
              </button>
            ),
          )}
        </section>
      ))}
    </nav>
  );
}
