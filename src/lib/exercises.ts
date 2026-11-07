import {
  exercises as checkmateExercises,
  practiceIds as checkmatePracticeIds,
} from '../data/checkmates/exercises';
import { exercises as tacticExercises, practiceIds as tacticPracticeIds } from '../data/tactics/exercises';
import { motifById } from './motifs';
import type { Goal, TopicId } from './topics';

/** An exercise as written in `src/data/<topic>/exercises.ts`. */
export type ExerciseData = {
  id: string;
  motifId: string;
  fen: string;
  solution: string[];
  /** Other winning lines the player may follow instead; same length as `solution`. */
  alternatives?: string[][];
  hint?: string;
  /** Overrides the motif's goal. */
  goal?: Goal;
};

/** An exercise with the topic and goal of its motif filled in. */
export type Exercise = ExerciseData & { topic: TopicId; goal: Goal };

function resolve(list: ExerciseData[]): Exercise[] {
  return list.map((ex) => {
    const motif = motifById(ex.motifId);
    if (!motif) throw new Error(`Exercise ${ex.id} has unknown motif ${ex.motifId}`);
    return { ...ex, topic: motif.topic, goal: ex.goal ?? motif.goal };
  });
}

/** Practice exercises, every topic. */
export const exercises: Exercise[] = resolve([...checkmateExercises, ...tacticExercises]);

/** Motifs currently available in the Practice section filter. */
export const practiceMotifIds: string[] = [...checkmatePracticeIds, ...tacticPracticeIds];
