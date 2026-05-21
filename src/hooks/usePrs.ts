import { useEffect, useState } from "react";
import { subscribeToPrs } from "@/services/prService";
import type { PrRecord } from "@/types/pr";

export function usePrs(userId: string | undefined) {
  const [records, setRecords] = useState<PrRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setRecords([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeToPrs(
      userId,
      (data) => {
        setRecords(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsub;
  }, [userId]);

  return { records, loading, error };
}
