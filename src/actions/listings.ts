"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createListingSchema,
  CreateListingInput,
  updateListingStatusSchema,
  UpdateListingStatusInput,
} from "@/lib/validators";

async function requireAdmin() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function createListing(input: CreateListingInput) {
  const session = await requireAdmin();
  const data = createListingSchema.parse(input);
  const listing = await prisma.listing.create({
    data: {
      ...data,
      createdById: session.user?.id,
      statusHistory: {
        create: {
          toStatus: "ACTIVE",
          changedById: session.user?.id,
        },
      },
    },
  });
  revalidatePath("/admin/listings");
  revalidatePath("/listings");
  return listing;
}

export async function updateListingStatus(
  id: string,
  input: UpdateListingStatusInput
) {
  const session = await requireAdmin();
  const { status, reason } = updateListingStatusSchema.parse(input);

  const current = await prisma.listing.findUniqueOrThrow({ where: { id } });

  const listing = await prisma.listing.update({
    where: { id },
    data: {
      status,
      statusHistory: {
        create: {
          fromStatus: current.status,
          toStatus: status,
          reason,
          changedById: session.user?.id,
        },
      },
    },
  });
  revalidatePath("/admin/listings");
  revalidatePath("/listings");
  return listing;
}
