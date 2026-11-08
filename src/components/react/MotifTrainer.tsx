import { useEffect, useState } from 'react';
import { navigate } from 'astro:transitions/client';
import { motifPath, motifsOf, nextMotifIndex } from '../../lib/motifs';
import type { TopicId } from '../../lib/topics';
import { Board } from './Board';
import { Feedback } from './Feedback';
import { Header } from './Header';
import { MenuPanel } from './Menu';
import { MotifInfo } from './MotifInfo';
import { MotifList } from './MotifList';
import { PatternControls } from './PatternControls';
import { usePuzzle } from './usePuzzle';
import { useSolved } from './useSolved';

export type Props = {
  topic: TopicId;
  motifId: string;
};

/** Learn one topic's motifs one by one, e.g. the checkmate patterns or the tactics. */
export function MotifTrainer({ topic, motifId }: Props) {
  const list = motifsOf(topic);
  const index = Math.max(
    0,
    list.findIndex((m) => m.id === motifId),
  );
  const motif = list[index];
  const { solved, markSolved } = useSolved();
  const [menuOpen, setMenuOpen] = useState(false);
  const puzzle = usePuzzle(motif, markSolved);
  const { load } = puzzle;

  // The island is kept across page navigations, so a new page only changes the props.
  useEffect(() => {
    load(motif);
  }, [motif, load]);

  const next = list[nextMotifIndex(list, index, solved)];
  const solvedCount = solved.filter((id) => list.some((m) => m.id === id)).length;

  return (
    <div className="app">
      <Header
        topic={topic}
        mode="learn"
        progress={`${solvedCount} / ${list.length} solved`}
        menu={{
          label: 'List',
          open: menuOpen,
          onToggle: () => setMenuOpen((prev) => !prev),
        }}
      />

      <div className="layout">
        <MenuPanel open={menuOpen} onClose={() => setMenuOpen(false)}>
          <MotifList topic={topic} activeId={motif.id} solved={solved} />
        </MenuPanel>

        <main>
          <Board {...puzzle.boardProps} />
          <PatternControls
            canReset={puzzle.canReset}
            canGoNext={list.length >= 2}
            isDone={puzzle.isDone}
            busy={puzzle.busy}
            showHint={puzzle.showHint}
            onReset={puzzle.reset}
            onShowHint={() => puzzle.setShowHint(true)}
            onShowSolution={puzzle.reveal}
            onNext={() => navigate(motifPath(next))}
          />
        </main>

        <MotifInfo
          motif={motif}
          played={puzzle.played}
          feedback={
            <Feedback
              puzzle={puzzle.puzzle}
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
