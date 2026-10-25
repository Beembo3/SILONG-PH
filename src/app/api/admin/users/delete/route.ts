import { requireApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ id: z.string() });

export async function POST(request: Request) {
  const me = await requireApiUser(["SUPER_ADMIN"]);
  try {
    const body = await request.json();
    const data = schema.parse(body);
    if (data.id === me.id) {
      return Response.json({ error: "You cannot delete your own account." }, { status: 403 });
    }
    const target = await prisma.user.findUnique({ where: { id: data.id } });
    if (!target) return Response.json({ error: "User not found." }, { status: 404 });
    if (target.role === "SUPER_ADMIN") {
      const superAdmins = await prisma.user.count({ where: { role: "SUPER_ADMIN", isActive: true } });
      if (superAdmins <= 1) {
        return Response.json({ error: "Cannot delete the last SUPER_ADMIN." }, { status: 403 });
      }
    }
    await prisma.user.update({ where: { id: data.id }, data: { isActive: false, updatedAt: new Date() } });
    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json({ error: e?.message ?? "Invalid request." }, { status: 400 });
  }
}
