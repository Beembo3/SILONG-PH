"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  isActive: boolean;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("CONTENT_ADMIN");
  const [msg, setMsg] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/users/list")
      .then(r => r.json())
      .then(d => { if (d.ok) setUsers(d.users ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        if (active) setCurrentUserId(body?.user?.id ?? null);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  // Do not offer self-deactivation. If the current account cannot be read,
  // leave the destructive action hidden rather than guessing.
  function canDelete(id: string): boolean {
    return currentUserId !== null && currentUserId !== id;
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin" className="inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline">
          Back to admin
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-extrabold tracking-tight text-navy">Users</h1>
      </div>
      <p className="text-sm text-muted-foreground">Manage administrator and staff accounts.</p>

      <div className="flex justify-end">
        <Button onClick={() => setOpenCreate(true)} className="w-full bg-primary text-white hover:bg-primary/90 sm:w-auto">
          <Plus className="mr-1.5 h-4 w-4" /> Add New Account
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading accounts...</p>
      ) : users.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No active users found.</CardContent></Card>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {users.map((u) => (
              <Card key={u.id}>
                <CardContent className="space-y-3 pt-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words font-semibold text-navy">{u.name ?? "—"}</p>
                      <p className="mt-0.5 break-all text-sm text-slate-600">{u.email}</p>
                    </div>
                    <Badge variant={u.role === "SUPER_ADMIN" ? "success" : "outline"}>{u.role}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      Active
                    </span>
                    <span>Created {new Date(u.createdAt).toLocaleDateString("en-PH")}</span>
                  </div>
                  <div className="flex gap-2 border-t border-border pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setEditId(u.id);
                        setEditName(u.name ?? "");
                        setEditEmail(u.email);
                        setEditRole(u.role);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    {canDelete(u.id) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-700 hover:bg-red-50 hover:text-red-800"
                        onClick={() => setDeleteId(u.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-xl border border-border bg-card shadow-sm md:block">
            <table className="w-full min-w-[54rem] text-sm">
              <thead className="bg-muted/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Created</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-border hover:bg-muted/40">
                    <td className="px-4 py-3 font-semibold text-navy">{u.name ?? "—"}</td>
                    <td className="break-all px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={u.role === "SUPER_ADMIN" ? "success" : "outline"}>{u.role}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString("en-PH")}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditId(u.id);
                            setEditName(u.name ?? "");
                            setEditEmail(u.email);
                            setEditRole(u.role);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                        {canDelete(u.id) && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-700 hover:bg-red-50 hover:text-red-800"
                            onClick={() => setDeleteId(u.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-md">
          <DialogTitle>Add account</DialogTitle>
          <p className="mt-1 text-sm text-muted-foreground">Create an administrator or staff account.</p>
          <form method="post" action="/api/admin/users" className="mt-4 space-y-3" onSubmit={async (e) => {
            e.preventDefault();
            setMsg(null);
            const form = e.currentTarget as HTMLFormElement;
            const data = new FormData(form);
            const res = await fetch("/api/admin/users", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ email: String(data.get("email")), name: String(data.get("name")), role: String(data.get("role") || "CONTENT_ADMIN"), password: String(data.get("password")) }),
            });
            const body = await res.json();
            setMsg(body.ok ? ("Created: " + body.user?.email) : ("Error: " + (body.error ?? "Failed")));
            if (body.ok) { form.reset(); setOpenCreate(false); router.refresh(); }
          }}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input id="email" name="email" type="email" autoComplete="email" required placeholder="Email" aria-label="Email" />
              <Input id="name" name="name" autoComplete="name" required placeholder="Full name" aria-label="Full name" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Select id="role" name="role" defaultValue="CONTENT_ADMIN" aria-label="Role">
                <option value="CONTENT_ADMIN">Content Admin</option>
                <option value="PLACE_VERIFIER">Place Verifier</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </Select>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                placeholder="Password (min 12)"
                aria-label="Password"
              />
            </div>
            {msg ? (
              <p className={`text-xs ${msg.startsWith("Created") ? "text-emerald-600" : "text-red-600"}`} role="status">
                {msg}
              </p>
            ) : null}
            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setOpenCreate(false)}>
                Cancel
              </Button>
              <Button type="submit" className="w-full bg-primary text-white sm:w-auto">Create Account</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {editId && (
        <Dialog open onOpenChange={() => setEditId(null)}>
          <DialogContent className="max-w-md">
            <DialogTitle>Edit account</DialogTitle>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const res = await fetch("/api/admin/users/edit", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ id: editId, email: editEmail, name: editName, role: editRole }),
              });
              if (res.ok) window.location.reload();
            }} className="mt-4 space-y-3">
              <div>
                <Label htmlFor="ed-name">Full name</Label>
                <Input id="ed-name" value={editName} onChange={e => setEditName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="ed-email">Email</Label>
                <Input id="ed-email" type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="ed-role">Role</Label>
                <Select id="ed-role" value={editRole} onChange={e => setEditRole(e.target.value)}>
                  <option value="CONTENT_ADMIN">Content Admin</option>
                  <option value="PLACE_VERIFIER">Place Verifier</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </Select>
              </div>
              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setEditId(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="w-full bg-primary sm:w-auto">Save</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {deleteId && (
        <Dialog open onOpenChange={() => setDeleteId(null)}>
          <DialogContent className="max-w-sm">
            <DialogTitle>Deactivate account</DialogTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure? This will deactivate the account. The last SUPER_ADMIN cannot be deleted.
            </p>
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button
                className="w-full bg-red-600 text-white hover:bg-red-700 sm:w-auto"
                onClick={async () => {
                  const res = await fetch("/api/admin/users/delete", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ id: deleteId }),
                  });
                  if (res.ok) window.location.reload();
                }}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
