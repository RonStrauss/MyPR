import { EXERCISE_GROUPS } from "@/lib/statistics";
import { FEATURES } from "@/config/features";
import type { PrRecord } from "@/types/pr";

export type VisibilityFilter = "all" | "public" | "private";

export type PrFiltersState = {
  groupId: string;
  exercise: string;
  dateFrom: string;
  dateTo: string;
  onlyHighest: boolean;
  visibility: VisibilityFilter;
  withCommentsOnly: boolean;
};

export const DEFAULT_PR_FILTERS: PrFiltersState = {
  groupId: "",
  exercise: "",
  dateFrom: "",
  dateTo: "",
  onlyHighest: false,
  visibility: "all",
  withCommentsOnly: false,
};

export function hasActiveFilters(filters: PrFiltersState): boolean {
  return countActiveFilters(filters) > 0;
}

export function countActiveFilters(filters: PrFiltersState): number {
  let count = 0;
  if (filters.groupId !== "") count++;
  if (filters.exercise !== "") count++;
  if (filters.dateFrom !== "") count++;
  if (filters.dateTo !== "") count++;
  if (filters.onlyHighest) count++;
  if (FEATURES.visibility && filters.visibility !== "all") count++;
  if (filters.withCommentsOnly) count++;
  return count;
}

function groupExercises(groupId: string): string[] | null {
  if (!groupId) return null;
  return EXERCISE_GROUPS.find((g) => g.id === groupId)?.exercises ?? null;
}

export function applyPrFilters(
  records: PrRecord[],
  filters: PrFiltersState,
  bestPrIds: Set<string>
): PrRecord[] {
  const groupList = groupExercises(filters.groupId);

  return records.filter((record) => {
    if (groupList && !groupList.includes(record.exercise)) return false;
    if (filters.exercise && record.exercise !== filters.exercise) return false;
    if (filters.dateFrom && record.date < filters.dateFrom) return false;
    if (filters.dateTo && record.date > filters.dateTo) return false;
    if (filters.onlyHighest && !bestPrIds.has(record.id)) return false;
    if (FEATURES.visibility) {
      if (filters.visibility === "public" && !record.isPublic) return false;
      if (filters.visibility === "private" && record.isPublic) return false;
    }
    if (filters.withCommentsOnly && !record.notes?.trim()) return false;
    return true;
  });
}
