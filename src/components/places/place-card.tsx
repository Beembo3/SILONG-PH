import Link from "next/link";
import { Accessibility, ArrowRight, Droplets, MapPin, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  openStateLabel,
  placeCategoryLabel,
  VERIFICATION_DISPLAY_DESCRIPTIONS,
  VERIFICATION_DISPLAY_LABELS,
  verificationVariant,
  type VerificationStatus,
} from "@/lib/places";
import { formatNumber } from "@/lib/format";

export interface PlaceCardData {
  id: string;
  name: string;
  category: string;
  address: string;
  verificationStatus: string;
  operatingHours: string | null;
  amenities: string[];
  distanceKm: number | null;
  openState: { known: boolean; open: boolean | null; label: string };
}

export function PlaceCard({ place }: { place: PlaceCardData }) {
  const status = place.verificationStatus as VerificationStatus;
  const hasWater = place.amenities.some((a) => a.toLowerCase().includes("drinking water"));
  const hasAccess = place.amenities.some((a) => a.toLowerCase().includes("wheelchair"));
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col pt-5 sm:pt-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <Badge variant={verificationVariant(place.verificationStatus)}>
            {VERIFICATION_DISPLAY_LABELS[status] ?? "Hindi pa beripikado"}
          </Badge>
          {place.distanceKm != null ? (
            <span className="text-xs font-semibold text-muted-foreground">
              {formatNumber(place.distanceKm, 1)} km ang layo
            </span>
          ) : null}
        </div>
        <h3 className="mt-3 break-words text-base font-bold leading-snug text-navy">{place.name}</h3>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-orange-700">
          {placeCategoryLabel(place.category)}
        </p>
        <p className="mt-2 flex min-w-0 items-start gap-1.5 break-words text-sm text-slate-600">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
          {place.address}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {hasWater ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-800">
              <Droplets className="h-3 w-3" aria-hidden="true" /> May iniulat na tubig
            </span>
          ) : null}
          {hasAccess ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-800">
              <Accessibility className="h-3 w-3" aria-hidden="true" /> May wheelchair access
            </span>
          ) : null}
          {place.operatingHours ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-slate-700">
              {openStateLabel(place.openState.label)}
            </span>
          ) : null}
        </div>

        {status !== "VERIFIED" ? (
          <p className="mt-3 rounded-lg bg-amber-50 p-2 text-[11px] leading-relaxed text-amber-950">
            {status === "UNVERIFIED"
              ? "Hindi kumpirmadong cooling center. Hindi pa sinuri ang public access at pagiging angkop nito."
              : VERIFICATION_DISPLAY_DESCRIPTIONS[status]}
          </p>
        ) : (
          <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-green-900">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Sinuri ng awtorisadong reviewer. I-confirm pa rin ang kondisyon bago pumunta.
          </p>
        )}

        <div className="mt-auto pt-4">
          <Link
            href={`/cool-places/${place.id}`}
            className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-primary hover:underline"
          >
            Tingnan ang detalye <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
