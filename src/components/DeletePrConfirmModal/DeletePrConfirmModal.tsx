import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useModal } from "@/contexts/ModalContext";
import styles from "./DeletePrConfirmModal.module.css";

type Props = {
  exercise: string;
  weightKg: number;
  reps: number;
  onConfirm: () => Promise<void>;
};

export function DeletePrConfirmModal({
  exercise,
  weightKg,
  reps,
  onConfirm,
}: Props) {
  const { t } = useTranslation();
  const { closeModal } = useModal();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm();
      closeModal();
    } catch {
      setError(t("errors.generic"));
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>{t("pr.delete")}</h2>
      <p className={styles.message}>{t("pr.confirmDelete")}</p>
      <p className={styles.exercise}>{exercise}</p>
      <p className={styles.details}>
        {weightKg} {t("units.kg")} × {reps} {t("units.reps")}
      </p>
      {error && <p className="error-text">{error}</p>}
      <div className={styles.actions}>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={closeModal}
          disabled={submitting}
        >
          {t("pr.cancel")}
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => void handleConfirm()}
          disabled={submitting}
        >
          {submitting ? t("common.saving") : t("pr.delete")}
        </button>
      </div>
    </div>
  );
}
