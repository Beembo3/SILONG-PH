import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Building2, Info, MapPin, ShieldCheck } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PointWeather } from "@/components/weather/point-weather";
import { getCapital, getProvince, localitiesForProvince, provinces, provinceWeatherPoint } from "@/lib/geography";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return provinces.map((province) => ({ slug: province.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const province = getProvince(slug);
  if (!province) return { title: "Province not found" };
  return {
    title: `${province.name} heat conditions and localities`,
    description: `Model weather, estimated heat index, cities and municipalities, and cool-place records for ${province.name}, Central Luzon.`,
  };
}

export default async function ProvincePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const province = getProvince(slug);
  if (!province) notFound();

  const localities = localitiesForProvince(province.code);
  const capital = getCapital(province);
  const point = provinceWeatherPoint(province);
  const [placeCount, verifiedCount] = await Promise.all([
    prisma.coolingPlace.count({ where: { provinceCode: province.code, archivedAt: null } }),
    prisma.coolingPlace.count({
      where: { provinceCode: province.code, archivedAt: null, verificationStatus: "VERIFIED" },
    }),
  ]);

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
            <Link href="/map" className="hover:text-primary">
              Heat map
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {province.name}
          </li>
        </ol>
      </nav>

      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Province profile</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">{province.name}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Model conditions at {point.name}, plus all {localities.length} cities and municipalities in the province.
          Province weather is a single representative grid point, not a province-wide measurement.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {localities.length} localities
          </Badge>
          <Badge variant="outline">
            <Building2 className="h-3.5 w-3.5" aria-hidden="true" /> Capital: {capital?.name ?? province.capitalName}
          </Badge>
          <Badge variant={verifiedCount > 0 ? "success" : "warning"}>
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> {verifiedCount} verified / {placeCount} listed
          </Badge>
        </div>
      </div>

      <div className="mt-6">
        <PointWeather
          latitude={point.lat}
          longitude={point.lon}
          label={`${point.name} (representative point)`}
          context={`${province.name} · ${province.areaKm2.toLocaleString("en-PH")} km² · model grid point at the provincial capital`}
          note={`This reading is sampled at ${point.name}. Conditions in other parts of ${province.name} can differ, especially at higher elevations and along the coast.`}
        />
      </div>

      <section className="mt-10" aria-labelledby="localities-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Local coverage</p>
            <h2 id="localities-heading" className="mt-1 text-2xl font-extrabold tracking-tight text-navy">
              Cities and municipalities
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Open a locality for its own model point, estimated heat index, and nearby facility records.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/cool-places?province=${province.code}`}>
              Cool places in {province.name} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {localities.map((locality) => (
            <Link key={locality.code} href={`/localities/${locality.code}`} className="group rounded-xl">
              <Card className="h-full transition-colors group-hover:border-orange-300 group-hover:shadow-md">
                <CardContent className="flex h-full items-start justify-between gap-3 pt-4 sm:pt-5">
                  <div>
                    <p className="text-sm font-bold text-navy">{locality.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {locality.type}
                      {locality.isCapital ? " · provincial capital" : ""}
                      {locality.isIndependent ? " · independent city" : ""}
                    </p>
                    {!locality.boundaryAvailable ? (
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                        Representative point only
                      </p>
                    ) : null}
                  </div>
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-primary" aria-hidden="true" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {province.name === "Pampanga" || province.name === "Zambales" ? (
        <Alert variant="info" className="mt-8" title="Independent cities">
          {province.name === "Pampanga"
            ? "Angeles City is politically independent from Pampanga but is included here for regional coverage. It uses a representative point because the source boundary file does not include its geometry."
            : "Olongapo City is politically independent from Zambales but is included here for regional coverage. It uses a representative point because the source boundary file does not include its geometry."}
        </Alert>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-navy">
              <Info className="h-4 w-4 text-primary" aria-hidden="true" /> Data limits
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Weather and heat index are model estimates for one coordinate. The province boundary is administrative
              geography, not a heat measurement. Cooling-place records start as unverified public facilities unless a
              reviewer has checked public access and cooling suitability.
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold">
              <Link href="/methodology" className="text-primary hover:underline">
                Methodology
              </Link>
              <Link href={`/map?province=${province.code}`} className="text-primary hover:underline">
                Open regional map
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <h2 className="text-base font-bold text-navy">Other provinces</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {provinces
                .filter((item) => item.code !== province.code)
                .map((item) => (
                  <Link
                    key={item.code}
                    href={`/provinces/${item.slug}`}
                    className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-slate-700 hover:border-orange-300 hover:text-primary"
                  >
                    {item.name}
                  </Link>
                ))}
            </div>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
