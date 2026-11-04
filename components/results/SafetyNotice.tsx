import { ShieldAlert } from "lucide-react";

export function SafetyNotice({ notes }: { notes: string[] }) {
  return (
    <div className="rounded-xl border border-line bg-obsidian/60 p-4">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        <ShieldAlert className="h-4 w-4 text-crimson" aria-hidden="true" />
        Limits of this brief
      </p>
      <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted">
        {notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
        <li>
          The document is the authority. Verify important dates and services with your school.
        </li>
        <li>This is an educational explanation, not legal advice.</li>
      </ul>
    </div>
  );
}
