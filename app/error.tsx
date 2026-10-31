"use client";
// app/error.tsx — route-level error boundary (must be a Client Component)
import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console (swap for your analytics later)
    console.error(error);
  }, [error]);

  return (
    <main className="container">
      <header className="hero">
        <h1>Something went wrong</h1>
        <p className="muted">
          {error.message || "An unexpected error occurred."}
        </p>
        <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <button className="btn" onClick={reset}>
            Try again
          </button>
          <Link href="/" className="btn">
            Back to home
          </Link>
        </div>
      </header>
    </main>
  );
}