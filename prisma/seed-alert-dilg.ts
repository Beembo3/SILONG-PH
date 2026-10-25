const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const admin = await p.user.findFirst({ where: { email: "admin@silong.local" } });
  if (!admin) throw new Error("no admin");
  await p.officialAlert.upsert({
    where: { id: "dilg-r3-2026-10-22" },
    update: {
      title: "DILG Region III — SubayBAYANI Awards & Regional Governance Update (Oct 2026)",
      description: "DILG Region III concluded the 2026 Central Luzon SubayBAYANI Awards cum Infrastructure Governance Summit. Recognized LGUs include Provincial Government of Aurora, Bulacan, Zambales, Angeles City, Mabalacat City, City of Malolos, Meycauayan City, Science City of Muñoz, Bagac (Bataan), Iba (Zambales), Obando (Bulacan), Pulilan (Bulacan), Pura (Tarlac). This is a regional governance and infrastructure monitoring advisory, not an emergency weather or disaster warning.",
      issuer: "DILG Region III",
      affectedArea: "Central Luzon (Region III) — all seven provinces",
      severity: "INFO",
      status: "ACTIVE",
      sourceUrl: "https://centralluzon.region3.dilg.gov.ph/subaybayani-ng-tres-%f0%9f%8f%86-dilg-central-luzon-honors-outstanding-lgus-expands-partnerships-unveils-second-edition-of-alab/",
      issuedAt: new Date("2026-10-15T05:58:43Z"),
      expiresAt: new Date("2026-11-15T05:58:43Z"),
      updatedAt: new Date(),
    },
    create: {
      id: "dilg-r3-2026-10-22",
      title: "DILG Region III — SubayBAYANI Awards & Regional Governance Update (Oct 2026)",
      description: "DILG Region III concluded the 2026 Central Luzon SubayBAYANI Awards cum Infrastructure Governance Summit. Recognized LGUs include Provincial Government of Aurora, Bulacan, Zambales, Angeles City, Mabalacat City, City of Malolos, Meycauayan City, Science City of Muñoz, Bagac (Bataan), Iba (Zambales), Obando (Bulacan), Pulilan (Bulacan), Pura (Tarlac).",
      issuer: "DILG Region III",
      affectedArea: "Central Luzon (Region III)",
      severity: "INFO",
      status: "ACTIVE",
      sourceUrl: "https://centralluzon.region3.dilg.gov.ph/subaybayani-ng-tres-%f0%9f%8f%86-dilg-central-luzon-honors-outstanding-lgus-expands-partnerships-unveils-second-edition-of-alab/",
      issuedAt: new Date("2026-10-15T05:58:43Z"),
      expiresAt: new Date("2026-11-15T05:58:43Z"),
      createdById: admin.id,
    },
  });
  console.log("Verified DILG alert created/updated: dilg-r3-2026-10-22");
  await p.$disconnect();
})();
