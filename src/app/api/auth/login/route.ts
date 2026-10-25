import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin, setSessionCookie, verifyPassword, type Role } from "@/lib/auth";
import { clientKey, rateLimitAsync } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";
import { writeAuditLog } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  const limit = await rateLimitAsync(clientKey(request, "login"), 6, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many sign-in attempts. Please wait before trying again." },
      { status: 429, headers: { "retry-after": String(limit.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 422 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  const valid = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false;
  if (!user || !valid || !user.isActive) {
    await writeAuditLog({
      actorId: null,
      action: "LOGIN_FAILED",
      entityType: "User",
      entityId: user?.id ?? null,
      metadata: { email: parsed.data.email },
    });
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await setSessionCookie({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
  });
  await writeAuditLog({
    actorId: user.id,
    action: "LOGIN_SUCCESS",
    entityType: "User",
    entityId: user.id,
  });
  return NextResponse.json({ ok: true, role: user.role });
}
