/** The daily send runs at 07:00 UTC (clarification Q3). */
export const SEND_HOUR_UTC = 7;

/** The first send strictly after `now`. */
export function nextSendAt(now: Date): Date {
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), SEND_HOUR_UTC),
  );
  return now < today ? today : new Date(today.getTime() + 24 * 60 * 60 * 1000);
}

/** The UTC day of `now`, as YYYY-MM-DD. */
export function utcDay(now: Date): string {
  return now.toISOString().slice(0, 10);
}
