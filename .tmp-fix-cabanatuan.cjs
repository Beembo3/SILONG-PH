const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  await p.coolingPlace.updateMany({
    where: { name: "SM City Cabanatuan", provinceCode: "0304900000" },
    data: { latitude: 15.4669, longitude: 120.9544, verificationNote: "Verified via Wikipedia / SM Supermalls / Apple Maps. Corrected coordinate from approximate (15.4931,120.9925) to exact SM Cabanatuan (15.4669,120.9544) — Barangay H. Concepcion, Maharlika Highway, Cabanatuan City. Source: en.wikipedia.org/wiki/SM_City_Cabanatuan, smsupermalls.com." }
  });
  console.log("Fixed SM Cabanatuan coords to 15.4669, 120.9544");
  await p.$disconnect();
})();
