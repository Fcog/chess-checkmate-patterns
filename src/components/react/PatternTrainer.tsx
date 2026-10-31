import { useEffect, useState } from 'react';
import { navigate } from 'astro:transitions/client';
import { patterns } from '../../lib/patterns';
import { Board } from './Board';
import { Feedback } from './Feedback';
import { Header } from './Header';
import { MenuPanel } from './Menu';
import { PatternControls } from './PatternControls';
import { PatternInfo } from './PatternInfo';
import { PatternList } from './PatternList';
import { usePuzzle } from './usePuzzle';
import { useSolved } from './useSolved';

export type Props = {
  patternId: string;
};

export function PatternTrainer({ patternId }: Props) {
  const index = Math.max(
    0,
    patterns.findIndex((p) => p.id === patternId),
  );
  const pattern = patterns[index];
  const { solved, markSolved } = useSolved();
  const [menuOpen, setMenuOpen] = useState(false);
  const puzzle = usePuzzle(pattern, markSolved);
  const { load } = puzzle;

  // The island is kept across page navigations, so a new page only changes the prop.
  useEffect(() => {
    load(patterns[index]);
  }, [index, load]);

  const next = patterns[(index + 1) % patterns.length];
  const solvedCount = solved.filter((id) => patterns.some((p) => p.id === id)).length;

  return (
    <div className="app">
      <Header
        section="patterns"
        progress={`${solvedCount} / ${patterns.length} solved`}
        menu={{
          label: 'List',
          open: menuOpen,
          onToggle: () => setMenuOpen((prev) => !prev),
        }}
      />

      <div className="layout">
        <MenuPanel open={menuOpen} onClose={() => setMenuOpen(false)}>
          <PatternList activeId={pattern.id} solved={solved} />
        </MenuPanel>

        <main>
          <Board {...puzzle.boardProps} />
          <PatternControls
            canReset={puzzle.canReset}
            canGoNext={patterns.length >= 2}
            isDone={puzzle.isDone}
            busy={puzzle.busy}
            showHint={puzzle.showHint}
            onReset={puzzle.reset}
            onShowHint={() => puzzle.setShowHint(true)}
            onShowSolution={puzzle.reveal}
            onNext={() => navigate(`/patterns/${next.id}`)}
          />
        </main>

        <PatternInfo
          pattern={pattern}
          moves={puzzle.moves}
          played={puzzle.played}
          feedback={
            <Feedback
              attempt={puzzle.attempt}
              moves={puzzle.moves}
              ply={puzzle.ply}
              heroColor={puzzle.heroColor}
            />
          }
          showHint={puzzle.showHint}
          isDone={puzzle.isDone}
        />
      </div>
    </div>
  );
}
