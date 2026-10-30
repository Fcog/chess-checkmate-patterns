import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import type { Color, Key } from 'chessground/types';
import { legalDests } from '../../lib/helpers';
import { mateIn } from '../../lib/patterns';
import { checkMove, playSan, type Puzzle } from '../../lib/puzzle';
import { playBadMove, playGoodMove } from '../../lib/sounds';

/** Stable identity so the board effect does not re-run on every render. */
const NO_DESTS = new Map<Key, Key[]>();
const REPLY_DELAY = 550;
const REVERT_DELAY = 600;
const REVEAL_STEP = 750;

export type Attempt =
  | { kind: 'idle' }
  | { kind: 'progress'; hero: string; reply: string }
  | { kind: 'wrong'; san: string }
  | { kind: 'solved'; revealed: boolean };

/**
 * Board state for playing through one puzzle at a time. Call `load` to switch to another
 * puzzle (or to restart the current one).
 */
export function usePuzzle(initial: Puzzle | undefined, onSolved: (id: string) => void) {
  const [puzzle, setPuzzle] = useState(initial);
  const [fen, setFen] = useState(initial?.fen ?? new Chess().fen());
  const [ply, setPly] = useState(0);
  const [played, setPlayed] = useState<string[]>([]);
  const [attempt, setAttempt] = useState<Attempt>({ kind: 'idle' });
  const [busy, setBusy] = useState(false);
  const [lastMove, setLastMove] = useState<Key[] | undefined>(undefined);
  const [showHint, setShowHint] = useState(false);
  const [syncKey, setSyncKey] = useState(0);

  const timers = useRef<number[]>([]);
  const clearTimers = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  }, []);
  const schedule = useCallback((delay: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, delay));
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  const load = useCallback(
    (next: Puzzle | undefined) => {
      clearTimers();
      setPuzzle(next);
      if (next) setFen(next.fen);
      setPly(0);
      setPlayed([]);
      setAttempt({ kind: 'idle' });
      setBusy(false);
      setLastMove(undefined);
      setShowHint(false);
      setSyncKey((k) => k + 1);
    },
    [clearTimers],
  );

  const game = useMemo(() => new Chess(fen), [fen]);
  const dests = useMemo(() => legalDests(game), [game]);
  const heroColor: Color = useMemo(
    () => (new Chess(puzzle?.fen ?? fen).turn() === 'w' ? 'white' : 'black'),
    [puzzle, fen],
  );
  const isDone = attempt.kind === 'solved';
  const locked = isDone || busy;
  const moves = puzzle ? mateIn(puzzle) : 1;

  const onMove = useCallback(
    (from: Key, to: Key) => {
      if (locked || !puzzle) return;
      const result = checkMove(puzzle, fen, ply, from, to);

      if (result.kind === 'illegal') {
        setSyncKey((k) => k + 1);
        return;
      }

      if (result.kind === 'wrong') {
        playBadMove();
        setAttempt({ kind: 'wrong', san: result.san });
        // Let the move sit on the board for a beat, then snap back to the position.
        clearTimers();
        schedule(REVERT_DELAY, () => setSyncKey((k) => k + 1));
        return;
      }

      playGoodMove();
      const nextPly = ply + 1;
      setPlayed((prev) => [...prev, result.san]);
      setFen(result.fen);
      setPly(nextPly);
      setLastMove([from, to]);

      if (result.solved) {
        setAttempt({ kind: 'solved', revealed: false });
        onSolved(puzzle.id);
        return;
      }

      // The defender's reply is played automatically on odd plies.
      const replySan = puzzle.solution[nextPly];
      setBusy(true);
      schedule(REPLY_DELAY, () => {
        const reply = playSan(result.fen, replySan);
        setPlayed((prev) => [...prev, reply.san]);
        setFen(reply.fen);
        setPly(nextPly + 1);
        setLastMove([reply.from as Key, reply.to as Key]);
        setAttempt({ kind: 'progress', hero: result.san, reply: reply.san });
        setBusy(false);
      });
    },
    [clearTimers, fen, locked, onSolved, ply, puzzle, schedule],
  );

  const reveal = useCallback(() => {
    if (!puzzle) return;
    clearTimers();
    setBusy(true);
    let cursor = fen;
    const remaining = puzzle.solution.slice(ply);
    remaining.forEach((san, i) => {
      schedule(i * REVEAL_STEP, () => {
        const move = playSan(cursor, san);
        cursor = move.fen;
        setPlayed((prev) => [...prev, move.san]);
        setFen(move.fen);
        setPly(ply + i + 1);
        setLastMove([move.from as Key, move.to as Key]);
        if (i === remaining.length - 1) {
          setBusy(false);
          setAttempt({ kind: 'solved', revealed: true });
        }
      });
    });
  }, [clearTimers, fen, ply, puzzle, schedule]);

  return {
    puzzle,
    load,
    reset: () => load(puzzle),
    reveal,
    attempt,
    played,
    ply,
    busy,
    isDone,
    moves,
    heroColor,
    showHint,
    setShowHint,
    canReset: !(ply === 0 && attempt.kind === 'idle'),
    boardProps: {
      fen,
      orientation: heroColor,
      turnColor: (game.turn() === 'w' ? 'white' : 'black') as Color,
      dests: locked ? NO_DESTS : dests,
      lastMove,
      check: game.inCheck(),
      viewOnly: locked,
      onMove,
      syncKey,
    },
  };
}
