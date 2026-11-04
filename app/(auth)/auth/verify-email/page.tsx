"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleResend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Email confirmation is unavailable right now. Please try again later.");
      return;
    }

    setPending(true);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
      });
      if (resendError) {
        setError("We could not resend that email. Please wait a moment and try again.");
        return;
      }
      setMessage("If that address needs confirmation, a new email is on its way.");
      setCooldown(45);
    } catch {
      setError("We could not resend that email. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function handleContinue() {
    setError(null);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Email confirmation is unavailable right now. Please try again later.");
      return;
    }

    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setError("We could not find a confirmed session yet. Check your inbox, then try again.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthShell
      eyebrow="One last step"
      title="Check your email"
      subtitle="If your account needs confirmation, open the message we sent and follow the link. Check spam or junk if it is not there."
      footer={
        <span>
          Already confirmed?{" "}
          <Link
            href="/auth/sign-in"
            className="font-semibold text-ember underline underline-offset-4"
          >
            Sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={handleResend} className="space-y-5" noValidate>
        <Field
          id="verify-email"
          label="Email used for the account"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="parent@example.test"
        />

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-crimson/40 bg-crimson/10 px-4 py-3 text-sm text-ember"
          >
            {error}
          </p>
        )}
        {message && (
          <p
            role="status"
            className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
          >
            {message}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending || cooldown > 0}>
          {pending
            ? "Sending…"
            : cooldown > 0
              ? `Resend available in ${cooldown}s`
              : "Resend confirmation email"}
        </Button>
        <Button type="button" variant="secondary" className="w-full" onClick={handleContinue}>
          I have confirmed, continue
        </Button>
      </form>
    </AuthShell>
  );
}
