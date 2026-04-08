import { prisma } from "@/lib/prisma";

function serializeAnimal<T extends { weightLbs: unknown }>(animal: T) {
  return {
    ...animal,
    weightLbs: animal.weightLbs != null ? Number(animal.weightLbs) : null,
  };
}

export async function getAnimals() {
  const animals = await prisma.animal.findMany({
    where: { shelter: { isActive: true } },
    include: { shelter: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return animals.map(serializeAnimal);
}

export async function getAnimalById(id: string) {
  const animal = await prisma.animal.findUnique({
    where: { id },
    include: { shelter: true, photos: { orderBy: { sortOrder: "asc" } } },
  });
  return animal ? serializeAnimal(animal) : null;
}

export async function getAnimalsByShelter(shelterId: string) {
  const animals = await prisma.animal.findMany({
    where: { shelterId, shelter: { isActive: true } },
    include: { photos: { where: { isPrimary: true }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });
  return animals.map(serializeAnimal);
}
