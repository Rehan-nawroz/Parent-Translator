"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";

import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/session/session-store";

export function ClearSessionButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const { clearSession } = useSession();

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => dialogRef.current?.showModal()}>
        Clear session
      </Button>

      <dialog
        ref={dialogRef}
        aria-labelledby="clear-session-title"
        aria-describedby="clear-session-description"
        className="w-[min(92vw,28rem)] rounded-panel border border-line bg-obsidian p-6 text-mist backdrop:bg-black/80"
      >
        <h2 id="clear-session-title" className="text-lg font-semibold text-white">
          Clear this session?
        </h2>
        <p id="clear-session-description" className="mt-2 text-sm leading-relaxed text-muted">
          This removes every result and timeline entry from this tab. Documents were never saved
          permanently, and clearing does not reset your three-analysis account limit.
        </p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => dialogRef.current?.close()}>
            Keep results
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              clearSession();
              dialogRef.current?.close();
              router.push("/dashboard");
            }}
          >
            Clear session
          </Button>
        </div>
      </dialog>
    </>
  );
}
