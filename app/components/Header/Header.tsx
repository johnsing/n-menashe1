import Link from "next/link";

import LocaleToggle from "@/app/components/LocaleToggle";
import HebrewDate from "./HebrewDate";

export default function Header() {
  return (
    <header className="nav">
      <Link href="/" className="nav-brand">
        N-MENASHE
      </Link>
      <div className="nav-side">
        <HebrewDate />
        <LocaleToggle />
      </div>
    </header>
  );
}
