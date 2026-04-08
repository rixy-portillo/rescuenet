import { prisma } from "@/lib/prisma";

export async function getShelters() {
  return prisma.shelter.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function getInactiveShelters() {
  return prisma.shelter.findMany({
    where: { isActive: false },
    orderBy: { name: "asc" },
  });
}

export async function getShelterById(id: string) {
  return prisma.shelter.findUnique({ where: { id } });
}
