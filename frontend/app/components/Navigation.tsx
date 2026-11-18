"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { label: "Dashboard", href: "/", icon: "🏠" },
  { label: "Lessons", href: "/lessons", icon: "📚" },
  { label: "Quizzes", href: "/quizzes", icon: "🧠" },
  { label: "Playground", href: "/playground", icon: "💻" },
  { label: "AI Tutor", href: "/ai-tutor", icon: "🐼" },
  { label: "My Notes", href: "/notes", icon: "📝" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <header className="cosmic-navbar">
      <Link href="/" className="cosmic-brand">
        <span className="brand-panda">🐼</span>

        <span className="brand-text">
          <strong>
            Code<span>Buddy</span>
          </strong>
          <small>LEARN · PLAY · CODE</small>
        </span>
      </Link>

      <nav className="cosmic-nav-pills" aria-label="Main navigation">
        {navigationItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`cosmic-nav-link ${active ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="cosmic-nav-right">
        <span className="cosmic-online-dot" title="CodeBuddy is ready" />
        <span className="cosmic-profile" title="Your profile">
          🧑‍🚀
        </span>
      </div>

      <nav className="app-tabbar" aria-label="Phone navigation">
        {navigationItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={`tab-${item.href}`}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={active ? "active" : ""}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label === "My Notes" ? "Notes" : item.label === "Playground" ? "Code" : item.label === "AI Tutor" ? "Panda" : item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
