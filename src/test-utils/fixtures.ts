import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

export async function createTestShelter(overrides: Record<string, unknown> = {}) {
  return prisma.shelter.create({
    data: {
      name: "Test Shelter",
      phone: "5555555555",
      addressLine1: "1 Test St",
      city: "Testville",
      state: "CA",
      zipCode: "00000",
      isActive: true,
      ...overrides,
    },
  });
}

export async function createTestAnimal(shelterId: string, overrides: Record<string, unknown> = {}) {
  return prisma.animal.create({
    data: {
      shelterId,
      species: "DOG",
      gender: "UNKNOWN",
      size: "MEDIUM",
      weightLbs: 10,
      color: "brown",
      ...overrides,
    },
  });
}

export async function createTestListing(animalId: string, overrides: Record<string, unknown> = {}) {
  return prisma.listing.create({
    data: {
      animalId,
      urgency: "MED",
      status: "ACTIVE",
      riskReason: "TIME_LIMIT",
      notes: "test listing",
      ...overrides,
    },
  });
}

// Needed wherever an action writes createdById/changedById — those are real
// foreign keys into the User table, so a fake string id would violate the
// constraint. Email must be unique per call since tests may create several.
export async function createTestUser(overrides: Record<string, unknown> = {}) {
  return prisma.user.create({
    data: {
      email: `test-${randomUUID()}@test.com`,
      ...overrides,
    },
  });
}
