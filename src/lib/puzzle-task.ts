import type { Exercise } from './exercises';
import { movesToFind } from './motifs';

export type PuzzleTask = {
  side: 'white' | 'black';
  sideName: 'White' | 'Black';
  /** Short task for the newsletter, e.g. "White to play and mate in 2". */
  task: string;
  /** Share page heading and title. */
  heading: string;
  /** Share page question, used in its meta description. */
  question: string;
};

/**
 * What a practice exercise asks for, in words that never name the pattern. Shared by the
 * share page and the newsletter's puzzle catalogue.
 */
export function puzzleTask(exercise: Exercise): PuzzleTask {
  const side = exercise.fen.split(' ')[1] === 'w' ? 'white' : 'black';
  const sideName = side === 'white' ? 'White' : 'Black';
  const moves = movesToFind(exercise);
  const goal = exercise.goal;
  if (goal.kind === 'mate') {
    return {
      side,
      sideName,
      task: `${sideName} to play and mate in ${moves}`,
      heading: `Checkmate puzzle: ${sideName} to mate in ${moves}`,
      question: `Can you find the mate in ${moves}?`,
    };
  }
  if (goal.kind === 'quiz') {
    return {
      side,
      sideName,
      task: 'Is the sacrifice sound or not?',
      heading: 'Chess puzzle: does the sacrifice work?',
      question: 'Is the sacrifice sound or not?',
    };
  }
  const action = goal.label.toLowerCase();
  return {
    side,
    sideName,
    task: `${sideName} to play and ${action}`,
    heading: `Chess puzzle: ${sideName} to play and ${action}`,
    question: 'Can you find the winning line?',
  };
}
