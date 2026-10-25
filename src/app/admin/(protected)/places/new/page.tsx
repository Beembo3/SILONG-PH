import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PlaceEditor } from "@/components/admin/place-editor";
import { Button } from "@/components/ui/button";
import { requirePageUser } from "@/lib/auth";
import { DEFAULT_LOCALITY_CODE, getDefaultLocality, getProvince } from "@/lib/geography";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Add a facility" };

export default async function NewPlacePage() {
  await requirePageUser(["SUPER_ADMIN", "PLACE_VERIFIER"]);
  const locality = getDefaultLocality();
  const province = getProvince(locality.provinceCode);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Directory</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">Add a facility</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a record only when you have a source and coordinates. New records should normally start as Pending
            verification or Unverified.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/places">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to places
          </Link>
        </Button>
      </div>

      <PlaceEditor
        initial={{
          name: "",
          category: "Public library",
          address: "",
          provinceCode: province?.code ?? "0305400000",
          localityCode: locality.code ?? DEFAULT_LOCALITY_CODE,
          latitude: locality.lat,
          longitude: locality.lon,
          operatingHours: null,
          accessibilityDetails: null,
          amenities: [],
          publicAccessDetails: null,
          contactInformation: null,
          sourceUrl: null,
          verificationStatus: "PENDING",
          verificationNote: null,
        }}
      />
    </div>
  );
}
