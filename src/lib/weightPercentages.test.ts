import { describe, expect, it } from "vitest";
import { isValidBaseWeightKg, weightAtPercent } from "./weightPercentages";

describe("weightAtPercent", () => {
  it("rounds to nearest 0.5 kg", () => {
    expect(weightAtPercent(100, 70)).toBe(70);
    expect(weightAtPercent(100, 55)).toBe(55);
  });
});

describe("isValidBaseWeightKg", () => {
  it("accepts positive finite numbers", () => {
    expect(isValidBaseWeightKg(80)).toBe(true);
  });

  it("rejects zero and invalid", () => {
    expect(isValidBaseWeightKg(0)).toBe(false);
    expect(isValidBaseWeightKg(NaN)).toBe(false);
  });
});
