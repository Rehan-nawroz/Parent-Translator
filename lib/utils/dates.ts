/** Date helpers. Ambiguous source phrases are never converted into invented calendar dates. */

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(locale: string): Intl.DateTimeFormat {
  const normalized = locale.trim() || "en-US";
  const cached = formatterCache.get(normalized);
  if (cached) return cached;

  let formatter: Intl.DateTimeFormat;
  try {
    formatter = new Intl.DateTimeFormat(normalized, { dateStyle: "long", timeZone: "UTC" });
  } catch {
    formatter = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" });
  }

  formatterCache.set(normalized, formatter);
  return formatter;
}

/** Formats an ISO date in the selected language without shifting the calendar day. */
export function formatIsoDate(value: string, locale = "en-US"): string {
  if (!isIsoDate(value)) return value;
  const [year, month, day] = value.split("-").map(Number);
  if (year === undefined || month === undefined || day === undefined) return value;
  return getFormatter(locale).format(new Date(Date.UTC(year, month - 1, day)));
}

export function compareIsoDates(a: string | null, b: string | null): number {
  if (a && b) return a.localeCompare(b);
  if (a) return -1;
  if (b) return 1;
  return 0;
}
