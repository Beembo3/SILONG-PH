export async function fetchDILGRegionIII() {
  try {
    const res = await fetch(
      "https://centralluzon.region3.dilg.gov.ph/feed/",
      { signal: AbortSignal.timeout(10000) },
    );
    if (!res.ok) throw new Error("Status " + res.status);
    const xml = await res.text();
    const items = [];
    const itemMatches = xml.matchAll(/<item>[\s\S]*?<\/item>/g);
    for (const match of itemMatches) {
      const block = match[0];
      const title = block.match(/<title>([^<]+)<\/title>/)?.[1]?.trim() ?? "Untitled";
      const link = block.match(/<link>([^<]+)<\/link>/)?.[1]?.trim() ?? null;
      const pubDate = block.match(/<pubDate>([^<]+)<\/pubDate>/)?.[1]?.trim() ?? null;
      const category = block.match(/<category[^>]*>([^<]+)<\/category>/)?.[1]?.trim() ?? null;
      const guid = block.match(/<guid[^>]*>([^<]+)<\/guid>/)?.[1]?.trim() ?? null;
      items.push({ title, link, pubDate, category, guid, description: null });
    }
    return { items, fetchedAt: new Date().toISOString(), source: "https://centralluzon.region3.dilg.gov.ph/feed/" };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Hindi makuha ang DILG feed.";
    console.error("DILG RSS fetch failed:", message);
    return { error: message, fetchedAt: new Date().toISOString(), source: "https://centralluzon.region3.dilg.gov.ph/feed/" };
  }
}
