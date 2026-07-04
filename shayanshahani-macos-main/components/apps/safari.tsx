"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Github,
  Globe,
  Home,
  Lock,
  RefreshCw,
  Search,
  Star,
  Wifi,
  WifiOff,
} from "lucide-react";

interface SafariProps {
  isDarkMode?: boolean;
}

type SafariPage = "home" | "portfolio" | "social" | "projects";

interface SafariLink {
  title: string;
  url: string;
  icon: string;
  description?: string;
  page?: SafariPage;
}

const socialLinks: SafariLink[] = [
  {
    title: "GitHub",
    url: "https://github.com/ShayanShahani",
    icon: "/github.png",
    description: "Repositories, code experiments, and project source files",
  },
  {
    title: "YouTube",
    url: "https://www.youtube.com/@shayan.shahani",
    icon: "/youtube.png",
    description: "Videos, demos, and technical content",
  },
  {
    title: "LinkedIn",
    url: "https://www.linkedin.com/in/shayanshahani/",
    icon: "/linkedin.png",
    description: "Professional profile and work updates",
  },
  {
    title: "Email",
    url: "mailto:my@domainmmail.com",
    icon: "/mail.png",
    description: "Send me a direct message",
  },
  {
    title: "Stack Overflow",
    url: "https://stackoverflow.com",
    icon: "/stackoverflow.png",
    description: "Where bugs go to become questions",
  },
  {
    title: "LeetCode",
    url: "https://leetcode.com",
    icon: "/leetcode.png",
    description: "Algorithm practice and problem solving",
  },
];

const favoriteLinks: SafariLink[] = socialLinks.filter((link) =>
  ["GitHub", "YouTube", "LinkedIn"].includes(link.title),
);

const frequentlyVisited: SafariLink[] = [
  {
    title: "Email",
    url: "mailto:my@domainmmail.com",
    icon: "/mail.png",
    description: "Send me a direct message",
  },
  {
    title: "ChatGPT",
    url: "https://chatgpt.com",
    icon: "/chatgpt.png",
    description: "Open ChatGPT in a new tab",
  },
  {
    title: "Stack Overflow",
    url: "https://stackoverflow.com",
    icon: "/stackoverflow.png",
    description: "Where bugs go to become questions",
  },
  {
    title: "LeetCode",
    url: "https://leetcode.com",
    icon: "/leetcode.png",
    description: "Algorithm practice and problem solving",
  },
];

const projectCards = [
  {
    title: "macOS Portfolio",
    description:
      "An interactive desktop-style portfolio with draggable windows, synced settings, Control Center, many apps, and macOS-inspired UI details.",
    tag: "Portfolio",
    url: "https://github.com/ShayanShahani/Portfolio",
  },
  {
    title: "Second Project",
    description: "Description of second project.",
    tag: "Project2",
    url: "https://github.com/ShayanShahani",
  },
  {
    title: "Third Project",
    description: "Description of third project.",
    tag: "Project3",
    url: "https://github.com/ShayanShahani",
  },
];

