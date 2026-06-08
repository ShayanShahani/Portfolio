"use client";

import { useState } from "react";
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
  const [openedPhoto, setOpenedPhoto] = useState<string | null>(null);

  const bgColor = isDarkMode ? "bg-zinc-900" : "bg-white";
  const sidebarColor = isDarkMode ? "bg-zinc-800" : "bg-zinc-100";
  const textColor = isDarkMode ? "text-white" : "text-zinc-900";

  return (
    <div className={`h-full flex flex-col ${bgColor} ${textColor}`}>
      {/* Toolbar */}
      <div
        className={`h-12 px-4 border-b flex items-center ${
          isDarkMode ? "border-zinc-700" : "border-zinc-200"
        }`}
      >
        <h2 className="font-medium">Photos</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo.id)}
              onDoubleClick={() => setOpenedPhoto(photo.src)}
              className={`
                cursor-pointer
                rounded-xl
                overflow-hidden
                transition-all
                ${
                  selectedPhoto === photo.id
                    ? "ring-2 ring-blue-500"
                    : "hover:scale-[1.02]"
                }
              `}
            >
              <div className="aspect-square relative">
                <Image
                  src={photo.src}
                  alt={photo.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-2 text-sm text-center">{photo.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      {openedPhoto && (
        <div
          className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setOpenedPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-2xl"
            onClick={() => setOpenedPhoto(null)}
          >
            ×
          </button>

          <div
            className="relative w-[85%] h-[85%]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={openedPhoto}
              alt="Preview"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
