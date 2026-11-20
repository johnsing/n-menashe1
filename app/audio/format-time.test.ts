import { describe, expect, it } from "vitest";

import { formatTime } from "./format-time";

describe("formatTime", () => {
  it("formats whole seconds as m:ss", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(5)).toBe("0:05");
    expect(formatTime(65)).toBe("1:05");
    expect(formatTime(600)).toBe("10:00");
  });

  it("floors fractional seconds", () => {
    expect(formatTime(59.9)).toBe("0:59");
  });

  it("keeps long shiurim in minutes rather than adding an hours field", () => {
    expect(formatTime(3661)).toBe("61:01");
  });

  it("falls back to 0:00 for invalid values", () => {
    expect(formatTime(-1)).toBe("0:00");
    expect(formatTime(Number.NaN)).toBe("0:00");
    expect(formatTime(Number.POSITIVE_INFINITY)).toBe("0:00");
    expect(formatTime(Number.NEGATIVE_INFINITY)).toBe("0:00");
  });
});
