import type { Color } from 'chessground/types';
import { taskDone, taskPrompt } from '../../lib/motifs';
import type { Exercise } from '../../lib/exercises';
import type { Puzzle } from '../../lib/puzzle';
import type { Attempt } from './usePuzzle';

export type Props = {
  puzzle: Pick<Puzzle, 'solution' | 'goal'> | undefined;
  attempt: Attempt;
  moves: number;
  ply: number;
  heroColor: Color;
};

export function Feedback({ puzzle, attempt, moves, ply, heroColor }: Props) {
  const defender = heroColor === 'white' ? 'Black' : 'White';
  const heroMovesLeft = moves - Math.ceil(ply / 2);

  switch (attempt.kind) {
    case 'wrong':
      return attempt.reply ? (
        <p className="feedback wrong">
          {attempt.san} isn’t it — {defender} answers {attempt.reply}. Try again.
        </p>
      ) : (
        <p className="feedback wrong">{attempt.san} is stalemate — a draw. Try again.</p>
      );
    case 'progress':
      return (
        <p className="feedback right">
          {attempt.hero} — {defender} plays {attempt.reply}. {heroMovesLeft} move
          {heroMovesLeft === 1 ? '' : 's'} to go.
        </p>
      );
    case 'solved':
      return (
        <p className="feedback right">
          {attempt.revealed
            ? 'That is the line.'
            : attempt.mate
              ? 'Checkmate. Well done.'
              : puzzle && taskDone(puzzle)}
        </p>
      );
    default:
      return <p className="feedback">{puzzle && taskPrompt(puzzle, heroColor)}</p>;
  }
}

/** Feedback for a "sound or not?" exercise. The explanation is shown as the hint. */
export function QuizFeedback({ exercise, answer }: { exercise: Exercise; answer: boolean | null }) {
  if (answer === null) return <p className="feedback">{taskPrompt(exercise, 'white')}</p>;
  const verdict = exercise.sound ? 'works' : 'fails';
  return answer === exercise.sound ? (
    <p className="feedback right">Correct: the sacrifice {verdict} here.</p>
  ) : (
    <p className="feedback wrong">Not this time: the sacrifice {verdict} here.</p>
  );
}
