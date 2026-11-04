/** Conservative sanitizers. Model output is rendered as text, never as trusted markup. */

export function stripControlChars(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ");
}

/** Removes HTML-looking tags so model text cannot masquerade as markup. */
export function stripHtmlTags(value: string): string {
  return value.replace(/<\/?[a-zA-Z][^>]*>/g, " ");
}

/** Removes a single Markdown code fence wrapper the provider may add around JSON. */
export function stripJsonFence(value: string): string {
  const trimmed = value.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return (fenced?.[1] ?? trimmed).trim();
}

export function sanitizeText(value: string): string {
  return stripControlChars(stripHtmlTags(value))
    .replace(/[ \t]+/g, " ")
    .trim();
}

/** Only https links to allowlisted hosts may ever be surfaced. */
const ALLOWED_HOSTS = new Set(["www2.ed.gov", "sites.ed.gov", "www.understood.org"]);

export function sanitizeResourceUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    if (!ALLOWED_HOSTS.has(url.hostname)) return null;
    url.username = "";
    url.password = "";
    return url.toString();
  } catch {
    return null;
  }
}
