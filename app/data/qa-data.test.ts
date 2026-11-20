import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { relTime } from "./qa-data";

const NOW = new Date("2026-11-20T12:00:00.000Z");
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("relTime", () => {
  it("shows just now under a minute", () => {
    expect(relTime(NOW.getTime() - 10_000)).toBe("just now");
  });

  it("shows minutes under an hour", () => {
    expect(relTime(NOW.getTime() - 5 * MINUTE)).toBe("5 minutes ago");
  });

  it("shows hours under a day", () => {
    expect(relTime(NOW.getTime() - 3 * HOUR)).toBe("3 hours ago");
  });

  it("shows days beyond that", () => {
    expect(relTime(NOW.getTime() - 3 * DAY)).toBe("3 days ago");
  });
});
