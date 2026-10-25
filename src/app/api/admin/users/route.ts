import { requireApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(160),
  role: z.enum(["CONTENT_ADMIN", "PLACE_VERIFIER", "SUPER_ADMIN"]),
  password: z.string().min(12),
});

export async function POST(request: Request) {
  const me = await requireApiUser(["SUPER_ADMIN"]);
  try {
    const body = await request.json();
    const data = schema.parse(body);
    const exists = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (exists) return Response.json({ error: "Email already registered." }, { status: 409 });
    const hash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        role: data.role,
        passwordHash: hash,
        isActive: true,
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    return Response.json({ ok: true, user, createdBy: me.email }, { status: 201 });
  } catch (e: any) {
    return Response.json({ error: e?.message ?? "Invalid request." }, { status: 400 });
  }
}
