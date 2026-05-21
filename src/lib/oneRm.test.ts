import { describe, expect, it } from "vitest";
import { bestOneRmForExercise, buildOneRmMap, estimateOneRm } from "./oneRm";
import type { PrRecord } from "@/types/pr";

function record(
  overrides: Partial<PrRecord> & Pick<PrRecord, "exercise" | "weightKg" | "reps">
): PrRecord {
  return {
    id: "1",
    date: "2024-01-01",
    createdAt: 0,
    ...overrides,
  };
}

describe("estimateOneRm", () => {
  it("returns weight for 1 rep", () => {
    expect(estimateOneRm(100, 1)).toBe(100);
  });

  it("estimates higher for more reps", () => {
    expect(estimateOneRm(100, 5)).toBeGreaterThan(100);
  });
});

describe("bestOneRmForExercise", () => {
  it("returns null when no records", () => {
    expect(bestOneRmForExercise([], "Back Squat")).toBeNull();
  });

  it("picks best estimated 1RM across sets", () => {
    const records = [
      record({ exercise: "Back Squat", weightKg: 100, reps: 5 }),
      record({ exercise: "Back Squat", weightKg: 110, reps: 1, id: "2" }),
    ];
    expect(bestOneRmForExercise(records, "Back Squat")).toBe(116.7);
  });
});

describe("buildOneRmMap", () => {
  it("maps each exercise to best estimate", () => {
    const map = buildOneRmMap([
      record({ exercise: "Deadlift", weightKg: 150, reps: 1 }),
      record({ exercise: "Back Squat", weightKg: 90, reps: 3, id: "2" }),
    ]);
    expect(map.get("Deadlift")).toBe(150);
    expect(map.get("Back Squat")).toBeGreaterThan(90);
  });
});
