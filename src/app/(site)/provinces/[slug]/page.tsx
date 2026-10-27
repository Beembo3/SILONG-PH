import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Building2, Info, MapPin, ShieldCheck } from "lucide-react";
import { PageMasthead, SectionHeading } from "@/components/layout/page-masthead";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    <div>
      <PageMasthead
        eyebrow="Probinsya"
        title={province.name}
        description={`Model conditions sa ${point.name}, kasama ang lahat ng ${localities.length} lungsod at munisipyo sa probinsya. Isang representative grid point lang ang weather ng probinsya, hindi province-wide measurement.`}
        backHref="/map"
        backLabel="Bumalik sa mapa"
        actions={
          <>
            <Badge variant="outline" className="border-white/25 bg-white/5 text-white">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {localities.length} lugar
            </Badge>
            <Badge variant="outline" className="border-white/25 bg-white/5 text-white">
              <Building2 className="h-3.5 w-3.5" aria-hidden="true" /> Capital: {capital?.name ?? province.capitalName}
            </Badge>
            <Badge variant="outline" className="border-white/25 bg-white/5 text-white">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> {verifiedCount} beripikado / {placeCount} nakalista
            </Badge>
          </>
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 -mt-7 sm:-mt-10">
          <PointWeather
            latitude={point.lat}
            longitude={point.lon}
            label={`${point.name} (representative point)`}
            context={`${province.name} · ${province.areaKm2.toLocaleString("fil-PH")} km² · model grid point sa capital ng probinsya`}
            note={`Nakuha ang reading na ito sa ${point.name}. Puwedeng iba ang kondisyon sa ibang bahagi ng ${province.name}, lalo na sa mas mataas na lugar at sa baybayin.`}
          />
        </div>

        <section className="mt-12" aria-labelledby="localities-heading">
          <SectionHeading
            eyebrow="Sakop ng probinsya"
            id="localities-heading"
            title="Mga lungsod at munisipyo"
            description="Buksan ang lugar para sa sarili nitong model point, estimated heat index, at mga pasilidad sa malapit."
            action={
              <Button asChild variant="outline" size="sm">
                <Link href={`/cool-places?province=${province.code}`}>
                  Preskong lugar sa {province.name} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            }
          />
          <div className="mt-5 overflow-hidden rounded-[1.6rem] border border-border bg-card shadow-[var(--shadow-soft)]">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3">
              {localities.map((locality, index) => (
                <Link
                  key={locality.code}
                  href={`/localities/${locality.code}`}
                  className="group flex min-h-20 items-start justify-between gap-3 border-b border-border/70 px-4 py-4 transition-colors last:border-b-0 hover:bg-[#f8f3e9] sm:[&:nth-last-child(-n+2)]:border-b-0 lg:[&:nth-last-child(-n+3)]:border-b-0 lg:border-r lg:[&:nth-child(3n)]:border-r-0"
                >
                  <div className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="font-display text-sm font-bold tracking-[-0.02em] text-forest">{locality.name}</span>
                      {locality.isCapital ? (
                        <span className="rounded-full bg-[#f3eadb] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#7a4300]">
                          Capital
                        </span>
                      ) : null}
                    </span>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {locality.type === "City" ? "Lungsod" : "Munisipyo"}
                      {locality.isIndependent ? " · independent city" : ""}
                    </p>
                    {!locality.boundaryAvailable ? (
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#8a4b00]">
                        Representative point lang
                      </p>
                    ) : null}
                  </div>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f8f3e9] text-sage transition-colors group-hover:bg-sun group-hover:text-forest">
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <span className="sr-only">Lugar {index + 1}</span>
                </Link>
              ))}
            </div>
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
          <div className="relative overflow-hidden rounded-[1.6rem] bg-[#e5eee3] p-5 sm:p-6">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 contour-lines-dark opacity-80" />
            <div className="relative">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-forest">
                <Info className="h-4 w-4 text-canopy" aria-hidden="true" /> Limitasyon ng datos
              </h2>
              <p className="mt-2 text-sm leading-7 text-[#3f5146]">
                Model estimate ang weather at heat index para sa isang coordinate. Administrative geography ang hangganan
                ng probinsya, hindi heat measurement. Unverified public facility ang cooling-place record maliban kung
                sinuri ng reviewer ang public access at pagiging angkop nito.
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold">
                <Link href="/methodology" className="inline-flex min-h-11 items-center text-primary hover:underline">
                  Paano namin kinukuha ang datos
                </Link>
                <Link href={`/map?province=${province.code}`} className="inline-flex min-h-11 items-center text-primary hover:underline">
                  Buksan ang regional map
                </Link>
              </div>
            </div>
          </div>
          <div className="paper-panel rounded-[1.6rem] p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold text-forest">Iba pang probinsya</h2>
            <div className="mt-3 grid grid-cols-2 gap-x-5">
              {provinces
                .filter((item) => item.code !== province.code)
                .map((item) => (
                  <Link
                    key={item.code}
                    href={`/provinces/${item.slug}`}
                    className="flex min-h-11 items-center justify-between gap-2 border-b border-border/60 text-sm font-bold text-[#536258] transition-colors hover:text-primary"
                  >
                    {item.name}
                    <ArrowRight className="h-3.5 w-3.5 text-sage" aria-hidden="true" />
                  </Link>
                ))}
            </div>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Bumalik sa home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
