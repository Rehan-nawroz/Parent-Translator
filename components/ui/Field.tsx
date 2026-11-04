import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
};

export function Field({ id, label, hint, error, className, ...props }: FieldProps) {
  const describedBy =
    [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-white">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "mt-2 min-h-12 w-full rounded-lg border bg-abyss/75 px-4 text-sm text-white placeholder:text-muted/70 transition focus:border-crimson focus:outline-none focus:ring-2 focus:ring-crimson/25",
          error ? "border-crimson/60" : "border-line-strong",
          className,
        )}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-ember">
          {error}
        </p>
      )}
    </div>
  );
}
