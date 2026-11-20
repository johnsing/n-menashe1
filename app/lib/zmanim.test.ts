import { describe, expect, it } from "vitest";

import { toApiDate } from "./zmanim";

describe("toApiDate", () => {
  it("uses the location timezone instead of UTC", () => {
    // 22:30 UTC on Jan 1 is already 00:30 on Jan 2 in Jerusalem.
    expect(
      toApiDate(new Date("2026-01-01T22:30:00Z"), "Asia/Jerusalem"),
    ).toBe("2026-01-02");

    // 03:30 UTC on Jan 1 is still 22:30 on Dec 31 in New York.
    expect(
      toApiDate(new Date("2026-01-01T03:30:00Z"), "America/New_York"),
    ).toBe("2025-12-31");
  });

  it("pads single-digit months and days", () => {
    expect(toApiDate(new Date("2026-03-04T12:00:00Z"), "UTC")).toBe(
      "2026-03-04",
    );
  });

  it("tracks daylight-saving offsets", () => {
    // Both instants are noon in Jerusalem, but January is UTC+2 and July UTC+3.
    expect(
      toApiDate(new Date("2026-01-15T10:00:00Z"), "Asia/Jerusalem"),
    ).toBe("2026-01-15");
    expect(
      toApiDate(new Date("2026-07-15T09:00:00Z"), "Asia/Jerusalem"),
    ).toBe("2026-07-15");
  });
});
