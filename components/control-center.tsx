"use client";

import { useEffect, useState } from "react";
import {
  Wifi,
  Bluetooth,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Maximize,
} from "lucide-react";

interface ControlCenterProps {
  onClose: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  brightness: number;
  onBrightnessChange: (value: number) => void;
}

export default function ControlCenter({
  isDarkMode,
  onToggleDarkMode,
  brightness,
  onBrightnessChange,
}: ControlCenterProps) {
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [volume, setVolume] = useState(75);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const savedWifi = localStorage.getItem("wifiEnabled");

    if (savedWifi !== null) {
      setWifiEnabled(savedWifi === "true");
    }

    setIsFullscreen(!!document.fullscreenElement);

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleWifiChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ wifiEnabled: boolean }>;

      if (typeof customEvent.detail?.wifiEnabled === "boolean") {
        setWifiEnabled(customEvent.detail.wifiEnabled);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("portfolio:wifi-change", handleWifiChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("portfolio:wifi-change", handleWifiChange);
    };
  }, []);

  const updateWifi = (enabled: boolean) => {
    setWifiEnabled(enabled);
    localStorage.setItem("wifiEnabled", String(enabled));

    window.dispatchEvent(
      new CustomEvent("portfolio:wifi-change", {
        detail: { wifiEnabled: enabled },
      }),
    );
  };

  const toggleWifi = () => {
    updateWifi(!wifiEnabled);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((error) => {
        console.error(
          `Error attempting to enable fullscreen: ${error.message}`,
        );
      });
      return;
    }

    document.exitFullscreen?.();
  };

  const panelClass = isDarkMode
    ? "border-white/10 bg-zinc-900/85 text-white"
    : "border-black/10 bg-white/85 text-zinc-900";

  const cardClass = isDarkMode
    ? "bg-white/10 text-white"
    : "bg-black/5 text-zinc-900";

  const inactiveButtonClass = isDarkMode
    ? "bg-white/10 text-zinc-300 hover:bg-white/15"
    : "bg-black/5 text-zinc-600 hover:bg-black/10";

  const inactiveIconClass = isDarkMode ? "text-zinc-400" : "text-zinc-500";
  const sliderBgClass = isDarkMode ? "bg-white/20" : "bg-black/15";

  return (
    <div
      className={`fixed top-8 right-4 z-40 w-80 overflow-hidden rounded-2xl border ${panelClass} shadow-2xl backdrop-blur-2xl`}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="p-4">
        <div className="grid grid-cols-4 gap-3 mb-4">
          <ControlButton
            active={wifiEnabled}
            activeLabel="Wi-Fi"
            inactiveLabel="Wi-Fi"
            activeIcon={<Wifi className="w-6 h-6 mb-1 text-white" />}
            inactiveIcon={
              <Wifi className={`w-6 h-6 mb-1 ${inactiveIconClass}`} />
            }
            inactiveButtonClass={inactiveButtonClass}
            onClick={toggleWifi}
          />

          <ControlButton
            active={bluetoothEnabled}
            activeLabel="Bluetooth"
            inactiveLabel="Bluetooth"
            activeIcon={<Bluetooth className="w-6 h-6 mb-1 text-white" />}
            inactiveIcon={
              <Bluetooth className={`w-6 h-6 mb-1 ${inactiveIconClass}`} />
            }
            inactiveButtonClass={inactiveButtonClass}
            onClick={() => setBluetoothEnabled((currentValue) => !currentValue)}
          />

          <ControlButton
            active={isDarkMode}
            activeLabel="Dark"
            inactiveLabel="Light"
            activeIcon={<Moon className="w-6 h-6 mb-1 text-white" />}
            inactiveIcon={
              <Sun className={`w-6 h-6 mb-1 ${inactiveIconClass}`} />
            }
            inactiveButtonClass={inactiveButtonClass}
            onClick={onToggleDarkMode}
          />

          <ControlButton
            active={isFullscreen}
            activeLabel="Exit"
            inactiveLabel="Fullscreen"
            activeIcon={<Maximize className="w-6 h-6 mb-1 text-white" />}
            inactiveIcon={
              <Maximize className={`w-6 h-6 mb-1 ${inactiveIconClass}`} />
            }
            inactiveButtonClass={inactiveButtonClass}
            onClick={toggleFullscreen}
          />
        </div>

        <div className={`rounded-xl p-3 mb-3 ${cardClass}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Display Brightness</span>
            <span className="text-sm">{brightness}%</span>
          </div>

          <input
            type="range"
            min="10"
            max="100"
            value={brightness}
            onChange={(event) =>
              onBrightnessChange(Number.parseInt(event.target.value, 10))
            }
            className={`w-full h-1 rounded-full appearance-none cursor-pointer accent-blue-500 ${sliderBgClass}`}
          />
        </div>

        <div className={`rounded-xl p-3 ${cardClass}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Volume</span>
            <span className="text-sm">{volume}%</span>
          </div>

          <div className="flex items-center">
            {volume === 0 ? (
              <VolumeX className={`w-5 h-5 mr-2 ${inactiveIconClass}`} />
            ) : (
              <Volume2 className="w-5 h-5 mr-2" />
            )}

            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(event) =>
                setVolume(Number.parseInt(event.target.value, 10))
              }
              className={`flex-1 h-1 rounded-full appearance-none cursor-pointer accent-blue-500 ${sliderBgClass}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ControlButton({
  active,
  activeLabel,
  inactiveLabel,
  activeIcon,
  inactiveIcon,
  inactiveButtonClass,
  onClick,
}: {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
  activeIcon: React.ReactNode;
  inactiveIcon: React.ReactNode;
  inactiveButtonClass: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`flex flex-col items-center justify-center rounded-xl p-3 transition ${
        active ? "bg-blue-500 text-white shadow-sm" : inactiveButtonClass
      }`}
      onClick={onClick}
    >
      {active ? activeIcon : inactiveIcon}

      <span className="text-xs">{active ? activeLabel : inactiveLabel}</span>
    </button>
  );
}
