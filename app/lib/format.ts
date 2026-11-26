const ISRAELI_PHONE_RE = /^(0(?:5\d|[2-489]))(\d{3})(\d{4})$/;

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function normalizeIsraeliPhone(value: string): string {
  const digits = digitsOnly(value);
  return digits.startsWith("972") ? `0${digits.slice(3)}` : digits;
}

export function formatPhoneIL(value: string): string {
  const match = normalizeIsraeliPhone(value).match(ISRAELI_PHONE_RE);
  return match
    ? `${match[1]}-${match[2]}-${match[3]}`
    : value.trim();
}

export function telHrefIL(value: string): string {
  const digits = digitsOnly(value);
  const international = digits.startsWith("972")
    ? digits
    : digits.startsWith("0")
      ? `972${digits.slice(1)}`
      : digits;
  return `tel:+${international}`;
}

export function isValidIsraeliPhone(value: string): boolean {
  return ISRAELI_PHONE_RE.test(normalizeIsraeliPhone(value));
}

export function formatILS(
  amount: number,
  options: { decimals?: number } = {},
): string {
  if (!Number.isFinite(amount)) return "—";

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

// Date-only strings are parsed as local dates so DD/MM/YYYY does not shift
// across timezones.
export function formatDateIL(value: Date | string | number): string {
  let date: Date;

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    date = new Date(year, month - 1, day);
  } else {
    date = new Date(value);
  }

  if (Number.isNaN(date.getTime())) return "—";

  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}
