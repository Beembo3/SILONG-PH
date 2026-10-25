const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const verified = await p.coolingPlace.findMany({ where: { verificationStatus: "VERIFIED" }, select: { name: true, provinceCode: true, localityCode: true, latitude: true, longitude: true } });
  console.log("VERIFIED count: " + verified.length);
  for (const v of verified) console.log("  " + v.name + " | province=" + v.provinceCode + " | lat=" + v.latitude + " lon=" + v.longitude);
  const byProv = {};
  for (const v of verified) { byProv[v.provinceCode] = (byProv[v.provinceCode] || 0) + 1; }
  console.log("By province: " + JSON.stringify(byProv));
  await p.$disconnect();
})();
