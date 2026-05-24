import { X } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  TRAINING_PERCENTAGES,
  weightAtPercent,
} from "@/lib/weightPercentages";
import styles from "./PercentageCalculator.module.css";

type Props = {
  exercise: string;
  baseWeightKg: number;
  onClose: () => void;
};

export function PercentageCalculator({ exercise, baseWeightKg, onClose }: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div
        className={styles.sheet}
        role="dialog"
        aria-labelledby="pct-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <h2 id="pct-title" className={styles.title}>
              {t("pr.percentagesTitle")}
            </h2>
            <p className={styles.subtitle}>
              {exercise} · {baseWeightKg} {t("units.kg")}
            </p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={t("pr.cancel")}
          >
            <X size={20} />
          </button>
        </header>
        <div className={styles.grid}>
          {TRAINING_PERCENTAGES.map((percent) => (
            <div key={percent} className={styles.cell}>
              <span className={styles.percentLabel}>{percent}%</span>
              <span className={styles.percentValue}>
                {weightAtPercent(baseWeightKg, percent)}
                <span className={styles.percentUnit}>{t("units.kg")}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
