import { Filter, X } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Select } from "@/components/Select/Select";
import { FEATURES } from "@/config/features";
import { EXERCISE_GROUPS } from "@/lib/statistics";
import {
  DEFAULT_PR_FILTERS,
  countActiveFilters,
  hasActiveFilters,
  uiFilters,
  type PrFiltersState,
} from "@/lib/prFilters";
import styles from "./PrFilters.module.css";

function isFilterSelectOpen(): boolean {
  return Boolean(document.querySelector('[role="listbox"][data-state="open"]'));
}

function isSelectLayerTarget(target: Element): boolean {
  return Boolean(
    target.closest(
      '[data-radix-popper-content-wrapper], [role="listbox"], [role="option"]'
    )
  );
}

type Props = {
  filters: PrFiltersState;
  exercises: string[];
  resultCount: number;
  totalCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (filters: PrFiltersState) => void;
};

export function PrFilters({
  filters,
  exercises,
  resultCount,
  totalCount,
  open,
  onOpenChange,
  onChange,
}: Props) {
  const { t, i18n } = useTranslation();
  const panelDir = i18n.dir();
  const safeFilters = uiFilters(filters);
  const active = hasActiveFilters(safeFilters);
  const activeCount = countActiveFilters(safeFilters);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    function updateMaxHeight() {
      const el = panelRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      const nav = document.querySelector('[data-testid="bottom-nav"]');
      const navTop = nav?.getBoundingClientRect().top ?? window.innerHeight;
      const max = Math.max(140, navTop - top - 8);
      el.style.maxHeight = `${max}px`;
    }

    updateMaxHeight();
    window.addEventListener("resize", updateMaxHeight);
    return () => window.removeEventListener("resize", updateMaxHeight);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onPointerDownOutside(e: PointerEvent) {
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (rootRef.current?.contains(target)) return;
      if (isSelectLayerTarget(target)) return;
      // Select is portaled; Radix closes it first — keep the filters panel open.
      if (isFilterSelectOpen()) return;
      onOpenChange(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (isFilterSelectOpen()) return;
      onOpenChange(false);
    }
    document.addEventListener("pointerdown", onPointerDownOutside, true);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDownOutside, true);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open, onOpenChange]);

  function patch(partial: Partial<PrFiltersState>) {
    const next = { ...safeFilters, ...partial };
    if (partial.groupId !== undefined && partial.groupId !== filters.groupId) {
      next.exercise = "";
    }
    onChange(next);
  }

  const groupOptions = useMemo(
    () => [
      { value: "", label: t("filters.allGroups") },
      ...EXERCISE_GROUPS.map((g) => ({
        value: g.id,
        label: t(g.labelKey),
      })),
    ],
    [t]
  );

  const exerciseOptions = useMemo(
    () => [
      { value: "", label: t("filters.allExercises") },
      ...exercises.map((ex) => ({ value: ex, label: ex })),
    ],
    [exercises, t]
  );

  const visibilityOptions = useMemo(
    () => [
      { value: "all", label: t("filters.visibilityAll") },
      { value: "public", label: t("filters.visibilityPublic") },
      { value: "private", label: t("filters.visibilityPrivate") },
    ],
    [t]
  );

  return (
    <div className={styles.wrap} ref={rootRef}>
      <button
        type="button"
        className={`${styles.toggleBtn} ${active ? styles.toggleBtnActive : ""}`}
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Filter size={16} />
        {t("filters.title")}
        {active && <span className={styles.badge}>{activeCount}</span>}
      </button>

      {open && (
        <div
          ref={panelRef}
          className={styles.panel}
          dir={panelDir}
          role="dialog"
          aria-label={t("filters.title")}
          data-testid="filters-panel"
        >
          <div className={styles.panelHeader}>
            <span className={styles.resultCount}>
              {t("filters.showing", { count: resultCount, total: totalCount })}
            </span>
            {active && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => onChange(uiFilters(DEFAULT_PR_FILTERS))}
              >
                <X size={14} />
                {t("filters.clear")}
              </button>
            )}
          </div>

          <div className={styles.field}>
            <label className="label" htmlFor="filter-group">
              {t("filters.group")}
            </label>
            <Select
              id="filter-group"
              value={filters.groupId}
              onValueChange={(groupId) => patch({ groupId })}
              options={groupOptions}
            />
          </div>

          <div className={styles.field}>
            <label className="label" htmlFor="filter-exercise">
              {t("filters.exercise")}
            </label>
            <Select
              id="filter-exercise"
              value={filters.exercise}
              onValueChange={(exercise) => patch({ exercise })}
              options={exerciseOptions}
            />
          </div>

          <div className={styles.dateRow}>
            <div className={styles.field}>
              <label className="label" htmlFor="filter-from">
                {t("filters.dateFrom")}
              </label>
              <input
                id="filter-from"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => patch({ dateFrom: e.target.value })}
              />
            </div>
            <div className={styles.field}>
              <label className="label" htmlFor="filter-to">
                {t("filters.dateTo")}
              </label>
              <input
                id="filter-to"
                type="date"
                value={filters.dateTo}
                onChange={(e) => patch({ dateTo: e.target.value })}
              />
            </div>
          </div>

          {FEATURES.visibility && (
            <div className={styles.field}>
              <label className="label" htmlFor="filter-visibility">
                {t("filters.visibility")}
              </label>
              <Select
                id="filter-visibility"
                value={filters.visibility}
                onValueChange={(visibility) =>
                  patch({
                    visibility: visibility as PrFiltersState["visibility"],
                  })
                }
                options={visibilityOptions}
              />
            </div>
          )}

          <div className={styles.checks}>
            <label className={styles.checkLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={filters.onlyHighest}
                onChange={(e) => patch({ onlyHighest: e.target.checked })}
              />
              <span>{t("filters.onlyHighest")}</span>
            </label>
            <label className={styles.checkLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={filters.withCommentsOnly}
                onChange={(e) => patch({ withCommentsOnly: e.target.checked })}
              />
              <span>{t("filters.withComments")}</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
