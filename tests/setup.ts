import { beforeAll, afterAll, vi } from "vitest";

process.env.AUTH_SECRET = "unit-test-secret-0123456789abcdef0123456789abcdef";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
// Prisma only needs a syntactically valid URL at import time. Unit tests that
// touch the database are intentionally not part of the default suite.
process.env.DATABASE_URL ??= "mysql://root@127.0.0.1:3306/silong_test";
// Redis must not be used by unit tests. Every Redis helper is designed to fail
// open, but removing the URL guarantees the in-process path is exercised.
delete process.env.REDIS_URL;
delete process.env.CRON_SECRET;

beforeAll(() => {
  vi.stubEnv("TZ", "Asia/Manila");
});

afterAll(() => {
  vi.unstubAllEnvs();
});
