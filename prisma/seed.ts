import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { preparednessSections, preparednessSources } from "../src/data/preparedness";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@silong.local").toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("ADMIN_PASSWORD is required to seed the administrator account.");
  }
  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      name: "SILONG PH Administrator",
      role: "SUPER_ADMIN",
      isActive: true,
      // Re-running the seed with a new ADMIN_PASSWORD rotates the bootstrap
      // administrator's password. Remove ADMIN_PASSWORD from the runtime
      // environment after seeding.
      passwordHash,
    },
    create: {
      email,
      name: "SILONG PH Administrator",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });
  console.log(`Administrator ready: ${admin.email} (${admin.role})`);

  const seedPath = path.join(process.cwd(), "data", "seed-places.json");
  if (fs.existsSync(seedPath)) {
    const seed = JSON.parse(fs.readFileSync(seedPath, "utf8")) as {
      places: Array<Record<string, unknown>>;
    };
    let created = 0;
    for (const place of seed.places) {
      const exists = await prisma.coolingPlace.findUnique({
        where: { osmId: String(place.osmId) },
        select: { id: true },
      });
      if (exists) continue;
      await prisma.coolingPlace.create({
        data: {
          osmId: String(place.osmId),
          name: String(place.name),
          category: String(place.category),
          address: String(place.address),
          provinceCode: String(place.provinceCode),
          localityCode: String(place.localityCode),
          latitude: Number(place.latitude),
          longitude: Number(place.longitude),
          operatingHours: place.operatingHours ? String(place.operatingHours) : null,
          accessibilityDetails: place.accessibilityDetails
            ? String(place.accessibilityDetails)
            : null,
          amenities: String(place.amenities ?? "[]"),
          publicAccessDetails: place.publicAccessDetails
            ? String(place.publicAccessDetails)
            : null,
          verificationStatus: "UNVERIFIED",
          verificationNote: place.verificationNote ? String(place.verificationNote) : null,
          sourceUrl: place.sourceUrl ? String(place.sourceUrl) : null,
          contactInformation: place.contactInformation
            ? String(place.contactInformation)
            : null,
          photoUrl: place.photoUrl ? String(place.photoUrl) : null,
          photoCredit: place.photoCredit ? String(place.photoCredit) : null,
          createdById: admin.id,
        },
      });
      created += 1;
    }
    console.log(`Cooling-place seed: ${created} created, ${seed.places.length - created} already present.`);
  }

  const sourcesJson = JSON.stringify(preparednessSources);
  for (const section of preparednessSections) {
    const slug = `heat-${section.id}`;
    const content = [
      section.summary,
      "",
      ...section.items.map((item) => `## ${item.title}\n${item.detail}`),
    ].join("\n\n");
    await prisma.preparednessArticle.upsert({
      where: { slug },
      update: {
        title: section.title,
        content,
        category: section.id,
        sourceReferences: sourcesJson,
        status: "PUBLISHED",
      },
      create: {
        title: section.title,
        slug,
        content,
        category: section.id,
        language: "en",
        sourceReferences: sourcesJson,
        status: "PUBLISHED",
        publishedAt: new Date(),
        createdById: admin.id,
      },
    });
  }
  console.log(`Preparedness articles ready: ${preparednessSections.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
