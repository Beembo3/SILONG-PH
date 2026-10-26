import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { LogoutButton } from "@/components/admin/logout-button";
import { Brand } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, requirePageUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Administration",
    template: "%s | SILONG PH admin",
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser();

  return (
    <div className="min-h-[100dvh] bg-surface">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Brand hideTaglineOnMobile />
            <Badge variant="outline">Admin</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-navy">{user.name}</p>
              <p className="text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</p>
            </div>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-border px-2.5 text-xs font-semibold text-slate-600 hover:bg-muted"
            >
              Public site <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </Link>
            <LogoutButton />
          </div>
        </div>
        <div className="mx-auto max-w-7xl overflow-x-auto px-4 pb-2 sm:px-6 lg:hidden lg:px-8">
          <AdminNav variant="mobile" />
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-6">
            <p className="px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Administration
            </p>
            <div className="mt-2">
              <AdminNav />
            </div>
            <div className="mt-4 rounded-lg border border-border bg-white p-3 text-xs leading-relaxed text-muted-foreground">
              Server-side role checks protect every admin action. Changes are written to the audit log.
            </div>
          </div>
        </aside>
        <main id="main-content" className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
