import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// revalidatePath requires a live Next.js request context (it throws
// "static generation store missing" otherwise) — irrelevant to what these
// tests verify, so it's mocked out like any other framework runtime hook.
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => ({ user: { id: "admin_test", email: "admin@test.com" } })),
}));

vi.mock("@/lib/r2", () => ({
  getUploadUrl: vi.fn(async (key: string) => `https://example.com/upload/${key}`),
  deleteObjects: vi.fn(async () => {}),
  getPublicUrl: vi.fn((key: string) => `https://example.com/${key}`),
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  confirmPhotoUpload,
  deletePhoto,
  requestPhotoUpload,
  reorderPhotos,
  setPrimaryPhoto,
} from "./photos";

// next-auth's `auth` export has an overloaded signature (it can also act as
// middleware), which trips up vi.mocked()'s type inference against our
// simple mock factory above — cast once here instead of at every call site.
const mockedAuth = auth as unknown as ReturnType<typeof vi.fn>;

let shelterId: string;
let animalId: string;

beforeEach(async () => {
  const shelter = await prisma.shelter.create({
    data: {
      name: "Integration Test Shelter",
      phone: "5555555555",
      addressLine1: "1 Test St",
      city: "Testville",
      state: "CA",
      zipCode: "00000",
    },
  });
  shelterId = shelter.id;

  const animal = await prisma.animal.create({
    data: {
      shelterId,
      species: "DOG",
      gender: "UNKNOWN",
      size: "MEDIUM",
      weightLbs: 10,
      color: "brown",
    },
  });
  animalId = animal.id;
});

afterEach(async () => {
  await prisma.animal.deleteMany({ where: { shelterId } });
  await prisma.shelter.deleteMany({ where: { id: shelterId } });
  mockedAuth.mockClear();
});

describe("requestPhotoUpload", () => {
  it("returns an upload URL and an r2Key scoped to the animal", async () => {
    const result = await requestPhotoUpload({ animalId, contentType: "image/jpeg", fileSize: 1000 });
    expect(result.uploadUrl).toContain("https://");
    expect(result.r2Key).toContain(animalId);
  });

  it("throws if the animal doesn't exist", async () => {
    await expect(
      requestPhotoUpload({ animalId: "nonexistent", contentType: "image/jpeg", fileSize: 1000 })
    ).rejects.toThrow("Animal not found");
  });

  it("throws Unauthorized when there is no session", async () => {
    mockedAuth.mockResolvedValueOnce(null);
    await expect(
      requestPhotoUpload({ animalId, contentType: "image/jpeg", fileSize: 1000 })
    ).rejects.toThrow("Unauthorized");
  });
});

describe("confirmPhotoUpload", () => {
  it("makes the first photo for an animal primary at sortOrder 0", async () => {
    const photo = await confirmPhotoUpload({ animalId, r2Key: "animals/x/a.jpg" });
    expect(photo.isPrimary).toBe(true);
    expect(photo.sortOrder).toBe(0);
  });

  it("does not make a second photo primary, and increments sortOrder", async () => {
    await confirmPhotoUpload({ animalId, r2Key: "animals/x/a.jpg" });
    const second = await confirmPhotoUpload({ animalId, r2Key: "animals/x/b.jpg" });
    expect(second.isPrimary).toBe(false);
    expect(second.sortOrder).toBe(1);
  });

  it("assigns sortOrder from MAX+1, so deleting a middle photo leaves no collision", async () => {
    const p1 = await confirmPhotoUpload({ animalId, r2Key: "a.jpg" });
    await confirmPhotoUpload({ animalId, r2Key: "b.jpg" });
    await deletePhoto(p1.id);
    const p3 = await confirmPhotoUpload({ animalId, r2Key: "c.jpg" });

    const photos = await prisma.photo.findMany({ where: { animalId } });
    const sortOrders = photos.map((p) => p.sortOrder);
    expect(new Set(sortOrders).size).toBe(sortOrders.length);
    expect(p3.sortOrder).toBe(2);
  });

  it("never produces two primaries or duplicate sortOrder under concurrent uploads", async () => {
    const results = await Promise.allSettled(
      Array.from({ length: 8 }, (_, i) => confirmPhotoUpload({ animalId, r2Key: `race-${i}.jpg` }))
    );
    expect(results.every((r) => r.status === "fulfilled")).toBe(true);

    const photos = await prisma.photo.findMany({ where: { animalId } });
    const primaryCount = photos.filter((p) => p.isPrimary).length;
    const sortOrders = photos.map((p) => p.sortOrder);
    expect(primaryCount).toBe(1);
    expect(new Set(sortOrders).size).toBe(sortOrders.length);
  });
});

describe("deletePhoto", () => {
  it("promotes the next photo to primary when the primary is deleted", async () => {
    const p1 = await confirmPhotoUpload({ animalId, r2Key: "a.jpg" });
    const p2 = await confirmPhotoUpload({ animalId, r2Key: "b.jpg" });

    await deletePhoto(p1.id);

    const remaining = await prisma.photo.findUnique({ where: { id: p2.id } });
    expect(remaining?.isPrimary).toBe(true);
  });

  it("throws if the photo doesn't exist", async () => {
    await expect(deletePhoto("nonexistent")).rejects.toThrow("Photo not found");
  });

  it("stays consistent when a delete races a concurrent upload for the same animal", async () => {
    const p1 = await confirmPhotoUpload({ animalId, r2Key: "primary.jpg" });
    await confirmPhotoUpload({ animalId, r2Key: "second.jpg" });

    await Promise.allSettled([
      deletePhoto(p1.id),
      confirmPhotoUpload({ animalId, r2Key: "racer.jpg" }),
    ]);

    const photos = await prisma.photo.findMany({ where: { animalId } });
    const primaryCount = photos.filter((p) => p.isPrimary).length;
    const sortOrders = photos.map((p) => p.sortOrder);
    expect(primaryCount).toBe(1);
    expect(new Set(sortOrders).size).toBe(sortOrders.length);
  });
});

describe("setPrimaryPhoto", () => {
  it("moves primary status to the target photo and clears it elsewhere", async () => {
    const p1 = await confirmPhotoUpload({ animalId, r2Key: "a.jpg" });
    const p2 = await confirmPhotoUpload({ animalId, r2Key: "b.jpg" });

    await setPrimaryPhoto(p2.id);

    const [refreshed1, refreshed2] = await Promise.all([
      prisma.photo.findUnique({ where: { id: p1.id } }),
      prisma.photo.findUnique({ where: { id: p2.id } }),
    ]);
    expect(refreshed1?.isPrimary).toBe(false);
    expect(refreshed2?.isPrimary).toBe(true);
  });
});

describe("reorderPhotos", () => {
  it("assigns sortOrder to match the given id order", async () => {
    const p1 = await confirmPhotoUpload({ animalId, r2Key: "a.jpg" });
    const p2 = await confirmPhotoUpload({ animalId, r2Key: "b.jpg" });
    const p3 = await confirmPhotoUpload({ animalId, r2Key: "c.jpg" });

    await reorderPhotos(animalId, [p3.id, p1.id, p2.id]);

    const photos = await prisma.photo.findMany({ where: { animalId }, orderBy: { sortOrder: "asc" } });
    expect(photos.map((p) => p.id)).toEqual([p3.id, p1.id, p2.id]);
  });

  it("ignores ids that don't belong to the given animal", async () => {
    const otherAnimal = await prisma.animal.create({
      data: { shelterId, species: "CAT", gender: "UNKNOWN", size: "SMALL", weightLbs: 5, color: "black" },
    });
    const foreignPhoto = await confirmPhotoUpload({ animalId: otherAnimal.id, r2Key: "foreign.jpg" });
    const ownPhoto = await confirmPhotoUpload({ animalId, r2Key: "own.jpg" });

    await reorderPhotos(animalId, [foreignPhoto.id, ownPhoto.id]);

    const unchanged = await prisma.photo.findUnique({ where: { id: foreignPhoto.id } });
    expect(unchanged?.sortOrder).toBe(0);

    await prisma.animal.delete({ where: { id: otherAnimal.id } });
  });
});
