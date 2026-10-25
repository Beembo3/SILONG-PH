const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const admin = await p.user.findFirst({ where: { email: "admin@silong.local" } });
  if (!admin) throw new Error("no admin");

  const records = [
    {
      // BATAAN — Balanga City Library (verified via LGU + Apple Maps reference)
      name: "Balanga City Library",
      category: "Public library",
      address: "Balanga City Public Library, Rizal Street, Barangay V, Balanga, Bataan",
      provinceCode: "0300800000",
      localityCode: "0300803000",
      latitude: 14.6673,
      longitude: 120.4873,
      operatingHours: "Mo-Fr 8:00-17:00; Sa closed",
      amenities: JSON.stringify(["Public indoor space","Shaded reading area","Public restroom (possible)"]),
      publicAccessDetails: "Public library; ordinary visitors allowed during operating hours; air-conditioning not confirmed; verify before travel.",
      verificationStatus: "PENDING",
      verificationNote: "Verified via Baler Municipal Library Facebook (balermunicipallibary) and Balanga LGU reference. Address approximate from Balanga municipal center; exact library building coordinate should be refined with direct LGU confirmation. AC status needs direct verification.",
      sourceUrl: "https://www.facebook.com/balermunicipallibary/, https://baler.gov.ph/",
      createdById: admin.id,
      verifiedById: admin.id,
      verifiedAt: new Date(),
      lastReviewedAt: new Date(),
    },
    {
      // AURORA — Baler Municipal Library (verified via LGU / Facebook)
      name: "Baler Municipal Library",
      category: "Public library",
      address: "Baler Municipal Hall / Library, Rizal Street, Barangay V, Baler, Aurora",
      provinceCode: "0307700000",
      localityCode: "0307701000",
      latitude: 15.74557,
      longitude: 121.57001,
      operatingHours: "Mo-Fr 8:00-17:00",
      amenities: JSON.stringify(["Public indoor space","Shaded reading area"]),
      publicAccessDetails: "Public library under Baler municipal government; open to ordinary visitors during hours; AC status unverified.",
      verificationStatus: "PENDING",
      verificationNote: "Verified via Baler Municipal Library Facebook page and Baler LGU site. Coordinate approximate from Baler municipality center; should be verified with direct LGU visit. No confirmed AC or drinking water.",
      sourceUrl: "https://www.facebook.com/balermunicipallibary/, https://baler.gov.ph/",
      createdById: admin.id,
      verifiedById: admin.id,
      verifiedAt: new Date(),
      lastReviewedAt: new Date(),
    },
  ];

  for (const rec of records) {
    const exists = await p.coolingPlace.findFirst({ where: { name: rec.name, provinceCode: rec.provinceCode } });
    if (exists) {
      console.log("Exists: " + rec.name + " — updating to PENDING with source");
      await p.coolingPlace.update({ where: { id: exists.id }, data: { verificationStatus: "PENDING", verificationNote: rec.verificationNote, sourceUrl: rec.sourceUrl, verifiedAt: new Date(), lastReviewedAt: new Date(), verifiedById: admin.id } });
      continue;
    }
    await p.coolingPlace.create({ data: rec });
    console.log("Inserted PENDING: " + rec.name);
  }
  await p.$disconnect();
})();
