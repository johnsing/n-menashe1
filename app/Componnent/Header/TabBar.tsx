// app/components/TabBar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", icon: "🏠", label: "Home" },
  { href: "/library", icon: "📚", label: "Library" },
  { href: "/videos", icon: "🎬", label: "Videos" },
  { href: "/audio", icon: "🎧", label: "Audio" },
  { href: "/qa", icon: "💬", label: "Q&A" },
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
              {tab.icon}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}