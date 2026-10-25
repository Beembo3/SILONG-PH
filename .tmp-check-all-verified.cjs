const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const v = await p.coolingPlace.findMany({ where: { verificationStatus: "VERIFIED" }, select: { name: true, provinceCode: true, latitude: true, longitude: true } });
  for (const item of v) console.log(item.name + " | " + item.provinceCode + " | " + item.latitude + "," + item.longitude);
  await p.$disconnect();
})();
