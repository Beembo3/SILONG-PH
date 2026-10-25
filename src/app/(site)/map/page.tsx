import type { Metadata } from "next";
import { ExternalLink, Info } from "lucide-react";
import { RegionHeatMap } from "@/components/map/region-heat-map";
import { Alert } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "Regional heat map",
  description:
    "Explore model-based estimated heat index across the seven provinces of Central Luzon, with city and municipality boundaries and a searchable text alternative.",
};

export default function MapPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Interactive map</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
          Heat across Region III
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Province colours show an estimated heat index from an Open-Meteo model grid point at each provincial capital.
          They are not province-wide measurements, official PAGASA observations, or barangay-level readings.
        </p>
      </div>

      <Alert variant="info" className="mb-5" title="Read the map correctly">
        The province layer is an overview aid. City and municipality boundaries are administrative geography, not
        separate measurements. Select a province to see its model point and open the province or location dashboard
        for details.
      </Alert>

      <RegionHeatMap />

      <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Info className="h-4 w-4" aria-hidden="true" /> Map data: PSA PSGC / faeldon philippines-json-maps (MIT).
        </span>
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
        >
          OpenStreetMap attribution <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
        <a
          href="https://open-meteo.com/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
        >
          Open-Meteo attribution <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
