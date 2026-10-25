import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.hoisted(() => {
  class ApiAuthError extends Error {
    status: 401 | 403;
    constructor(message: string, status: 401 | 403) {
      super(message);
      this.name = "ApiAuthError";
      this.status = status;
    }
  }
  return {
    ApiAuthError,
    assertSameOrigin: vi.fn(() => true),
    requireApiUser: vi.fn(),
  };
});

const prismaMock = vi.hoisted(() => ({
  coolingPlace: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  facilityReport: {
    update: vi.fn(),
  },
  officialAlert: {
    create: vi.fn(),
    update: vi.fn(),
  },
}));

const auditMock = vi.hoisted(() => ({
  writeAuditLog: vi.fn(),
}));

vi.mock("@/lib/auth", () => authMock);
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/audit", () => auditMock);

import { POST as createPlace } from "@/app/api/admin/places/route";
import {
  DELETE as archivePlace,
  PATCH as updatePlace,
} from "@/app/api/admin/places/[id]/route";
import { PATCH as reviewReport } from "@/app/api/admin/reports/[id]/route";
import { POST as createAlert } from "@/app/api/admin/alerts/route";
import { PATCH as updateAlert } from "@/app/api/admin/alerts/[id]/route";

const admin = {
  id: "user_admin_1",
  email: "admin@example.com",
  name: "Admin",
  role: "SUPER_ADMIN" as const,
};

const validPlace = {
  name: "San Fernando Public Library",
  category: "Public library",
  address: "City of San Fernando, Pampanga",
  provinceCode: "0305400000",
  localityCode: "0305416000",
  latitude: 15.0286,
  longitude: 120.6898,
  amenities: ["Drinking water", "Seating"],
  sourceUrl: "https://www.openstreetmap.org/",
  verificationStatus: "PENDING",
};

const validAlert = {
  title: "Heat advisory for Central Luzon",
  description: "A verified official advisory description long enough to pass validation.",
  affectedArea: "Central Luzon (Region III)",
  severity: "WARNING",
  issuer: "DOST-PAGASA",
  issuedAt: "2026-10-25T10:00:00+08:00",
  expiresAt: "2026-10-26T10:00:00+08:00",
  sourceUrl: "https://www.pagasa.dost.gov.ph/",
};

function jsonRequest(url: string, method: string, body: unknown): Request {
  return new Request(url, {
    method,
    headers: {
      origin: "http://localhost:3000",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  authMock.assertSameOrigin.mockReturnValue(true);
  authMock.requireApiUser.mockResolvedValue(admin);
});

describe("admin place creation", () => {
  it("creates a pending record, writes an audit entry, and returns 201", async () => {
    prismaMock.coolingPlace.create.mockResolvedValue({
      id: "place_1",
      name: validPlace.name,
      verificationStatus: "PENDING",
    });

    const response = await createPlace(
      jsonRequest("http://localhost:3000/api/admin/places", "POST", validPlace),
    );
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ ok: true, id: "place_1" });

    expect(authMock.requireApiUser).toHaveBeenCalledWith(["SUPER_ADMIN", "PLACE_VERIFIER"]);
    const createArgs = prismaMock.coolingPlace.create.mock.calls[0]?.[0];
    expect(createArgs.data).toMatchObject({
      name: validPlace.name,
      provinceCode: "0305400000",
      localityCode: "0305416000",
      amenities: JSON.stringify(["Drinking water", "Seating"]),
      createdById: admin.id,
      verificationStatus: "PENDING",
      verifiedAt: null,
      verifiedById: null,
    });
    expect(createArgs.data.lastReviewedAt).toBeInstanceOf(Date);
    expect(auditMock.writeAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: admin.id,
        action: "PLACE_CREATED",
        entityType: "CoolingPlace",
        entityId: "place_1",
      }),
    );
  });

  it("rejects invalid place data with 422 and does not write", async () => {
    const response = await createPlace(
      jsonRequest("http://localhost:3000/api/admin/places", "POST", {
        ...validPlace,
        name: "",
      }),
    );
    expect(response.status).toBe(422);
    expect(prismaMock.coolingPlace.create).not.toHaveBeenCalled();
    expect(auditMock.writeAuditLog).not.toHaveBeenCalled();
  });

  it("rejects a cross-origin request before authentication", async () => {
    authMock.assertSameOrigin.mockReturnValueOnce(false);
    const response = await createPlace(
      jsonRequest("http://localhost:3000/api/admin/places", "POST", validPlace),
    );
    expect(response.status).toBe(403);
    expect(authMock.requireApiUser).not.toHaveBeenCalled();
  });

  it("returns 401 for an unauthenticated request", async () => {
    authMock.requireApiUser.mockRejectedValueOnce(
      new authMock.ApiAuthError("Authentication required.", 401),
    );
    const response = await createPlace(
      jsonRequest("http://localhost:3000/api/admin/places", "POST", validPlace),
    );
    expect(response.status).toBe(401);
  });
});

