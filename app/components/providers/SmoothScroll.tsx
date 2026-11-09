// app/components/providers/SmoothScroll.tsx
// Lenis smooth scrolling, driven by the GSAP ticker and synced with
// ScrollTrigger. Rendered once in the root layout (root mode).
'use client';

import { useEffect } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function ScrollTriggerSync() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0); // keep ScrollTrigger and Lenis perfectly in sync
    return () => {
      gsap.ticker.remove(raf);
      lenis.off('scroll', ScrollTrigger.update);
    };
  }, [lenis]);

  return null;
}

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // autoRaf:false — the GSAP ticker above drives Lenis instead
    <ReactLenis root options={{ autoRaf: false }}>
      <ScrollTriggerSync />
      {children}
    </ReactLenis>
  );
}

// Re-exports so the rest of the app can import GSAP pieces from one place:
export { gsap, ScrollTrigger };