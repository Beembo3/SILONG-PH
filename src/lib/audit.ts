import "server-only";
import { prisma } from "@/lib/prisma";

export async function writeAuditLog(input: {
  actorId: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        metadata: JSON.stringify(input.metadata ?? {}),
      },
    });
  } catch (error) {
    // Auditing must never hide the result of the primary operation, but a
    // failure should be visible in server logs.
    console.error("Failed to write audit log", error);
  }
}
