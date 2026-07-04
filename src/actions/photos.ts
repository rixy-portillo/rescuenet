"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
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

  const photoCount = await prisma.photo.count({ where: { animalId } });

  const photo = await prisma.photo.create({
    data: {
      animalId,
      r2Key,
      url: getPublicUrl(r2Key),
      altText,
      sortOrder: photoCount,
      isPrimary: photoCount === 0,
    },
  });

  revalidatePath(`/admin/animals/${animalId}`);
  return photo;
}

export async function deletePhoto(id: string) {
  await requireAdmin();
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) throw new Error("Photo not found");

  await prisma.photo.delete({ where: { id } });
  await deleteObjects([photo.r2Key]);

  if (photo.isPrimary) {
    const next = await prisma.photo.findFirst({
      where: { animalId: photo.animalId },
      orderBy: { sortOrder: "asc" },
    });
    if (next) {
      await prisma.photo.update({ where: { id: next.id }, data: { isPrimary: true } });
    }
  }

  revalidatePath(`/admin/animals/${photo.animalId}`);
}

export async function setPrimaryPhoto(id: string) {
  await requireAdmin();
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) throw new Error("Photo not found");

  await prisma.$transaction([
    prisma.photo.updateMany({ where: { animalId: photo.animalId }, data: { isPrimary: false } }),
    prisma.photo.update({ where: { id }, data: { isPrimary: true } }),
  ]);

  revalidatePath(`/admin/animals/${photo.animalId}`);
}

export async function reorderPhotos(animalId: string, photoIds: string[]) {
  await requireAdmin();

  await prisma.$transaction(
    photoIds.map((id, index) =>
      prisma.photo.updateMany({ where: { id, animalId }, data: { sortOrder: index } })
    )
  );

  revalidatePath(`/admin/animals/${animalId}`);
}
