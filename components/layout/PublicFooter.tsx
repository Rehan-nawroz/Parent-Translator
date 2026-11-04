import Link from "next/link";

import { Logo } from "./Logo";

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-muted transition hover:text-white">
        {children}
      </Link>
    </li>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-line bg-ink/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            Plain-language school documents for families. Not legal advice. Verify important
            decisions with your school.
          </p>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-white">Product</h2>
          <ul className="mt-4 space-y-2.5">
            <FooterLink href="/#how-it-works">How it works</FooterLink>
            <FooterLink href="/#four-sections">The four sections</FooterLink>
            <FooterLink href="/auth/sign-up">Create account</FooterLink>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-white">Trust</h2>
          <ul className="mt-4 space-y-2.5">
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/terms">Terms</FooterLink>
            <FooterLink href="/auth/sign-in">Sign in</FooterLink>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-white">
            Languages
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            English, Español, Tiếng Việt, 简体中文, العربية, Tagalog.
          </p>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© 2026 Parent Translator.</p>
          <p>Documents are processed for the current request and are not saved by default.</p>
        </div>
      </div>
    </footer>
  );
}
