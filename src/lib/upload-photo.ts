import { confirmPhotoUpload, requestPhotoUpload } from "@/actions/photos";
import { ALLOWED_PHOTO_TYPES, MAX_PHOTO_SIZE_BYTES } from "@/lib/validators";

export async function uploadPhotoToR2(animalId: string, file: File) {
  if (!ALLOWED_PHOTO_TYPES.includes(file.type as (typeof ALLOWED_PHOTO_TYPES)[number])) {
    throw new Error(`${file.name}: unsupported file type`);
  }
  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    throw new Error(`${file.name}: file is larger than 8MB`);
  }

  const { uploadUrl, r2Key } = await requestPhotoUpload({
    animalId,
    contentType: file.type as (typeof ALLOWED_PHOTO_TYPES)[number],
    fileSize: file.size,
  });

  const putResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!putResponse.ok) throw new Error(`${file.name}: upload failed`);

  return confirmPhotoUpload({ animalId, r2Key });
}