describe("admin place updates", () => {
  it("verifies a place, stamps the reviewer, and writes an audit entry", async () => {
    prismaMock.coolingPlace.findUnique.mockResolvedValue({
      id: "place_1",
      verifiedAt: null,
      verifiedById: null,
    });
    prismaMock.coolingPlace.update.mockResolvedValue({
      id: "place_1",
      verificationStatus: "VERIFIED",
    });

    const response = await updatePlace(
      jsonRequest("http://localhost:3000/api/admin/places/place_1", "PATCH", {
        verificationStatus: "VERIFIED",
        verificationNote: "Checked public access with the city librarian.",
      }),
      { params: Promise.resolve({ id: "place_1" }) },
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      id: "place_1",
      verificationStatus: "VERIFIED",
    });

    const updateArgs = prismaMock.coolingPlace.update.mock.calls[0]?.[0];
    expect(updateArgs.where).toEqual({ id: "place_1" });
    expect(updateArgs.data.verificationStatus).toBe("VERIFIED");
    expect(updateArgs.data.verifiedAt).toBeInstanceOf(Date);
    expect(updateArgs.data.verifiedById).toBe(admin.id);
    expect(updateArgs.data.verificationNote).toBe(
      "Checked public access with the city librarian.",
    );
    expect(updateArgs.data.lastReviewedAt).toBeInstanceOf(Date);
    expect(auditMock.writeAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: "PLACE_UPDATED", entityId: "place_1" }),
    );
  });

  it("returns 404 when the place does not exist", async () => {
    prismaMock.coolingPlace.findUnique.mockResolvedValue(null);
    const response = await updatePlace(
      jsonRequest("http://localhost:3000/api/admin/places/missing", "PATCH", {
        name: "New name",
      }),
      { params: Promise.resolve({ id: "missing" }) },
    );
    expect(response.status).toBe(404);
    expect(prismaMock.coolingPlace.update).not.toHaveBeenCalled();
  });

  it("rejects an invalid verification status with 422", async () => {
    prismaMock.coolingPlace.findUnique.mockResolvedValue({
      id: "place_1",
      verifiedAt: null,
      verifiedById: null,
    });
    const response = await updatePlace(
      jsonRequest("http://localhost:3000/api/admin/places/place_1", "PATCH", {
        verificationStatus: "APPROVED",
      }),
      { params: Promise.resolve({ id: "place_1" }) },
    );
    expect(response.status).toBe(422);
    expect(prismaMock.coolingPlace.update).not.toHaveBeenCalled();
  });

  it("archives a place instead of deleting it", async () => {
    prismaMock.coolingPlace.update.mockResolvedValue({ id: "place_1", name: "Library" });
    const response = await archivePlace(
      jsonRequest("http://localhost:3000/api/admin/places/place_1", "DELETE", {}),
      { params: Promise.resolve({ id: "place_1" }) },
    );
    expect(response.status).toBe(200);
    const updateArgs = prismaMock.coolingPlace.update.mock.calls[0]?.[0];
    expect(updateArgs.data.archivedAt).toBeInstanceOf(Date);
    expect(auditMock.writeAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: "PLACE_ARCHIVED", entityId: "place_1" }),
    );
  });
});

