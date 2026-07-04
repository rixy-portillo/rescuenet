"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn, type PhotoPreview } from "@/lib/utils";

type Props = {
  photos: PhotoPreview[];
  fallbackAlt: string;
};

export function PhotoGallery({ photos, fallbackAlt }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (photos.length === 0) {
    return <div className="bg-gray-100 rounded-xl aspect-[4/3] w-full" />;
  }

  const active = photos[activeIndex];

  function showPrev() {
    setActiveIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
  }

  function showNext() {
    setActiveIndex((i) => (i === photos.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="space-y-2">
      <div className="relative bg-gray-100 rounded-xl aspect-[4/3] w-full overflow-hidden">
        <Image
          src={active.url}
          alt={fallbackAlt}
          fill
          className="object-cover"
          sizes="(min-width: 768px) 768px, 100vw"
          priority
        />
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPrev}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
            >
              <ChevronLeftIcon className="size-5" />
            </button>
            <button
              type="button"
              onClick={showNext}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
            >
              <ChevronRightIcon className="size-5" />
            </button>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <div className="flex justify-center gap-2">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show photo ${index + 1}`}
              className={cn(
                "relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border-2",
                index === activeIndex ? "border-primary" : "border-transparent"
              )}
            >
              <Image
                src={photo.url}
                alt={fallbackAlt}
                fill
                className="object-cover"
                sizes="56px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
