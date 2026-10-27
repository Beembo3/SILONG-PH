import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Accessibility,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Clock,
  Droplets,
  ExternalLink,
  Info,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  ShieldQuestion,
} from "lucide-react";
import { PlaceLocationMap } from "@/components/places/place-location-map";
import { PlaceReportForm } from "@/components/places/place-report-form";
import { placeCategoryVisual } from "@/components/places/place-card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPST, formatPSTDate } from "@/lib/format";
import { getLocality, getProvince } from "@/lib/geography";
import {
  amenityLabel,
  directionsUrl,
  evaluateOpenNow,
  openStateLabel,
  osmUrl,
  parseAmenities,
  placeCategoryLabel,
  VERIFICATION_DISPLAY_DESCRIPTIONS,
  VERIFICATION_DISPLAY_LABELS,
  verificationVariant,
  type VerificationStatus,
} from "@/lib/places";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const place = await prisma.coolingPlace.findUnique({
    where: { id },
    select: { name: true, category: true, verificationStatus: true, address: true },
  });
  if (!place) return { title: "Wala ang lugar" };
  const status = place.verificationStatus as VerificationStatus;
  return {
    title: `${place.name} — ${VERIFICATION_DISPLAY_LABELS[status] ?? "Hindi pa beripikado"}`,
    description: `${placeCategoryLabel(place.category)} sa ${place.address}. Katayuan ng beripikasyon: ${
      VERIFICATION_DISPLAY_LABELS[status] ?? "Hindi pa beripikado"
    }.`,
    robots: { index: place.verificationStatus === "VERIFIED", follow: true },
  };
}

