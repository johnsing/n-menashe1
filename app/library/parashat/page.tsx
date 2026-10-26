// app/library/parashat/page.tsx — all 54 weekly portions (tabbed by book)
import Link from "next/link";
import { TORAH_BOOKS } from "../parashat";
import ParashatTabs from "./ParashatTabs";

export default function ParashatIndexPage() {
  return (
    <main className="container">
      <header className="hero">
        <p className="muted">
          <Link href="/library">← Library</Link>
        </p>
        <h1>Parashat</h1>
        <p className="muted">
          The 54 weekly Torah portions — tap a portion to read it
        </p>
      </header>

      <ParashatTabs books={TORAH_BOOKS} />
    </main>
  );
}