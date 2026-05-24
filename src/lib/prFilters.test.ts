import { describe, expect, it } from "vitest";
import { applyPrFilters, DEFAULT_PR_FILTERS } from "./prFilters";
import type { PrRecord } from "@/types/pr";

function record(
  overrides: Partial<PrRecord> & Pick<PrRecord, "id" | "exercise">
): PrRecord {
  return {
    weightKg: 100,
    reps: 5,
    date: "2024-06-01",
    createdAt: 0,
    isPublic: false,
    ...overrides,
  };
}

describe("applyPrFilters", () => {
  const records = [
    record({ id: "a", exercise: "Back Squat", date: "2024-01-01", notes: "felt good" }),
    record({ id: "b", exercise: "Deadlift", date: "2024-06-01", isPublic: true }),
    record({ id: "c", exercise: "Back Squat", date: "2024-03-01", weightKg: 120, reps: 1 }),
  ];
  const bestIds = new Set(["c", "b"]);

  it("returns all when filters are default", () => {
    expect(applyPrFilters(records, DEFAULT_PR_FILTERS, bestIds)).toHaveLength(3);
  });

  it("filters by exercise group", () => {
    const result = applyPrFilters(
      records,
      { ...DEFAULT_PR_FILTERS, groupId: "squats" },
      bestIds
    );
    expect(result.every((r) => r.exercise.includes("Squat"))).toBe(true);
    expect(result).toHaveLength(2);
  });

  it("filters only highest", () => {
    const result = applyPrFilters(
      records,
      { ...DEFAULT_PR_FILTERS, onlyHighest: true },
      bestIds
    );
    expect(result.map((r) => r.id).sort()).toEqual(["b", "c"]);
  });

  it("filters public and with comments", () => {
    const result = applyPrFilters(
      records,
      {
        ...DEFAULT_PR_FILTERS,
        visibility: "public",
        withCommentsOnly: true,
      },
      bestIds
    );
    expect(result).toHaveLength(0);

    const withNotes = applyPrFilters(
      records,
      { ...DEFAULT_PR_FILTERS, withCommentsOnly: true },
      bestIds
    );
    expect(withNotes).toHaveLength(1);
    expect(withNotes[0].id).toBe("a");
  });
});
