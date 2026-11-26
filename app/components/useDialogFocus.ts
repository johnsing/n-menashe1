"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function focusableIn(dialog: HTMLElement): HTMLElement[] {
  return Array.from(
    dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((element) => element.getClientRects().length > 0);
}

interface DialogFocusOptions {
  open: boolean;
  onClose: () => void;
  initialFocus?: RefObject<HTMLElement | null>;
  fallbackFocus?: () => HTMLElement | null;
}

export function useDialogFocus<T extends HTMLElement = HTMLDivElement>({
  open,
  onClose,
  initialFocus,
  fallbackFocus,
}: DialogFocusOptions) {
  const dialogRef = useRef<T>(null);
  const onCloseRef = useRef(onClose);
  const initialFocusRef = useRef(initialFocus);
  const fallbackFocusRef = useRef(fallbackFocus);

  useEffect(() => {
    onCloseRef.current = onClose;
    initialFocusRef.current = initialFocus;
    fallbackFocusRef.current = fallbackFocus;
  });

  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    // A dialog may replace its own trigger (the cookie banner), in which case
    // focus has already fallen back to <body> before this effect runs.
    const opener =
      document.activeElement instanceof HTMLElement &&
      document.activeElement !== document.body
        ? document.activeElement
        : null;

    (initialFocusRef.current?.current ?? focusableIn(dialog)[0])?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = focusableIn(dialog);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (!dialog.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;

      const fallback = fallbackFocusRef.current?.();
      const target = opener?.isConnected
        ? opener
        : fallback ?? document.getElementById("main-content");
      target?.focus();
    };
  }, [open]);

  return dialogRef;
}
