import { boardAlt } from './board-image';
import { exercises } from './exercises';
import { puzzleTask } from './puzzle-task';
import { shareCode } from './share';
import { site } from './site';
import { sharePath, type TopicId } from './topics';

/** One entry of /newsletter/puzzles.json (contracts/puzzle-catalogue.md). Never the exercise id or motif. */
export type CatalogueEntry = {
  code: string;
  topic: TopicId;
  fen: string;
  side: 'white' | 'black';
  task: string;
  url: string;
  image: string;
  alt: string;
};

export function puzzleCatalogue(): { version: 1; puzzles: CatalogueEntry[] } {
  return {
    version: 1,
    puzzles: exercises.map((exercise) => {
      const code = shareCode(exercise.id);
      const { side, task } = puzzleTask(exercise);
      return {
        code,
        topic: exercise.topic,
        fen: exercise.fen,
        side,
        task,
        url: site.url + sharePath(exercise.topic, code),
        image: `${site.url}/newsletter/board/${code}.png`,
        alt: boardAlt(exercise.fen),
      };
    }),
  };
}
