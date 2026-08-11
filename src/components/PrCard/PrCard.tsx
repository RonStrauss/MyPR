import { Globe, Percent, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FEATURES } from "@/config/features";
import type { PrRecord } from "@/types/pr";
import styles from "./PrCard.module.css";

type Props = {
  record: PrRecord;
  isBestPr: boolean;
  onEdit: (record: PrRecord) => void;
  onDelete: (record: PrRecord) => void;
  onCalculator: (record: PrRecord) => void;
};

export function PrCard({ record, isBestPr, onEdit, onDelete, onCalculator }: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "he" ? "he-IL" : "en-US";
  const formattedDate = new Date(record.date).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <article className={`card ${styles.card}`} data-testid="pr-card">
      <div className={styles.body}>
        <div className={styles.top}>
          <h3 className={styles.exercise}>{record.exercise}</h3>
          <div className={styles.badges}>
            {FEATURES.visibility && record.isPublic && (
              <span className={styles.publicBadge} title={t("pr.publicBadge")}>
                <Globe size={12} />
              </span>
            )}
            {isBestPr && <span className={styles.badge}>PR</span>}
          </div>
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
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={`btn btn-secondary ${styles.actionBtn}`}
          onClick={() => onCalculator(record)}
          aria-label={t("pr.percentages")}
        >
          <Percent size={14} />
          {t("pr.percentages")}
        </button>
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
