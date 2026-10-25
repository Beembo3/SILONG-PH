import { beforeEach, describe, expect, it, vi } from "vitest";
import { jwtVerify } from "jose";

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: () => undefined,
    set: vi.fn(),
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

import {
  ApiAuthError,
  ROLE_LABELS,
  SESSION_MAX_AGE_SECONDS,
  assertSameOrigin,
  createSessionToken,
  hasRole,
  hashPassword,
  verifyPassword,
  type Role,
  type SessionUser,
} from "@/lib/auth";

const user: SessionUser = {
  id: "user_test_1",
  email: "admin@example.com",
  name: "Test Administrator",
  role: "SUPER_ADMIN",
};

describe("roles", () => {
  it("defines a label for every role", () => {
    for (const role of ["SUPER_ADMIN", "CONTENT_ADMIN", "PLACE_VERIFIER"] as Role[]) {
      expect(ROLE_LABELS[role].length).toBeGreaterThan(0);
    }
  });

  it("checks roles safely for null users", () => {
    expect(hasRole(null, ["SUPER_ADMIN"])).toBe(false);
    expect(hasRole(user, ["SUPER_ADMIN"])).toBe(true);
    expect(hasRole(user, ["CONTENT_ADMIN"])).toBe(false);
    expect(hasRole({ ...user, role: "PLACE_VERIFIER" }, ["SUPER_ADMIN", "PLACE_VERIFIER"])).toBe(true);
  });
});

describe("session tokens", () => {
  it("signs an eight-hour JWT with the expected claims", async () => {
    const token = await createSessionToken(user);
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      issuer: "silong-ph",
      audience: "silong-ph-admin",
    });

    expect(payload.sub).toBe(user.id);
    expect(payload.email).toBe(user.email);
    expect(payload.name).toBe(user.name);
    expect(payload.role).toBe("SUPER_ADMIN");
    expect(payload.iss).toBe("silong-ph");
    expect(payload.aud).toBe("silong-ph-admin");
    expect(Number(payload.exp) - Number(payload.iat)).toBe(SESSION_MAX_AGE_SECONDS);
  });

  it("does not accept a token signed with another secret", async () => {
    const token = await createSessionToken(user);
    const wrongSecret = new TextEncoder().encode("a-different-secret-0123456789abcdef");
    await expect(
      jwtVerify(token, wrongSecret, { issuer: "silong-ph", audience: "silong-ph-admin" }),
    ).rejects.toBeTruthy();
  });
});

describe("password hashing", () => {
  it("hashes and verifies a password without storing plaintext", async () => {
    const hash = await hashPassword("SilongPH2026!");
    expect(hash).not.toBe("SilongPH2026!");
    expect(hash.startsWith("$2")).toBe(true);
    await expect(verifyPassword("SilongPH2026!", hash)).resolves.toBe(true);
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  }, 20_000);
});

describe("assertSameOrigin", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  });

  it("accepts the configured origin", () => {
    const request = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { origin: "http://localhost:3000" },
    });
    expect(assertSameOrigin(request)).toBe(true);
  });

  it("accepts the request URL origin when it matches", () => {
    const request = new Request("http://127.0.0.1:3000/api/reports", {
      method: "POST",
      headers: { origin: "http://127.0.0.1:3000" },
    });
    expect(assertSameOrigin(request)).toBe(true);
  });

  it("rejects a foreign origin, a missing origin, and a malformed origin", () => {
    const foreign = new Request("http://localhost:3000/api/reports", {
      method: "POST",
      headers: { origin: "https://evil.example" },
    });
    expect(assertSameOrigin(foreign)).toBe(false);

    const missing = new Request("http://localhost:3000/api/reports", { method: "POST" });
    expect(assertSameOrigin(missing)).toBe(false);

    const malformed = new Request("http://localhost:3000/api/reports", {
      method: "POST",
      headers: { origin: "not a url" },
    });
    expect(assertSameOrigin(malformed)).toBe(false);
  });
});

describe("ApiAuthError", () => {
  it("carries an HTTP status", () => {
    const unauthorized = new ApiAuthError("Authentication required.", 401);
    const forbidden = new ApiAuthError("Forbidden.", 403);
    expect(unauthorized.status).toBe(401);
    expect(forbidden.status).toBe(403);
    expect(unauthorized).toBeInstanceOf(Error);
  });
});
