import { DEFAULT_PR_FILTERS, type PrFiltersState } from "@/lib/prFilters";

export type HomePageState = {
  celebrate?: boolean;
  filters?: PrFiltersState;
  filtersOpen?: boolean;
};

export function filtersForGroupList(groupId: string): PrFiltersState {
  return {
    ...DEFAULT_PR_FILTERS,
    groupId,
  };
}

export function filtersForGroupBest(
  groupId: string,
  exercise: string
): PrFiltersState {
  return {
    ...DEFAULT_PR_FILTERS,
    groupId,
    exercise,
    onlyHighest: true,
  };
}

export function homeNavState(filters: PrFiltersState): HomePageState {
  return { filters, filtersOpen: false };
}
