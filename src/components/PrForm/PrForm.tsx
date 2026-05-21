import { useMemo, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Loader } from "@/components/Loader/Loader";
import {
  CUSTOM_EXERCISE,
  PRESET_EXERCISES,
} from "@/constants/exercises";
import type { PrInput, PrRecord } from "@/types/pr";
import styles from "./PrForm.module.css";

type Props = {
  initial?: PrRecord;
  onSubmit: (data: PrInput) => Promise<void>;
  onCancel: () => void;
};

const defaultDate = () => new Date().toISOString().slice(0, 10);

function resolveExerciseSelection(exercise: string | undefined) {
  if (!exercise) {
    return { preset: "", custom: "" };
  }
  if ((PRESET_EXERCISES as readonly string[]).includes(exercise)) {
    return { preset: exercise, custom: "" };
  }
  return { preset: CUSTOM_EXERCISE, custom: exercise };
}

export function PrForm({ initial, onSubmit, onCancel }: Props) {
  const { t } = useTranslation();
  const initialExercise = useMemo(
    () => resolveExerciseSelection(initial?.exercise),
    [initial?.exercise]
  );

  const [presetExercise, setPresetExercise] = useState(
    initialExercise.preset
  );
  const [customExercise, setCustomExercise] = useState(
    initialExercise.custom
  );
  const [weightKg, setWeightKg] = useState(
    initial?.weightKg?.toString() ?? ""
  );
  const [reps, setReps] = useState(initial?.reps?.toString() ?? "");
  const [date, setDate] = useState(initial?.date ?? defaultDate());
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCustom = presetExercise === CUSTOM_EXERCISE;

  function resolvedExercise(): string {
    if (isCustom) return customExercise.trim();
    return presetExercise;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const exercise = resolvedExercise();
    const weight = parseFloat(weightKg);
    const repCount = parseInt(reps, 10);

    if (!exercise || isNaN(weight) || isNaN(repCount)) {
      setError(t("errors.generic"));
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        exercise,
        weightKg: weight,
        reps: repCount,
        date,
        notes: notes.trim() || undefined,
      });
    } catch {
      setError(t("errors.generic"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>
        {initial ? t("pr.edit") : t("pr.add")}
      </h2>

      <div className="form-group">
        <label className="label" htmlFor="exercise-preset">
          {t("pr.exercise")}
        </label>
        <select
          id="exercise-preset"
          value={presetExercise}
          onChange={(e) => setPresetExercise(e.target.value)}
          required={!isCustom}
        >
          <option value="" disabled>
            {t("pr.selectExercise")}
          </option>
          {PRESET_EXERCISES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
          <option value={CUSTOM_EXERCISE}>{t("pr.customExercise")}</option>
        </select>
      </div>

      {isCustom && (
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
    </form>
  );
}
