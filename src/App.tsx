import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import type { Key } from 'chessground/types';
import { Board } from './Board';
import { families, mateIn, patterns } from './patterns';

const STORAGE_KEY = 'checkmate-patterns:solved';
/** Stable identity so the board effect does not re-run on every render. */
const NO_DESTS = new Map<Key, Key[]>();
const REPLY_DELAY = 550;
const REVERT_DELAY = 600;
const REVEAL_STEP = 750;

function loadSolved(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function saveSolved(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Private browsing or a full quota — progress just won't persist.
  }
}

function legalDests(chess: Chess): Map<Key, Key[]> {
  const dests = new Map<Key, Key[]>();
  for (const move of chess.moves({ verbose: true })) {
    const from = move.from as Key;
    const to = move.to as Key;
    const existing = dests.get(from);
    if (existing) existing.push(to);
    else dests.set(from, [to]);
  }
  return dests;
}

/** "1. Qg8+ Rxg8 2. Nf7#", numbered from wherever the puzzle starts. */
function formatLine(fen: string, played: string[]): string {
  const [, turn, , , , fullmove] = fen.split(' ');
  let number = Number(fullmove) || 1;
  let whiteToMove = turn === 'w';
  const parts: string[] = [];
  for (const san of played) {
    if (whiteToMove) parts.push(`${number}. ${san}`);
    else parts.push(parts.length ? san : `${number}... ${san}`);
    if (!whiteToMove) number += 1;
    whiteToMove = !whiteToMove;
  }
  return parts.join(' ');
}

type Attempt =
  | { kind: 'idle' }
  | { kind: 'progress'; hero: string; reply: string }
  | { kind: 'wrong'; san: string }
  | { kind: 'solved'; revealed: boolean };

