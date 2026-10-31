import { MenuButton, type MenuState } from './Menu';

export type Section = 'patterns' | 'practice';

export type Props = {
  section?: Section;
  progress?: string;
  /** On mobile, the button that opens this page's menu, shown next to the tabs. */
  menu?: MenuState;
};

export function Header({ section, progress, menu }: Props) {
  return (
    <header>
      <div className="header-left">
        <a className="brand" href="/">
          <img className="logo" src="/favicon.svg" alt="" width={28} height={28} />
          Checkmate patterns
        </a>
        <nav className="tabs" aria-label="Sections">
          <a
            className={`tab${section === 'patterns' ? ' active' : ''}`}
            href="/"
            aria-current={section === 'patterns' ? 'page' : undefined}
          >
            Patterns
          </a>
          <a
            className={`tab${section === 'practice' ? ' active' : ''}`}
            href="/practice"
            aria-current={section === 'practice' ? 'page' : undefined}
          >
            Practice
          </a>
        </nav>
      </div>
      {progress && <span className="progress">{progress}</span>}
      {menu && <MenuButton {...menu} />}
    </header>
  );
}
