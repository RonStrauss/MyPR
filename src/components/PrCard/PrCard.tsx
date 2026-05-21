import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { PrRecord } from "@/types/pr";
import styles from "./PrCard.module.css";

type Props = {
  record: PrRecord;
  onEdit: (record: PrRecord) => void;
  onDelete: (record: PrRecord) => void;
};

export function PrCard({ record, onEdit, onDelete }: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "he" ? "he-IL" : "en-US";
  const formattedDate = new Date(record.date).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <article className={`card ${styles.card}`}>
      <div className={styles.top}>
        <h3 className={styles.exercise}>{record.exercise}</h3>
        <span className={styles.badge}>PR</span>
      </div>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{record.weightKg}</span>
          <span className={styles.statLabel}>{t("units.kg")}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>×{record.reps}</span>
          <span className={styles.statLabel}>{t("units.reps")}</span>
        </div>
      </div>
      <p className={styles.meta}>{formattedDate}</p>
      {record.notes && <p className={styles.notes}>{record.notes}</p>}
      <div className={styles.actions}>
        <button
          type="button"
          className={`btn btn-secondary ${styles.actionBtn}`}
          onClick={() => onEdit(record)}
        >
          <Pencil size={14} />
          {t("pr.edit")}
        </button>
        <button
          type="button"
          className={`btn btn-danger ${styles.actionBtn}`}
          onClick={() => onDelete(record)}
        >
          <Trash2 size={14} />
          {t("pr.delete")}
        </button>
      </div>
    </article>
  );
}
