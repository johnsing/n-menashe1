"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiBook,
  FiCalendar,
  FiHome,
  FiMail,
  FiMessageSquare,
  FiVideo,
} from "react-icons/fi";

import { useLocale } from "@/app/components/providers/LocaleProvider";
import type { MessageKey } from "@/app/lib/i18n";

const tabs: {
  href: string;
  label: MessageKey;
  Icon: typeof FiHome;
}[] = [
  { href: "/", label: "nav.home", Icon: FiHome },
  { href: "/library", label: "nav.library", Icon: FiBook },
  { href: "/videos", label: "nav.videos", Icon: FiVideo },
  { href: "/qa", label: "nav.qa", Icon: FiMessageSquare },
  { href: "/calendar", label: "nav.calendar", Icon: FiCalendar },
  { href: "/contact", label: "nav.contact", Icon: FiMail },
];

export default function TabBar() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <nav className="tabbar" aria-label={t("nav.main")}>
      {tabs.map((tab) => {
        const isActive =
          tab.href === "/"
            ? pathname === "/"
            : pathname.startsWith(tab.href);
        const label = t(tab.label);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={isActive ? "tabbar-item is-active" : "tabbar-item"}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            title={label}
          >
            <span className="tabbar-icon" aria-hidden="true">
              <tab.Icon />
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
