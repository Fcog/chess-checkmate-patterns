import type { HintStep } from '../../lib/puzzle';

export type Props = {
  step: HintStep;
  disabled: boolean;
  onReveal: () => void;
};

const LABELS: Record<HintStep, string> = {
  0: 'Reveal piece',
  1: 'Reveal move',
  2: 'Move revealed',
};

/** Shown under the hint text: first press circles the piece to move, second shows the move. */
export function HintReveal({ step, disabled, onReveal }: Props) {
  return (
    <button
      type="button"
      className="hint-reveal"
      onClick={onReveal}
      disabled={disabled || step === 2}
      aria-live="polite"
    >
      {LABELS[step]}
    </button>
  );
}
