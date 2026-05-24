import { Dumbbell } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { CelebrationOverlay } from "@/components/CelebrationOverlay/CelebrationOverlay";
import { Loader } from "@/components/Loader/Loader";
import { PercentageCalculator } from "@/components/PercentageCalculator/PercentageCalculator";
import { PrCard } from "@/components/PrCard/PrCard";
import { PrForm } from "@/components/PrForm/PrForm";
import { useAuth } from "@/contexts/AuthContext";
import { usePrs } from "@/hooks/usePrs";
import { pickCelebrationMessage } from "@/lib/celebration";
import { getBestPrIds } from "@/lib/prRanking";
import { deletePr, updatePr } from "@/services/prService";
import type { PrInput, PrRecord } from "@/types/pr";
import styles from "./Home.module.css";

export function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { records, loading, error } = usePrs(user?.uid);
  const navigate = useNavigate();
  const location = useLocation();
  const [editing, setEditing] = useState<PrRecord | null>(null);
  const [calculatorRecord, setCalculatorRecord] = useState<PrRecord | null>(
    null
  );
  const [celebrationMsg, setCelebrationMsg] = useState<string | null>(null);

  const bestPrIds = useMemo(() => getBestPrIds(records), [records]);

  useEffect(() => {
    const state = location.state as { celebrate?: boolean } | null;
    if (!state?.celebrate) return;
    const msgs = t("celebration.messages", { returnObjects: true });
    if (Array.isArray(msgs)) {
      setCelebrationMsg(pickCelebrationMessage(msgs as string[]));
    }
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate, t]);

  async function handleDelete(record: PrRecord) {
    if (!user || !confirm(t("pr.confirmDelete"))) return;
    await deletePr(user.uid, record.id);
  }

  async function handleEditSubmit(data: PrInput) {
    if (!user || !editing) return;
    await updatePr(user.uid, editing.id, data);
    setEditing(null);
  }

  if (editing) {
    return (
      <PrForm
        initial={editing}
        onSubmit={handleEditSubmit}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div>
      {celebrationMsg && (
        <CelebrationOverlay
          message={celebrationMsg}
          onDone={() => setCelebrationMsg(null)}
        />
      )}
      {calculatorRecord && (
        <PercentageCalculator
          exercise={calculatorRecord.exercise}
          baseWeightKg={calculatorRecord.weightKg}
          onClose={() => setCalculatorRecord(null)}
        />
      )}

      <h1 className={styles.title}>{t("pr.title")}</h1>

      {records.length > 0 && (
        <div className={styles.statsBar}>
          <div className={styles.statBox}>
            <div className={styles.statBoxValue}>{records.length}</div>
            <div className={styles.statBoxLabel}>{t("nav.records")}</div>
          </div>
        </div>
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

      <div className={styles.list}>
        {records.map((record, index) => (
          <div
            key={record.id}
            className="list-item-enter"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <PrCard
              record={record}
              isBestPr={bestPrIds.has(record.id)}
              onEdit={setEditing}
              onDelete={handleDelete}
              onCalculator={setCalculatorRecord}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
