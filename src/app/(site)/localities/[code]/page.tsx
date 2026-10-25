import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Info, MapPin, ShieldCheck } from "lucide-react";
import { PlaceCard } from "@/components/places/place-card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PointWeather } from "@/components/weather/point-weather";
import { getLocality, getProvince, localities, localitiesForProvince } from "@/lib/geography";
import { searchCoolingPlaces } from "@/lib/place-search";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const locality = getLocality(code);
  if (!locality) return { title: "Locality not found" };
  return {
    title: `${locality.name} heat conditions`,
    description: `Model weather, estimated heat index, and cool-place records for ${locality.name}, ${locality.provinceName}, Central Luzon.`,
  };
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export default async function LocalityPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const locality = getLocality(code);
  if (!locality) notFound();
  const province = getProvince(locality.provinceCode);
  const result = await searchCoolingPlaces({ locality: locality.code, pageSize: 6, page: 1 });

  const nearby = localitiesForProvince(locality.provinceCode)
    .filter((item) => item.code !== locality.code)
    .map((item) => ({ item, distance: distanceKm(locality.lat, locality.lon, item.lat, item.lon) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-primary">
              Central Luzon
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={`/provinces/${province?.slug ?? ""}`} className="hover:text-primary">
              {locality.provinceName}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {locality.name}
          </li>
        </ol>
      </nav>

      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Locality dashboard</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">{locality.name}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {locality.type}, {locality.provinceName}. Model conditions are sampled at {locality.lat.toFixed(4)},{" "}
          {locality.lon.toFixed(4)} — the locality&apos;s representative centre, not a barangay station.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> PSGC {locality.code}
          </Badge>
          {locality.isCapital ? <Badge variant="info">Provincial capital</Badge> : null}
          {locality.isIndependent ? <Badge variant="warning">Independent city</Badge> : null}
          {!locality.boundaryAvailable ? <Badge variant="warning">Representative point only</Badge> : null}
          <Badge variant={result.total > 0 ? "secondary" : "outline"}>
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> {result.total} facility{" "}
            {result.total === 1 ? "record" : "records"}
          </Badge>
        </div>
      </div>

      <div className="mt-6">
        <PointWeather
          latitude={locality.lat}
          longitude={locality.lon}
          label={`${locality.name} model point`}
          context={`${locality.type}, ${locality.provinceName} · ${locality.lat.toFixed(4)}, ${locality.lon.toFixed(4)}`}
          note={`This is a model grid point near the centre of ${locality.name}. It is not a measurement at your exact location and may differ across large or mountainous localities.`}
        />
      </div>

      <section className="mt-10" aria-labelledby="local-places-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Cool places</p>
            <h2 id="local-places-heading" className="mt-1 text-2xl font-extrabold tracking-tight text-navy">
              Public-facility records in {locality.name}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              These are records to check, not confirmed cooling centres. Only facilities marked Verified have had
              public access and cooling suitability reviewed.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/cool-places?locality=${locality.code}`}>
              See all in directory <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        {result.items.length === 0 ? (
          <Card className="mt-4">
            <CardContent className="py-10 text-center">
              <Info className="mx-auto h-7 w-7 text-slate-400" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-navy">No facility records for this locality yet</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                This does not mean no cool places exist. Contact your city or municipal DRRMO or LGU for official
                options, or browse the regional directory.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/cool-places">Browse all facilities</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        )}
      </section>

      {!locality.boundaryAvailable ? (
        <Alert variant="info" className="mt-8" title="Why this locality has no boundary on the map">
          The source boundary file does not include geometry for {locality.name}. SILONG PH still lists the locality
          with a geocoded representative point so that weather and facility records remain available. The point is not
          an official boundary or a barangay-level location.
        </Alert>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <h2 className="text-base font-bold text-navy">Nearby localities in {locality.provinceName}</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {nearby.map(({ item, distance }) => (
                <Link
                  key={item.code}
                  href={`/localities/${item.code}`}
                  className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-slate-700 hover:border-orange-300 hover:text-primary"
                >
                  {item.name}
                  <span className="block text-[10px] font-normal text-muted-foreground">
                    {distance.toFixed(1)} km from this point
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <h2 className="text-base font-bold text-navy">More for this locality</h2>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <Link
                href={`/provinces/${province?.slug ?? ""}`}
                className="rounded-lg border border-border px-3 py-2 font-semibold text-slate-700 hover:border-orange-300 hover:text-primary"
              >
                {locality.provinceName} province profile
              </Link>
              <Link
                href={`/cool-places?locality=${locality.code}&lat=${locality.lat}&lon=${locality.lon}&sort=nearest`}
                className="rounded-lg border border-border px-3 py-2 font-semibold text-slate-700 hover:border-orange-300 hover:text-primary"
              >
                Facilities nearest this point
              </Link>
              <Link
                href="/preparedness"
                className="rounded-lg border border-border px-3 py-2 font-semibold text-slate-700 hover:border-orange-300 hover:text-primary"
              >
                Heat-safety preparedness
              </Link>
              <Link
                href="/alerts"
                className="rounded-lg border border-border px-3 py-2 font-semibold text-slate-700 hover:border-orange-300 hover:text-primary"
              >
                Official alerts and heat notices
              </Link>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              There are {localities.length} localities in the regional dataset. Use the header location picker to switch
              the dashboard location.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
