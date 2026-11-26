"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import { useLocale } from "@/app/components/providers/LocaleProvider";
import { useDialogFocus } from "@/app/components/useDialogFocus";
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
    readConsentRaw,
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

  const bannerOpen = hydrated && !storedConsent && !settingsOpen;

  const closeSettings = useCallback(() => {
    setSettingsOpen(false);
  }, []);

  const openSettings = useCallback(() => {
    const stored = readConsent();
    setAnalytics(stored?.analytics ?? false);
    setMarketing(stored?.marketing ?? false);
    setSettingsOpen(true);
  }, []);

  const dialogRef = useDialogFocus<HTMLDivElement>({
    open: settingsOpen,
    onClose: closeSettings,
    fallbackFocus: () =>
      document.querySelector<HTMLElement>("[data-cookie-settings]") ??
      document.getElementById("main-content"),
  });

  useEffect(() => {
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings);
    return () =>
      window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings);
  }, [openSettings]);

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

  const acceptAll = () => commit({ analytics: true, marketing: true });
  const rejectAll = () => commit({ analytics: false, marketing: false });

  if (!hydrated) return null;

  return (
    <>
      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>

      {bannerOpen && (
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
                onClick={acceptAll}
              >
                {t("cookie.acceptAll")}
              </button>
              <button type="button" className="btn" onClick={rejectAll}>
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
      )}

      {settingsOpen && (
        <div
          className="cookie-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeSettings();
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
                onClick={acceptAll}
              >
                {t("cookie.acceptAll")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
