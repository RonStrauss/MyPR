import { describe, expect, it } from "vitest";
import { getBestPrIds } from "./prRanking";
import type { PrRecord } from "@/types/pr";

function record(
  overrides: Partial<PrRecord> & Pick<PrRecord, "id" | "exercise" | "weightKg" | "reps">
): PrRecord {
  return {
    date: "2024-01-01",
    createdAt: 0,
    isPublic: false,
    ...overrides,
  };
}

describe("getBestPrIds", () => {
  it("returns only the best record per exercise", () => {
    const ids = getBestPrIds([
      record({ id: "a", exercise: "Deadlift", weightKg: 100, reps: 5 }),
      record({ id: "b", exercise: "Deadlift", weightKg: 120, reps: 1 }),
      record({ id: "c", exercise: "Back Squat", weightKg: 80, reps: 3 }),
    ]);
    expect(ids.has("b")).toBe(true);
    expect(ids.has("a")).toBe(false);
    expect(ids.has("c")).toBe(true);
    expect(ids.size).toBe(2);
  });
});
