export function UsageIndicator({ remaining, limit }: { remaining: number; limit: number }) {
  const safeRemaining = Math.max(0, Math.min(remaining, limit));

  return (
    <div
      className="flex items-center gap-2 rounded-full border border-line bg-obsidian px-3 py-1.5"
      title={`${safeRemaining} of ${limit} analyses remaining`}
    >
      <span
        className="h-2 w-2 rounded-full bg-crimson shadow-[0_0_8px_rgba(239,68,68,0.9)]"
        aria-hidden="true"
      />
      <span className="whitespace-nowrap text-xs font-semibold text-white">
        {safeRemaining} of {limit}
      </span>
      <span className="hidden whitespace-nowrap text-xs text-muted sm:inline">remaining</span>
    </div>
  );
}
