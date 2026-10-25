const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  await p.coolingPlace.updateMany({
    where: { name: "SM City Bataan", provinceCode: "0300800000" },
    data: { latitude: 14.683, longitude: 120.537, verificationNote: "Verified via SM Supermalls + OSM geocode (14.6830221,120.5369961). Exact coordinate updated." }
  });
  const v = await p.coolingPlace.findMany({ where: { verificationStatus: "VERIFIED" }, select: { name: true, provinceCode: true, latitude: true, longitude: true } });
  console.log("VERIFIED AFTER FIX (" + v.length + "):");
  for (const item of v) console.log("  " + item.name + " | " + item.provinceCode + " | lat=" + item.latitude + " lon=" + item.longitude);
  await p.$disconnect();
})();
