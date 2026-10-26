import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Filter, Info, MapPin, Search, ShieldCheck } from "lucide-react";
import { PlaceCard } from "@/components/places/place-card";
import { PlacesMap } from "@/components/places/places-map";
import { NearMeButton } from "@/components/places/near-me-button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { localitiesForProvince, provinces } from "@/lib/geography";
import { PLACE_CATEGORIES, VERIFICATION_LABELS, VERIFICATION_STATUSES } from "@/lib/places";
import { searchCoolingPlaces } from "@/lib/place-search";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cool places directory",
  description:
    "Search public facilities across Central Luzon with clear verification labels. SILONG PH does not present unverified records as confirmed cooling centres.",
};

function str(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function bool(value: string | string[] | undefined): boolean {
  return str(value) === "1" || str(value) === "true";
}

function pageHref(params: Record<string, string | number | undefined>, page: number): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  search.set("page", String(page));
  return `/cool-places?${search.toString()}`;
}

export default async function CoolPlacesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const q = str(raw.q);
  const province = str(raw.province);
  const locality = str(raw.locality);
  const category = str(raw.category);
  const verification = str(raw.verification);
  const water = bool(raw.water);
  const accessible = bool(raw.accessible);
  const openNow = bool(raw.openNow);
  const page = Math.max(1, Number(str(raw.page) || "1") || 1);
  const lat = str(raw.lat) ? Number(str(raw.lat)) : undefined;
  const lon = str(raw.lon) ? Number(str(raw.lon)) : undefined;
  const sort = str(raw.sort);

  const [result, verifiedCount, totalCount] = await Promise.all([
    searchCoolingPlaces({
      q,
      province,
      locality,
      category,
      verification,
      water,
      accessible,
      openNow,
      lat,
      lon,
      page,
      pageSize: 24,
    }),
    prisma.coolingPlace.count({ where: { archivedAt: null, verificationStatus: "VERIFIED" } }),
    prisma.coolingPlace.count({ where: { archivedAt: null } }),
  ]);

  const localities = province ? localitiesForProvince(province) : [];
  const filterParams = {
    q,
    province,
    locality,
    category,
    verification,
    water: water ? "1" : "",
    accessible: accessible ? "1" : "",
    openNow: openNow ? "1" : "",
    lat,
    lon,
    sort,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Cool places</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
          Find relief from the heat
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Search public facilities across Central Luzon. A record is only shown as a confirmed cooling facility after
          an authorised reviewer has checked public access and cooling suitability.
        </p>
      </div>

      {verifiedCount === 0 ? (
        <Alert variant="warning" className="mt-5" title="No verified cooling facilities yet">
          The directory currently contains {totalCount} unverified public-facility records imported from
          OpenStreetMap. They are not confirmed cooling centres and may not have air-conditioning, water, seating, or
          public access. For official local options, contact your city or municipal DRRMO or LGU. Administrators can
          verify facilities through the protected admin dashboard.
        </Alert>
      ) : (
        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="success">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> {verifiedCount} verified
          </Badge>
          <span className="text-muted-foreground">
            {totalCount - verifiedCount} unverified public-facility records are also listed with warnings.
          </span>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[19rem_minmax(0,1fr)]">
        <aside className="min-w-0">
          <Card>
            <CardContent className="pt-5 sm:pt-6">
              <h2 className="flex items-center gap-2 text-base font-bold text-navy">
                <Filter className="h-4 w-4 text-primary" aria-hidden="true" /> Filters
              </h2>
              <form method="get" action="/cool-places" className="mt-4 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="place-q">Search</Label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input
                      id="place-q"
                      name="q"
                      defaultValue={q}
                      placeholder="Name or address"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="place-province">Province</Label>
                  <Select id="place-province" name="province" defaultValue={province}>
                    <option value="">All provinces</option>
                    {provinces.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="place-locality">City or municipality</Label>
                  <Select id="place-locality" name="locality" defaultValue={locality}>
                    <option value="">All localities</option>
                    {localities.length > 0
                      ? localities.map((l) => (
                          <option key={l.code} value={l.code}>
                            {l.name}
                          </option>
                        ))
                      : provinces.map((p) => (
                          <optgroup key={p.code} label={p.name}>
                            {localitiesForProvince(p.code).map((l) => (
                              <option key={l.code} value={l.code}>
                                {l.name}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                  </Select>
                  <p className="text-[11px] text-muted-foreground">
                    Choose a province first to narrow this list, or select any locality from the full list.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="place-category">Category</Label>
                  <Select id="place-category" name="category" defaultValue={category}>
                    <option value="">All categories</option>
                    {PLACE_CATEGORIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="place-verification">Verification status</Label>
                  <Select id="place-verification" name="verification" defaultValue={verification}>
                    <option value="">All statuses</option>
                    {VERIFICATION_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {VERIFICATION_LABELS[status]}
                      </option>
                    ))}
                  </Select>
                </div>

                <fieldset className="space-y-2">
                  <legend className="text-sm font-semibold">Facilities and access</legend>
                  <label className="flex min-h-9 items-center gap-2 text-sm">
                    <input type="checkbox" name="water" value="1" defaultChecked={water} className="h-4 w-4 accent-orange-600" />
                    Drinking water reported
                  </label>
                  <label className="flex min-h-9 items-center gap-2 text-sm">
                    <input type="checkbox" name="accessible" value="1" defaultChecked={accessible} className="h-4 w-4 accent-orange-600" />
                    Wheelchair access reported
                  </label>
                  <label className="flex min-h-9 items-center gap-2 text-sm">
                    <input type="checkbox" name="openNow" value="1" defaultChecked={openNow} className="h-4 w-4 accent-orange-600" />
                    Open now (only where hours are listed)
                  </label>
                </fieldset>

                {lat != null && lon != null ? (
                  <>
                    <input type="hidden" name="lat" value={lat} />
                    <input type="hidden" name="lon" value={lon} />
                    <input type="hidden" name="sort" value="nearest" />
                  </>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <Button type="submit" className="flex-1">
                    Apply filters
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/cool-places">Reset</Link>
                  </Button>
                </div>
              </form>

              <div className="mt-4 border-t border-border pt-4">
                <NearMeButton />
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  Location is requested only after you press the button. It is used in your browser to sort by distance
                  and is not stored by SILONG PH.
                </p>
              </div>
            </CardContent>
          </Card>
        </aside>

        <div className="min-w-0 space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-navy">
                {result.total} {result.total === 1 ? "facility" : "facilities"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {sort === "nearest" ? "Nearest first. " : ""}
                {openNow ? "Only facilities with listed hours that indicate they are open now. " : ""}
                {verification === "VERIFIED"
                  ? "Verified facilities only. "
                  : "Verification status is shown on every record. "}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">Page {result.page}</p>
          </div>

          {result.items.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" aria-hidden="true" />
                <h3 className="mt-3 text-base font-bold text-navy">No matching facilities</h3>
                <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                  {verifiedCount === 0 && verification === "VERIFIED"
                    ? "There are no verified facilities yet. Try removing the verification filter, or contact your LGU/DRRMO for official cooling options."
                    : "Try a different spelling, remove a filter, or select a wider area."}
                </p>
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/cool-places">Clear filters</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {result.items.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </div>

              <Card>
                <CardContent className="pt-5 sm:pt-6">
                  <h2 className="flex items-center gap-2 text-base font-bold text-navy">
                    <MapPin className="h-4 w-4 text-primary" aria-hidden="true" /> Map of filtered facilities
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Grey markers are unverified records, not confirmed cooling centres. Green markers are verified.
                  </p>
                  <div className="mt-3">
                    <PlacesMap places={result.items} />
                  </div>
                </CardContent>
              </Card>

              {result.hasMore || page > 1 ? (
                <nav className="flex items-center justify-between gap-3" aria-label="Pagination">
                  {page > 1 ? (
                    <Button asChild variant="outline">
                      <Link href={pageHref(filterParams, page - 1)}>Previous</Link>
                    </Button>
                  ) : (
                    <span />
                  )}
                  <span className="text-sm text-muted-foreground">Page {page}</span>
                  {result.hasMore ? (
                    <Button asChild variant="outline">
                      <Link href={pageHref(filterParams, page + 1)}>Next</Link>
                    </Button>
                  ) : (
                    <span />
                  )}
                </nav>
              ) : null}
            </>
          )}

          <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>
              Operating-hours labels are derived only from listed hours and may be incomplete. They are not a
              real-time occupancy or availability signal. Public access, air-conditioning, water, and seating are not
              guaranteed unless explicitly verified. Source: OpenStreetMap contributors (ODbL) for unverified
              records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
