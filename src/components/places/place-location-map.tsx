"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import { Skeleton } from "@/components/ui/skeleton";

export function PlaceLocationMap({
  latitude,
  longitude,
  name,
  address,
}: {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | null = null;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !container.current || mapRef.current) return;
      map = L.map(container.current, {
        center: [latitude, longitude],
        zoom: 15,
        scrollWheelZoom: false,
      });
      mapRef.current = map;
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      })
        .on("tileerror", () => setFailed(true))
        .addTo(map);
      L.circleMarker([latitude, longitude], {
        radius: 10,
        color: "#ffffff",
        weight: 3,
        fillColor: "#ff7a1a",
        fillOpacity: 1,
      })
        .bindPopup(`<strong>${name}</strong><br/>${address}`)
        .addTo(map)
        .openPopup();
      setReady(true);
    })();
    return () => {
      cancelled = true;
      if (map) {
        map.remove();
        mapRef.current = null;
      }
    };
  }, [latitude, longitude, name, address]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-border">
      <div
        ref={container}
        className="h-64 w-full"
        role="application"
        aria-label={`Map showing the approximate location of ${name}`}
      />
      {!ready ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70">
          <Skeleton className="h-6 w-40" />
        </div>
      ) : null}
      {failed ? (
        <p className="absolute inset-x-3 bottom-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-950">
          Base map tiles failed to load. Use the directions link for navigation.
        </p>
      ) : null}
    </div>
  );
}