describe("admin report moderation", () => {
  it("updates the queue status and records the reviewer", async () => {
    prismaMock.facilityReport.update.mockResolvedValue({ id: "report_1", status: "ACTIONED" });
    const response = await reviewReport(
      jsonRequest("http://localhost:3000/api/admin/reports/report_1", "PATCH", {
        status: "ACTIONED",
        moderatorNote: "Called the facility; hours updated.",
      }),
      { params: Promise.resolve({ id: "report_1" }) },
    );
    expect(response.status).toBe(200);
    const updateArgs = prismaMock.facilityReport.update.mock.calls[0]?.[0];
    expect(updateArgs.data).toMatchObject({
      status: "ACTIONED",
      moderatorNote: "Called the facility; hours updated.",
      reviewedById: admin.id,
    });
    expect(updateArgs.data.reviewedAt).toBeInstanceOf(Date);
    expect(auditMock.writeAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: "REPORT_REVIEWED", entityId: "report_1" }),
    );
  });

  it("rejects an unknown status with 422", async () => {
    const response = await reviewReport(
      jsonRequest("http://localhost:3000/api/admin/reports/report_1", "PATCH", {
        status: "IGNORED",
      }),
      { params: Promise.resolve({ id: "report_1" }) },
    );
    expect(response.status).toBe(422);
    expect(prismaMock.facilityReport.update).not.toHaveBeenCalled();
  });

  it("returns 403 when the role is not allowed", async () => {
    authMock.requireApiUser.mockRejectedValueOnce(
      new authMock.ApiAuthError("You do not have permission to perform this action.", 403),
    );
    const response = await reviewReport(
      jsonRequest("http://localhost:3000/api/admin/reports/report_1", "PATCH", {
        status: "REVIEWED",
      }),
      { params: Promise.resolve({ id: "report_1" }) },
    );
    expect(response.status).toBe(403);
  });
});

describe("admin official alerts", () => {
  it("creates an ACTIVE advisory with a source and audit entry", async () => {
    prismaMock.officialAlert.create.mockResolvedValue({
      id: "alert_1",
      issuer: validAlert.issuer,
      title: validAlert.title,
    });
    const response = await createAlert(
      jsonRequest("http://localhost:3000/api/admin/alerts", "POST", validAlert),
    );
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ ok: true, id: "alert_1" });

    expect(authMock.requireApiUser).toHaveBeenCalledWith(["SUPER_ADMIN"]);
    const createArgs = prismaMock.officialAlert.create.mock.calls[0]?.[0];
    expect(createArgs.data).toMatchObject({
      status: "ACTIVE",
      createdById: admin.id,
      issuer: "DOST-PAGASA",
      sourceUrl: "https://www.pagasa.dost.gov.ph/",
    });
    expect(createArgs.data.issuedAt).toBeInstanceOf(Date);
    expect(auditMock.writeAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: "OFFICIAL_ALERT_CREATED", entityId: "alert_1" }),
    );
  });

  it("rejects an advisory whose expiry precedes its issue time", async () => {
    const response = await createAlert(
      jsonRequest("http://localhost:3000/api/admin/alerts", "POST", {
        ...validAlert,
        expiresAt: "2026-10-24T10:00:00+08:00",
      }),
    );
    expect(response.status).toBe(422);
    expect(prismaMock.officialAlert.create).not.toHaveBeenCalled();
  });

  it("marks an advisory expired and audits the change", async () => {
    prismaMock.officialAlert.update.mockResolvedValue({
      id: "alert_1",
      status: "EXPIRED",
      title: validAlert.title,
    });
    const response = await updateAlert(
      jsonRequest("http://localhost:3000/api/admin/alerts/alert_1", "PATCH", {
        status: "EXPIRED",
      }),
      { params: Promise.resolve({ id: "alert_1" }) },
    );
    expect(response.status).toBe(200);
    expect(prismaMock.officialAlert.update).toHaveBeenCalledWith({
      where: { id: "alert_1" },
      data: { status: "EXPIRED" },
    });
    expect(auditMock.writeAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: "OFFICIAL_ALERT_STATUS_CHANGED", entityId: "alert_1" }),
    );
  });

  it("rejects an invalid advisory status", async () => {
    const response = await updateAlert(
      jsonRequest("http://localhost:3000/api/admin/alerts/alert_1", "PATCH", {
        status: "DELETED",
      }),
      { params: Promise.resolve({ id: "alert_1" }) },
    );
    expect(response.status).toBe(422);
    expect(prismaMock.officialAlert.update).not.toHaveBeenCalled();
  });
});
