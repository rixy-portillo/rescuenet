"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ALLOWED_PHOTO_TYPES, MAX_PHOTO_SIZE_BYTES } from "@/lib/validators";

export type PendingPhoto = {
  id: string;
  file: File;
  previewUrl: string;
};

type Props = {
  photos: PendingPhoto[];
  onChange: (photos: PendingPhoto[]) => void;
};

export function PendingPhotoPicker({ photos, onChange }: Props) {
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    const staged: PendingPhoto[] = [];
    for (const file of Array.from(files)) {
      if (!ALLOWED_PHOTO_TYPES.includes(file.type as (typeof ALLOWED_PHOTO_TYPES)[number])) {
        setError(`${file.name}: unsupported file type`);
        continue;
      }
      if (file.size > MAX_PHOTO_SIZE_BYTES) {
        setError(`${file.name}: file is larger than 8MB`);
        continue;
      }
      staged.push({ id: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file) });
    }

    onChange([...photos, ...staged]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleRemove(id: string) {
    const target = photos.find((p) => p.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    onChange(photos.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-3">
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {photos.map((photo, index) => (
            <div key={photo.id}>
              <div className="relative aspect-square rounded-md overflow-hidden border bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, next/image can't optimize blob: URLs */}
                <img
                  src={photo.previewUrl}
                  alt={`Photo ${index + 1} to upload`}
                  className="h-full w-full object-cover"
                />
                {index === 0 && (
                  <span className="absolute top-1 left-1 rounded bg-black/70 text-white text-[10px] px-1.5 py-0.5">
                    Primary
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemove(photo.id)}
                className="mt-1 text-xs text-red-600 hover:underline"
              >
                Remove
              </button>
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
          className="hidden"
        />
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          Add Photos
        </Button>
        <p className="text-xs text-muted-foreground mt-1">
          Photos upload after the animal is created.
        </p>
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>
    </div>
  );
}
