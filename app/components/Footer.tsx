"use client";

import Link from "next/link";

import { useLocale } from "@/app/components/providers/LocaleProvider";
import { OPEN_COOKIE_SETTINGS_EVENT } from "@/app/lib/consent";
import { formatDateIL, formatPhoneIL, telHrefIL } from "@/app/lib/format";
import { site } from "@/app/lib/site";

export default function Footer() {
  const { t } = useLocale();
  const year = new Date().getFullYear();

  const quickLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/library", label: t("nav.library") },
    { href: "/videos", label: t("nav.videos") },
    { href: "/qa", label: t("nav.qa") },
    { href: "/calendar", label: t("nav.calendar") },
    { href: "/contact", label: t("nav.contact") },
  ];

  const legalLinks = [
    { href: "/accessibility", label: t("footer.accessibility") },
    { href: "/privacy", label: t("footer.privacy") },
    { href: "/terms", label: t("footer.terms") },
  ];

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <p className="footer-brand">{site.name}</p>
          <p className="footer-tagline">{t("footer.tagline")}</p>
        </div>

        <nav aria-labelledby="footer-quick-title">
          <h2 id="footer-quick-title" className="footer-heading">
            {t("footer.quickLinks")}
          </h2>
          <ul className="footer-list">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="footer-link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-legal-title">
          <h2 id="footer-legal-title" className="footer-heading">
            {t("footer.legal")}
          </h2>
          <ul className="footer-list">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="footer-link">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <button
                type="button"
                className="footer-link footer-button"
                data-cookie-settings
                onClick={() =>
                  window.dispatchEvent(
                    new Event(OPEN_COOKIE_SETTINGS_EVENT),
                  )
                }
              >
                {t("footer.cookieSettings")}
              </button>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="footer-heading">{t("footer.contact")}</h2>
          <address className="footer-address">
            <a
              href={telHrefIL(site.phoneRaw)}
              className="footer-link"
            >
              <bdi dir="ltr">{formatPhoneIL(site.phoneRaw)}</bdi>
            </a>
            <a
              href={`mailto:${site.email}`}
              className="footer-link"
            >
              <bdi dir="ltr">{site.email}</bdi>
            </a>
            <span>{site.address}</span>
          </address>
        </div>
      </div>

      <div className="site-footer-bottom">
        <p>
          © {year} {site.name}. {t("footer.rights")}
        </p>
        <p>
          {t("footer.updated")}:{" "}
          <span dir="ltr">{formatDateIL(site.lastUpdated)}</span>
        </p>
      </div>
    </footer>
  );
}
