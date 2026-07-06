import { afterEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { getAnimalById, getAnimals, getAnimalsByShelter } from "./animals";

let shelterIds: string[] = [];

afterEach(async () => {
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

async function createAnimal(shelterId: string, overrides: Record<string, unknown> = {}) {
  return prisma.animal.create({
    data: {
      shelterId,
      species: "DOG",
      gender: "UNKNOWN",
      size: "MEDIUM",
      weightLbs: 42.5,
      color: "brown",
      ...overrides,
    },
  });
}

describe("getAnimals", () => {
  it("serializes weightLbs from a Prisma Decimal to a plain number", async () => {
    const shelter = await createShelter();
    await createAnimal(shelter.id, { weightLbs: 42.5 });

    const results = await getAnimals();
    const found = results.find((a) => a.shelterId === shelter.id);
    expect(typeof found?.weightLbs).toBe("number");
    expect(found?.weightLbs).toBe(42.5);
  });

  it("excludes animals belonging to an inactive shelter", async () => {
    const shelter = await createShelter({ isActive: false });
    await createAnimal(shelter.id);

    const results = await getAnimals();
    expect(results.some((a) => a.shelterId === shelter.id)).toBe(false);
  });
});

describe("getAnimalById", () => {
  it("returns the animal with photos ordered by sortOrder", async () => {
    const shelter = await createShelter();
    const animal = await createAnimal(shelter.id);
    await prisma.photo.create({
      data: { animalId: animal.id, r2Key: "b.jpg", url: "https://example.com/b.jpg", sortOrder: 1 },
    });
    await prisma.photo.create({
      data: { animalId: animal.id, r2Key: "a.jpg", url: "https://example.com/a.jpg", sortOrder: 0 },
    });

    const result = await getAnimalById(animal.id);
    expect(result?.photos.map((p) => p.r2Key)).toEqual(["a.jpg", "b.jpg"]);
    expect(typeof result?.weightLbs).toBe("number");
  });

  it("returns null for a nonexistent animal", async () => {
    expect(await getAnimalById("nonexistent")).toBeNull();
  });
});

describe("getAnimalsByShelter", () => {
  it("returns only animals belonging to the given shelter", async () => {
    const shelterA = await createShelter();
    const shelterB = await createShelter();
    const animalA = await createAnimal(shelterA.id);
    await createAnimal(shelterB.id);

    const results = await getAnimalsByShelter(shelterA.id);
    expect(results.map((a) => a.id)).toEqual([animalA.id]);
  });

  it("returns nothing if the shelter itself is inactive", async () => {
    const shelter = await createShelter({ isActive: false });
    await createAnimal(shelter.id);

    const results = await getAnimalsByShelter(shelter.id);
    expect(results.length).toBe(0);
  });
});
