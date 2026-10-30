import type { Color } from 'chessground/types';
import type { Attempt } from './usePuzzle';

export type Props = {
  attempt: Attempt;
  moves: number;
  ply: number;
  heroColor: Color;
};

export function Feedback({ attempt, moves, ply, heroColor }: Props) {
  const defender = heroColor === 'white' ? 'Black' : 'White';
  const heroMovesLeft = moves - Math.ceil(ply / 2);

  switch (attempt.kind) {
    case 'wrong':
      return <p className="feedback wrong">{attempt.san} does not force mate. Try again.</p>;
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
          {attempt.revealed ? 'That is the line.' : 'Checkmate. Well done.'}
        </p>
      );
    default:
      return (
        <p className="feedback">
          Find the mate in {moves} for {heroColor}.
        </p>
      );
  }
}
