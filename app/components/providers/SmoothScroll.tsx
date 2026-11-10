'use client';

import { useEffect } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from 'framer-motion';
import 'lenis/dist/lenis.css';

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
  // SSR-safe: false on the server, real value after hydration
  const reducedMotion = useReducedMotion();

  return (
    // autoRaf:false — the GSAP ticker drives Lenis instead
    // syncTouch: smooth scrolling on touch devices too
    <ReactLenis
      root
      options={{
        autoRaf: false,
        syncTouch: true,
        // fall back to native scroll for users who prefer reduced motion
        smoothWheel: !reducedMotion,
      }}
    >
      <ScrollTriggerSync />
      {children}
    </ReactLenis>
  );
}

// Re-exports so the rest of the app can import GSAP pieces from one place:
export { gsap, ScrollTrigger };