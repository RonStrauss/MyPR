import { Dumbbell } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { CelebrationOverlay } from "@/components/CelebrationOverlay/CelebrationOverlay";
import { DeletePrConfirmModal } from "@/components/DeletePrConfirmModal/DeletePrConfirmModal";
import { Loader } from "@/components/Loader/Loader";
import { PercentageCalculator } from "@/components/PercentageCalculator/PercentageCalculator";
import { PrCard } from "@/components/PrCard/PrCard";
import { PrFilters } from "@/components/PrFilters/PrFilters";
import { PrForm } from "@/components/PrForm/PrForm";
import { useAuth } from "@/contexts/AuthContext";
import { useModal } from "@/contexts/ModalContext";
import { usePrs } from "@/hooks/usePrs";
import { pickCelebrationMessage } from "@/lib/celebration";
import {
  applyPrFilters,
  DEFAULT_PR_FILTERS,
  hasActiveFilters,
  type PrFiltersState,
} from "@/lib/prFilters";
import type { HomePageState } from "@/lib/navigation";
import { getCelebrationsEnabled } from "@/lib/preferences";
import { getBestPrIds } from "@/lib/prRanking";
import { getExercisesWithData } from "@/lib/statistics";
import { deletePr, updatePr } from "@/services/prService";
import type { PrInput, PrRecord } from "@/types/pr";
import styles from "./Home.module.css";

export function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { openModal } = useModal();
  const { records, loading, error } = usePrs(user?.uid);
  const navigate = useNavigate();
  const location = useLocation();
  const [editing, setEditing] = useState<PrRecord | null>(null);
  const [celebrationMsg, setCelebrationMsg] = useState<string | null>(null);
  const [filters, setFilters] = useState<PrFiltersState>(DEFAULT_PR_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const bestPrIds = useMemo(() => getBestPrIds(records), [records]);
  const exerciseOptions = useMemo(() => getExercisesWithData(records), [records]);
  const filteredRecords = useMemo(
    () => applyPrFilters(records, filters, bestPrIds),
    [records, filters, bestPrIds]
  );
  const filtersActive = hasActiveFilters(filters);

  useEffect(() => {
    const state = location.state as HomePageState | null;
    if (!state) return;

    if (state.filters) {
      setFilters(state.filters);
      setFiltersOpen(state.filtersOpen === true);
    }

    if (state.celebrate) {
      if (getCelebrationsEnabled()) {
        const msgs = t("celebration.messages", { returnObjects: true });
        if (Array.isArray(msgs)) {
          setCelebrationMsg(pickCelebrationMessage(msgs as string[]));
        }
      }
    }

    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate, t]);

  function openCalculator(record: PrRecord) {
    openModal(
      <PercentageCalculator exercise={record.exercise} baseWeightKg={record.weightKg} />
    );
  }

  function handleDelete(record: PrRecord) {
    if (!user) return;
    openModal(
      <DeletePrConfirmModal
        exercise={record.exercise}
        weightKg={record.weightKg}
        reps={record.reps}
        onConfirm={() => deletePr(user.uid, record.id)}
      />
    );
  }

  async function handleEditSubmit(data: PrInput) {
    if (!user || !editing) return;
    await updatePr(user.uid, editing.id, data);
    setEditing(null);
  }

  return (
    <div className={`${styles.layout} ${editing ? styles.layoutEditing : ""}`}>
      <div className={styles.primary}>
        {celebrationMsg && (
          <CelebrationOverlay
            message={celebrationMsg}
            onDone={() => setCelebrationMsg(null)}
          />
        )}

        <h1 className={styles.title}>{t("pr.title")}</h1>

        {records.length > 0 && (
          <>
            <div className={styles.statsBar}>
              <div className={styles.statBox}>
                <div className={styles.statBoxValue}>
                  {filtersActive ? filteredRecords.length : records.length}
                </div>
                <div className={styles.statBoxLabel}>
                  {filtersActive ? t("filters.shown") : t("nav.records")}
                </div>
              </div>
              {filtersActive && (
                <div className={styles.statBox}>
                  <div className={styles.statBoxValue}>{records.length}</div>
                  <div className={styles.statBoxLabel}>{t("nav.records")}</div>
                </div>
              )}
            </div>
            <PrFilters
              filters={filters}
              exercises={exerciseOptions}
              resultCount={filteredRecords.length}
              totalCount={records.length}
              open={filtersOpen}
              onOpenChange={setFiltersOpen}
              onChange={setFilters}
            />
          </>
        )}

        {loading && <Loader label={t("common.loading")} />}

        {error && !loading && (
          <p className="error-text" style={{ marginBottom: "1rem" }}>
            {error}
          </p>
        )}

        {!loading && !error && records.length === 0 && (
          <div className={`${styles.empty} fade-in`}>
            <Dumbbell className={styles.emptyIcon} />
            <p>{t("pr.empty")}</p>
            <button
              type="button"
              className="btn btn-primary"
              style={{ marginTop: "1rem" }}
              onClick={() => navigate("/add")}
            >
              {t("pr.add")}
            </button>
          </div>
        )}

        {!loading && !error && records.length > 0 && filteredRecords.length === 0 && (
          <div className={styles.empty}>
            <p>{t("filters.noResults")}</p>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ marginTop: "0.75rem" }}
              onClick={() => setFilters({ ...DEFAULT_PR_FILTERS })}
            >
              {t("filters.clear")}
            </button>
          </div>
        )}

        <div className={styles.list}>
          {filteredRecords.map((record, index) => (
            <div
              key={record.id}
              className={`list-item-enter ${styles.listItem}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <PrCard
                record={record}
                isBestPr={bestPrIds.has(record.id)}
                onEdit={setEditing}
                onDelete={handleDelete}
                onCalculator={() => openCalculator(record)}
              />
            </div>
          ))}
        </div>
      </div>

      {editing && (
        <aside className={styles.editPanel} data-testid="edit-panel">
          <PrForm
            initial={editing}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditing(null)}
          />
        </aside>
      )}
    </div>
  );
}
