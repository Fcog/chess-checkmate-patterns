import { useCallback, useEffect, useMemo, useState } from 'react';
import { exercises, practicePatternIds, type Exercise } from '../../lib/exercises';
import { shuffle } from '../../lib/helpers';
import { patterns } from '../../lib/patterns';
import { Board } from './Board';
import { Feedback } from './Feedback';
import { Header } from './Header';
import { MenuToggle } from './MenuToggle';
import { PracticeControls } from './PracticeControls';
import { PracticeFilters } from './PracticeFilters';
import { PracticeInfo } from './PracticeInfo';
import { usePuzzle } from './usePuzzle';
import { useSolved } from './useSolved';

const practicePatterns = patterns.filter((p) => practicePatternIds.includes(p.id));

function filterExercises(order: Exercise[], patternIds: string[]): Exercise[] {
  return patternIds.length === 0 ? order : order.filter((ex) => patternIds.includes(ex.patternId));
}

export function PracticeTrainer() {
  // The server can't know the random order, so it renders the original order and the
  // shuffle happens right after hydration.
  const [order, setOrder] = useState(exercises);
  const [selectedPatternIds, setSelectedPatternIds] = useState<string[]>([]);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [revealPattern, setRevealPattern] = useState(false);

  const { solved, markSolved } = useSolved();
  const puzzle = usePuzzle(exercises[0], markSolved);
  const { load } = puzzle;

  const filteredExercises = useMemo(
    () => filterExercises(order, selectedPatternIds),
    [order, selectedPatternIds],
  );
  const exercise = filteredExercises[exerciseIndex] ?? filteredExercises[0];
  const exercisePattern = useMemo(
    () => (exercise ? patterns.find((p) => p.id === exercise.patternId) : undefined),
    [exercise],
  );

  const goTo = useCallback(
    (next: number, list: Exercise[]) => {
      setExerciseIndex(next);
      setRevealPattern(false);
      load(list[next]);
    },
    [load],
  );

  useEffect(() => {
    const shuffled = shuffle(exercises);
    setOrder(shuffled);
    goTo(0, shuffled);
  }, [goTo]);

  const togglePatternFilter = (id: string) => {
    const nextIds = selectedPatternIds.includes(id)
      ? selectedPatternIds.filter((item) => item !== id)
      : [...selectedPatternIds, id];
    setSelectedPatternIds(nextIds);
    goTo(0, filterExercises(order, nextIds));
  };

  const selectAllPatterns = () => {
    setSelectedPatternIds([]);
    goTo(0, order);
  };

  const solvedExercisesCount = filteredExercises.filter((ex) => solved.includes(ex.id)).length;

  return (
    <div className="app">
      <Header
        section="practice"
        progress={`${solvedExercisesCount} / ${filteredExercises.length} solved`}
      />

      <div className="layout">
        <MenuToggle label="filters">
          <PracticeFilters
            patterns={practicePatterns}
            selectedIds={selectedPatternIds}
            onSelectAll={selectAllPatterns}
            onToggle={togglePatternFilter}
          />
        </MenuToggle>

        <main>
          {exercise ? (
            <Board {...puzzle.boardProps} />
          ) : (
            <div className="empty-state">
              <h2>No exercises yet</h2>
              <p>
                Practice exercises will appear here. By default, the checkmate pattern will be
                hidden so you have to find the right motif on your own.
              </p>
            </div>
          )}
          <PracticeControls
            hasExercise={!!exercise}
            hasHint={!!exercise?.hint}
            canReset={puzzle.canReset}
            canGoNext={filteredExercises.length >= 2}
            isDone={puzzle.isDone}
            busy={puzzle.busy}
            showHint={puzzle.showHint}
            revealPattern={revealPattern}
            onReset={puzzle.reset}
            onTogglePattern={() => setRevealPattern((prev) => !prev)}
            onShowHint={() => puzzle.setShowHint(true)}
            onShowSolution={puzzle.reveal}
            onNext={() =>
              goTo((exerciseIndex + 1) % filteredExercises.length, filteredExercises)
            }
          />
        </main>

        <PracticeInfo
          exercise={exercise}
          exercisePattern={exercisePattern}
          exerciseIndex={exerciseIndex}
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
          revealPattern={revealPattern}
        />
      </div>
    </div>
  );
}
