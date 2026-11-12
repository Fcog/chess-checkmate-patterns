/**
 * The day's puzzle (research R4, FR-007, FR-008): a random catalogue code not yet sent in the
 * current cycle; when every code has been sent, a new cycle starts with the whole catalogue.
 */
export type DayRow = { cycle: number; puzzle_code: string };

export function choosePuzzle({
  catalogueCodes,
  history,
  random = Math.random,
}: {
  catalogueCodes: string[];
  history: DayRow[];
  random?: () => number;
}): { cycle: number; code: string } {
  if (catalogueCodes.length === 0) throw new Error('The puzzle catalogue is empty');
  const cycle = history.reduce((max, row) => Math.max(max, row.cycle), 1);
  // Codes no longer in the catalogue simply don't count (a removed puzzle is never chosen).
  const used = new Set(history.filter((row) => row.cycle === cycle).map((row) => row.puzzle_code));
  const available = catalogueCodes.filter((code) => !used.has(code));
  if (available.length === 0) {
    return { cycle: cycle + 1, code: catalogueCodes[Math.floor(random() * catalogueCodes.length)] };
  }
  return { cycle, code: available[Math.floor(random() * available.length)] };
}
