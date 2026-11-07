import type { Exercise } from './exercises';
import { movesToFind } from './motifs';

/** Length filter for Practice. `5` stands for "5 or more" so the long tail stays one choice. */
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
  const moves = movesToFind(exercise);
  return depth === 5 ? moves >= 5 : moves === depth;
}

export type PracticeFilter = {
  /** Selected motifs; none selected = every motif. */
  motifIds: string[];
  depth: Depth;
};

export const noFilter: PracticeFilter = { motifIds: [], depth: 'any' };

/** Exercises matching the selected motifs and the length. */
export function filterExercises(list: Exercise[], filter: PracticeFilter): Exercise[] {
  const { motifIds, depth } = filter;
  return list.filter(
    (ex) =>
      (motifIds.length === 0 || motifIds.includes(ex.motifId)) &&
      matchesDepth(ex, depth),
  );
}
