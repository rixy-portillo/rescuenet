import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTestAnimal, createTestListing, createTestShelter, createTestUser } from "@/test-utils/fixtures";
import { createShelter, deactivateShelter, reactivateShelter, updateShelter } from "./shelters";

const mockedAuth = auth as unknown as ReturnType<typeof vi.fn>;

let userId: string;
let shelterId: string;

beforeEach(async () => {
  const user = await createTestUser();
  userId = user.id;
  mockedAuth.mockResolvedValue({ user: { id: userId, email: user.email } });
});

afterEach(async () => {
  if (shelterId) await prisma.shelter.deleteMany({ where: { id: shelterId } });
  await prisma.user.deleteMany({ where: { id: userId } });
  mockedAuth.mockReset();
});

describe("createShelter", () => {
  it("creates a shelter and returns its id", async () => {
    const result = await createShelter({
      name: "New Shelter",
      phone: "5551234567",
      addressLine1: "1 Main St",
      city: "Springfield",
      state: "CA",
      zipCode: "90210",
    });
    shelterId = result.id;

    const created = await prisma.shelter.findUnique({ where: { id: result.id } });
    expect(created?.name).toBe("New Shelter");
  });

  it("throws Unauthorized when there is no session", async () => {
    mockedAuth.mockResolvedValueOnce(null);
    await expect(
      createShelter({
        name: "New Shelter",
        phone: "5551234567",
        addressLine1: "1 Main St",
        city: "Springfield",
        state: "CA",
        zipCode: "90210",
      })
    ).rejects.toThrow("Unauthorized");
  });
});

describe("updateShelter", () => {
  it("updates only the given fields, leaving the rest untouched", async () => {
    const shelter = await createTestShelter({ name: "Old Name", city: "Old City" });
    shelterId = shelter.id;

    await updateShelter(shelter.id, { name: "New Name" });

    const updated = await prisma.shelter.findUnique({ where: { id: shelter.id } });
    expect(updated?.name).toBe("New Name");
    expect(updated?.city).toBe("Old City");
  });
});

describe("reactivateShelter", () => {
  it("sets isActive back to true", async () => {
    const shelter = await createTestShelter({ isActive: false });
    shelterId = shelter.id;

    await reactivateShelter(shelter.id);

    const updated = await prisma.shelter.findUnique({ where: { id: shelter.id } });
    expect(updated?.isActive).toBe(true);
  });
});

describe("deactivateShelter", () => {
  it("deactivates the shelter and closes only its ACTIVE listings", async () => {
    const shelter = await createTestShelter();
    shelterId = shelter.id;
    const animal = await createTestAnimal(shelter.id);
    const activeListing = await createTestListing(animal.id, { status: "ACTIVE" });
    const adoptedListing = await createTestListing(animal.id, { status: "ADOPTED" });

    await deactivateShelter(shelter.id);

    const [updatedShelter, updatedActive, updatedAdopted, history] = await Promise.all([
      prisma.shelter.findUnique({ where: { id: shelter.id } }),
      prisma.listing.findUnique({ where: { id: activeListing.id } }),
      prisma.listing.findUnique({ where: { id: adoptedListing.id } }),
      prisma.statusHistory.findMany({ where: { listingId: activeListing.id } }),
    ]);

    expect(updatedShelter?.isActive).toBe(false);
    expect(updatedActive?.status).toBe("REMOVED");
    expect(updatedAdopted?.status).toBe("ADOPTED");
    expect(history).toHaveLength(1);
    expect(history[0].reason).toBe("Shelter deactivated");
    expect(history[0].changedById).toBe(userId);
  });
});
