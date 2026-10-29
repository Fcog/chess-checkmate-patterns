export type Props = {
  canReset: boolean;
  canGoNext: boolean;
  isDone: boolean;
  busy: boolean;
  showHint: boolean;
  onReset: () => void;
  onShowHint: () => void;
  onShowSolution: () => void;
  onNext: () => void;
};

export function PatternControls({
  canReset,
  canGoNext,
  isDone,
  busy,
  showHint,
  onReset,
  onShowHint,
  onShowSolution,
  onNext,
}: Props) {
  return (
    <div className="controls">
      <button onClick={onReset} disabled={!canReset}>
        Reset
      </button>
      <button onClick={onShowHint} disabled={showHint || isDone}>
        Hint
      </button>
      <button onClick={onShowSolution} disabled={isDone || busy}>
        Show solution
      </button>
      <button onClick={onNext} disabled={!canGoNext}>
        Next pattern
      </button>
    </div>
  );
}
