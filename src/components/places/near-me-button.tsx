"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NearMeButton() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function locate() {
    if (!navigator.geolocation) {
      setStatus("Location is not supported by this browser. Use the province and locality filters instead.");
      return;
    }
    setLoading(true);
    setStatus("Requesting your location…");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = new URLSearchParams(params.toString());
        next.set("lat", position.coords.latitude.toFixed(5));
        next.set("lon", position.coords.longitude.toFixed(5));
        next.set("sort", "nearest");
        router.push(`/cool-places?${next.toString()}`);
        setLoading(false);
        setStatus("Sorted by distance from your current position.");
      },
      (error) => {
        setStatus(
          error.code === error.PERMISSION_DENIED
            ? "Location permission denied. Use the manual filters instead."
            : "Could not determine your location. Use the manual filters instead.",
        );
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  }

  return (
    <div>
      <Button type="button" variant="outline" onClick={locate} disabled={loading}>
        <Crosshair className="h-4 w-4" aria-hidden="true" />
        {loading ? "Locating…" : "Sort by distance from me"}
      </Button>
      {status ? (
        <p className="mt-1.5 max-w-sm text-xs text-muted-foreground" role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
