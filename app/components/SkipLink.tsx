"use client";

import { useLocale } from "@/app/components/providers/LocaleProvider";

export default function SkipLink() {
  const { t } = useLocale();

  return (
    <a href="#main-content" className="skip-link">
      {t("skip")}
    </a>
  );
}
