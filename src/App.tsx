import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import type { Key } from 'chessground/types';
import { Board } from './Board';
import { exercises, practicePatternIds } from './exercises';
import { families, mateIn, patterns } from './patterns';
import { formatLine, legalDests, loadSolved, saveSolved, shuffle } from './helpers';

type Section = 'patterns' | 'practice';

/** Stable identity so the board effect does not re-run on every render. */
const NO_DESTS = new Map<Key, Key[]>();
const REPLY_DELAY = 550;
const REVERT_DELAY = 600;
const REVEAL_STEP = 750;

type Attempt =
  | { kind: 'idle' }
  | { kind: 'progress'; hero: string; reply: string }
  | { kind: 'wrong'; san: string }
  | { kind: 'solved'; revealed: boolean };

export function App() {
  const [section, setSection] = useState<Section>('patterns');
  const [selectedPatternIds, setSelectedPatternIds] = useState<string[]>([]);
  const [revealPattern, setRevealPattern] = useState(false);

  const [index, setIndex] = useState(0);
  const [exerciseIndex, setExerciseIndex] = useState(0);

  const practicePatterns = useMemo(
    () => patterns.filter((p) => practicePatternIds.includes(p.id)),
    [],
  );

  const [shuffledExercises] = useState(() => shuffle(exercises));

  const filteredExercises = useMemo(
    () =>
      selectedPatternIds.length === 0
        ? shuffledExercises
        : shuffledExercises.filter((ex) => selectedPatternIds.includes(ex.patternId)),
    [selectedPatternIds, shuffledExercises],
  );

  const pattern = patterns[index];
  const exercise = filteredExercises[exerciseIndex] ?? filteredExercises[0];
  const exercisePattern = useMemo(
    () => (exercise ? patterns.find((p) => p.id === exercise.patternId) : undefined),
    [exercise],
  );

  const activePuzzle = section === 'patterns' ? pattern : exercise;

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

  const loadPosition = useCallback(
    (nextFen: string) => {
      clearTimers();
      setFen(nextFen);
      setPly(0);
      setPlayed([]);
      setAttempt({ kind: 'idle' });
      setBusy(false);
      setLastMove(undefined);
      setShowHint(false);
      setRevealPattern(false);
      setSyncKey((k) => k + 1);
    },
    [clearTimers],
  );

  const restore = useCallback(
    (next: number) => {
      setIndex(next);
      loadPosition(patterns[next].fen);
    },
    [loadPosition],
  );

  const restoreExercise = useCallback(
    (next: number, list = filteredExercises) => {
      const target = list[next];
      setExerciseIndex(next);
      if (target) loadPosition(target.fen);
    },
    [filteredExercises, loadPosition],
  );

  const switchSection = useCallback(
    (nextSection: Section) => {
      setSection(nextSection);
      if (nextSection === 'patterns') {
        loadPosition(patterns[index].fen);
      } else {
        const target = filteredExercises[exerciseIndex] ?? filteredExercises[0];
        if (target) loadPosition(target.fen);
      }
    },
    [exerciseIndex, filteredExercises, index, loadPosition],
  );

  const togglePatternFilter = useCallback(
    (id: string) => {
      const nextIds = selectedPatternIds.includes(id)
        ? selectedPatternIds.filter((item) => item !== id)
        : [...selectedPatternIds, id];
      setSelectedPatternIds(nextIds);
      const nextList =
        nextIds.length === 0
          ? shuffledExercises
          : shuffledExercises.filter((ex) => nextIds.includes(ex.patternId));
      setExerciseIndex(0);
      if (nextList[0]) loadPosition(nextList[0].fen);
    },
    [loadPosition, selectedPatternIds, shuffledExercises],
  );

  const activeFen = activePuzzle ? activePuzzle.fen : pattern.fen;
  const game = useMemo(() => new Chess(fen), [fen]);
  const dests = useMemo(() => legalDests(game), [game]);
  const heroColor = useMemo(
    () => (new Chess(activeFen).turn() === 'w' ? 'white' : 'black'),
    [activeFen],
  );
  const defender = heroColor === 'white' ? 'Black' : 'White';
  const isDone = attempt.kind === 'solved';
  const locked = isDone || busy;

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
      if (locked || !activePuzzle) return;
      const chess = new Chess(fen);
      let san: string;
      try {
        san = chess.move({ from, to, promotion: 'q' }).san;
      } catch {
        setSyncKey((k) => k + 1);
        return;
      }

      const isFinalPly = ply + 1 >= activePuzzle.solution.length;
      const isExpectedMove =
        san === activePuzzle.solution[ply] || (isFinalPly && chess.isCheckmate());

      if (!isExpectedMove) {
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

      if (nextPly >= activePuzzle.solution.length) {
        setAttempt({ kind: 'solved', revealed: false });
        markSolved(activePuzzle.id);
        return;
      }

      // The defender's reply is played automatically on odd plies.
      const replySan = activePuzzle.solution[nextPly];
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
    [activePuzzle, clearTimers, fen, locked, markSolved, ply, schedule],
  );

  const reveal = useCallback(() => {
    if (!activePuzzle) return;
    clearTimers();
    setBusy(true);
    const cursor = new Chess(fen);
    const remaining = activePuzzle.solution.slice(ply);
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
  }, [activePuzzle, clearTimers, fen, ply, schedule]);

  const moves = activePuzzle ? mateIn(activePuzzle) : 1;
  const heroMovesLeft = moves - Math.ceil(ply / 2);

  const feedback = () => {
    switch (attempt.kind) {
      case 'wrong':
        return <p className="feedback wrong">{attempt.san} does not force mate. Try again.</p>;
      case 'progress':
        return (
          <p className="feedback right">
            {attempt.hero} — {defender} plays {attempt.reply}. {heroMovesLeft} move
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

  const solvedExercisesCount = useMemo(
    () => filteredExercises.filter((ex) => solved.includes(ex.id)).length,
    [filteredExercises, solved],
  );

  return (
    <div className="app">
      <header>
        <div className="header-left">
          <h1>Checkmate patterns</h1>
          <nav className="tabs" aria-label="Sections">
            <button
              className={`tab${section === 'patterns' ? ' active' : ''}`}
              onClick={() => switchSection('patterns')}
              aria-current={section === 'patterns' ? 'page' : undefined}
            >
              Patterns
            </button>
            <button
              className={`tab${section === 'practice' ? ' active' : ''}`}
              onClick={() => switchSection('practice')}
              aria-current={section === 'practice' ? 'page' : undefined}
            >
              Practice
            </button>
          </nav>
        </div>
        <span className="progress">
          {section === 'patterns'
            ? `${solved.filter((id) => patterns.some((p) => p.id === id)).length} / ${patterns.length} solved`
            : `${solvedExercisesCount} / ${filteredExercises.length} solved`}
        </span>
      </header>

      {section === 'patterns' ? (
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
      ) : (
        <div className="layout">
          <nav className="patterns" aria-label="Checkmate filters">
            <section>
              <h3>Mode</h3>
              <button
                className={`pattern${selectedPatternIds.length === 0 ? ' active' : ''}`}
                onClick={() => {
                  setSelectedPatternIds([]);
                  setExerciseIndex(0);
                  if (shuffledExercises[0]) loadPosition(shuffledExercises[0].fen);
                }}
                aria-pressed={selectedPatternIds.length === 0}
              >
                <span className="check" aria-hidden="true">
                  {selectedPatternIds.length === 0 ? '✓' : ''}
                </span>
                <span className="label">All patterns (blind)</span>
              </button>
            </section>
            <section>
              <h3>Checkmates</h3>
              {practicePatterns.map((p) => {
                const isSelected = selectedPatternIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    className={`pattern${isSelected ? ' active' : ''}`}
                    onClick={() => togglePatternFilter(p.id)}
                    aria-pressed={isSelected}
                  >
                    <span className="check" aria-hidden="true">
                      {isSelected ? '✓' : ''}
                    </span>
                    <span className="label">{p.name}</span>
                  </button>
                );
              })}
            </section>
          </nav>

          <main>
            {exercise ? (
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
            ) : (
              <div className="empty-state">
                <h2>No exercises yet</h2>
                <p>
                  Practice exercises will appear here. By default, the checkmate pattern will be
                  hidden so you have to find the right motif on your own.
                </p>
              </div>
            )}
            <div className="controls">
              <button
                onClick={() => restoreExercise(exerciseIndex)}
                disabled={!exercise || (ply === 0 && attempt.kind === 'idle')}
              >
                Reset
              </button>
              <button
                onClick={() => setRevealPattern((prev) => !prev)}
                disabled={!exercise || isDone}
              >
                {revealPattern || isDone ? 'Pattern revealed' : 'Reveal pattern'}
              </button>
              {exercise?.hint && (
                <button onClick={() => setShowHint(true)} disabled={showHint || isDone}>
                  Hint
                </button>
              )}
              <button onClick={reveal} disabled={!exercise || isDone || busy}>
                Show solution
              </button>
              <button
                onClick={() => restoreExercise((exerciseIndex + 1) % filteredExercises.length)}
                disabled={filteredExercises.length < 2}
              >
                Next exercise
              </button>
            </div>
          </main>

          <aside className="info">
            {exercise ? (
              <>
                <h2>
                  {revealPattern || isDone ? (
                    <>
                      {exercisePattern?.name ?? 'Exercise'}{' '}
                      <span className="badge">Mate in {moves}</span>
                    </>
                  ) : (
                    <>
                      Exercise {exerciseIndex + 1} <span className="badge">Mate in {moves}</span>
                    </>
                  )}
                </h2>
                <div aria-live="polite">{feedback()}</div>
                {played.length > 0 && <p className="line">{formatLine(exercise.fen, played)}</p>}
                {(showHint || isDone) && exercise.hint && <p className="hint">{exercise.hint}</p>}
                {isDone && exercisePattern && <p className="idea">{exercisePattern.idea}</p>}
              </>
            ) : (
              <>
                <h2>
                  Pattern: <span className="badge">Hidden by default</span>
                </h2>
                <p className="feedback">No exercises match the current filter.</p>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
