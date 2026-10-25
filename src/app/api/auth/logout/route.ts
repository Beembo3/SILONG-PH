import { NextResponse } from "next/server";
import { assertSameOrigin, clearSessionCookie, getCurrentUser } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  const user = await getCurrentUser();
  await clearSessionCookie();
  if (user) {
    await writeAuditLog({
      actorId: user.id,
      action: "LOGOUT",
      entityType: "User",
      entityId: user.id,
    });
  }
  return NextResponse.json({ ok: true });
}
