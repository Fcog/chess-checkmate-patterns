/**
 * Browser side of the daily puzzle newsletter: the "submitted" marker that hides the homepage
 * call to action (FR-003, data-model.md "Browser: Submitted marker"), and the API base URL.
 */
import { isValidEmail, normalizeEmail } from '../../supabase/functions/_shared/validate';

export { isValidEmail, normalizeEmail };

export const NEWSLETTER_KEY = 'checkmate-patterns:newsletter';
/** A pending marker hides the call to action for 7 days, the life of a confirmation link. */
export const PENDING_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type Marker = { state: 'pending'; at: number } | { state: 'confirmed' };

function read(): Marker | null {
  try {
    const raw = localStorage.getItem(NEWSLETTER_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw);
    if (value?.state === 'confirmed') return value;
    if (value?.state === 'pending' && typeof value.at === 'number') return value;
    return null;
  } catch {
    return null;
  }
}

function write(marker: Marker) {
  try {
    localStorage.setItem(NEWSLETTER_KEY, JSON.stringify(marker));
  } catch {
    // Storage blocked: the call to action may show again later, which is harmless.
  }
}

/** Whether this browser should not see the call to action. */
export function hasSubscribed(now = Date.now()): boolean {
  const marker = read();
  if (!marker) return false;
  if (marker.state === 'confirmed') return true;
  if (now - marker.at < PENDING_TTL_MS) return true;
  clearSubscribed(); // Never confirmed here: show the call to action again.
  return false;
}

export function markPending(now = Date.now()) {
  write({ state: 'pending', at: now });
}

export function markConfirmed() {
  write({ state: 'confirmed' });
}

export function clearSubscribed() {
  try {
    localStorage.removeItem(NEWSLETTER_KEY);
  } catch {
    // Nothing to do.
  }
}

/** Base URL of the newsletter functions, or '' when the newsletter is switched off. */
export function newsletterApi(): string {
  return (import.meta.env.PUBLIC_NEWSLETTER_API ?? '').replace(/\/+$/, '');
}

/** "Thursday 08:00" in the visitor's own time zone. */
export function formatLocalTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { weekday: 'long', hour: '2-digit', minute: '2-digit' });
}
