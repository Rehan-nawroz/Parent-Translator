import { LANGUAGES, type LanguageCode } from "@/lib/config/languages";

export function LanguageSelector({
  value,
  onChange,
  disabled,
}: {
  value: LanguageCode;
  onChange: (value: LanguageCode) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label htmlFor="output-language" className="block text-sm font-medium text-white">
        Translate the brief into
      </label>
      <p id="output-language-hint" className="mt-1 text-xs text-muted">
        All four sections and the draft email will be written in this language.
      </p>
      <select
        id="output-language"
        value={value}
        disabled={disabled}
        aria-describedby="output-language-hint"
        onChange={(event) => onChange(event.target.value as LanguageCode)}
        className="mt-2 min-h-12 w-full rounded-lg border border-line-strong bg-abyss/75 px-3 text-sm text-white transition focus:border-crimson focus:outline-none focus:ring-2 focus:ring-crimson/25 disabled:opacity-60"
      >
        {LANGUAGES.map((language) => (
          <option key={language.code} value={language.code}>
            {language.nativeLabel}
            {language.nativeLabel === language.label ? "" : ` (${language.label})`}
          </option>
        ))}
      </select>
    </div>
  );
}
