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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { HeatMeter } from "@/components/weather/heat-meter";
import { RiskBadge } from "@/components/weather/risk-badge";
import { provinces as allProvinces, getProvince } from "@/lib/geography";
import { conditionLabel, formatNumber, formatPST } from "@/lib/format";
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
  below_caution: "#b9c9bb",
  caution: "#e3b24f",
  extreme_caution: "#d27a32",
  danger: "#bd4b36",
  extreme_danger: "#8f2018",
};

function riskColor(weather: WeatherSnapshot | null | undefined): string {
  return RISK_COLORS[weather?.current.heatIndexCategory.level ?? "below_caution"] ?? "#94a3b8";
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
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
        throw new Error("Hindi ma-load ang geographic boundary data.");
      }
      const regionBody = await regionResponse.json();
      if (!regionResponse.ok) {
        throw new Error(regionBody.error ?? "Hindi available ang regional heat data.");
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
      setError(err instanceof Error ? err.message : "Hindi ma-load ang heat map.");
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
            color: isSelected ? "#123b2e" : "#fffcf5",
            weight: isSelected ? 3 : 1.5,
            fillColor: riskColor(weather),
            fillOpacity: isSelected ? 0.62 : 0.45,
          };
        },
        onEachFeature: (feature, layer) => {
          const code = String(feature.properties?.code ?? "");
          const name = String(feature.properties?.name ?? "Probinsya");
          const weather = weatherByProvince.get(code);
          layer.bindTooltip(
            `<strong>${escapeHtml(name)}</strong><br/>Est. heat index: ${
              weather?.current.heatIndexC != null ? `${formatNumber(weather.current.heatIndexC, 1)} °C` : "hindi available"
            }<br/><span style="font-size:11px;color:#5b6a60">Model point: ${
              weather ? escapeHtml(conditionLabel(weather.current.condition)) : "—"
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
            `<strong>${escapeHtml(province.name)}</strong><br/>${escapeHtml(capital)}<br/>Est. heat index ${formatNumber(
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
            color: "#123b2e",
            weight: 1,
            fillColor: "#ffffff",
            fillOpacity: 0.03,
            dashArray: "3 4",
          },
          onEachFeature: (feature, layer) => {
            const name = String(feature.properties?.name ?? "Lugar");
            const code = String(feature.properties?.code ?? "");
            layer.bindTooltip(
              `<strong>${escapeHtml(name)}</strong><br/><span style="font-size:11px">Hangganan ng munisipyo. Walang municipality-level measurement na ipinapakita.</span><br/><a href="/localities/${encodeURIComponent(code)}">Buksan ang locality page</a>`,
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
              `<strong>${escapeHtml(place.name)}</strong><br/>${escapeHtml(place.address)}<br/><span style="font-size:11px">Beripikadong pasilidad</span><br/><a href="/cool-places/${encodeURIComponent(place.id)}">Tingnan ang detalye</a>`,
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
    <div className="grid gap-5 lg:grid-cols-[21rem_minmax(0,1fr)]">
      <aside className="order-2 min-w-0 space-y-4 lg:order-1">
        <div className="paper-panel rounded-[1.6rem] p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-forest">
            <Search className="h-4 w-4 text-canopy" aria-hidden="true" /> Hanapin ang probinsya
          </h2>
          <label htmlFor="province-search" className="sr-only">
            Hanapin ang probinsya
          </label>
          <Input
            id="province-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Pangalan ng probinsya"
            className="mt-3"
          />
          <ul className="mt-3 divide-y divide-border/60" aria-label="Mga probinsya sa Central Luzon">
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
                      "group flex min-h-14 w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                      active
                        ? "border-sage/60 bg-[#e8efe5]"
                        : "border-transparent hover:bg-[#f8f3e9]",
                    )}
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 text-sm font-bold text-forest">
                        {province.name}
                        {active ? <span className="h-1.5 w-1.5 rounded-full bg-sun" aria-hidden="true" /> : null}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">
                        {weather?.current.heatIndexCategory.taglishLabel ?? "Walang weather"} · {province.capitalName}
                      </span>
                    </span>
                    <span className="numeric shrink-0 text-sm font-bold text-sun-ink">
                      {weather?.current.heatIndexC != null ? `${formatNumber(weather.current.heatIndexC, 1)}°` : "—"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="paper-panel rounded-[1.6rem] p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-forest">
            <Layers className="h-4 w-4 text-canopy" aria-hidden="true" /> Mga layer
          </h2>
          <div className="mt-3 space-y-3 text-sm">
            <div className="flex min-h-12 items-center justify-between gap-3">
              <span>
                <span className="font-bold text-forest">Layer ng init sa probinsya</span>
                <span className="block text-xs text-muted-foreground">Tinatayang heat index, model point</span>
              </span>
              <span className="shrink-0 rounded-full bg-[#e8efe5] px-2.5 py-1 text-[10px] font-bold text-[#24563c]">
                Naka-on
              </span>
            </div>
            <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3 border-t border-border/60 pt-3">
              <span>
                <span className="font-bold text-forest">Hangganan ng lungsod o munisipyo</span>
                <span className="block text-xs text-muted-foreground">Lalabas pagkatapos pumili ng probinsya</span>
              </span>
              <input
                type="checkbox"
                checked={showMunicipalities}
                onChange={(event) => setShowMunicipalities(event.target.checked)}
                className="h-5 w-5 shrink-0 accent-[#174b38]"
              />
            </label>
            <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3 border-t border-border/60 pt-3">
              <span>
                <span className="font-bold text-forest">Beripikadong preskong lugar</span>
                <span className="block text-xs text-muted-foreground">
                  {coolPlaces == null ? "Naglo-load…" : `${coolPlaces.length} beripikado`}
                </span>
              </span>
              <input
                type="checkbox"
                checked={showCoolPlaces}
                onChange={(event) => setShowCoolPlaces(event.target.checked)}
                className="h-5 w-5 shrink-0 accent-[#174b38]"
              />
            </label>
            <div className="rounded-2xl border border-dashed border-border p-3 text-xs leading-relaxed text-muted-foreground">
              <p className="font-bold text-forest">Walang official observation layer</p>
              <p className="mt-1">
                Walang documented public PAGASA heat-index API na naka-integrate. Hindi nilalagyan ng label na official
                observation ang model estimates sa mapa.
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div className="contents min-w-0 lg:order-2 lg:block lg:space-y-4">
        {tilesFailed ? (
          <Alert variant="warning" className="order-0" title="Hindi nag-load ang map tiles">
            Maaaring blangko ang base map. Available pa rin ang lahat ng data ng probinsya sa searchable na listahan at
            sa detalye ng probinsya sa ibaba.
          </Alert>
        ) : null}
        {error ? (
          <Alert variant="danger" className="order-0" title="Hindi available ang heat map">
            {error}{" "}
            <button className="font-bold underline" onClick={retry}>
              Subukan muli
            </button>
          </Alert>
        ) : null}

        <div className="order-1 overflow-hidden rounded-[1.7rem] border border-border bg-card shadow-[var(--shadow-soft)]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/75 px-4 py-3 sm:px-5">
            <div>
              <p className="eyebrow text-sun-ink">
                <span className="h-1.5 w-1.5 rounded-full bg-sun" aria-hidden="true" /> Model estimate
              </p>
              <h2 className="mt-1 font-display text-lg font-bold tracking-[-0.03em] text-forest">
                Heat index sa probinsya
              </h2>
            </div>
            <Badge variant="outline">Hindi official observation</Badge>
          </div>
          <div className="border-b border-border/75 bg-[#f8f3e9] px-4 py-3 lg:hidden">
            <label htmlFor="mobile-province-picker" className="text-[10px] font-extrabold uppercase tracking-[0.11em] text-muted-foreground">
              Pumili ng probinsya
            </label>
            <Select
              id="mobile-province-picker"
              value={selectedCode ?? ""}
              onChange={(event) => setSelectedCode(event.target.value || null)}
              className="mt-1.5 bg-card"
            >
              <option value="">Lahat ng probinsya</option>
              {allProvinces.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="relative isolate">
            <div
              ref={mapContainer}
              className="h-[22rem] w-full sm:h-[32rem] lg:h-[38rem]"
              role="application"
              aria-label="Interactive na mapa ng mga probinsya sa Central Luzon, may kulay ayon sa estimated heat index"
            />
            {loading ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-ivory/75 backdrop-blur-[1px]">
                <div className="space-y-2 text-center">
                  <Skeleton className="mx-auto h-6 w-40" />
                  <p className="text-sm text-muted-foreground">Naglo-load ang mapa at model weather…</p>
                </div>
              </div>
            ) : null}
          </div>
          <div className="border-t border-border/75 bg-card p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
              <span className="font-bold text-forest">Legend (tinatayang heat index):</span>
              {[
                ["Mababa sa 27°C", "below_caution"],
                ["27–32°C Mag-ingat", "caution"],
                ["33–41°C Sobrang init", "extreme_caution"],
                ["42–51°C Mapanganib", "danger"],
                ["52°C+ Sobrang mapanganib", "extreme_danger"],
              ].map(([label, level]) => (
                <span key={level} className="inline-flex items-center gap-1.5 text-[#536258]">
                  <span
                    className="h-3 w-3 rounded-sm border border-white"
                    style={{ backgroundColor: RISK_COLORS[level] }}
                    aria-hidden="true"
                  />
                  {label}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Ang kulay ng probinsya ay overview mula sa model grid point sa capital, hindi measurement ng buong
              probinsya. Map tiles © OpenStreetMap contributors. Weather mula sa Open-Meteo.
            </p>
          </div>
        </div>

        <Alert variant="info" className="order-3" title="Paano basahin ang mapa">
          Overview aid lang ang province layer. Administrative geography ang hangganan ng lungsod at munisipyo, hindi
          hiwalay na measurement. Pumili ng probinsya para makita ang model point at buksan ang detalye ng probinsya o
          lugar.
        </Alert>

        {selectedProvince ? (
          <div className="order-4 paper-panel rounded-[1.7rem] p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="eyebrow text-sun-ink">Napiling probinsya</p>
                <h2 className="mt-1 font-display text-2xl font-bold tracking-[-0.04em] text-forest">
                  {selectedProvince.name}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Model point: {selectedProvince.capitalName} · {formatPST(region?.fetchedAt)}
                </p>
              </div>
              {selectedWeather ? <RiskBadge category={selectedWeather.current.heatIndexCategory} /> : null}
            </div>
            {selectedWeather ? (
              <div className="mt-4 grid gap-5 sm:grid-cols-[15rem_minmax(0,1fr)] sm:items-center">
                <div className="rounded-[1.3rem] bg-[#f8f1e3] px-3 py-2">
                  <HeatMeter
                    compact
                    category={selectedWeather.current.heatIndexCategory}
                    valueC={selectedWeather.current.heatIndexC}
                  />
                </div>
                <div>
                  <dl className="grid grid-cols-2 gap-x-5 gap-y-3">
                    <div className="border-b border-border/60 pb-2">
                      <dt className="text-[10px] font-extrabold uppercase tracking-[0.11em] text-muted-foreground">
                        Temperatura ng hangin
                      </dt>
                      <dd className="numeric mt-1 text-2xl font-bold text-forest">
                        {formatNumber(selectedWeather.current.temperatureC, 1)} °C
                      </dd>
                    </div>
                    <div className="border-b border-border/60 pb-2">
                      <dt className="text-[10px] font-extrabold uppercase tracking-[0.11em] text-muted-foreground">
                        Halumigmig
                      </dt>
                      <dd className="numeric mt-1 text-2xl font-bold text-forest">
                        {selectedWeather.current.relativeHumidity ?? "—"}%
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button asChild size="sm">
                      <Link href={`/provinces/${selectedProvince.slug}`}>
                        Detalye ng probinsya <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/cool-places?province=${selectedProvince.code}`}>
                        Preskong lugar <MapPin className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Walang weather para sa model point na ito. Available pa rin ang hangganan ng probinsya.
              </p>
            )}
          </div>
        ) : (
          <div className="order-4 flex gap-3 rounded-[1.6rem] border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-sun-ink" aria-hidden="true" />
            <div className="text-sm">
              <p className="font-display text-base font-bold text-forest">Pumili ng probinsya</p>
              <p className="mt-1 leading-7 text-muted-foreground">
                I-click ang probinsya sa mapa o gamitin ang searchable na listahan. Visual aid lang ang mapa; nasa
                text din ang lahat ng mahalagang impormasyon.
              </p>
            </div>
          </div>
        )}

        <details className="order-5 paper-panel rounded-[1.6rem] p-4 sm:p-5">
          <summary className="flex min-h-11 cursor-pointer items-center font-display text-sm font-bold text-forest">
            Accessible na data table ng probinsya
          </summary>
          <div
            className="mt-3 overflow-x-auto"
            tabIndex={0}
            role="region"
            aria-label="Data table ng probinsya, i-scroll pakanan para sa iba pang column"
          >
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                  <th scope="col" className="py-2 pr-3">Probinsya</th>
                  <th scope="col" className="py-2 pr-3">Model point</th>
                  <th scope="col" className="py-2 pr-3">Est. heat index</th>
                  <th scope="col" className="py-2 pr-3">Kategorya</th>
                  <th scope="col" className="py-2">Detalye</th>
                </tr>
              </thead>
              <tbody>
                {allProvinces.map((province) => {
                  const weather = weatherByProvince.get(province.code);
                  return (
                    <tr key={province.code} className="border-b border-border/60 last:border-b-0">
                      <td className="py-2.5 pr-3 font-bold text-forest">{province.name}</td>
                      <td className="py-2.5 pr-3">{province.capitalName}</td>
                      <td className="py-2.5 pr-3">
                        {weather?.current.heatIndexC != null
                          ? `${formatNumber(weather.current.heatIndexC, 1)} °C`
                          : "Hindi available"}
                      </td>
                      <td className="py-2.5 pr-3">
                        {weather?.current.heatIndexCategory.taglishLabel ?? "Hindi available"}
                      </td>
                      <td className="py-2.5">
                        <Link
                          href={`/provinces/${province.slug}`}
                          className="inline-flex min-h-11 items-center font-bold text-primary hover:underline"
                        >
                          Buksan
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </details>

        <p className="order-6 text-xs leading-relaxed text-muted-foreground">
          <RefreshCw className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
          Nire-refresh ang data mula sa server cache mga kada 10 minuto. Gamitin ang refresh button para humiling ng
          bagong server check.{" "}
          <a
            href="https://www.pagasa.dost.gov.ph/weather/heat-index"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-primary hover:underline"
          >
            Opisyal na PAGASA <ExternalLink className="inline h-3 w-3" aria-hidden="true" />
          </a>
        </p>
        <div className="order-7 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={retry}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" /> I-refresh ang mapa
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href="/cool-places">
              Preskong lugar <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
