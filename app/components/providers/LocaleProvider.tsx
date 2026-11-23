"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  LOCALE_CHANGED_EVENT,
  LOCALE_COOKIE,
  dirFor,
  messages,
  type Locale,
  type MessageKey,
} from "@/app/lib/i18n";

interface LocaleContextValue {
  locale: Locale;
  dir: "rtl" | "ltr";
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readLocaleCookie(): Locale {
  const match = document.cookie.match(/(?:^|; )locale=(en|he)/);
  return match?.[1] === "en" ? "en" : "he";
}

function subscribeLocale(onChange: () => void) {
  window.addEventListener(LOCALE_CHANGED_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(LOCALE_CHANGED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export default function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  // The server always renders Hebrew so every route can stay statically
  // generated. After hydration the cookie becomes the source of truth.
  const getServerSnapshot = useCallback(
    () => initialLocale,
    [initialLocale],
  );
  const locale = useSyncExternalStore(
    subscribeLocale,
    readLocaleCookie,
    getServerSnapshot,
  );
  const dir: "rtl" | "ltr" = dirFor(locale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  const setLocale = useCallback((next: Locale) => {
    const secure =
      window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
    // Apply the direction immediately so the layout flips with the content,
    // not one paint later when the effect runs.
    document.documentElement.lang = next;
    document.documentElement.dir = dirFor(next);
    window.dispatchEvent(new Event(LOCALE_CHANGED_EVENT));
  }, []);

  const t = useCallback(
    (key: MessageKey) => messages[locale][key] ?? messages.he[key],
    [locale],
  );

  const value = useMemo(
    () => ({ locale, dir, setLocale, t }),
    [locale, dir, setLocale, t],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used inside LocaleProvider");
  }
  return context;
}
