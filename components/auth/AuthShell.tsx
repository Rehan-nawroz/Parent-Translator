import Link from "next/link";

import { Logo } from "@/components/layout/Logo";
import { Card } from "@/components/ui/Card";

type AuthShellProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthShell({ eyebrow, title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-12 sm:px-0">
      <div className="mb-8 flex justify-center">
        <Logo />
      </div>

      <Card className="rounded-panel p-6 sm:p-8">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-2 text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-2 text-sm leading-relaxed text-muted">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </Card>

      {footer && <div className="mt-5 text-center text-sm text-muted">{footer}</div>}

      <p className="mt-6 text-center text-xs leading-relaxed text-muted">
        By continuing you confirm that you have read the{" "}
        <Link href="/privacy" className="text-ember underline underline-offset-4">
          Privacy Notice
        </Link>{" "}
        and{" "}
        <Link href="/terms" className="text-ember underline underline-offset-4">
          Terms of Use
        </Link>
        . Parent Translator is not legal advice.
      </p>
    </div>
  );
}
