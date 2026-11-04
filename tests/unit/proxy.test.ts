import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: mocks.createServerClient,
}));

vi.mock("@/lib/config/public", () => ({
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_ANON_KEY: "public-anon-key",
  isSupabaseConfigured: true,
}));

import { proxy } from "@/proxy";

function setUser(user: { id: string } | null) {
  mocks.createServerClient.mockReturnValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
  });
}

function request(path: string) {
  return new NextRequest(`http://localhost${path}`);
}

describe("proxy auth guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects an unauthenticated protected page to sign-in", async () => {
    setUser(null);
    const response = await proxy(request("/dashboard/upload"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/auth/sign-in?next=%2Fdashboard%2Fupload");
  });

  it("allows an unauthenticated public page", async () => {
    setUser(null);
    const response = await proxy(request("/privacy"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("sends an authenticated user away from the auth entry pages", async () => {
    setUser({ id: "user-1" });
    const response = await proxy(request("/auth/sign-in"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/dashboard");
  });

  it("allows an authenticated dashboard request", async () => {
    setUser({ id: "user-1" });
    const response = await proxy(request("/dashboard"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});
