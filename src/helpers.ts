import type { Chess } from 'chess.js';
import type { Key } from 'chessground/types';

const STORAGE_KEY = 'checkmate-patterns:solved';

export function loadSolved(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function saveSolved(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Private browsing or a full quota — progress just won't persist.
  }
}

export function legalDests(chess: Chess): Map<Key, Key[]> {
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
export function formatLine(fen: string, played: string[]): string {
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

export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
