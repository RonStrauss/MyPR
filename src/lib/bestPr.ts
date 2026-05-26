import type { PrRecord } from "@/types/pr";

/** Higher weight wins; tie-break by reps, then date, then createdAt. */
export function comparePrRecords(a: PrRecord, b: PrRecord): number {
  if (a.weightKg !== b.weightKg) return a.weightKg - b.weightKg;
  if (a.reps !== b.reps) return a.reps - b.reps;
  const dateCmp = a.date.localeCompare(b.date);
  if (dateCmp !== 0) return dateCmp;
  return a.createdAt - b.createdAt;
}

export function pickBestRecord(records: PrRecord[]): PrRecord | null {
  if (records.length === 0) return null;
  return records.reduce((best, r) =>
    comparePrRecords(r, best) > 0 ? r : best
  );
}

export type GroupBest = {
  exercise: string;
  weightKg: number;
  reps: number;
};

export function toGroupBest(record: PrRecord): GroupBest {
  return {
    exercise: record.exercise,
    weightKg: record.weightKg,
    reps: record.reps,
  };
}
