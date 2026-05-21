import { Dumbbell } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Loader } from "@/components/Loader/Loader";
import { PrCard } from "@/components/PrCard/PrCard";
import { PrForm } from "@/components/PrForm/PrForm";
import { useAuth } from "@/contexts/AuthContext";
import { usePrs } from "@/hooks/usePrs";
import { addPr, deletePr, updatePr } from "@/services/prService";
import type { PrInput, PrRecord } from "@/types/pr";
import styles from "./Home.module.css";

export function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { records, loading, error } = usePrs(user?.uid);
  const navigate = useNavigate();
  const [editing, setEditing] = useState<PrRecord | null>(null);

  const totalWeight = records.reduce((sum, r) => sum + r.weightKg, 0);

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
      <h1 className={styles.title}>{t("pr.title")}</h1>

      {records.length > 0 && (
        <div className={styles.statsBar}>
          <div className={styles.statBox}>
            <div className={styles.statBoxValue}>{records.length}</div>
            <div className={styles.statBoxLabel}>{t("nav.records")}</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statBoxValue}>
              {Math.round(totalWeight)}
            </div>
            <div className={styles.statBoxLabel}>{t("units.kg")}</div>
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
              onEdit={setEditing}
              onDelete={handleDelete}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AddPrPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(data: PrInput) {
    if (!user) return;
    await addPr(user.uid, data);
    navigate("/");
  }

  return (
    <PrForm onSubmit={handleSubmit} onCancel={() => navigate("/")} />
  );
}
