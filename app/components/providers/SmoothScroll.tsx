'use client';

import { useSyncExternalStore } from 'react';
import { ReactLenis } from 'lenis/react';
import 'lenis/dist/lenis.css';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeReducedMotion(onStoreChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener('change', onStoreChange);
  return () => query.removeEventListener('change', onStoreChange);
}

const getReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;

// The server cannot know the user's motion preference. `false` matches the
// prerendered HTML; the subscription corrects it right after hydration.
const getServerReducedMotion = () => false;

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getServerReducedMotion,
  );

  return (
    // Lenis runs its own RAF loop; no animation library is needed.
    <ReactLenis
      root
      options={{
        autoRaf: true,
        syncTouch: true,
        // fall back to native scroll for users who prefer reduced motion
        smoothWheel: !reducedMotion,
      }}
    >
      {children}
    </ReactLenis>
  );
}