export function App() {
  const [index, setIndex] = useState(0);
  const pattern = patterns[index];

  const [fen, setFen] = useState(pattern.fen);
  const [ply, setPly] = useState(0);
  const [played, setPlayed] = useState<string[]>([]);
  const [attempt, setAttempt] = useState<Attempt>({ kind: 'idle' });
  const [busy, setBusy] = useState(false);
  const [lastMove, setLastMove] = useState<Key[] | undefined>(undefined);
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState<string[]>(loadSolved);
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

  const game = useMemo(() => new Chess(fen), [fen]);
  const dests = useMemo(() => legalDests(game), [game]);
  const heroColor = useMemo(
    () => (new Chess(pattern.fen).turn() === 'w' ? 'white' : 'black'),
    [pattern.fen],
  );
  const defender = heroColor === 'white' ? 'Black' : 'White';
  const isDone = attempt.kind === 'solved';
  const locked = isDone || busy;

  const restore = useCallback(
    (next: number) => {
      clearTimers();
      setIndex(next);
      setFen(patterns[next].fen);
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

  const markSolved = useCallback((id: string) => {
    setSolved((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      saveSolved(next);
      return next;
    });
  }, []);

  const onMove = useCallback(
    (from: Key, to: Key) => {
      if (locked) return;
      const chess = new Chess(fen);
      let san: string;
      try {
        san = chess.move({ from, to, promotion: 'q' }).san;
      } catch {
        setSyncKey((k) => k + 1);
        return;
      }

      if (san !== pattern.solution[ply]) {
        setAttempt({ kind: 'wrong', san });
        // Let the move sit on the board for a beat, then snap back to the position.
        clearTimers();
        schedule(REVERT_DELAY, () => setSyncKey((k) => k + 1));
        return;
      }

      const nextPly = ply + 1;
      setPlayed((prev) => [...prev, san]);
      setFen(chess.fen());
      setPly(nextPly);
      setLastMove([from, to]);

      if (nextPly >= pattern.solution.length) {
        setAttempt({ kind: 'solved', revealed: false });
        markSolved(pattern.id);
        return;
      }

      // The defender's reply is forced, so play it for them.
      const replySan = pattern.solution[nextPly];
      setBusy(true);
      schedule(REPLY_DELAY, () => {
        const after = new Chess(chess.fen());
        const reply = after.move(replySan);
        setPlayed((prev) => [...prev, reply.san]);
        setFen(after.fen());
        setPly(nextPly + 1);
        setLastMove([reply.from as Key, reply.to as Key]);
        setAttempt({ kind: 'progress', hero: san, reply: reply.san });
        setBusy(false);
      });
    },
    [clearTimers, fen, locked, markSolved, pattern.id, pattern.solution, ply, schedule],
  );

  const reveal = useCallback(() => {
    clearTimers();
    setBusy(true);
    const cursor = new Chess(fen);
    const remaining = pattern.solution.slice(ply);
    remaining.forEach((san, i) => {
      schedule(i * REVEAL_STEP, () => {
        const move = cursor.move(san);
        setPlayed((prev) => [...prev, move.san]);
        setFen(cursor.fen());
        setPly(ply + i + 1);
        setLastMove([move.from as Key, move.to as Key]);
        if (i === remaining.length - 1) {
          setBusy(false);
          setAttempt({ kind: 'solved', revealed: true });
        }
      });
    });
  }, [clearTimers, fen, pattern.solution, ply, schedule]);

  const moves = mateIn(pattern);
  const heroMovesLeft = moves - Math.ceil(ply / 2);

  const feedback = () => {
    switch (attempt.kind) {
      case 'wrong':
        return <p className="feedback wrong">{attempt.san} does not force mate. Try again.</p>;
      case 'progress':
        return (
          <p className="feedback right">
            {attempt.hero} — {defender} has only {attempt.reply}. {heroMovesLeft} move
            {heroMovesLeft === 1 ? '' : 's'} to go.
          </p>
        );
      case 'solved':
        return (
          <p className="feedback right">
            {attempt.revealed ? 'That is the line.' : 'Checkmate. Well done.'}
          </p>
        );
      default:
        return (
          <p className="feedback">
            Find the mate in {moves} for {heroColor}.
          </p>
        );
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Checkmate patterns</h1>
        <span className="progress">
          {solved.length} / {patterns.length} solved
        </span>
      </header>

      <div className="layout">
        <nav className="patterns">
          {families.map((family) => (
            <section key={family}>
              <h3>{family}</h3>
              {patterns.map((p, i) =>
                p.family !== family ? null : (
                  <button
                    key={p.id}
                    className={`pattern${i === index ? ' active' : ''}`}
                    onClick={() => restore(i)}
                    aria-current={i === index}
                  >
                    <span className="check" aria-hidden="true">
                      {solved.includes(p.id) ? '✓' : ''}
                    </span>
                    <span className="label">{p.name}</span>
                    <span className="badge">M{mateIn(p)}</span>
                  </button>
                ),
              )}
            </section>
          ))}
        </nav>

        <main>
          <Board
            fen={fen}
            orientation={heroColor}
            turnColor={game.turn() === 'w' ? 'white' : 'black'}
            dests={locked ? NO_DESTS : dests}
            lastMove={lastMove}
            check={game.inCheck()}
            viewOnly={locked}
            onMove={onMove}
            syncKey={syncKey}
          />
          <div className="controls">
            <button onClick={() => restore(index)} disabled={ply === 0 && attempt.kind === 'idle'}>
              Reset
            </button>
            <button onClick={() => setShowHint(true)} disabled={showHint || isDone}>
              Hint
            </button>
            <button onClick={reveal} disabled={isDone || busy}>
              Show solution
            </button>
            <button
              onClick={() => restore((index + 1) % patterns.length)}
              disabled={patterns.length < 2}
            >
              Next pattern
            </button>
          </div>
        </main>

        <aside className="info">
          <h2>
            {pattern.name} <span className="badge">Mate in {moves}</span>
          </h2>
          <div aria-live="polite">{feedback()}</div>
          {played.length > 0 && <p className="line">{formatLine(pattern.fen, played)}</p>}
          {(showHint || isDone) && <p className="hint">{pattern.hint}</p>}
          {isDone && <p className="idea">{pattern.idea}</p>}
        </aside>
      </div>
    </div>
  );
}
