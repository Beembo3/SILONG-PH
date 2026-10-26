import type { Metadata } from "next";
import { ExternalLink, Info } from "lucide-react";
import { RegionHeatMap } from "@/components/map/region-heat-map";

export const metadata: Metadata = {
  title: "Mapa ng init sa Central Luzon",
  description:
    "Tingnan ang model-based estimated heat index sa pitong probinsya ng Central Luzon, may hangganan ng lungsod at munisipyo at searchable na text alternative.",
};

export default function MapPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Mapa</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
          Init sa buong Central Luzon
        </h1>
        <p className="mt-2 text-base leading-relaxed text-slate-600">
          Ang kulay ng probinsya ay estimated heat index mula sa Open-Meteo model grid point sa capital nito. Hindi ito
          province-wide measurement, official PAGASA observation, o barangay-level reading.
        </p>
      </div>

      <RegionHeatMap />

      <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Info className="h-4 w-4" aria-hidden="true" /> Data ng mapa: PSA PSGC / faeldon philippines-json-maps (MIT).
        </span>
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
        >
          Attribution sa OpenStreetMap <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
        <a
          href="https://open-meteo.com/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
        >
          Attribution sa Open-Meteo <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
