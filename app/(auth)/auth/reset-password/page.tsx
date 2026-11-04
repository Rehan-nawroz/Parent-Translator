"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { safeAuthMessage } from "@/lib/supabase/auth-messages";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

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
      setError("Password reset is unavailable right now. Please try again later.");
      return;
    }

    setPending(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(
          updateError.message.toLowerCase().includes("session")
            ? "This reset link is invalid or has expired. Request a new one."
            : safeAuthMessage(updateError.message),
        );
        return;
      }
      setDone(true);
    } catch {
      setError("We could not update that password. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Choose a new password"
      subtitle="Use at least 8 characters. You will use this password the next time you sign in."
      footer={
        <span>
          <Link
            href="/auth/sign-in"
            className="font-semibold text-ember underline underline-offset-4"
          >
            Return to sign in
          </Link>
        </span>
      }
    >
      {done ? (
        <div className="space-y-4">
          <p
            role="status"
            className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
          >
            Your password was updated. You can sign in with the new password.
          </p>
          <Link href="/auth/sign-in" className="block">
            <Button className="w-full">Go to sign in</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Field
            id="reset-password"
            label="New password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            hint="At least 8 characters."
          />
          <Field
            id="reset-confirm"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
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
            {pending ? "Updating…" : "Update password"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
