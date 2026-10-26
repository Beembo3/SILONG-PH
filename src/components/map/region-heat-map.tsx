"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { FeatureCollection, Geometry } from "geojson";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import {
  ArrowRight,
  ExternalLink,
  Layers,
  MapPin,
  RefreshCw,
  Search,
  TriangleAlert,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { RiskBadge } from "@/components/weather/risk-badge";
import { provinces as allProvinces, getProvince } from "@/lib/geography";
import { formatNumber, formatPST } from "@/lib/format";
import type { WeatherSnapshot } from "@/lib/weather/types";
import { cn } from "@/lib/utils";

interface ProvinceFeatureProperties {
  code: string;
  name: string;
  slug: string;
  capitalName: string;
}

interface ProvinceWeather {
  code: string;
  name: string;
  slug: string;
  capitalName: string;
  weather: WeatherSnapshot | null;
}

interface RegionResponse {
  provinces: ProvinceWeather[];
  fetchedAt: string;
  stale: boolean;
  note: string;
}

interface PlaceResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  verificationStatus: string;
}

const RISK_COLORS: Record<string, string> = {
  below_caution: "#94a3b8",
  caution: "#f5b544",
  extreme_caution: "#f97316",
  danger: "#dc2626",
  extreme_danger: "#7f1d1d",
};

function riskColor(weather: WeatherSnapshot | null | undefined): string {
  return RISK_COLORS[weather?.current.heatIndexCategory.level ?? "below_caution"] ?? "#94a3b8";
}

