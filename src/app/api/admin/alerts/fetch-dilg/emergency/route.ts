import { fetchDILGRegionIII } from "@/lib/dilg-rss";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isEmergencyRelated(title: string, category?: string | null): boolean {
  const t = (title + " " + (category ?? "")).toLowerCase();
  return (
    t.includes("typhoon") ||
    t.includes("severe weather") ||
    t.includes("tropical cyclone") ||
    t.includes("flood") ||
    t.includes("rainfall") ||
    t.includes("thunderstorm") ||
    t.includes("heat index") ||
    t.includes("extreme heat") ||
    t.includes("evacuation") ||
    t.includes("suspension") ||
    t.includes("class suspension") ||
    t.includes("storm") ||
    t.includes("warning") ||
    t.includes("advisory")
  );
}

export async function GET() {
  const result = await fetchDILGRegionIII();
  if (result.error) {
    return Response.json({ ok: false, error: result.error, fetchedAt: result.fetchedAt, source: result.source }, { status: 500 });
  }
  const all = Array.isArray(result.items) ? result.items : [];
  const emergency = all.filter((item) => isEmergencyRelated(item.title, item.category));
  const others = all.filter((item) => !isEmergencyRelated(item.title, item.category));
  return Response.json({
    ok: true,
    source: result.source,
    fetchedAt: result.fetchedAt,
    totalFromFeed: all.length,
    emergencyRelated: emergency.length,
    emergencyItems: emergency.slice(0, 5).map((i) => ({ title: i.title, link: i.link, pubDate: i.pubDate, category: i.category })),
    otherItems: others.slice(0, 3).map((i) => ({ title: i.title, link: i.link, pubDate: i.pubDate, category: i.category })),
    note: "Only items matching emergency/heat/weather keywords are shown as emergency-related. Others are regional news/events (not emergency bulletins). Manual admin review required before publishing any alert.",
  });
}
