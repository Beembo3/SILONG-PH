import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { Brand } from "@/components/brand";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administrator sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/admin");

  return (
    <div className="flex min-h-screen flex-col bg-navy">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-6 sm:px-6">
        <Brand onDark />
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-300 hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Public site
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-16 pt-6 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-5 text-center">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/15 text-orange-300">
              <LockKeyhole className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white">Administrator sign in</h1>
            <p className="mt-1 text-sm text-slate-400">
              Protected area for facility review, moderation, official alerts, and system health.
            </p>
          </div>

          <Card>
            <CardContent className="pt-5 sm:pt-6">
              <AdminLoginForm />
            </CardContent>
          </Card>

          <p className="mt-5 text-center text-xs leading-relaxed text-slate-500">
            Authorised personnel only. Administrative actions are recorded in an audit log. If you are not an
            administrator, return to the{" "}
            <Link href="/" className="font-semibold text-slate-300 hover:text-white">
              public dashboard
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
