import { describe, expect, it } from "vitest";

import { normalizeExtractedText } from "@/lib/documents/normalize";
import { compareIsoDates, formatIsoDate, isIsoDate } from "@/lib/utils/dates";

describe("normalizeExtractedText", () => {
  it("cleans spacing artifacts without losing dates, grades, or amounts", () => {
    const output = normalizeExtractedText(
      "IEP\u00a0meeting\r\n\r\n\r\nGrade 4 — 2026-03-06\u00ad\nTuition: $12.50",
    );

    expect(output).toContain("IEP meeting");
    expect(output).toContain("Grade 4");
    expect(output).toContain("2026-03-06");
    expect(output).toContain("$12.50");
    expect(output).not.toContain("\u00a0");
    expect(output).not.toContain("\u00ad");
    expect(output).toContain("\n\n");
  });
});

describe("ISO date helpers", () => {
  it("accepts real leap days and rejects impossible dates", () => {
    expect(isIsoDate("2024-02-29")).toBe(true);
    expect(isIsoDate("2026-02-29")).toBe(false);
    expect(isIsoDate("2026-13-01")).toBe(false);
    expect(isIsoDate("March 6, 2026")).toBe(false);
  });

  it("leaves ambiguous display text untouched and orders ISO dates", () => {
    expect(formatIsoDate("next Friday")).toBe("next Friday");
    expect(formatIsoDate("2026-03-06", "en-US")).toBe("March 6, 2026");
    expect(compareIsoDates("2026-03-06", "2026-04-01")).toBeLessThan(0);
    expect(compareIsoDates(null, "2026-04-01")).toBeGreaterThan(0);
    expect(compareIsoDates(null, null)).toBe(0);
  });
});
