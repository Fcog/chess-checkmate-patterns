import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { exercises, type Exercise } from '../../lib/exercises';
import { shuffle } from '../../lib/helpers';
import { motifById } from '../../lib/motifs';
import { reshuffle } from '../../lib/practice';
import { Board } from './Board';
import { Feedback, QuizFeedback } from './Feedback';
import { Header } from './Header';
import { NewsletterSignup } from './NewsletterSignup';
import { PracticeControls } from './PracticeControls';
import { PracticeInfo } from './PracticeInfo';
import { QuizBoard } from './QuizBoard';
import { usePuzzle } from './usePuzzle';
import { useSolved } from './useSolved';

/** Every practice exercise, from every topic. */
const pool = exercises;

export type Props = {
  /** Server-rendered intro (h1 + paragraph), from the Astro `about` slot. */
  about?: ReactNode;
  /** Server-rendered topic cards, from the Astro `sections` slot. */
  sections?: ReactNode;
};

/**
 * The homepage: a random exercise from any topic, and Next for another. Walks a shuffled
 * order of the whole pool so nothing repeats until every exercise has been shown.
 *
 * Three columns on desktop (sections | board | info, intro, newsletter); on phones they stack
 * in DOM order: board, info, intro, newsletter, sections (specs/007-homepage-viewport-fit).
 */
export function HomeTrainer({ about, sections }: Props) {
  // The server can't know the random order, so it renders the original order and the shuffle
  // happens right after hydration.
  const [order, setOrder] = useState<Exercise[]>(pool);
  const [index, setIndex] = useState(0);
  /** Exercises shown this visit, for the "Exercise N" title. */
  const [shown, setShown] = useState(1);
  const [revealPattern, setRevealPattern] = useState(false);
  /** Answer to the current "sound or not?" exercise, once given. */
  const [quizAnswer, setQuizAnswer] = useState<boolean | null>(null);

  const { solved, markSolved } = useSolved();
  const puzzle = usePuzzle(order[0], markSolved);
  const { load } = puzzle;

  const exercise = order[index];
  const exercisePattern = useMemo(
    () => (exercise ? motifById(exercise.motifId) : undefined),
    [exercise],
  );

  const goTo = useCallback(
    (next: number, list: Exercise[]) => {
      setIndex(next);
      setRevealPattern(false);
      setQuizAnswer(null);
      load(list[next]);
    },
    [load],
  );

  useEffect(() => {
    const shuffled = shuffle(pool);
    setOrder(shuffled);
    goTo(0, shuffled);
  }, [goTo]);

  const goNext = () => {
    setShown((n) => n + 1);
    if (index + 1 < order.length) {
      goTo(index + 1, order);
      return;
    }
    // Out of exercises: start a fresh cycle that doesn't open with the one just shown.
    const next = reshuffle(pool, exercise?.id);
    setOrder(next);
    goTo(0, next);
  };
  const goPrevious = () => {
    if (index > 0) goTo(index - 1, order);
  };

  const isQuiz = exercise?.goal.kind === 'quiz';
  const answerQuiz = (sound: boolean) => {
    if (!exercise || quizAnswer !== null) return;
    setQuizAnswer(sound);
    if (sound === exercise.sound) markSolved(exercise.id);
  };

  const canGoNext = pool.length >= 2;
  const canGoPrevious = index > 0;
  const solvedCount = pool.filter((ex) => solved.includes(ex.id)).length;

  return (
    <div className="app">
      <Header progress={`${solvedCount} / ${pool.length} solved`} />

      <div className="layout home">
        <main>
          {exercise && isQuiz ? (
            <QuizBoard
              exercise={exercise}
              answer={quizAnswer}
              onAnswer={answerQuiz}
              canGoNext={canGoNext}
              onPrevious={goPrevious}
              onNext={goNext}
            />
          ) : (
            <Board {...puzzle.boardProps} />
          )}
          {!isQuiz && (
            <PracticeControls
              hasExercise={!!exercise}
              hasHint={!!exercise?.hint}
              canReset={puzzle.canReset}
              canGoNext={canGoNext}
              canGoPrevious={canGoPrevious}
              isDone={puzzle.isDone}
              busy={puzzle.busy}
              hintState={puzzle.hintButton}
              canAdvanceHint={puzzle.canAdvanceHint}
              revealPattern={revealPattern}
              onReset={puzzle.reset}
              onTogglePattern={() => setRevealPattern((prev) => !prev)}
              onPressHint={puzzle.pressHint}
              onShowSolution={puzzle.reveal}
              onPrevious={goPrevious}
              onNext={goNext}
            />
          )}
        </main>

        <div className="home-side">
          <PracticeInfo
            exercise={exercise}
            exercisePattern={exercisePattern}
            exerciseIndex={shown - 1}
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
            showLinks
          />
          <div className="home-about">{about}</div>
          {/* The signup renders nothing until mounted; the wrapper keeps its place in the HTML. */}
          <div className="home-newsletter">
            <NewsletterSignup />
          </div>
        </div>

        <nav className="home-sections" aria-label="Sections">
          {sections}
        </nav>
      </div>
    </div>
  );
}
