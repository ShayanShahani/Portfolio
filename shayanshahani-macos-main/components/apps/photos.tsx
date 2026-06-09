"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface PhotosProps {
  isDarkMode?: boolean;
}

export default function Photos({ isDarkMode = true }: PhotosProps) {
  const photos = [
    {
      id: 1,
      src: "/photo-1.jpg",
      title: "Photo 1",
    },
    {
      id: 2,
      src: "/photo-2.jpg",
      title: "Photo 2",
    },
  ];

  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [openedPhotoIndex, setOpenedPhotoIndex] = useState<number | null>(null);

  const bgColor = isDarkMode ? "bg-zinc-900" : "bg-white";
  const textColor = isDarkMode ? "text-white" : "text-zinc-900";

  const borderColor = isDarkMode ? "border-zinc-700" : "border-zinc-200";

  const currentPhoto =
    openedPhotoIndex !== null ? photos[openedPhotoIndex] : null;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (openedPhotoIndex === null) return;

      if (e.key === "Escape") {
        setOpenedPhotoIndex(null);
      }

      if (e.key === "ArrowRight") {
        setOpenedPhotoIndex((openedPhotoIndex + 1) % photos.length);
      }

      if (e.key === "ArrowLeft") {
        setOpenedPhotoIndex(
          (openedPhotoIndex - 1 + photos.length) % photos.length,
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openedPhotoIndex, photos.length]);

  return (
    <div
      className={`h-full flex flex-col ${bgColor} ${textColor}`}
      onClick={() => setSelectedPhoto(null)}
    >
      {/* Toolbar */}
      <div
        className={`h-12 px-4 border-b ${borderColor} flex items-center justify-between`}
      >
        <h2 className="font-medium">Photos</h2>

        <div className="text-xs text-zinc-500">{photos.length} Photos</div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-3 gap-6">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPhoto(photo.id);
              }}
              onDoubleClick={() => setOpenedPhotoIndex(index)}
            >
              {/* Selection only around image */}
              <div
                className={`
                  relative
                  aspect-square
                  overflow-hidden
                  rounded-xl
                  transition-all duration-200
                  ${
                    selectedPhoto === photo.id
                      ? "ring-2 ring-blue-500 scale-[1.02]"
                      : "hover:scale-[1.02]"
                  }
                `}
              >
                <Image
                  src={photo.src}
                  alt={photo.title}
                  fill
                  className="object-cover"
                />
              </div>

              <p className="mt-2 text-sm text-center text-zinc-500">
                {photo.title}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      {currentPhoto && (
        <div
          className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300"
          onClick={() => setOpenedPhotoIndex(null)}
        >
          {/* Close */}
          <button
            className="absolute top-5 right-6 text-white text-3xl hover:opacity-70 transition"
            onClick={() => setOpenedPhotoIndex(null)}
          >
            ×
          </button>

          {/* Previous */}
          {photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenedPhotoIndex(
                  (openedPhotoIndex! - 1 + photos.length) % photos.length,
                );
              }}
              className="absolute left-5 text-white text-5xl hover:opacity-70 transition"
            >
              ‹
            </button>
          )}

          {/* Next */}
          {photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenedPhotoIndex((openedPhotoIndex! + 1) % photos.length);
              }}
              className="absolute right-5 text-white text-5xl hover:opacity-70 transition"
            >
              ›
            </button>
          )}

          {/* Image */}
          <div
            className="relative w-[85%] h-[85%] animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentPhoto.src}
              alt={currentPhoto.title}
              fill
              priority
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
