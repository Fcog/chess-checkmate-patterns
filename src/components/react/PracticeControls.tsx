export type Props = {
  hasExercise: boolean;
  hasHint: boolean;
  canReset: boolean;
  canGoNext: boolean;
  isDone: boolean;
  busy: boolean;
  showHint: boolean;
  revealPattern: boolean;
  onReset: () => void;
  onTogglePattern: () => void;
  onShowHint: () => void;
  onShowSolution: () => void;
  onNext: () => void;
};

export function PracticeControls({
  hasExercise,
  hasHint,
  canReset,
  canGoNext,
  isDone,
  busy,
  showHint,
  revealPattern,
  onReset,
  onTogglePattern,
  onShowHint,
  onShowSolution,
  onNext,
}: Props) {
  return (
    <div className="controls">
      <button onClick={onReset} disabled={!hasExercise || !canReset}>
        Reset
      </button>
      <button onClick={onTogglePattern} disabled={!hasExercise || isDone}>
        {revealPattern || isDone ? 'Pattern revealed' : 'Reveal pattern'}
      </button>
      {hasHint && (
        <button onClick={onShowHint} disabled={showHint || isDone}>
          Hint
        </button>
      )}
      <button onClick={onShowSolution} disabled={!hasExercise || isDone || busy}>
        Show solution
      </button>
      <button onClick={onNext} disabled={!canGoNext}>
        Next exercise
      </button>
    </div>
  );
}
