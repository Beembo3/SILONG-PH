import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientKey, rateLimitAsync } from "@/lib/rate-limit";
import { assertSameOrigin } from "@/lib/auth";
import { reportSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  const limit = await rateLimitAsync(clientKey(request, "report"), 5, 60 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Masyadong maraming report mula sa koneksyong ito. Subukan muli mamaya." },
      { status: 429, headers: { "retry-after": String(limit.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dapat valid JSON ang request body." }, { status: 400 });
  }
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "I-check ang detalye ng report.", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const data = parsed.data;
  if (data.coolingPlaceId) {
    const place = await prisma.coolingPlace.findUnique({
      where: { id: data.coolingPlaceId },
      select: { id: true },
    });
    if (!place) {
      return NextResponse.json({ error: "The selected cooling place no longer exists." }, { status: 404 });
    }
  }
  if (data.reportType === "NEW_LOCATION") {
    if (!data.proposedName || !data.proposedAddress || !data.proposedLocalityCode) {
      return NextResponse.json(
        { error: "New-location reports need a proposed name, address, and locality." },
        { status: 422 },
      );
    }
  }

  const report = await prisma.facilityReport.create({
    data: {
      coolingPlaceId: data.coolingPlaceId,
      reportType: data.reportType,
      description: data.description,
      proposedName: data.proposedName,
      proposedAddress: data.proposedAddress,
      proposedLocalityCode: data.proposedLocalityCode,
    },
    select: { id: true, submittedAt: true },
  });

  return NextResponse.json(
    {
      ok: true,
      id: report.id,
      submittedAt: report.submittedAt,
      message:
        "Salamat. Nasa moderation queue ang report mo. Hindi ito napi-publish bilang verified hanggang suriin ng awtorisadong reviewer.",
    },
    { status: 201 },
  );
}
