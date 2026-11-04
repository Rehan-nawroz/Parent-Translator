"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

import { CitationBadge } from "@/components/results/CitationBadge";
import { getLanguageOption, type LanguageCode } from "@/lib/config/languages";
import type { JargonItem } from "@/lib/contracts/analysis";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), summary, input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function JargonPopover({
  item,
  language,
  onClose,
}: {
  item: JargonItem | null;
  language: LanguageCode;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const direction = getLanguageOption(language).direction;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!item) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        event.preventDefault();
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    };
  }, [item]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
      role="presentation"
      onClick={() => onCloseRef.current()}
    >
      <div
        ref={dialogRef}
        id="jargon-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="jargon-title"
        aria-describedby="jargon-explanation"
        dir={direction}
        className="w-full max-w-md rounded-panel border border-line bg-obsidian p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Jargon decoder</p>
            <h2 id="jargon-title" className="mt-1 text-xl font-semibold text-white">
              {item.term}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={() => onCloseRef.current()}
            aria-label="Close jargon explanation"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-white/5 hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <p
          id="jargon-explanation"
          lang={language}
          className="mt-3 text-sm leading-relaxed text-mist/85"
        >
          {item.explanation}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <CitationBadge citation={item.citations[0]} />
          <span className="text-[11px] text-muted">Educational explanation, not legal advice.</span>
        </div>
      </div>
    </div>
  );
}
