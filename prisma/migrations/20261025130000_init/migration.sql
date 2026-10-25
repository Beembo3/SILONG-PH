-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(191) NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "passwordHash" VARCHAR(191) NOT NULL,
    "role" VARCHAR(32) NOT NULL DEFAULT 'CONTENT_ADMIN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "preferredLocationCode" VARCHAR(10),
    "notificationPreferences" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoolingPlace" (
    "id" TEXT NOT NULL,
    "osmId" VARCHAR(191),
    "name" VARCHAR(191) NOT NULL,
    "category" VARCHAR(80) NOT NULL,
    "address" VARCHAR(300) NOT NULL,
    "provinceCode" VARCHAR(10) NOT NULL,
    "localityCode" VARCHAR(10) NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "operatingHours" VARCHAR(200),
    "accessibilityDetails" TEXT,
    "amenities" TEXT NOT NULL DEFAULT '[]',
    "publicAccessDetails" TEXT,
    "verificationStatus" VARCHAR(32) NOT NULL DEFAULT 'UNVERIFIED',
    "verificationNote" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "lastReviewedAt" TIMESTAMP(3),
    "sourceUrl" VARCHAR(500),
    "contactInformation" VARCHAR(300),
    "photoUrl" VARCHAR(500),
    "photoCredit" VARCHAR(200),
    "archivedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "verifiedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoolingPlace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityReport" (
    "id" TEXT NOT NULL,
    "coolingPlaceId" TEXT,
    "reportType" VARCHAR(40) NOT NULL,
    "description" TEXT NOT NULL,
    "proposedName" VARCHAR(160),
    "proposedAddress" VARCHAR(300),
    "proposedLocalityCode" VARCHAR(10),
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "moderatorNote" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,

    CONSTRAINT "FacilityReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficialAlert" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "affectedArea" VARCHAR(300) NOT NULL,
    "severity" VARCHAR(20) NOT NULL,
    "issuer" VARCHAR(200) NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "sourceUrl" VARCHAR(500) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfficialAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreparednessArticle" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(191) NOT NULL,
    "content" TEXT NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "language" VARCHAR(10) NOT NULL DEFAULT 'en',
    "sourceReferences" TEXT NOT NULL DEFAULT '[]',
    "status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreparednessArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" VARCHAR(80) NOT NULL,
    "entityType" VARCHAR(80) NOT NULL,
    "entityId" VARCHAR(191),
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "ipHash" VARCHAR(64),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CoolingPlace_osmId_key" ON "CoolingPlace"("osmId");

-- CreateIndex
CREATE INDEX "CoolingPlace_provinceCode_idx" ON "CoolingPlace"("provinceCode");

-- CreateIndex
CREATE INDEX "CoolingPlace_localityCode_idx" ON "CoolingPlace"("localityCode");

-- CreateIndex
CREATE INDEX "CoolingPlace_verificationStatus_idx" ON "CoolingPlace"("verificationStatus");

-- CreateIndex
CREATE INDEX "CoolingPlace_category_idx" ON "CoolingPlace"("category");

-- CreateIndex
CREATE INDEX "CoolingPlace_archivedAt_idx" ON "CoolingPlace"("archivedAt");

-- CreateIndex
CREATE INDEX "FacilityReport_status_idx" ON "FacilityReport"("status");

-- CreateIndex
CREATE INDEX "FacilityReport_submittedAt_idx" ON "FacilityReport"("submittedAt");

-- CreateIndex
CREATE INDEX "FacilityReport_coolingPlaceId_idx" ON "FacilityReport"("coolingPlaceId");

-- CreateIndex
CREATE INDEX "OfficialAlert_status_idx" ON "OfficialAlert"("status");

-- CreateIndex
CREATE INDEX "OfficialAlert_issuedAt_idx" ON "OfficialAlert"("issuedAt");

-- CreateIndex
CREATE INDEX "OfficialAlert_expiresAt_idx" ON "OfficialAlert"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PreparednessArticle_slug_key" ON "PreparednessArticle"("slug");

-- CreateIndex
CREATE INDEX "PreparednessArticle_status_idx" ON "PreparednessArticle"("status");

-- CreateIndex
CREATE INDEX "PreparednessArticle_category_idx" ON "PreparednessArticle"("category");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "CoolingPlace" ADD CONSTRAINT "CoolingPlace_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoolingPlace" ADD CONSTRAINT "CoolingPlace_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityReport" ADD CONSTRAINT "FacilityReport_coolingPlaceId_fkey" FOREIGN KEY ("coolingPlaceId") REFERENCES "CoolingPlace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityReport" ADD CONSTRAINT "FacilityReport_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficialAlert" ADD CONSTRAINT "OfficialAlert_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreparednessArticle" ADD CONSTRAINT "PreparednessArticle_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Supabase security hardening.
-- The app talks to Postgres through Prisma and does not use the Supabase Data
-- API. Revoke the public Data API roles and enable RLS as defense in depth.
-- The table owner (the Supabase postgres role) still has full access.
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['User', 'CoolingPlace', 'FacilityReport', 'OfficialAlert', 'PreparednessArticle', 'AuditLog']
  LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
      EXECUTE format('REVOKE ALL ON TABLE %I FROM anon', tbl);
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
      EXECUTE format('REVOKE ALL ON TABLE %I FROM authenticated', tbl);
    END IF;
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
  END LOOP;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM authenticated';
  END IF;
END $$;

