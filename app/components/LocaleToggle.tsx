"use client";

import { useLocale } from "@/app/components/providers/LocaleProvider";

export default function LocaleToggle() {
  const { locale, setLocale, t } = useLocale();
  const nextLocale = locale === "he" ? "en" : "he";
  const label =
    locale === "he" ? t("locale.switchToEn") : t("locale.switchToHe");

  return (
    <button
      type="button"
      className="locale-toggle"
      onClick={() => setLocale(nextLocale)}
      title={label}
    >
      <span
        lang={nextLocale}
        dir={nextLocale === "he" ? "rtl" : "ltr"}
      >
        {nextLocale === "he" ? "עברית" : "English"}
      </span>
      <span className="sr-only">, {label}</span>
    </button>
  );
}
