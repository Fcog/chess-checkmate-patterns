import type { APIRoute, GetStaticPaths } from 'astro';
import { boardPng } from '../../../lib/board-image';
import { exercises, type Exercise } from '../../../lib/exercises';
import { puzzleTask } from '../../../lib/puzzle-task';
import { shareCode } from '../../../lib/share';

// One board picture per practice puzzle, for the daily email (contracts/puzzle-catalogue.md).
export const getStaticPaths = (() =>
  exercises.map((exercise) => ({
    params: { code: shareCode(exercise.id) },
    props: { exercise },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => {
  const exercise = (props as { exercise: Exercise }).exercise;
  const png = boardPng(exercise.fen, puzzleTask(exercise).side);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
