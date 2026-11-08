import { useCallback, useEffect, useMemo, useState } from 'react';
import { exercises, practiceMotifIds, type Exercise } from '../../lib/exercises';
import { shuffle } from '../../lib/helpers';
import { motifById, motifs } from '../../lib/motifs';
import {
  depthOptions,
  filterExercises,
  noFilter,
  type Depth,
  type PracticeFilter,
} from '../../lib/practice';
import { topicById, type TopicId } from '../../lib/topics';
import { exerciseByCode } from '../../lib/share';
import { Board } from './Board';
import { Feedback, QuizFeedback } from './Feedback';
import { Header } from './Header';
import { MenuPanel } from './Menu';
import { PracticeControls } from './PracticeControls';
import { PracticeFilters } from './PracticeFilters';
import { PracticeInfo } from './PracticeInfo';
import { QuizBoard } from './QuizBoard';
import { usePuzzle } from './usePuzzle';
import { useSolved } from './useSolved';


/** Moves the exercise with `id` (if any) to the front, keeping the rest in order. */
function withFirst(list: Exercise[], id: string | undefined): Exercise[] {
  const first = list.find((ex) => ex.id === id);
  return first ? [first, ...list.filter((ex) => ex !== first)] : list;
}

export type Props = {
  topic: TopicId;
  /** Share code of the exercise to start with, when opened from a shared link. */
  initialCode?: string;
};

export function PracticeTrainer({ topic, initialCode }: Props) {
  const topicExercises = useMemo(() => exercises.filter((ex) => ex.topic === topic), [topic]);
  const practiceMotifs = useMemo(
    () => motifs.filter((m) => m.topic === topic && practiceMotifIds.includes(m.id)),
    [topic],
  );
  // The share code, not the exercise id, is passed in so the page source doesn't name the pattern.
  const initialExerciseId = initialCode ? exerciseByCode(initialCode)?.id : undefined;
  // The server can't know the random order, so it renders the original order (with any
  // shared exercise first) and the shuffle happens right after hydration.
  const [order, setOrder] = useState(() => withFirst(topicExercises, initialExerciseId));
  const [filter, setFilter] = useState<PracticeFilter>(noFilter);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [revealPattern, setRevealPattern] = useState(false);
  /** Answer to the current "sound or not?" exercise, once given. */
  const [quizAnswer, setQuizAnswer] = useState<boolean | null>(null);

  const { solved, markSolved } = useSolved();
  const [menuOpen, setMenuOpen] = useState(false);
  const puzzle = usePuzzle(order[0], markSolved);
  const { load } = puzzle;

  const filteredExercises = useMemo(() => filterExercises(order, filter), [order, filter]);
  const exercise = filteredExercises[exerciseIndex] ?? filteredExercises[0];
  const exercisePattern = useMemo(
    () => (exercise ? motifById(exercise.motifId) : undefined),
    [exercise],
  );

  const goTo = useCallback(
    (next: number, list: Exercise[]) => {
      setExerciseIndex(next);
      setRevealPattern(false);
      setQuizAnswer(null);
      load(list[next]);
    },
    [load],
  );

  useEffect(() => {
    const shuffled = withFirst(shuffle(topicExercises), initialExerciseId);
    setOrder(shuffled);
    setFilter(noFilter);
    goTo(0, shuffled);
  }, [goTo, initialExerciseId, topicExercises]);

  const applyFilter = (next: PracticeFilter) => {
    setFilter(next);
    goTo(0, filterExercises(order, next));
  };

  const toggleMotifFilter = (id: string) =>
    applyFilter({
      ...filter,
      motifIds: filter.motifIds.includes(id)
        ? filter.motifIds.filter((item) => item !== id)
        : [...filter.motifIds, id],
    });

  const selectAllMotifs = () => applyFilter({ ...filter, motifIds: [] });

  const selectDepth = (depth: Depth) => applyFilter({ ...filter, depth });

  // Lengths with no exercises for the current selection are greyed out.
  const depthChoices = depthOptions.map((option) => ({
    ...option,
    available: filterExercises(topicExercises, { ...filter, depth: option.value }).length > 0,
  }));

  const isQuiz = exercise?.goal.kind === 'quiz';
  const answerQuiz = (sound: boolean) => {
    if (!exercise || quizAnswer !== null) return;
    setQuizAnswer(sound);
    if (sound === exercise.sound) markSolved(exercise.id);
  };
  const goPrevious = () =>
    goTo((exerciseIndex - 1 + filteredExercises.length) % filteredExercises.length, filteredExercises);
  const goNext = () => goTo((exerciseIndex + 1) % filteredExercises.length, filteredExercises);

  const solvedExercisesCount = filteredExercises.filter((ex) => solved.includes(ex.id)).length;

  return (
    <div className="app">
      <Header
        topic={topic}
        mode="practice"
        progress={`${solvedExercisesCount} / ${filteredExercises.length} solved`}
        menu={{
          label: 'Filters',
          open: menuOpen,
          onToggle: () => setMenuOpen((prev) => !prev),
        }}
      />

      <div className="layout">
        <MenuPanel open={menuOpen} onClose={() => setMenuOpen(false)}>
          <PracticeFilters
            motifs={practiceMotifs}
            topicName={topicById(topic).name}
            selectedIds={filter.motifIds}
            onSelectAll={selectAllMotifs}
            onToggle={toggleMotifFilter}
            depths={depthChoices}
            selectedDepth={filter.depth}
            onSelectDepth={selectDepth}
          />
        </MenuPanel>

        <main>
          {exercise && isQuiz ? (
            <QuizBoard
              exercise={exercise}
              answer={quizAnswer}
              onAnswer={answerQuiz}
              canGoNext={filteredExercises.length >= 2}
              onPrevious={goPrevious}
              onNext={goNext}
            />
          ) : exercise ? (
            <Board {...puzzle.boardProps} />
          ) : (
            <div className="empty-state">
              <h2>No exercises yet</h2>
              <p>
                Practice exercises will appear here. By default, the motif is hidden so you
                have to find it on your own.
              </p>
            </div>
          )}
          {!isQuiz && (
            <PracticeControls
              hasExercise={!!exercise}
              hasHint={!!exercise?.hint}
              canReset={puzzle.canReset}
              canGoNext={filteredExercises.length >= 2}
              canGoPrevious={filteredExercises.length >= 2}
              isDone={puzzle.isDone}
              busy={puzzle.busy}
              showHint={puzzle.showHint}
              revealPattern={revealPattern}
              onReset={puzzle.reset}
              onTogglePattern={() => setRevealPattern((prev) => !prev)}
              onShowHint={() => puzzle.setShowHint(true)}
              onShowSolution={puzzle.reveal}
              onPrevious={goPrevious}
              onNext={goNext}
            />
          )}
        </main>

        <PracticeInfo
          exercise={exercise}
          exercisePattern={exercisePattern}
          exerciseIndex={exerciseIndex}
          moves={puzzle.moves}
          played={isQuiz && quizAnswer !== null ? (exercise?.solution ?? []) : puzzle.played}
          feedback={
            isQuiz ? (
              exercise && <QuizFeedback exercise={exercise} answer={quizAnswer} />
            ) : (
              <Feedback
                puzzle={puzzle.puzzle}
                attempt={puzzle.attempt}
                moves={puzzle.moves}
                ply={puzzle.ply}
                heroColor={puzzle.heroColor}
              />
            )
          }
          showHint={isQuiz ? false : puzzle.showHint}
          isDone={isQuiz ? quizAnswer !== null : puzzle.isDone}
          revealPattern={revealPattern}
        />
      </div>
    </div>
  );
}
