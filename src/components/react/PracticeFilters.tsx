import type { Motif } from '../../lib/motifs';
import type { Depth } from '../../lib/practice';

export type Props = {
  motifs: Motif[];
  /** Heading of the motif list, e.g. "Checkmates". */
  topicName: string;
  selectedIds: string[];
  onSelectAll: () => void;
  onToggle: (id: string) => void;
  depths: { value: Depth; label: string; available: boolean }[];
  selectedDepth: Depth;
  onSelectDepth: (depth: Depth) => void;
};

export function PracticeFilters({
  motifs,
  topicName,
  selectedIds,
  onSelectAll,
  onToggle,
  depths,
  selectedDepth,
  onSelectDepth,
}: Props) {
  const allSelected = selectedIds.length === 0;
  return (
    <nav className="patterns" aria-label="Practice filters">
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
          <span className="label">All motifs (blind)</span>
        </button>
      </section>
      <section className="depth-section">
        <h3 id="depth-label">Moves</h3>
        <div className="depths" role="radiogroup" aria-labelledby="depth-label">
          {depths.map(({ value, label, available }) => {
            const isSelected = value === selectedDepth;
            return (
              <button
                key={value}
                className={`depth${isSelected ? ' active' : ''}`}
                role="radio"
                aria-checked={isSelected}
                aria-label={value === 'any' ? 'Any length' : `${label} moves`}
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
        <h3>{topicName}</h3>
        {motifs.map((m) => {
          const isSelected = selectedIds.includes(m.id);
          return (
            <button
              key={m.id}
              className={`pattern${isSelected ? ' active' : ''}`}
              onClick={() => onToggle(m.id)}
              aria-pressed={isSelected}
            >
              <span className="check" aria-hidden="true">
                {isSelected ? '✓' : ''}
              </span>
              <span className="label">{m.name}</span>
            </button>
          );
        })}
      </section>
    </nav>
  );
}
