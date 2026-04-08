"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createShelterSchema, CreateShelterInput } from "@/lib/validators";

async function requireAdmin() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function createShelter(input: CreateShelterInput) {
  await requireAdmin();
  const data = createShelterSchema.parse(input);
  const shelter = await prisma.shelter.create({ data });
  revalidatePath("/admin/shelters");
  return { id: shelter.id };
}

export async function updateShelter(id: string, input: Partial<CreateShelterInput>) {
  await requireAdmin();
  const data = createShelterSchema.partial().parse(input);
  await prisma.shelter.update({ where: { id }, data });
  revalidatePath("/admin/shelters");
  return { id };
}

export async function reactivateShelter(id: string) {
  await requireAdmin();
  await prisma.shelter.update({ where: { id }, data: { isActive: true } });
  revalidatePath("/admin/shelters");
  redirect("/admin/shelters");
}

export async function deactivateShelter(id: string) {
  const session = await requireAdmin();

  // Find all active listings for animals in this shelter
  const activeListings = await prisma.listing.findMany({
    where: { status: "ACTIVE", animal: { shelterId: id } },
    select: { id: true, status: true },
  });

  // Close each active listing and record status history
  await prisma.$transaction([
    ...activeListings.map((listing) =>
      prisma.listing.update({
        where: { id: listing.id },
        data: {
          status: "REMOVED",
          statusHistory: {
            create: {
              fromStatus: listing.status,
              toStatus: "REMOVED",
              reason: "Shelter deactivated",
              changedById: session.user?.id,
            },
          },
        },
      })
    ),
    prisma.shelter.update({ where: { id }, data: { isActive: false } }),
  ]);

  revalidatePath("/admin/shelters");
  revalidatePath("/listings");
  redirect("/admin/shelters");
}
