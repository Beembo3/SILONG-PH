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
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <li>
            <Link href="/cool-places" className="hover:text-primary">
              Preskong lugar
            </Link>
          </li>
          {province ? (
            <>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={`/provinces/${province.slug}`} className="hover:text-primary">
                  {province.name}
                </Link>
              </li>
            </>
          ) : null}
          {locality ? (
            <>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={`/localities/${locality.code}`} className="hover:text-primary">
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

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div>
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

          <h1 className="mt-3 break-words text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">{place.name}</h1>
          <div className="mt-2 flex items-start gap-2 text-sm text-slate-600">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <p className="min-w-0 break-words">
              {place.address}
              {locality ? (
                <span className="text-muted-foreground">
                  {" "}
                  ·{" "}
                  <Link href={`/localities/${locality.code}`} className="font-semibold text-primary hover:underline">
                    {locality.name}
                  </Link>
                </span>
              ) : null}
            </p>
          </div>

          {status !== "VERIFIED" ? (
            <Alert variant="warning" className="mt-5" title="Hindi ito kumpirmadong cooling center">
              <p>{VERIFICATION_DISPLAY_DESCRIPTIONS[status]}</p>
              <p className="mt-2">
                Hindi garantiya ang public access, aircon, tubig, upuan, at oras ng pagbubukas. Tawagan ang pasilidad o
                ang LGU bago pumunta. Kung mali ang record, gamitin ang report form sa ibaba.
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

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Card>
              <CardContent className="pt-4 sm:pt-5">
                <h2 className="flex items-center gap-2 text-sm font-bold text-navy">
                  <Clock className="h-4 w-4 text-primary" aria-hidden="true" /> Nakalistang oras
                </h2>
                <p className="mt-2 text-sm text-slate-700">
                  {place.operatingHours ?? "Walang nakalistang oras para sa record na ito."}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {place.operatingHours
                    ? `${openStateLabel(openState.label)}. Base lang ito sa nakalistang oras at hindi real-time availability signal.`
                    : "Huwag ipagpalagay na bukas ang pasilidad. Tawagan muna o i-check sa LGU."}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 sm:pt-5">
                <h2 className="flex items-center gap-2 text-sm font-bold text-navy">
                  <ShieldQuestion className="h-4 w-4 text-primary" aria-hidden="true" /> Ano ang sinuri?
                </h2>
                <p className="mt-2 text-sm text-slate-700">{VERIFICATION_DISPLAY_DESCRIPTIONS[status]}</p>
                <dl className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between gap-2">
                    <dt>Beripikado</dt>
                    <dd className="font-semibold">{place.verifiedAt ? formatPSTDate(place.verifiedAt) : "Hindi pa beripikado"}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Huling sinuri</dt>
                    <dd className="font-semibold">
                      {place.lastReviewedAt ? formatPSTDate(place.lastReviewedAt) : "Walang record"}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Pasilidad at access</CardTitle>
              <p className="text-xs text-muted-foreground">
                Ipinapakita lang ang amenities kung naitala ng source o reviewer. Ang walang laman na listahan ay
                ibig sabihin walang naitala, hindi walang amenity.
              </p>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {amenities.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {amenities.map((amenity) => (
                    <li
                      key={amenity}
                      className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-slate-700"
                    >
                      {amenityLabel(amenity)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">Walang naitalang amenity.</p>
              )}

              <dl className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pag-access ng publiko</dt>
                  <dd className="mt-1 text-slate-700">
                    {place.publicAccessDetails ?? "Walang record. I-confirm ang public access bago pumunta."}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Accessibility</dt>
                  <dd className="mt-1 text-slate-700">
                    {place.accessibilityDetails ?? "Walang record. Makipag-ugnayan sa pasilidad kung kailangan mo ng access details."}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Kontak</dt>
                  <dd className="mt-1 flex items-start gap-1.5 text-slate-700">
                    <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                    {place.contactInformation ?? "Walang contact information na naitala."}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pinagmulan</dt>
                  <dd className="mt-1 text-slate-700">
                    {place.sourceUrl ? (
                      <a
                        href={place.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-11 items-center gap-1 font-semibold text-primary hover:underline"
                      >
                        Buksan ang source record <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    ) : (
                      "Walang source URL na naitala."
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Lokasyon</CardTitle>
              <p className="text-xs text-muted-foreground">
                Base ang marker sa naitalang coordinates. Hindi garantiya na eksakto sa puntong ito ang entrance.
              </p>
            </CardHeader>
            <CardContent>
              <PlaceLocationMap
                latitude={place.latitude}
                longitude={place.longitude}
                name={place.name}
                address={place.address}
              />
              <div className="mt-3 flex flex-wrap gap-2">
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
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardContent className="pt-5 sm:pt-6">
              <h2 className="text-base font-bold text-navy">May mali ba sa impormasyon?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Ipadala ang correction sa moderation queue. Hindi awtomatikong napi-publish ang report at hindi nito
                binabago ang verification status hanggang suriin ng reviewer.
              </p>
              <div className="mt-4">
                <PlaceReportForm coolingPlaceId={place.id} placeName={place.name} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 sm:pt-6">
              <h2 className="text-base font-bold text-navy">Bago pumunta</h2>
              <ul className="mt-2 space-y-2 text-sm text-slate-700">
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  Tawagan muna o i-check ang LGU page. Puwedeng magbago ang oras at public access nang walang abiso.
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  Magdala ng inuming tubig at iwasan ang mabigat na biyahe sa pinakamainit na oras.
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  Huwag umasa sa hindi pa beripikadong record para sa emergency cooling.
                </li>
              </ul>
              <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                <Link href={`/cool-places?locality=${place.localityCode}`}>
                  Iba pang lugar sa lokalidad na ito <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {nearby.length > 0 ? (
            <Card>
              <CardContent className="pt-5 sm:pt-6">
                <h2 className="text-base font-bold text-navy">Iba pang record sa malapit</h2>
                <ul className="mt-3 space-y-2">
                  {nearby.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/cool-places/${item.id}`}
                        className="block min-h-11 rounded-lg border border-border px-3 py-2 hover:border-orange-300"
                      >
                        <span className="block text-sm font-semibold text-navy">{item.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {placeCategoryLabel(item.category)} ·{" "}
                          {VERIFICATION_DISPLAY_LABELS[item.verificationStatus as VerificationStatus] ?? "Hindi pa beripikado"}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
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

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-4">
          <ShieldCheck className="h-5 w-5 text-success" aria-hidden="true" />
          <h2 className="mt-2 text-sm font-bold text-navy">Ang beripikado ay nasuri</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Sinuri ng reviewer ang detalye, public access, at pagiging angkop bilang cooling place. Hindi pa rin ito
            real-time occupancy guarantee.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-white p-4">
          <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden="true" />
          <h2 className="mt-2 text-sm font-bold text-navy">Hindi rekomendasyon ang unverified</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Ang hindi pa beripikadong record ay pampublikong lugar mula sa external source. Maaaring walang aircon,
            tubig, upuan, o public access.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-white p-4">
          <CalendarClock className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="mt-2 text-sm font-bold text-navy">Tingnan ang petsa</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Nakita sa itaas ang verification at review dates. Mas malaki ang posibilidad na luma na ang mas lumang
            review.
          </p>
        </div>
      </div>
    </div>
  );
}
