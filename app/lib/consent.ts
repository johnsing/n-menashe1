// The banner stores a versioned JSON record in localStorage. No analytics or
// marketing script is loaded by default; call hasConsent("analytics") before
// initialising such a script.

export interface ConsentPreferences {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
}

export interface ConsentRecord extends ConsentPreferences {
  version: 1;
  updatedAt: string;
}

export const CONSENT_STORAGE_KEY = "n-menashe-cookie-consent";
export const CONSENT_VERSION = 1;
export const OPEN_COOKIE_SETTINGS_EVENT = "n-menashe:open-cookie-settings";
export const CONSENT_CHANGED_EVENT = "n-menashe:consent-changed";

let memoryConsentRaw: string | null = null;

export function parseConsent(raw: string | null): ConsentRecord | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ConsentRecord>;
    if (
      parsed.version !== CONSENT_VERSION ||
      typeof parsed.analytics !== "boolean" ||
      typeof parsed.marketing !== "boolean"
    ) {
      return null;
    }

    return {
      necessary: true,
      analytics: parsed.analytics,
      marketing: parsed.marketing,
      version: CONSENT_VERSION,
      updatedAt:
        typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
    };
  } catch {
    return null;
  }
}

export function readConsentRaw(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return (
      window.localStorage.getItem(CONSENT_STORAGE_KEY) ??
      memoryConsentRaw
    );
  } catch {
    // Storage can be unavailable in private or locked-down browsers.
    return memoryConsentRaw;
  }
}

export function readConsent(): ConsentRecord | null {
  return parseConsent(readConsentRaw());
}

export function saveConsent(
  preferences: ConsentPreferences,
): ConsentRecord {
  const record: ConsentRecord = {
    necessary: true,
    analytics: preferences.analytics,
    marketing: preferences.marketing,
    version: CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
  };

  const raw = JSON.stringify(record);
  memoryConsentRaw = raw;

  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, raw);
  } catch {
    // Keep the in-memory record for this session so the banner still closes.
  }

  window.dispatchEvent(
    new CustomEvent(CONSENT_CHANGED_EVENT, { detail: record }),
  );

  return record;
}

export function hasConsent(category: "analytics" | "marketing"): boolean {
  return readConsent()?.[category] ?? false;
}
