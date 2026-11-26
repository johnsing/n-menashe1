"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onStoreChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onStoreChange);
  return () => query.removeEventListener("change", onStoreChange);
}

const getReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;

// The server cannot know the user's motion preference. `false` matches the
// prerendered HTML; the subscription corrects it right after hydration.
const getServerReducedMotion = () => false;

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getServerReducedMotion,
  );

  return (
    <ReactLenis
      root
      options={{
        autoRaf: true,
        syncTouch: true,
        smoothWheel: !reducedMotion,
      }}
    >
      {children}
    </ReactLenis>
  );
}
