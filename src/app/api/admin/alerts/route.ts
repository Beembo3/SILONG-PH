import { NextResponse } from "next/server";
import { assertSameOrigin, requireApiUser } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { alertCreateSchema } from "@/lib/validation";
import { handleApiError } from "@/lib/api-errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    if (!assertSameOrigin(request)) {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }
    const user = await requireApiUser(["SUPER_ADMIN"]);
    const body = await request.json();
    const parsed = alertCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check the advisory details.", issues: parsed.error.flatten().fieldErrors },
        { status: 422 },
      );
    }
    const data = parsed.data;
    const alert = await prisma.officialAlert.create({
      data: {
        title: data.title,
        description: data.description,
        affectedArea: data.affectedArea,
        severity: data.severity,
        issuer: data.issuer,
        issuedAt: data.issuedAt,
        expiresAt: data.expiresAt,
        sourceUrl: data.sourceUrl,
        status: "ACTIVE",
        createdById: user.id,
      },
    });
    await writeAuditLog({
      actorId: user.id,
      action: "OFFICIAL_ALERT_CREATED",
      entityType: "OfficialAlert",
      entityId: alert.id,
      metadata: { issuer: alert.issuer, title: alert.title },
    });
    return NextResponse.json({ ok: true, id: alert.id }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Create official alert failed");
  }
}
