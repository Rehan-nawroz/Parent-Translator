import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));

import { getCurrentUser } from "@/lib/supabase/auth";
import { safeAuthMessage } from "@/lib/supabase/auth-messages";

describe("getCurrentUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when Supabase is not configured", async () => {
    mocks.createSupabaseServerClient.mockResolvedValue(null);
    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it("returns null when the session is missing or invalid", async () => {
    mocks.createSupabaseServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    });
    await expect(getCurrentUser()).resolves.toBeNull();

    mocks.createSupabaseServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: { message: "expired" } }),
      },
    });
    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it("returns only the verified id and email", async () => {
    mocks.createSupabaseServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-1",
              email: "parent@example.test",
              user_metadata: { privateField: "do not expose" },
            },
          },
          error: null,
        }),
      },
    });

    await expect(getCurrentUser()).resolves.toEqual({
      id: "user-1",
      email: "parent@example.test",
    });
  });
});

describe("safeAuthMessage", () => {
  it("maps common failures without echoing provider text", () => {
    expect(safeAuthMessage("Invalid login credentials")).toBe(
      "That email or password did not match. Please try again.",
    );
    expect(safeAuthMessage("Email not confirmed")).toBe(
      "Please confirm your email address before signing in.",
    );
    expect(safeAuthMessage("rate limit exceeded")).toBe(
      "Too many attempts. Please wait a minute and try again.",
    );
    expect(safeAuthMessage("unexpected provider detail")).toBe(
      "We could not complete that request. Please try again.",
    );
  });
});
