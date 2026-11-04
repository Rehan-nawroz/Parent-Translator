"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { safeAuthMessage } from "@/lib/supabase/auth-messages";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { acceptPoliciesAction } from "@/lib/supabase/consent-actions";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!acceptedTerms || !acceptedPrivacy) {
      setError("Please accept both the Terms of Use and the Privacy Notice to continue.");
      return;
    }
    if (password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The two passwords do not match.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Account creation is unavailable right now. Please try again later.");
      return;
    }

    setPending(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });

      if (signUpError) {
        setError(safeAuthMessage(signUpError.message));
        return;
      }

      if (data.session) {
        await acceptPoliciesAction();
        router.push("/dashboard");
        router.refresh();
        return;
      }

      router.push("/auth/verify-email");
    } catch {
      setError("We could not create that account. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Create account"
      title="Start with one document"
      subtitle="An account keeps your three demo analyses tied to you. We never ask for your child's name, school, or student ID."
      footer={
        <span>
          Already have an account?{" "}
          <Link
            href="/auth/sign-in"
            className="font-semibold text-ember underline underline-offset-4"
          >
            Sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Field
          id="signup-email"
          label="Email address"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="parent@example.test"
        />
        <Field
          id="signup-password"
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          hint="At least 8 characters. Never share this password."
        />
        <Field
          id="signup-confirm"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />

        <div className="space-y-3 rounded-lg border border-line bg-ink/40 p-4">
          <label className="flex items-start gap-3 text-sm leading-relaxed text-mist/85">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-line-strong bg-abyss accent-crimson"
            />
            <span>
              I have read and accept the{" "}
              <Link
                href="/terms"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-ember underline underline-offset-4"
              >
                Terms of Use
              </Link>
              .
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm leading-relaxed text-mist/85">
            <input
              type="checkbox"
              checked={acceptedPrivacy}
              onChange={(event) => setAcceptedPrivacy(event.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-line-strong bg-abyss accent-crimson"
            />
            <span>
              I have read the{" "}
              <Link
                href="/privacy"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-ember underline underline-offset-4"
              >
                Privacy Notice
              </Link>{" "}
              and understand documents are not saved by default.
            </span>
          </label>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-crimson/40 bg-crimson/10 px-4 py-3 text-sm text-ember"
          >
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </Button>

        <p className="text-center text-xs leading-relaxed text-muted">
          Email confirmation may be required before your first sign-in. You can resend it on the
          next screen.
        </p>
      </form>
    </AuthShell>
  );
}
