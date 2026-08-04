import { useEffect, useRef } from 'react';
import { Chessground } from 'chessground';
import type { Api } from 'chessground/api';
import type { Color, Key } from 'chessground/types';

export type Props = {
  fen: string;
  orientation: Color;
  turnColor: Color;
  dests: Map<Key, Key[]>;
  lastMove?: Key[];
  check: boolean;
  viewOnly: boolean;
  onMove: (from: Key, to: Key) => void;
  /** Bump to force a re-sync even when `fen` is unchanged (e.g. reverting a wrong move). */
  syncKey: number;
};

export function Board(props: Props) {
  const el = useRef<HTMLDivElement>(null);
  const api = useRef<Api | null>(null);
  // Kept in a ref so the handler chessground holds always calls the latest closure,
  // and so the mount effect can build its config from the current props.
  const latest = useRef(props);
  latest.current = props;

  useEffect(() => {
    if (!el.current) return;
    const initial = latest.current;
    api.current = Chessground(el.current, {
      // Mount straight into the puzzle position — without this, chessground starts
      // from the default opening setup and animates out of it on first paint.
      fen: initial.fen,
      orientation: initial.orientation,
      turnColor: initial.turnColor,
      lastMove: initial.lastMove,
      check: initial.check,
      viewOnly: initial.viewOnly,
      coordinates: true,
      animation: { enabled: true, duration: 200 },
      highlight: { lastMove: true, check: true },
      draggable: { showGhost: true },
      movable: {
        free: false,
        showDests: true,
        color: initial.turnColor,
        dests: initial.dests,
        events: { after: (from, to) => latest.current.onMove(from, to) },
      },
    });
    return () => {
      api.current?.destroy();
      api.current = null;
    };
  }, []);

  useEffect(() => {
    api.current?.set({
      fen: props.fen,
      orientation: props.orientation,
      turnColor: props.turnColor,
      lastMove: props.lastMove,
      check: props.check,
      viewOnly: props.viewOnly,
      movable: { free: false, color: props.turnColor, dests: props.dests },
    });
  }, [
    props.fen,
    props.orientation,
    props.turnColor,
    props.lastMove,
    props.check,
    props.viewOnly,
    props.dests,
    props.syncKey,
  ]);

  return <div className="board" ref={el} />;
}
