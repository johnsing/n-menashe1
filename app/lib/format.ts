// app/lib/format.ts — Israeli phone, currency, and date formatting.
//
// These helpers are intentionally dependency-free and deterministic so they
// can be used in Server Components, Client Components, and unit tests.

const MOBILE_RE = /^0(5\d)(\d{3})(\d{4})$/;
const LANDLINE_RE = /^0([2-489])(\d{3})(\d{4})$/;

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** Accepts local (05X-XXXXXXX) or international (+972...) input. */
function normalizeIsraeliPhone(value: string): string {
  const digits = digitsOnly(value);
  return digits.startsWith("972") ? `0${digits.slice(3)}` : digits;
}

/**
 * Formats an Israeli phone number for display.
 * Mobile: 050-123-4567 · Landline: 02-123-4567.
 * Unknown input is returned trimmed rather than mangled.
 */
export function formatPhoneIL(value: string): string {
  const normalized = normalizeIsraeliPhone(value);

  const mobile = normalized.match(MOBILE_RE);
  if (mobile) {
    return `0${mobile[1]}-${mobile[2]}-${mobile[3]}`;
  }

  const landline = normalized.match(LANDLINE_RE);
  if (landline) {
    return `0${landline[1]}-${landline[2]}-${landline[3]}`;
  }

  return value.trim();
}

/** Builds an international `tel:` href from an Israeli number. */
export function telHrefIL(value: string): string {
  const digits = digitsOnly(value);
  const international = digits.startsWith("972")
    ? digits
    : digits.startsWith("0")
      ? `972${digits.slice(1)}`
      : digits;
  return `tel:+${international}`;
}

/** Validates Israeli mobile and landline numbers. */
export function isValidIsraeliPhone(value: string): boolean {
  const normalized = normalizeIsraeliPhone(value);
  return MOBILE_RE.test(normalized) || LANDLINE_RE.test(normalized);
}

/**
 * Formats an amount in New Israeli Shekels with a leading shekel sign.
 * Example: formatILS(1234.5) → "₪1,234.50".
 */
export function formatILS(
  amount: number,
  options: { decimals?: number } = {},
): string {
  if (!Number.isFinite(amount)) {
    return "—";
  }

  const decimals = options.decimals ?? 2;
  const formatted = new Intl.NumberFormat("he-IL", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Math.abs(amount));

  return `${amount < 0 ? "-" : ""}₪${formatted}`;
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/**
 * Formats a date as DD/MM/YYYY (Israeli convention).
 * Date-only ISO strings are parsed as local dates to avoid a timezone shift.
 */
export function formatDateIL(value: Date | string | number): string {
  let date: Date;

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    date = new Date(year, month - 1, day);
  } else {
    date = new Date(value);
  }

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}
