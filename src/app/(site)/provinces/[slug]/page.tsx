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
  if (!province) return { title: "Wala ang probinsya" };
  return {
    title: `${province.name} — init at mga lugar`,
    description: `Model weather, estimated heat index, mga lungsod at munisipyo, at preskong lugar sa ${province.name}, Central Luzon.`,
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
              Mapa ng init
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {province.name}
          </li>
        </ol>
      </nav>

      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Probinsya</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">{province.name}</h1>
        <p className="mt-2 text-base leading-relaxed text-slate-600">
          Model conditions sa {point.name}, kasama ang lahat ng {localities.length} lungsod at munisipyo sa probinsya.
          Isang representative grid point lang ang weather ng probinsya, hindi province-wide measurement.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {localities.length} lugar
          </Badge>
          <Badge variant="outline">
            <Building2 className="h-3.5 w-3.5" aria-hidden="true" /> Capital: {capital?.name ?? province.capitalName}
          </Badge>
          <Badge variant={verifiedCount > 0 ? "success" : "warning"}>
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> {verifiedCount} beripikado / {placeCount} nakalista
          </Badge>
        </div>
      </div>

      <div className="mt-6">
        <PointWeather
          latitude={point.lat}
          longitude={point.lon}
          label={`${point.name} (representative point)`}
          context={`${province.name} · ${province.areaKm2.toLocaleString("fil-PH")} km² · model grid point sa capital ng probinsya`}
          note={`Nakuha ang reading na ito sa ${point.name}. Puwedeng iba ang kondisyon sa ibang bahagi ng ${province.name}, lalo na sa mas mataas na lugar at sa baybayin.`}
        />
      </div>

      <section className="mt-10" aria-labelledby="localities-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Sakop ng probinsya</p>
            <h2 id="localities-heading" className="mt-1 text-2xl font-extrabold tracking-tight text-navy">
              Mga lungsod at munisipyo
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Buksan ang lugar para sa sarili nitong model point, estimated heat index, at mga pasilidad sa malapit.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/cool-places?province=${province.code}`}>
              Preskong lugar sa {province.name} <ArrowRight className="h-4 w-4" aria-hidden="true" />
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
                      {locality.type === "City" ? "Lungsod" : "Munisipyo"}
                      {locality.isCapital ? " · capital ng probinsya" : ""}
                      {locality.isIndependent ? " · independent city" : ""}
                    </p>
                    {!locality.boundaryAvailable ? (
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                        Representative point lang
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
        <Alert variant="info" className="mt-8" title="Mga independent city">
          {province.name === "Pampanga"
            ? "Politically independent ang Angeles City mula sa Pampanga pero kasama ito para sa regional coverage. Representative point ang gamit dahil wala ang geometry nito sa source boundary file."
            : "Politically independent ang Olongapo City mula sa Zambales pero kasama ito para sa regional coverage. Representative point ang gamit dahil wala ang geometry nito sa source boundary file."}
        </Alert>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-navy">
              <Info className="h-4 w-4 text-primary" aria-hidden="true" /> Limitasyon ng datos
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Model estimate ang weather at heat index para sa isang coordinate. Administrative geography ang hangganan
              ng probinsya, hindi heat measurement. Unverified public facility ang cooling-place record maliban kung
              sinuri ng reviewer ang public access at pagiging angkop nito.
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold">
              <Link href="/methodology" className="inline-flex min-h-11 items-center text-primary hover:underline">
                Paano namin kinukuha ang datos
              </Link>
              <Link href={`/map?province=${province.code}`} className="inline-flex min-h-11 items-center text-primary hover:underline">
                Buksan ang regional map
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <h2 className="text-base font-bold text-navy">Iba pang probinsya</h2>
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
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Bumalik sa home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
