import { useTranslation } from "react-i18next";
import { TRAINING_PERCENTAGES, weightAtPercent } from "@/lib/weightPercentages";
import styles from "./PercentageCalculator.module.css";

type Props = {
  exercise: string;
  baseWeightKg: number;
};

/** Percentage grid content — render inside GlobalModal */
export function PercentageCalculator({ baseWeightKg }: Props) {
  const { t } = useTranslation();

  return (
    <div className={styles.content}>
      <header className={styles.header}>
        <h2 className={styles.title}>{t("pr.percentagesTitle")}</h2>
        <p className={styles.subtitle}>
          {baseWeightKg} {t("units.kg")}
        </p>
      </header>
      <div className={styles.grid}>
        {TRAINING_PERCENTAGES.map((percent) => (
          <div key={percent} className={styles.cell}>
            <span className={styles.percentLabel}>{percent}%</span>
            <span className={styles.percentValue}>
              {weightAtPercent(baseWeightKg, percent)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
