import type { HintButtonState } from '../../lib/puzzle';
import { ButtonLabel } from './ButtonLabel';
import { HintButton } from './HintButton';

export type Props = {
  canReset: boolean;
  canGoNext: boolean;
  isDone: boolean;
  busy: boolean;
  hintState: HintButtonState;
  canAdvanceHint: boolean;
  onReset: () => void;
  onPressHint: () => void;
  onShowSolution: () => void;
  onNext: () => void;
};

export function PatternControls({
  canReset,
  canGoNext,
  isDone,
  busy,
  hintState,
  canAdvanceHint,
  onReset,
  onPressHint,
  onShowSolution,
  onNext,
}: Props) {
  return (
    <div className="controls">
      <button onClick={onReset} disabled={!canReset}>
        Reset
      </button>
      <HintButton
        state={hintState}
        disabled={isDone || busy || ((hintState === 'piece' || hintState === 'move') && !canAdvanceHint)}
        onPress={onPressHint}
      />
      <button onClick={onShowSolution} disabled={isDone || busy} aria-label="Show solution">
        <ButtonLabel full="Show solution" short="Solution" />
      </button>
      <button onClick={onNext} disabled={!canGoNext} aria-label="Next pattern">
        <ButtonLabel full="Next pattern" short="Next →" />
      </button>
    </div>
  );
}
