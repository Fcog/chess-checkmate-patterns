import { useEffect, useState } from 'react';

export type Props = {
  /** Path on this site to share, e.g. "/patterns/arabian". */
  path: string;
  title: string;
  text: string;
};

type Status = { kind: 'idle' } | { kind: 'copied' } | { kind: 'manual'; url: string };

/**
 * Opens the system share sheet where there is one (mostly phones). Otherwise copies the link,
 * or shows it for manual copying if the clipboard isn't available.
 */
export function ShareButton({ path, title, text }: Props) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  // A new exercise or pattern means a new link.
  useEffect(() => setStatus({ kind: 'idle' }), [path]);

  useEffect(() => {
    if (status.kind !== 'copied') return;
    const timer = window.setTimeout(() => setStatus({ kind: 'idle' }), 2000);
    return () => window.clearTimeout(timer);
  }, [status]);

  const share = async () => {
    const url = new URL(path, window.location.origin).href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {
        // The user closed the share sheet: nothing to do.
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setStatus({ kind: 'copied' });
    } catch {
      setStatus({ kind: 'manual', url });
    }
  };

  return (
    <div className="share">
      <button type="button" className="share-button" onClick={share}>
        Share
      </button>
      <span className="share-status" aria-live="polite">
        {status.kind === 'copied' && 'Link copied'}
        {status.kind === 'manual' && (
          <input
            className="share-url"
            readOnly
            value={status.url}
            aria-label="Link to share"
            onFocus={(event) => event.currentTarget.select()}
          />
        )}
      </span>
    </div>
  );
}
