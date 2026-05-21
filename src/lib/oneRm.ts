import type { PrRecord } from "@/types/pr";

/** Epley formula — estimated 1RM from weight × reps */
export function estimateOneRm(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg < 0) return 0;
  if (reps === 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

/** Best estimated 1RM for an exercise across all logged PRs */
export function bestOneRmForExercise(
  records: PrRecord[],
  exercise: string
): number | null {
  const matches = records.filter((r) => r.exercise === exercise);
  if (matches.length === 0) return null;
  const best = Math.max(...matches.map((r) => estimateOneRm(r.weightKg, r.reps)));
  return Math.round(best * 10) / 10;
}

export function buildOneRmMap(records: PrRecord[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const record of records) {
    const current = map.get(record.exercise);
    const estimated = estimateOneRm(record.weightKg, record.reps);
    if (current === undefined || estimated > current) {
      map.set(record.exercise, estimated);
    }
  }
  for (const [key, value] of map) {
    map.set(key, Math.round(value * 10) / 10);
  }
  return map;
}
