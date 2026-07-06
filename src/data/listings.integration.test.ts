import { afterEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  getActiveListings,
  getAllListings,
  getFilteredListings,
  getListingById,
  getListingWithHistory,
  getUrgentListings,
} from "./listings";

type Species = "DOG" | "CAT";
type Urgency = "LOW" | "MED" | "HIGH" | "LAST_CALL";
type Status = "ACTIVE" | "RESCUED" | "ADOPTED" | "TRANSFERRED" | "EUTHANIZED" | "REMOVED";

let shelterIds: string[] = [];

afterEach(async () => {
  // Deleting the shelter cascades to its animals, then to listings/photos.
  await prisma.shelter.deleteMany({ where: { id: { in: shelterIds } } });
  shelterIds = [];
});

async function createShelter(overrides: Record<string, unknown> = {}) {
  const shelter = await prisma.shelter.create({
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
  shelterIds.push(shelter.id);
  return shelter;
}

async function createListing({
  shelterOverrides = {},
  species = "DOG",
  urgency = "MED",
  status = "ACTIVE",
  deadlineAt,
}: {
  shelterOverrides?: Record<string, unknown>;
  species?: Species;
  urgency?: Urgency;
  status?: Status;
  deadlineAt?: Date;
} = {}) {
  const shelter = await createShelter(shelterOverrides);
  const animal = await prisma.animal.create({
    data: {
      shelterId: shelter.id,
      species,
      gender: "UNKNOWN",
      size: "MEDIUM",
      weightLbs: 10,
      color: "brown",
    },
  });
  const listing = await prisma.listing.create({
    data: {
      animalId: animal.id,
      urgency,
      status,
      riskReason: "TIME_LIMIT",
      notes: "test listing",
      deadlineAt,
    },
  });
  return { shelter, animal, listing };
}

describe("getFilteredListings", () => {
  it("returns only ACTIVE listings by default", async () => {
    const { listing: active } = await createListing({ status: "ACTIVE" });
    await createListing({ status: "ADOPTED" });

    const results = await getFilteredListings();
    expect(results.map((r) => r.id)).toEqual([active.id]);
  });

  it("excludes listings whose shelter is inactive", async () => {
    await createListing({ shelterOverrides: { isActive: false } });

    const results = await getFilteredListings();
    expect(results.length).toBe(0);
  });

  it("filters by species", async () => {
    const { listing: dog } = await createListing({ species: "DOG" });
    await createListing({ species: "CAT" });

    const results = await getFilteredListings({ species: ["DOG"] });
    expect(results.map((r) => r.id)).toEqual([dog.id]);
  });

  it("filters by urgency, supporting multiple values", async () => {
    const { listing: high } = await createListing({ urgency: "HIGH" });
    const { listing: lastCall } = await createListing({ urgency: "LAST_CALL" });
    await createListing({ urgency: "LOW" });

    const results = await getFilteredListings({ urgency: ["HIGH", "LAST_CALL"] });
    expect(results.map((r) => r.id).sort()).toEqual([high.id, lastCall.id].sort());
  });

  it("filters by shelter state", async () => {
    const { listing: ca } = await createListing({ shelterOverrides: { state: "CA" } });
    await createListing({ shelterOverrides: { state: "TX" } });

    const results = await getFilteredListings({ state: "CA" });
    expect(results.map((r) => r.id)).toEqual([ca.id]);
  });

  it("combines species, urgency, and state filters together", async () => {
    const { listing: match } = await createListing({
      species: "CAT",
      urgency: "HIGH",
      shelterOverrides: { state: "NY" },
    });
    await createListing({ species: "DOG", urgency: "HIGH", shelterOverrides: { state: "NY" } });
    await createListing({ species: "CAT", urgency: "LOW", shelterOverrides: { state: "NY" } });
    await createListing({ species: "CAT", urgency: "HIGH", shelterOverrides: { state: "TX" } });

    const results = await getFilteredListings({ species: ["CAT"], urgency: ["HIGH"], state: "NY" });
    expect(results.map((r) => r.id)).toEqual([match.id]);
  });

  it("orders by urgency descending, then soonest deadline first", async () => {
    const now = Date.now();
    const { listing: low } = await createListing({ urgency: "LOW" });
    const { listing: highLater } = await createListing({
      urgency: "HIGH",
      deadlineAt: new Date(now + 5 * 24 * 60 * 60 * 1000),
    });
    const { listing: highSooner } = await createListing({
      urgency: "HIGH",
      deadlineAt: new Date(now + 1 * 24 * 60 * 60 * 1000),
    });

    const results = await getFilteredListings();
    expect(results.map((r) => r.id)).toEqual([highSooner.id, highLater.id, low.id]);
  });
});

describe("getActiveListings", () => {
  it("returns only ACTIVE listings with their primary photo slot included", async () => {
    const { listing } = await createListing({ status: "ACTIVE" });
    await createListing({ status: "REMOVED" });

    const results = await getActiveListings();
    expect(results.map((r) => r.id)).toEqual([listing.id]);
    expect(results[0].animal.photos).toEqual([]);
  });
});

describe("getUrgentListings", () => {
  it("respects the limit and excludes inactive shelters", async () => {
    await createListing({ urgency: "LAST_CALL" });
    await createListing({ urgency: "HIGH" });
    await createListing({ urgency: "MED", shelterOverrides: { isActive: false } });

    const results = await getUrgentListings(1);
    expect(results.length).toBe(1);
    expect(results[0].urgency).toBe("LAST_CALL");
  });
});

describe("getAllListings", () => {
  it("excludes REMOVED listings by default", async () => {
    const { listing: active } = await createListing({ status: "ACTIVE" });
    await createListing({ status: "REMOVED" });

    const results = await getAllListings();
    expect(results.map((r) => r.id)).toEqual([active.id]);
  });

  it("returns only REMOVED listings when showRemoved is true", async () => {
    await createListing({ status: "ACTIVE" });
    const { listing: removed } = await createListing({ status: "REMOVED" });

    const results = await getAllListings({ showRemoved: true });
    expect(results.map((r) => r.id)).toEqual([removed.id]);
  });
});

describe("getListingById", () => {
  it("returns the listing with photos ordered by sortOrder", async () => {
    const { listing, animal } = await createListing();
    await prisma.photo.create({
      data: { animalId: animal.id, r2Key: "b.jpg", url: "https://example.com/b.jpg", sortOrder: 1 },
    });
    await prisma.photo.create({
      data: { animalId: animal.id, r2Key: "a.jpg", url: "https://example.com/a.jpg", sortOrder: 0 },
    });

    const result = await getListingById(listing.id);
    expect(result?.animal.photos.map((p) => p.r2Key)).toEqual(["a.jpg", "b.jpg"]);
  });

  it("returns null for a nonexistent listing", async () => {
    expect(await getListingById("nonexistent")).toBeNull();
  });
});

describe("getListingWithHistory", () => {
  it("returns status history ordered newest first", async () => {
    const { listing } = await createListing();
    await prisma.statusHistory.create({ data: { listingId: listing.id, toStatus: "ACTIVE" } });
    await new Promise((resolve) => setTimeout(resolve, 10));
    await prisma.statusHistory.create({
      data: { listingId: listing.id, fromStatus: "ACTIVE", toStatus: "RESCUED" },
    });

    const result = await getListingWithHistory(listing.id);
    expect(result?.statusHistory.map((h) => h.toStatus)).toEqual(["RESCUED", "ACTIVE"]);
  });
});
