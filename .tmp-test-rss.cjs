const { fetchDILGRegionIII } = require("./src/lib/dilg-rss.ts");
(async () => {
  const res = await fetchDILGRegionIII();
  console.log("DILG RSS fetch:", res.error ? "ERROR: " + res.error : "OK — " + (Array.isArray(res.items) ? res.items.length : 0) + " items, fetched at " + res.fetchedAt);
  if (res.items && res.items.length > 0) {
    console.log("First item:", res.items[0].title, "| link:", res.items[0].link?.slice(0, 60));
  }
})();
