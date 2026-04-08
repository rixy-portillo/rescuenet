"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateAnimalInput, createAnimalSchema } from "@/lib/validators";

async function requireAdmin() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function createAnimal(input: CreateAnimalInput) {
  await requireAdmin();
  const data = createAnimalSchema.parse(input);
  const animal = await prisma.animal.create({ data });
  revalidatePath("/admin/animals");
  return { id: animal.id };
}

export async function updateAnimal(id: string, input: Partial<CreateAnimalInput>) {
  await requireAdmin();
  const data = createAnimalSchema.partial().parse(input);
  await prisma.animal.update({ where: { id }, data });
  revalidatePath("/admin/animals");
  return { id };
}

export async function deleteAnimal(id: string) {
  await requireAdmin();
  const activeListings = await prisma.listing.count({
    where: { animalId: id, status: "ACTIVE" },
  });
  if (activeListings > 0) {
    throw new Error("Cannot delete an animal with active listings. Close the listings first.");
  }
  await prisma.animal.delete({ where: { id } });
  revalidatePath("/admin/animals");
  redirect("/admin/animals");
}
