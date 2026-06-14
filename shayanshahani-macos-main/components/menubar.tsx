"use client";

import type React from "react";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { AppleIcon } from "@/components/icons";

interface MenubarProps {
  time: Date;
  onLogout: () => void;
  onSleep: () => void;
  onShutdown: () => void;
  onRestart: () => void;
  onSpotlightClick: () => void;
  onControlCenterClick: () => void;
  isDarkMode: boolean;
  activeWindow: { id: string; title: string } | null;
}

type BrowserBatteryManager = EventTarget & {
  charging: boolean;
  level: number;
  addEventListener: (
    type: "chargingchange" | "levelchange",
    listener: EventListener,
  ) => void;
  removeEventListener: (
    type: "chargingchange" | "levelchange",
    listener: EventListener,
  ) => void;
};

type NavigatorWithBattery = Navigator & {
  getBattery?: () => Promise<BrowserBatteryManager>;
};

export default function Menubar({
  time,
  onLogout,
  onSleep,
  onShutdown,
  onRestart,
  onSpotlightClick,
  onControlCenterClick,
  isDarkMode,
  activeWindow,
}: MenubarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isCharging, setIsCharging] = useState(false);
  const [showWifiToggle, setShowWifiToggle] = useState(false);
  const [wifiEnabled, setWifiEnabled] = useState(true);

  const menuRef = useRef<HTMLDivElement>(null);
  const wifiRef = useRef<HTMLDivElement>(null);

  const updateBatteryStatus = useCallback((battery: BrowserBatteryManager) => {
    setBatteryLevel(Math.round(battery.level * 100));
    setIsCharging(battery.charging);
  }, []);

  const formattedTime = time.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  useEffect(() => {
    let batteryManager: BrowserBatteryManager | null = null;
    let handleBatteryChange: EventListener | null = null;

    const navigatorWithBattery = navigator as NavigatorWithBattery;

    if (navigatorWithBattery.getBattery) {
      navigatorWithBattery
        .getBattery()
        .then((battery) => {
          batteryManager = battery;

          updateBatteryStatus(battery);

          handleBatteryChange = () => {
            updateBatteryStatus(battery);
          };

          battery.addEventListener("levelchange", handleBatteryChange);
          battery.addEventListener("chargingchange", handleBatteryChange);
        })
        .catch(() => {
          setBatteryLevel(100);
          setIsCharging(false);
        });
    }

    const savedWifi = localStorage.getItem("wifiEnabled");

    if (savedWifi !== null) {
      setWifiEnabled(savedWifi === "true");
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target;

      if (
        target instanceof Node &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setActiveMenu(null);
      }

      if (
        target instanceof Element &&
        wifiRef.current &&
        !wifiRef.current.contains(target) &&
        !target.closest(".wifi-icon")
      ) {
        setShowWifiToggle(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);

      if (batteryManager && handleBatteryChange) {
        batteryManager.removeEventListener("levelchange", handleBatteryChange);
        batteryManager.removeEventListener(
          "chargingchange",
          handleBatteryChange,
        );
      }
    };
  }, [updateBatteryStatus]);

  const toggleMenu = (menuName: string) => {
    setActiveMenu((currentMenu) =>
      currentMenu === menuName ? null : menuName,
    );
  };

  const toggleWifi = () => {
    const newState = !wifiEnabled;

    setWifiEnabled(newState);
    localStorage.setItem("wifiEnabled", newState.toString());
  };

  const toggleWifiPopup = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowWifiToggle((currentValue) => !currentValue);
  };

  const menuBgClass = isDarkMode
    ? "bg-black/40 backdrop-blur-md"
    : "bg-white/20 backdrop-blur-md";

  const dropdownBgClass = isDarkMode
    ? "bg-gray-800/90 backdrop-blur-md"
    : "bg-gray-200/90 backdrop-blur-md";

  const textClass = isDarkMode ? "text-white" : "text-gray-800";
  const hoverClass = isDarkMode ? "hover:bg-blue-600" : "hover:bg-blue-400";

  return (
    <div
      ref={menuRef}
      className={`fixed top-0 left-0 right-0 h-6 ${menuBgClass} z-50 flex items-center px-4 ${textClass} text-sm`}
    >
      <div className="flex-1 flex items-center">
        <button
          type="button"
          className="flex items-center mr-4 hover:bg-white/10 px-2 py-0.5 rounded"
          onClick={() => toggleMenu("apple")}
        >
          <AppleIcon className="w-4 h-4" />
        </button>

        {activeMenu === "apple" && (
          <div
            className={`absolute top-6 left-2 ${dropdownBgClass} rounded-lg shadow-xl ${textClass} py-1 w-56`}
          >
            <button
              type="button"
              className={`w-full text-left px-4 py-1 ${hoverClass}`}
            >
              About This Mac
            </button>

            <div className="border-t border-gray-700 my-1" />

            <button
              type="button"
              className={`w-full text-left px-4 py-1 ${hoverClass}`}
            >
              System Settings...
            </button>

            <button
              type="button"
              className={`w-full text-left px-4 py-1 ${hoverClass}`}
            >
              App Store...
            </button>

            <div className="border-t border-gray-700 my-1" />

            <button
              type="button"
              className={`w-full text-left px-4 py-1 ${hoverClass}`}
              onClick={onSleep}
            >
              Sleep
            </button>

            <button
              type="button"
              className={`w-full text-left px-4 py-1 ${hoverClass}`}
              onClick={onRestart}
            >
              Restart...
            </button>

            <button
              type="button"
              className={`w-full text-left px-4 py-1 ${hoverClass}`}
              onClick={onShutdown}
            >
              Shut Down...
            </button>

            <div className="border-t border-gray-700 my-1" />

            <button
              type="button"
              className={`w-full text-left px-4 py-1 ${hoverClass}`}
              onClick={onLogout}
            >
              Log Out Shayan...
            </button>
          </div>
        )}

        {activeWindow && (
          <button
            type="button"
            className={`mr-4 font-medium hover:bg-white/10 px-2 py-0.5 rounded ${
              activeMenu === "app" ? "bg-white/10" : ""
            }`}
            onClick={() => toggleMenu("app")}
          >
            {activeWindow.title}
          </button>
        )}
      </div>

      <div className="flex items-center space-x-3">
        <span className="mr-1">{batteryLevel}%</span>

        <div className="relative">
          <div className="w-6 h-3 border border-current rounded-sm relative">
            <div
              className="absolute top-0 left-0 bottom-0 bg-current"
              style={{ width: `${batteryLevel}%` }}
            />

            <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-2 bg-current rounded-r-sm" />

            {isCharging && (
              <div className="absolute inset-0 flex items-center justify-center text-xs">
                ⚡
              </div>
            )}
          </div>
        </div>

        <div className="relative">
          <button type="button" className="wifi-icon" onClick={toggleWifiPopup}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              {wifiEnabled ? (
                <>
                  <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                  <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                  <circle cx="12" cy="20" r="1" />
                </>
              ) : (
                <>
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
                  <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
                  <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
                  <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                  <circle cx="12" cy="20" r="1" />
                </>
              )}
            </svg>
          </button>

          {showWifiToggle && (
            <div
              ref={wifiRef}
              className={`absolute top-6 right-0 ${dropdownBgClass} rounded-lg shadow-xl ${textClass} py-3 px-4 w-64`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">Wi-Fi</span>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wifiEnabled}
                    onChange={toggleWifi}
                    className="sr-only peer"
                  />

                  <div className="w-11 h-6 bg-gray-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500" />
                </label>
              </div>
            </div>
          )}
        </div>

        <button type="button" onClick={onSpotlightClick}>
          <Search className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onControlCenterClick}
          className="flex items-center justify-center"
        >
          <img
            src="/control-center-icon.webp"
            alt="Control Center"
            className="w-4 h-4"
            style={{
              filter: isDarkMode ? "invert(1)" : "none",
              opacity: 0.9,
            }}
          />
        </button>

        <span>{formattedTime}</span>
      </div>
    </div>
  );
}
