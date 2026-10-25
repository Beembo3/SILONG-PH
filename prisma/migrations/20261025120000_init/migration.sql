-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` VARCHAR(32) NOT NULL DEFAULT 'CONTENT_ADMIN',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `preferredLocationCode` VARCHAR(10) NULL,
    `notificationPreferences` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CoolingPlace` (
    `id` VARCHAR(191) NOT NULL,
    `osmId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(80) NOT NULL,
    `address` VARCHAR(300) NOT NULL,
    `provinceCode` VARCHAR(10) NOT NULL,
    `localityCode` VARCHAR(10) NOT NULL,
    `latitude` DOUBLE NOT NULL,
    `longitude` DOUBLE NOT NULL,
    `operatingHours` VARCHAR(200) NULL,
    `accessibilityDetails` TEXT NULL,
    `amenities` TEXT NOT NULL DEFAULT '[]',
    `publicAccessDetails` TEXT NULL,
    `verificationStatus` VARCHAR(32) NOT NULL DEFAULT 'UNVERIFIED',
    `verificationNote` TEXT NULL,
    `verifiedAt` DATETIME(3) NULL,
    `lastReviewedAt` DATETIME(3) NULL,
    `sourceUrl` VARCHAR(500) NULL,
    `contactInformation` VARCHAR(300) NULL,
    `photoUrl` VARCHAR(500) NULL,
    `photoCredit` VARCHAR(200) NULL,
    `archivedAt` DATETIME(3) NULL,
    `createdById` VARCHAR(191) NULL,
    `verifiedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CoolingPlace_osmId_key`(`osmId`),
    INDEX `CoolingPlace_provinceCode_idx`(`provinceCode`),
    INDEX `CoolingPlace_localityCode_idx`(`localityCode`),
    INDEX `CoolingPlace_verificationStatus_idx`(`verificationStatus`),
    INDEX `CoolingPlace_category_idx`(`category`),
    INDEX `CoolingPlace_archivedAt_idx`(`archivedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FacilityReport` (
    `id` VARCHAR(191) NOT NULL,
    `coolingPlaceId` VARCHAR(191) NULL,
    `reportType` VARCHAR(40) NOT NULL,
    `description` TEXT NOT NULL,
    `proposedName` VARCHAR(160) NULL,
    `proposedAddress` VARCHAR(300) NULL,
    `proposedLocalityCode` VARCHAR(10) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `moderatorNote` TEXT NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reviewedAt` DATETIME(3) NULL,
    `reviewedById` VARCHAR(191) NULL,

    INDEX `FacilityReport_status_idx`(`status`),
    INDEX `FacilityReport_submittedAt_idx`(`submittedAt`),
    INDEX `FacilityReport_coolingPlaceId_idx`(`coolingPlaceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OfficialAlert` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NOT NULL,
    `affectedArea` VARCHAR(300) NOT NULL,
    `severity` VARCHAR(20) NOT NULL,
    `issuer` VARCHAR(200) NOT NULL,
    `issuedAt` DATETIME(3) NOT NULL,
    `expiresAt` DATETIME(3) NULL,
    `sourceUrl` VARCHAR(500) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `OfficialAlert_status_idx`(`status`),
    INDEX `OfficialAlert_issuedAt_idx`(`issuedAt`),
    INDEX `OfficialAlert_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PreparednessArticle` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `language` VARCHAR(10) NOT NULL DEFAULT 'en',
    `sourceReferences` TEXT NOT NULL DEFAULT '[]',
    `status` VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PreparednessArticle_slug_key`(`slug`),
    INDEX `PreparednessArticle_status_idx`(`status`),
    INDEX `PreparednessArticle_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `actorId` VARCHAR(191) NULL,
    `action` VARCHAR(80) NOT NULL,
    `entityType` VARCHAR(80) NOT NULL,
    `entityId` VARCHAR(191) NULL,
    `metadata` TEXT NOT NULL DEFAULT '{}',
    `ipHash` VARCHAR(64) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_createdAt_idx`(`createdAt`),
    INDEX `AuditLog_actorId_idx`(`actorId`),
    INDEX `AuditLog_entityType_entityId_idx`(`entityType`, `entityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CoolingPlace` ADD CONSTRAINT `CoolingPlace_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CoolingPlace` ADD CONSTRAINT `CoolingPlace_verifiedById_fkey` FOREIGN KEY (`verifiedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FacilityReport` ADD CONSTRAINT `FacilityReport_coolingPlaceId_fkey` FOREIGN KEY (`coolingPlaceId`) REFERENCES `CoolingPlace`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FacilityReport` ADD CONSTRAINT `FacilityReport_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OfficialAlert` ADD CONSTRAINT `OfficialAlert_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PreparednessArticle` ADD CONSTRAINT `PreparednessArticle_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

