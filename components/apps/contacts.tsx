"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";

interface ContactsProps {
  isDarkMode?: boolean;
}

type ContactType = "phone" | "email" | "github" | "linkedin" | "telegram";

interface ContactItem {
  id: ContactType;
  emoji: string;
  title: string;
  subtitle: string;
  value: string;
  href?: string;
  description: string;
}

const contacts: ContactItem[] = [
  {
    id: "phone",
    emoji: "📱",
    title: "Phone",
    subtitle: "Call or message me",
    value: "+98 910 172 7229",
    href: "tel:+989101727229",
    description:
      "The fastest way to reach me for urgent questions, project discussions, or quick coordination.",
  },
  {
    id: "email",
    emoji: "✉️",
    title: "Email",
    subtitle: "Professional contact",
    value: "shayangeek@gmail.com",
    href: "mailto:shayangeek@gmail.com",
    description:
      "Best for formal messages, collaboration requests, project details, and longer conversations.",
  },
  {
    id: "github",
    emoji: "🐙",
    title: "GitHub",
    subtitle: "Code and projects",
    value: "github.com/ShayanShahani",
    href: "https://github.com/ShayanShahani",
    description:
      "Explore my source code, personal projects, experiments, and development work.",
  },
  {
    id: "linkedin",
    emoji: "💼",
    title: "LinkedIn",
    subtitle: "Professional profile",
    value: "linkedin.com/in/shayan-shahani",
    href: "https://linkedin.com/in/shayan-shahani",
    description:
      "Connect with me professionally and view my work experience, skills, and career background.",
  },
  {
    id: "telegram",
    emoji: "💬",
    title: "Telegram",
    subtitle: "Quick chat",
    value: "@ShayanShahani",
    href: "https://t.me/ShayanShahani",
    description:
      "A simple way to start a quick conversation, ask questions, or stay in touch.",
  },
];

