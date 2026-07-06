import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTestAnimal, createTestListing, createTestShelter, createTestUser } from "@/test-utils/fixtures";
import { createListing, updateListingStatus } from "./listings";

const mockedAuth = auth as unknown as ReturnType<typeof vi.fn>;

let userId: string;
let shelterId: string;
let animalId: string;

beforeEach(async () => {
  const user = await createTestUser();
  userId = user.id;
  mockedAuth.mockResolvedValue({ user: { id: userId, email: user.email } });

  const shelter = await createTestShelter();
  shelterId = shelter.id;
  const animal = await createTestAnimal(shelterId);
  animalId = animal.id;
});

afterEach(async () => {
  await prisma.shelter.deleteMany({ where: { id: shelterId } });
  await prisma.user.deleteMany({ where: { id: userId } });
  mockedAuth.mockReset();
});

describe("createListing", () => {
  it("creates a listing tied to the creating admin, with an initial ACTIVE status history entry", async () => {
    const listing = await createListing({
      animalId,
      urgency: "HIGH",
      riskReason: "SPACE",
      notes: "Needs a home fast.",
    });

    expect(listing.createdById).toBe(userId);

    const history = await prisma.statusHistory.findMany({ where: { listingId: listing.id } });
    expect(history).toHaveLength(1);
    expect(history[0].toStatus).toBe("ACTIVE");
    expect(history[0].fromStatus).toBeNull();
    expect(history[0].changedById).toBe(userId);
  });

  it("throws Unauthorized when there is no session", async () => {
    mockedAuth.mockResolvedValueOnce(null);
    await expect(
      createListing({ animalId, urgency: "HIGH", riskReason: "SPACE", notes: "test" })
    ).rejects.toThrow("Unauthorized");
  });
});

describe("updateListingStatus", () => {
  it("updates the status and records the transition in status history", async () => {
    const listing = await createTestListing(animalId, { status: "ACTIVE" });

    const updated = await updateListingStatus(listing.id, { status: "ADOPTED", reason: "Found a home" });
    expect(updated.status).toBe("ADOPTED");

    const history = await prisma.statusHistory.findMany({ where: { listingId: listing.id } });
    expect(history).toHaveLength(1);
    expect(history[0].fromStatus).toBe("ACTIVE");
    expect(history[0].toStatus).toBe("ADOPTED");
    expect(history[0].reason).toBe("Found a home");
    expect(history[0].changedById).toBe(userId);
  });

  it("throws if the listing doesn't exist", async () => {
    await expect(updateListingStatus("nonexistent", { status: "ADOPTED" })).rejects.toThrow();
  });
});
