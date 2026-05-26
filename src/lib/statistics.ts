import { PRESET_EXERCISES } from "@/constants/exercises";
import { pickBestRecord, toGroupBest, type GroupBest } from "@/lib/bestPr";
import type { PrRecord } from "@/types/pr";

export type ProgressPoint = {
  date: string;
  weightKg: number;
  reps: number;
};

export type GroupStats = {
  id: string;
  labelKey: string;
  exercises: string[];
  avgWeightKg: number | null;
  prCount: number;
  best: GroupBest | null;
};

export const EXERCISE_GROUPS: { id: string; labelKey: string; exercises: string[] }[] =
  [
    {
      id: "squats",
      labelKey: "stats.groups.squats",
      exercises: ["Back Squat", "Front Squat", "Overhead Squat"],
    },
    {
      id: "deadlifts",
      labelKey: "stats.groups.deadlifts",
      exercises: ["Deadlift", "Sumo Deadlift"],
    },
    {
      id: "presses",
      labelKey: "stats.groups.presses",
      exercises: [
        "Bench Press",
        "Strict Press",
        "Push Press",
        "Push Jerk",
        "Split Jerk",
      ],
    },
    {
      id: "olympic",
      labelKey: "stats.groups.olympic",
      exercises: [
        "Clean",
        "Power Clean",
        "Snatch",
        "Power Snatch",
        "Thruster",
      ],
    },
    {
      id: "gymnastics",
      labelKey: "stats.groups.gymnastics",
      exercises: [
        "Pull-up",
        "Chest-to-Bar Pull-up",
        "Muscle-up",
        "Handstand Push-up",
        "Toes-to-Bar",
      ],
    },
    {
      id: "cardio",
      labelKey: "stats.groups.cardio",
      exercises: ["Row (cal)", "Bike (cal)", "Run"],
    },
  ];

export function getExercisesWithData(records: PrRecord[]): string[] {
  const fromRecords = [...new Set(records.map((r) => r.exercise))];
  const presets = PRESET_EXERCISES.filter((e) =>
    records.some((r) => r.exercise === e)
  );
  const custom = fromRecords
    .filter((e) => !(PRESET_EXERCISES as readonly string[]).includes(e))
    .sort((a, b) => a.localeCompare(b));
  const presetOrdered = PRESET_EXERCISES.filter((e) => presets.includes(e));
  return [...presetOrdered, ...custom];
}

/** Share of preset exercises with at least one logged PR */
export function computeExerciseCoverage(records: PrRecord[]) {
  const logged = new Set(records.map((r) => r.exercise));
  const loggedPresets = PRESET_EXERCISES.filter((e) => logged.has(e)).length;
  const total = PRESET_EXERCISES.length;
  const percent =
    total > 0 ? Math.round((loggedPresets / total) * 100) : 0;
  return { loggedPresets, total, percent };
}

export function getProgressSeries(
  records: PrRecord[],
  exercise: string
): ProgressPoint[] {
  return records
    .filter((r) => r.exercise === exercise)
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt)
    .map((r) => ({
      date: r.date,
      weightKg: r.weightKg,
      reps: r.reps,
    }));
}

export function computeGroupStats(
  records: PrRecord[],
  group: (typeof EXERCISE_GROUPS)[number]
): GroupStats {
  const groupRecords = records.filter((r) =>
    group.exercises.includes(r.exercise)
  );
  if (groupRecords.length === 0) {
    return {
      id: group.id,
      labelKey: group.labelKey,
      exercises: group.exercises,
      avgWeightKg: null,
      prCount: 0,
      best: null,
    };
  }

  const avgWeightKg =
    Math.round(
      (groupRecords.reduce((s, r) => s + r.weightKg, 0) /
        groupRecords.length) *
        10
    ) / 10;

  const bestRecord = pickBestRecord(groupRecords);

  return {
    id: group.id,
    labelKey: group.labelKey,
    exercises: group.exercises,
    avgWeightKg,
    prCount: groupRecords.length,
    best: bestRecord ? toGroupBest(bestRecord) : null,
  };
}

export function computeOverview(records: PrRecord[]) {
  const exercises = new Set(records.map((r) => r.exercise));
  const totalVolume = records.reduce(
    (s, r) => s + r.weightKg * r.reps,
    0
  );

  const last30 = records.filter((r) => {
    const d = new Date(r.date);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return d >= cutoff;
  });

  return {
    totalPrs: records.length,
    exerciseCount: exercises.size,
    totalVolume: Math.round(totalVolume),
    prsLast30Days: last30.length,
  };
}

export function getImprovement(
  series: ProgressPoint[]
): { delta: number; percent: number } | null {
  if (series.length < 2) return null;
  const first = series[0].weightKg;
  const last = series[series.length - 1].weightKg;
  const delta = Math.round((last - first) * 10) / 10;
  const percent = first > 0 ? Math.round((delta / first) * 1000) / 10 : 0;
  return { delta, percent };
}
