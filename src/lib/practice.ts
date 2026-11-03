import type { Exercise } from './exercises';
import { mateIn } from './patterns';

/** Mate-length filter for Practice. `5` stands for "5 or more" so the long tail stays one choice. */
export type Depth = 'any' | 1 | 2 | 3 | 4 | 5;

export const depthOptions: { value: Depth; label: string }[] = [
  { value: 'any', label: 'Any' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5+' },
];

export function matchesDepth(exercise: Exercise, depth: Depth): boolean {
  if (depth === 'any') return true;
  const moves = mateIn(exercise);
  return depth === 5 ? moves >= 5 : moves === depth;
}

/** Exercises matching the selected patterns (none selected = all) and mate length. */
export function filterExercises(list: Exercise[], patternIds: string[], depth: Depth): Exercise[] {
  return list.filter(
    (ex) =>
      (patternIds.length === 0 || patternIds.includes(ex.patternId)) && matchesDepth(ex, depth),
  );
}
