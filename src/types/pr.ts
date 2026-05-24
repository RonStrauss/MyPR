export type PrRecord = {
  id: string;
  exercise: string;
  weightKg: number;
  reps: number;
  date: string;
  notes?: string;
  isPublic: boolean;
  createdAt: number;
};

export type PrInput = Omit<PrRecord, "id" | "createdAt">;
