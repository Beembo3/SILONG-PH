import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PlaceEditor } from "@/components/admin/place-editor";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requirePageUser } from "@/lib/auth";
import { formatPST } from "@/lib/format";
import { parseAmenities, VERIFICATION_LABELS, type VerificationStatus } from "@/lib/places";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const place = await prisma.coolingPlace.findUnique({ where: { id }, select: { name: true } });
  return { title: place ? `Edit ${place.name}` : "Facility not found" };
}

export default async function EditPlacePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageUser(["SUPER_ADMIN", "PLACE_VERIFIER"]);
  const { id } = await params;
  const place = await prisma.coolingPlace.findUnique({ where: { id } });
  if (!place) notFound();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Directory</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">{place.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {place.category} · last updated {formatPST(place.updatedAt)}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant={place.verificationStatus === "VERIFIED" ? "success" : "warning"}>
              {VERIFICATION_LABELS[place.verificationStatus as VerificationStatus] ?? place.verificationStatus}
            </Badge>
            {place.osmId ? <Badge variant="outline">OSM {place.osmId}</Badge> : null}
            {place.archivedAt ? <Badge variant="danger">Archived</Badge> : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/cool-places/${place.id}`}>View public page</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/places">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to places
            </Link>
          </Button>
        </div>
      </div>

      {place.archivedAt ? (
        <Alert variant="warning" title="This record is archived">
          Archived records are read-only in this interface and are hidden from the public directory. They are retained
          for audit. Restore a record only through a deliberate database operation after review.
        </Alert>
      ) : (
        <PlaceEditor
          initial={{
            id: place.id,
            name: place.name,
            category: place.category,
            address: place.address,
            provinceCode: place.provinceCode,
            localityCode: place.localityCode,
            latitude: place.latitude,
            longitude: place.longitude,
            operatingHours: place.operatingHours,
            accessibilityDetails: place.accessibilityDetails,
            amenities: parseAmenities(place.amenities),
            publicAccessDetails: place.publicAccessDetails,
            contactInformation: place.contactInformation,
            sourceUrl: place.sourceUrl,
            verificationStatus: place.verificationStatus,
            verificationNote: place.verificationNote,
          }}
        />
      )}
    </div>
  );
}
