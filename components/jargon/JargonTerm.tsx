"use client";

export function JargonTerm({
  term,
  expanded,
  onClick,
}: {
  term: string;
  expanded?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-expanded={expanded ?? false}
      className="rounded-md border border-crimson/25 bg-crimson/5 px-2.5 py-1 text-xs font-medium text-ember underline decoration-crimson/60 decoration-dotted underline-offset-4 transition hover:bg-crimson/15 hover:text-white"
    >
      {term}
    </button>
  );
}
