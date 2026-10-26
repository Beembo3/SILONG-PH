import { requireApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ id: z.string(), email: z.string().email(), name: z.string().min(1).max(160), role: z.enum(["CONTENT_ADMIN", "PLACE_VERIFIER", "SUPER_ADMIN"]) });

export async function POST(request: Request) {
  const me = await requireApiUser(["SUPER_ADMIN"]);
  try {
    const body = await request.json();
    const data = schema.parse(body);
    if (data.role === "SUPER_ADMIN" && me.role !== "SUPER_ADMIN") {
      return Response.json({ error: "Only SUPER_ADMIN may assign SUPER_ADMIN role." }, { status: 403 });
    }
    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing && existing.id !== data.id) {
      return Response.json({ error: "Email already in use." }, { status: 409 });
    }
    await prisma.user.update({
      where: { id: data.id },
      data: { email: data.email.toLowerCase(), name: data.name, role: data.role, updatedAt: new Date() },
      select: { id: true, email: true, name: true, role: true },
    });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Invalid request." }, { status: 400 });
  }
}
