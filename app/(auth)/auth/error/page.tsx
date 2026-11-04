import Link from "next/link";

import { AuthShell } from "@/components/auth/AuthShell";
import { buttonClasses } from "@/components/ui/Button";

export const metadata = { title: "Sign-in problem" };

export default function AuthErrorPage() {
  return (
    <AuthShell
      eyebrow="Authentication"
      title="We could not complete sign-in"
      subtitle="The link may have expired, or the sign-in was interrupted. Nothing about your documents was lost or shown."
      footer={
        <span>
          Need help?{" "}
          <Link
            href="/auth/forgot-password"
            className="font-semibold text-ember underline underline-offset-4"
          >
            Reset your password
          </Link>
        </span>
      }
    >
      <div className="space-y-3">
        <Link href="/auth/sign-in" className={buttonClasses("primary", "md", "w-full")}>
          Try signing in again
        </Link>
        <Link href="/auth/sign-up" className={buttonClasses("secondary", "md", "w-full")}>
          Create an account
        </Link>
        <Link href="/" className={buttonClasses("ghost", "md", "w-full")}>
          Go to the landing page
        </Link>
      </div>
    </AuthShell>
  );
}
