"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { safeAuthMessage } from "@/lib/supabase/auth-messages";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Sign-in is unavailable right now. Please try again later.");
      return;
    }

    setPending(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(safeAuthMessage(signInError.message));
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("We could not sign you in. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in"
      subtitle="Your documents and results stay in this session only. Signing in restores your account and remaining analyses."
      footer={
        <span>
          New here?{" "}
          <Link
            href="/auth/sign-up"
            className="font-semibold text-ember underline underline-offset-4"
          >
            Create an account
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Field
          id="signin-email"
          label="Email address"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="parent@example.test"
        />
        <Field
          id="signin-password"
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-crimson/40 bg-crimson/10 px-4 py-3 text-sm text-ember"
          >
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <Link
            href="/auth/forgot-password"
            className="text-muted underline underline-offset-4 hover:text-white"
          >
            Forgot your password?
          </Link>
          <Link
            href="/auth/verify-email"
            className="text-muted underline underline-offset-4 hover:text-white"
          >
            Resend confirmation email
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
