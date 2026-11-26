"use client";

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
    console.error(error);
  }, [error]);

  return (
    <div className="container" lang="en" dir="ltr">
      <header className="hero">
        <h1>Something went wrong</h1>
        <p className="muted">
          {error.message || "An unexpected error occurred."}
        </p>
        <div className="page-actions">
          <button className="btn" onClick={reset}>
            Try again
          </button>
          <Link href="/" className="btn">
            Back to home
          </Link>
        </div>
      </header>
    </div>
  );
}