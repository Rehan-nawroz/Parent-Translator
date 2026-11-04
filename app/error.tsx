"use client";

import Link from "next/link";

import { Button, buttonClasses } from "@/components/ui/Button";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">We could not finish that page</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        No sensitive detail is shown here. Documents are not saved, so nothing was written to a
        document history.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button onClick={reset}>Try again</Button>
        <Link href="/" className={buttonClasses("secondary")}>
          Go to the landing page
        </Link>
      </div>
    </div>
  );
}
