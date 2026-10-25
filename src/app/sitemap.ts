import type { MetadataRoute } from "next";
import { localities, provinces } from "@/lib/geography";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const now = new Date();

  const staticPaths = [
    "",
    "/map",
    "/cool-places",
    "/preparedness",
    "/alerts",
    "/about",
    "/methodology",
    "/privacy",
  ];

  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/alerts" ? "hourly" : "weekly",
    priority: path === "" ? 1 : path === "/cool-places" ? 0.9 : 0.7,
  }));

  for (const province of provinces) {
    entries.push({
      url: `${base}/provinces/${province.slug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    });
  }

  for (const locality of localities) {
    entries.push({
      url: `${base}/localities/${locality.code}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.6,
    });
  }

  try {
    const verifiedPlaces = await prisma.coolingPlace.findMany({
      where: { archivedAt: null, verificationStatus: "VERIFIED" },
      select: { id: true, updatedAt: true },
      take: 5000,
    });
    for (const place of verifiedPlaces) {
      entries.push({
        url: `${base}/cool-places/${place.id}`,
        lastModified: place.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch (error) {
    console.error("Sitemap could not load verified places", error);
  }

  return entries;
}
