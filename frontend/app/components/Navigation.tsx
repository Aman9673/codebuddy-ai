"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navigationItems = [
  { label: "Dashboard", href: "/", icon: "🏠" },
  { label: "Lessons", href: "/lessons", icon: "📚" },
  { label: "Quizzes", href: "/quizzes", icon: "🧠" },
  { label: "Playground", href: "/playground", icon: "💻" },
  { label: "AI Tutor", href: "/ai-tutor", icon: "🐼" },
  { label: "My Notes", href: "/notes", icon: "📝" },
];

export default function Navigation({ initialProfile }: { initialProfile?: { name: string } | null }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState(initialProfile ?? null);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState(false);

  useEffect(() => {
    if (initialProfile !== undefined) return;
    const controller = new AbortController();
    void fetch("/api/auth/me", { cache: "no-store", signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((account) => {
        if (!controller.signal.aborted) setProfile(account);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [initialProfile, pathname]);

  async function signOut() {
    setSigningOut(true);
    setSignOutError(false);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "X-CodeBuddy-Auth": "1" },
      });
      if (!response.ok) throw new Error("Sign out failed");
      window.location.replace("/");
    } catch {
      setSignOutError(true);
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className={`cosmic-navbar${profile ? "" : " cosmic-navbar-guest"}`}>
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
        {profile ? (
          <details className="auth-account-menu">
            <summary className="cosmic-profile" aria-label={`Account menu for ${profile.name}`}>🧑‍🚀</summary>
            <div className="auth-account-panel">
              <strong>{profile.name}</strong>
              <button type="button" onClick={signOut} disabled={signingOut}>
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
              {signOutError && <small role="alert">Could not sign out. Try again.</small>}
            </div>
          </details>
        ) : (
          <>
            <Link href="/login" className="auth-nav-login">Sign in</Link>
            <Link href="/signup" className="auth-nav-signup">Sign up</Link>
          </>
        )}
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
