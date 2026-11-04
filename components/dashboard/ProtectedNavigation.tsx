"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/layout/Logo";
import { buttonClasses } from "@/components/ui/Button";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils/cn";
import { maskEmail } from "@/lib/utils/text";

import { UsageIndicator } from "./UsageIndicator";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/upload", label: "Upload & Analyze" },
  { href: "/dashboard/result", label: "Translate Notice" },
  { href: "/dashboard/timeline", label: "Timeline" },
  { href: "/dashboard/account", label: "Account" },
];

export function ProtectedNavigation({
  email,
  remaining,
  limit,
}: {
  email: string | null;
  remaining: number;
  limit: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    const supabase = getSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b border-line bg-ink/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Logo href="/dashboard" />

        <nav aria-label="Authenticated" className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-md px-3 py-2 text-[13px] font-medium transition",
                  active
                    ? "bg-crimson/10 text-white"
                    : "text-muted hover:bg-white/5 hover:text-white",
                )}
              >
                {active && (
                  <span
                    className="absolute inset-x-3 -bottom-[11px] h-[2px] rounded-full bg-crimson"
                    aria-hidden="true"
                  />
                )}
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <UsageIndicator remaining={remaining} limit={limit} />
          <span className="hidden text-xs text-muted xl:inline">
            {email ? maskEmail(email) : "Signed in"}
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={pending}
            className={buttonClasses("ghost", "sm", "px-2")}
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>

      <nav
        aria-label="Authenticated mobile"
        className="flex flex-wrap gap-1 border-t border-line px-3 py-2 lg:hidden"
      >
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={pathname === link.href ? "page" : undefined}
            className={cn(
              "whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition",
              pathname === link.href
                ? "bg-crimson/10 text-white"
                : "text-muted hover:bg-white/5 hover:text-white",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
