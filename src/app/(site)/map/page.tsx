import type { Metadata } from "next";
import { ExternalLink, Info, MapPinned } from "lucide-react";
import { PageMasthead } from "@/components/layout/page-masthead";
import { RegionHeatMap } from "@/components/map/region-heat-map";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Mapa ng init sa Central Luzon",
  description:
    "Tingnan ang model-based estimated heat index sa pitong probinsya ng Central Luzon, may hangganan ng lungsod at munisipyo at searchable na text alternative.",
};

export default function MapPage() {
  return (
    <div>
      <PageMasthead
        eyebrow="Mapa ng init"
        title="Init sa buong Central Luzon"
        description="Ang kulay ng probinsya ay estimated heat index mula sa Open-Meteo model grid point sa capital nito. Hindi ito province-wide measurement, official PAGASA observation, o barangay-level reading."
        actions={
          <>
            <Badge variant="outline" className="border-white/25 bg-white/5 text-white">
              <MapPinned className="h-3.5 w-3.5" aria-hidden="true" /> 7 probinsya
            </Badge>
            <Badge variant="outline" className="border-white/25 bg-white/5 text-white">
              Model estimate · hindi official
            </Badge>
          </>
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        <RegionHeatMap />

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Info className="h-4 w-4 text-canopy" aria-hidden="true" /> Data ng mapa: PSA PSGC / faeldon
            philippines-json-maps (MIT).
          </span>
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 font-bold text-primary hover:underline"
          >
            Attribution sa OpenStreetMap <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 font-bold text-primary hover:underline"
          >
            Attribution sa Open-Meteo <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
