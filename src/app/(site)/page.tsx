import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Map, MapPin, ShieldCheck } from "lucide-react";
import { WeatherDashboard } from "@/components/weather/weather-dashboard";
import { RegionOverview } from "@/components/weather/region-overview";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Heat dashboard for Central Luzon",
  description:
    "Check current model conditions, estimated heat index, 24-hour forecast, regional heat overview, cooling places, and preparedness guidance for Central Luzon.",
};

const quickLinks = [
  {
    href: "/map",
    icon: Map,
    title: "Regional heat map",
    body: "Explore province-level model conditions with a searchable text alternative.",
  },
  {
    href: "/cool-places",
    icon: MapPin,
    title: "Cool places directory",
    body: "Search public facilities and see clearly labelled verification status.",
  },
  {
    href: "/preparedness",
    icon: BookOpen,
    title: "Preparedness centre",
    body: "Practical before, during, and after guidance with government sources.",
  },
];

export default function HomePage() {
  return (
    <>
      <WeatherDashboard />

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6 lg:px-8">
        <RegionOverview />

        <section aria-labelledby="quick-links-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Plan and act</p>
              <h2 id="quick-links-heading" className="mt-1 text-2xl font-extrabold tracking-tight text-navy">
                Use SILONG PH
              </h2>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/about">
                How this works <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {quickLinks.map(({ href, icon: Icon, title, body }) => (
              <Link key={href} href={href} className="group rounded-xl">
                <Card className="h-full transition-colors group-hover:border-orange-300 group-hover:shadow-md">
                  <CardContent className="pt-5 sm:pt-6">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="mt-3 text-base font-bold text-navy">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{body}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                      Open <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl bg-navy p-6 text-white sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-orange-300">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Transparency first
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                No fake live readings. No invented advisories.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
                SILONG PH shows Open-Meteo model data with timestamps, labels estimated heat index clearly, and
                never presents an application calculation as an official PAGASA observation. Official advisories are
                only shown when an authorised administrator records a verifiable source. Cooling facilities start as
                unverified unless a reviewer has checked them.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button asChild variant="secondary" className="w-full">
                <Link href="/methodology">Read data sources and methodology</Link>
              </Button>
              <Button asChild variant="outline" className="w-full border-white/20 bg-transparent text-white hover:bg-white/10">
                <a href="https://www.pagasa.dost.gov.ph/weather/heat-index" target="_blank" rel="noreferrer">
                  Official PAGASA heat index
                </a>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
