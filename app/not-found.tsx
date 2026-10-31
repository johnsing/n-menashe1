// app/not-found.tsx — custom 404
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container">
      <header className="hero">
        <h1>404 — Page not found</h1>
        <p className="muted">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/" className="btn" style={{ marginTop: "1.25rem", display: "inline-flex" }}>
          Back to home
        </Link>
      </header>
    </main>
  );
}