export default function Contacts({ isDarkMode = true }: ContactsProps) {
  const [selectedContactId, setSelectedContactId] =
    useState<ContactType>("phone");
  const [copiedContactId, setCopiedContactId] = useState<ContactType | null>(
    null,
  );

  const selectedContact =
    contacts.find((contact) => contact.id === selectedContactId) ?? contacts[0];

  const bgColor = isDarkMode ? "bg-zinc-950" : "bg-zinc-100";
  const windowBg = isDarkMode ? "bg-zinc-900" : "bg-white";
  const sidebarBg = isDarkMode ? "bg-zinc-900/95" : "bg-zinc-50/95";
  const borderColor = isDarkMode ? "border-zinc-800" : "border-zinc-200";
  const textColor = isDarkMode ? "text-zinc-100" : "text-zinc-900";
  const mutedText = isDarkMode ? "text-zinc-400" : "text-zinc-500";
  const softText = isDarkMode ? "text-zinc-300" : "text-zinc-600";
  const cardBg = isDarkMode ? "bg-zinc-800/70" : "bg-zinc-100";
  const hoverBg = isDarkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-200/70";
  const selectedBg = isDarkMode
    ? "bg-blue-500/20 text-blue-300"
    : "bg-blue-100 text-blue-700";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedContact.value);
      setCopiedContactId(selectedContact.id);

      window.setTimeout(() => {
        setCopiedContactId(null);
      }, 1400);
    } catch (error) {
      console.error("Failed to copy contact:", error);
    }
  };

  return (
    <div className={`h-full ${bgColor} ${textColor} flex overflow-hidden`}>
      <div className={`h-full w-full ${windowBg} flex overflow-hidden`}>
        {/* Sidebar */}
        <aside
          className={`
            w-64 min-w-64 border-r ${borderColor} ${sidebarBg}
            flex flex-col
          `}
        >
          <div className={`px-4 py-4 border-b ${borderColor}`}>
            <h2 className="text-lg font-semibold tracking-tight">Contacts</h2>
            <p className={`text-xs mt-1 ${mutedText}`}>
              Personal and professional links
            </p>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {contacts.map((contact) => {
              const isSelected = selectedContactId === contact.id;

              return (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => setSelectedContactId(contact.id)}
                  className={`
                    w-full flex items-center gap-3 rounded-xl px-3 py-3
                    text-left transition-all
                    ${isSelected ? selectedBg : hoverBg}
                  `}
                >
                  <span
                    className={`
                      w-10 h-10 rounded-xl flex items-center justify-center
                      text-xl shrink-0
                      ${isDarkMode ? "bg-zinc-800" : "bg-white"}
                      ${isSelected ? "shadow-sm" : ""}
                    `}
                  >
                    {contact.emoji}
                  </span>

                  <span className="min-w-0">
                    <span className="block text-sm font-medium truncate">
                      {contact.title}
                    </span>
                    <span className={`block text-xs truncate ${mutedText}`}>
                      {contact.subtitle}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>

          <div className={`p-4 border-t ${borderColor}`}>
            <div
              className={`
                rounded-2xl p-3 text-xs leading-relaxed
                ${
                  isDarkMode
                    ? "bg-zinc-800/60 text-zinc-400"
                    : "bg-white text-zinc-500"
                }
              `}
            >
              Select a contact method from the sidebar to copy or open it.
            </div>
          </div>
        </aside>

        {/* Main detail panel */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <section className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto">
              <div
                className={`
                  rounded-3xl border ${borderColor} ${cardBg}
                  p-6 shadow-sm
                `}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`
                      w-24 h-24 rounded-3xl flex items-center justify-center
                      text-5xl mb-4
                      ${isDarkMode ? "bg-zinc-900" : "bg-white"}
                      shadow-sm
                    `}
                  >
                    {selectedContact.emoji}
                  </div>

                  <h1 className="text-2xl font-semibold tracking-tight">
                    {selectedContact.title}
                  </h1>

                  <p className={`text-sm mt-1 ${mutedText}`}>
                    {selectedContact.subtitle}
                  </p>

                  <p
                    className={`max-w-md text-sm mt-4 leading-relaxed ${softText}`}
                  >
                    {selectedContact.description}
                  </p>
                </div>

                <div
                  className={`
                    mt-6 rounded-2xl border ${borderColor}
                    ${isDarkMode ? "bg-zinc-950/60" : "bg-white"}
                    p-4
                  `}
                >
                  <p
                    className={`text-xs uppercase tracking-wide mb-2 ${mutedText}`}
                  >
                    Contact detail
                  </p>

                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm sm:text-base font-medium break-all">
                      {selectedContact.value}
                    </p>

                    <button
                      type="button"
                      onClick={handleCopy}
                      className={`
                        shrink-0 inline-flex items-center gap-2 rounded-xl
                        px-3 py-2 text-sm font-medium transition
                        ${
                          copiedContactId === selectedContact.id
                            ? "bg-green-500 text-white"
                            : isDarkMode
                              ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
                              : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
                        }
                      `}
                    >
                      {copiedContactId === selectedContact.id ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  {selectedContact.href && (
                    <a
                      href={selectedContact.href}
                      target={
                        selectedContact.href.startsWith("http")
                          ? "_blank"
                          : undefined
                      }
                      rel={
                        selectedContact.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className={`
                        flex-1 inline-flex items-center justify-center gap-2
                        rounded-2xl px-4 py-3 text-sm font-medium
                        bg-blue-500 hover:bg-blue-600 text-white
                        transition
                      `}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open {selectedContact.title}
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`
                      flex-1 inline-flex items-center justify-center gap-2
                      rounded-2xl px-4 py-3 text-sm font-medium
                      transition
                      ${
                        isDarkMode
                          ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
                          : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
                      }
                    `}
                  >
                    <Copy className="w-4 h-4" />
                    Copy Detail
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
