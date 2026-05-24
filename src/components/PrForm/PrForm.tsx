import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Loader } from "@/components/Loader/Loader";
import {
  isValidBaseWeightKg,
  TRAINING_PERCENTAGES,
  weightAtPercent,
} from "@/lib/weightPercentages";
import {
  validatePrInput,
  type ValidationErrorCode,
} from "@/lib/validation";
import { PrValidationError } from "@/services/prService";
import type { PrInput, PrRecord } from "@/types/pr";
import styles from "./PrForm.module.css";

type Props = {
  initial?: PrRecord;
  lockedExercise?: string;
  allowCustomExercise?: boolean;
  title?: string;
  onSubmit: (data: PrInput) => Promise<void>;
  onCancel: () => void;
};

const defaultDate = () => new Date().toISOString().slice(0, 10);

const ERROR_I18N: Record<ValidationErrorCode, string> = {
  exerciseRequired: "errors.exerciseRequired",
  exerciseTooLong: "errors.exerciseTooLong",
  weightNegative: "errors.weightNegative",
  weightInvalid: "errors.weightInvalid",
  repsInvalid: "errors.repsInvalid",
  dateInvalid: "errors.dateInvalid",
  dateYearOutOfRange: "errors.dateYearOutOfRange",
  notesTooLong: "errors.notesTooLong",
  notesContainsHtml: "errors.notesContainsHtml",
};

export function PrForm({
  initial,
  lockedExercise,
  allowCustomExercise,
  title,
  onSubmit,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  const [customExercise, setCustomExercise] = useState(initial?.exercise ?? "");
  const [weightKg, setWeightKg] = useState(
    initial?.weightKg?.toString() ?? ""
  );
  const [reps, setReps] = useState(initial?.reps?.toString() ?? "");
  const [date, setDate] = useState(initial?.date ?? defaultDate());
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exerciseName = lockedExercise ?? customExercise.trim();
  const heading =
    title ?? (initial ? t("pr.edit") : lockedExercise ?? t("pr.add"));

  const baseWeight = parseFloat(weightKg);
  const showPercentages = isValidBaseWeightKg(baseWeight);

  function resolveErrorMessage(code: ValidationErrorCode): string {
    return t(ERROR_I18N[code]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const weight = parseFloat(weightKg);
    const repCount = parseInt(reps, 10);

    const result = validatePrInput({
      exercise: exerciseName,
      weightKg: weight,
      reps: repCount,
      date,
      notes: notes.trim() || undefined,
    });

    if (!result.ok) {
      setError(resolveErrorMessage(result.code));
      return;
    }

    setSaving(true);
    try {
      await onSubmit(result.value);
    } catch (err) {
      if (err instanceof PrValidationError) {
        setError(resolveErrorMessage(err.code));
      } else {
        setError(t("errors.generic"));
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>{heading}</h2>

      {lockedExercise && (
        <p className={styles.exerciseLabel}>{lockedExercise}</p>
      )}

      {allowCustomExercise && (
        <div className="form-group">
          <label className="label" htmlFor="exercise-custom">
            {t("pr.customExerciseName")}
          </label>
          <input
            id="exercise-custom"
            value={customExercise}
            onChange={(e) => setCustomExercise(e.target.value)}
            placeholder={t("pr.customExercisePlaceholder")}
            required
          />
        </div>
      )}

      {initial && !lockedExercise && !allowCustomExercise && (
        <div className="form-group">
          <label className="label" htmlFor="exercise-edit">
            {t("pr.exercise")}
          </label>
          <input
            id="exercise-edit"
            value={customExercise}
            onChange={(e) => setCustomExercise(e.target.value)}
            required
          />
        </div>
      )}

      <div className={styles.row}>
        <div className="form-group">
          <label className="label" htmlFor="weight">
            {t("pr.weight")}
          </label>
          <input
            id="weight"
            type="number"
            min="0"
            step="0.5"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="label" htmlFor="reps">
            {t("pr.reps")}
          </label>
          <input
            id="reps"
            type="number"
            min="1"
            step="1"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="label" htmlFor="date">
          {t("pr.date")}
        </label>
        <input
          id="date"
          type="date"
          min="1900-01-01"
          max="2999-12-31"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label className="label" htmlFor="notes">
          {t("pr.notes")}
        </label>
        <textarea
          id="notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className={styles.actions}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={saving}
        >
          {t("pr.cancel")}
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? t("common.saving") : t("pr.save")}
        </button>
      </div>

      {saving && <Loader inline label={t("common.saving")} />}

      {showPercentages && (
        <section className={styles.percentages} aria-label={t("pr.percentagesTitle")}>
          <h3 className={styles.percentagesTitle}>{t("pr.percentagesTitle")}</h3>
          <div className={styles.percentGrid}>
            {TRAINING_PERCENTAGES.map((percent) => (
              <div key={percent} className={styles.percentCell}>
                <span className={styles.percentLabel}>{percent}%</span>
                <span className={styles.percentValue}>
                  {weightAtPercent(baseWeight, percent)}
                  <span className={styles.percentUnit}>{t("units.kg")}</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </form>
  );
}
