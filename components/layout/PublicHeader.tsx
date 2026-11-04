import Link from "next/link";

import { buttonClasses } from "@/components/ui/Button";

import { Logo } from "./Logo";

export function PublicHeader({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-7 text-sm text-muted md:flex">
          <Link href="/#how-it-works" className="transition hover:text-white">
            How it works
          </Link>
          <Link href="/#four-sections" className="transition hover:text-white">
            The four sections
          </Link>
          <Link href="/privacy" className="transition hover:text-white">
            Privacy
          </Link>
          <Link href="/terms" className="transition hover:text-white">
            Terms
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Link href="/dashboard" className={buttonClasses("primary", "sm")}>
              Open dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth/sign-in" className={buttonClasses("ghost", "sm")}>
                Sign in
              </Link>
              <Link href="/auth/sign-up" className={buttonClasses("primary", "sm")}>
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
