"use client";

import Link from "next/link";

import { useLocale } from "@/app/components/providers/LocaleProvider";
import { formatILS, formatPhoneIL, telHrefIL } from "@/app/lib/format";
import { site } from "@/app/lib/site";
import ContactForm from "./ContactForm";

const SUPPORT_AMOUNTS = [18, 36, 72];

export default function ContactContent() {
  const { t } = useLocale();
  const supportSubject = encodeURIComponent(t("contact.supportTitle"));

  return (
    <div className="contact-page">
      <header className="contact-hero">
        <h1>{t("contact.title")}</h1>
        <p className="contact-lede">{t("contact.lede")}</p>
      </header>

      <div className="contact-grid">
        <section
          className="contact-card"
          aria-labelledby="contact-form-title"
        >
          <h2 id="contact-form-title">{t("contact.formTitle")}</h2>
          <ContactForm />
        </section>

        <aside className="contact-aside">
          <section
            className="contact-card"
            aria-labelledby="contact-info-title"
          >
            <h2 id="contact-info-title">{t("contact.contactInfo")}</h2>
            <ul className="contact-list">
              <li>
                <span>{t("contact.phoneLabel")}:</span>{" "}
                <a href={telHrefIL(site.phoneRaw)} dir="ltr">
                  {formatPhoneIL(site.phoneRaw)}
                </a>
              </li>
              <li>
                <span>{t("contact.emailLabel")}:</span>{" "}
                <a href={`mailto:${site.email}`} dir="ltr">
                  {site.email}
                </a>
              </li>
              <li>
                <span>{t("contact.accessibilityLabel")}:</span>{" "}
                <a
                  href={`mailto:${site.accessibilityEmail}`}
                  dir="ltr"
                >
                  {site.accessibilityEmail}
                </a>
              </li>
              <li>
                <span>{t("contact.addressLabel")}:</span>{" "}
                {site.address}
              </li>
            </ul>
            <p className="contact-note">
              <Link href="/accessibility">
                {t("footer.accessibility")}
              </Link>
            </p>
          </section>

          <section
            className="contact-card"
            aria-labelledby="contact-support-title"
          >
            <h2 id="contact-support-title">
              {t("contact.supportTitle")}
            </h2>
            <p>{t("contact.supportText")}</p>
            <p className="support-amounts">
              {SUPPORT_AMOUNTS.map((amount) => (
                <span key={amount} className="support-chip">
                  {formatILS(amount, { decimals: 0 })}
                </span>
              ))}
            </p>
            <p className="contact-note">
              {t("contact.supportAmount")}
              {formatILS(SUPPORT_AMOUNTS[0], { decimals: 0 })}
            </p>
            <a
              className="btn"
              href={`mailto:${site.email}?subject=${supportSubject}`}
            >
              {t("contact.supportCta")}
            </a>
          </section>
        </aside>
      </div>
    </div>
  );
}
