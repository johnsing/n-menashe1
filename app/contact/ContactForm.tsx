"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { useLocale } from "@/app/components/providers/LocaleProvider";
import { formatPhoneIL, isValidIsraeliPhone } from "@/app/lib/format";

type FieldName = "name" | "email" | "phone" | "message" | "consent";
type FieldErrors = Partial<Record<FieldName, string>>;
type SubmitStatus = "idle" | "sending" | "success";
type Topic = "general" | "accessibility" | "content" | "other";

interface FormValues {
  name: string;
  email: string;
  phone: string;
  topic: Topic;
  message: string;
  consent: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIELD_ORDER: FieldName[] = [
  "name",
  "email",
  "phone",
  "message",
  "consent",
];

const EMPTY_FORM: FormValues = {
  name: "",
  email: "",
  phone: "",
  topic: "general",
  message: "",
  consent: false,
};

export default function ContactForm() {
  const { t } = useLocale();
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");

  const setField = <K extends keyof FormValues>(
    field: K,
    value: FormValues[K],
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!(field in current)) {
        return current;
      }
      const next = { ...current };
      delete next[field as FieldName];
      return next;
    });
  };

  const collectErrors = (): FieldErrors => {
    const next: FieldErrors = {};

    if (!values.name.trim()) {
      next.name = t("contact.requiredField");
    }
    if (!values.email.trim()) {
      next.email = t("contact.requiredField");
    } else if (!EMAIL_RE.test(values.email.trim())) {
      next.email = t("contact.invalidEmail");
    }
    if (
      values.phone.trim() &&
      !isValidIsraeliPhone(values.phone)
    ) {
      next.phone = t("contact.invalidPhone");
    }
    if (!values.message.trim()) {
      next.message = t("contact.requiredField");
    }
    if (!values.consent) {
      next.consent = t("contact.consentRequired");
    }

    return next;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const next = collectErrors();
    setErrors(next);

    const firstInvalid = FIELD_ORDER.find((field) => next[field]);
    if (firstInvalid) {
      setStatus("idle");
      requestAnimationFrame(() => {
        document.getElementById(`contact-${firstInvalid}`)?.focus();
      });
      return;
    }

    setStatus("sending");

    // Demo only: connect a server action or email API before launch.
    window.setTimeout(() => {
      setStatus("success");
      setValues(EMPTY_FORM);
    }, 600);
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <p className="form-help">{t("contact.requiredHint")}</p>

      {hasErrors ? (
        <div className="form-error-summary" role="alert">
          <p>{t("contact.errorSummary")}</p>
          <ul>
            {FIELD_ORDER.filter((field) => errors[field]).map((field) => (
              <li key={field}>
                <a href={`#contact-${field}`}>{errors[field]}</a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {status === "success" ? (
        <p className="form-success" role="status">
          {t("contact.success")}
        </p>
      ) : null}

      <div className="form-field">
        <label htmlFor="contact-name" className="form-label">
          {t("contact.name")}{" "}
          <span className="form-required" aria-hidden="true">
            *
          </span>
        </label>
        <input
          id="contact-name"
          name="name"
          className="form-input"
          autoComplete="name"
          placeholder={t("contact.namePlaceholder")}
          required
          value={values.name}
          onChange={(event) => setField("name", event.target.value)}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={
            errors.name ? "contact-name-error" : undefined
          }
        />
        {errors.name ? (
          <p id="contact-name-error" className="form-error">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="form-row two">
        <div className="form-field">
          <label htmlFor="contact-email" className="form-label">
            {t("contact.email")}{" "}
            <span className="form-required" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            dir="ltr"
            className="form-input form-ltr"
            placeholder={t("contact.emailPlaceholder")}
            required
            value={values.email}
            onChange={(event) => setField("email", event.target.value)}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={
              errors.email ? "contact-email-error" : undefined
            }
          />
          {errors.email ? (
            <p id="contact-email-error" className="form-error">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="form-field">
          <label htmlFor="contact-phone" className="form-label">
            {t("contact.phone")}
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            className="form-input form-ltr"
            placeholder={t("contact.phonePlaceholder")}
            value={values.phone}
            onChange={(event) => setField("phone", event.target.value)}
            onBlur={() => {
              if (isValidIsraeliPhone(values.phone)) {
                setField("phone", formatPhoneIL(values.phone));
              }
            }}
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={
              errors.phone
                ? "contact-phone-error"
                : "contact-phone-help"
            }
          />
          <p id="contact-phone-help" className="form-help">
            {t("contact.phoneHelp")}
          </p>
          {errors.phone ? (
            <p id="contact-phone-error" className="form-error">
              {errors.phone}
            </p>
          ) : null}
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="contact-topic" className="form-label">
          {t("contact.topic")}
        </label>
        <select
          id="contact-topic"
          name="topic"
          className="form-select"
          value={values.topic}
          onChange={(event) =>
            setField("topic", event.target.value as Topic)
          }
        >
          <option value="general">
            {t("contact.topic.general")}
          </option>
          <option value="accessibility">
            {t("contact.topic.accessibility")}
          </option>
          <option value="content">
            {t("contact.topic.content")}
          </option>
          <option value="other">{t("contact.topic.other")}</option>
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="contact-message" className="form-label">
          {t("contact.message")}{" "}
          <span className="form-required" aria-hidden="true">
            *
          </span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          className="form-textarea"
          rows={5}
          placeholder={t("contact.messagePlaceholder")}
          required
          value={values.message}
          onChange={(event) => setField("message", event.target.value)}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={
            errors.message ? "contact-message-error" : undefined
          }
        />
        {errors.message ? (
          <p id="contact-message-error" className="form-error">
            {errors.message}
          </p>
        ) : null}
      </div>

      <div className="form-field">
        <div className="checkbox-row">
          <input
            id="contact-consent"
            name="consent"
            type="checkbox"
            required
            checked={values.consent}
            onChange={(event) =>
              setField("consent", event.target.checked)
            }
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={
              errors.consent ? "contact-consent-error" : undefined
            }
          />
          <label htmlFor="contact-consent">
            {t("contact.consent")}{" "}
            <Link href="/privacy">{t("contact.consentLink")}</Link>
          </label>
        </div>
        {errors.consent ? (
          <p id="contact-consent-error" className="form-error">
            {errors.consent}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        className="btn btn-primary contact-submit"
        disabled={status === "sending"}
      >
        {status === "sending" ? t("contact.sending") : t("contact.submit")}
      </button>

      <p className="form-help">{t("contact.formNote")}</p>
    </form>
  );
}
