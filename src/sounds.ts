let context: AudioContext | undefined;

function getContext(): AudioContext | undefined {
  try {
    context ??= new AudioContext();
    // Browsers start the context suspended until the user interacts with the page.
    if (context.state === 'suspended') void context.resume();
    return context;
  } catch {
    // No Web Audio support — moves just stay silent.
    return undefined;
  }
}

function tone(
  ctx: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  type: OscillatorType,
  volume: number,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration);
}

/** A short rising chime. */
export function playGoodMove() {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  tone(ctx, 660, now, 0.15, 'sine', 0.2);
  tone(ctx, 990, now + 0.08, 0.25, 'sine', 0.2);
}

/** A low, falling buzz. */
export function playBadMove() {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  tone(ctx, 220, now, 0.18, 'square', 0.08);
  tone(ctx, 165, now + 0.12, 0.25, 'square', 0.08);
}
