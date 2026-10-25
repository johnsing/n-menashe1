// app/components/TabBar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiBook, FiCalendar, FiHeadphones, FiHome, FiMessageSquare, FiVideo,  } from "react-icons/fi";

const tabs = [
  { href: "/", label: "Home", Icon: FiHome },
  { href: "/library", label: "Library", Icon: FiBook },
  { href: "/videos", label: "Videos", Icon: FiVideo },
  { href: "/audio", label: "Audio", Icon: FiHeadphones },
  { href: "/qa", label: "Q&A", Icon: FiMessageSquare },
  { href: "/calendar", label: "Calendar", Icon: FiCalendar },
];

export default function TabBar() {
  // usePathname() tells us the current URL — reactively.
  // Click a tab → URL changes → this re-renders → the active tab lights up.
  const pathname = usePathname();

  return (
    <nav className="tabbar" aria-label="Main">
      {tabs.map((tab) => {
        const isActive =
          tab.href === "/"
            ? pathname === "/"
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={isActive ? "tabbar-item is-active" : "tabbar-item"}
            aria-label={tab.label}
            title={tab.label}
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