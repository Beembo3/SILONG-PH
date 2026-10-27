import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Info, MapPin, ShieldCheck } from "lucide-react";
import { PageMasthead, SectionHeading } from "@/components/layout/page-masthead";
import { PlaceCard } from "@/components/places/place-card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  if (!locality) return { title: "Wala ang lugar" };
  return {
    title: `${locality.name} — lagay ng init`,
    description: `Model weather, estimated heat index, at preskong lugar sa ${locality.name}, ${locality.provinceName}, Central Luzon.`,
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
    <div>
      <PageMasthead
        eyebrow="Lugar"
        title={locality.name}
        description={`${locality.type === "City" ? "Lungsod" : "Munisipyo"}, ${locality.provinceName}. Nakuha ang model conditions sa ${locality.lat.toFixed(4)}, ${locality.lon.toFixed(4)} — representative center ng lugar, hindi barangay station.`}
        backHref={province ? `/provinces/${province.slug}` : "/map"}
        backLabel={province ? `Bumalik sa ${province.name}` : "Bumalik sa mapa"}
        actions={
          <>
            <Badge variant="outline" className="border-white/25 bg-white/5 text-white">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> PSGC {locality.code}
            </Badge>
            {locality.isCapital ? (
              <Badge variant="outline" className="border-white/25 bg-white/5 text-white">
                Capital ng probinsya
              </Badge>
            ) : null}
            {locality.isIndependent ? (
              <Badge variant="outline" className="border-white/25 bg-white/5 text-white">
                Independent city
              </Badge>
            ) : null}
            {!locality.boundaryAvailable ? (
              <Badge variant="outline" className="border-white/25 bg-white/5 text-white">
                Representative point lang
              </Badge>
            ) : null}
            <Badge variant="outline" className="border-white/25 bg-white/5 text-white">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> {result.total} facility record
            </Badge>
          </>
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 -mt-7 sm:-mt-10">
          <PointWeather
            latitude={locality.lat}
            longitude={locality.lon}
            label={`${locality.name} model point`}
            context={`${locality.type === "City" ? "Lungsod" : "Munisipyo"}, ${locality.provinceName} · ${locality.lat.toFixed(4)}, ${locality.lon.toFixed(4)}`}
            note={`Model grid point ito malapit sa center ng ${locality.name}. Hindi ito measurement sa eksaktong lokasyon mo at puwedeng iba sa malalaki o mabundok na lugar.`}
          />
        </div>

        <section className="mt-12" aria-labelledby="local-places-heading">
          <SectionHeading
            eyebrow="Preskong lugar"
            id="local-places-heading"
            title={`Mga pampublikong pasilidad sa ${locality.name}`}
            description="Mga record na kailangang i-check, hindi kumpirmadong cooling center. Ang may label na Beripikado lang ang sinuri ang public access at pagiging angkop bilang cooling place."
            action={
              <Button asChild variant="outline" size="sm">
                <Link href={`/cool-places?locality=${locality.code}`}>
                  Tingnan lahat sa directory <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            }
          />

          {result.items.length === 0 ? (
            <div className="paper-panel mt-5 rounded-[1.6rem] px-5 py-10 text-center sm:px-8 sm:py-12">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eef0e9] text-[#64736a]">
                <Info className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-display text-xl font-bold text-forest">Wala pang facility record sa lugar na ito</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted-foreground">
                Hindi ito ibig sabihin na walang preskong lugar. Makipag-ugnayan sa city o municipal DRRMO o LGU para
                sa opisyal na opsyon, o tingnan ang regional directory.
              </p>
              <Button asChild variant="outline" className="mt-5">
                <Link href="/cool-places">Tingnan lahat ng pasilidad</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          )}
        </section>

        {!locality.boundaryAvailable ? (
          <Alert variant="info" className="mt-8" title="Bakit walang boundary sa mapa ang lugar na ito">
            Wala ang geometry ng {locality.name} sa source boundary file. Nakalista pa rin ito sa SILONG PH gamit ang
            geocoded representative point para available ang weather at facility records. Hindi official boundary o
            barangay-level location ang point na ito.
          </Alert>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="paper-panel rounded-[1.6rem] p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold text-forest">Mga kalapit na lugar sa {locality.provinceName}</h2>
            <div className="mt-2 grid grid-cols-2 gap-x-5">
              {nearby.map(({ item, distance }) => (
                <Link
                  key={item.code}
                  href={`/localities/${item.code}`}
                  className="flex min-h-14 flex-col justify-center border-b border-border/60 py-2 text-sm font-bold text-[#536258] transition-colors hover:text-primary"
                >
                  {item.name}
                  <span className="mt-0.5 text-[10px] font-semibold text-muted-foreground">
                    {distance.toFixed(1)} km mula sa point na ito
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[1.6rem] bg-[#e5eee3] p-5 sm:p-6">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 contour-lines-dark opacity-80" />
            <div className="relative">
              <h2 className="font-display text-lg font-bold text-forest">Iba pang opsyon para sa lugar na ito</h2>
              <div className="mt-2 grid grid-cols-2 gap-x-5">
                <Link
                  href={`/provinces/${province?.slug ?? ""}`}
                  className="flex min-h-12 items-center border-b border-canopy/15 text-sm font-bold text-[#3f5146] hover:text-primary"
                >
                  {locality.provinceName} probinsya
                </Link>
                <Link
                  href={`/cool-places?locality=${locality.code}&lat=${locality.lat}&lon=${locality.lon}&sort=nearest`}
                  className="flex min-h-12 items-center border-b border-canopy/15 text-sm font-bold text-[#3f5146] hover:text-primary"
                >
                  Pinakamalapit na pasilidad
                </Link>
                <Link
                  href="/preparedness"
                  className="flex min-h-12 items-center border-b border-canopy/15 text-sm font-bold text-[#3f5146] hover:text-primary"
                >
                  Paghahanda sa init
                </Link>
                <Link
                  href="/alerts"
                  className="flex min-h-12 items-center border-b border-canopy/15 text-sm font-bold text-[#3f5146] hover:text-primary"
                >
                  Opisyal na babala
                </Link>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-[#536258]">
                May {localities.length} lugar sa regional dataset. Gamitin ang location picker sa itaas para palitan
                ang lugar na tinitingnan.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link href="/map">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Mapa ng rehiyon
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
