export type Section = 'patterns' | 'practice';

export type Props = {
  section: Section;
  progress: string;
  onSwitchSection: (section: Section) => void;
};

export function Header({ section, progress, onSwitchSection }: Props) {
  return (
    <header>
      <div className="header-left">
        <h1>Checkmate patterns</h1>
        <nav className="tabs" aria-label="Sections">
          <button
            className={`tab${section === 'patterns' ? ' active' : ''}`}
            onClick={() => onSwitchSection('patterns')}
            aria-current={section === 'patterns' ? 'page' : undefined}
          >
            Patterns
          </button>
          <button
            className={`tab${section === 'practice' ? ' active' : ''}`}
            onClick={() => onSwitchSection('practice')}
            aria-current={section === 'practice' ? 'page' : undefined}
          >
            Practice
          </button>
        </nav>
      </div>
      <span className="progress">{progress}</span>
    </header>
  );
}
