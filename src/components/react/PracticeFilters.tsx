import type { Pattern } from '../../lib/patterns';
import type { Depth } from '../../lib/practice';

export type Props = {
  patterns: Pattern[];
  selectedIds: string[];
  onSelectAll: () => void;
  onToggle: (id: string) => void;
  depths: { value: Depth; label: string; available: boolean }[];
  selectedDepth: Depth;
  onSelectDepth: (depth: Depth) => void;
};

export function PracticeFilters({
  patterns,
  selectedIds,
  onSelectAll,
  onToggle,
  depths,
  selectedDepth,
  onSelectDepth,
}: Props) {
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
      <section className="depth-section">
        <h3 id="depth-label">Moves to mate</h3>
        <div className="depths" role="radiogroup" aria-labelledby="depth-label">
          {depths.map(({ value, label, available }) => {
            const isSelected = value === selectedDepth;
            return (
              <button
                key={value}
                className={`depth${isSelected ? ' active' : ''}`}
                role="radio"
                aria-checked={isSelected}
                aria-label={value === 'any' ? 'Any length' : `Mate in ${label}`}
                disabled={!available && !isSelected}
                onClick={() => onSelectDepth(value)}
              >
                {label}
              </button>
            );
          })}
        </div>
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
