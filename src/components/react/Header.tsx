import { site } from '../../lib/site';
import { practicePath, topicById, topics, type Mode, type TopicId } from '../../lib/topics';
import { MenuButton, type MenuState } from './Menu';

export type Props = {
  /** The topic this page belongs to; its Learn / Practice switch is shown. */
  topic?: TopicId;
  mode?: Mode;
  progress?: string;
  /** On mobile, the button that opens this page's menu, shown next to the tabs. */
  menu?: MenuState;
};

export function Header({ topic, mode, progress, menu }: Props) {
  const current = topic ? topicById(topic) : undefined;
  const modes: { mode: Mode; label: string; href: string }[] = current
    ? [
        { mode: 'learn', label: 'Learn', href: current.path },
        { mode: 'practice', label: 'Practice', href: practicePath(current.id) },
      ]
    : [];

  return (
    <header>
      <div className="header-left">
        <a className="brand" href="/">
          <img className="logo" src="/favicon.svg" alt="" width={28} height={28} />
          {site.name}
        </a>
        <nav className="tabs" aria-label="Topics">
          {topics.map((t) => (
            <a
              key={t.id}
              className={`tab${t.id === topic ? ' active' : ''}`}
              href={t.path}
              aria-current={t.id === topic ? 'true' : undefined}
            >
              {t.name}
            </a>
          ))}
        </nav>
        {current && (
          <nav className="modes" aria-label={`${current.name} sections`}>
            {modes.map((m) => (
              <a
                key={m.mode}
                className={`mode${m.mode === mode ? ' active' : ''}`}
                href={m.href}
                aria-current={m.mode === mode ? 'true' : undefined}
              >
                {m.label}
              </a>
            ))}
          </nav>
        )}
      </div>
      {progress && <span className="progress">{progress}</span>}
      {menu && <MenuButton {...menu} />}
    </header>
  );
}
