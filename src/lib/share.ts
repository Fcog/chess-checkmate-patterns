import { exercises, type Exercise } from './exercises';

/**
 * Short, neutral code for an exercise's share link. Exercise ids name the pattern
 * ("back-rank-3"), which would spoil the blind practice, so links use a hash instead.
 * Stable as long as the exercise id doesn't change.
 */
export function shareCode(exerciseId: string): string {
  // 32-bit FNV-1a.
  let hash = 0x811c9dc5;
  for (let i = 0; i < exerciseId.length; i++) {
    hash ^= exerciseId.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36).padStart(7, '0').slice(-5);
}

export function exerciseByCode(code: string): Exercise | undefined {
  return exercises.find((ex) => shareCode(ex.id) === code);
}
