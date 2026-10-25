import { NextResponse } from "next/server";
import { assertSameOrigin, requireApiUser } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { reportUpdateSchema } from "@/lib/validation";
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
    const user = await requireApiUser(["SUPER_ADMIN", "CONTENT_ADMIN", "PLACE_VERIFIER"]);
    const { id } = await params;
    const body = await request.json();
    const parsed = reportUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check the moderation details.", issues: parsed.error.flatten().fieldErrors },
        { status: 422 },
      );
    }
    const report = await prisma.facilityReport.update({
      where: { id },
      data: {
        status: parsed.data.status,
        moderatorNote: parsed.data.moderatorNote,
        reviewedAt: new Date(),
        reviewedById: user.id,
      },
    });
    await writeAuditLog({
      actorId: user.id,
      action: "REPORT_REVIEWED",
      entityType: "FacilityReport",
      entityId: report.id,
      metadata: { status: report.status },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error, "Review report failed");
  }
}
