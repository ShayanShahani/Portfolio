"use client";

import { useEffect, useState } from "react";
import BootScreen from "@/components/boot-screen";
import LoginScreen from "@/components/login-screen";
import Desktop from "@/components/desktop";
import SleepScreen from "@/components/sleep-screen";
import ShutdownScreen from "@/components/shutdown-screen";
import MobilePortfolio from "@/components/mobile-portfolio";

type SystemState =
  | "booting"
  | "login"
  | "desktop"
  | "sleeping"
  | "shutdown"
  | "restarting";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    const updateMatches = () => {
      setMatches(mediaQuery.matches);
    };

    updateMatches();

    mediaQuery.addEventListener("change", updateMatches);

    return () => {
      mediaQuery.removeEventListener("change", updateMatches);
    };
  }, [query]);

  return matches;
}

export default function Home() {
  const [systemState, setSystemState] = useState<SystemState>("booting");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [screenBrightness, setScreenBrightness] = useState(90);

  const isDesktopViewport = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    if (systemState === "booting") {
      const timer = window.setTimeout(() => {
        setSystemState("login");
      }, 3000);

      return () => window.clearTimeout(timer);
    }

    if (systemState === "restarting") {
      const bootTimer = window.setTimeout(() => {
        setSystemState("login");
      }, 3000);

      return () => window.clearTimeout(bootTimer);
    }
  }, [systemState]);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("isDarkMode");

    if (savedDarkMode !== null) {
      setIsDarkMode(savedDarkMode === "true");
    }

    const savedBrightness = localStorage.getItem("screenBrightness");

    if (savedBrightness !== null) {
      setScreenBrightness(Number.parseInt(savedBrightness, 10));
    }
  }, []);

  const handleLogin = () => {
    setSystemState("desktop");
  };

  const handleLogout = () => {
    setSystemState("login");
  };

  const handleSleep = () => {
    setSystemState("sleeping");
  };

  const handleWakeUp = () => {
    setSystemState("login");
  };

  const handleShutdown = () => {
    setSystemState("shutdown");
  };

  const handleBoot = () => {
    setSystemState("booting");
  };

  const handleRestart = () => {
    setSystemState("restarting");
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;

    setIsDarkMode(newMode);
    localStorage.setItem("isDarkMode", newMode.toString());
  };

  const updateBrightness = (value: number) => {
    setScreenBrightness(value);
    localStorage.setItem("screenBrightness", value.toString());
  };

  const renderDesktopSystem = () => {
    switch (systemState) {
      case "booting":
      case "restarting":
        return <BootScreen />;

      case "login":
        return (
          <LoginScreen
            onLogin={handleLogin}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
          />
        );

      case "desktop":
        return (
          <Desktop
            onLogout={handleLogout}
            onSleep={handleSleep}
            onShutdown={handleShutdown}
            onRestart={handleRestart}
            initialDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
            initialBrightness={screenBrightness}
            onBrightnessChange={updateBrightness}
          />
        );

      case "sleeping":
        return <SleepScreen onWakeUp={handleWakeUp} isDarkMode={isDarkMode} />;

      case "shutdown":
        return <ShutdownScreen onBoot={handleBoot} />;

      default:
        return <BootScreen />;
    }
  };

  if (isDesktopViewport === null) {
    return <div className="min-h-screen bg-black" />;
  }

  if (!isDesktopViewport) {
    return (
      <MobilePortfolio
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />
    );
  }

  return (
    <div className="relative">
      {renderDesktopSystem()}

      <div
        className="absolute inset-0 bg-black pointer-events-none z-50 transition-opacity duration-300"
        style={{ opacity: Math.max(0.1, 0.9 - screenBrightness / 100) }}
      />
    </div>
  );
}