export default async function PlaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const place = await prisma.coolingPlace.findUnique({ where: { id } });
  if (!place) notFound();

  const status = place.verificationStatus as VerificationStatus;
  const locality = getLocality(place.localityCode);
  const province = getProvince(place.provinceCode);
  const amenities = parseAmenities(place.amenities);
  const openState = evaluateOpenNow(place.operatingHours);
  const hasWater = amenities.some((item) => item.toLowerCase().includes("drinking water"));
  const hasAccess = amenities.some((item) => item.toLowerCase().includes("wheelchair"));
  const { Icon, tone } = placeCategoryVisual(place.category);

  const nearby = await prisma.coolingPlace.findMany({
    where: {
      archivedAt: null,
      id: { not: place.id },
      localityCode: place.localityCode,
    },
    orderBy: [{ verificationStatus: "asc" }, { name: "asc" }],
    take: 4,
    select: {
      id: true,
      name: true,
      category: true,
      verificationStatus: true,
      address: true,
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
          <li>
            <Link href="/cool-places" className="inline-flex min-h-11 items-center hover:text-primary">
              Preskong lugar
            </Link>
          </li>
          {province ? (
            <>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={`/provinces/${province.slug}`} className="inline-flex min-h-11 items-center hover:text-primary">
                  {province.name}
                </Link>
              </li>
            </>
          ) : null}
          {locality ? (
            <>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={`/localities/${locality.code}`} className="inline-flex min-h-11 items-center hover:text-primary">
                  {locality.name}
                </Link>
              </li>
            </>
          ) : null}
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="max-w-[16rem] truncate text-foreground">
            {place.name}
          </li>
        </ol>
      </nav>

      {place.archivedAt ? (
        <Alert variant="warning" className="mb-5" title="Naka-archive ang record na ito">
          Wala na ito sa active directory. Pinapanatili ang archived records para sa audit at hindi dapat ituring na
          available cooling destination.
        </Alert>
      ) : null}

      <section className="relative overflow-hidden rounded-[2rem] bg-[#e5eee3] p-5 sm:p-7">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 contour-lines-dark opacity-80" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={verificationVariant(status)}>
              {VERIFICATION_DISPLAY_LABELS[status] ?? "Hindi pa beripikado"}
            </Badge>
            <Badge variant="outline">{placeCategoryLabel(place.category)}</Badge>
            {hasWater ? (
              <Badge variant="info">
                <Droplets className="h-3.5 w-3.5" aria-hidden="true" /> May iniulat na tubig
              </Badge>
            ) : null}
            {hasAccess ? (
              <Badge variant="success">
                <Accessibility className="h-3.5 w-3.5" aria-hidden="true" /> May wheelchair access
              </Badge>
            ) : null}
          </div>

          <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", tone)}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#536258]">
                  {placeCategoryLabel(place.category)}
                </p>
              </div>
              <h1 className="mt-3 break-words text-balance font-display text-[clamp(2rem,4.8vw,3.7rem)] font-bold leading-[0.98] tracking-[-0.05em] text-forest">
                {place.name}
              </h1>
              <p className="mt-3 flex min-w-0 items-start gap-2 text-sm leading-7 text-[#3f5146]">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-canopy" aria-hidden="true" />
                <span className="min-w-0 break-words">
                  {place.address}
                  {locality ? (
                    <span className="text-[#536258]">
                      {" "}
                      ·{" "}
                      <Link href={`/localities/${locality.code}`} className="font-bold text-primary hover:underline">
                        {locality.name}
                      </Link>
                    </span>
                  ) : null}
                </span>
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild>
                  <a href={directionsUrl(place.latitude, place.longitude)} target="_blank" rel="noreferrer">
                    <Navigation className="h-4 w-4" aria-hidden="true" /> Kunin ang direksyon
                  </a>
                </Button>
                {locality ? (
                  <Button asChild variant="outline">
                    <Link href={`/localities/${locality.code}`}>
                      <MapPin className="h-4 w-4" aria-hidden="true" /> Tingnan ang lugar
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="rounded-[1.3rem] border border-canopy/15 bg-card p-4">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                Nakalistang oras
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-forest">
                <Clock className="h-4 w-4 text-canopy" aria-hidden="true" />
                {place.operatingHours ? openStateLabel(openState.label) : "Walang nakalistang oras"}
              </p>
              <p className="mt-2 max-w-[15rem] text-[11px] leading-relaxed text-[#536258]">
                Base lang sa nakalistang oras. Hindi ito real-time availability signal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {status !== "VERIFIED" ? (
        <Alert variant="warning" className="mt-5" title="Hindi ito kumpirmadong cooling center">
          <p>{VERIFICATION_DISPLAY_DESCRIPTIONS[status]}</p>
          <p className="mt-2">
            Hindi garantiya ang public access, aircon, tubig, upuan, at oras ng pagbubukas. Tawagan ang pasilidad o ang
            LGU bago pumunta. Kung mali ang record, gamitin ang report form sa ibaba.
          </p>
        </Alert>
      ) : (
        <Alert variant="success" className="mt-5" title="Sinuri ng awtorisadong reviewer">
          <p>{VERIFICATION_DISPLAY_DESCRIPTIONS.VERIFIED}</p>
          {place.verificationNote ? <p className="mt-2 break-words">{place.verificationNote}</p> : null}
          <p className="mt-2 text-xs">
            Huling sinuri {formatPST(place.lastReviewedAt)}. Puwedeng magbago ang kondisyon; i-confirm bago pumunta.
          </p>
        </Alert>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <div className="space-y-5">
          <section className="paper-panel rounded-[1.7rem] p-5 sm:p-6" aria-labelledby="hours-heading">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="eyebrow text-sun-ink">Praktikal na detalye</p>
                <h2 id="hours-heading" className="mt-2 font-display text-2xl font-bold tracking-[-0.04em] text-forest">
                  Oras at access
                </h2>
              </div>
              <Badge variant={openState.known ? "outline" : "secondary"}>
                {place.operatingHours ? openStateLabel(openState.label) : "Walang oras na naka-record"}
              </Badge>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="border-t border-border/70 pt-3">
                <h3 className="flex items-center gap-2 text-sm font-bold text-forest">
                  <Clock className="h-4 w-4 text-canopy" aria-hidden="true" /> Nakalistang oras
                </h3>
                <p className="mt-2 text-sm leading-7 text-[#3f5146]">
                  {place.operatingHours ?? "Walang nakalistang oras para sa record na ito."}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {place.operatingHours
                    ? `${openStateLabel(openState.label)}. Base lang ito sa nakalistang oras at hindi real-time availability signal.`
                    : "Huwag ipagpalagay na bukas ang pasilidad. Tawagan muna o i-check sa LGU."}
                </p>
              </div>
              <div className="border-t border-border/70 pt-3">
                <h3 className="flex items-center gap-2 text-sm font-bold text-forest">
                  <ShieldQuestion className="h-4 w-4 text-canopy" aria-hidden="true" /> Ano ang sinuri?
                </h3>
                <p className="mt-2 text-sm leading-7 text-[#3f5146]">{VERIFICATION_DISPLAY_DESCRIPTIONS[status]}</p>
                <dl className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex justify-between gap-2">
                    <dt>Beripikado</dt>
                    <dd className="font-bold text-forest">
                      {place.verifiedAt ? formatPSTDate(place.verifiedAt) : "Hindi pa beripikado"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Huling sinuri</dt>
                    <dd className="font-bold text-forest">
                      {place.lastReviewedAt ? formatPSTDate(place.lastReviewedAt) : "Walang record"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>

          <section className="paper-panel rounded-[1.7rem] p-5 sm:p-6" aria-labelledby="facilities-heading">
            <p className="eyebrow text-sun-ink">Pasilidad</p>
            <h2 id="facilities-heading" className="mt-2 font-display text-2xl font-bold tracking-[-0.04em] text-forest">
              Pasilidad at access
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Ipinapakita lang ang amenities kung naitala ng source o reviewer. Ang walang laman na listahan ay ibig
              sabihin walang naitala, hindi walang amenity.
            </p>

            {amenities.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {amenities.map((amenity) => (
                  <li
                    key={amenity}
                    className="rounded-full border border-border/80 bg-[#f8f3e9] px-3 py-1.5 text-xs font-bold text-[#536258]"
                  >
                    {amenityLabel(amenity)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">Walang naitalang amenity.</p>
            )}

            <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <div className="border-t border-border/70 pt-3">
                <dt className="text-[10px] font-extrabold uppercase tracking-[0.11em] text-muted-foreground">
                  Pag-access ng publiko
                </dt>
                <dd className="mt-1 text-sm leading-7 text-[#3f5146]">
                  {place.publicAccessDetails ?? "Walang record. I-confirm ang public access bago pumunta."}
                </dd>
              </div>
              <div className="border-t border-border/70 pt-3">
                <dt className="text-[10px] font-extrabold uppercase tracking-[0.11em] text-muted-foreground">
                  Accessibility
                </dt>
                <dd className="mt-1 text-sm leading-7 text-[#3f5146]">
                  {place.accessibilityDetails ?? "Walang record. Makipag-ugnayan sa pasilidad kung kailangan mo ng access details."}
                </dd>
              </div>
              <div className="border-t border-border/70 pt-3">
                <dt className="text-[10px] font-extrabold uppercase tracking-[0.11em] text-muted-foreground">Kontak</dt>
                <dd className="mt-1 flex items-start gap-1.5 text-sm leading-7 text-[#3f5146]">
                  <Phone className="mt-1 h-3.5 w-3.5 shrink-0 text-sage" aria-hidden="true" />
                  {place.contactInformation ?? "Walang contact information na naitala."}
                </dd>
              </div>
              <div className="border-t border-border/70 pt-3">
                <dt className="text-[10px] font-extrabold uppercase tracking-[0.11em] text-muted-foreground">Pinagmulan</dt>
                <dd className="mt-1 text-sm leading-7 text-[#3f5146]">
                  {place.sourceUrl ? (
                    <a
                      href={place.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center gap-1 font-bold text-primary hover:underline"
                    >
                      Buksan ang source record <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  ) : (
                    "Walang source URL na naitala."
                  )}
                </dd>
              </div>
            </dl>
          </section>

          <section className="paper-panel overflow-hidden rounded-[1.7rem]" aria-labelledby="location-heading">
            <div className="p-5 pb-3 sm:p-6 sm:pb-3">
              <p className="eyebrow text-sun-ink">Lokasyon</p>
              <h2 id="location-heading" className="mt-2 font-display text-2xl font-bold tracking-[-0.04em] text-forest">
                Nasaan ito?
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Base ang marker sa naitalang coordinates. Hindi garantiya na eksakto sa puntong ito ang entrance.
              </p>
            </div>
            <PlaceLocationMap
              latitude={place.latitude}
              longitude={place.longitude}
              name={place.name}
              address={place.address}
            />
            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap gap-2">
                <Button asChild className="w-full sm:w-auto">
                  <a href={directionsUrl(place.latitude, place.longitude)} target="_blank" rel="noreferrer">
                    <Navigation className="h-4 w-4" aria-hidden="true" /> Kunin ang direksyon
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <a href={osmUrl(place.latitude, place.longitude)} target="_blank" rel="noreferrer">
                    Tingnan sa OpenStreetMap <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </Button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Coordinates: {place.latitude.toFixed(5)}, {place.longitude.toFixed(5)}
              </p>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="paper-panel rounded-[1.6rem] p-5">
            <h2 className="font-display text-lg font-bold text-forest">Bago pumunta</h2>
            <ul className="mt-3 space-y-2.5 text-sm leading-7 text-[#3f5146]">
              <li className="flex gap-2.5">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-canopy" aria-hidden="true" />
                Tawagan muna o i-check ang LGU page. Puwedeng magbago ang oras at public access nang walang abiso.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-canopy" aria-hidden="true" />
                Magdala ng inuming tubig at iwasan ang mabigat na biyahe sa pinakamainit na oras.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-canopy" aria-hidden="true" />
                Huwag umasa sa hindi pa beripikadong record para sa emergency cooling.
              </li>
            </ul>
            <Button asChild variant="outline" size="sm" className="mt-4 w-full">
              <Link href={`/cool-places?locality=${place.localityCode}`}>
                Iba pang lugar sa lokalidad na ito <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <div className="paper-panel rounded-[1.6rem] p-5">
            <h2 className="font-display text-lg font-bold text-forest">May mali ba sa impormasyon?</h2>
            <p className="mt-1.5 text-sm leading-7 text-muted-foreground">
              Ipadala ang correction sa moderation queue. Hindi awtomatikong napi-publish ang report at hindi nito
              binabago ang verification status hanggang suriin ng reviewer.
            </p>
            <div className="mt-4">
              <PlaceReportForm coolingPlaceId={place.id} placeName={place.name} />
            </div>
          </div>

          {nearby.length > 0 ? (
            <div className="paper-panel rounded-[1.6rem] p-5">
              <h2 className="font-display text-lg font-bold text-forest">Iba pang record sa malapit</h2>
              <ul className="mt-2 divide-y divide-border/60">
                {nearby.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/cool-places/${item.id}`}
                      className="block min-h-12 py-3 transition-colors hover:text-primary"
                    >
                      <span className="block text-sm font-bold text-forest">{item.name}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {placeCategoryLabel(item.category)} ·{" "}
                        {VERIFICATION_DISPLAY_LABELS[item.verificationStatus as VerificationStatus] ?? "Hindi pa beripikado"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex items-start gap-2 rounded-2xl border border-border/80 bg-[#f8f3e9] p-4 text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-canopy" aria-hidden="true" />
            <p>
              Independent ang SILONG PH at hindi official channel ng LGU, PAGASA, o DOH. Maaaring galing sa
              OpenStreetMap contributors (ODbL) o admin review ang facility records. I-confirm pa rin sa pasilidad o
              lokal na pamahalaan.
            </p>
          </div>

          <Button asChild variant="ghost" size="sm" className="w-full">
            <Link href="/cool-places">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Bumalik sa directory
            </Link>
          </Button>
        </aside>
      </div>

      <section className="mt-8 relative overflow-hidden rounded-[1.7rem] bg-forest px-5 py-7 text-primary-foreground sm:px-7" aria-label="Paano basahin ang verification">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 contour-lines opacity-80" />
        <div className="relative grid gap-5 sm:grid-cols-3">
          <div>
            <ShieldCheck className="h-5 w-5 text-sun" aria-hidden="true" />
            <h2 className="mt-2 font-display text-base font-bold">Ang beripikado ay nasuri</h2>
            <p className="mt-1 text-xs leading-6 text-[#c8d7ca]">
              Sinuri ng reviewer ang detalye, public access, at pagiging angkop bilang cooling place. Hindi pa rin ito
              real-time occupancy guarantee.
            </p>
          </div>
          <div>
            <AlertTriangle className="h-5 w-5 text-[#f19a7e]" aria-hidden="true" />
            <h2 className="mt-2 font-display text-base font-bold">Hindi rekomendasyon ang unverified</h2>
            <p className="mt-1 text-xs leading-6 text-[#c8d7ca]">
              Ang hindi pa beripikadong record ay pampublikong lugar mula sa external source. Maaaring walang aircon,
              tubig, upuan, o public access.
            </p>
          </div>
          <div>
            <CalendarClock className="h-5 w-5 text-sun" aria-hidden="true" />
            <h2 className="mt-2 font-display text-base font-bold">Tingnan ang petsa</h2>
            <p className="mt-1 text-xs leading-6 text-[#c8d7ca]">
              Nakita sa itaas ang verification at review dates. Mas malaki ang posibilidad na luma na ang mas lumang
              review.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
