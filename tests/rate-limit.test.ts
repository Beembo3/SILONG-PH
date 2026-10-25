import { beforeEach, describe, expect, it } from "vitest";
import {
  clientKey,
  rateLimit,
  rateLimitAsync,
  resetRateLimits,
} from "@/lib/rate-limit";

beforeEach(() => {
  resetRateLimits();
});

describe("in-process rate limiting", () => {
  it("allows up to the limit and then blocks with a retry window", () => {
    const first = rateLimit("login:test", 2, 1_000, 1_000);
    const second = rateLimit("login:test", 2, 1_000, 1_100);
    const third = rateLimit("login:test", 2, 1_000, 1_200);

    expect(first).toEqual({ allowed: true, remaining: 1, retryAfterSeconds: 0 });
    expect(second).toEqual({ allowed: true, remaining: 0, retryAfterSeconds: 0 });
    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
    expect(third.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets after the window", () => {
    rateLimit("report:test", 1, 1_000, 1_000);
    expect(rateLimit("report:test", 1, 1_000, 1_500).allowed).toBe(false);
    expect(rateLimit("report:test", 1, 1_000, 2_001).allowed).toBe(true);
  });

  it("isolates keys", () => {
    rateLimit("login:a", 1, 1_000, 1_000);
    expect(rateLimit("login:b", 1, 1_000, 1_000).allowed).toBe(true);
  });

  it("falls back to process memory when Redis is not configured", async () => {
    const first = await rateLimitAsync("login:fallback", 1, 1_000);
    const second = await rateLimitAsync("login:fallback", 1, 1_000);
    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(false);
  });
});

describe("clientKey", () => {
  function requestWithIp(ip?: string): Request {
    const headers = new Headers();
    if (ip) headers.set("x-forwarded-for", ip);
    return new Request("http://localhost:3000/api/reports", { headers });
  }

  it("hashes the client IP instead of storing it raw", () => {
    const key = clientKey(requestWithIp("203.0.113.10"), "report");
    expect(key.startsWith("report:")).toBe(true);
    expect(key).not.toContain("203.0.113.10");
    expect(key.length).toBeGreaterThan("report:".length);
  });

  it("is stable for the same IP and different for another IP", () => {
    const a = clientKey(requestWithIp("203.0.113.10"), "login");
    const b = clientKey(requestWithIp("203.0.113.10"), "login");
    const c = clientKey(requestWithIp("203.0.113.11"), "login");
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });

  it("uses the first forwarded address and a local fallback", () => {
    const first = clientKey(requestWithIp("203.0.113.10, 10.0.0.1"), "login");
    const direct = clientKey(requestWithIp("203.0.113.10"), "login");
    expect(first).toBe(direct);
    expect(clientKey(requestWithIp(), "login")).toContain("login:");
  });

  it("scopes keys by purpose", () => {
    const login = clientKey(requestWithIp("203.0.113.10"), "login");
    const report = clientKey(requestWithIp("203.0.113.10"), "report");
    expect(login).not.toBe(report);
  });
});
