import type { Pattern } from './patterns';

export type Props = {
  patterns: Pattern[];
  selectedIds: string[];
  onSelectAll: () => void;
  onToggle: (id: string) => void;
};

export function PracticeFilters({ patterns, selectedIds, onSelectAll, onToggle }: Props) {
  const allSelected = selectedIds.length === 0;
  return (
    <nav className="patterns" aria-label="Checkmate filters">
      <section>
        <h3>Mode</h3>
        <button
          className={`pattern${allSelected ? ' active' : ''}`}
          onClick={onSelectAll}
          aria-pressed={allSelected}
        >
          <span className="check" aria-hidden="true">
            {allSelected ? '✓' : ''}
          </span>
          <span className="label">All patterns (blind)</span>
        </button>
      </section>
      <section>
        <h3>Checkmates</h3>
        {patterns.map((p) => {
          const isSelected = selectedIds.includes(p.id);
          return (
            <button
              key={p.id}
              className={`pattern${isSelected ? ' active' : ''}`}
              onClick={() => onToggle(p.id)}
              aria-pressed={isSelected}
            >
              <span className="check" aria-hidden="true">
                {isSelected ? '✓' : ''}
              </span>
              <span className="label">{p.name}</span>
            </button>
          );
        })}
      </section>
    </nav>
  );
}
