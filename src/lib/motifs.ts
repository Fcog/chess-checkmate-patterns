import { motifs as checkmateMotifs } from '../data/checkmates/motifs';
import { motifs as tacticMotifs } from '../data/tactics/motifs';
import { motifs as attackMotifs } from '../data/attacks/motifs';
import { topicById, type Goal, type TopicId } from './topics';

/** A motif as written in `src/data/<topic>/motifs.ts`; topic and goal come from its topic. */
export type MotifData = {
  id: string;
  name: string;
  /** One of the topic's `groups`. */
  group: string;
  /** Spoiler-free summary for the motif's page text and meta description. */
  intro: string;
  /** Position with the hero (always White) to move. */
  fen: string;
  /**
   * The line in SAN, starting with the hero. Even plies are the moves the player has to
   * find; odd plies are the defender's reply and get played automatically (for mates each
   * must be the defender's only legal move; see the tests for the other goals).
   */
  solution: string[];
  idea: string;
  hint: string;
  /** Overrides the topic's goal. */
  goal?: Goal;
  /** Extra article sections for the Learn page, each with lines to step through. */
  sections?: ArticleSection[];
};

/** A section of a motif's article, e.g. "When the sacrifice fails". */
export type ArticleSection = {
  heading: string;
  paragraphs: string[];
  examples?: { fen: string; moves: string[]; caption: string }[];
};

export type Motif = MotifData & { topic: TopicId; goal: Goal };

function withTopic(list: MotifData[], topic: TopicId): Motif[] {
  return list.map((m) => ({ ...m, topic, goal: m.goal ?? topicById(topic).goal }));
}

/** Every motif, grouped by topic in `topics` order. */
export const motifs: Motif[] = [
  ...withTopic(checkmateMotifs, 'checkmates'),
  ...withTopic(tacticMotifs, 'tactics'),
  ...withTopic(attackMotifs, 'attacks'),
];

export function motifsOf(topic: TopicId): Motif[] {
  return motifs.filter((m) => m.topic === topic);
}

export function motifById(id: string): Motif | undefined {
  return motifs.find((m) => m.id === id);
}

export function motifPath(motif: { id: string; topic: TopicId }): string {
  return `${topicById(motif.topic).path}/${motif.id}`;
}

type Task = { solution: string[]; goal: Goal };

/** How many moves the player actually has to find. */
export function movesToFind(puzzle: { solution: string[] }): number {
  return Math.ceil(puzzle.solution.length / 2);
}

/** "Mate in 2", "Win material", "Sound or not?". */
export function taskLabel(puzzle: Task): string {
  const { goal } = puzzle;
  if (goal.kind === 'mate') return `Mate in ${movesToFind(puzzle)}`;
  if (goal.kind === 'quiz') return 'Sound or not?';
  return goal.label;
}

/** Sidebar badge: "M2" for a mate in 2; the move count for other goals. */
export function taskBadge(puzzle: Task): string {
  const moves = movesToFind(puzzle);
  if (puzzle.goal.kind === 'quiz') return '?';
  return puzzle.goal.kind === 'mate' ? `M${moves}` : `${moves} mv`;
}

/** "Find the mate in 2 for white." / "White to play and win material." */
export function taskPrompt(puzzle: Task, hero: 'white' | 'black'): string {
  const { goal } = puzzle;
  if (goal.kind === 'mate') return `Find the mate in ${movesToFind(puzzle)} for ${hero}.`;
  if (goal.kind === 'quiz') return `Does the sacrifice ${puzzle.solution[0]} work here?`;
  const side = hero === 'white' ? 'White' : 'Black';
  return `${side} to play and ${goal.label.toLowerCase()}.`;
}

/** Shown once the puzzle is solved by the player. */
export function taskDone(puzzle: Task): string {
  const { goal } = puzzle;
  if (goal.kind === 'mate') return 'Checkmate. Well done.';
  if (goal.kind === 'quiz') return 'Correct.';
  return goal.done;
}

/**
 * The motif "Next" should go to: the first unsolved one after `index`, wrapping round the
 * list. When everything else is solved, simply the next one in order.
 */
export function nextMotifIndex(list: { id: string }[], index: number, solved: string[]): number {
  for (let step = 1; step < list.length; step++) {
    const candidate = (index + step) % list.length;
    if (!solved.includes(list[candidate].id)) return candidate;
  }
  return (index + 1) % list.length;
}
