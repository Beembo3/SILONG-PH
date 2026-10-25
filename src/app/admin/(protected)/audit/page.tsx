import type { Metadata } from "next";
import Link from "next/link";
import { ScrollText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requirePageUser } from "@/lib/auth";
import { formatPST } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Audit log" };

function str(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function metadataSummary(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.entries(parsed)
      .slice(0, 4)
      .map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value) : String(value)}`)
      .join(" · ");
  } catch {
    return raw.slice(0, 120);
  }
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePageUser(["SUPER_ADMIN"]);
  const raw = await searchParams;
  const action = str(raw.action);
  const page = Math.max(1, Number(str(raw.page) || "1") || 1);
  const pageSize = 50;
  const where = action ? { action } : {};

  const [logs, total, actions] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { actor: { select: { name: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.groupBy({ by: ["action"], _count: { _all: true }, orderBy: { action: "asc" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Accountability</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">Audit log</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total} recorded administrative actions. Newest first. Visible to super administrators only.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/audit"
          className={
            action
              ? "rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-orange-300"
              : "rounded-full border border-orange-300 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-900"
          }
        >
          All actions
        </Link>
        {actions.slice(0, 10).map((item) => (
          <Link
            key={item.action}
            href={`/admin/audit?action=${encodeURIComponent(item.action)}`}
            className={
              action === item.action
                ? "rounded-full border border-orange-300 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-900"
                : "rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-orange-300"
            }
          >
            {item.action.replaceAll("_", " ")} ({item._count._all})
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          {logs.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <ScrollText className="mx-auto h-8 w-8 text-slate-300" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-navy">No audit entries</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Administrative actions will be recorded here as they occur.
              </p>
            </div>
          ) : (
            <table className="w-full min-w-[54rem] text-left text-sm">
              <caption className="sr-only">Administrative audit log</caption>
              <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3">Time</th>
                  <th scope="col" className="px-4 py-3">Actor</th>
                  <th scope="col" className="px-4 py-3">Action</th>
                  <th scope="col" className="px-4 py-3">Entity</th>
                  <th scope="col" className="px-4 py-3">Metadata</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t border-border align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">{formatPST(log.createdAt)}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className="font-semibold text-slate-800">{log.actor?.name ?? "System"}</span>
                      {log.actor?.email ? <span className="block text-muted-foreground">{log.actor.email}</span> : null}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{log.action}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {log.entityType}
                      {log.entityId ? (
                        <span className="block font-mono text-[10px] text-muted-foreground">{log.entityId}</span>
                      ) : null}
                    </td>
                    <td className="max-w-md px-4 py-3 text-xs text-muted-foreground">{metadataSummary(log.metadata)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 ? (
        <nav className="flex items-center justify-between gap-3" aria-label="Pagination">
          {page > 1 ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/audit?${new URLSearchParams({ ...(action ? { action } : {}), page: String(page - 1) }).toString()}`}>
                Previous
              </Link>
            </Button>
          ) : (
            <span />
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/audit?${new URLSearchParams({ ...(action ? { action } : {}), page: String(page + 1) }).toString()}`}>
                Next
              </Link>
            </Button>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}
