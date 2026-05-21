import { describe, expect, it } from "vitest";
import { pickCelebrationMessage } from "./celebration";

describe("pickCelebrationMessage", () => {
  it("returns empty string for empty list", () => {
    expect(pickCelebrationMessage([])).toBe("");
  });

  it("returns one of the provided messages", () => {
    const msgs = ["אלופים!", "אין עליכם!"];
    const picked = pickCelebrationMessage(msgs);
    expect(msgs).toContain(picked);
  });
});
