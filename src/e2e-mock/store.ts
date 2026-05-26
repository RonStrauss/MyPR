/**
 * In-memory store shared across mock auth and mock prService.
 * Only included in the bundle when VITE_E2E_MOCK=true.
 */
import type { PrRecord } from "@/types/pr";

export const MOCK_USER = {
  uid: "e2e-test-user",
  displayName: "E2E Tester",
  email: "e2e@test.local",
  photoURL: null,
};

let _records: PrRecord[] = [
  {
    id: "seed-1",
    exercise: "Back Squat",
    weightKg: 100,
    reps: 5,
    date: "2025-01-10",
    isPublic: false,
    createdAt: 1_704_844_800_000,
  },
  {
    id: "seed-2",
    exercise: "Deadlift",
    weightKg: 140,
    reps: 3,
    date: "2025-02-14",
    isPublic: true,
    createdAt: 1_707_868_800_000,
  },
];

let _nextId = 100;

type Listener = (records: PrRecord[]) => void;
const _listeners = new Set<Listener>();

function notify() {
  const copy = sortedRecords();
  _listeners.forEach((fn) => fn(copy));
}

function sortedRecords(): PrRecord[] {
  return [..._records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function subscribe(fn: Listener): () => void {
  _listeners.add(fn);
  fn(sortedRecords());
  return () => _listeners.delete(fn);
}

export function addRecord(record: Omit<PrRecord, "id" | "createdAt">) {
  const next: PrRecord = { ...record, id: String(++_nextId), createdAt: Date.now() };
  _records = [next, ..._records];
  notify();
}

export function updateRecord(id: string, data: Omit<PrRecord, "id" | "createdAt">) {
  _records = _records.map((r) => (r.id === id ? { ...r, ...data } : r));
  notify();
}

export function deleteRecord(id: string) {
  _records = _records.filter((r) => r.id !== id);
  notify();
}

/** Reset to seed data between tests (called via window.__e2eReset) */
export function reset() {
  _records = [
    {
      id: "seed-1",
      exercise: "Back Squat",
      weightKg: 100,
      reps: 5,
      date: "2025-01-10",
      isPublic: false,
      createdAt: 1_704_844_800_000,
    },
    {
      id: "seed-2",
      exercise: "Deadlift",
      weightKg: 140,
      reps: 3,
      date: "2025-02-14",
      isPublic: true,
      createdAt: 1_707_868_800_000,
    },
  ];
  _nextId = 100;
  notify();
}
