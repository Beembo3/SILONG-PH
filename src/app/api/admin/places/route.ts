import { NextResponse } from "next/server";
import { assertSameOrigin, requireApiUser } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { placeCreateSchema } from "@/lib/validation";
import { handleApiError } from "@/lib/api-errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    if (!assertSameOrigin(request)) {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }
    const user = await requireApiUser(["SUPER_ADMIN", "PLACE_VERIFIER"]);
    const body = await request.json();
    const parsed = placeCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check the place details.", issues: parsed.error.flatten().fieldErrors },
        { status: 422 },
      );
    }
    const data = parsed.data;
    const place = await prisma.coolingPlace.create({
      data: {
        name: data.name,
        category: data.category,
        address: data.address,
        provinceCode: data.provinceCode,
        localityCode: data.localityCode,
        latitude: data.latitude,
        longitude: data.longitude,
        operatingHours: data.operatingHours,
        accessibilityDetails: data.accessibilityDetails,
        amenities: JSON.stringify(data.amenities),
        publicAccessDetails: data.publicAccessDetails,
        contactInformation: data.contactInformation,
        sourceUrl: data.sourceUrl,
        verificationStatus: data.verificationStatus,
        verifiedAt: data.verificationStatus === "VERIFIED" ? new Date() : null,
        verifiedById: data.verificationStatus === "VERIFIED" ? user.id : null,
        lastReviewedAt: new Date(),
        createdById: user.id,
      },
    });
    await writeAuditLog({
      actorId: user.id,
      action: "PLACE_CREATED",
      entityType: "CoolingPlace",
      entityId: place.id,
      metadata: { name: place.name, status: place.verificationStatus },
    });
    return NextResponse.json({ ok: true, id: place.id }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Create cooling place failed");
  }
}
