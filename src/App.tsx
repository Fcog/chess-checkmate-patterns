import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import type { Key } from 'chessground/types';
import { Board } from './Board';
import { exercises, practicePatternIds } from './exercises';
import { mateIn, patterns } from './patterns';
import { Header, type Section } from './Header';
import { legalDests, loadSolved, saveSolved, shuffle } from './helpers';
import { MenuToggle } from './MenuToggle';
import { PatternControls } from './PatternControls';
import { PatternInfo } from './PatternInfo';
import { PatternList } from './PatternList';
import { PracticeControls } from './PracticeControls';
import { PracticeFilters } from './PracticeFilters';
import { PracticeInfo } from './PracticeInfo';

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

  const selectAllPatterns = useCallback(() => {
    setSelectedPatternIds([]);
    setExerciseIndex(0);
    if (shuffledExercises[0]) loadPosition(shuffledExercises[0].fen);
  }, [loadPosition, shuffledExercises]);

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
      <Header
        section={section}
        progress={
          section === 'patterns'
            ? `${solved.filter((id) => patterns.some((p) => p.id === id)).length} / ${patterns.length} solved`
            : `${solvedExercisesCount} / ${filteredExercises.length} solved`
        }
        onSwitchSection={switchSection}
      />

      {section === 'patterns' ? (
        <div className="layout">
          <MenuToggle label="patterns">
            <PatternList activeIndex={index} solved={solved} onSelect={restore} />
          </MenuToggle>

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
            <PatternControls
              canReset={!(ply === 0 && attempt.kind === 'idle')}
              canGoNext={patterns.length >= 2}
              isDone={isDone}
              busy={busy}
              showHint={showHint}
              onReset={() => restore(index)}
              onShowHint={() => setShowHint(true)}
              onShowSolution={reveal}
              onNext={() => restore((index + 1) % patterns.length)}
            />
          </main>

          <PatternInfo
            pattern={pattern}
            moves={moves}
            played={played}
            feedback={feedback()}
            showHint={showHint}
            isDone={isDone}
          />
        </div>
      ) : (
        <div className="layout">
          <MenuToggle label="filters">
            <PracticeFilters
              patterns={practicePatterns}
              selectedIds={selectedPatternIds}
              onSelectAll={selectAllPatterns}
              onToggle={togglePatternFilter}
            />
          </MenuToggle>

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
            <PracticeControls
              hasExercise={!!exercise}
              hasHint={!!exercise?.hint}
              canReset={!(ply === 0 && attempt.kind === 'idle')}
              canGoNext={filteredExercises.length >= 2}
              isDone={isDone}
              busy={busy}
              showHint={showHint}
              revealPattern={revealPattern}
              onReset={() => restoreExercise(exerciseIndex)}
              onTogglePattern={() => setRevealPattern((prev) => !prev)}
              onShowHint={() => setShowHint(true)}
              onShowSolution={reveal}
              onNext={() => restoreExercise((exerciseIndex + 1) % filteredExercises.length)}
            />
          </main>

          <PracticeInfo
            exercise={exercise}
            exercisePattern={exercisePattern}
            exerciseIndex={exerciseIndex}
            moves={moves}
            played={played}
            feedback={feedback()}
            showHint={showHint}
            isDone={isDone}
            revealPattern={revealPattern}
          />
        </div>
      )}
    </div>
  );
}
