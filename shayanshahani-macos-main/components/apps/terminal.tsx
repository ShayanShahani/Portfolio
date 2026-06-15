"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";

interface TerminalProps {
  isDarkMode?: boolean;
}

type HistoryLineType =
  | "system"
  | "commandLine"
  | "error"
  | "success"
  | "muted"
  | "passwordLine";

interface HistoryLine {
  id: string;
  text: string;
  type?: HistoryLineType;
}

const PROMPT = "shayan@macbook-pro ~ $";
const PASSWORD_PROMPT = "Password:";
const COMMAND_HISTORY_KEY = "portfolio-terminal-command-history";

const createLine = (
  text: string,
  type: HistoryLineType = "system",
): HistoryLine => ({
  id: crypto.randomUUID(),
  text,
  type,
});

const getWelcomeHistory = (): HistoryLine[] => [
  createLine(`Last login: ${new Date().toLocaleString()}`, "muted"),
  createLine("Welcome to macOS Terminal", "success"),
  createLine("Type 'help' to see available commands", "muted"),
  createLine("", "system"),
];

export default function Terminal({ isDarkMode = true }: TerminalProps) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryLine[]>(getWelcomeHistory);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isPasswordMode, setIsPasswordMode] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const bgColor = "bg-[#0b0b0f]";
  const textColor = "text-zinc-200";

  useEffect(() => {
    const savedCommandHistory = sessionStorage.getItem(COMMAND_HISTORY_KEY);

    if (savedCommandHistory) {
      try {
        const parsedHistory = JSON.parse(savedCommandHistory);

        if (Array.isArray(parsedHistory)) {
          setCommandHistory(
            parsedHistory.filter((item) => typeof item === "string"),
          );
        }
      } catch (error) {
        console.error("Failed to parse terminal command history:", error);
      }
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(
      COMMAND_HISTORY_KEY,
      JSON.stringify(commandHistory.slice(-50)),
    );
  }, [commandHistory]);

  useEffect(() => {
    const handleClick = () => {
      inputRef.current?.focus();
    };

    const terminal = terminalRef.current;

    if (terminal) {
      terminal.addEventListener("click", handleClick);
    }

    return () => {
      if (terminal) {
        terminal.removeEventListener("click", handleClick);
      }
    };
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const getLineClassName = (type: HistoryLineType = "system") => {
    switch (type) {
      case "commandLine":
        return "text-white";
      case "passwordLine":
        return "text-zinc-300";
      case "error":
        return "text-red-400";
      case "success":
        return "text-emerald-400";
      case "muted":
        return "text-zinc-500";
      case "system":
      default:
        return "text-zinc-300";
    }
  };

  const pushHistory = (...lines: HistoryLine[]) => {
    setHistory((prev) => [...prev, ...lines]);
  };

  const clearTerminal = () => {
    setHistory([createLine("", "system")]);
  };

  const addCommandToHistory = (cmd: string) => {
    const trimmedCommand = cmd.trim();

    if (!trimmedCommand) return;

    setCommandHistory((prev) => {
      const next =
        prev[prev.length - 1] === trimmedCommand
          ? prev
          : [...prev, trimmedCommand];

      return next.slice(-50);
    });
  };

  const navigateHistory = (direction: "up" | "down") => {
    if (isPasswordMode) return;
    if (commandHistory.length === 0) return;

    if (direction === "up") {
      const nextIndex =
        historyIndex < commandHistory.length - 1
          ? historyIndex + 1
          : historyIndex;

      setHistoryIndex(nextIndex);
      const selectedCommand =
        commandHistory[commandHistory.length - 1 - nextIndex];

      setInput(selectedCommand);
      setCursorPosition(selectedCommand.length);
      return;
    }

    const nextIndex = historyIndex > -1 ? historyIndex - 1 : -1;

    setHistoryIndex(nextIndex);

    if (nextIndex === -1) {
      setInput("");
      setCursorPosition(0);
    } else {
      const selectedCommand =
        commandHistory[commandHistory.length - 1 - nextIndex];

      setInput(selectedCommand);
      setCursorPosition(selectedCommand.length);
    }
  };

  const handlePasswordSubmit = () => {
    const hiddenPassword = "*".repeat(input.length);

    pushHistory(
      createLine(`${PASSWORD_PROMPT} ${hiddenPassword}`, "passwordLine"),
      createLine("Nice try. Admin access is reserved for Shayan.", "error"),
      createLine("", "system"),
    );

    setInput("");
    setCursorPosition(0);
    setIsPasswordMode(false);
    setHistoryIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setCursorPosition(e.target.selectionStart ?? e.target.value.length);
  };

  const syncCursorPosition = () => {
    window.requestAnimationFrame(() => {
      const inputElement = inputRef.current;

      if (!inputElement) return;

      setCursorPosition(
        inputElement.selectionStart ?? inputElement.value.length,
      );
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (isPasswordMode) {
        handlePasswordSubmit();
        return;
      }

      const rawCommand = input;
      const trimmedCommand = rawCommand.trim();

      if (!trimmedCommand) {
        pushHistory(createLine(PROMPT, "commandLine"));
        setInput("");
        setCursorPosition(0);
        return;
      }

      executeCommand(rawCommand);
      addCommandToHistory(rawCommand);
      setHistoryIndex(-1);
      setInput("");
      setCursorPosition(0);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      navigateHistory("up");
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      navigateHistory("down");
    }

    if (
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "Home" ||
      e.key === "End"
    ) {
      syncCursorPosition();
    }
  };

  const executeCommand = (rawCommand: string) => {
    const trimmedCommand = rawCommand.trim();
    const normalizedCommand = trimmedCommand.toLowerCase();
    const args = trimmedCommand.split(" ");
    const normalizedArgs = normalizedCommand.split(" ");
    const mainCommand = normalizedArgs[0];

    pushHistory(createLine(`${PROMPT} ${trimmedCommand}`, "commandLine"));

    switch (mainCommand) {
      case "help":
        pushHistory(
          createLine("Available commands:", "success"),
          createLine("  help              Show this help message"),
          createLine("  clear             Clear the terminal"),
          createLine("  echo [text]       Print text"),
          createLine("  date              Show current date and time"),
          createLine("  ls                List files"),
          createLine("  pwd               Show current directory"),
          createLine("  whoami            Show current user"),
          createLine("  about             About me"),
          createLine("  skills            My technical skills"),
          createLine("  contact           Contact information"),
          createLine("  neofetch          Show portfolio system info"),
          createLine("  open [name]       Open a fake app/file"),
          createLine("  quote             Show a developer quote"),
          createLine("  joke              Show a small developer joke"),
          createLine("  matrix            Enter the matrix"),
          createLine("  sudo [anything]   Try admin powers"),
          createLine("  history           Show previous commands"),
          createLine("  clear history     Clear command history"),
          createLine(""),
        );
        break;

      case "clear":
        if (normalizedArgs[1] === "history") {
          setCommandHistory([]);
          sessionStorage.removeItem(COMMAND_HISTORY_KEY);

          pushHistory(
            createLine("Command history cleared successfully.", "success"),
            createLine(""),
          );
        } else {
          clearTerminal();
        }
        break;

      case "echo": {
        const echoText = args.slice(1).join(" ");

        pushHistory(createLine(echoText), createLine(""));
        break;
      }

      case "date":
        pushHistory(createLine(new Date().toString()), createLine(""));
        break;

      case "ls":
        pushHistory(
          createLine("Applications"),
          createLine("Desktop"),
          createLine("Documents"),
          createLine("Downloads"),
          createLine("Projects"),
          createLine("Pictures"),
          createLine("Music"),
          createLine("README.md"),
          createLine("portfolio.config.ts"),
          createLine(""),
        );
        break;

      case "pwd":
        pushHistory(createLine("/Users/shayan"), createLine(""));
        break;

      case "whoami":
        pushHistory(createLine("shayan"), createLine(""));
        break;

      case "about":
        pushHistory(
          createLine("┌───────────────────────────────────┐", "success"),
          createLine("│ Shayan Shahani                    │", "success"),
          createLine("│ Software Engineer & Web Developer │", "success"),
          createLine("└───────────────────────────────────┘", "success"),
          createLine(""),
          createLine("I'm a passionate software engineer focused on building"),
          createLine("beautiful, responsive, and user-friendly applications."),
          createLine("I enjoy working across frontend, backend, UI, and"),
          createLine("interactive experiences."),
          createLine(""),
        );
        break;

      case "skills":
        pushHistory(
          createLine("┌────────────────────────┐", "success"),
          createLine("│        Skills          │", "success"),
          createLine("└────────────────────────┘", "success"),
          createLine(""),

          createLine("Frontend:", "success"),
          createLine("• React / Next.js"),
          createLine("• TypeScript / JavaScript"),
          createLine("• HTML5 / CSS3"),
          createLine("• Tailwind CSS / SCSS"),
          createLine("• Responsive Web Development"),
          createLine("• Zustand / Redux"),
          createLine("• Vite / Webpack"),
          createLine("• UI/UX & Design Systems"),
          createLine(""),

          createLine("Backend:", "success"),
          createLine("• Node.js"),
          createLine("• PHP / Laravel"),
          createLine("• RESTful APIs"),
          createLine("• Authentication & Authorization"),
          createLine("• MySQL / PostgreSQL"),
          createLine("• MongoDB"),
          createLine("• Redis"),
          createLine("• Database Design"),
          createLine(""),

          createLine("Business Process & Enterprise:", "success"),
          createLine("• ProcessMaker"),
          createLine("• Bizagi"),
          createLine("• BPMN 2.0"),
          createLine("• Workflow Automation"),
          createLine("• Business Process Analysis"),
          createLine(""),

          createLine("Reporting & Visualization:", "success"),
          createLine("• Stimulsoft Reports"),
          createLine("• Dashboard Design"),
          createLine("• Data Visualization"),
          createLine(""),

          createLine("DevOps & Tools:", "success"),
          createLine("• Docker"),
          createLine("• Git / GitHub"),
          createLine("• CI/CD"),
          createLine("• Linux"),
          createLine("• Nginx / Apache"),
          createLine("• Agile / Scrum"),
          createLine(""),

          createLine("Other Interests:", "success"),
          createLine("• Artificial Intelligence & LLMs"),
          createLine("• Machine Learning"),
          createLine("• Emerging Technologies"),
          createLine("• Automotive Technology"),
          createLine(""),
        );
        break;

      case "contact":
        pushHistory(
          createLine("┌─────────┐", "success"),
          createLine("│ Contact │", "success"),
          createLine("└─────────┘", "success"),
          createLine(""),
          createLine("Email: my@domainmail.com"),
          createLine("GitHub: github.com/ShayanShahani"),
          createLine("LinkedIn: linkedin.com/in/mylinkedin/"),
          createLine("Telegram: @ShayanShahani"),
          createLine(""),
        );
        break;

      case "neofetch":
        pushHistory(
          createLine(
            "                   -`                    shayan@macbook-pro",
            "success",
          ),
          createLine(
            "                  .o+`                   -------------------",
            "success",
          ),
          createLine(
            "                 `ooo/                   OS: Portfolio macOS",
            "success",
          ),
          createLine(
            "                `+oooo:                  Host: MacBook Pro",
            "success",
          ),
          createLine(
            "               `+oooooo:                 Shell: portfolio-zsh",
            "success",
          ),
          createLine(
            "               -+oooooo+:                Framework: Next.js",
            "success",
          ),
          createLine(
            "             `/:-:++oooo+:               UI: Tailwind CSS",
            "success",
          ),
          createLine(
            "            `/++++/+++++++:              Language: TypeScript",
            "success",
          ),
          createLine(
            "           `/++++++++++++++:             Status: Available",
            "success",
          ),
          createLine(
            "          `/+++ooooooooooooo/`           Theme: macOS Terminal",
            "success",
          ),
          createLine("         ./ooosssso++osssssso+`          ", "success"),
          createLine("        .oossssso-````/ossssss+`         ", "success"),
          createLine("       -osssssso.      :ssssssso.        ", "success"),
          createLine("      :osssssss/        osssso+++.       ", "success"),
          createLine("     /ossssssss/        +ssssooo/-       ", "success"),
          createLine("   `/ossssso+/:-        -:/+osssso+-     ", "success"),
          createLine("  `+sso+:-`                 `.-/+oso:    ", "success"),
          createLine(" `++:.                           `-/+/   ", "success"),
          createLine(" .`                                 `/   ", "success"),
          createLine(""),
        );
        break;

      case "open": {
        const target = args.slice(1).join(" ");

        if (!target) {
          pushHistory(
            createLine("Usage: open [app-or-file-name]", "muted"),
            createLine("Example: open contacts", "muted"),
            createLine(""),
          );
          break;
        }

        pushHistory(
          createLine(`Opening "${target}"...`, "success"),
          createLine(
            "Just kidding. This is a simulated terminal inside the portfolio.",
          ),
          createLine(""),
        );
        break;
      }

      case "quote": {
        const quotes = [
          "First, solve the problem. Then, write the code.",
          "Good design is as little design as possible.",
          "Programs must be written for people to read.",
          "Simplicity is the soul of efficiency.",
          "Make it work, make it right, make it fast.",
        ];

        const quote = quotes[Math.floor(Math.random() * quotes.length)];

        pushHistory(createLine(`"${quote}"`, "success"), createLine(""));
        break;
      }

      case "joke": {
        const jokes = [
          "Why do programmers prefer dark mode? Because light attracts bugs.",
          "There are only 10 types of people: those who understand binary and those who don't.",
          "A SQL query walks into a bar, walks up to two tables and asks: can I join you?",
          "I would tell you a UDP joke, but you might not get it.",
        ];

        const joke = jokes[Math.floor(Math.random() * jokes.length)];

        pushHistory(createLine(joke, "success"), createLine(""));
        break;
      }

      case "sudo":
        setIsPasswordMode(true);
        break;

      case "matrix":
        pushHistory(
          createLine("Wake up, Shayan...", "success"),
          createLine("The portfolio has you...", "success"),
          createLine("Follow the white rabbit.", "success"),
          createLine(""),
          createLine(
            "01010011 01101000 01100001 01111001 01100001 01101110",
            "success",
          ),
          createLine(""),
        );
        break;

      case "theme":
        pushHistory(
          createLine(
            `Current app theme prop: ${isDarkMode ? "dark" : "light"}`,
          ),
          createLine(
            "Terminal itself stays dark, just like the real macOS Terminal vibe.",
          ),
          createLine(""),
        );
        break;

      case "history":
        if (commandHistory.length === 0) {
          pushHistory(
            createLine("No command history yet.", "muted"),
            createLine(""),
          );
          break;
        }

        pushHistory(
          ...commandHistory.map((command, index) =>
            createLine(`${index + 1}  ${command}`, "muted"),
          ),
          createLine(""),
        );
        break;

      default:
        pushHistory(
          createLine(`zsh: command not found: ${mainCommand}`, "error"),
          createLine('Type "help" to see available commands', "muted"),
          createLine(""),
        );
    }
  };

  const renderedInput = isPasswordMode ? "*".repeat(input.length) : input;

  const inputBeforeCursor = renderedInput.slice(0, cursorPosition);
  const inputAfterCursor = renderedInput.slice(cursorPosition);

  return (
    <div
      ref={terminalRef}
      className={`
        h-full ${bgColor} ${textColor}
        overflow-auto cursor-text
        font-mono text-sm
      `}
    >
      <div
        className={`
          min-h-full p-4
          bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.08),transparent_30%),linear-gradient(to_bottom,#101014,#050507)]
        `}
      >
        <div className="mb-3 flex items-center gap-2 text-xs text-zinc-500">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          <span>zsh</span>
          <span className="text-zinc-700">•</span>
          <span>portfolio terminal</span>
        </div>

        {history.map((line) => (
          <div
            key={line.id}
            className={`whitespace-pre-wrap leading-6 ${getLineClassName(
              line.type,
            )}`}
          >
            {line.text}
          </div>
        ))}

        <div className="flex items-center leading-6">
          {isPasswordMode ? (
            <span className="mr-2 shrink-0 text-zinc-500">
              {PASSWORD_PROMPT}
            </span>
          ) : (
            <span className="mr-2 shrink-0 text-sky-400">{PROMPT}</span>
          )}

          <span className="text-white whitespace-pre">{inputBeforeCursor}</span>

          <span
            className="ml-0.1 inline-block h-5 w-px bg-emerald-400 align-middle"
            style={{
              animation: "pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
            aria-hidden="true"
          />

          <span className="text-white whitespace-pre">{inputAfterCursor}</span>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onKeyUp={syncCursorPosition}
            onClick={syncCursorPosition}
            className="absolute h-0 w-0 opacity-0"
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}
