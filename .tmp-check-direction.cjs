const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const v = await p.coolingPlace.findFirst({ where: { name: "SM City Cabanatuan" } });
  console.log("DB lat=" + v.latitude + " lon=" + v.longitude);
  console.log("Directions: https://www.google.com/maps/dir/?api=1&destination=" + v.longitude + "," + v.latitude);
  console.log("Note: directions URL uses lat,lon order (Google expects lat,lon)");
  await p.$disconnect();
})();
