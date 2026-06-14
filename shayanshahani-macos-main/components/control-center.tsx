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

  return (
    <div
      className="fixed top-8 right-4 w-80 bg-gray-800/80 backdrop-blur-xl rounded-xl overflow-hidden shadow-2xl z-40"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="p-4">
        <div className="grid grid-cols-4 gap-3 mb-4">
          <button
            type="button"
            className={`flex flex-col items-center justify-center p-3 rounded-xl ${
              wifiEnabled ? "bg-blue-500" : "bg-gray-700"
            }`}
            onClick={toggleWifi}
          >
            <Wifi
              className={`w-6 h-6 mb-1 ${
                wifiEnabled ? "text-white" : "text-gray-400"
              }`}
            />
            <span
              className={`text-xs ${
                wifiEnabled ? "text-white" : "text-gray-400"
              }`}
            >
              Wi-Fi
            </span>
          </button>

          <button
            type="button"
            className={`flex flex-col items-center justify-center p-3 rounded-xl ${
              bluetoothEnabled ? "bg-blue-500" : "bg-gray-700"
            }`}
            onClick={() => setBluetoothEnabled((currentValue) => !currentValue)}
          >
            <Bluetooth className="w-6 h-6 text-white mb-1" />
            <span className="text-white text-xs">Bluetooth</span>
          </button>

          <button
            type="button"
            className={`flex flex-col items-center justify-center p-3 rounded-xl ${
              isDarkMode ? "bg-blue-500" : "bg-gray-700"
            }`}
            onClick={onToggleDarkMode}
          >
            {isDarkMode ? (
              <Moon className="w-6 h-6 text-white mb-1" />
            ) : (
              <Sun className="w-6 h-6 text-white mb-1" />
            )}
            <span className="text-white text-xs">
              {isDarkMode ? "Dark" : "Light"}
            </span>
          </button>

          <button
            type="button"
            className={`flex flex-col items-center justify-center p-3 rounded-xl ${
              isFullscreen ? "bg-blue-500" : "bg-gray-700"
            }`}
            onClick={toggleFullscreen}
          >
            <Maximize className="w-6 h-6 text-white mb-1" />
            <span className="text-white text-xs">
              {isFullscreen ? "Exit" : "Fullscreen"}
            </span>
          </button>
        </div>

        <div className="bg-gray-700 rounded-xl p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-sm">Display</span>
            <span className="text-white text-sm">{brightness}%</span>
          </div>

          <input
            type="range"
            min="10"
            max="100"
            value={brightness}
            onChange={(event) =>
              onBrightnessChange(Number.parseInt(event.target.value, 10))
            }
            className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer"
          />
        </div>

        <div className="bg-gray-700 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-sm">Volume</span>
            <span className="text-white text-sm">{volume}%</span>
          </div>

          <div className="flex items-center">
            {volume === 0 ? (
              <VolumeX className="w-5 h-5 text-white mr-2" />
            ) : (
              <Volume2 className="w-5 h-5 text-white mr-2" />
            )}

            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(event) =>
                setVolume(Number.parseInt(event.target.value, 10))
              }
              className="flex-1 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
