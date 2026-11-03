/**
 * Supported output languages, shared by the UI and the API.
 *
 * The same list must be used to validate the `language` field of an analysis request and to
 * render the language picker, so a request can never ask for a language the UI does not offer.
 */

export const LANGUAGE_CODES = ["en", "es", "vi", "zh-Hans", "ar", "tl"] as const;

export type LanguageCode = (typeof LANGUAGE_CODES)[number];

export type TextDirection = "ltr" | "rtl";

export type LanguageOption = {
  code: LanguageCode;
  /** English name, used in policy and diagnostics copy. */
  label: string;
  /** Name written in the language itself, shown in the picker. */
  nativeLabel: string;
  direction: TextDirection;
};

export const LANGUAGES: readonly LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English", direction: "ltr" },
  { code: "es", label: "Spanish", nativeLabel: "Español", direction: "ltr" },
  { code: "vi", label: "Vietnamese", nativeLabel: "Tiếng Việt", direction: "ltr" },
  { code: "zh-Hans", label: "Chinese (Simplified)", nativeLabel: "简体中文", direction: "ltr" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", direction: "rtl" },
  { code: "tl", label: "Tagalog", nativeLabel: "Tagalog", direction: "ltr" },
];

export const DEFAULT_LANGUAGE: LanguageCode = "en";

export function isLanguageCode(value: unknown): value is LanguageCode {
  return typeof value === "string" && (LANGUAGE_CODES as readonly string[]).includes(value);
}

export function getLanguageOption(code: LanguageCode): LanguageOption {
  const option = LANGUAGES.find((language) => language.code === code);
  // Unreachable while LANGUAGES covers LANGUAGE_CODES; keeps callers free of undefined checks.
  return option ?? { code, label: code, nativeLabel: code, direction: "ltr" };
}
