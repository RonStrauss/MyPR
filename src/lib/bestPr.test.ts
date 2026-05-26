import { describe, expect, it } from "vitest";
import { comparePrRecords, pickBestRecord } from "./bestPr";
import type { PrRecord } from "@/types/pr";

function record(
  overrides: Partial<PrRecord> & Pick<PrRecord, "weightKg" | "reps">
): PrRecord {
  return {
    id: "1",
    exercise: "Deadlift",
    date: "2024-01-01",
    createdAt: 0,
    isPublic: false,
    ...overrides,
  };
}

describe("comparePrRecords", () => {
  it("prefers heavier weight", () => {
    expect(
      comparePrRecords(
        record({ weightKg: 120, reps: 1 }),
        record({ weightKg: 100, reps: 10, id: "2" })
      )
    ).toBeGreaterThan(0);
  });

  it("prefers more reps at the same weight", () => {
    expect(
      comparePrRecords(
        record({ weightKg: 100, reps: 5 }),
        record({ weightKg: 100, reps: 3, id: "2" })
      )
    ).toBeGreaterThan(0);
  });
});

describe("pickBestRecord", () => {
  it("returns the top lift in a list", () => {
    const best = pickBestRecord([
      record({ id: "a", weightKg: 100, reps: 5 }),
      record({ id: "b", weightKg: 140, reps: 3 }),
      record({ id: "c", weightKg: 120, reps: 1 }),
    ]);
    expect(best?.id).toBe("b");
  });
});
