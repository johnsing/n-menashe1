import { describe, expect, it } from "vitest";

import {
  formatDateIL,
  formatILS,
  formatPhoneIL,
  isValidIsraeliPhone,
  telHrefIL,
} from "./format";

describe("formatPhoneIL", () => {
  it("formats Israeli mobile numbers", () => {
    expect(formatPhoneIL("0501234567")).toBe("050-123-4567");
    expect(formatPhoneIL("050-123-4567")).toBe("050-123-4567");
  });

  it("normalizes international input", () => {
    expect(formatPhoneIL("+972 50 123 4567")).toBe("050-123-4567");
  });

  it("formats landline numbers", () => {
    expect(formatPhoneIL("021234567")).toBe("02-123-4567");
  });

  it("returns unknown input trimmed", () => {
    expect(formatPhoneIL("  not-a-number  ")).toBe("not-a-number");
  });
});

describe("telHrefIL", () => {
  it("builds an international tel link", () => {
    expect(telHrefIL("050-123-4567")).toBe("tel:+972501234567");
    expect(telHrefIL("+972501234567")).toBe("tel:+972501234567");
  });
});

describe("isValidIsraeliPhone", () => {
  it("accepts mobile and landline numbers", () => {
    expect(isValidIsraeliPhone("0501234567")).toBe(true);
    expect(isValidIsraeliPhone("021234567")).toBe(true);
  });

  it("rejects malformed numbers", () => {
    expect(isValidIsraeliPhone("12345")).toBe(false);
    expect(isValidIsraeliPhone("")).toBe(false);
  });
});

describe("formatILS", () => {
  it("formats shekels with a leading symbol", () => {
    expect(formatILS(1234.5)).toBe("₪1,234.50");
    expect(formatILS(0)).toBe("₪0.00");
    expect(formatILS(36, { decimals: 0 })).toBe("₪36");
  });

  it("handles negative and invalid amounts", () => {
    expect(formatILS(-18)).toBe("-₪18.00");
    expect(formatILS(Number.NaN)).toBe("—");
  });
});

describe("formatDateIL", () => {
  it("formats dates as DD/MM/YYYY", () => {
    expect(formatDateIL("2026-11-22")).toBe("22/11/2026");
    expect(formatDateIL(new Date(2026, 0, 5))).toBe("05/01/2026");
  });

  it("returns a dash for invalid dates", () => {
    expect(formatDateIL("not-a-date")).toBe("—");
  });
});
