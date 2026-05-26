/**
 * Drop-in replacement for prService when VITE_E2E_MOCK=true.
 */
import type { PrInput, PrRecord } from "@/types/pr";
import type { ValidationErrorCode } from "@/lib/validation";
import { validatePrInput } from "@/lib/validation";
import {
  subscribe,
  addRecord,
  updateRecord,
  deleteRecord,
} from "./store";

export class PrValidationError extends Error {
  code: ValidationErrorCode;

  constructor(code: ValidationErrorCode) {
    super(code);
    this.name = "PrValidationError";
    this.code = code;
  }
}

function assertValidInput(input: PrInput): PrInput {
  const result = validatePrInput(input);
  if (!result.ok) throw new PrValidationError(result.code);
  return result.value;
}

export function subscribeToPrs(
  _userId: string,
  onData: (records: PrRecord[]) => void,
  _onError?: (error: Error) => void
): () => void {
  return subscribe(onData);
}

export async function addPr(_userId: string, input: PrInput) {
  addRecord(assertValidInput(input));
}

export async function updatePr(_userId: string, id: string, input: PrInput) {
  updateRecord(id, assertValidInput(input));
}

export async function deletePr(_userId: string, id: string) {
  deleteRecord(id);
}
