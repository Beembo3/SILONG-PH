import { z } from "zod";
import { PLACE_CATEGORIES, VERIFICATION_STATUSES } from "./places";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => (value === "" ? null : value ?? null));

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password.").max(200),
});

export const reportSchema = z.object({
  coolingPlaceId: optionalText(64),
  reportType: z.enum([
    "INCORRECT_DETAILS",
    "OUTDATED_HOURS",
    "PERMANENTLY_CLOSED",
    "INACCURATE_DIRECTIONS",
    "MISSING_ACCESSIBILITY",
    "NEW_LOCATION",
    "OTHER",
  ]),
  description: z
    .string()
    .trim()
    .min(15, "Please give at least 15 characters of detail so a reviewer can investigate.")
    .max(2000, "Keep the report under 2,000 characters."),
  proposedName: optionalText(160),
  proposedAddress: optionalText(300),
  proposedLocalityCode: optionalText(20),
});

export const placeCreateSchema = z.object({
  name: z.string().trim().min(2, "Name is required.").max(160),
  category: z.string().trim().min(2).max(80),
  address: z.string().trim().min(5, "A full address is required.").max(300),
  provinceCode: z.string().regex(/^\d{10}$/, "Select a province."),
  localityCode: z.string().regex(/^\d{10}$/, "Select a city or municipality."),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  operatingHours: optionalText(200),
  accessibilityDetails: optionalText(500),
  amenities: z.array(z.string().trim().max(120)).max(20).default([]),
  publicAccessDetails: optionalText(1000),
  contactInformation: optionalText(300),
  sourceUrl: z
    .string()
    .trim()
    .max(500)
    .optional()
    .nullable()
    .transform((value) => (value === "" ? null : value ?? null))
    .refine((value) => value == null || /^https?:\/\//i.test(value), "Source URL must start with http(s)."),
  verificationStatus: z.enum(VERIFICATION_STATUSES).default("PENDING"),
});

export const placeUpdateSchema = placeCreateSchema.partial().extend({
  verificationNote: optionalText(1000),
  lastReviewedAt: z.coerce.date().optional().nullable(),
});

export const verifyPlaceSchema = z.object({
  verificationStatus: z.enum(["VERIFIED", "PENDING", "TEMPORARILY_UNAVAILABLE", "CLOSED", "UNVERIFIED"]),
  verificationNote: optionalText(1000),
});

export const reportUpdateSchema = z.object({
  status: z.enum(["PENDING", "REVIEWED", "DISMISSED", "ACTIONED"]),
  moderatorNote: optionalText(1000),
});

export const alertCreateSchema = z
  .object({
    title: z.string().trim().min(5).max(200),
    description: z.string().trim().min(20).max(4000),
    affectedArea: z.string().trim().min(2).max(300),
    severity: z.enum(["INFO", "WATCH", "WARNING", "DANGER", "EXTREME"]),
    issuer: z.string().trim().min(2).max(200),
    issuedAt: z.coerce.date(),
    expiresAt: z.coerce.date().optional().nullable(),
    sourceUrl: z.string().url(),
  })
  .refine((data) => !data.expiresAt || data.expiresAt > data.issuedAt, {
    message: "Expiry must be after the issue time.",
    path: ["expiresAt"],
  });

export const alertUpdateSchema = z.object({
  status: z.enum(["ACTIVE", "EXPIRED", "ARCHIVED"]),
});

export const weatherQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

export const placeSearchSchema = z.object({
  q: z.string().trim().max(100).optional().default(""),
  province: z.string().trim().max(20).optional().default(""),
  locality: z.string().trim().max(20).optional().default(""),
  category: z.string().trim().max(80).optional().default(""),
  verification: z.string().trim().max(30).optional().default(""),
  water: z.coerce.boolean().optional().default(false),
  accessible: z.coerce.boolean().optional().default(false),
  openNow: z.coerce.boolean().optional().default(false),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lon: z.coerce.number().min(-180).max(180).optional(),
  page: z.coerce.number().int().min(1).max(1000).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(60).optional().default(24),
});

export const placeCategoryOptions = PLACE_CATEGORIES;
