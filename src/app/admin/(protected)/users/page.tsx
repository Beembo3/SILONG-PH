import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requirePageUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: { title: string } = { title: "Users — Administration" };

export default async function AdminUsersPage() {
  const user = await requirePageUser(["SUPER_ADMIN"]);
  const users = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, role: true, createdAt: true, isActive: true },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-2">
        <Link href="/admin" className="text-sm font-semibold text-primary hover:underline">Back to admin</Link>
      </div>
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-extrabold tracking-tight text-navy">Users</h1>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Active administrator and staff accounts.</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((u) => (
          <Card key={u.id}>
            <CardContent className="pt-5 sm:pt-6">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-navy">{u.name ?? "—"}</h3>
                <Badge variant={u.role === "SUPER_ADMIN" ? "success" : "outline"}>{u.role}</Badge>
              </div>
              <p className="mt-1 text-xs font-medium text-muted-foreground">{u.email}</p>
              <p className="mt-2 text-xs text-muted-foreground">Created {new Date(u.createdAt).toLocaleDateString("en-PH")}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Create new account</CardTitle>
          <p className="text-xs text-muted-foreground">Only SUPER_ADMIN can create accounts. Requires minimum 12-character password.</p>
        </CardHeader>
        <CardContent>
          <form
            method="post"
            action="/api/admin/users"
            className="space-y-3"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="email" type="email" required placeholder="Email" className="rounded-lg border border-border bg-card px-3 py-2 text-sm" />
              <input name="name" required placeholder="Full name" className="rounded-lg border border-border bg-card px-3 py-2 text-sm" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <select name="role" required className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
                <option value="CONTENT_ADMIN">Content Admin</option>
                <option value="PLACE_VERIFIER">Place Verifier</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
              <input name="password" type="password" required minLength={12} placeholder="Password (min 12 chars)" className="rounded-lg border border-border bg-card px-3 py-2 text-sm" />
            </div>
            <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white">Create account</button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
