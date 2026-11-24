"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { askPanda, tutorLanguages, type TutorLanguage } from "../lib/panda";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

const suggestedQuestions = (language: TutorLanguage) => [
  {
    icon: "🐍",
    title: `Learn ${language}`,
    description: `Explain ${language} variables simply.`,
    prompt: `Teach me ${language} variables with simple examples.`,
  },
  {
    icon: "💻",
    title: "Debug my code",
    description: "Help me understand coding errors.",
    prompt:
      `How can I debug my code? Explain common errors with simple ${language} examples.`,
  },
  {
    icon: "🚀",
    title: "Build a project",
    description: "Find a beginner-friendly project.",
    prompt:
      `Suggest a beginner-friendly ${language} project and guide me through building it step by step.`,
  },
  {
    icon: "🧠",
    title: "Practice coding",
    description: "Challenge yourself with a problem.",
    prompt:
      `Give me an easy ${language} coding problem. Let me try solving it before showing the solution.`,
  },
];

function formatMessage(text: string) {
  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (part.startsWith("```") && part.endsWith("```")) {
      const firstNewLine = part.indexOf("\n");
      const language =
        firstNewLine > 3
          ? part.slice(3, firstNewLine).trim()
          : "";

      const code =
        firstNewLine >= 0
          ? part.slice(firstNewLine + 1, -3).trim()
          : part.slice(3, -3).trim();

      return (
        <div className="tutor-code-block" key={index}>
          <div className="tutor-code-header">
            <span>{language || "CODE"}</span>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(code);
              }}
            >
              Copy code
            </button>
          </div>
          <pre>
            <code>{code}</code>
          </pre>
        </div>
      );
    }

    return (
      <span className="tutor-message-text" key={index}>
        {part}
      </span>
    );
  });
}

