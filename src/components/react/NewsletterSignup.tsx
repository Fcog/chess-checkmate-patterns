import { useEffect, useId, useState, type FormEvent } from 'react';
import { hasSubscribed, isValidEmail, markPending, newsletterApi, normalizeEmail } from '../../lib/newsletter';

type State = 'hidden' | 'idle' | 'sending' | 'done' | 'invalid' | 'limited' | 'error';

const messages: Partial<Record<State, string>> = {
  invalid: 'Please enter a valid email address.',
  limited: 'Too many attempts – please try again in an hour.',
  error: 'Something went wrong – please try again.',
};

/**
 * Homepage call to action for the daily puzzle email (spec User Story 1). Renders nothing
 * until mounted, and nothing at all once this browser has subscribed (FR-003), so there is
 * no flash of the form for subscribers.
 */
export function NewsletterSignup() {
  const api = newsletterApi();
  const [state, setState] = useState<State>('hidden');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const id = useId();

  useEffect(() => {
    if (api && !hasSubscribed()) setState('idle');
  }, [api]);

  if (state === 'hidden') return null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    const address = normalizeEmail(email);
    if (!isValidEmail(address)) {
      setState('invalid');
      return;
    }
    setState('sending');
    try {
      const res = await fetch(`${api}/newsletter-subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: address, website }),
      });
      if (res.status === 200) {
        markPending();
        setState('done');
      } else if (res.status === 400) setState('invalid');
      else if (res.status === 429) setState('limited');
      else setState('error');
    } catch {
      setState('error');
    }
  }

  if (state === 'done') {
    return (
      <section className="newsletter" aria-live="polite">
        <h2>Check your inbox</h2>
        <p>Click the link in the email we just sent to confirm. The link expires in 7 days.</p>
      </section>
    );
  }

  const message = messages[state];
  return (
    <section className="newsletter">
      <h2>Get a chess puzzle in your inbox every day</h2>
      <form className="newsletter-form" onSubmit={submit} noValidate>
        <label htmlFor={`${id}-email`} className="visually-hidden">
          Your email address
        </label>
        <input
          id={`${id}-email`}
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={state === 'invalid'}
          aria-describedby={message ? `${id}-message` : undefined}
        />
        <div className="newsletter-trap" aria-hidden="true">
          <label htmlFor={`${id}-website`}>Website</label>
          <input
            id={`${id}-website`}
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>
        <button type="submit" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending…' : 'Subscribe'}
        </button>
      </form>
      {message && (
        <p id={`${id}-message`} className="newsletter-message" role="alert">
          {message}
        </p>
      )}
      <p className="newsletter-small">
        One puzzle a day. Unsubscribe anytime. <a href="/privacy">Privacy</a>
      </p>
    </section>
  );
}
