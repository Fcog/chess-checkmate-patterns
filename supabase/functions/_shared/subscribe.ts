/** What a form submission does to an address, per data-model.md (State transitions). */

export const RESEND_INTERVAL_MS = 60 * 60 * 1000;
export const CONFIRM_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type SubscriberState = {
  status: 'pending' | 'active' | 'unsubscribed';
  confirmation_sent_at: string | null;
};

export type SubscribeDecision = {
  /**
   * insert: new pending row. resend: pending row, send the confirmation again.
   * reactivate: unsubscribed row back to pending with a new confirm token. none: no change.
   */
  action: 'insert' | 'resend' | 'reactivate' | 'none';
  /** Whether to send the confirmation email (and then set confirmation_sent_at). */
  send: boolean;
  /** New confirm_expires_at, set together with the email. */
  confirmExpiresAt?: Date;
};

export function decideSubscribe(existing: SubscriberState | null, now: Date): SubscribeDecision {
  const expires = new Date(now.getTime() + CONFIRM_TTL_MS);
  if (!existing) return { action: 'insert', send: true, confirmExpiresAt: expires };
  switch (existing.status) {
    case 'pending': {
      const last = existing.confirmation_sent_at ? Date.parse(existing.confirmation_sent_at) : 0;
      // FR-004b: at most one confirmation email per hour per address.
      return now.getTime() - last >= RESEND_INTERVAL_MS
        ? { action: 'resend', send: true, confirmExpiresAt: expires }
        : { action: 'none', send: false };
    }
    case 'active':
      // FR-005: same answer as a new subscription, nothing sent.
      return { action: 'none', send: false };
    case 'unsubscribed':
      return { action: 'reactivate', send: true, confirmExpiresAt: expires };
  }
}
