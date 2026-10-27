import Link from "next/link";
import {
  Accessibility,
  ArrowRight,
  Building2,
  Clock3,
  Droplets,
  Dumbbell,
  Landmark,
  Library,
  MapPin,
  Mountain,
  ShieldCheck,
  ShoppingBag,
  Store,
  Trees,
  Umbrella,
  Waves,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  openStateLabel,
  placeCategoryLabel,
  VERIFICATION_DISPLAY_DESCRIPTIONS,
  VERIFICATION_DISPLAY_LABELS,
  verificationVariant,
  type VerificationStatus,
} from "@/lib/places";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

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

export function placeCategoryVisual(category: string) {
  if (category === "Shopping Malls") {
    return { Icon: ShoppingBag, tone: "bg-[#f3eadb] text-[#7a4300]" };
  }
  if (category === "Public library") {
    return { Icon: Library, tone: "bg-[#e7efe8] text-[#24563c]" };
  }
  if (category === "Public museum") {
    return { Icon: Landmark, tone: "bg-[#eee8f1] text-[#5a3b63]" };
  }
  if (category === "Community centre" || category === "Designated cooling centre") {
    return { Icon: Building2, tone: "bg-[#e7efe8] text-[#24563c]" };
  }
  if (category === "Government building" || category === "Health facility") {
    return { Icon: Store, tone: "bg-[#e7efe8] text-[#24563c]" };
  }
  if (category === "Public park" || category === "Nature park" || category === "National park") {
    return { Icon: Trees, tone: "bg-[#edf2dd] text-[#4a5b1f]" };
  }
  if (category === "Sports and recreation park") {
    return { Icon: Dumbbell, tone: "bg-[#edf2dd] text-[#4a5b1f]" };
  }
  if (category === "Waterfall") {
    return { Icon: Waves, tone: "bg-[#e4f0ef] text-[#175e68]" };
  }
  if (category === "Water-refill station") {
    return { Icon: Droplets, tone: "bg-[#e6f0f4] text-[#175e68]" };
  }
  if (category === "Shaded public rest area") {
    return { Icon: Umbrella, tone: "bg-[#edf2dd] text-[#4a5b1f]" };
  }
  if (category === "Mountain") {
    return { Icon: Mountain, tone: "bg-[#edf2dd] text-[#4a5b1f]" };
  }
  return { Icon: MapPin, tone: "bg-[#f3eadb] text-[#7a4300]" };
}

export function PlaceCard({ place }: { place: PlaceCardData }) {
  const status = place.verificationStatus as VerificationStatus;
  const hasWater = place.amenities.some((a) => a.toLowerCase().includes("drinking water"));
  const hasAccess = place.amenities.some((a) => a.toLowerCase().includes("wheelchair"));
  const { Icon, tone } = placeCategoryVisual(place.category);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.55rem] border border-border bg-card shadow-[var(--shadow-soft)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-sage hover:shadow-[var(--shadow-lift)]">
      <div className={cn("h-1.5 w-full", tone.split(" ")[0])} aria-hidden="true" />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <Badge variant={verificationVariant(place.verificationStatus)}>
            {VERIFICATION_DISPLAY_LABELS[status] ?? "Hindi pa beripikado"}
          </Badge>
          {place.distanceKm != null ? (
            <span className="text-[11px] font-bold text-muted-foreground">
              {formatNumber(place.distanceKm, 1)} km ang layo
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", tone)}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-muted-foreground">
            {placeCategoryLabel(place.category)}
          </p>
        </div>

        <h3 className="mt-3 break-words font-display text-[1.3rem] font-bold leading-[1.08] tracking-[-0.035em] text-forest">
          {place.name}
        </h3>
        <p className="mt-2 flex min-w-0 items-start gap-1.5 break-words text-sm leading-6 text-[#536258]">
          <MapPin className="mt-1 h-4 w-4 shrink-0 text-sage" aria-hidden="true" />
          {place.address}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {hasWater ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#e6f0f4] px-2.5 py-1 text-[10px] font-bold text-[#175e68]">
              <Droplets className="h-3 w-3" aria-hidden="true" /> May iniulat na tubig
            </span>
          ) : null}
          {hasAccess ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#e7efe8] px-2.5 py-1 text-[10px] font-bold text-[#24563c]">
              <Accessibility className="h-3 w-3" aria-hidden="true" /> May wheelchair access
            </span>
          ) : null}
          {place.operatingHours ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#f3eadb] px-2.5 py-1 text-[10px] font-bold text-[#6b4b1d]">
              <Clock3 className="h-3 w-3" aria-hidden="true" /> {openStateLabel(place.openState.label)}
            </span>
          ) : null}
        </div>

        {status !== "VERIFIED" ? (
          <p className="mt-3 rounded-xl bg-[#fbf1dc] p-3 text-[11px] leading-relaxed text-[#5d3a08]">
            {status === "UNVERIFIED"
              ? "Hindi kumpirmadong cooling center. Hindi pa sinuri ang public access at pagiging angkop nito."
              : VERIFICATION_DISPLAY_DESCRIPTIONS[status]}
          </p>
        ) : (
          <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-[#24563c]">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Sinuri ng awtorisadong reviewer. I-confirm pa rin ang kondisyon bago pumunta.
          </p>
        )}

        <div className="mt-auto pt-4">
          <Link
            href={`/cool-places/${place.id}`}
            className="link-arrow min-h-11 text-sm text-primary"
          >
            Tingnan ang detalye <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
