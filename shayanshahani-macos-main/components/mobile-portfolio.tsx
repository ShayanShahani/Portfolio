"use client";

import type React from "react";

import { useState } from "react";
import {
  Github,
  Linkedin,
  Menu,
  Moon,
  Star,
  Sun,
  X,
  Youtube,
} from "lucide-react";

interface MobilePortfolioProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

type MobilePage = "home" | "blog" | "projects" | "about" | "uses";

export default function MobilePortfolio({
  isDarkMode,
  onToggleDarkMode,
}: MobilePortfolioProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<MobilePage>("home");

  const isHomePage = currentPage === "home";

  const pageClass = isDarkMode
    ? "bg-[#050505] text-white"
    : "bg-[#f5efe6] text-zinc-950";

  const headerClass = isDarkMode
    ? "bg-[#050505] text-white"
    : "bg-[#f5efe6] text-zinc-950";

  const footerClass = isDarkMode
    ? "bg-[#171d2a] text-white"
    : "bg-[#e7dccd] text-zinc-950";

  const menuClass = isDarkMode
    ? "border-white/10 bg-[#101624] text-white"
    : "border-black/10 bg-white/80 text-zinc-950";

  const mutedText = isDarkMode ? "text-zinc-300" : "text-zinc-700";
  const footerMutedText = isDarkMode ? "text-zinc-400" : "text-zinc-600";

  const logoSrc = isDarkMode ? "/favicon-dark.svg" : "/favicon-light.svg";
  const profileSrc = isDarkMode
    ? "/ProfilePictureDark.png"
    : "/ProfilePictureLight.png";

  const openLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const goToPage = (page: MobilePage) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
  };

  return (
    <main
      className={`flex flex-col ${pageClass} ${
        isHomePage ? "h-svh overflow-hidden" : "min-h-screen overflow-x-hidden"
      }`}
    >
      <style>
        {`
          @keyframes mobileTextIn {
            from {
              opacity: 0;
              transform: translateY(18px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes mobileImageIn {
            from {
              opacity: 0;
              transform: scale(0.94);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          .mobile-text-in {
            animation: mobileTextIn 700ms ease-out both;
          }

          .mobile-image-in {
            animation: mobileImageIn 700ms ease-out both;
          }
        `}
      </style>

      <header className={`shrink-0 ${headerClass}`}>
        <div className="mx-auto max-w-3xl px-5 py-2.5">
          <nav className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => goToPage("home")}
              className="flex items-center"
              aria-label="Go to home"
            >
              <img
                src={logoSrc}
                alt="Shayan logo"
                className="h-11 w-11 object-contain"
              />
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleDarkMode}
                className="flex h-10 w-10 items-center justify-center rounded-md transition hover:bg-white/10"
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-yellow-300" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
                className="flex h-10 w-10 items-center justify-center rounded-md transition hover:bg-white/10"
                aria-expanded={isMenuOpen}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="h-7 w-7" />
                ) : (
                  <Menu className="h-7 w-7" />
                )}
              </button>
            </div>
          </nav>

          {isMenuOpen && (
            <div
              className={`mt-3 rounded-2xl border px-4 py-3 text-center shadow-xl ${menuClass}`}
            >
              <MenuItem label="BLOG" onClick={() => goToPage("blog")} />
              <MenuItem label="PROJECTS" onClick={() => goToPage("projects")} />
              <MenuItem label="ABOUT" onClick={() => goToPage("about")} />
              <MenuItem label="USES" onClick={() => goToPage("uses")} />
            </div>
          )}
        </div>
      </header>

      <section
        className={
          isHomePage
            ? "min-h-0 flex-1 overflow-hidden"
            : "flex-1 overflow-visible"
        }
      >
        {isHomePage ? (
          <div className="flex h-full items-center justify-center px-5 text-center">
            <div className="mx-auto max-w-2xl">
              <div className="mobile-image-in mx-auto mb-8 h-[min(54vw,17rem)] w-[min(54vw,17rem)] overflow-hidden rounded-full">
                <img
                  src={profileSrc}
                  alt="Shayan Shahani"
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src = "/ProfilePicture.png";
                  }}
                />
              </div>

              <div className="mobile-text-in">
                <p
                  className={`mx-auto max-w-xl text-[15px] font-medium leading-8 sm:text-lg ${mutedText}`}
                >
                  I&apos;m Shayan, a Software Engineer based in Tehran,
                  passionate about building clean, efficient, and impactful
                  software solutions.
                </p>

                <p
                  className={`mx-auto mt-4 max-w-xl text-[15px] font-medium leading-8 sm:text-lg ${mutedText}`}
                >
                  I enjoy turning ideas into products, solving complex problems,
                  and continuously learning new technologies.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <MobileInnerPage
            page={currentPage}
            isDarkMode={isDarkMode}
            mutedText={mutedText}
          />
        )}
      </section>

      <footer className={`shrink-0 text-center ${footerClass}`}>
        <div className="px-5 py-5">
          <h2 className="mb-4 text-xl font-semibold">You can find me at</h2>

          <div className="flex items-center justify-center gap-6">
            <SocialButton
              label="GitHub"
              onClick={() => openLink("https://github.com/ShayanShahani")}
            >
              <Github className="h-8 w-8" />
            </SocialButton>

            <SocialButton
              label="LinkedIn"
              onClick={() =>
                openLink("https://www.linkedin.com/in/shayanshahani/")
              }
            >
              <Linkedin className="h-8 w-8" />
            </SocialButton>

            <SocialButton
              label="Twitter"
              onClick={() => openLink("https://twitter.com/myTwitter")}
            >
              <TwitterIcon />
            </SocialButton>

            <SocialButton
              label="YouTube"
              onClick={() =>
                openLink("https://www.youtube.com/@shayan.shahani")
              }
            >
              <Youtube className="h-8 w-8" />
            </SocialButton>
          </div>
        </div>

        {!isHomePage && (
          <div
            className={`border-t px-5 py-3 text-sm ${
              isDarkMode ? "border-white/10" : "border-black/10"
            } ${footerMutedText}`}
          >
            Copyright © 2026{" "}
            <button
              type="button"
              onClick={() => goToPage("home")}
              className={`font-medium ${
                isDarkMode
                  ? "text-white hover:text-zinc-300"
                  : "text-zinc-950 hover:text-zinc-600"
              }`}
            >
              Shayan
            </button>
          </div>
        )}
      </footer>
    </main>
  );
}

function MenuItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full rounded-xl px-3 py-3 text-sm font-semibold uppercase tracking-[0.25em] transition hover:bg-white/10"
    >
      {label}
    </button>
  );
}

function MobileInnerPage({
  page,
  isDarkMode,
  mutedText,
}: {
  page: Exclude<MobilePage, "home">;
  isDarkMode: boolean;
  mutedText: string;
}) {
  if (page === "about") {
    return <AboutMobilePage isDarkMode={isDarkMode} mutedText={mutedText} />;
  }

  const content = {
    blog: {
      title: "Blog",
      emoji: "✍🏻",
      text: "A place for notes, ideas and lessons learned in my journey.",
    },
    projects: {
      title: "Projects",
      emoji: "🚀",
      text: "A collection of products, experiments, workflow tools, and interfaces I have built or improved.",
    },
    uses: {
      title: "Uses",
      emoji: "🛠️",
      text: "Tools, apps, technologies, and setup details that help me design, build, and ship software.",
    },
  }[page];

  return (
    <div className="flex min-h-[70svh] items-center justify-center px-5 py-10 text-center">
      <div
        className={`mx-auto max-w-xl rounded-3xl border p-7 shadow-xl ${
          isDarkMode
            ? "border-white/10 bg-white/[0.04]"
            : "border-black/10 bg-white/80"
        }`}
      >
        <div className="mb-5 text-5xl">{content.emoji}</div>

        <h1 className="text-3xl font-bold tracking-tight">{content.title}</h1>

        <p className={`mt-5 text-base leading-8 ${mutedText}`}>
          {content.text}
        </p>

        <p className={`mt-6 text-sm ${mutedText}`}>
          This page is gradually being completed.
        </p>
      </div>
    </div>
  );
}

function AboutMobilePage({
  isDarkMode,
  mutedText,
}: {
  isDarkMode: boolean;
  mutedText: string;
}) {
  const profileSrc = "/AboutPicture.png";

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <h2
        className={`text-center text-3xl font-bold uppercase ${
          isDarkMode ? "text-zinc-400" : "text-zinc-600"
        }`}
      >
        About me
      </h2>

      <AboutDivider isDarkMode={isDarkMode} />

      <div className="mt-8 flex flex-col items-center">
        <h1 className="mb-8 text-center text-4xl font-semibold tracking-tight">
          Hello ! I&apos;m Shayan
        </h1>

        <div className="mb-8 w-full text-center">
          <img
            src={profileSrc}
            alt="Shayan Shahani"
            className="mx-auto h-auto max-w-full rounded-3xl"
            onError={(event) => {
              event.currentTarget.src = "/ProfilePicture.png";
            }}
          />
        </div>

        <div className={`space-y-6 text-base leading-8 ${mutedText}`}>
          <p>
            I&apos;m a software engineer passionate about building products that
            are both useful and enjoyable to use. I&apos;ve worked across the
            full stack, designing and developing web applications, business
            process automation systems, and enterprise solutions with a strong
            focus on scalability, maintainability, and user experience.
          </p>

          <p>
            Lately, much of my curiosity revolves around Artificial
            Intelligence, automation, and developer tools. I enjoy exploring how
            emerging technologies can improve the way we build software and make
            everyday work more efficient. I&apos;m a firm believer that great
            engineering is not only about writing code, but also about
            continuously learning, sharing ideas, and staying curious.
          </p>

          <p>
            When I&apos;m away from the keyboard, you&apos;ll probably find me
            playing video games, watching movies or TV series, following
            basketball, or going down internet rabbit holes about the latest
            tech trends. I love deep conversations, ambitious ideas, and the
            excitement of discovering something new.
          </p>
        </div>
      </div>
    </div>
  );
}

function AboutDivider({ isDarkMode }: { isDarkMode: boolean }) {
  const lineClass = isDarkMode ? "bg-zinc-600" : "bg-zinc-400";
  const iconClass = isDarkMode ? "text-zinc-400" : "text-zinc-600";

  return (
    <div className="mx-auto mt-5 flex max-w-xs items-center justify-center gap-4">
      <div className={`h-px flex-1 ${lineClass}`} />

      <Star className={`h-4 w-4 fill-current ${iconClass}`} />

      <div className={`h-px flex-1 ${lineClass}`} />
    </div>
  );
}

function SocialButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="transition hover:scale-110"
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

function TwitterIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-8 w-8 fill-current"
      aria-hidden="true"
    >
      <path d="M18.244 2H21.5l-7.11 8.13L22.75 22h-6.54l-5.12-6.68L5.23 22H1.97l7.6-8.69L1.55 2h6.7l4.63 6.12L18.244 2Zm-1.14 17.91h1.8L7.27 3.99H5.34l11.764 15.92Z" />
    </svg>
  );
}
