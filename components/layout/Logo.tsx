import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils/cn";

export function Logo({ href = "/", compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link
      href={href}
      aria-label="Parent Translator home"
      className="group inline-flex items-center gap-2.5"
    >
      <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-line bg-white">
        <Image
          src="/images/logo.png"
          alt=""
          width={44}
          height={44}
          priority
          className="h-8 w-8 object-contain transition-transform duration-200 group-hover:scale-105"
        />
      </span>
      {!compact && (
        <span className="text-[15px] font-bold leading-[1.05] tracking-tight text-white">
          Parent
          <br />
          <span className="text-crimson">Translator</span>
        </span>
      )}
    </Link>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-line bg-white",
        className,
      )}
    >
      <Image
        src="/images/logo.png"
        alt=""
        width={36}
        height={36}
        className="h-7 w-7 object-contain"
      />
    </span>
  );
}
