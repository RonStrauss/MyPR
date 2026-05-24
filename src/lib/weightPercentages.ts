/** Common training percentages relative to entered working weight / PR */
export const TRAINING_PERCENTAGES = [30, 40, 50, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105] as const;

export function weightAtPercent(baseKg: number, percent: number): number {
	const raw = (baseKg * percent) / 100;
	return Math.round(raw * 2) / 2;
}

export function isValidBaseWeightKg(value: number): boolean {
	return Number.isFinite(value) && value > 0;
}
