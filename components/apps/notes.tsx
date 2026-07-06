"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useState } from "react";

interface NotesProps {
  isDarkMode?: boolean;
}

export default function Notes({ isDarkMode = true }: NotesProps) {
  // Update the notes state with enhanced content
  const notes = [
    {
      id: 1,
      title: "About",
      content: `# 🦹🏻‍♂️ Shayan Shahani

I'm a Software Engineer based in Tehran, passionate about building clean, efficient, and impactful software solutions.

I enjoy turning ideas into products, solving complex problems, and continuously learning new technologies.

---

## 💡 About

- 🧠 Software Engineer at **dnaunion**
- 🌍 Based in **Tehran, Iran**
- 🤖 Exploring **AI, LLMs, automation, and intelligent systems**
- 🚀 Building modern applications with **React, Next.js, Vue, TypeScript, PHP, and Laravel**
- 🏗️ Interested in **software architecture, scalable systems, and product development**
- 🛠️ Working across frontend, backend, APIs, databases, and cloud infrastructure
- 📚 Always learning, experimenting, and refining my craft

---

## 📬 Connect

- GitHub: [github.com/ShayanShahani](https://github.com/ShayanShahani)
- Email: [shayangeek@gmail.com](mailto:shayangeek@gmail.com)`,
      date: "Today, 11:45 AM",
    },
    {
      id: 2,
      title: "Interests",
      content: `# 🥳 Interests

🎮 Video games, boss fights, and losing sleep over "one last game"

🎬 Movies, TV series, and stories that live rent-free in my head

⚡ Chasing emerging tech, future trends, and shiny new gadgets

🤖 Artificial Intelligence, Machine Learning, and automating things I’m too lazy to do myself

🛸 Conspiracy theories about fictional universes and collecting useless but fascinating trivia

🏀 Basketball, buzzer beaters, and convincing myself I could've made that shot.

☕ Powered by caffeine, curiosity, and conversations that start with "What if..."

## 🎯 Current Focus

* Growing as a software engineer
* Building meaningful products
* Expanding AI and machine learning knowledge
* Creating projects that combine technology, creativity, and real-world value
`,
      date: "Yesterday, 6:18 PM",
    },
  ];

  const [selectedNoteId, setSelectedNoteId] = useState(1);

  const selectedNote = notes.find((note) => note.id === selectedNoteId);

  const handleNoteSelect = (id: number) => {
    setSelectedNoteId(id);
  };

  const textColor = isDarkMode ? "text-white" : "text-gray-800";
  const bgColor = isDarkMode ? "bg-gray-900" : "bg-white";
  const sidebarBg = isDarkMode ? "bg-gray-800" : "bg-gray-100";
  const borderColor = isDarkMode ? "border-gray-700" : "border-gray-200";
  const hoverBg = isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-200";
  const selectedBg = isDarkMode ? "bg-blue-600/20" : "bg-blue-100";

  return (
    <div className={`flex h-full ${bgColor} ${textColor}`}>
      {/* Sidebar */}
      <div
        className={`w-64 ${sidebarBg} border-r ${borderColor} flex flex-col`}
      >
        <div className="p-3 border-b border-gray-700 flex justify-between items-center">
          <h2 className="font-medium">Notes</h2>
          <div className="text-xs text-gray-500">{notes.length} Notes</div>
        </div>
        <div className="overflow-y-auto flex-1">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`p-3 cursor-pointer ${selectedNoteId === note.id ? selectedBg : hoverBg}`}
              onClick={() => handleNoteSelect(note.id)}
            >
              <h3 className="font-medium truncate">{note.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{note.date}</p>
              <p
                className={`text-sm mt-1 truncate ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                {note.content.replace(/^#\s*/, "").split("\n")[0].slice(0, 50)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Note content */}
      <div className="flex-1 flex flex-col">
        {selectedNote && (
          <>
            <div className={`p-3 border-b ${borderColor}`}>
              <h2 className="font-medium">{selectedNote.title}</h2>
              <p className="text-xs text-gray-500">{selectedNote.date}</p>
            </div>
            <div className="flex-1 overflow-auto">
              <div
                className={`
    max-w-3xl
    mx-auto
    px-12
    py-10
    prose
    prose-lg
    prose-headings:font-semibold
    prose-headings:tracking-tight
    prose-p:leading-7
    prose-li:leading-7
    prose-p:text-[15px]
    prose-li:text-[15px]
    prose-strong:text-inherit
    ${isDarkMode ? "prose-invert" : ""}
  `}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-400 no-underline"
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {selectedNote.content}
                </ReactMarkdown>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
