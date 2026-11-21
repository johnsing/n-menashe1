"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

const THRESHOLD = 64;
const MAX_PULL = 96;
const RESISTANCE = 0.55;

type Phase = "idle" | "pulling" | "armed" | "refreshing";

const IGNORE_SELECTOR = [
  '[role="dialog"]',
  ".video-add-backdrop",
  ".qa-modal-backdrop",
  ".nav",
  ".tabbar",
  ".player-bar",
  "input",
  "textarea",
  "select",
  '[contenteditable="true"]',
].join(",");

function shouldIgnore(target: EventTarget | null) {
  return (
    target instanceof Element && Boolean(target.closest(IGNORE_SELECTOR))
  );
}

export default function PullToRefresh() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [pull, setPull] = useState(0);

  const phaseRef = useRef<Phase>("idle");
  const pullRef = useRef(0);
  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const trackingRef = useRef(false);
  const draggingRef = useRef(false);

  const updatePhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const updatePull = useCallback((next: number) => {
    pullRef.current = next;
    setPull(next);
  }, []);

  useEffect(() => {
    const reset = () => {
      trackingRef.current = false;
      draggingRef.current = false;
      updatePull(0);
      if (phaseRef.current !== "refreshing") updatePhase("idle");
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      if (phaseRef.current === "refreshing") return;
      if (window.scrollY > 0.5) return;
      if (shouldIgnore(event.target)) return;

      const touch = event.touches[0];
      startYRef.current = touch.clientY;
      startXRef.current = touch.clientX;
      trackingRef.current = true;
      draggingRef.current = false;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!trackingRef.current || event.touches.length !== 1) return;
      if (phaseRef.current === "refreshing") return;

      const touch = event.touches[0];
      const dy = touch.clientY - startYRef.current;
      const dx = touch.clientX - startXRef.current;

      if (!draggingRef.current) {
        // Only a mostly vertical downward drag from the very top counts.
        if (dy <= 0 || Math.abs(dx) > dy) {
          trackingRef.current = false;
          return;
        }
      }

      if (window.scrollY > 0.5) {
        reset();
        return;
      }

      draggingRef.current = true;
      // Keep the browser's own pull-to-refresh (and iOS bounce) out of the
      // way while the custom indicator is being dragged.
      if (event.cancelable) event.preventDefault();

      const distance = Math.min(MAX_PULL, Math.max(0, dy * RESISTANCE));
      updatePull(distance);
      updatePhase(distance >= THRESHOLD ? "armed" : "pulling");
    };

    const finish = () => {
      if (!trackingRef.current) return;

      const distance = pullRef.current;
      trackingRef.current = false;
      draggingRef.current = false;

      if (distance < THRESHOLD) {
        updatePull(0);
        updatePhase("idle");
        return;
      }

      updatePull(THRESHOLD);
      updatePhase("refreshing");
      window.setTimeout(() => window.location.reload(), 220);
    };

    const onTouchCancel = () => reset();

    const onScroll = () => {
      if (window.scrollY > 0.5) reset();
    };

    window.addEventListener("touchstart", onTouchStart, {
      capture: true,
      passive: true,
    });
    window.addEventListener("touchmove", onTouchMove, {
      capture: true,
      passive: false,
    });
    window.addEventListener("touchend", finish, {
      capture: true,
      passive: true,
    });
    window.addEventListener("touchcancel", onTouchCancel, {
      capture: true,
      passive: true,
    });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart, { capture: true });
      window.removeEventListener("touchmove", onTouchMove, { capture: true });
      window.removeEventListener("touchend", finish, { capture: true });
      window.removeEventListener("touchcancel", onTouchCancel, {
        capture: true,
      });
      window.removeEventListener("scroll", onScroll);
    };
  }, [updatePhase, updatePull]);

  const visible = pull > 0 || phase === "refreshing";
  return (
    <div
      className={[
        "ptr",
        visible ? "is-visible" : "",
        phase === "pulling" || phase === "armed" ? "is-dragging" : "",
        phase === "armed" ? "is-armed" : "",
        phase === "refreshing" ? "is-refreshing" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--ptr-pull": `${pull}px` } as CSSProperties}
      role="status"
      aria-live="polite"
      aria-hidden={!visible}
    >
      <span className="ptr-icon" aria-hidden="true">
        {phase === "refreshing" ? "◌" : "↓"}
      </span>
      <span className="ptr-label">
        {phase === "refreshing"
          ? "Refreshing…"
          : phase === "armed"
            ? "Release to refresh"
            : "Pull to refresh"}
      </span>
    </div>
  );
}
