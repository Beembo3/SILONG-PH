import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Plus, Search } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { hasRole, requirePageUser } from "@/lib/auth";
import { formatPSTDate } from "@/lib/format";
import { getLocality, getProvince } from "@/lib/geography";
import { prisma } from "@/lib/prisma";
import { VERIFICATION_LABELS, VERIFICATION_STATUSES, verificationVariant, type VerificationStatus } from "@/lib/places";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Cool places" };

function str(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function pageHref(params: Record<string, string>, page: number): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  search.set("page", String(page));
  return `/admin/places?${search.toString()}`;
}

export default async function AdminPlacesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requirePageUser();
  const raw = await searchParams;
  const q = str(raw.q);
  const status = str(raw.status);
  const view = str(raw.view);
  const page = Math.max(1, Number(str(raw.page) || "1") || 1);
  const pageSize = 25;
  const canEdit = hasRole(user, ["SUPER_ADMIN", "PLACE_VERIFIER"]);

  const where = {
    ...(view === "archived" ? { archivedAt: { not: null } } : { archivedAt: null }),
    ...(status ? { verificationStatus: status } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { address: { contains: q } },
            { category: { contains: q } },
          ],
        }
      : {}),
  };

  const [places, total, verifiedCount, unverifiedCount] = await Promise.all([
    prisma.coolingPlace.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        category: true,
        address: true,
        localityCode: true,
        provinceCode: true,
        verificationStatus: true,
        lastReviewedAt: true,
        updatedAt: true,
        archivedAt: true,
        osmId: true,
      },
    }),
    prisma.coolingPlace.count({ where }),
    prisma.coolingPlace.count({ where: { archivedAt: null, verificationStatus: "VERIFIED" } }),
    prisma.coolingPlace.count({ where: { archivedAt: null, verificationStatus: "UNVERIFIED" } }),
  ]);

  const params = { q, status, view };
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Directory</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">Cool places</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} {view === "archived" ? "archived" : "active"} records · {verifiedCount} verified ·{" "}
            {unverifiedCount} unverified
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={view === "archived" ? "/admin/places" : "/admin/places?view=archived"}>
              {view === "archived" ? "Show active" : "Show archived"}
            </Link>
          </Button>
          {canEdit ? (
            <Button asChild size="sm">
              <Link href="/admin/places/new">
                <Plus className="h-4 w-4" aria-hidden="true" /> Add facility
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      {!canEdit ? (
        <Alert variant="info" title="Read-only access">
          Your role can view the directory but cannot create, edit, verify, or archive facility records.
        </Alert>
      ) : null}

      {verifiedCount === 0 && view !== "archived" ? (
        <Alert variant="warning" title="No verified facility yet">
          Imported records remain unverified until a reviewer checks public access and cooling suitability. Do not mark
          a facility verified without evidence.
        </Alert>
      ) : null}

      <Card>
        <CardContent className="pt-5 sm:pt-6">
          <form method="get" action="/admin/places" className="grid gap-3 sm:grid-cols-[1fr_14rem_auto]">
            <div className="space-y-1.5">
              <Label htmlFor="admin-place-q">Search</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input id="admin-place-q" name="q" defaultValue={q} placeholder="Name, address, or category" className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-place-status">Verification</Label>
              <Select id="admin-place-status" name="status" defaultValue={status}>
                <option value="">All statuses</option>
                {VERIFICATION_STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {VERIFICATION_LABELS[item]}
                  </option>
                ))}
              </Select>
            </div>
            {view === "archived" ? <input type="hidden" name="view" value="archived" /> : null}
            <div className="flex items-end gap-2">
              <Button type="submit" className="flex-1">
                Filter
              </Button>
              <Button asChild variant="outline">
                <Link href={view === "archived" ? "/admin/places?view=archived" : "/admin/places"}>Reset</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          {places.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Building2 className="mx-auto h-8 w-8 text-slate-300" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-navy">No matching records</p>
              <p className="mt-1 text-sm text-muted-foreground">Try a different search, status, or archive view.</p>
            </div>
          ) : (
            <table className="w-full min-w-[52rem] text-left text-sm">
              <caption className="sr-only">Cooling-place records</caption>
              <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3">Facility</th>
                  <th scope="col" className="px-4 py-3">Locality</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3">Last reviewed</th>
                  <th scope="col" className="px-4 py-3">Source</th>
                  <th scope="col" className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {places.map((place) => {
                  const locality = getLocality(place.localityCode);
                  const province = getProvince(place.provinceCode);
                  return (
                    <tr key={place.id} className="border-t border-border align-top">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-navy">{place.name}</p>
                        <p className="text-xs text-muted-foreground">{place.category}</p>
                        <p className="mt-0.5 max-w-xs text-xs text-muted-foreground">{place.address}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-700">
                        {locality?.name ?? place.localityCode}
                        <span className="block text-muted-foreground">{province?.name ?? place.provinceCode}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={verificationVariant(place.verificationStatus)}>
                          {VERIFICATION_LABELS[place.verificationStatus as VerificationStatus] ?? place.verificationStatus}
                        </Badge>
                        {place.archivedAt ? (
                          <Badge variant="danger" className="mt-1 block w-fit">
                            Archived
                          </Badge>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {place.lastReviewedAt ? formatPSTDate(place.lastReviewedAt) : "Not reviewed"}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {place.osmId ? `OSM ${place.osmId}` : "Admin-created"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <Link href={`/cool-places/${place.id}`} className="text-xs font-semibold text-primary hover:underline">
                            View public
                          </Link>
                          {canEdit && !place.archivedAt ? (
                            <Link href={`/admin/places/${place.id}`} className="text-xs font-semibold text-primary hover:underline">
                              Edit
                            </Link>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 ? (
        <nav className="flex items-center justify-between gap-3" aria-label="Pagination">
          {page > 1 ? (
            <Button asChild variant="outline" size="sm">
              <Link href={pageHref(params, page - 1)}>Previous</Link>
            </Button>
          ) : (
            <span />
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Button asChild variant="outline" size="sm">
              <Link href={pageHref(params, page + 1)}>Next</Link>
            </Button>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}
