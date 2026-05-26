import { describe, expect, it } from "vitest";
import {
  bestWeightForExercise,
  buildBestWeightMap,
  comparePrRecords,
  pickBestRecord,
} from "./bestPr";
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

describe("buildBestWeightMap", () => {
  it("maps each exercise to its best logged weight", () => {
    const map = buildBestWeightMap([
      record({ exercise: "Deadlift", weightKg: 150, reps: 1 }),
      record({
        exercise: "Back Squat",
        weightKg: 100,
        reps: 5,
        id: "2",
      }),
      record({
        exercise: "Back Squat",
        weightKg: 90,
        reps: 3,
        id: "3",
      }),
    ]);
    expect(map.get("Deadlift")).toBe(150);
    expect(map.get("Back Squat")).toBe(100);
  });
});

describe("bestWeightForExercise", () => {
  it("returns null when exercise has no records", () => {
    expect(bestWeightForExercise([], "Back Squat")).toBeNull();
  });

  it("returns heaviest logged weight, not an estimate", () => {
    const records = [
      record({ exercise: "Back Squat", weightKg: 100, reps: 5 }),
      record({ exercise: "Back Squat", weightKg: 110, reps: 1, id: "2" }),
    ];
    expect(bestWeightForExercise(records, "Back Squat")).toBe(110);
  });
});