export function RegionHeatMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [tilesFailed, setTilesFailed] = useState(false);
  const [provinceGeo, setProvinceGeo] = useState<FeatureCollection<Geometry, ProvinceFeatureProperties> | null>(null);
  const [municipalityGeo, setMunicipalityGeo] = useState<FeatureCollection<Geometry, Record<string, unknown>> | null>(null);
  const [region, setRegion] = useState<RegionResponse | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [showMunicipalities, setShowMunicipalities] = useState(true);
  const [showCoolPlaces, setShowCoolPlaces] = useState(false);
  const [coolPlaces, setCoolPlaces] = useState<PlaceResult[] | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const [provinceResponse, municipalityResponse, regionResponse, placesResponse] =
        await Promise.all([
          fetch("/geo/provinces.geojson", { signal }),
          fetch("/geo/municipalities.geojson", { signal }),
          fetch(`/api/weather/region?_=${Date.now()}`, { signal, cache: "no-store" }),
          fetch("/api/places?pageSize=60&verification=VERIFIED", { signal }),
        ]);
      if (!provinceResponse.ok || !municipalityResponse.ok) {
        throw new Error("Geographic boundary data could not be loaded.");
      }
      const regionBody = await regionResponse.json();
      if (!regionResponse.ok) {
        throw new Error(regionBody.error ?? "Regional heat data is unavailable.");
      }
      setProvinceGeo(await provinceResponse.json());
      setMunicipalityGeo(await municipalityResponse.json());
      setRegion(regionBody as RegionResponse);
      if (placesResponse.ok) {
        const placesBody = await placesResponse.json();
        setCoolPlaces(Array.isArray(placesBody.items) ? placesBody.items : []);
      } else {
        setCoolPlaces([]);
      }
    } catch (err) {
      if (signal?.aborted) return;
      setError(err instanceof Error ? err.message : "The heat map could not be loaded.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    // The async loader only updates state after the fetch settles. The rule
    // cannot see through the promise boundary and flags any called setState.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(controller.signal);
    return () => controller.abort();
  }, [load, attempt]);

  const retry = useCallback(() => {
    setError(null);
    setLoading(true);
    setAttempt((value) => value + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | null = null;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapContainer.current || mapRef.current) return;
      map = L.map(mapContainer.current, {
        center: [15.45, 120.75],
        zoom: 8,
        zoomControl: true,
        scrollWheelZoom: false,
      });
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      })
        .on("tileerror", () => setTilesFailed(true))
        .addTo(map);
      L.control.scale({ imperial: false }).addTo(map);
      setMapReady(true);
    })();
    return () => {
      cancelled = true;
      if (map) {
        map.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const weatherByProvince = useMemo(() => {
    const map = new Map<string, WeatherSnapshot | null>();
    for (const province of region?.provinces ?? []) map.set(province.code, province.weather);
    return map;
  }, [region]);

  const selectedProvince = selectedCode ? getProvince(selectedCode) : undefined;
  const selectedWeather = selectedCode ? weatherByProvince.get(selectedCode) : null;

  useEffect(() => {
    if (!mapReady || !mapRef.current || !provinceGeo) return;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      const map = mapRef.current;
      if (!map || cancelled) return;
      if (layerRef.current) {
        layerRef.current.remove();
        layerRef.current = null;
      }
      const group = L.layerGroup().addTo(map);
      layerRef.current = group;

      const provinceLayer = L.geoJSON(provinceGeo as FeatureCollection, {
        style: (feature) => {
          const code = String(feature?.properties?.code ?? "");
          const weather = weatherByProvince.get(code);
          const isSelected = code === selectedCode;
          return {
            color: isSelected ? "#0b1426" : "#ffffff",
            weight: isSelected ? 3 : 1.5,
            fillColor: riskColor(weather),
            fillOpacity: isSelected ? 0.62 : 0.45,
          };
        },
        onEachFeature: (feature, layer) => {
          const code = String(feature.properties?.code ?? "");
          const name = String(feature.properties?.name ?? "Province");
          const weather = weatherByProvince.get(code);
          layer.bindTooltip(
            `<strong>${name}</strong><br/>Est. heat index: ${
              weather?.current.heatIndexC != null ? `${formatNumber(weather.current.heatIndexC, 1)} °C` : "unavailable"
            }<br/><span style="font-size:11px;color:#667085">Model point: ${
              weather ? weather.current.condition : "—"
            }</span>`,
            { sticky: true },
          );
          layer.on("click", () => setSelectedCode(code));
        },
      }).addTo(group);

      const capitalMarkers = L.layerGroup().addTo(group);
      for (const province of allProvinces) {
        const weather = weatherByProvince.get(province.code);
        if (!weather) continue;
        const capital = province.capitalName;
        L.circleMarker([province.lat, province.lon], {
          radius: province.code === selectedCode ? 9 : 6,
          color: "#ffffff",
          weight: 2,
          fillColor: riskColor(weather),
          fillOpacity: 1,
        })
          .bindTooltip(
            `<strong>${province.name}</strong><br/>${capital}<br/>Est. heat index ${formatNumber(
              weather.current.heatIndexC,
              1,
            )} °C`,
          )
          .on("click", () => setSelectedCode(province.code))
          .addTo(capitalMarkers);
      }

      if (selectedCode && municipalityGeo && showMunicipalities) {
        const selected = getProvince(selectedCode);
        L.geoJSON(municipalityGeo as FeatureCollection, {
          filter: (feature) => String(feature.properties?.provinceCode ?? "") === selectedCode,
          style: {
            color: "#0b1426",
            weight: 1,
            fillColor: "#ffffff",
            fillOpacity: 0.03,
            dashArray: "3 4",
          },
          onEachFeature: (feature, layer) => {
            const name = String(feature.properties?.name ?? "Locality");
            const code = String(feature.properties?.code ?? "");
            layer.bindTooltip(
              `<strong>${name}</strong><br/><span style="font-size:11px">Municipality boundary. No municipality-level measurement is displayed.</span><br/><a href="/locations/${code}">Open location dashboard</a>`,
              { sticky: true },
            );
          },
        }).addTo(group);
        if (selected) {
          const bounds = provinceLayer.getBounds();
          if (bounds.isValid()) map.fitBounds(bounds, { padding: [24, 24], maxZoom: 10 });
        }
      }

      if (showCoolPlaces && coolPlaces) {
        const markerGroup = L.layerGroup().addTo(group);
        for (const place of coolPlaces) {
          L.circleMarker([place.latitude, place.longitude], {
            radius: 7,
            color: "#ffffff",
            weight: 2,
            fillColor: "#16865b",
            fillOpacity: 1,
          })
            .bindPopup(
              `<strong>${place.name}</strong><br/>${place.address}<br/><span style="font-size:11px">Verified facility</span><br/><a href="/cool-places/${place.id}">View details</a>`,
            )
            .addTo(markerGroup);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    mapReady,
    provinceGeo,
    municipalityGeo,
    weatherByProvince,
    selectedCode,
    showMunicipalities,
    showCoolPlaces,
    coolPlaces,
  ]);

  const filteredProvinces = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allProvinces.filter((province) => !q || province.name.toLowerCase().includes(q));
  }, [search]);

  function focusProvince(code: string) {
    setSelectedCode(code);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" aria-hidden="true" /> Find a province
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label htmlFor="province-search" className="sr-only">
              Search provinces
            </label>
            <Input
              id="province-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search province"
            />
            <ul className="space-y-1.5" aria-label="Central Luzon provinces">
              {filteredProvinces.map((province) => {
                const weather = weatherByProvince.get(province.code);
                const active = selectedCode === province.code;
                return (
                  <li key={province.code}>
                    <button
                      type="button"
                      onClick={() => focusProvince(province.code)}
                      aria-pressed={active}
                      className={cn(
                        "w-full rounded-lg border px-3 py-2.5 text-left transition-colors",
                        active
                          ? "border-orange-300 bg-orange-50"
                          : "border-border bg-white hover:bg-muted",
                      )}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-navy">{province.name}</span>
                        <span className="text-xs font-bold text-orange-700">
                          {weather?.current.heatIndexC != null
                            ? `${formatNumber(weather.current.heatIndexC, 1)}°`
                            : "—"}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {weather?.current.heatIndexCategory.label ?? "Weather unavailable"} · {province.capitalName}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" aria-hidden="true" /> Layers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <label className="flex items-center justify-between gap-3">
              <span>
                <span className="font-semibold">Province heat layer</span>
                <span className="block text-xs text-muted-foreground">Estimated heat index, model point</span>
              </span>
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-800">On</span>
            </label>
            <label className="flex items-center justify-between gap-3">
              <span>
                <span className="font-semibold">City/municipality boundaries</span>
                <span className="block text-xs text-muted-foreground">Shown after selecting a province</span>
              </span>
              <input
                type="checkbox"
                checked={showMunicipalities}
                onChange={(event) => setShowMunicipalities(event.target.checked)}
                className="h-5 w-5 accent-orange-600"
              />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span>
                <span className="font-semibold">Verified cooling places</span>
                <span className="block text-xs text-muted-foreground">
                  {coolPlaces == null ? "Loading…" : `${coolPlaces.length} verified`}
                </span>
              </span>
              <input
                type="checkbox"
                checked={showCoolPlaces}
                onChange={(event) => setShowCoolPlaces(event.target.checked)}
                className="h-5 w-5 accent-orange-600"
              />
            </label>
            <div className="rounded-lg border border-dashed border-border p-3 text-xs leading-relaxed text-muted-foreground">
              <p className="font-semibold text-slate-700">Official observation layer unavailable</p>
              <p className="mt-1">
                No documented public PAGASA heat-index API is integrated. The map does not label model estimates as
                official observations.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {tilesFailed ? (
          <Alert variant="warning" title="Map tiles could not be loaded">
            The base map may be blank. All province data remains available in the searchable list and the province
            details below.
          </Alert>
        ) : null}
        {error ? (
          <Alert variant="danger" title="Heat map unavailable">
            {error}{" "}
            <button className="font-semibold underline" onClick={retry}>
              Retry
            </button>
          </Alert>
        ) : null}

        <Card className="overflow-hidden">
          <div className="relative isolate">
            <div
              ref={mapContainer}
              className="h-[26rem] w-full sm:h-[32rem] lg:h-[38rem]"
              role="application"
              aria-label="Interactive map of Central Luzon provinces coloured by estimated heat index"
            />
            {loading ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
                <div className="space-y-2 text-center">
                  <Skeleton className="mx-auto h-6 w-40" />
                  <p className="text-sm text-muted-foreground">Loading map and model weather…</p>
                </div>
              </div>
            ) : null}
          </div>
          <div className="border-t border-border bg-white p-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
              <span className="font-semibold text-slate-700">Legend (estimated heat index):</span>
              {[
                ["Below 27°C", "below_caution"],
                ["27–32°C Caution", "caution"],
                ["33–41°C Extreme caution", "extreme_caution"],
                ["42–51°C Danger", "danger"],
                ["52°C+ Extreme danger", "extreme_danger"],
              ].map(([label, level]) => (
                <span key={level} className="inline-flex items-center gap-1.5 text-slate-600">
                  <span
                    className="h-3 w-3 rounded-sm border border-white"
                    style={{ backgroundColor: RISK_COLORS[level] }}
                    aria-hidden="true"
                  />
                  {label}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Province fill is an overview using a model grid point at each capital, not a measurement of every part
              of the province. Map tiles © OpenStreetMap contributors. Weather by Open-Meteo.
            </p>
          </div>
        </Card>

        {selectedProvince ? (
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Selected province</p>
                  <CardTitle className="mt-1 text-xl">{selectedProvince.name}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Model point: {selectedProvince.capitalName} · {formatPST(region?.fetchedAt)}
                  </p>
                </div>
                {selectedWeather ? <RiskBadge category={selectedWeather.current.heatIndexCategory} /> : null}
              </div>
            </CardHeader>
            <CardContent>
              {selectedWeather ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Estimated heat index</p>
                    <p className="numeric text-3xl font-extrabold text-orange-700">
                      {formatNumber(selectedWeather.current.heatIndexC, 1)} °C
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Air temperature</p>
                    <p className="numeric text-3xl font-extrabold text-navy">
                      {formatNumber(selectedWeather.current.temperatureC, 1)} °C
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Relative humidity</p>
                    <p className="numeric text-3xl font-extrabold text-navy">
                      {selectedWeather.current.relativeHumidity ?? "—"}%
                    </p>
                  </div>
                  <div className="sm:col-span-3 flex flex-wrap gap-2">
                    <Button asChild size="sm">
                      <Link href={`/provinces/${selectedProvince.slug}`}>
                        Province details <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/cool-places?province=${selectedProvince.code}`}>
                        Cool places <MapPin className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Weather is unavailable for this model point. Province boundaries are still available.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex items-start gap-3 pt-5 sm:pt-6">
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
              <div className="text-sm">
                <p className="font-semibold text-navy">Select a province</p>
                <p className="mt-1 text-muted-foreground">
                  Click a province on the map or use the searchable list. The map is a visual aid; all key information
                  is repeated in text.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <details className="rounded-xl border border-border bg-white p-4">
          <summary className="cursor-pointer text-sm font-bold text-navy">Accessible province data table</summary>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th scope="col" className="py-2 pr-3">Province</th>
                  <th scope="col" className="py-2 pr-3">Model point</th>
                  <th scope="col" className="py-2 pr-3">Est. heat index</th>
                  <th scope="col" className="py-2 pr-3">Category</th>
                  <th scope="col" className="py-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {allProvinces.map((province) => {
                  const weather = weatherByProvince.get(province.code);
                  return (
                    <tr key={province.code} className="border-b border-border/60">
                      <td className="py-2 pr-3 font-semibold">{province.name}</td>
                      <td className="py-2 pr-3">{province.capitalName}</td>
                      <td className="py-2 pr-3">
                        {weather?.current.heatIndexC != null ? `${formatNumber(weather.current.heatIndexC, 1)} °C` : "Unavailable"}
                      </td>
                      <td className="py-2 pr-3">{weather?.current.heatIndexCategory.label ?? "Unavailable"}</td>
                      <td className="py-2">
                        <Link href={`/provinces/${province.slug}`} className="font-semibold text-primary hover:underline">
                          Open
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </details>

        <p className="text-xs text-muted-foreground">
          <RefreshCw className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
          Data is refreshed from the server cache approximately every 10 minutes. Use the refresh button to request a
          new server check.{" "}
          <a
            href="https://www.pagasa.dost.gov.ph/weather/heat-index"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-primary hover:underline"
          >
            Official PAGASA <ExternalLink className="inline h-3 w-3" aria-hidden="true" />
          </a>
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={retry}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" /> Refresh map data
          </Button>
        </div>
      </div>
    </div>
  );
}
