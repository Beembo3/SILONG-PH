import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ApiAuthError } from "@/lib/auth";

export function handleApiError(error: unknown, context: string): NextResponse {
  if (error instanceof ApiAuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "The requested record was not found." }, { status: 404 });
    }
    if (error.code === "P2002") {
      return NextResponse.json({ error: "A record with those unique details already exists." }, { status: 409 });
    }
  }
  console.error(context, error);
  return NextResponse.json(
    { error: "Something went wrong. Please try again or contact the administrator." },
    { status: 500 },
  );
}
