import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <main id="main" className="flex-1">
        {children}
      </main>
      <footer className="border-t border-line px-4 py-5">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted">
          <Link href="/" className="transition hover:text-white">
            Back to home
          </Link>
          <Link href="/privacy" className="transition hover:text-white">
            Privacy
          </Link>
          <Link href="/terms" className="transition hover:text-white">
            Terms
          </Link>
          <span>Documents are not saved by default.</span>
        </div>
      </footer>
    </div>
  );
}
