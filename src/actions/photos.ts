"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { deleteObjects, getPublicUrl, getUploadUrl } from "@/lib/r2";
import {
  ALLOWED_PHOTO_TYPES,
  ConfirmPhotoUploadInput,
  confirmPhotoUploadSchema,
  RequestPhotoUploadInput,
  requestPhotoUploadSchema,
} from "@/lib/validators";

async function requireAdmin() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  return session;
}

// Every mutation that touches an animal's isPrimary/sortOrder invariants
// (upload, delete, set primary, reorder) must go through this so they can
// never interleave with each other. The advisory lock is released
// automatically when the transaction ends.
async function withAnimalPhotoLock<T>(
  animalId: string,
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${animalId}))`;
    return fn(tx);
  });
}

// `satisfies` ties this to ALLOWED_PHOTO_TYPES: adding a new allowed type
// without an entry here is a compile error, not a silent ".undefined" key.
const EXTENSION_BY_TYPE = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} satisfies Record<(typeof ALLOWED_PHOTO_TYPES)[number], string>;

export async function requestPhotoUpload(input: RequestPhotoUploadInput) {
  await requireAdmin();
  const { animalId, contentType, fileSize } = requestPhotoUploadSchema.parse(input);

  const animal = await prisma.animal.findUnique({
    where: { id: animalId },
    select: { id: true },
  });
  if (!animal) throw new Error("Animal not found");

  const r2Key = `animals/${animalId}/${randomUUID()}.${EXTENSION_BY_TYPE[contentType]}`;
  const uploadUrl = await getUploadUrl(r2Key, contentType, fileSize);

  return { uploadUrl, r2Key };
}

export async function confirmPhotoUpload(input: ConfirmPhotoUploadInput) {
  await requireAdmin();
  const { animalId, r2Key, altText } = confirmPhotoUploadSchema.parse(input);

  const photo = await withAnimalPhotoLock(animalId, async (tx) => {
    // MAX(sortOrder) + 1 rather than count(): count assumes sortOrder is a
    // gap-free 0..N-1 sequence, which breaks as soon as a photo is deleted
    // from the middle (deletePhoto never renumbers survivors).
    const current = await tx.photo.aggregate({
      where: { animalId },
      _max: { sortOrder: true },
      _count: true,
    });

    return tx.photo.create({
      data: {
        animalId,
        r2Key,
        url: getPublicUrl(r2Key),
        altText,
        sortOrder: (current._max.sortOrder ?? -1) + 1,
        isPrimary: current._count === 0,
      },
    });
  });

  revalidatePath(`/admin/animals/${animalId}`);
  return photo;
}

export async function deletePhoto(id: string) {
  await requireAdmin();
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) throw new Error("Photo not found");

  await withAnimalPhotoLock(photo.animalId, async (tx) => {
    await tx.photo.delete({ where: { id } });

    if (photo.isPrimary) {
      const next = await tx.photo.findFirst({
        where: { animalId: photo.animalId },
        orderBy: { sortOrder: "asc" },
      });
      if (next) {
        await tx.photo.update({ where: { id: next.id }, data: { isPrimary: true } });
      }
    }
  });

  await deleteObjects([photo.r2Key]);

  revalidatePath(`/admin/animals/${photo.animalId}`);
}

export async function setPrimaryPhoto(id: string) {
  await requireAdmin();
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) throw new Error("Photo not found");

  await withAnimalPhotoLock(photo.animalId, async (tx) => {
    await tx.photo.updateMany({ where: { animalId: photo.animalId }, data: { isPrimary: false } });
    await tx.photo.update({ where: { id }, data: { isPrimary: true } });
  });

  revalidatePath(`/admin/animals/${photo.animalId}`);
}

export async function reorderPhotos(animalId: string, photoIds: string[]) {
  await requireAdmin();

  await withAnimalPhotoLock(animalId, async (tx) => {
    for (const [index, id] of photoIds.entries()) {
      await tx.photo.updateMany({ where: { id, animalId }, data: { sortOrder: index } });
    }
  });

  revalidatePath(`/admin/animals/${animalId}`);
}
