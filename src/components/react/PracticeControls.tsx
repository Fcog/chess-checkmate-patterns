import type { HintButtonState } from '../../lib/puzzle';
import { ButtonLabel } from './ButtonLabel';
import { HintButton } from './HintButton';

export type Props = {
  hasExercise: boolean;
  hasHint: boolean;
  canReset: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isDone: boolean;
  busy: boolean;
  hintState: HintButtonState;
  canAdvanceHint: boolean;
  revealPattern: boolean;
  onReset: () => void;
  onTogglePattern: () => void;
  onPressHint: () => void;
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
  hintState,
  canAdvanceHint,
  revealPattern,
  onReset,
  onTogglePattern,
  onPressHint,
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
        <HintButton
          state={hintState}
          disabled={isDone || busy || ((hintState === 'piece' || hintState === 'move') && !canAdvanceHint)}
          onPress={onPressHint}
        />
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