export default function AITutorPage() {
  const [language, setLanguage] = useState<TutorLanguage>("Python");
  const starterQuestions = suggestedQuestions(language);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [engine, setEngine] = useState("Built-in guidance");

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function sendMessage(
    event?: FormEvent<HTMLFormElement>,
    suggestedPrompt?: string
  ) {
    event?.preventDefault();

    const text = (suggestedPrompt ?? input).trim();

    if (!text || loading) return;

    const userMessage: Message = {
      id: nextId.current++,
      role: "user",
      content: text,
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const data = await askPanda(text, language);
      setEngine(data.source);

      const assistantMessage: Message = {
        id: nextId.current++,
        role: "assistant",
        content: data.reply,
      };

      setMessages((previous) => [...previous, assistantMessage]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to Panda AI."
      );
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function clearChat() {
    setMessages([]);
    setError("");
    setInput("");
    nextId.current = 1;
    inputRef.current?.focus();
  }

  async function copyConversation() {
    const transcript = messages
      .map(
        (message) =>
          `${message.role === "user" ? "You" : "Panda AI"}:\n${message.content}`
      )
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Could not copy the conversation to your clipboard.");
    }
  }

  return (
    <main className="cosmic-tutor-page">
      {/* TOP HEADER */}
      <header className="tutor-topbar">
        <div className="tutor-title-group">
          <div className="tutor-avatar-large">
            🐼
            <span className="tutor-avatar-status" />
          </div>

          <div>
            <h1>Panda AI</h1>
            <p>Your personal coding companion</p>
          </div>
        </div>

        <div className="tutor-topbar-actions">
          <select
            className="tutor-language-select"
            aria-label="Tutor language"
            value={language}
            disabled={loading}
            onChange={(event) => setLanguage(event.target.value as TutorLanguage)}
          >
            {tutorLanguages.map((item) => <option key={item}>{item}</option>)}
          </select>
          <span className="tutor-model-badge">
            <span className="status-dot" />
            {engine}
          </span>

          <button
            type="button"
            className="tutor-icon-button"
            onClick={copyConversation}
            disabled={messages.length === 0}
            title="Copy conversation"
            aria-label="Copy conversation"
          >
            {copied ? "✓" : "▣"}
          </button>

          <button
            type="button"
            className="tutor-icon-button"
            onClick={clearChat}
            disabled={messages.length === 0 && !error}
            title="Clear conversation"
            aria-label="Clear conversation"
          >
            ↺
          </button>
        </div>
      </header>

      <div className="tutor-main-layout">
        {/* LEFT SIDEBAR */}
        <aside className="tutor-sidebar">
          <div className="tutor-sidebar-heading">
            <span>YOUR LEARNING SPACE</span>
          </div>

          <Link href="/" className="tutor-sidebar-link">
            <span>⌂</span> Dashboard
          </Link>

          <Link href="/lessons" className="tutor-sidebar-link">
            <span>▤</span> Explore lessons
          </Link>

          <Link href="/playground" className="tutor-sidebar-link">
            <span>⌘</span> Coding playground
          </Link>

          <Link href="/notes" className="tutor-sidebar-link">
            <span>▧</span> My notes
          </Link>

          <div className="tutor-sidebar-divider" />

          <div className="tutor-sidebar-heading">
            <span>QUICK PROMPTS</span>
          </div>

          {starterQuestions.map((question) => (
            <button
              type="button"
              className="tutor-quick-prompt"
              key={question.title}
              onClick={() => {
                void sendMessage(undefined, question.prompt);
              }}
              disabled={loading}
            >
              <span className="quick-prompt-icon">{question.icon}</span>

              <span>
                <strong>{question.title}</strong>
                <small>{question.description}</small>
              </span>
            </button>
          ))}

          <div className="tutor-sidebar-footer">
            <div className="tutor-mini-orbit">✦</div>
            <strong>Keep exploring.</strong>
            <p>Every question takes you one step further.</p>
          </div>
        </aside>

        {/* CHAT AREA */}
        <section className="tutor-chat-panel">
          <div className="tutor-chat-heading">
            <div>
              <span className="tutor-eyebrow">YOUR CODING UNIVERSE</span>
              <h2>Chat with Panda</h2>
              <p>Ask questions, explore ideas, and learn at your pace.</p>
            </div>

            <div className="tutor-online-badge">
              <span className="status-dot" />
              Ready to help
            </div>
          </div>

          <div className="tutor-chat-messages" ref={scrollRef}>
            {/* WELCOME SCREEN */}
            {messages.length === 0 && (
              <div className="tutor-welcome">
                <div className="tutor-welcome-glow" />

                <div className="tutor-welcome-avatar">
                  🐼
                  <span>✦</span>
                </div>

                <div className="tutor-welcome-badge">
                  ✨ YOUR AI LEARNING BUDDY
                </div>

                <h3>
                  Hey, coder!
                  <br />
                  <span>What shall we learn today?</span>
                </h3>

                <p className="tutor-welcome-description">
                  I&apos;m Panda, your coding companion. I can explain concepts,
                  help you understand errors, suggest projects, and guide
                  you through programming step by step.
                </p>

                <div className="tutor-suggestion-grid">
                  {starterQuestions.map((question) => (
                    <button
                      type="button"
                      className="tutor-suggestion-card"
                      key={question.title}
                      onClick={() => {
                        void sendMessage(undefined, question.prompt);
                      }}
                      disabled={loading}
                    >
                      <span className="suggestion-card-icon">
                        {question.icon}
                      </span>

                      <strong>{question.title}</strong>
                      <span>{question.description}</span>
                      <span className="suggestion-arrow">↗</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CONVERSATION */}
            {messages.map((message) => (
              <div
                className={`tutor-message-row ${message.role}`}
                key={message.id}
              >
                {message.role === "assistant" && (
                  <div className="tutor-message-avatar">🐼</div>
                )}

                <div className="tutor-message-content">
                  <div className="tutor-message-label">
                    {message.role === "user" ? "YOU" : "PANDA AI"}
                    {message.role === "assistant" && (
                      <span className="tutor-ai-label">AI TUTOR</span>
                    )}
                  </div>

                  <div className="tutor-message-bubble">
                    {formatMessage(message.content)}
                  </div>
                </div>

                {message.role === "user" && (
                  <div className="tutor-user-avatar">Y</div>
                )}
              </div>
            ))}

            {/* THINKING INDICATOR */}
            {loading && (
              <div className="tutor-message-row assistant">
                <div className="tutor-message-avatar">🐼</div>

                <div className="tutor-message-content">
                  <div className="tutor-message-label">PANDA AI</div>

                  <div className="tutor-thinking-bubble">
                    <span />
                    <span />
                    <span />
                    <small>Panda is thinking...</small>
                  </div>
                </div>
              </div>
            )}

            <div />
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="tutor-error">
              <span>⚠</span>
              <span>{error}</span>
              <button type="button" onClick={() => setError("")}>
                Dismiss
              </button>
            </div>
          )}

          {/* INPUT AREA */}
          <div className="tutor-composer-area">
            <form
              className="tutor-composer"
              onSubmit={(event) => void sendMessage(event)}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder="Ask Panda anything about coding..."
                rows={1}
                disabled={loading}
                aria-label="Message Panda AI"
              />

              <button
                type="submit"
                className="tutor-send-button"
                disabled={!input.trim() || loading}
                aria-label="Send message"
                title="Send message"
              >
                {loading ? "…" : "↑"}
              </button>
            </form>

            <div className="tutor-composer-footer">
              <span>↵ Send · Shift + ↵ New line</span>
              <span>Powered by your local AI model</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