export default function Safari({ isDarkMode = true }: SafariProps) {
  const [url, setUrl] = useState("https://shayanshahani.dev");
  const [currentPage, setCurrentPage] = useState<SafariPage>("home");
  const [isLoading, setIsLoading] = useState(false);
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [history, setHistory] = useState<SafariPage[]>(["home"]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(true);

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;

  const pageTitle = useMemo(() => {
    if (currentPage === "portfolio") return "Shayan Shahani";
    if (currentPage === "social") return "Social Links";
    if (currentPage === "projects") return "Projects";
    return "Start Page";
  }, [currentPage]);

  const appBg = isDarkMode
    ? "bg-zinc-950 text-white"
    : "bg-zinc-100 text-zinc-900";

  const toolbarBg = isDarkMode
    ? "border-white/10 bg-zinc-900/90"
    : "border-black/10 bg-white/80";

  const tabBg = isDarkMode
    ? "border-white/10 bg-zinc-900/80"
    : "border-black/10 bg-white/70";

  const fieldBg = isDarkMode
    ? "bg-white/10 text-white"
    : "bg-black/5 text-zinc-900";

  const cardBg = isDarkMode
    ? "border-white/10 bg-white/[0.07]"
    : "border-black/10 bg-white/80";

  const softBg = isDarkMode ? "bg-white/10" : "bg-black/5";
  const hoverBg = isDarkMode ? "hover:bg-white/10" : "hover:bg-black/5";
  const mutedText = isDarkMode ? "text-zinc-400" : "text-zinc-500";
  const borderClass = isDarkMode ? "border-white/10" : "border-black/10";

  useEffect(() => {
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

    window.addEventListener("portfolio:wifi-change", handleWifiChange);

    return () => {
      window.removeEventListener("portfolio:wifi-change", handleWifiChange);
    };
  }, []);

  const simulateLoading = () => {
    setIsLoading(true);

    window.setTimeout(() => {
      setIsLoading(false);
    }, 650);
  };

  const navigateToPage = (page: SafariPage, nextUrl: string) => {
    simulateLoading();
    setCurrentPage(page);
    setUrl(nextUrl);

    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(page);

    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  };

  const handleRefresh = () => {
    simulateLoading();
  };

  const handleHome = () => {
    navigateToPage("home", "https://shayanshahani.dev");
  };

  const handleBack = () => {
    if (!canGoBack) return;

    const nextIndex = historyIndex - 1;
    const nextPage = history[nextIndex];

    setHistoryIndex(nextIndex);
    setCurrentPage(nextPage);
    setUrl(getUrlForPage(nextPage));
    simulateLoading();
  };

  const handleForward = () => {
    if (!canGoForward) return;

    const nextIndex = historyIndex + 1;
    const nextPage = history[nextIndex];

    setHistoryIndex(nextIndex);
    setCurrentPage(nextPage);
    setUrl(getUrlForPage(nextPage));
    simulateLoading();
  };

  const handleSubmitUrl = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedUrl = url.trim().toLowerCase();

    if (
      normalizedUrl.includes("project") ||
      normalizedUrl.includes("portfolio://projects")
    ) {
      navigateToPage("projects", "portfolio://projects");
      return;
    }

    if (
      normalizedUrl.includes("social") ||
      normalizedUrl.includes("linkedin") ||
      normalizedUrl.includes("github")
    ) {
      navigateToPage("social", "portfolio://social-links");
      return;
    }

    navigateToPage("portfolio", url.trim() || "https://shayanshahani.dev");
  };

  const handleOpenLink = (link: SafariLink) => {
    if (link.title === "ChatGPT") {
      window.open(link.url, "_blank", "noopener,noreferrer");
      return;
    }

    setUrl(link.url);
    navigateToPage("social", "portfolio://social-links");
  };

  const openExternal = () => {
    if (url.startsWith("mailto:")) {
      window.location.href = url;
      return;
    }

    if (url.startsWith("http")) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className={`flex h-full flex-col overflow-hidden ${appBg}`}>
      <div className={`shrink-0 border-b ${toolbarBg} backdrop-blur-xl`}>
        <div className="flex items-center gap-2 px-3 py-2">
          <ToolbarButton
            disabled={!canGoBack}
            onClick={handleBack}
            isDarkMode={isDarkMode}
            label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            disabled={!canGoForward}
            onClick={handleForward}
            isDarkMode={isDarkMode}
            label="Forward"
          >
            <ArrowRight className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={handleRefresh}
            isDarkMode={isDarkMode}
            label="Refresh"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </ToolbarButton>

          <ToolbarButton
            onClick={handleHome}
            isDarkMode={isDarkMode}
            label="Home"
          >
            <Home className="h-4 w-4" />
          </ToolbarButton>

          <form
            onSubmit={handleSubmitUrl}
            className={`flex flex-1 items-center rounded-xl px-3 py-1.5 ${fieldBg}`}
          >
            <Lock className={`mr-2 h-3.5 w-3.5 ${mutedText}`} />
            <input
              type="text"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className="w-full bg-transparent text-sm outline-none"
              spellCheck={false}
            />
          </form>

          <ToolbarButton
            onClick={() => setIsFavorite((currentValue) => !currentValue)}
            isDarkMode={isDarkMode}
            label="Favorite"
          >
            <Star
              className={`h-4 w-4 ${
                isFavorite ? "fill-yellow-400 text-yellow-400" : ""
              }`}
            />
          </ToolbarButton>

          <ToolbarButton
            onClick={openExternal}
            isDarkMode={isDarkMode}
            label="Open external"
          >
            <ExternalLink className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <div className={`flex items-center border-t ${borderClass} px-3`}>
          <div
            className={`mt-1 flex min-w-40 items-center gap-2 rounded-t-xl border-x border-t ${borderClass} px-3 py-1.5 text-sm ${tabBg}`}
          >
            <Globe className="h-3.5 w-3.5 text-blue-500" />
            <span className="truncate">{pageTitle}</span>
          </div>
        </div>
      </div>

      <div className="relative flex-1 overflow-auto">
        {isLoading && (
          <div className="absolute left-0 top-0 z-10 h-0.5 w-full overflow-hidden bg-blue-500/20">
            <div className="h-full w-1/2 animate-pulse bg-blue-500" />
          </div>
        )}

        {!wifiEnabled ? (
          <NoInternetView
            isDarkMode={isDarkMode}
            mutedText={mutedText}
            softBg={softBg}
            onRefresh={handleRefresh}
          />
        ) : (
          <div className="min-h-full">
            {currentPage === "home" && (
              <StartPage
                isDarkMode={isDarkMode}
                mutedText={mutedText}
                cardBg={cardBg}
                hoverBg={hoverBg}
                socialLinks={favoriteLinks}
                frequentlyVisited={frequentlyVisited}
                onOpenLink={handleOpenLink}
                onOpenProjects={() =>
                  navigateToPage("projects", "portfolio://projects")
                }
                onOpenPortfolio={() =>
                  navigateToPage("portfolio", "https://shayanshahani.dev")
                }
              />
            )}

            {currentPage === "portfolio" && (
              <PortfolioPage
                mutedText={mutedText}
                cardBg={cardBg}
                onOpenProjects={() =>
                  navigateToPage("projects", "portfolio://projects")
                }
              />
            )}

            {currentPage === "social" && (
              <SocialPage
                mutedText={mutedText}
                cardBg={cardBg}
                hoverBg={hoverBg}
                socialLinks={socialLinks}
              />
            )}

            {currentPage === "projects" && (
              <ProjectsPage
                mutedText={mutedText}
                cardBg={cardBg}
                borderClass={borderClass}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function getUrlForPage(page: SafariPage) {
  if (page === "home") return "https://shayanshahani.dev";
  if (page === "portfolio") return "https://shayanshahani.dev";
  if (page === "social") return "portfolio://social-links";
  return "portfolio://projects";
}

function ToolbarButton({
  children,
  onClick,
  isDarkMode,
  disabled = false,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  isDarkMode: boolean;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`rounded-lg p-1.5 transition ${
        disabled
          ? "cursor-not-allowed opacity-35"
          : isDarkMode
            ? "hover:bg-white/10"
            : "hover:bg-black/5"
      }`}
    >
      {children}
    </button>
  );
}

function NoInternetView({
  isDarkMode,
  mutedText,
  softBg,
  onRefresh,
}: {
  isDarkMode: boolean;
  mutedText: string;
  softBg: string;
  onRefresh: () => void;
}) {
  return (
    <div className="flex h-full min-h-[420px] flex-col items-center justify-center p-8 text-center">
      <div
        className={`mb-6 flex h-24 w-24 items-center justify-center rounded-full ${softBg}`}
      >
        <WifiOff
          className={`h-12 w-12 ${isDarkMode ? "text-zinc-600" : "text-zinc-400"}`}
        />
      </div>

      <h2 className="mb-2 text-xl font-semibold">
        You Are Not Connected to the Internet
      </h2>

      <p className={`mb-6 max-w-md ${mutedText}`}>
        Safari can’t open this page because your Wi-Fi is currently switched
        off.
      </p>

      <button
        type="button"
        className="rounded-full bg-blue-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
        onClick={onRefresh}
      >
        Try Again
      </button>
    </div>
  );
}

function StartPage({
  mutedText,
  cardBg,
  hoverBg,
  socialLinks,
  frequentlyVisited,
  onOpenLink,
  onOpenProjects,
  onOpenPortfolio,
}: {
  isDarkMode: boolean;
  mutedText: string;
  cardBg: string;
  hoverBg: string;
  socialLinks: SafariLink[];
  frequentlyVisited: SafariLink[];
  onOpenLink: (link: SafariLink) => void;
  onOpenProjects: () => void;
  onOpenPortfolio: () => void;
}) {
  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Search engine</h1>
        <p className={`mt-2 text-sm ${mutedText}`}>
          Browse the tiny web inside my macOS portfolio.
        </p>

        <div className="mx-auto mt-6 flex max-w-xl items-center rounded-2xl bg-white/10 px-4 py-3 shadow-sm ring-1 ring-black/5">
          <Search className={`mr-3 h-5 w-5 ${mutedText}`} />
          <span className={`text-sm ${mutedText}`}>
            Search or enter a portfolio URL
          </span>
        </div>
      </div>

      <SectionHeader title="Favorites" mutedText={mutedText} />

      <IconGrid links={socialLinks} hoverBg={hoverBg} onOpenLink={onOpenLink} />

      <SectionHeader title="Frequently Visited" mutedText={mutedText} />

      <IconGrid
        links={frequentlyVisited}
        hoverBg={hoverBg}
        onOpenLink={onOpenLink}
      />

      <div className={`mt-10 rounded-3xl border p-6 shadow-sm ${cardBg}`}>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Shayan Shahani</h2>
            <p className={`mt-2 max-w-xl text-sm leading-6 ${mutedText}`}>
              Welcome to my portfolio desktop. This Safari app acts like a
              browser, but it is also a guided tour through my links, projects
              and experiments.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onOpenPortfolio}
              className="rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
            >
              View Profile
            </button>

            <button
              type="button"
              onClick={onOpenProjects}
              className="rounded-full bg-zinc-500/15 px-4 py-2 text-sm font-medium transition hover:bg-zinc-500/25"
            >
              Projects
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PortfolioPage({
  mutedText,
  cardBg,
  onOpenProjects,
}: {
  mutedText: string;
  cardBg: string;
  onOpenProjects: () => void;
}) {
  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className={`rounded-3xl border p-8 shadow-sm ${cardBg}`}>
        <p className="mb-3 text-sm font-medium text-blue-500">
          shayanshahani.dev
        </p>

        <h1 className="text-4xl font-semibold tracking-tight">
          Shayan Shahani
        </h1>

        <p className={`mt-4 max-w-2xl leading-7 ${mutedText}`}>
          I build practical software with a strong focus on usability,
          responsive design, and smooth user experiences. My work moves between
          frontend, backend, interface design, and interactive web applications.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {["React", "Next.js", "TypeScript", "Tailwind", "UI/UX"].map(
            (skill) => (
              <span
                key={skill}
                className="rounded-full bg-blue-500/10 px-3 py-1 text-sm text-blue-500"
              >
                {skill}
              </span>
            ),
          )}
        </div>

        <button
          type="button"
          onClick={onOpenProjects}
          className="mt-8 rounded-full bg-blue-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
        >
          Explore Projects
        </button>
      </div>
    </div>
  );
}

function SocialPage({
  mutedText,
  cardBg,
  hoverBg,
  socialLinks,
}: {
  mutedText: string;
  cardBg: string;
  hoverBg: string;
  socialLinks: SafariLink[];
}) {
  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-2 text-3xl font-semibold">Social Links</h1>
      <p className={`mb-6 ${mutedText}`}>
        A small collection of places where you can find me online.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {socialLinks.map((link) => (
          <a
            key={link.title}
            href={link.url}
            target={link.url.startsWith("mailto:") ? undefined : "_blank"}
            rel="noopener noreferrer"
            className={`rounded-3xl border p-5 shadow-sm transition ${cardBg} ${hoverBg}`}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white">
                <img
                  src={link.icon || "/placeholder.svg"}
                  alt={link.title}
                  className="h-9 w-9 object-contain"
                />
              </div>

              <div>
                <h2 className="font-semibold">{link.title}</h2>
                <p className={`text-sm ${mutedText}`}>{link.description}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function ProjectsPage({
  mutedText,
  cardBg,
  borderClass,
}: {
  mutedText: string;
  cardBg: string;
  borderClass: string;
}) {
  const openProject = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mx-auto max-w-5xl p-8">
      <h1 className="mb-2 text-3xl font-semibold">Projects</h1>
      <p className={`mb-6 ${mutedText}`}>
        A few highlights of my github universe.
      </p>

      <div className="grid gap-5 md:grid-cols-3">
        {projectCards.map((project) => (
          <button
            key={project.title}
            type="button"
            onClick={() => openProject(project.url)}
            className={`rounded-3xl border p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${cardBg}`}
          >
            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-500">
              {project.tag}
            </span>

            <h2 className="mt-4 text-lg font-semibold">{project.title}</h2>

            <p className={`mt-2 text-sm leading-6 ${mutedText}`}>
              {project.description}
            </p>

            <div className={`mt-5 border-t ${borderClass} pt-4`}>
              <div className="flex items-center gap-2 text-sm text-blue-500">
                <Github className="h-4 w-4" />
                <span>Open on GitHub</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  mutedText,
}: {
  title: string;
  mutedText: string;
}) {
  return (
    <div className="mb-4 mt-8">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className={`text-xs ${mutedText}`}>Tap an icon to open it.</p>
    </div>
  );
}

function IconGrid({
  links,
  hoverBg,
  onOpenLink,
}: {
  links: SafariLink[];
  hoverBg: string;
  onOpenLink: (link: SafariLink) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
      {links.map((link) => (
        <button
          key={link.title}
          type="button"
          className={`flex flex-col items-center rounded-2xl p-4 transition ${hoverBg}`}
          onClick={() => onOpenLink(link)}
        >
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
            <img
              src={link.icon || "/placeholder.svg"}
              alt={link.title}
              className="h-9 w-9 object-contain"
            />
          </div>

          <span className="max-w-full truncate text-center text-sm">
            {link.title}
          </span>
        </button>
      ))}
    </div>
  );
}
