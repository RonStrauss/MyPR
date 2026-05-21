import { describe, expect, it } from "vitest";
import {
  containsHtml,
  isValidDateString,
  sanitizeNotes,
  validatePrInput,
} from "./validation";

describe("sanitizeNotes", () => {
  it("strips HTML tags", () => {
    expect(sanitizeNotes("hello <b>world</b>")).toBe("hello world");
  });

  it("returns undefined for empty input", () => {
    expect(sanitizeNotes("   ")).toBeUndefined();
  });
});

describe("containsHtml", () => {
  it("detects angle brackets", () => {
    expect(containsHtml("<script>")).toBe(true);
    expect(containsHtml("plain text")).toBe(false);
  });
});

describe("isValidDateString", () => {
  it("accepts valid dates in range", () => {
    expect(isValidDateString("2024-06-15")).toBe(true);
  });

  it("rejects invalid calendar dates", () => {
    expect(isValidDateString("2024-02-30")).toBe(false);
  });

  it("rejects years outside bounds", () => {
    expect(isValidDateString("1899-01-01")).toBe(false);
    expect(isValidDateString("3000-01-01")).toBe(false);
  });
});

describe("validatePrInput", () => {
  const valid = {
    exercise: "Back Squat",
    weightKg: 100,
    reps: 5,
    date: "2024-01-15",
  };

  it("accepts valid input and sanitizes notes", () => {
    const result = validatePrInput({
      ...valid,
      notes: "  felt <strong>good</strong>  ",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.notes).toBe("felt good");
    }
  });

  it("rejects negative weight", () => {
    const result = validatePrInput({ ...valid, weightKg: -1 });
    expect(result).toEqual({ ok: false, code: "weightNegative" });
  });

  it("rejects zero reps", () => {
    const result = validatePrInput({ ...valid, reps: 0 });
    expect(result).toEqual({ ok: false, code: "repsInvalid" });
  });

  it("strips HTML from notes on validation", () => {
    const result = validatePrInput({
      ...valid,
      notes: "<b>strong</b> day",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.notes).toBe("strong day");
    }
  });

  it("rejects invalid date", () => {
    const result = validatePrInput({ ...valid, date: "not-a-date" });
    expect(result).toEqual({ ok: false, code: "dateInvalid" });
  });
});
