import { groups as checkmateGroups } from '../data/checkmates/motifs';
import { groups as tacticGroups } from '../data/tactics/motifs';
import { groups as attackGroups } from '../data/attacks/motifs';

export type TopicId = 'checkmates' | 'tactics' | 'attacks';

/**
 * What a puzzle asks for. `mate`: deliver checkmate (any mate solves it, even one off the
 * stored line). `line`: play the stored line to its end, e.g. a fork that wins material.
 * `attack`: the same in the app, but the line is a king attack that need not win material
 * on the board (the tests check it differently). `quiz`: no moves to find; the player
 * answers whether the sacrifice works, then sees the stored line.
 */
export type Goal =
  | { kind: 'mate' }
  | { kind: 'quiz' }
  | {
      kind: 'line' | 'attack';
      /** Task in a few words, e.g. "Win material". */
      label: string;
      /** Shown once solved. */
      done: string;
    };

export type Topic = {
  id: TopicId;
  /** Tab and heading name, e.g. "Checkmates". */
  name: string;
  /** What one motif of this topic is called, e.g. "checkmate pattern". */
  noun: string;
  path: string;
  /** Spoiler-free summary for the topic page and the home page. */
  intro: string;
  /** Page title and meta description of the topic page (the site name is added after the title). */
  seoTitle: string;
  seoDescription: string;
  /** Heading and page title of the topic's practice page. */
  practiceTitle: string;
  /** Intro of the practice page; the exercise count goes in its meta description. */
  practiceIntro: string;
  goal: Goal;
  /** Sidebar sections, in order. Every motif belongs to one. */
  groups: string[];
};

export const topics: Topic[] = [
  {
    id: 'checkmates',
    name: 'Checkmates',
    noun: 'checkmate pattern',
    path: '/checkmates',
    intro:
      'The classic mating patterns, from the back-rank mate to Anastasia’s, Boden’s and the ' +
      'Arabian mate. Each one is a short puzzle: find the mate, then read how the pattern works.',
    seoTitle: 'Learn the Classic Chess Checkmate Patterns',
    seoDescription:
      'Learn the classic chess checkmate patterns — Anastasia’s, Arabian, Boden’s, back-rank, ' +
      'Epaulette and more — on an interactive board, then test yourself in Practice.',
    practiceTitle: 'Checkmate Practice Puzzles – Spot the Mating Pattern',
    practiceIntro:
      'Knowing a pattern is one thing; spotting it in a real position is another. These ' +
      'puzzles mix the checkmate patterns together and hide which one you’re looking at, so ' +
      'you have to recognise it yourself.',
    goal: { kind: 'mate' },
    groups: checkmateGroups,
  },
  {
    id: 'tactics',
    name: 'Tactics',
    noun: 'chess tactic',
    path: '/tactics',
    intro:
      'The tactics that win material: forks, pins and skewers, discovered and double checks, ' +
      'deflections, decoys and removing the guard. Each one is a short puzzle: find the ' +
      'winning line, then read how the tactic works.',
    seoTitle: 'Learn Chess Tactics – Forks, Pins, Skewers and More',
    seoDescription:
      'Learn the chess tactics that win material — forks, pins, skewers, discovered and double ' +
      'checks, deflection, decoy and removing the guard — on an interactive board.',
    practiceTitle: 'Chess Tactics Practice Puzzles – Spot the Winning Tactic',
    practiceIntro:
      'Knowing a tactic is one thing; spotting it in a real position is another. These ' +
      'puzzles mix the tactics together and hide which one you’re looking at, so you have to ' +
      'recognise it yourself.',
    goal: { kind: 'line', label: 'Win material', done: 'That wins material. Well done.' },
    groups: tacticGroups,
  },
  {
    id: 'attacks',
    name: 'Attacks',
    noun: 'attacking pattern',
    path: '/attacks',
    intro:
      'Classic sacrificial attacks on the king: the Greek gift, the double bishop sacrifice, ' +
      'Bxh6 and the sacrifice on f7. Learn the set-up, the conditions that make each sacrifice ' +
      'work and the main defences, then drill every variation.',
    seoTitle: 'Learn the Greek Gift, Double Bishop and Other Chess Sacrifices',
    seoDescription:
      'Learn the classic attacking sacrifices — the Greek gift, the double bishop sacrifice, ' +
      'Bxh6 and the sacrifice on f7 — when they work, when they fail, and how to answer every ' +
      'defence, on an interactive board.',
    practiceTitle: 'Attack Practice – Sacrifice Against the King',
    practiceIntro:
      'Play the attack against every defence, and decide whether the sacrifice works at all. ' +
      'Some positions only ask the question: is the sacrifice sound here?',
    goal: { kind: 'attack', label: 'Break through', done: 'The attack breaks through. Well done.' },
    groups: attackGroups,
  },
];

/** Every topic has a Learn section (its motifs) and a Practice section (blind exercises). */
export type Mode = 'learn' | 'practice';

export function practicePath(topic: TopicId): string {
  return `${topicById(topic).path}/practice`;
}

/** Share link of one practice exercise, e.g. /checkmates/practice/k3x9a. */
export function sharePath(topic: TopicId, code: string): string {
  return `${practicePath(topic)}/${code}`;
}

export function topicById(id: TopicId): Topic {
  const topic = topics.find((t) => t.id === id);
  if (!topic) throw new Error(`Unknown topic: ${id}`);
  return topic;
}
