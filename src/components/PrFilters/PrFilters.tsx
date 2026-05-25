import { Filter, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { EXERCISE_GROUPS } from "@/lib/statistics";
import {
  DEFAULT_PR_FILTERS,
  countActiveFilters,
  hasActiveFilters,
  type PrFiltersState,
} from "@/lib/prFilters";
import styles from "./PrFilters.module.css";

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
  const { t } = useTranslation();
  const active = hasActiveFilters(filters);
  const activeCount = countActiveFilters(filters);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  function patch(partial: Partial<PrFiltersState>) {
    const next = { ...filters, ...partial };
    if (partial.groupId !== undefined && partial.groupId !== filters.groupId) {
      next.exercise = "";
    }
    onChange(next);
  }

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
        <div className={styles.panel} role="dialog" aria-label={t("filters.title")}>
          <div className={styles.panelHeader}>
            <span className={styles.resultCount}>
              {t("filters.showing", { count: resultCount, total: totalCount })}
            </span>
            {active && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => onChange({ ...DEFAULT_PR_FILTERS })}
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
            <select
              id="filter-group"
              value={filters.groupId}
              onChange={(e) => patch({ groupId: e.target.value })}
            >
              <option value="">{t("filters.allGroups")}</option>
              {EXERCISE_GROUPS.map((g) => (
                <option key={g.id} value={g.id}>
                  {t(g.labelKey)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className="label" htmlFor="filter-exercise">
              {t("filters.exercise")}
            </label>
            <select
              id="filter-exercise"
              value={filters.exercise}
              onChange={(e) => patch({ exercise: e.target.value })}
            >
              <option value="">{t("filters.allExercises")}</option>
              {exercises.map((ex) => (
                <option key={ex} value={ex}>
                  {ex}
                </option>
              ))}
            </select>
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

          <div className={styles.field}>
            <label className="label" htmlFor="filter-visibility">
              {t("filters.visibility")}
            </label>
            <select
              id="filter-visibility"
              value={filters.visibility}
              onChange={(e) =>
                patch({
                  visibility: e.target.value as PrFiltersState["visibility"],
                })
              }
            >
              <option value="all">{t("filters.visibilityAll")}</option>
              <option value="public">{t("filters.visibilityPublic")}</option>
              <option value="private">{t("filters.visibilityPrivate")}</option>
            </select>
          </div>

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
                onChange={(e) =>
                  patch({ withCommentsOnly: e.target.checked })
                }
              />
              <span>{t("filters.withComments")}</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
