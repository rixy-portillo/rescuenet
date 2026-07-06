import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => ({ user: { id: "admin_test", email: "admin@test.com" } })),
}));

vi.mock("@/lib/r2", () => ({
  deleteObjects: vi.fn(async () => {}),
}));

import { auth } from "@/lib/auth";
import { deleteObjects } from "@/lib/r2";
import { prisma } from "@/lib/prisma";
import { createTestAnimal, createTestListing, createTestShelter } from "@/test-utils/fixtures";
import { createAnimal, deleteAnimal, updateAnimal } from "./animals";

const mockedAuth = auth as unknown as ReturnType<typeof vi.fn>;

let shelterId: string;

beforeEach(async () => {
  const shelter = await createTestShelter();
  shelterId = shelter.id;
});

afterEach(async () => {
  await prisma.shelter.deleteMany({ where: { id: shelterId } });
  mockedAuth.mockClear();
  vi.mocked(deleteObjects).mockClear();
});

describe("createAnimal", () => {
  it("creates an animal and returns its id", async () => {
    const result = await createAnimal({
      shelterId,
      species: "DOG",
      gender: "MALE",
      size: "MEDIUM",
      weightLbs: 20,
      color: "black",
    });

    const created = await prisma.animal.findUnique({ where: { id: result.id } });
    expect(created?.color).toBe("black");
  });

  it("throws Unauthorized when there is no session", async () => {
    mockedAuth.mockResolvedValueOnce(null);
    await expect(
      createAnimal({
        shelterId,
        species: "DOG",
        gender: "MALE",
        size: "MEDIUM",
        weightLbs: 20,
        color: "black",
      })
    ).rejects.toThrow("Unauthorized");
  });

  it("rejects invalid input via the Zod schema", async () => {
    await expect(
      createAnimal({
        shelterId,
        species: "DOG",
        gender: "MALE",
        size: "MEDIUM",
        weightLbs: 20,
        color: "",
      })
    ).rejects.toThrow();
  });
});

describe("updateAnimal", () => {
  it("updates only the given fields, leaving the rest untouched", async () => {
    const animal = await createTestAnimal(shelterId, { color: "brown", name: "Rex" });

    await updateAnimal(animal.id, { color: "white" });

    const updated = await prisma.animal.findUnique({ where: { id: animal.id } });
    expect(updated?.color).toBe("white");
    expect(updated?.name).toBe("Rex");
  });
});

describe("deleteAnimal", () => {
  it("deletes the animal and cleans up its photos' R2 objects", async () => {
    const animal = await createTestAnimal(shelterId);
    await prisma.photo.create({
      data: { animalId: animal.id, r2Key: "animals/x/a.jpg", url: "https://example.com/a.jpg" },
    });

    await deleteAnimal(animal.id);

    const found = await prisma.animal.findUnique({ where: { id: animal.id } });
    expect(found).toBeNull();
    expect(deleteObjects).toHaveBeenCalledWith(["animals/x/a.jpg"]);
  });

  it("throws if the animal has an active listing", async () => {
    const animal = await createTestAnimal(shelterId);
    await createTestListing(animal.id, { status: "ACTIVE" });

    await expect(deleteAnimal(animal.id)).rejects.toThrow(
      "Cannot delete an animal with active listings. Close the listings first."
    );
  });

  it("allows deletion when the animal's listings are not ACTIVE", async () => {
    const animal = await createTestAnimal(shelterId);
    await createTestListing(animal.id, { status: "ADOPTED" });

    await deleteAnimal(animal.id);

    const found = await prisma.animal.findUnique({ where: { id: animal.id } });
    expect(found).toBeNull();
  });
});
