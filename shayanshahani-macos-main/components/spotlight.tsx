"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AppWindow } from "@/types";

const spotlightApps = [
  { id: "safari", title: "Safari", icon: "/safari.png", component: "Safari" },
  { id: "mail", title: "Mail", icon: "/mail.png", component: "Mail" },
  { id: "vscode", title: "VS Code", icon: "/vscode.png", component: "VSCode" },
  { id: "notes", title: "Notes", icon: "/notes.png", component: "Notes" },
  { id: "photos", title: "Photos", icon: "/photos.png", component: "Photos" },
  {
    id: "contacts",
    title: "Contacts",
    icon: "/contacts.png",
    component: "Contacts",
  },
  {
    id: "facetime",
    title: "FaceTime",
    icon: "/facetime.png",
    component: "FaceTime",
  },
  {
    id: "terminal",
    title: "Terminal",
    icon: "/terminal.png",
    component: "Terminal",
  },
  { id: "github", title: "GitHub", icon: "/github.png", component: "GitHub" },
  {
    id: "youtube",
    title: "YouTube",
    icon: "/youtube.png",
    component: "YouTube",
  },
  {
    id: "spotify",
    title: "Spotify",
    icon: "/spotify.png",
    component: "Spotify",
  },
  { id: "snake", title: "Snake", icon: "/snake.png", component: "Snake" },
  {
    id: "weather",
    title: "Weather",
    icon: "/weather.png",
    component: "Weather",
  },
  {
    id: "settings",
    title: "Settings",
    icon: "/settings.png",
    component: "Settings",
  },
];

interface SpotlightProps {
  onClose: () => void;
  onAppClick: (app: AppWindow) => void;
  isDarkMode?: boolean;
}

export default function Spotlight({
  onClose,
  onAppClick,
  isDarkMode = true,
}: SpotlightProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  const filteredApps = useMemo(() => {
    if (!searchTerm.trim()) {
      return spotlightApps;
    }

    return spotlightApps.filter((app) =>
      app.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm]);

  const handleAppClick = useCallback(
    (app: (typeof spotlightApps)[0]) => {
      onAppClick({
        id: app.id,
        title: app.title,
        component: app.component,
        position: {
          x: Math.random() * 200 + 100,
          y: Math.random() * 100 + 50,
        },
        size: { width: 800, height: 600 },
      });

      onClose();
    },
    [onAppClick, onClose],
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  useEffect(() => {
    inputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "ArrowDown") {
        setSelectedIndex((currentIndex) =>
          currentIndex < filteredApps.length - 1
            ? currentIndex + 1
            : currentIndex,
        );
        event.preventDefault();
        return;
      }

      if (event.key === "ArrowUp") {
        setSelectedIndex((currentIndex) =>
          currentIndex > 0 ? currentIndex - 1 : currentIndex,
        );
        event.preventDefault();
        return;
      }

      if (event.key === "Enter" && filteredApps.length > 0) {
        handleAppClick(filteredApps[selectedIndex]);
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [filteredApps, selectedIndex, handleAppClick, onClose]);

  const panelClass = isDarkMode
    ? "border-white/10 bg-zinc-900/85 text-white"
    : "border-black/10 bg-white/85 text-zinc-900";

  const inputClass = isDarkMode
    ? "text-white placeholder:text-zinc-400"
    : "text-zinc-900 placeholder:text-zinc-500";

  const iconClass = isDarkMode ? "text-zinc-400" : "text-zinc-500";
  const emptyText = isDarkMode ? "text-zinc-400" : "text-zinc-500";
  const hoverClass = isDarkMode ? "hover:bg-white/10" : "hover:bg-black/5";

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center bg-transparent pt-24"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl overflow-hidden rounded-2xl border ${panelClass} shadow-2xl backdrop-blur-2xl`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative">
          <svg
            className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${iconClass}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          <input
            ref={inputRef}
            type="text"
            placeholder="Search"
            className={`w-full border-0 bg-transparent py-4 pl-12 pr-4 text-lg focus:outline-none ${inputClass}`}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        {filteredApps.length > 0 ? (
          <div className="max-h-80 overflow-y-auto pb-2">
            {filteredApps.map((app, index) => {
              const isSelected = index === selectedIndex;

              return (
                <button
                  key={app.id}
                  type="button"
                  className={`flex w-full cursor-pointer items-center px-4 py-3 text-left transition ${
                    isSelected ? "bg-blue-500 text-white" : hoverClass
                  }`}
                  onClick={() => handleAppClick(app)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="mr-3 flex h-9 w-9 items-center justify-center">
                    <img
                      src={app.icon || "/placeholder.svg"}
                      alt={app.title}
                      className="h-7 w-7 object-contain"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium">{app.title}</p>
                    <p
                      className={`text-xs ${
                        isSelected
                          ? "text-white/75"
                          : isDarkMode
                            ? "text-zinc-400"
                            : "text-zinc-500"
                      }`}
                    >
                      Application
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className={`px-4 pb-5 text-sm ${emptyText}`}>
            No results found.
          </div>
        )}
      </div>
    </div>
  );
}
