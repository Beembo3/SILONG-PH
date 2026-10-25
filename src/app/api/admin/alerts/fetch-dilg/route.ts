export async function GET() {
  try {
    const res = await fetch("https://centralluzon.region3.dilg.gov.ph/feed/", { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error("Status " + res.status);
    const xml = await res.text();
    const items = [];
    const matches = xml.matchAll(/<item>[\s\S]*?<\/item>/g);
    for (const m of matches) {
      const b = m[0];
      items.push({
        title: b.match(/<title>([^<]+)<\/title>/)?.[1]?.trim() ?? "Untitled",
        link: b.match(/<link>([^<]+)<\/link>/)?.[1]?.trim() ?? null,
        pubDate: b.match(/<pubDate>([^<]+)<\/pubDate>/)?.[1]?.trim() ?? null,
        category: b.match(/<category[^>]*>([^<]+)<\/category>/)?.[1]?.trim() ?? null,
      });
    }
    return Response.json({ ok: true, count: items.length, fetchedAt: new Date().toISOString(), source: "https://centralluzon.region3.dilg.gov.ph/feed/", first: items.slice(0, 3) });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message, fetchedAt: new Date().toISOString() }, { status: 500 });
  }
}
