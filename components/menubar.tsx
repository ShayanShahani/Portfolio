"use client";

import type React from "react";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AppWindow,
  BatteryLow,
  Info,
  LogOut,
  Minus,
  Moon,
  Power,
  RotateCcw,
  Search,
  Settings,
  ShoppingBag,
  X,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import { AppleIcon } from "@/components/icons";

interface MenubarProps {
  time: Date;
  onLogout: () => void;
  onSleep: () => void;
  onShutdown: () => void;
  onRestart: () => void;
  onSpotlightClick: () => void;
  onControlCenterClick: () => void;
  onOpenSettingsApp: () => void;
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
  onOpenSettingsApp,
  isDarkMode,
  activeWindow,
}: MenubarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isCharging, setIsCharging] = useState(false);
  const [showAboutMac, setShowAboutMac] = useState(false);
  const [wifiEnabled, setWifiEnabled] = useState(true);

  const menuRef = useRef<HTMLDivElement>(null);

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

    const handleWifiChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ wifiEnabled: boolean }>;

      if (typeof customEvent.detail?.wifiEnabled === "boolean") {
        setWifiEnabled(customEvent.detail.wifiEnabled);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target;

      if (
        target instanceof Node &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setActiveMenu(null);
      }
    };

    window.addEventListener("portfolio:wifi-change", handleWifiChange);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("portfolio:wifi-change", handleWifiChange);
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

  const handleOpenSettings = () => {
    setActiveMenu(null);
    onOpenSettingsApp();
  };

  const handleMoreInfo = () => {
    setShowAboutMac(false);
    setActiveMenu(null);
    onOpenSettingsApp();
  };

  const handleAboutThisMac = () => {
    setActiveMenu(null);
    setShowAboutMac(true);
  };

  const menuBgClass = isDarkMode
    ? "bg-black/40 backdrop-blur-md"
    : "bg-white/20 backdrop-blur-md";

  const dropdownBgClass = isDarkMode
    ? "border-white/10 bg-zinc-900/90 text-white"
    : "border-black/10 bg-white/90 text-zinc-900";

  const separatorClass = isDarkMode ? "border-white/10" : "border-black/10";
  const textClass = isDarkMode ? "text-white" : "text-gray-800";
  const hoverClass = isDarkMode ? "hover:bg-white/10" : "hover:bg-black/5";
  const mutedText = isDarkMode ? "text-zinc-400" : "text-zinc-500";

  const WifiIcon = wifiEnabled ? Wifi : WifiOff;

  return (
    <>
      <div
        ref={menuRef}
        className={`fixed top-0 left-0 right-0 h-6 ${menuBgClass} z-50 flex items-center px-4 ${textClass} text-sm`}
      >
        <div className="flex-1 flex items-center">
          <button
            type="button"
            className={`flex items-center mr-3 px-2 py-0.5 rounded ${hoverClass}`}
            onClick={() => toggleMenu("apple")}
            aria-label="Apple menu"
          >
            <AppleIcon className="w-4 h-4" />
          </button>

          {activeMenu === "apple" && (
            <div
              className={`absolute top-7 left-2 w-72 rounded-2xl border ${dropdownBgClass} shadow-2xl backdrop-blur-2xl p-2`}
            >
              <MenuButton
                icon={<Info className="h-4 w-4" />}
                label="About This Mac"
                onClick={handleAboutThisMac}
                hoverClass={hoverClass}
              />

              <div className={`my-1 border-t ${separatorClass}`} />

              <MenuButton
                icon={<Settings className="h-4 w-4" />}
                label="System Settings..."
                onClick={handleOpenSettings}
                hoverClass={hoverClass}
              />

              <MenuButton
                icon={<ShoppingBag className="h-4 w-4" />}
                label="App Store"
                onClick={() => setActiveMenu(null)}
                hoverClass={hoverClass}
              />

              <div className={`my-1 border-t ${separatorClass}`} />

              <MenuButton
                icon={<Moon className="h-4 w-4" />}
                label="Sleep"
                onClick={() => {
                  setActiveMenu(null);
                  onSleep();
                }}
                hoverClass={hoverClass}
              />

              <MenuButton
                icon={<RotateCcw className="h-4 w-4" />}
                label="Restart..."
                onClick={() => {
                  setActiveMenu(null);
                  onRestart();
                }}
                hoverClass={hoverClass}
              />

              <MenuButton
                icon={<Power className="h-4 w-4" />}
                label="Shut Down..."
                onClick={() => {
                  setActiveMenu(null);
                  onShutdown();
                }}
                hoverClass={hoverClass}
              />

              <div className={`my-1 border-t ${separatorClass}`} />

              <MenuButton
                icon={<LogOut className="h-4 w-4" />}
                label="Log Out Shayan..."
                onClick={() => {
                  setActiveMenu(null);
                  onLogout();
                }}
                hoverClass={hoverClass}
              />
            </div>
          )}

          {activeWindow && (
            <button
              type="button"
              className={`mr-4 font-medium px-2 py-0.5 rounded ${hoverClass} ${
                activeMenu === "app" ? "bg-white/10" : ""
              }`}
              onClick={() => toggleMenu("app")}
            >
              {activeWindow.title}
            </button>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleMenu("battery")}
              className={`flex items-center justify-center rounded px-1 py-0.5 ${hoverClass}`}
              aria-label="Battery"
            >
              <FilledBatteryIcon
                level={batteryLevel}
                charging={isCharging}
                isDarkMode={isDarkMode}
              />
            </button>

            {activeMenu === "battery" && (
              <div
                className={`absolute top-7 right-0 w-80 rounded-2xl border ${dropdownBgClass} shadow-2xl backdrop-blur-2xl p-4`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-semibold">Battery</h3>
                  <span className="text-base font-semibold">
                    {batteryLevel}%
                  </span>
                </div>

                <p className={`text-sm ${mutedText}`}>
                  Power Source: {isCharging ? "Power Adapter" : "Battery"}
                </p>

                <div className={`my-4 border-t ${separatorClass}`} />

                <h4 className="mb-3 text-sm font-semibold">Energy Mode</h4>

                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      isDarkMode ? "bg-white/10" : "bg-black/5"
                    }`}
                  >
                    <BatteryLow className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">Low Power</p>
                  </div>
                </div>

                <div className={`my-4 border-t ${separatorClass}`} />

                <p className="text-sm">No Apps Using Significant Energy</p>

                <div className={`my-4 border-t ${separatorClass}`} />

                <button
                  type="button"
                  onClick={handleOpenSettings}
                  className={`w-full rounded-lg px-2 py-1.5 text-left text-sm ${hoverClass}`}
                >
                  Battery Settings...
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              className={`wifi-icon flex items-center justify-center rounded px-1 py-0.5 ${hoverClass}`}
              onClick={() => toggleMenu("wifi")}
              aria-label="Wi-Fi"
            >
              <WifiIcon
                className={`w-5 h-5 transition-colors ${
                  wifiEnabled
                    ? ""
                    : isDarkMode
                      ? "text-zinc-500"
                      : "text-zinc-400"
                }`}
              />
            </button>

            {activeMenu === "wifi" && (
              <div
                className={`absolute top-7 right-0 w-64 rounded-2xl border ${dropdownBgClass} shadow-2xl backdrop-blur-2xl p-4`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Wi-Fi</p>
                    <p className={`text-xs ${mutedText}`}>
                      {wifiEnabled ? "Connected" : "Off"}
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={wifiEnabled}
                    onClick={toggleWifi}
                    className={`relative h-7 w-12 rounded-full transition ${
                      wifiEnabled ? "bg-blue-500" : "bg-zinc-500"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                        wifiEnabled ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                <div className={`my-4 border-t ${separatorClass}`} />

                <div className="flex items-center gap-3">
                  <WifiIcon
                    className={`h-5 w-5 ${
                      wifiEnabled ? "text-blue-500" : mutedText
                    }`}
                  />

                  <div>
                    <p className="text-sm font-medium">Lord of the pings</p>
                    <p className={`text-xs ${mutedText}`}>
                      {wifiEnabled
                        ? "Connected to the network"
                        : "No network connection"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onSpotlightClick}
            className={`rounded px-1 py-0.5 ${hoverClass}`}
            aria-label="Spotlight"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onControlCenterClick}
            className={`flex items-center justify-center rounded px-1 py-0.5 ${hoverClass}`}
            aria-label="Control Center"
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

      {showAboutMac && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
          <div
            className={`w-[420px] overflow-hidden rounded-3xl border shadow-2xl ${
              isDarkMode
                ? "border-white/10 bg-zinc-900 text-white"
                : "border-black/10 bg-white text-zinc-900"
            }`}
          >
            <div
              className={`flex h-10 items-center px-4 ${
                isDarkMode ? "bg-white/5" : "bg-black/5"
              }`}
            >
              <div className="group flex items-center gap-2">
                <ModalTrafficButton
                  colorClass="bg-red-500"
                  icon={<X className="h-2.5 w-2.5 stroke-[3]" />}
                  iconClass="text-red-950"
                  onClick={() => setShowAboutMac(false)}
                  label="Close About This Mac"
                />

                <ModalTrafficButton
                  colorClass="bg-yellow-500"
                  icon={<Minus className="h-2.5 w-2.5 stroke-[3]" />}
                  iconClass="text-yellow-950"
                  label="Minimize About This Mac"
                />

                <ModalTrafficButton
                  colorClass="bg-green-500"
                  icon={<MacMaximizeIcon />}
                  iconClass="text-green-950"
                  label="Maximize About This Mac"
                />
              </div>

              <p className="flex-1 text-center text-sm font-medium">
                About This Mac
              </p>

              <div className="w-12" />
            </div>

            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg">
                <AppWindow className="h-10 w-10" />
              </div>

              <h2 className="text-2xl font-semibold">MacBook Pro</h2>
              <p className={`mt-1 text-sm ${mutedText}`}>macOS Portfolio</p>

              <div
                className={`mt-6 rounded-2xl border ${
                  isDarkMode ? "border-white/10" : "border-black/10"
                } text-left`}
              >
                <AboutRow label="Owner" value="Shayan Shahani" />
                <AboutRow label="Version" value="0.1.0" />
                <AboutRow label="Chip" value="Apple M-Series Inspired" />
                <AboutRow label="Memory" value="16 GB Portfolio RAM" />
                <AboutRow label="Framework" value="Next.js + React" />
                <AboutRow label="Language" value="TypeScript" />
              </div>

              <button
                type="button"
                onClick={handleMoreInfo}
                className="mt-5 rounded-full bg-blue-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
              >
                More Info...
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FilledBatteryIcon({
  level,
  charging,
  isDarkMode,
}: {
  level: number;
  charging: boolean;
  isDarkMode: boolean;
}) {
  const safeLevel = Math.min(100, Math.max(0, level));
  const fillWidth = Math.max(8, safeLevel);
  const isLow = safeLevel <= 20;

  const fillClass = charging
    ? "bg-emerald-400"
    : isLow
      ? "bg-red-500"
      : isDarkMode
        ? "bg-white"
        : "bg-zinc-800";

  const borderClass = isLow
    ? "border-red-500"
    : isDarkMode
      ? "border-white"
      : "border-zinc-800";

  const capClass = isLow
    ? "bg-red-500"
    : isDarkMode
      ? "bg-white"
      : "bg-zinc-800";

  return (
    <div className="relative flex items-center">
      <div
        className={`relative h-[12px] w-[24px] overflow-hidden rounded-[3px] border ${borderClass}`}
      >
        <div
          className={`absolute left-[2px] top-[2px] h-[6px] rounded-[1.5px] ${fillClass}`}
          style={{ width: `calc(${fillWidth}% - 4px)` }}
        />

        {charging && (
          <Zap className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 fill-current text-zinc-900" />
        )}
      </div>

      <div className={`h-[6px] w-[2px] rounded-r-sm ${capClass}`} />
    </div>
  );
}

function MenuButton({
  icon,
  label,
  mutedLabel,
  onClick,
  hoverClass,
}: {
  icon: React.ReactNode;
  label: string;
  mutedLabel?: string;
  onClick: () => void;
  hoverClass: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${hoverClass}`}
    >
      <span className="flex h-5 w-5 items-center justify-center opacity-80">
        {icon}
      </span>

      <span className="flex-1">{label}</span>

      {mutedLabel && (
        <span className="text-xs text-zinc-400">{mutedLabel}</span>
      )}
    </button>
  );
}

function ModalTrafficButton({
  colorClass,
  icon,
  iconClass,
  onClick,
  label,
}: {
  colorClass: string;
  icon: React.ReactNode;
  iconClass: string;
  onClick?: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${colorClass}`}
    >
      <span
        className={`flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 ${iconClass}`}
      >
        {icon}
      </span>
    </button>
  );
}

function MacMaximizeIcon() {
  return (
    <svg
      viewBox="0 0 10 10"
      className="h-2.5 w-2.5 fill-current"
      aria-hidden="true"
    >
      <path d="M2 1h5.2L1 7.2V2a1 1 0 0 1 1-1Z" />
      <path d="M8 9H2.8L9 2.8V8a1 1 0 0 1-1 1Z" />
    </svg>
  );
}

function AboutRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-black/10 px-4 py-2.5 last:border-b-0 dark:border-white/10">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}
