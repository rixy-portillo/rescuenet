"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { deletePhoto, reorderPhotos, setPrimaryPhoto } from "@/actions/photos";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadPhotoToR2 } from "@/lib/upload-photo";
import { ALLOWED_PHOTO_TYPES } from "@/lib/validators";

type Photo = {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
};

type Props = {
  animalId: string;
  photos: Photo[];
};

function sortByPrimary(list: Photo[]) {
  return [...list].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
}

export function PhotoUploader({ animalId, photos: initialPhotos }: Props) {
  const [photos, setPhotos] = useState(() => sortByPrimary(initialPhotos));
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const photo = await uploadPhotoToR2(animalId, file);
        setPhotos((prev) => sortByPrimary([...prev, photo]));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this photo?")) return;
    setPhotos((prev) => {
      const deleted = prev.find((p) => p.id === id);
      const remaining = prev.filter((p) => p.id !== id);
      if (deleted?.isPrimary && remaining.length > 0) {
        remaining[0] = { ...remaining[0], isPrimary: true };
      }
      return sortByPrimary(remaining);
    });
    startTransition(async () => {
      try {
        await deletePhoto(id);
      } catch {
        setError("Failed to delete photo.");
      }
    });
  }

  function handleSetPrimary(id: string) {
    setPhotos((prev) => sortByPrimary(prev.map((p) => ({ ...p, isPrimary: p.id === id }))));
    startTransition(async () => {
      try {
        await setPrimaryPhoto(id);
      } catch {
        setError("Failed to set primary photo.");
      }
    });
  }

  function handleDragOver(e: React.DragEvent, overId: string) {
    e.preventDefault();
    if (!draggingId || draggingId === overId) return;
    // The primary photo is pinned first; nothing can be dragged before it.
    if (photos.find((p) => p.id === overId)?.isPrimary) return;

    setPhotos((prev) => {
      const fromIndex = prev.findIndex((p) => p.id === draggingId);
      const toIndex = prev.findIndex((p) => p.id === overId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }

  function handleDragEnd() {
    setDraggingId(null);
    startTransition(async () => {
      try {
        await reorderPhotos(
          animalId,
          photos.map((p) => p.id)
        );
      } catch {
        setError("Failed to save photo order.");
      }
    });
  }

  return (
    <div className="space-y-3">
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              draggable={!photo.isPrimary}
              onDragStart={() => setDraggingId(photo.id)}
              onDragOver={(e) => handleDragOver(e, photo.id)}
              onDragEnd={handleDragEnd}
              className={cn(
                !photo.isPrimary && "cursor-grab active:cursor-grabbing",
                draggingId === photo.id && "opacity-50"
              )}
            >
              <div className="relative aspect-square rounded-md overflow-hidden border bg-gray-100">
                <Image
                  src={photo.url}
                  alt={photo.altText ?? "Animal photo"}
                  fill
                  className="object-cover pointer-events-none"
                  sizes="150px"
                />
                {photo.isPrimary && (
                  <span className="absolute top-1 left-1 rounded bg-black/70 text-white text-[10px] px-1.5 py-0.5">
                    Primary
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                {!photo.isPrimary ? (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(photo.id)}
                    disabled={isPending}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    Set primary
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(photo.id)}
                  disabled={isPending}
                  className="text-xs text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_PHOTO_TYPES.join(",")}
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Add Photos"}
        </Button>
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>
    </div>
  );
}
