export default function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div
        role="status"
        aria-label="Loading"
        className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-crimson"
      />
    </div>
  );
}
