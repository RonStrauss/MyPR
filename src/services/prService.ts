import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { FEATURES } from "@/config/features";
import { db } from "@/lib/firebase";
import { validatePrInput, type ValidationErrorCode } from "@/lib/validation";
import type { PrInput, PrRecord } from "@/types/pr";

export class PrValidationError extends Error {
  code: ValidationErrorCode;

  constructor(code: ValidationErrorCode) {
    super(code);
    this.name = "PrValidationError";
    this.code = code;
  }
}

function assertValidInput(input: PrInput): PrInput {
  const gated: PrInput = FEATURES.visibility ? input : { ...input, isPublic: false };
  const result = validatePrInput(gated);
  if (!result.ok) throw new PrValidationError(result.code);
  return result.value;
}

/** Firestore rejects undefined field values on write */
function toFirestoreFields(input: PrInput) {
  const data: Record<string, string | number | boolean> = {
    exercise: input.exercise,
    weightKg: input.weightKg,
    reps: input.reps,
    date: input.date,
    isPublic: input.isPublic === true,
  };
  if (input.notes) data.notes = input.notes;
  return data;
}

function prsCollection(userId: string) {
  return collection(db, "users", userId, "prs");
}

export function subscribeToPrs(
  userId: string,
  onData: (records: PrRecord[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(prsCollection(userId), orderBy("date", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const records: PrRecord[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          exercise: data.exercise as string,
          weightKg: data.weightKg as number,
          reps: data.reps as number,
          date: data.date as string,
          notes: (data.notes as string | undefined) ?? undefined,
          isPublic: data.isPublic === true,
          createdAt: (data.createdAt as { seconds?: number })?.seconds
            ? (data.createdAt as { seconds: number }).seconds * 1000
            : Date.now(),
        };
      });
      onData(records);
    },
    (err) => onError?.(err)
  );
}

export async function addPr(userId: string, input: PrInput) {
  const valid = assertValidInput(input);
  await addDoc(prsCollection(userId), {
    ...toFirestoreFields(valid),
    createdAt: serverTimestamp(),
  });
}

export async function updatePr(userId: string, id: string, input: PrInput) {
  const valid = assertValidInput(input);
  await updateDoc(doc(db, "users", userId, "prs", id), toFirestoreFields(valid));
}

export async function deletePr(userId: string, id: string) {
  await deleteDoc(doc(db, "users", userId, "prs", id));
}
