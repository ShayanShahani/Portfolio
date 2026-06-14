"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import { X, Minus, ArrowRightIcon as ArrowsMaximize } from "lucide-react";
import type { AppWindow } from "@/types";
import Notes from "@/components/apps/notes";
import Photos from "@/components/apps/photos";
import Contacts from "@/components/apps/contacts";
import GitHub from "@/components/apps/github";
import Safari from "@/components/apps/safari";
import VSCode from "@/components/apps/vscode";
import FaceTime from "@/components/apps/facetime";
import Terminal from "@/components/apps/terminal";
import Mail from "@/components/apps/mail";
import YouTube from "@/components/apps/youtube";
import Spotify from "@/components/apps/spotify";
import Snake from "@/components/apps/snake";
import Weather from "@/components/apps/weather";
import Settings from "@/components/apps/settings";

type AppComponentProps = {
  isDarkMode?: boolean;
  onClose?: () => void;
  onToggleDarkMode?: () => void;
  brightness?: number;
  onBrightnessChange?: (value: number) => void;
};

const componentMap: Record<string, React.ComponentType<AppComponentProps>> = {
  Notes,
  Photos,
  Contacts,
  GitHub,
  Safari,
  VSCode,
  FaceTime,
  Terminal,
  Mail,
  YouTube,
  Spotify,
  Snake,
  Weather,
  Settings,
};

interface WindowProps {
  window: AppWindow;
  isActive: boolean;
  onClose: () => void;
  onFocus: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  brightness: number;
  onBrightnessChange: (value: number) => void;
}

