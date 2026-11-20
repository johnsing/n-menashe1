import { describe, expect, it } from "vitest";

import {
  formatCountdown,
  formatIn,
  getWifiStatus,
} from "./wifiStatus";

const NOW = new Date("2026-11-20T12:00:00.000Z");
const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

const at = (offsetMs: number) => new Date(NOW.getTime() + offsetMs);

describe("getWifiStatus", () => {
  it("stays yellow until five minutes before an event", () => {
    expect(getWifiStatus(at(6 * MINUTE), NOW)).toBe("yellow");
  });

  it("turns green five minutes before the event and stays green until it starts", () => {
    expect(getWifiStatus(at(5 * MINUTE), NOW)).toBe("green");
    expect(getWifiStatus(at(MINUTE), NOW)).toBe("green");
    expect(getWifiStatus(NOW, NOW)).toBe("green");
  });

  it("is red for the 24 hours after an event", () => {
    expect(getWifiStatus(at(-MINUTE), NOW)).toBe("red");
    expect(getWifiStatus(at(-DAY), NOW)).toBe("red");
  });

  it("returns to yellow more than a day after an event", () => {
    expect(getWifiStatus(at(-DAY - 1), NOW)).toBe("yellow");
    expect(getWifiStatus(at(-10 * DAY), NOW)).toBe("yellow");
  });

  it("accepts ISO strings", () => {
    expect(getWifiStatus(at(MINUTE).toISOString(), NOW)).toBe("green");
    expect(getWifiStatus(at(-MINUTE).toISOString(), NOW)).toBe("red");
  });
});

describe("formatCountdown", () => {
  it("shows minutes under an hour", () => {
    expect(formatCountdown(at(7 * MINUTE), NOW)).toBe("7 min");
  });

  it("shows hours and minutes", () => {
    expect(formatCountdown(at(90 * MINUTE), NOW)).toBe("1h 30m");
  });

  it("omits zero minutes", () => {
    expect(formatCountdown(at(60 * MINUTE), NOW)).toBe("1h");
  });

  it("says Departed at or after the event time", () => {
    expect(formatCountdown(NOW, NOW)).toBe("Departed");
    expect(formatCountdown(at(-1), NOW)).toBe("Departed");
  });
});

describe("formatIn", () => {
  it("prefixes the time until the event", () => {
    expect(formatIn(at(14 * MINUTE), NOW)).toBe("in 14 min");
    expect(formatIn(at(134 * MINUTE), NOW)).toBe("in 2h 14m");
    expect(formatIn(at(120 * MINUTE), NOW)).toBe("in 2h");
  });

  it("is empty once the event has started", () => {
    expect(formatIn(NOW, NOW)).toBe("");
    expect(formatIn(at(-1), NOW)).toBe("");
  });
});
