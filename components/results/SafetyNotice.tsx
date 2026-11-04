import { ShieldAlert } from "lucide-react";

import type { LanguageCode } from "@/lib/config/languages";

export function SafetyNotice({ notes, language }: { notes: string[]; language?: LanguageCode }) {
  return (
    <div className="rounded-xl border border-line bg-obsidian/60 p-4">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        <ShieldAlert className="h-4 w-4 text-crimson" aria-hidden="true" />
        Limits of this brief
      </p>
      <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted">
        {notes.map((note) => (
          <li key={note} lang={language}>
            {note}
          </li>
        ))}
        <li>
          The document is the authority. Verify important dates and services with your school.
        </li>
        <li>This is an educational explanation, not legal advice.</li>
        <li>
          This brief cannot decide legal rights, eligibility, or services. Contact your school
          district or a qualified advocate for those questions.
        </li>
      </ul>
    </div>
  );
}
