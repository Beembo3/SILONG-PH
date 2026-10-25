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
  directionsUrl,
  evaluateOpenNow,
  osmUrl,
  parseAmenities,
  VERIFICATION_DESCRIPTIONS,
  VERIFICATION_LABELS,
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
  if (!place) return { title: "Place not found" };
  return {
    title: `${place.name} — ${VERIFICATION_LABELS[place.verificationStatus as VerificationStatus] ?? "Unverified"}`,
    description: `${place.category} at ${place.address}. Verification status: ${
      VERIFICATION_LABELS[place.verificationStatus as VerificationStatus] ?? "Unverified"
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <li>
            <Link href="/cool-places" className="hover:text-primary">
              Cool places
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
        <Alert variant="warning" className="mb-5" title="This record has been archived">
          It is no longer part of the active directory. Archived records are retained for audit purposes and must not
          be treated as an available cooling destination.
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={verificationVariant(status)}>{VERIFICATION_LABELS[status] ?? "Unverified"}</Badge>
            <Badge variant="outline">{place.category}</Badge>
            {hasWater ? (
              <Badge variant="info">
                <Droplets className="h-3.5 w-3.5" aria-hidden="true" /> Drinking water reported
              </Badge>
            ) : null}
            {hasAccess ? (
              <Badge variant="success">
                <Accessibility className="h-3.5 w-3.5" aria-hidden="true" /> Wheelchair access reported
              </Badge>
            ) : null}
          </div>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">{place.name}</h1>
          <p className="mt-2 flex items-start gap-2 text-sm text-slate-600">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
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

          {status !== "VERIFIED" ? (
            <Alert variant="warning" className="mt-5" title="Not a confirmed cooling centre">
              <p>{VERIFICATION_DESCRIPTIONS[status]}</p>
              <p className="mt-2">
                Public access, air-conditioning, water, seating, and opening hours are not guaranteed. Call the facility
                or your LGU before travelling. If this record is wrong, use the report form below.
              </p>
            </Alert>
          ) : (
            <Alert variant="success" className="mt-5" title="Verified by an authorised reviewer">
              <p>{VERIFICATION_DESCRIPTIONS.VERIFIED}</p>
              {place.verificationNote ? <p className="mt-2">{place.verificationNote}</p> : null}
              <p className="mt-2 text-xs">
                Last reviewed {formatPST(place.lastReviewedAt)}. Conditions can change; confirm before travelling.
              </p>
            </Alert>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Card>
              <CardContent className="pt-4 sm:pt-5">
                <h2 className="flex items-center gap-2 text-sm font-bold text-navy">
                  <Clock className="h-4 w-4 text-primary" aria-hidden="true" /> Listed operating hours
                </h2>
                <p className="mt-2 text-sm text-slate-700">
                  {place.operatingHours ?? "No operating hours are listed for this record."}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {place.operatingHours
                    ? `${openState.label}. This label is derived only from the listed hours and is not a real-time availability signal.`
                    : "Do not assume the facility is open. Call ahead or check with the LGU."}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 sm:pt-5">
                <h2 className="flex items-center gap-2 text-sm font-bold text-navy">
                  <ShieldQuestion className="h-4 w-4 text-primary" aria-hidden="true" /> What was checked?
                </h2>
                <p className="mt-2 text-sm text-slate-700">{VERIFICATION_DESCRIPTIONS[status]}</p>
                <dl className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between gap-2">
                    <dt>Verified</dt>
                    <dd className="font-semibold">{place.verifiedAt ? formatPSTDate(place.verifiedAt) : "Not verified"}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Last reviewed</dt>
                    <dd className="font-semibold">
                      {place.lastReviewedAt ? formatPSTDate(place.lastReviewedAt) : "Not recorded"}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Facilities and access</CardTitle>
              <p className="text-xs text-muted-foreground">
                Amenities are shown only where the source or reviewer recorded them. An empty list means no amenities
                were recorded, not that none exist.
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
                      {amenity}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No amenities recorded.</p>
              )}

              <dl className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Public access
                  </dt>
                  <dd className="mt-1 text-slate-700">
                    {place.publicAccessDetails ?? "Not recorded. Confirm public access before travelling."}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Accessibility
                  </dt>
                  <dd className="mt-1 text-slate-700">
                    {place.accessibilityDetails ?? "Not recorded. Contact the facility if you need access details."}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact</dt>
                  <dd className="mt-1 flex items-start gap-1.5 text-slate-700">
                    <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                    {place.contactInformation ?? "No contact information recorded."}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Source</dt>
                  <dd className="mt-1 text-slate-700">
                    {place.sourceUrl ? (
                      <a
                        href={place.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                      >
                        Open source record <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    ) : (
                      "No source URL recorded."
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <p className="text-xs text-muted-foreground">
                The marker is based on the recorded coordinates. It is not a guarantee that the entrance is at this
                point.
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
                <Button asChild>
                  <a href={directionsUrl(place.latitude, place.longitude)} target="_blank" rel="noreferrer">
                    <Navigation className="h-4 w-4" aria-hidden="true" /> Get directions
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href={osmUrl(place.latitude, place.longitude)} target="_blank" rel="noreferrer">
                    View on OpenStreetMap <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
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
              <h2 className="text-base font-bold text-navy">Is this information wrong?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Send a correction to the moderation queue. Reports are not published automatically and do not change
                the verification status until a reviewer checks them.
              </p>
              <div className="mt-4">
                <PlaceReportForm coolingPlaceId={place.id} placeName={place.name} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 sm:pt-6">
              <h2 className="text-base font-bold text-navy">Before you travel</h2>
              <ul className="mt-2 space-y-2 text-sm text-slate-700">
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  Call ahead or check the LGU page. Hours and public access can change without notice.
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  Bring drinking water and avoid strenuous travel during the hottest hours.
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  Do not rely on an unverified record for emergency cooling.
                </li>
              </ul>
              <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                <Link href={`/cool-places?locality=${place.localityCode}`}>
                  More places in this locality <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {nearby.length > 0 ? (
            <Card>
              <CardContent className="pt-5 sm:pt-6">
                <h2 className="text-base font-bold text-navy">Other records nearby</h2>
                <ul className="mt-3 space-y-2">
                  {nearby.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/cool-places/${item.id}`}
                        className="block rounded-lg border border-border px-3 py-2 hover:border-orange-300"
                      >
                        <span className="block text-sm font-semibold text-navy">{item.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {item.category} ·{" "}
                          {VERIFICATION_LABELS[item.verificationStatus as VerificationStatus] ?? "Unverified"}
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
              SILONG PH is independent and not an official LGU, PAGASA, or DOH channel. Facility records may come from
              OpenStreetMap contributors (ODbL) or administrator review. Always confirm details with the facility or
              your local government.
            </p>
          </div>

          <Button asChild variant="ghost" size="sm" className="w-full">
            <Link href="/cool-places">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to directory
            </Link>
          </Button>
        </aside>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-4">
          <ShieldCheck className="h-5 w-5 text-success" aria-hidden="true" />
          <h2 className="mt-2 text-sm font-bold text-navy">Verified means reviewed</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            A reviewer checked the facility details, public access, and cooling suitability. It is still not a
            real-time occupancy guarantee.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-white p-4">
          <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden="true" />
          <h2 className="mt-2 text-sm font-bold text-navy">Unverified is not a recommendation</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            An unverified record is a public facility from an external source. It may lack air-conditioning, water,
            seating, or public access.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-white p-4">
          <CalendarClock className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="mt-2 text-sm font-bold text-navy">Check the date</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Verification and review dates are shown above. Older reviews are more likely to be out of date.
          </p>
        </div>
      </div>
    </div>
  );
}
