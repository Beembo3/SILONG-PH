"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import { Skeleton } from "@/components/ui/skeleton";
import { VERIFICATION_DISPLAY_LABELS, type VerificationStatus } from "@/lib/places";

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

export interface PlaceMapItem {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  verificationStatus: string;
}

export function PlacesMap({ places }: { places: PlaceMapItem[] }) {
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
        center: [15.35, 120.7],
        zoom: 8,
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

      if (places.length > 0) {
        const bounds = L.latLngBounds(places.map((p) => [p.latitude, p.longitude]));
        map.fitBounds(bounds.pad(0.2), { maxZoom: 11 });
      }
      for (const place of places) {
        const verified = place.verificationStatus === "VERIFIED";
        L.circleMarker([place.latitude, place.longitude], {
          radius: 8,
          color: "#ffffff",
          weight: 2,
          fillColor: verified ? "#2c6a4b" : "#9aa79d",
          fillOpacity: 1,
        })
          .bindPopup(
            `<strong>${escapeHtml(place.name)}</strong><br/>${escapeHtml(place.address)}<br/><span style="font-size:11px">${escapeHtml(
              VERIFICATION_DISPLAY_LABELS[place.verificationStatus as VerificationStatus] ?? "Hindi pa beripikado",
            )}</span><br/><a href="/cool-places/${encodeURIComponent(place.id)}">Tingnan ang detalye</a>`,
          )
          .addTo(map);
      }

      /*
       * Touch screens: dragging is opt-in. With dragging enabled Leaflet sets
       * `touch-action: none`, which traps page scrolling when a gesture starts
       * on the map. A first tap enables dragging for users who want to explore.
       */
      const coarsePointer = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
      if (coarsePointer) {
        map.dragging.disable();
        setNeedsTap(true);
        map.on("click", () => {
          map?.dragging.enable();
          setNeedsTap(false);
        });
      }

      // Keep Leaflet in sync when the container is resized (viewport, filters, cards).
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
  }, [places]);

  return (
    <div className="relative isolate z-0 overflow-hidden border-t border-border/70">
      <div
        ref={container}
        className="h-64 w-full sm:h-[24rem]"
        role="application"
        aria-label="Mapa ng mga nakalistang pampublikong lugar. Gamitin ang listahan bilang accessible na alternatibo."
      />
      {!ready ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-ivory/75">
          <Skeleton className="h-6 w-40" />
        </div>
      ) : null}
      {needsTap ? (
        <p className="pointer-events-none absolute inset-x-3 top-3 z-10 rounded-xl bg-card/95 px-3 py-2 text-center text-xs font-bold text-forest shadow-sm">
          I-tap ang mapa para i-pan. Normal pa ring nag-scroll ang page hanggang doon.
        </p>
      ) : null}
      {failed ? (
        <p className="absolute inset-x-3 bottom-3 z-10 rounded-xl border border-[#e2c48e] bg-[#fbf1dc] p-2 text-xs font-semibold text-[#5d3a08]">
          Hindi nag-load ang base map tiles. Available pa rin ang listahan sa ibaba.
        </p>
      ) : null}
    </div>
  );
}
