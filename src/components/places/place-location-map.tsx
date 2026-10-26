"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [needsTap, setNeedsTap] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | null = null;
    let resizeObserver: ResizeObserver | null = null;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !container.current || mapRef.current) return;
      map = L.map(container.current, {
        center: [latitude, longitude],
        zoom: 15,
        scrollWheelZoom: false,
      });
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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
        .bindPopup(`<strong>${escapeHtml(name)}</strong><br/>${escapeHtml(address)}`)
        .addTo(map)
        .openPopup();

      // Touch screens: dragging is opt-in so the page keeps scrolling normally.
      const coarsePointer = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
      if (coarsePointer) {
        map.dragging.disable();
        setNeedsTap(true);
        map.on("click", () => {
          map?.dragging.enable();
          setNeedsTap(false);
        });
      }

      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(() => map?.invalidateSize());
        resizeObserver.observe(container.current);
      }

      setReady(true);
    })();
    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      if (map) {
        map.remove();
        mapRef.current = null;
      }
    };
  }, [latitude, longitude, name, address]);

  return (
    <div className="relative isolate z-0 overflow-hidden rounded-xl border border-border">
      <div
        ref={container}
        className="h-56 w-full sm:h-64"
        role="application"
        aria-label={`Mapa na nagpapakita ng tinatayang lokasyon ng ${name}`}
      />
      {!ready ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
          <Skeleton className="h-6 w-40" />
        </div>
      ) : null}
      {needsTap ? (
        <p className="pointer-events-none absolute inset-x-3 top-3 z-10 rounded-lg bg-white/90 px-3 py-2 text-center text-xs font-semibold text-slate-700 shadow-sm">
          I-tap ang mapa para i-pan. Normal pa ring nag-scroll ang page hanggang doon.
        </p>
      ) : null}
      {failed ? (
        <p className="absolute inset-x-3 bottom-3 z-10 rounded-lg bg-amber-50 p-2 text-xs text-amber-950">
          Hindi nag-load ang base map tiles. Gamitin ang link ng direksyon para sa navigation.
        </p>
      ) : null}
    </div>
  );
}
