import { ButtonLabel } from './ButtonLabel';

export type Props = {
  hasExercise: boolean;
  hasHint: boolean;
  canReset: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isDone: boolean;
  busy: boolean;
  showHint: boolean;
  revealPattern: boolean;
  onReset: () => void;
  onTogglePattern: () => void;
  onShowHint: () => void;
  onShowSolution: () => void;
  onPrevious: () => void;
  onNext: () => void;
};

export function PracticeControls({
  hasExercise,
  hasHint,
  canReset,
  canGoNext,
  canGoPrevious,
  isDone,
  busy,
  showHint,
  revealPattern,
  onReset,
  onTogglePattern,
  onShowHint,
  onShowSolution,
  onPrevious,
  onNext,
}: Props) {
  return (
    <div className="controls">
      <button onClick={onReset} disabled={!hasExercise || !canReset}>
        Reset
      </button>
      <button
        onClick={onTogglePattern}
        disabled={!hasExercise || isDone}
        aria-label={revealPattern || isDone ? 'Pattern revealed' : 'Reveal pattern'}
      >
        {revealPattern || isDone ? (
          <ButtonLabel full="Pattern revealed" short="Revealed" />
        ) : (
          <ButtonLabel full="Reveal pattern" short="Pattern" />
        )}
      </button>
      {hasHint && (
        <button onClick={onShowHint} disabled={showHint || isDone}>
          Hint
        </button>
      )}
      <button
        onClick={onShowSolution}
        disabled={!hasExercise || isDone || busy}
        aria-label="Show solution"
      >
        <ButtonLabel full="Show solution" short="Solution" />
      </button>
      <button
        className="nav"
        onClick={onPrevious}
        disabled={!canGoPrevious}
        aria-label="Previous exercise"
      >
        <ButtonLabel full="← Previous" short="←" />
      </button>
      <button className="nav" onClick={onNext} disabled={!canGoNext} aria-label="Next exercise">
        <ButtonLabel full="Next →" short="→" />
      </button>
    </div>
  );
}
