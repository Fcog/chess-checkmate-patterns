import { useCallback, useEffect, useState } from 'react';
import { loadSolved, saveSolved } from '../../lib/helpers';

/**
 * Solved puzzle ids, persisted in localStorage. Starts empty and loads after mount, so
 * the server-rendered HTML and the first client render match.
 */
export function useSolved() {
  const [solved, setSolved] = useState<string[]>([]);

  useEffect(() => setSolved(loadSolved()), []);

  const markSolved = useCallback((id: string) => {
    setSolved((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      saveSolved(next);
      return next;
    });
  }, []);

  return { solved, markSolved };
}
