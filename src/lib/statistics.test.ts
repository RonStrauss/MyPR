import { describe, expect, it } from "vitest";
import {
  EXERCISE_GROUPS,
  computeExerciseCoverage,
  computeGroupStats,
  computeOverview,
  getImprovement,
  getProgressSeries,
} from "./statistics";
import { PRESET_EXERCISES } from "@/constants/exercises";
import type { PrRecord } from "@/types/pr";

function record(
  overrides: Partial<PrRecord> & Pick<PrRecord, "exercise" | "weightKg" | "reps">
): PrRecord {
  return {
    id: "1",
    date: "2024-01-01",
    createdAt: 0,
    isPublic: false,
    ...overrides,
  };
}

describe("getProgressSeries", () => {
  it("sorts by date ascending", () => {
    const series = getProgressSeries(
      [
        record({ exercise: "Deadlift", weightKg: 120, reps: 1, date: "2024-03-01" }),
        record({
          exercise: "Deadlift",
          weightKg: 100,
          reps: 5,
          date: "2024-01-01",
          id: "2",
        }),
      ],
      "Deadlift"
    );
    expect(series).toHaveLength(2);
    expect(series[0].date).toBe("2024-01-01");
    expect(series[1].date).toBe("2024-03-01");
  });
});

describe("computeGroupStats", () => {
  it("returns empty stats when no records in group", () => {
    const stats = computeGroupStats([], {
      id: "squats",
      labelKey: "stats.groups.squats",
      exercises: ["Back Squat"],
    });
    expect(stats.prCount).toBe(0);
    expect(stats.best).toBeNull();
  });

  it("reports the heaviest logged lift as group best", () => {
    const deadliftGroup = EXERCISE_GROUPS.find((g) => g.id === "deadlifts")!;
    const stats = computeGroupStats(
      [
        record({ exercise: "Deadlift", weightKg: 120, reps: 5, id: "a" }),
        record({ exercise: "Deadlift", weightKg: 140, reps: 3, id: "b" }),
      ],
      deadliftGroup
    );
    expect(stats.best).toEqual({
      exercise: "Deadlift",
      weightKg: 140,
      reps: 3,
    });
  });
});

describe("getImprovement", () => {
  it("computes delta between first and last point", () => {
    const imp = getImprovement([
      { date: "2024-01-01", weightKg: 100, reps: 1 },
      { date: "2024-06-01", weightKg: 110, reps: 1 },
    ]);
    expect(imp).toEqual({ delta: 10, percent: 10 });
  });
});

describe("computeExerciseCoverage", () => {
  it("returns percent of preset exercises logged", () => {
    const coverage = computeExerciseCoverage([
      record({ exercise: "Back Squat", weightKg: 100, reps: 1 }),
      record({ exercise: "Deadlift", weightKg: 120, reps: 1, id: "2" }),
    ]);
    expect(coverage.loggedPresets).toBe(2);
    expect(coverage.total).toBe(PRESET_EXERCISES.length);
    expect(coverage.percent).toBe(Math.round((2 / PRESET_EXERCISES.length) * 100));
  });
});

describe("computeOverview", () => {
  it("counts unique exercises", () => {
    const overview = computeOverview([
      record({ exercise: "Deadlift", weightKg: 100, reps: 1 }),
      record({ exercise: "Back Squat", weightKg: 80, reps: 3, id: "2" }),
    ]);
    expect(overview.exerciseCount).toBe(2);
    expect(overview.totalPrs).toBe(2);
  });
});
