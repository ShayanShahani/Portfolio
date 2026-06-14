"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import Dock from "@/components/dock";
import Menubar from "@/components/menubar";
import Wallpaper from "@/components/wallpaper";
import Window from "@/components/window";
import Launchpad from "@/components/launchpad";
import ControlCenter from "@/components/control-center";
import Spotlight from "@/components/spotlight";
import type { AppWindow } from "@/types";

interface DesktopProps {
  onLogout: () => void;
  onSleep: () => void;
  onShutdown: () => void;
  onRestart: () => void;
  initialDarkMode: boolean;
  onToggleDarkMode: () => void;
  initialBrightness: number;
  onBrightnessChange: (value: number) => void;
}

export default function Desktop({
  onLogout,
  onSleep,
  onShutdown,
  onRestart,
  initialDarkMode,
  onToggleDarkMode,
  initialBrightness,
  onBrightnessChange,
}: DesktopProps) {
  const [time, setTime] = useState(new Date());
  const [openWindows, setOpenWindows] = useState<AppWindow[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [showLaunchpad, setShowLaunchpad] = useState(false);
  const [showControlCenter, setShowControlCenter] = useState(false);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(initialDarkMode);
  const [screenBrightness, setScreenBrightness] = useState(initialBrightness);

  const desktopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setIsDarkMode(initialDarkMode);
  }, [initialDarkMode]);

  useEffect(() => {
    setScreenBrightness(initialBrightness);
  }, [initialBrightness]);

  const openApp = (app: AppWindow) => {
    const isOpen = openWindows.some((window) => window.id === app.id);

    if (!isOpen) {
      setOpenWindows((prev) => [...prev, app]);
    }

    setActiveWindowId(app.id);

    if (showLaunchpad) {
      setShowLaunchpad(false);
    }

    if (showSpotlight) {
      setShowSpotlight(false);
    }
  };

  const closeWindow = (id: string) => {
    const remainingWindows = openWindows.filter((window) => window.id !== id);

    setOpenWindows(remainingWindows);

    if (activeWindowId === id) {
      const lastWindow = remainingWindows[remainingWindows.length - 1];
      setActiveWindowId(lastWindow ? lastWindow.id : null);
    }
  };

  const setActiveWindow = (id: string) => {
    setActiveWindowId(id);
  };

  const toggleLaunchpad = () => {
    setShowLaunchpad((currentValue) => !currentValue);

    if (showControlCenter) {
      setShowControlCenter(false);
    }

    if (showSpotlight) {
      setShowSpotlight(false);
    }
  };

  const toggleControlCenter = () => {
    setShowControlCenter((currentValue) => !currentValue);

    if (showSpotlight) {
      setShowSpotlight(false);
    }
  };

  const toggleSpotlight = () => {
    setShowSpotlight((currentValue) => !currentValue);

    if (showControlCenter) {
      setShowControlCenter(false);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode((currentMode) => !currentMode);
    onToggleDarkMode();
  };

  const updateBrightness = (value: number) => {
    setScreenBrightness(value);
    onBrightnessChange(value);
  };

  const handleDesktopClick = (event: React.MouseEvent) => {
    if (event.target === desktopRef.current) {
      setActiveWindowId(null);

      if (showControlCenter) {
        setShowControlCenter(false);
      }

      if (showSpotlight) {
        setShowSpotlight(false);
      }
    }
  };

  const activeWindow =
    activeWindowId !== null
      ? openWindows.find((window) => window.id === activeWindowId) || null
      : null;

  return (
    <div className="relative">
      <div
        ref={desktopRef}
        className={`relative h-screen w-screen overflow-hidden ${
          isDarkMode ? "dark" : ""
        }`}
        onClick={handleDesktopClick}
      >
        <Wallpaper isDarkMode={isDarkMode} />

        <Menubar
          time={time}
          onLogout={onLogout}
          onSleep={onSleep}
          onShutdown={onShutdown}
          onRestart={onRestart}
          onSpotlightClick={toggleSpotlight}
          onControlCenterClick={toggleControlCenter}
          isDarkMode={isDarkMode}
          activeWindow={activeWindow}
        />

        <div className="absolute inset-0 pt-6 pb-16">
          {openWindows.map((window) => (
            <Window
              key={window.id}
              window={window}
              isActive={activeWindowId === window.id}
              onClose={() => closeWindow(window.id)}
              onFocus={() => setActiveWindow(window.id)}
              isDarkMode={isDarkMode}
              onToggleDarkMode={toggleDarkMode}
              brightness={screenBrightness}
              onBrightnessChange={updateBrightness}
            />
          ))}
        </div>

        {showLaunchpad && (
          <Launchpad
            onAppClick={openApp}
            onClose={() => setShowLaunchpad(false)}
          />
        )}

        {showControlCenter && (
          <ControlCenter
            onClose={() => setShowControlCenter(false)}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
            brightness={screenBrightness}
            onBrightnessChange={updateBrightness}
          />
        )}

        {showSpotlight && (
          <Spotlight
            onClose={() => setShowSpotlight(false)}
            onAppClick={openApp}
          />
        )}

        <Dock
          onAppClick={openApp}
          onLaunchpadClick={toggleLaunchpad}
          activeAppIds={openWindows.map((window) => window.id)}
          isDarkMode={isDarkMode}
        />
      </div>

      <div
        className="absolute inset-0 bg-black pointer-events-none z-50 transition-opacity duration-300"
        style={{ opacity: Math.max(0.1, 0.9 - screenBrightness / 100) }}
      />
    </div>
  );
}
