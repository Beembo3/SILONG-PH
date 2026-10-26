"use client";

import { useMemo, useState } from "react";
import { Check, Crosshair, LocateFixed, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useLocation } from "@/components/location/location-provider";
import { localities, localitiesForProvince, provinces, searchLocalities } from "@/lib/geography";
import type { Locality } from "@/lib/geography-types";

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function nearestLocality(lat: number, lon: number): Locality {
  return localities.reduce((best, locality) => {
    const d = distanceKm(lat, lon, locality.lat, locality.lon);
    return d < best.distance ? { locality, distance: d } : best;
  }, { locality: localities[0], distance: Number.POSITIVE_INFINITY }).locality;
}

export function LocationPicker() {
  const { locality, setLocalityCode } = useLocation();
  const [open, setOpen] = useState(false);
  const [provinceCode, setProvinceCode] = useState(locality.provinceCode);
  const [query, setQuery] = useState("");
  const [geoStatus, setGeoStatus] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const results = useMemo(() => {
    if (query.trim()) return searchLocalities(query, provinceCode || undefined);
    return localitiesForProvince(provinceCode || locality.provinceCode);
  }, [query, provinceCode, locality.provinceCode]);

  function choose(code: string) {
    setLocalityCode(code);
    setOpen(false);
    setQuery("");
    setGeoStatus(null);
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setGeoStatus("Hindi sinusuportahan ng browser mo ang location access. Pumili na lang ng lungsod o munisipyo.");
      return;
    }
    setLocating(true);
    setGeoStatus("Hinihiling ang lokasyon mo…");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nearest = nearestLocality(position.coords.latitude, position.coords.longitude);
        setLocalityCode(nearest.code);
        setProvinceCode(nearest.provinceCode);
        setGeoStatus(
          `Pinakamalapit na nakalista: ${nearest.name}, ${nearest.provinceName}. Ang weather ay para sa model grid point ng lugar na ito, hindi sa eksaktong GPS position mo.`,
        );
        setLocating(false);
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Hindi pinayagan ang location access. Pumili na lang ng probinsya at lungsod o munisipyo."
            : "Hindi namin matukoy ang lokasyon mo. Pumili na lang ng lugar nang manu-mano.";
        setGeoStatus(message);
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="max-w-[15rem] justify-start gap-2 px-3 font-semibold">
          <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span className="truncate">{locality.name}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogTitle>Piliin ang lugar mo</DialogTitle>
        <DialogDescription>
          Pumili ng probinsya at lungsod o munisipyo. Naka-save sa device mo ang napili mo.
        </DialogDescription>

        <div className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="province-picker">Probinsya</Label>
            <Select
              id="province-picker"
              value={provinceCode}
              onChange={(event) => {
                setProvinceCode(event.target.value);
                setQuery("");
              }}
            >
              {provinces.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="locality-search">Hanapin ang lungsod o munisipyo</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                id="locality-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Hal. San Fernando, Malolos, Baler"
                className="pl-9"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto rounded-lg border border-border" role="listbox" aria-label="Mga lungsod at munisipyo">
            {results.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">Walang tugmang lugar. Subukan ang ibang spelling o probinsya.</p>
            ) : (
              results.map((item) => {
                const selected = item.code === locality.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => choose(item.code)}
                    className="flex min-h-12 w-full items-center justify-between gap-3 border-b border-border px-4 py-2.5 text-left text-sm last:border-b-0 hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                  >
                    <span>
                      <span className="font-semibold text-foreground">{item.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {item.provinceName} · {item.type === "City" ? "Lungsod" : "Munisipyo"}
                        {item.isIndependent ? " · independent city" : ""}
                      </span>
                    </span>
                    {selected ? <Check className="h-4 w-4 text-success" aria-label="Napili" /> : null}
                  </button>
                );
              })
            )}
          </div>

          <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            <p className="flex items-start gap-2">
              <Crosshair className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Ang weather ay kinukuha sa geometric center ng lugar. Model data ito, hindi barangay-level na
              measurement. Wala pang barangay observations sa release na ito.
            </p>
          </div>

          <Button type="button" variant="secondary" className="w-full" onClick={useMyLocation} disabled={locating}>
            <LocateFixed className="h-4 w-4" aria-hidden="true" />
            {locating ? "Hinahanap ang pinakamalapit na lugar…" : "Gamitin ang lokasyon ko para sa pinakamalapit na lugar"}
          </Button>
          {geoStatus ? (
            <p className="text-xs leading-relaxed text-muted-foreground" role="status">
              {geoStatus}
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
