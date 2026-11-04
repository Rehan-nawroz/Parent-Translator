import Link from "next/link";

import { buttonClasses } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4">
      <p className="eyebrow">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">That page does not exist</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        The link may be old, or the page may have moved. Nothing about your documents was exposed.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/" className={buttonClasses("primary")}>
          Back to home
        </Link>
        <Link href="/dashboard" className={buttonClasses("secondary")}>
          Open dashboard
        </Link>
      </div>
    </div>
  );
}
