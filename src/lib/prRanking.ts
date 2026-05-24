import { estimateOneRm } from "@/lib/oneRm";
import type { PrRecord } from "@/types/pr";

function recordScore(record: PrRecord): number {
  return estimateOneRm(record.weightKg, record.reps);
}

/** IDs of records that are the current best (est. 1RM) for their exercise */
export function getBestPrIds(records: PrRecord[]): Set<string> {
  const bestByExercise = new Map<
    string,
    { id: string; score: number; date: string }
  >();

  for (const record of records) {
    const score = recordScore(record);
    const current = bestByExercise.get(record.exercise);
    if (
      !current ||
      score > current.score ||
      (score === current.score && record.date > current.date)
    ) {
      bestByExercise.set(record.exercise, {
        id: record.id,
        score,
        date: record.date,
      });
    }
  }

  return new Set([...bestByExercise.values()].map((b) => b.id));
}
