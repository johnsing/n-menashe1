// app/lib/site.ts — single source of truth for organisation details.
//
// Replace the placeholder phone, email, address, and lastUpdated values with
// the real details before launch. The accessibility statement, footer, and
// contact page all read from here.

export const site = {
  name: "N-MENASHE",
  nameHe: "נ־מנשה",
  email: "info@n-menashe.co.il",
  accessibilityEmail: "accessibility@n-menashe.co.il",
  phoneRaw: "0501234567",
  address: "ירושלים, ישראל",
  accessibilityCoordinator: "ועדת הנגישות של N-MENASHE",
  lastUpdated: "2026-11-22",
} as const;
