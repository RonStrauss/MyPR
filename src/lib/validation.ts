import type { PrInput } from "@/types/pr";

export const MIN_YEAR = 1900;
export const MAX_YEAR = 2999;
export const MAX_NOTES_LENGTH = 1000;
export const MAX_EXERCISE_LENGTH = 120;

export type ValidationErrorCode =
  | "exerciseRequired"
  | "exerciseTooLong"
  | "weightNegative"
  | "weightInvalid"
  | "repsInvalid"
  | "dateInvalid"
  | "dateYearOutOfRange"
  | "notesTooLong"
  | "notesContainsHtml";

export type ValidationResult =
  | { ok: true; value: PrInput }
  | { ok: false; code: ValidationErrorCode };

/** Strip HTML tags and angle brackets; used before persisting notes */
export function sanitizeNotes(notes: string | undefined): string | undefined {
  if (!notes?.trim()) return undefined;
  const stripped = notes
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .trim();
  if (!stripped) return undefined;
  return stripped.slice(0, MAX_NOTES_LENGTH);
}

export function containsHtml(text: string): boolean {
  return /<[^>]*>/.test(text) || /[<>]/.test(text);
}

export function isValidDateString(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const [y, m, d] = date.split("-").map(Number);
  if (y < MIN_YEAR || y > MAX_YEAR) return false;
  const parsed = new Date(Date.UTC(y, m - 1, d));
  return (
    parsed.getUTCFullYear() === y &&
    parsed.getUTCMonth() === m - 1 &&
    parsed.getUTCDate() === d
  );
}

export function validatePrInput(raw: {
  exercise: string;
  weightKg: number;
  reps: number;
  date: string;
  notes?: string;
}): ValidationResult {
  const exercise = raw.exercise.trim();
  if (!exercise) return { ok: false, code: "exerciseRequired" };
  if (exercise.length > MAX_EXERCISE_LENGTH) {
    return { ok: false, code: "exerciseTooLong" };
  }

  if (!Number.isFinite(raw.weightKg) || raw.weightKg < 0) {
    return { ok: false, code: raw.weightKg < 0 ? "weightNegative" : "weightInvalid" };
  }

  if (!Number.isInteger(raw.reps) || raw.reps < 1) {
    return { ok: false, code: "repsInvalid" };
  }

  if (!isValidDateString(raw.date)) {
    return { ok: false, code: "dateInvalid" };
  }
  const year = Number(raw.date.slice(0, 4));
  if (year < MIN_YEAR || year > MAX_YEAR) {
    return { ok: false, code: "dateYearOutOfRange" };
  }

  const notes = sanitizeNotes(raw.notes);
  if (notes && notes.length > MAX_NOTES_LENGTH) {
    return { ok: false, code: "notesTooLong" };
  }

  return {
    ok: true,
    value: {
      exercise,
      weightKg: raw.weightKg,
      reps: raw.reps,
      date: raw.date,
      notes,
    },
  };
}
