import { NextResponse } from "next/server";
import { assertSameOrigin, requireApiUser } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { alertUpdateSchema } from "@/lib/validation";
import { handleApiError } from "@/lib/api-errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!assertSameOrigin(request)) {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }
    const user = await requireApiUser(["SUPER_ADMIN"]);
    const { id } = await params;
    const body = await request.json();
    const parsed = alertUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Choose a valid advisory status.", issues: parsed.error.flatten().fieldErrors },
        { status: 422 },
      );
    }
    const alert = await prisma.officialAlert.update({
      where: { id },
      data: { status: parsed.data.status },
    });
    await writeAuditLog({
      actorId: user.id,
      action: "OFFICIAL_ALERT_STATUS_CHANGED",
      entityType: "OfficialAlert",
      entityId: alert.id,
      metadata: { status: alert.status, title: alert.title },
    });
    return NextResponse.json({ ok: true, status: alert.status });
  } catch (error) {
    return handleApiError(error, "Update official alert failed");
  }
}
