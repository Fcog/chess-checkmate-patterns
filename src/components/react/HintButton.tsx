import type { HintButtonState } from '../../lib/puzzle';
import { ButtonLabel } from './ButtonLabel';

export type Props = {
  state: HintButtonState;
  disabled: boolean;
  onPress: () => void;
};

const LABELS: Record<HintButtonState, { full: string; short: string }> = {
  hint: { full: 'Hint', short: 'Hint' },
  piece: { full: 'Reveal piece', short: 'Piece' },
  move: { full: 'Reveal move', short: 'Move' },
  done: { full: 'Move revealed', short: 'Shown' },
};
const STATES = Object.keys(LABELS) as HintButtonState[];

/**
 * The hint button walks through every hint step in place: text hint, piece, move.
 * All labels are stacked in one grid cell so the button keeps the width of the longest
 * and the controls next to it never shift. The last step uses aria-disabled instead of
 * disabled so keyboard focus stays on the button.
 */
export function HintButton({ state, disabled, onPress }: Props) {
  const done = state === 'done';
  return (
    <button
      type="button"
      className="hint-button"
      aria-label={LABELS[state].full}
      aria-live="polite"
      aria-disabled={done || undefined}
      disabled={disabled}
      onClick={() => {
        if (!done) onPress();
      }}
    >
      <span className="hint-labels">
        {STATES.map((s) => (
          <span key={s} className={s === state ? 'is-active' : undefined}>
            <ButtonLabel full={LABELS[s].full} short={LABELS[s].short} />
          </span>
        ))}
      </span>
    </button>
  );
}
