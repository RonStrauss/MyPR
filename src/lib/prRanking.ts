import { comparePrRecords } from "@/lib/bestPr";
import type { PrRecord } from "@/types/pr";

/** IDs of records that are the current best lift for their exercise */
export function getBestPrIds(records: PrRecord[]): Set<string> {
  const bestByExercise = new Map<string, PrRecord>();

  for (const record of records) {
    const current = bestByExercise.get(record.exercise);
    if (!current || comparePrRecords(record, current) > 0) {
      bestByExercise.set(record.exercise, record);
    }
  }

  return new Set([...bestByExercise.values()].map((b) => b.id));
}
