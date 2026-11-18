"use client";

import Link from "next/link";
import LearningPulse from "./components/LearningPulse";
import { useCallback, useEffect, useRef, useState } from "react";
import { chapters, lessons } from "./lessons/course";

const PROGRESS_STORAGE_KEY = "codebuddy.completedLessons";

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function Home() {
  const [search, setSearch] = useState("");
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installHelp, setInstallHelp] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const query = search.trim().toLowerCase();
  const completedCount = completedLessons.length;
  const totalXp = lessons
    .filter((lesson) => completedLessons.includes(lesson.id))
    .reduce((total, lesson) => total + lesson.xp, 0);
  const overallProgress = Math.round((completedCount / lessons.length) * 100);
  const currentLesson =
    lessons.find((lesson) => !completedLessons.includes(lesson.id)) ?? null;
  const chapterProgress = chapters.map((chapter) => {
    const chapterLessons = lessons.filter(
      (lesson) => lesson.chapterId === chapter.id,
    );

    return {
      ...chapter,
      lessonIds: chapterLessons.map((lesson) => lesson.id),
      color: ["blue", "yellow", "pink", "cyan"][(chapter.id - 1) % 4],
      percent: Math.round(
        (chapterLessons.filter((lesson) =>
          completedLessons.includes(lesson.id),
        ).length /
          chapterLessons.length) *
          100,
      ),
    };
  });
  const missions = [
    {
      title: "Complete the Python learning path",
      subtitle: currentLesson
        ? `${completedCount} of ${lessons.length} lessons complete · Continue with ${currentLesson.title}`
        : "All Python lessons completed!",
      status: currentLesson ? (completedCount > 0 ? "progress" : "available") : "complete",
      icon: currentLesson ? "●" : "✓",
      href: currentLesson ? `/lessons?lesson=${currentLesson.id}` : "/lessons",
    },
    {
      title: "Practice Python & JavaScript",
      subtitle: "Try the runnable examples in the playground",
      status: "available",
      icon: "JS",
      href: "/playground",
    },
    {
      title: "Ask Panda AI",
      subtitle: "Get help with a coding question",
      status: "available",
      icon: "🐼",
      href: "/ai-tutor",
    },
    {
      title: "Save a coding note",
      subtitle: "Keep a concept or code snippet in your notebook",
      status: "available",
      icon: "📝",
      href: "/notes",
    },
  ];
  const dashboardSearchItems = [
    ...lessons.map((lesson) => ({
      title: lesson.title,
      detail: `Lesson · ${lesson.topic} · ${completedLessons.includes(lesson.id) ? "Completed" : "Start learning"}`,
      href: `/lessons?lesson=${lesson.id}`,
    })),
    ...chapterProgress.map((chapter) => ({
      title: chapter.title,
      detail: `Chapter · ${chapter.percent}% complete`,
      href: `/lessons?lesson=${chapter.lessonIds.find((id) => !completedLessons.includes(id)) ?? chapter.lessonIds[0]}`,
    })),
    { title: "JavaScript Playground", detail: "Practice · Run JavaScript examples", href: "/playground" },
    { title: "Panda AI Tutor", detail: "Ask questions · Get coding help", href: "/ai-tutor" },
    { title: "My Coding Notes", detail: "Notebook · Save your learning", href: "/notes" },
  ];
  const searchResults = query
    ? dashboardSearchItems
        .filter((item) =>
          `${item.title} ${item.detail}`.toLowerCase().includes(query),
        )
        .slice(0, 6)
    : [];

  const restoreProgress = useCallback(async () => {
    try {
      const savedProgress = await Promise.resolve(
        window.localStorage.getItem(PROGRESS_STORAGE_KEY),
      );
      if (savedProgress) {
        const parsed: unknown = JSON.parse(savedProgress);
        if (
          Array.isArray(parsed) &&
          parsed.every(
            (id) =>
              Number.isInteger(id) &&
              lessons.some((lesson) => lesson.id === id),
          )
        ) {
          setCompletedLessons([...new Set(parsed as number[])]);
        }
      }
    } catch (error) {
      console.error("Could not load dashboard learning progress:", error);
    }
  }, []);

  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => void restoreProgress(), 0);
    return () => window.clearTimeout(loadTimer);
  }, [restoreProgress]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPrompt);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator &&
        Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    const installStateTimer = window.setTimeout(
      () => setIsInstalled(standalone),
      0,
    );

    return () => {
      window.clearTimeout(installStateTimer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setInstallPrompt(null);
        setIsInstalled(true);
        setInstallHelp("");
      }
      return;
    }

    const ios = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    setInstallHelp(
      ios
        ? "On iPhone or iPad, open this page in Safari, tap Share, then tap Add to Home Screen."
        : "On Android, open the browser menu and choose Install app or Add to Home screen. On a computer, use the install icon in the address bar.",
    );
  };

  return (
    <main className="cosmic-dashboard">
      {/* LAUNCH BANNER */}
      {!isInstalled && (
        <div className="install-banner">
          <div className="install-banner-copy">
            <span aria-hidden="true">📱</span>
            <div>
              <strong>Install CodeBuddy on your phone</strong>
              <span>
                Add it to your home screen. Lessons, the playground, Panda, and your notes open like an app.
              </span>
              {installHelp && <small>{installHelp}</small>}
            </div>
          </div>
          <button type="button" onClick={() => void handleInstallClick()}>
            {installPrompt ? "Install app" : "How to install"}
          </button>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="cosmic-hero">
        <div className="hero-overlay" />

        <div className="hero-content">
          <div className="system-status">
            <span className="status-dot" />
            LEARN PYTHON · PRACTICE · BUILD
          </div>

          <h1>
            EXPLORE.
            <br />
            CREATE.
            <br />
            <span>MASTER.</span>
          </h1>

          <p className="hero-description">
            In-depth Python lessons, a Python and JavaScript playground, a tutor named Panda, and your own coding notebook. Use it in the browser or install it on your phone.
          </p>

          <div className="hero-actions">
            <Link href="/lessons" className="cosmic-button primary-button">
              <span>🚀</span>
              START LEARNING
              <span>→</span>
            </Link>

            <button
              type="button"
              onClick={() => void handleInstallClick()}
              className="cosmic-button outline-button"
            >
              <span>📱</span>
              INSTALL APP
            </button>
          </div>

          <div className="hero-motto">
            <span className="motto-planet">🪐</span>
            <p>
              Learn a little today.
              <br />
              Keep the streak tomorrow.
            </p>
          </div>
        </div>

        {/* RIGHT STATISTICS PANEL */}
        <aside className="hero-stats">
          <div className="stats-planet">🪐</div>

          <div className="hero-stat">
            <span className="stat-icon blue-icon">♟</span>
            <div>
              <strong>{currentLesson ? "01" : "00"}</strong>
              <p>ACTIVE LEARNING PATHS</p>
            </div>
          </div>

          <div className="hero-stat">
            <span className="stat-icon purple-icon">▤</span>
            <div>
              <strong>{completedCount}</strong>
              <p>LESSONS COMPLETED</p>
            </div>
          </div>

          <div className="hero-stat">
            <span className="stat-icon blue-icon">▥</span>
            <div>
              <strong>{totalXp}</strong>
              <p>XP POINTS EARNED</p>
            </div>
          </div>

          <div className="hero-stat">
            <span className="stat-icon orange-icon">♨</span>
            <div>
              <strong>{lessons.length - completedCount}</strong>
              <p>LESSONS LEFT</p>
            </div>
          </div>
        </aside>
      </section>

      <LearningPulse />

      {/* SEARCH */}
      <div className="dashboard-search-wrap">
        <div className="dashboard-search">
          <span aria-hidden="true">⌕</span>
          <input
            ref={searchInputRef}
            type="search"
            aria-label="Search lessons, topics, and coding missions"
            aria-controls="dashboard-search-results"
            placeholder="Search lessons, topics, and coding missions..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <span className="search-shortcut">Ctrl K</span>
        </div>
        {query && (
          <div
            id="dashboard-search-results"
            className="dashboard-search-results"
            role="status"
          >
            {searchResults.length > 0 ? (
              <ul>
                {searchResults.map((result) => (
                  <li key={`${result.title}-${result.detail}`}>
                    <Link href={result.href}>
                      <strong>{result.title}</strong>
                      <span>{result.detail}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No lessons, topics, or missions match “{search.trim()}”.</p>
            )}
          </div>
        )}
      </div>

      {/* DASHBOARD CARDS */}
      <section className="dashboard-grid">
        {/* SKILLS */}
        <article className="dashboard-card skills-card">
          <div className="card-heading">
            <div>
              <h2>YOUR SKILLS</h2>
              <p>YOUR LEARNING JOURNEY</p>
            </div>
            <Link href="/lessons" className="card-arrow" aria-label="Explore lessons">↗</Link>
          </div>

          <div className="skill-overview">
            <div
              className="progress-ring"
              style={{
                background: `conic-gradient(#b05bff 0%, #6e70ff ${overallProgress * 0.55}%, #31caff ${overallProgress}%, rgba(255, 255, 255, 0.08) ${overallProgress}%)`,
              }}
            >
              <div className="progress-ring-inner">
                <strong>{overallProgress}%</strong>
              </div>
            </div>
            <span>OVERALL PROGRESS</span>
          </div>

          <div className="skill-list">
            {chapterProgress.map((chapter) => (
              <div className="skill-item" key={chapter.id}>
                <div className={`skill-icon ${chapter.color}`}>
                  {chapter.icon}
                </div>

                <div className="skill-details">
                  <div className="skill-label">
                    <span>{chapter.title}</span>
                    <strong>{chapter.percent}%</strong>
                  </div>

                  <div className="skill-track">
                    <div
                      className={`skill-fill ${chapter.color}`}
                      style={{ width: `${chapter.percent}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* CURRENT LESSON */}
        <article className="dashboard-card lesson-card">
          <div className="card-heading">
            <div>
              <h2>CURRENT LESSON</h2>
              <p>PICK UP WHERE YOU LEFT OFF</p>
            </div>
            <Link
              href={currentLesson ? `/lessons?lesson=${currentLesson.id}` : "/lessons"}
              className="card-arrow"
              aria-label={currentLesson ? "Continue current lesson" : "Review lessons"}
            >
              ↗
            </Link>
          </div>

          <div className="lesson-image">
            <span className="lesson-badge">
              {currentLesson ? "IN PROGRESS" : "PATH COMPLETE"}
            </span>
          </div>

          <div className="lesson-info">
            <h3>{currentLesson?.title ?? "Python learning path complete"}</h3>
            <p>
              {currentLesson
                ? `${currentLesson.topic} · Earn ${currentLesson.xp} XP`
                : "Review a lesson or try the playground"}
            </p>
          </div>

          <div className="lesson-progress">
            <span>LESSON PROGRESS</span>
            <strong>{currentLesson ? "Active" : "100%"}</strong>
          </div>

          <Link
            href={currentLesson ? `/lessons?lesson=${currentLesson.id}` : "/lessons"}
            className="cosmic-button primary-button full-button"
          >
            {currentLesson ? "CONTINUE LESSON" : "REVIEW COURSE"} <span>→</span>
          </Link>
        </article>

        {/* ACTIVITY */}
        <article className="dashboard-card activity-card">
          <div className="card-heading">
            <div>
              <h2>CODING ACTIVITY</h2>
              <p>YOUR PRACTICE ZONE</p>
            </div>
            <span className="live-badge">
              <span className="status-dot" /> LIVE
            </span>
          </div>

          <div className="orbit-visual">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="orbit orbit-three" />
            <div className="orbit-center">✦</div>
            <span className="orbit-star star-one" />
            <span className="orbit-star star-two" />
            <span className="orbit-star star-three" />
            <span className="orbit-star star-four" />
            <span className="orbit-star star-five" />
          </div>

          <div className="activity-stats">
            <div>
              <strong>{completedCount}</strong>
              <span>LESSONS COMPLETE</span>
            </div>
            <div>
              <strong>{lessons.length - completedCount}</strong>
              <span>LESSONS LEFT</span>
            </div>
          </div>

          <Link
            href="/playground"
            className="cosmic-button outline-button full-button"
          >
            OPEN PLAYGROUND <span>→</span>
          </Link>
        </article>

        {/* MISSIONS */}
        <article className="dashboard-card mission-card">
          <div className="card-heading">
            <div>
              <h2>MISSION TIMELINE</h2>
              <p>YOUR NEXT MILESTONES</p>
            </div>
          </div>

          <div className="mission-list">
            {missions.map((mission) => (
              <Link
                className={`mission-item ${mission.status}`}
                href={mission.href}
                key={mission.title}
              >
                <div className="mission-node">
                  {mission.icon}
                </div>

                <div className="mission-description">
                  <strong>{mission.title}</strong>
                  <span>{mission.subtitle}</span>
                </div>
              </Link>
            ))}
          </div>
        </article>

        {/* UPCOMING */}
        <article className="dashboard-card upcoming-card">
          <div className="card-heading">
            <div>
              <h2>UPCOMING</h2>
              <p>YOUR NEXT ADVENTURE</p>
            </div>
            <Link href="/playground" className="card-arrow" aria-label="Open JavaScript playground">↗</Link>
          </div>

          <div className="upcoming-image" />

          <div className="upcoming-info">
            <h3>JavaScript Playground</h3>
            <p>Try JavaScript examples and run your own code.</p>
          </div>

          <div className="upcoming-date">
            <span>▦</span>
            <span>Available now</span>
          </div>

          <Link
            href="/playground"
            className="cosmic-button outline-button full-button"
          >
            OPEN PLAYGROUND <span>→</span>
          </Link>
        </article>
      </section>

      {/* FOOTER */}
      <footer className="cosmic-footer">
        <span>🐼 CODEBUDDY AI</span>
        <span>LESSONS · PLAYGROUND · NOTES · ON YOUR PHONE</span>
      </footer>
    </main>
  );
}
