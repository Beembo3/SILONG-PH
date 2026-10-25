"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

  useEffect(() => {
    fetch("/api/admin/users/list")
      .then(r => r.json())
      .then(d => { if (d.ok) setUsers(d.users ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-2">
        <Link href="/admin" className="text-sm font-semibold text-primary hover:underline">Back to admin</Link>
      </div>
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-extrabold tracking-tight text-navy">Users</h1>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Manage administrator and staff accounts.</p>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div />
        <Button onClick={() => setOpenCreate(true)} className="bg-primary text-white hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-1.5" /> Add New Account
        </Button>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading accounts...</p>
      ) : users.length === 0 ? (
        <Card className="mt-4"><CardContent className="py-10 text-center text-sm text-muted-foreground">No active users found.</CardContent></Card>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Created</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-border hover:bg-muted/40">
                  <td className="px-4 py-3 font-semibold text-navy">{u.name ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3"><Badge variant={u.role === "SUPER_ADMIN" ? "success" : "outline"}>{u.role}</Badge></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString("en-PH")}</td>
                  <td className="px-4 py-3"><span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Active</span></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setEditId(u.id); setEditName(u.name ?? ""); setEditEmail(u.email); setEditRole(u.role); }}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                      {u.id !== window.localStorage.getItem("silong-session-id") && (
                        <Button variant="outline" size="sm" className="text-red-700 hover:text-red-800 hover:bg-red-50" onClick={() => setDeleteId(u.id)}><Trash2 className="h-3.5 w-3.5" /> Delete</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-md">
          <DialogTitle></DialogTitle>
          <form method="post" action="/api/admin/users" className="space-y-3" onSubmit={async (e) => {
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
              <Input id="email" name="email" type="email" required placeholder="Email" />
              <Input id="name" name="name" required placeholder="Full name" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Select id="role" name="role" defaultValue="CONTENT_ADMIN">
                <option value="CONTENT_ADMIN">Content Admin</option>
                <option value="PLACE_VERIFIER">Place Verifier</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </Select>
              <Input id="password" name="password" type="password" required minLength={12} placeholder="Password (min 12)" />
            </div>
            {msg ? <p className={`text-xs ${msg.startsWith("Created") ? "text-emerald-600" : "text-red-600"}`}>{msg}</p> : null}
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary text-white">Create Account</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {editId && (
        <Dialog open onOpenChange={() => setEditId(null)}>
          <DialogContent className="max-w-md">
            <DialogTitle></DialogTitle>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const res = await fetch("/api/admin/users/edit", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ id: editId, email: editEmail, name: editName, role: editRole }),
              });
              if (res.ok) window.location.reload();
            }} className="space-y-3">
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
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditId(null)}>Cancel</Button>
                <Button type="submit" className="bg-primary">Save</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {deleteId && (
        <Dialog open onOpenChange={() => setDeleteId(null)}>
          <DialogContent className="max-w-sm">
            <DialogTitle></DialogTitle>
            <p className="text-sm text-muted-foreground">Are you sure? This will deactivate the account. The last SUPER_ADMIN cannot be deleted.</p>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button className="bg-red-600 text-white hover:bg-red-700" onClick={async () => {
                const res = await fetch("/api/admin/users/delete", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({ id: deleteId }),
                });
                if (res.ok) window.location.reload();
              }}>Delete</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