export default function Window({
  window: appWindow,
  isActive,
  onClose,
  onFocus,
  isDarkMode,
  onToggleDarkMode,
  brightness,
  onBrightnessChange,
}: WindowProps) {
  const [position, setPosition] = useState(appWindow.position);
  const [size, setSize] = useState(appWindow.size);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMaximized, setIsMaximized] = useState(false);
  const [preMaximizeState, setPreMaximizeState] = useState({
    position: appWindow.position,
    size: appWindow.size,
  });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [resizeStartSize, setResizeStartSize] = useState({
    width: 0,
    height: 0,
  });

  const windowRef = useRef<HTMLDivElement>(null);

  const AppComponent = componentMap[appWindow.component];

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: event.clientX - dragOffset.x,
          y: event.clientY - dragOffset.y,
        });

        return;
      }

      if (isResizing && resizeDirection) {
        event.preventDefault();

        const dx = event.clientX - resizeStartPos.x;
        const dy = event.clientY - resizeStartPos.y;

        let newWidth = resizeStartSize.width;
        let newHeight = resizeStartSize.height;
        let newX = position.x;
        let newY = position.y;

        const minWidth = 300;
        const minHeight = 200;

        if (resizeDirection.includes("e")) {
          newWidth = Math.max(minWidth, resizeStartSize.width + dx);
        }

        if (resizeDirection.includes("s")) {
          newHeight = Math.max(minHeight, resizeStartSize.height + dy);
        }

        if (resizeDirection.includes("w")) {
          const proposedWidth = resizeStartSize.width - dx;

          if (proposedWidth >= minWidth) {
            newWidth = proposedWidth;
            newX = position.x + dx;
          }
        }

        if (resizeDirection.includes("n")) {
          const proposedHeight = resizeStartSize.height - dy;

          if (proposedHeight >= minHeight) {
            newHeight = proposedHeight;
            newY = position.y + dy;
          }
        }

        setSize({ width: newWidth, height: newHeight });

        if (resizeDirection.includes("w") || resizeDirection.includes("n")) {
          setPosition({ x: newX, y: newY });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDragging,
    dragOffset,
    isResizing,
    resizeDirection,
    resizeStartPos,
    resizeStartSize,
    position,
  ]);

  const handleTitleBarMouseDown = (event: React.MouseEvent) => {
    if (isMaximized) return;

    if ((event.target as HTMLElement).closest(".window-controls")) {
      return;
    }

    setIsDragging(true);
    setDragOffset({
      x: event.clientX - position.x,
      y: event.clientY - position.y,
    });

    onFocus();
  };

  const handleResizeMouseDown = (
    event: React.MouseEvent,
    direction: string,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStartPos({
      x: event.clientX,
      y: event.clientY,
    });
    setResizeStartSize({
      width: size.width,
      height: size.height,
    });

    onFocus();
  };

  const toggleMaximize = () => {
    if (isMaximized) {
      setPosition(preMaximizeState.position);
      setSize(preMaximizeState.size);
    } else {
      setPreMaximizeState({ position, size });

      const availableHeight = globalThis.window.innerHeight - 26;

      setPosition({ x: 0, y: 26 });
      setSize({
        width: globalThis.window.innerWidth,
        height: availableHeight - 70,
      });
    }

    setIsMaximized((currentValue) => !currentValue);
  };

  const handleMinimize = () => {
    onClose();
  };

  const titleBarClass = isDarkMode
    ? isActive
      ? "bg-gray-800"
      : "bg-gray-900"
    : isActive
      ? "bg-gray-200"
      : "bg-gray-100";

  const contentBgClass = isDarkMode ? "bg-gray-900" : "bg-white";
  const textClass = isDarkMode ? "text-white" : "text-gray-800";

  return (
    <div
      ref={windowRef}
      className={`absolute rounded-lg overflow-hidden shadow-2xl transition-shadow ${
        isActive ? "shadow-2xl z-10" : "shadow-lg z-0"
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
      onClick={onFocus}
    >
      <div
        className={`h-8 flex items-center px-3 ${titleBarClass}`}
        onMouseDown={handleTitleBarMouseDown}
      >
        <div className="window-controls flex items-center space-x-2 mr-4">
          <button
            type="button"
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center"
            onClick={onClose}
            aria-label="Close window"
          >
            <X className="w-2 h-2 text-red-800 opacity-0 hover:opacity-100" />
          </button>

          <button
            type="button"
            className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 flex items-center justify-center"
            onClick={handleMinimize}
            aria-label="Minimize window"
          >
            <Minus className="w-2 h-2 text-yellow-800 opacity-0 hover:opacity-100" />
          </button>

          <button
            type="button"
            className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center"
            onClick={toggleMaximize}
            aria-label={isMaximized ? "Restore window" : "Maximize window"}
          >
            <ArrowsMaximize className="w-2 h-2 text-green-800 opacity-0 hover:opacity-100" />
          </button>
        </div>

        <div
          className={`flex-1 text-center text-sm font-medium truncate ${textClass}`}
        >
          {appWindow.title}
        </div>

        <div className="w-16" />
      </div>

      <div className={`${contentBgClass} h-[calc(100%-2rem)] overflow-auto`}>
        {AppComponent ? (
          <AppComponent
            isDarkMode={isDarkMode}
            onClose={onClose}
            onToggleDarkMode={onToggleDarkMode}
            brightness={brightness}
            onBrightnessChange={onBrightnessChange}
          />
        ) : (
          <div className="p-4">Content not available</div>
        )}
      </div>

      {!isMaximized && (
        <>
          <div
            className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-20"
            onMouseDown={(event) => handleResizeMouseDown(event, "nw")}
          />
          <div
            className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-20"
            onMouseDown={(event) => handleResizeMouseDown(event, "ne")}
          />
          <div
            className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-20"
            onMouseDown={(event) => handleResizeMouseDown(event, "sw")}
          />
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-20"
            onMouseDown={(event) => handleResizeMouseDown(event, "se")}
          />

          <div
            className="absolute top-0 left-4 right-4 h-2 cursor-n-resize z-20"
            onMouseDown={(event) => handleResizeMouseDown(event, "n")}
          />
          <div
            className="absolute bottom-0 left-4 right-4 h-2 cursor-s-resize z-20"
            onMouseDown={(event) => handleResizeMouseDown(event, "s")}
          />
          <div
            className="absolute left-0 top-4 bottom-4 w-2 cursor-w-resize z-20"
            onMouseDown={(event) => handleResizeMouseDown(event, "w")}
          />
          <div
            className="absolute right-0 top-4 bottom-4 w-2 cursor-e-resize z-20"
            onMouseDown={(event) => handleResizeMouseDown(event, "e")}
          />
        </>
      )}
    </div>
  );
}
