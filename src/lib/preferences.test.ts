import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCelebrationsEnabled, setCelebrationsEnabled } from "./preferences";

const store: Record<string, string> = {};

beforeEach(() => {
  for (const key of Object.keys(store)) delete store[key];
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      for (const key of Object.keys(store)) delete store[key];
    },
  });
});

describe("preferences", () => {
  it("defaults celebrations to enabled", () => {
    expect(getCelebrationsEnabled()).toBe(true);
  });

  it("persists disabled celebrations", () => {
    setCelebrationsEnabled(false);
    expect(getCelebrationsEnabled()).toBe(false);
  });
});
