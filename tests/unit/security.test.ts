import { beforeEach, describe, expect, it } from "vitest";

import { getLanguageOption } from "@/lib/config/languages";
import { checkRateLimit, resetRateLimits } from "@/lib/security/request-limits";
import { sanitizeResourceUrl, sanitizeText, stripJsonFence } from "@/lib/security/sanitize";
import { formatIsoDate } from "@/lib/utils/dates";
import { createRequestId } from "@/lib/utils/ids";
import { maskEmail, normalizeWhitespace } from "@/lib/utils/text";

describe("sanitizers", () => {
  it("unwraps fenced JSON", () => {
    expect(stripJsonFence('```json\n{"a":1}\n```')).toBe('{"a":1}');
    expect(stripJsonFence('{"a":1}')).toBe('{"a":1}');
  });

  it("removes markup from model text", () => {
    const output = sanitizeText('<script>alert("x")</script>Hello <b>parent</b>');
    expect(output).not.toContain("<");
    expect(output).toContain("Hello");
  });

  it("allows only https official resources", () => {
    expect(sanitizeResourceUrl("https://www2.ed.gov/about/landing.jhtml")).toContain("ed.gov");
    expect(sanitizeResourceUrl("http://www2.ed.gov")).toBeNull();
    expect(sanitizeResourceUrl("https://example.com")).toBeNull();
  });
});

describe("rate limiting", () => {
  beforeEach(() => resetRateLimits());

  it("blocks requests after the limit and recovers after the window", () => {
    const options = { limit: 2, windowMs: 1000, now: 0 };

    expect(checkRateLimit("user", options).allowed).toBe(true);
    expect(checkRateLimit("user", options).allowed).toBe(true);

    const blocked = checkRateLimit("user", options);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(1);

    expect(checkRateLimit("user", { ...options, now: 1001 }).allowed).toBe(true);
  });

  it("keeps separate buckets per key", () => {
    expect(checkRateLimit("a", { limit: 1, now: 0 }).allowed).toBe(true);
    expect(checkRateLimit("b", { limit: 1, now: 0 }).allowed).toBe(true);
  });
});

describe("display helpers", () => {
  it("creates non-personal request IDs", () => {
    expect(createRequestId()).toMatch(/^req_[a-z0-9]+$/);
  });

  it("masks an email address", () => {
    expect(maskEmail("parent@example.test")).toBe("pa••••@example.test");
  });

  it("keeps dates and acronyms while normalizing whitespace", () => {
    expect(normalizeWhitespace("  IEP   meeting on March 12, 2026 \n\n\n")).toBe(
      "IEP meeting on March 12, 2026",
    );
  });

  it("formats dates in the selected language without shifting the day", () => {
    expect(formatIsoDate("2026-03-06", "en-US")).toBe("March 6, 2026");
    expect(formatIsoDate("2026-03-06", "es")).toContain("marzo");
    expect(formatIsoDate("2026-03-06", "ar")).toContain("مارس");
  });

  it("marks Arabic text as right-to-left", () => {
    expect(getLanguageOption("ar").direction).toBe("rtl");
    expect(getLanguageOption("en").direction).toBe("ltr");
  });
});
