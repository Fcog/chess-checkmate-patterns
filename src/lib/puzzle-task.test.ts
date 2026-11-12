import { describe, expect, it } from 'vitest';
import { exercises } from './exercises';
import { puzzleTask } from './puzzle-task';

describe('puzzleTask', () => {
  it.each(exercises)('words the task of $id without naming the pattern', (exercise) => {
    const { task, side } = puzzleTask(exercise);
    expect(task).toMatch(
      /^(White|Black) to play and mate in \d+$|^(White|Black) to play and (win material|break through)$|^Is the sacrifice sound or not\?$/,
    );
    expect(side).toBe(exercise.fen.split(' ')[1] === 'w' ? 'white' : 'black');
  });
});
