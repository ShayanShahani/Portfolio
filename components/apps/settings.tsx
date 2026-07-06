"use client";

import { useEffect, useMemo, useState } from "react";
import type React from "react";
import {
  Bell,
  CheckCircle2,
  Clock,
  Globe,
  Keyboard,
  Lock,
  Monitor,
  Moon,
  SettingsIcon,
  Shield,
  Sun,
  User,
  Wifi,
  WifiOff,
} from "lucide-react";

interface SettingsProps {
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  brightness?: number;
  onBrightnessChange?: (value: number) => void;
}

type SectionId =
  | "general"
  | "appearance"
  | "wifi"
  | "notifications"
  | "security"
  | "keyboard"
  | "datetime";

interface SettingsSection {
  id: SectionId;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
}

export default function Settings({
  isDarkMode = true,
  onToggleDarkMode,
  brightness = 100,
  onBrightnessChange,
}: SettingsProps) {
  const [activeSection, setActiveSection] = useState<SectionId>("general");
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [keyboardRepeat, setKeyboardRepeat] = useState(65);

  const sections = useMemo<SettingsSection[]>(
    () => [
      {
        id: "general",
        name: "General",
        subtitle: "About this portfolio",
        icon: <SettingsIcon className="h-5 w-5" />,
      },
      {
        id: "appearance",
        name: "Appearance",
        subtitle: "Theme and display",
        icon: <Monitor className="h-5 w-5" />,
      },
      {
        id: "wifi",
        name: "Wi-Fi",
        subtitle: wifiEnabled ? "Connected" : "Off",
        icon: wifiEnabled ? (
          <Wifi className="h-5 w-5" />
        ) : (
          <WifiOff className="h-5 w-5" />
        ),
      },
      {
        id: "notifications",
        name: "Notifications",
        subtitle: notificationsEnabled ? "Enabled" : "Muted",
        icon: <Bell className="h-5 w-5" />,
      },
      {
        id: "security",
        name: "Privacy & Security",
        subtitle: "Local-only settings",
        icon: <Shield className="h-5 w-5" />,
      },
      {
        id: "keyboard",
        name: "Keyboard",
        subtitle: "Typing preferences",
        icon: <Keyboard className="h-5 w-5" />,
      },
      {
        id: "datetime",
        name: "Date & Time",
        subtitle: "System clock",
        icon: <Clock className="h-5 w-5" />,
      },
    ],
    [wifiEnabled, notificationsEnabled],
  );

  const activeSectionData = sections.find(
    (section) => section.id === activeSection,
  );

  const appClass = isDarkMode
    ? "bg-zinc-950 text-white"
    : "bg-zinc-100 text-zinc-950";

  const sidebarClass = isDarkMode
    ? "border-white/10 bg-white/[0.04]"
    : "border-black/10 bg-white/70";

  const cardClass = isDarkMode
    ? "border-white/10 bg-white/[0.07]"
    : "border-black/10 bg-white/80";

  const softBgClass = isDarkMode ? "bg-white/10" : "bg-black/5";
  const hoverClass = isDarkMode ? "hover:bg-white/10" : "hover:bg-black/5";
  const secondaryText = isDarkMode ? "text-zinc-400" : "text-zinc-500";
  const borderClass = isDarkMode ? "border-white/10" : "border-black/10";

  useEffect(() => {
    const savedWifi = localStorage.getItem("wifiEnabled");
    const savedNotifications = localStorage.getItem("notificationsEnabled");
    const savedKeyboardRepeat = localStorage.getItem("keyboardRepeat");

    if (savedWifi !== null) {
      setWifiEnabled(savedWifi === "true");
    }

    if (savedNotifications !== null) {
      setNotificationsEnabled(savedNotifications === "true");
    }

    if (savedKeyboardRepeat !== null) {
      const parsedKeyboardRepeat = Number(savedKeyboardRepeat);

      if (Number.isFinite(parsedKeyboardRepeat)) {
        setKeyboardRepeat(Math.min(100, Math.max(10, parsedKeyboardRepeat)));
      }
    }

    const handleWifiChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ wifiEnabled: boolean }>;

      if (typeof customEvent.detail?.wifiEnabled === "boolean") {
        setWifiEnabled(customEvent.detail.wifiEnabled);
      }
    };

    window.addEventListener("portfolio:wifi-change", handleWifiChange);

    return () => {
      window.removeEventListener("portfolio:wifi-change", handleWifiChange);
    };
  }, []);

  const setAppearanceMode = (darkModeEnabled: boolean) => {
    if (darkModeEnabled !== isDarkMode) {
      onToggleDarkMode?.();
    }
  };

  const updateBrightness = (value: number) => {
    onBrightnessChange?.(value);
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

  const updateNotifications = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    localStorage.setItem("notificationsEnabled", String(enabled));
  };

  const updateKeyboardRepeat = (value: number) => {
    setKeyboardRepeat(value);
    localStorage.setItem("keyboardRepeat", String(value));
  };

  return (
    <div className={`flex h-full overflow-hidden ${appClass}`}>
      <aside
        className={`w-72 shrink-0 border-r ${sidebarClass} backdrop-blur-xl p-3`}
      >
        <div className="mb-4 px-2 pt-1">
          <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
          <p className={`text-xs ${secondaryText}`}>
            Customize your portfolio desktop
          </p>
        </div>

        <div className="space-y-1">
          {sections.map((section) => {
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`w-full rounded-xl px-3 py-2.5 text-left transition ${
                  isActive ? "bg-blue-500 text-white shadow-sm" : hoverClass
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      isActive ? "bg-white/20" : softBgClass
                    }`}
                  >
                    {section.icon}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {section.name}
                    </p>
                    <p
                      className={`truncate text-xs ${
                        isActive ? "text-white/75" : secondaryText
                      }`}
                    >
                      {section.subtitle}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <h2 className="text-3xl font-semibold tracking-tight">
              {activeSectionData?.name}
            </h2>
            <p className={`mt-1 text-sm ${secondaryText}`}>
              {activeSectionData?.subtitle}
            </p>
          </div>

          {activeSection === "general" && (
            <div className="space-y-4">
              <SettingsCard className={cardClass}>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg">
                    <User className="h-8 w-8" />
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold">Shayan Shahani</h3>
                    <p className={`text-sm ${secondaryText}`}>
                      macOS-style interactive portfolio
                    </p>
                  </div>
                </div>
              </SettingsCard>

              <SettingsCard className={cardClass}>
                <SectionTitle
                  title="About"
                  description="Made with ❤️ using Next.js, React, TypeScript, and Tailwind CSS."
                  secondaryText={secondaryText}
                />

                <InfoRow
                  label="Portfolio Version"
                  value="1.0.0"
                  borderClass={borderClass}
                  secondaryText={secondaryText}
                />
                <InfoRow
                  label="Framework"
                  value="Next.js + React"
                  borderClass={borderClass}
                  secondaryText={secondaryText}
                />
                <InfoRow
                  label="Language"
                  value="TypeScript"
                  borderClass={borderClass}
                  secondaryText={secondaryText}
                />
                <InfoRow
                  label="Styling"
                  value="Tailwind CSS"
                  borderClass={borderClass}
                  secondaryText={secondaryText}
                />
              </SettingsCard>

              <SettingsCard className={cardClass}>
                <SectionTitle
                  title="Status"
                  description="The portfolio machine is awake."
                  secondaryText={secondaryText}
                />

                <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 px-4 py-3 text-emerald-500">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    Control Center and Settings are finally speaking the same
                    language!
                  </span>
                </div>
              </SettingsCard>
            </div>
          )}

          {activeSection === "appearance" && (
            <div className="space-y-4">
              <SettingsCard className={cardClass}>
                <SectionTitle
                  title="Appearance"
                  description="This controls the same theme used by Control Center."
                  secondaryText={secondaryText}
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <ThemeButton
                    title="Light"
                    description="Bright desktop appearance"
                    icon={<Sun className="h-5 w-5" />}
                    active={!isDarkMode}
                    onClick={() => setAppearanceMode(false)}
                    isDarkMode={isDarkMode}
                  />

                  <ThemeButton
                    title="Dark"
                    description="Dimmed desktop appearance"
                    icon={<Moon className="h-5 w-5" />}
                    active={isDarkMode}
                    onClick={() => setAppearanceMode(true)}
                    isDarkMode={isDarkMode}
                  />
                </div>
              </SettingsCard>

              <SettingsCard className={cardClass}>
                <SectionTitle
                  title="Display Brightness"
                  description="This controls the same brightness used by Control Center."
                  secondaryText={secondaryText}
                />

                <div className="flex items-center gap-4">
                  <Sun className={`h-5 w-5 ${secondaryText}`} />

                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={brightness}
                    onChange={(event) =>
                      updateBrightness(Number(event.target.value))
                    }
                    className="w-full accent-blue-500"
                  />

                  <span className="w-12 text-right text-sm font-medium">
                    {brightness}%
                  </span>
                </div>
              </SettingsCard>
            </div>
          )}

          {activeSection === "wifi" && (
            <div className="space-y-4">
              <SettingsCard className={cardClass}>
                <div className="flex items-center justify-between gap-4">
                  <SectionTitle
                    title="Wi-Fi"
                    description={
                      wifiEnabled
                        ? "Connected to Network"
                        : "Wi-Fi is turned off"
                    }
                    secondaryText={secondaryText}
                  />

                  <Switch
                    checked={wifiEnabled}
                    onChange={updateWifi}
                    label="Toggle Wi-Fi"
                  />
                </div>
              </SettingsCard>

              <SettingsCard className={cardClass}>
                <SectionTitle
                  title="Known Network"
                  description="No packets were harmed. This network is purely decorative."
                  secondaryText={secondaryText}
                />

                <div
                  className={`flex items-center justify-between rounded-2xl border ${borderClass} px-4 py-3`}
                >
                  <div className="flex items-center gap-3">
                    {wifiEnabled ? (
                      <Wifi className="h-5 w-5 text-blue-500" />
                    ) : (
                      <WifiOff className={`h-5 w-5 ${secondaryText}`} />
                    )}

                    <div>
                      <p className="text-sm font-medium">Lord of the pings</p>
                      <p className={`text-xs ${secondaryText}`}>
                        {wifiEnabled ? "Connected" : "Not connected"}
                      </p>
                    </div>
                  </div>

                  <Lock className={`h-4 w-4 ${secondaryText}`} />
                </div>
              </SettingsCard>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="space-y-4">
              <SettingsCard className={cardClass}>
                <div className="flex items-center justify-between gap-4">
                  <SectionTitle
                    title="Notifications"
                    description="Decide whether this little desktop is allowed to bother you."
                    secondaryText={secondaryText}
                  />

                  <Switch
                    checked={notificationsEnabled}
                    onChange={updateNotifications}
                    label="Toggle notifications"
                  />
                </div>
              </SettingsCard>

              <SettingsCard className={cardClass}>
                <InfoRow
                  label="Status"
                  value={notificationsEnabled ? "Enabled" : "Muted"}
                  borderClass={borderClass}
                  secondaryText={secondaryText}
                />
                <InfoRow
                  label="Alerts"
                  value="Portfolio tips and app status"
                  borderClass={borderClass}
                  secondaryText={secondaryText}
                />
              </SettingsCard>
            </div>
          )}

          {activeSection === "security" && (
            <div className="space-y-4">
              <SettingsCard className={cardClass}>
                <SectionTitle
                  title="Privacy"
                  description="Your preferences stay on this device, tucked safely inside your browser."
                  secondaryText={secondaryText}
                />

                <InfoRow
                  label="Storage"
                  value="Browser localStorage"
                  borderClass={borderClass}
                  secondaryText={secondaryText}
                />
                <InfoRow
                  label="Camera Access"
                  value="FaceTime preview only"
                  borderClass={borderClass}
                  secondaryText={secondaryText}
                />
                <InfoRow
                  label="Microphone Access"
                  value="Never requested"
                  borderClass={borderClass}
                  secondaryText={secondaryText}
                />
              </SettingsCard>

              <SettingsCard className={cardClass}>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("notificationsEnabled");
                    localStorage.removeItem("keyboardRepeat");
                    setNotificationsEnabled(true);
                    setKeyboardRepeat(65);
                  }}
                  className="rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
                >
                  Reset Settings App Preferences
                </button>

                <p className={`mt-3 text-xs ${secondaryText}`}>
                  Tiny reset button, tiny consequences.
                </p>
              </SettingsCard>
            </div>
          )}

          {activeSection === "keyboard" && (
            <div className="space-y-4">
              <SettingsCard className={cardClass}>
                <SectionTitle
                  title="Keyboard Repeat"
                  description="A decorative keyboard preference."
                  secondaryText={secondaryText}
                />

                <div className="flex items-center gap-4">
                  <Keyboard className={`h-5 w-5 ${secondaryText}`} />

                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={keyboardRepeat}
                    onChange={(event) =>
                      updateKeyboardRepeat(Number(event.target.value))
                    }
                    className="w-full accent-blue-500"
                  />

                  <span className="w-12 text-right text-sm font-medium">
                    {keyboardRepeat}%
                  </span>
                </div>
              </SettingsCard>
            </div>
          )}

          {activeSection === "datetime" && (
            <div className="space-y-4">
              <SettingsCard className={cardClass}>
                <SectionTitle
                  title="Date & Time"
                  description="Displayed from your device clock."
                  secondaryText={secondaryText}
                />

                <InfoRow
                  label="Current Date"
                  value={new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  borderClass={borderClass}
                  secondaryText={secondaryText}
                />

                <InfoRow
                  label="Current Time"
                  value={new Date().toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  borderClass={borderClass}
                  secondaryText={secondaryText}
                />

                <InfoRow
                  label="Time Zone"
                  value={Intl.DateTimeFormat().resolvedOptions().timeZone}
                  borderClass={borderClass}
                  secondaryText={secondaryText}
                />
              </SettingsCard>

              <SettingsCard className={cardClass}>
                <div className="flex items-center gap-3 rounded-2xl bg-blue-500/10 px-4 py-3 text-blue-500">
                  <Globe className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    Date and time are automatically provided by your browser.
                  </span>
                </div>
              </SettingsCard>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function SettingsCard({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-3xl border p-5 shadow-sm backdrop-blur-xl ${className}`}
    >
      {children}
    </section>
  );
}

function SectionTitle({
  title,
  description,
  secondaryText,
}: {
  title: string;
  description: string;
  secondaryText: string;
}) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className={`mt-1 text-sm ${secondaryText}`}>{description}</p>
    </div>
  );
}

function InfoRow({
  label,
  value,
  borderClass,
  secondaryText,
}: {
  label: string;
  value: string;
  borderClass: string;
  secondaryText: string;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 border-t ${borderClass} py-3 first:border-t-0 first:pt-0 last:pb-0`}
    >
      <span className={`text-sm ${secondaryText}`}>{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}

function ThemeButton({
  title,
  description,
  icon,
  active,
  onClick,
  isDarkMode,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  isDarkMode: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${
        active
          ? "border-blue-500 bg-blue-500/15"
          : isDarkMode
            ? "border-white/10 bg-white/5 hover:bg-white/10"
            : "border-black/10 bg-black/5 hover:bg-black/10"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            isDarkMode ? "bg-white/10" : "bg-black/5"
          }`}
        >
          {icon}
        </div>

        {active && <CheckCircle2 className="h-5 w-5 text-blue-500" />}
      </div>

      <p className="text-sm font-semibold">{title}</p>
      <p
        className={
          isDarkMode
            ? "mt-1 text-xs text-zinc-400"
            : "mt-1 text-xs text-zinc-500"
        }
      >
        {description}
      </p>
    </button>
  );
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition ${
        checked ? "bg-blue-500" : "bg-zinc-500"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}
