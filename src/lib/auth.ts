import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "silong_session";
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

export type Role = "SUPER_ADMIN" | "CONTENT_ADMIN" | "PLACE_VERIFIER";

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super administrator",
  CONTENT_ADMIN: "Content administrator",
  PLACE_VERIFIER: "Place verifier",
};

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

function secret(): Uint8Array {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error("AUTH_SECRET must be set to at least 32 characters.");
  }
  return new TextEncoder().encode(value);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .setIssuer("silong-ph")
    .setAudience("silong-ph-admin")
    .sign(secret());
}

/**
 * Secure cookies require HTTPS. Production deployments must set
 * NEXT_PUBLIC_APP_URL to their https:// origin. Keeping this derived from the
 * configured origin (rather than NODE_ENV alone) allows `npm start` to be
 * smoke-tested over http://localhost without weakening a real HTTPS deploy.
 */
function secureCookies(): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return appUrl === "" || appUrl.startsWith("https://");
}

export async function setSessionCookie(user: SessionUser): Promise<void> {
  const token = await createSessionToken(user);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: secureCookies(),
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: secureCookies(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

async function readToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = await readToken();
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), {
      issuer: "silong-ph",
      audience: "silong-ph-admin",
    });
    if (!payload.sub) return null;
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });
    if (!user || !user.isActive) return null;
    if (!(user.role in ROLE_LABELS)) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
    };
  } catch {
    return null;
  }
});

export function hasRole(user: SessionUser | null, allowed: Role[]): boolean {
  return Boolean(user && allowed.includes(user.role));
}

export async function requirePageUser(allowed?: Role[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (allowed && !hasRole(user, allowed)) redirect("/admin?denied=1");
  return user;
}

export class ApiAuthError extends Error {
  constructor(
    message: string,
    public readonly status: 401 | 403,
  ) {
    super(message);
  }
}

export async function requireApiUser(allowed?: Role[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new ApiAuthError("Authentication required.", 401);
  if (allowed && !hasRole(user, allowed)) {
    throw new ApiAuthError("You do not have permission to perform this action.", 403);
  }
  return user;
}

export function assertSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const allowed = new Set<string>();
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) allowed.add(new URL(configured).origin);
  try {
    allowed.add(new URL(request.url).origin);
  } catch {
    // ignore malformed request URL
  }
  return allowed.has(origin);
}
