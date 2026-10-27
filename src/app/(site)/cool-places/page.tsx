import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, ChevronDown, Filter, Info, MapPin, Search, ShieldCheck } from "lucide-react";
import { PageMasthead } from "@/components/layout/page-masthead";
import { PlaceCard } from "@/components/places/place-card";
import { PlacesMap } from "@/components/places/places-map";
import { NearMeButton } from "@/components/places/near-me-button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { localitiesForProvince, provinces } from "@/lib/geography";
import {
  PLACE_CATEGORY_GROUPS,
  PLACE_CATEGORY_LABELS,
  VERIFICATION_DISPLAY_LABELS,
  VERIFICATION_STATUSES,
} from "@/lib/places";
import { searchCoolingPlaces } from "@/lib/place-search";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Saan puwedeng magpalamig?",
  description:
    "Hanapin ang mga pampublikong lugar sa Central Luzon na may malinaw na verification label. Hindi ipinapakita ng SILONG PH ang hindi pa beripikadong record bilang kumpirmadong cooling center.",
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

function PlaceFilters({
  variant,
  idPrefix,
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
}: {
  variant: "mobile" | "desktop";
  idPrefix: string;
  q: string;
  province: string;
  locality: string;
  category: string;
  verification: string;
  water: boolean;
  accessible: boolean;
  openNow: boolean;
  lat?: number;
  lon?: number;
}) {
  const localities = province ? localitiesForProvince(province) : [];
  const id = (name: string) => `${idPrefix}-${name}`;

  const categoryField = (
    <div className="space-y-1.5">
      <Label htmlFor={id("place-category")}>Uri ng lugar</Label>
      <Select id={id("place-category")} name="category" defaultValue={category}>
        <option value="">Lahat ng kategorya</option>
        {PLACE_CATEGORY_GROUPS.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.categories.map((item) => (
              <option key={item} value={item}>
                {PLACE_CATEGORY_LABELS[item] ?? item}
              </option>
            ))}
          </optgroup>
        ))}
      </Select>
    </div>
  );

  const verificationField = (
    <div className="space-y-1.5">
      <Label htmlFor={id("place-verification")}>Katayuan ng beripikasyon</Label>
      <Select id={id("place-verification")} name="verification" defaultValue={verification}>
        <option value="">Lahat ng katayuan</option>
        {VERIFICATION_STATUSES.map((status) => (
          <option key={status} value={status}>
            {VERIFICATION_DISPLAY_LABELS[status]}
          </option>
        ))}
      </Select>
    </div>
  );

  const facilitiesField = (
    <fieldset className="space-y-1">
      <legend className="text-sm font-bold text-forest">Pasilidad at access</legend>
      <label className="flex min-h-11 items-center gap-2.5 text-sm text-[#3f5146]">
        <input type="checkbox" name="water" value="1" defaultChecked={water} className="h-4 w-4 accent-[#174b38]" />
        May iniulat na inuming tubig
      </label>
      <label className="flex min-h-11 items-center gap-2.5 text-sm text-[#3f5146]">
        <input
          type="checkbox"
          name="accessible"
          value="1"
          defaultChecked={accessible}
          className="h-4 w-4 accent-[#174b38]"
        />
        May iniulat na wheelchair access
      </label>
      <label className="flex min-h-11 items-center gap-2.5 text-sm text-[#3f5146]">
        <input type="checkbox" name="openNow" value="1" defaultChecked={openNow} className="h-4 w-4 accent-[#174b38]" />
        Bukas ngayon (kung may nakalistang oras)
      </label>
    </fieldset>
  );

  return (
    <>
      <form method="get" action="/cool-places" className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor={id("place-q")}>Hanapin ang lugar</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input id={id("place-q")} name="q" defaultValue={q} placeholder="Pangalan o address" className="pl-10" />
          </div>
        </div>

        {variant === "desktop" ? (
          <div className="space-y-1.5">
            <Label htmlFor={id("place-province")}>Probinsya</Label>
            <Select id={id("place-province")} name="province" defaultValue={province}>
              <option value="">Lahat ng probinsya</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor={id("place-locality")}>Lungsod o munisipyo</Label>
          <Select id={id("place-locality")} name="locality" defaultValue={locality}>
            <option value="">Lahat ng lugar</option>
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
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Pumili ng lugar, o pumili muna ng probinsya para paliitin ang listahan.
          </p>
        </div>

        {variant === "desktop" ? (
          <>
            {categoryField}
            {verificationField}
            {facilitiesField}
          </>
        ) : (
          <details className="group rounded-2xl border border-border/80 bg-[#f8f3e9]">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-2 px-4 py-2.5 text-sm font-bold text-forest [&::-webkit-details-marker]:hidden">
              <span className="inline-flex items-center gap-2">
                <Filter className="h-4 w-4 text-canopy" aria-hidden="true" />
                Higit pang filter
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="space-y-4 border-t border-border/70 p-4">
              <div className="space-y-1.5">
                <Label htmlFor={id("place-province")}>Probinsya</Label>
                <Select id={id("place-province")} name="province" defaultValue={province}>
                  <option value="">Lahat ng probinsya</option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>
              {categoryField}
              {verificationField}
              {facilitiesField}
            </div>
          </details>
        )}

        {lat != null && lon != null ? (
          <>
            <input type="hidden" name="lat" value={lat} />
            <input type="hidden" name="lon" value={lon} />
            <input type="hidden" name="sort" value="nearest" />
          </>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" className="flex-1">
            {variant === "mobile" ? "Hanapin" : "I-apply ang filter"}
          </Button>
          <Button asChild variant="outline">
            <Link href="/cool-places">I-reset</Link>
          </Button>
        </div>
      </form>

      <div className="mt-4 border-t border-border/70 pt-4">
        <NearMeButton />
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          Hihingin lang ang lokasyon kapag pinindot mo ang button. Ginagamit ito sa browser mo para i-sort ayon sa
          layo at hindi ito iniimbak ng SILONG PH.
        </p>
      </div>
    </>
  );
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
    <div>
      <PageMasthead
        eyebrow="Preskong lugar"
        title="Saan puwedeng magpalamig?"
        description="Hanapin ang mga pampublikong lugar sa Central Luzon. Kumpirmadong cooling place lang ang tinataguriang beripikado pagkatapos suriin ng awtorisadong reviewer ang public access at pagiging angkop nito."
        actions={
          <>
            {verifiedCount > 0 ? (
              <Badge variant="success" className="bg-white/10 text-[#e7f2e8]">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> {verifiedCount} beripikado
              </Badge>
            ) : null}
            <Button asChild variant="inverse" size="sm">
              <Link href="/map">
                <MapPin className="h-4 w-4" aria-hidden="true" /> Mapa ng init
              </Link>
            </Button>
          </>
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 -mt-8 sm:-mt-10 lg:hidden">
          <div className="paper-panel rounded-[1.6rem] p-4 sm:p-5">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-forest">
              <Filter className="h-4 w-4 text-canopy" aria-hidden="true" /> Hanapin at i-filter
            </h2>
            <div className="mt-4">
              <PlaceFilters
                variant="mobile"
                idPrefix="mobile"
                q={q}
                province={province}
                locality={locality}
                category={category}
                verification={verification}
                water={water}
                accessible={accessible}
                openNow={openNow}
                lat={lat}
                lon={lon}
              />
            </div>
          </div>
        </div>

        {verifiedCount === 0 ? (
          <Alert variant="warning" className="mt-5" title="Wala pang beripikadong cooling facility">
            May {totalCount} public-facility record sa directory na galing sa OpenStreetMap at hindi pa beripikado. Hindi
            ito kumpirmadong cooling center at maaaring walang aircon, tubig, upuan, o public access. Para sa opisyal na
            lokal na opsyon, makipag-ugnayan sa city o municipal DRRMO o LGU. Puwedeng i-verify ng admin ang pasilidad sa
            protected admin dashboard.
          </Alert>
        ) : (
          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm lg:mt-8">
            <Badge variant="success">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> {verifiedCount} beripikado
            </Badge>
            <span className="text-muted-foreground">
              May {totalCount - verifiedCount} pang record na hindi pa beripikado; may warning label ang mga ito.
            </span>
          </div>
        )}

        <div className="mt-6 grid gap-5 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-7">
          <aside className="hidden min-w-0 lg:block">
            <div className="sticky top-28 paper-panel rounded-[1.6rem] p-5">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-forest">
                <Filter className="h-4 w-4 text-canopy" aria-hidden="true" /> Mga filter
              </h2>
              <div className="mt-4">
                <PlaceFilters
                  variant="desktop"
                  idPrefix="desktop"
                  q={q}
                  province={province}
                  locality={locality}
                  category={category}
                  verification={verification}
                  water={water}
                  accessible={accessible}
                  openNow={openNow}
                  lat={lat}
                  lon={lon}
                />
              </div>
            </div>
          </aside>

          <div className="flex min-w-0 flex-col gap-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-[-0.04em] text-forest">
                  {result.total} {result.total === 1 ? "lugar" : "mga lugar"}
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {sort === "nearest" ? "Pinakamalapit muna. " : ""}
                  {openNow ? "Mga bukas ngayon lang, base sa nakalistang oras. " : ""}
                  {verification === "VERIFIED"
                    ? "Mga beripikadong lugar lang. "
                    : "May verification label ang bawat record. "}
                </p>
              </div>
              <p className="text-xs font-semibold text-muted-foreground">Pahina {result.page}</p>
            </div>

            {result.items.length === 0 ? (
              <div className="paper-panel rounded-[1.6rem] px-5 py-12 text-center sm:px-8 sm:py-16">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fbf1dc] text-[#8a4b00]">
                  <AlertTriangle className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-xl font-bold text-forest">Walang tugmang lugar</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted-foreground">
                  {verifiedCount === 0 && verification === "VERIFIED"
                    ? "Wala pang beripikadong lugar. Subukang alisin ang verification filter, o makipag-ugnayan sa LGU/DRRMO para sa opisyal na cooling option."
                    : "Subukan ang ibang spelling, alisin ang isang filter, o pumili ng mas malawak na lugar."}
                </p>
                <Button asChild variant="outline" className="mt-5">
                  <Link href="/cool-places">I-clear ang filter</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="order-2 overflow-hidden rounded-[1.6rem] border border-border bg-card shadow-[var(--shadow-soft)] lg:order-3">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/75 px-4 py-4 sm:px-5">
                    <div>
                      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-forest">
                        <MapPin className="h-4 w-4 text-canopy" aria-hidden="true" /> Mapa ng mga lugar
                      </h2>
                      <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
                        Ang gray markers ay hindi pa beripikado, hindi kumpirmadong cooling center. Ang green markers ay
                        beripikado.
                      </p>
                    </div>
                    <span className="rounded-full border border-border bg-[#f8f3e9] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#536258]">
                      {result.items.length} pinapakita
                    </span>
                  </div>
                  <PlacesMap places={result.items} />
                </div>

                <div className="order-3 grid gap-4 sm:grid-cols-2 lg:order-2">
                  {result.items.map((place) => (
                    <PlaceCard key={place.id} place={place} />
                  ))}
                </div>

                {result.hasMore || page > 1 ? (
                  <nav className="order-4 flex items-center justify-between gap-3" aria-label="Pagination">
                    {page > 1 ? (
                      <Button asChild variant="outline">
                        <Link href={pageHref(filterParams, page - 1)}>Bumalik</Link>
                      </Button>
                    ) : (
                      <span />
                    )}
                    <span className="text-sm font-semibold text-muted-foreground">Pahina {page}</span>
                    {result.hasMore ? (
                      <Button asChild variant="outline">
                        <Link href={pageHref(filterParams, page + 1)}>
                          Sumunod <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </Button>
                    ) : (
                      <span />
                    )}
                  </nav>
                ) : null}
              </>
            )}

            <div className="flex items-start gap-2 rounded-2xl border border-border/80 bg-[#f8f3e9] p-4 text-xs leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-canopy" aria-hidden="true" />
              <p>
                Ang operating-hours label ay base lang sa nakalistang oras at maaaring kulang. Hindi ito real-time
                occupancy o availability signal. Hindi garantiya ang public access, aircon, tubig, at upuan maliban kung
                malinaw na beripikado. Source: OpenStreetMap contributors (ODbL) para sa hindi pa beripikadong record.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
