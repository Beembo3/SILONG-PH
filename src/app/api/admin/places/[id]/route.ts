import { NextResponse } from "next/server";
import { assertSameOrigin, requireApiUser } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { placeUpdateSchema } from "@/lib/validation";
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
    const user = await requireApiUser(["SUPER_ADMIN", "PLACE_VERIFIER"]);
    const { id } = await params;
    const existing = await prisma.coolingPlace.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Cooling place not found." }, { status: 404 });
    }
    const body = await request.json();
    const parsed = placeUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check the place details.", issues: parsed.error.flatten().fieldErrors },
        { status: 422 },
      );
    }
    const data = parsed.data;
    const verified = data.verificationStatus === "VERIFIED";
    const place = await prisma.coolingPlace.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.address !== undefined ? { address: data.address } : {}),
        ...(data.provinceCode !== undefined ? { provinceCode: data.provinceCode } : {}),
        ...(data.localityCode !== undefined ? { localityCode: data.localityCode } : {}),
        ...(data.latitude !== undefined ? { latitude: data.latitude } : {}),
        ...(data.longitude !== undefined ? { longitude: data.longitude } : {}),
        ...(data.operatingHours !== undefined ? { operatingHours: data.operatingHours } : {}),
        ...(data.accessibilityDetails !== undefined
          ? { accessibilityDetails: data.accessibilityDetails }
          : {}),
        ...(data.amenities !== undefined ? { amenities: JSON.stringify(data.amenities) } : {}),
        ...(data.publicAccessDetails !== undefined
          ? { publicAccessDetails: data.publicAccessDetails }
          : {}),
        ...(data.contactInformation !== undefined
          ? { contactInformation: data.contactInformation }
          : {}),
        ...(data.sourceUrl !== undefined ? { sourceUrl: data.sourceUrl } : {}),
        ...(data.verificationStatus !== undefined
          ? {
              verificationStatus: data.verificationStatus,
              verifiedAt: verified ? new Date() : existing.verifiedAt,
              verifiedById: verified ? user.id : existing.verifiedById,
            }
          : {}),
        ...(data.verificationNote !== undefined ? { verificationNote: data.verificationNote } : {}),
        lastReviewedAt: new Date(),
      },
    });
    await writeAuditLog({
      actorId: user.id,
      action: "PLACE_UPDATED",
      entityType: "CoolingPlace",
      entityId: place.id,
      metadata: {
        fields: Object.keys(data),
        verificationStatus: place.verificationStatus,
      },
    });
    return NextResponse.json({ ok: true, id: place.id, verificationStatus: place.verificationStatus });
  } catch (error) {
    return handleApiError(error, "Update cooling place failed");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!assertSameOrigin(request)) {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }
    const user = await requireApiUser(["SUPER_ADMIN", "PLACE_VERIFIER"]);
    const { id } = await params;
    const place = await prisma.coolingPlace.update({
      where: { id },
      data: { archivedAt: new Date() },
    });
    await writeAuditLog({
      actorId: user.id,
      action: "PLACE_ARCHIVED",
      entityType: "CoolingPlace",
      entityId: place.id,
      metadata: { name: place.name },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error, "Archive cooling place failed");
  }
}
