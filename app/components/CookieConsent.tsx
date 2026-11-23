"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { useLocale } from "@/app/components/providers/LocaleProvider";
import {
  CONSENT_CHANGED_EVENT,
  OPEN_COOKIE_SETTINGS_EVENT,
  parseConsent,
  readConsent,
  readConsentRaw,
  saveConsent,
} from "@/app/lib/consent";

function subscribeHydration() {
  return () => {};
}

const getHydrated = () => true;
const getServerHydrated = () => false;

function subscribeConsent(onChange: () => void) {
  window.addEventListener(CONSENT_CHANGED_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CONSENT_CHANGED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getConsentRaw() {
  return readConsentRaw();
}

const getServerConsentRaw = () => null;

export default function CookieConsent() {
  const { t } = useLocale();
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    getHydrated,
    getServerHydrated,
  );
  const rawConsent = useSyncExternalStore(
    subscribeConsent,
    getConsentRaw,
    getServerConsentRaw,
  );
  const storedConsent = useMemo(
    () => parseConsent(rawConsent),
    [rawConsent],
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [status, setStatus] = useState("");

  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const bannerOpen = hydrated && !storedConsent && !settingsOpen;

  const closeSettings = useCallback(() => {
    setSettingsOpen(false);
  }, []);

  const openSettings = useCallback(() => {
    const stored = readConsent();
    setAnalytics(stored?.analytics ?? false);
    setMarketing(stored?.marketing ?? false);
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    setSettingsOpen(true);
  }, []);

  useEffect(() => {
    const onOpen = () => openSettings();
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, onOpen);
    return () =>
      window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, onOpen);
  }, [openSettings]);

  useEffect(() => {
    if (!settingsOpen) {
      return;
    }

    const panel = dialogRef.current;
    if (!panel) {
      return;
    }

    const focusables = Array.from(
      panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
    const previousFocus = restoreFocusRef.current;
    focusables[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSettings();
        return;
      }

      if (event.key !== "Tab" || focusables.length === 0) {
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;

      // The opener may have unmounted (for example, the banner's settings
      // button disappears after saving). Fall back to the footer trigger.
      const fallback =
        document.querySelector<HTMLElement>("[data-cookie-settings]") ??
        document.getElementById("main-content");
      const canRestore =
        previousFocus !== null &&
        previousFocus !== document.body &&
        previousFocus.isConnected;
      (canRestore ? previousFocus : fallback)?.focus();
    };
  }, [settingsOpen, closeSettings]);

  const commit = useCallback(
    (preferences: { analytics: boolean; marketing: boolean }) => {
      saveConsent({ necessary: true, ...preferences });
      setAnalytics(preferences.analytics);
      setMarketing(preferences.marketing);
      setSettingsOpen(false);
      setStatus(t("cookie.saved"));
    },
    [t],
  );

  if (!hydrated) {
    return null;
  }

  return (
    <>
      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>

      {bannerOpen && !settingsOpen ? (
        <section
          className="cookie-banner"
          aria-labelledby="cookie-banner-title"
          aria-describedby="cookie-banner-desc"
        >
          <div className="cookie-banner-inner">
            <div>
              <h2 id="cookie-banner-title" className="cookie-title">
                {t("cookie.title")}
              </h2>
              <p id="cookie-banner-desc" className="cookie-desc">
                {t("cookie.description")}{" "}
                <Link href="/privacy">{t("cookie.policyLink")}</Link>.
              </p>
            </div>
            <div className="cookie-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  commit({ analytics: true, marketing: true })
                }
              >
                {t("cookie.acceptAll")}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() =>
                  commit({ analytics: false, marketing: false })
                }
              >
                {t("cookie.rejectAll")}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={openSettings}
              >
                {t("cookie.settings")}
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {settingsOpen ? (
        <div
          className="cookie-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeSettings();
            }
          }}
        >
          <div
            ref={dialogRef}
            className="cookie-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-settings-title"
            aria-describedby="cookie-settings-desc"
          >
            <div className="cookie-dialog-head">
              <h2 id="cookie-settings-title" className="cookie-title">
                {t("cookie.title")}
              </h2>
              <button
                type="button"
                className="cookie-close"
                onClick={closeSettings}
                aria-label={t("cookie.close")}
              >
                ×
              </button>
            </div>

            <p id="cookie-settings-desc" className="cookie-desc">
              {t("cookie.description")}
            </p>

            <div className="cookie-options">
              <div className="cookie-option">
                <div>
                  <p className="cookie-option-title">
                    {t("cookie.necessary")}
                  </p>
                  <p className="cookie-option-desc">
                    {t("cookie.necessaryDesc")}
                  </p>
                </div>
                <span className="cookie-always">
                  {t("cookie.alwaysOn")}
                </span>
              </div>

              <label className="cookie-option">
                <span>
                  <span className="cookie-option-title">
                    {t("cookie.analytics")}
                  </span>
                  <span className="cookie-option-desc">
                    {t("cookie.analyticsDesc")}
                  </span>
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  checked={analytics}
                  onChange={(event) =>
                    setAnalytics(event.target.checked)
                  }
                />
              </label>

              <label className="cookie-option">
                <span>
                  <span className="cookie-option-title">
                    {t("cookie.marketing")}
                  </span>
                  <span className="cookie-option-desc">
                    {t("cookie.marketingDesc")}
                  </span>
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  checked={marketing}
                  onChange={(event) =>
                    setMarketing(event.target.checked)
                  }
                />
              </label>
            </div>

            <div className="cookie-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => commit({ analytics, marketing })}
              >
                {t("cookie.save")}
              </button>
              <button
                type="button"
                className="btn"
                onClick={closeSettings}
              >
                {t("cookie.cancel")}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() =>
                  commit({ analytics: true, marketing: true })
                }
              >
                {t("cookie.acceptAll")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
