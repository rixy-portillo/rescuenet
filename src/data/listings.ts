import { prisma } from "@/lib/prisma";

export async function getActiveListings() {
  return prisma.listing.findMany({
    where: { status: "ACTIVE" },
    include: {
      animal: {
        include: {
          shelter: { select: { name: true, city: true, state: true } },
          photos: { where: { isPrimary: true }, take: 1 },
        },
      },
    },
    orderBy: [{ urgency: "desc" }, { deadlineAt: "asc" }],
  });
}

export async function getListingById(id: string) {
  return prisma.listing.findUnique({
    where: { id },
    include: {
      animal: {
        include: {
          shelter: true,
          photos: { orderBy: { sortOrder: "asc" } },
        },
      },
      createdBy: { select: { name: true, email: true } },
    },
  });
}

export async function getListingWithHistory(id: string) {
  return prisma.listing.findUnique({
    where: { id },
    include: {
      animal: { include: { shelter: true } },
      statusHistory: {
        orderBy: { createdAt: "desc" },
        include: { changedBy: { select: { name: true } } },
      },
    },
  });
}

export async function getUrgentListings(limit: number) {
  return prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      animal: { shelter: { isActive: true } },
    },
    select: {
      id: true,
      urgency: true,
      deadlineAt: true,
      notes: true,
      animal: {
        select: {
          name: true,
          species: true,
          breed: true,
          shelter: { select: { name: true, city: true, state: true } },
        },
      },
    },
    orderBy: [{ urgency: "desc" }, { deadlineAt: "asc" }],
    take: limit,
  });
}

export async function getFilteredListings({
  species,
  urgency,
  state,
}: {
  species?: string[];
  urgency?: string[];
  state?: string;
} = {}) {
  return prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      ...(urgency?.length
        ? { urgency: { in: urgency as ("LOW" | "MED" | "HIGH" | "LAST_CALL")[] } }
        : {}),
      animal: {
        ...(species?.length ? { species: { in: species as ("DOG" | "CAT")[] } } : {}),
        shelter: {
          isActive: true,
          ...(state ? { state } : {}),
        },
      },
    },
    select: {
      id: true,
      urgency: true,
      deadlineAt: true,
      notes: true,
      animal: {
        select: {
          name: true,
          species: true,
          breed: true,
          shelter: { select: { name: true, city: true, state: true } },
        },
      },
    },
    orderBy: [{ urgency: "desc" }, { deadlineAt: "asc" }],
  });
}

export async function getAllListings({ showRemoved = false } = {}) {
  return prisma.listing.findMany({
    where: showRemoved
      ? { status: "REMOVED" }
      : { status: { not: "REMOVED" }, animal: { shelter: { isActive: true } } },
    include: {
      animal: {
        select: {
          name: true,
          species: true,
          breed: true,
          shelter: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
