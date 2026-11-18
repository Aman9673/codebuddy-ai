"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { chapters, lessonContent, lessons } from "./course";
import { deepLessons } from "./deep-content";

const PROGRESS_STORAGE_KEY = "codebuddy.completedLessons";

export default function LessonsPage() {
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [completed, setCompleted] = useState<number[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [storageNotice, setStorageNotice] = useState("");

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
          setCompleted(parsed);
        }
      }
    } catch (error) {
      console.error("Could not load lesson progress:", error);
    }

    try {
      const saved: unknown = JSON.parse(localStorage.getItem("codebuddy.bookmarks") || "[]");
      if (Array.isArray(saved)) setBookmarks(saved.filter((id) => lessons.some((lesson) => lesson.id === id)));
    } catch { setStorageNotice("Bookmarks could not be restored."); }
    const lessonId = Number(
      new URLSearchParams(window.location.search).get("lesson"),
    );
    if (lessons.some((lesson) => lesson.id === lessonId)) {
      setSelectedLesson(lessonId);
    }
  }, []);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => void restoreProgress(), 0);
    return () => window.clearTimeout(loadTimer);
  }, [restoreProgress]);

  const activeLesson = selectedLesson
    ? lessons.find((lesson) => lesson.id === selectedLesson)
    : null;

  const content = selectedLesson ? lessonContent[selectedLesson] : null;

  function openLesson(id: number) {
    setSelectedLesson(id);
    window.history.replaceState(null, "", `/lessons?lesson=${id}`);
    window.scrollTo(0, 0);
  }

  function backToLessons() {
    setSelectedLesson(null);
    window.history.replaceState(null, "", "/lessons");
    window.scrollTo(0, 0);
  }

  function toggleBookmark(id: number) {
    const next = bookmarks.includes(id) ? bookmarks.filter((item) => item !== id) : [...bookmarks, id];
    setBookmarks(next);
    try { localStorage.setItem("codebuddy.bookmarks", JSON.stringify(next)); }
    catch { setStorageNotice("Bookmarks cannot be saved in this browser session."); }
  }
  const visibleLessons = lessons.filter((lesson) => {
    const matches = `${lesson.title} ${lesson.topic} ${lesson.description}`.toLowerCase().includes(query.trim().toLowerCase());
    return matches && (filter === "all" || (filter === "saved" ? bookmarks.includes(lesson.id) : filter === "complete" ? completed.includes(lesson.id) : !completed.includes(lesson.id)));
  });
  const deep = selectedLesson ? deepLessons[selectedLesson] : null;

  return (
    <main className="learn-page">
      <header className="learn-header">
        <Link className="learn-brand" href="/">
          🐼 <span>CodeBuddy</span>
        </Link>
        <Link className="back-dashboard" href="/">
          ← Dashboard
        </Link>
      </header>

      {storageNotice && <p className="app-notice" role="status">{storageNotice}</p>}
      {selectedLesson && activeLesson && content ? (
        <section className="lesson-view">
          <button className="back-link" onClick={backToLessons}>
            ← All lessons
          </button>

          <div className="lesson-view-heading">
            <span className="lesson-big-emoji">{activeLesson.emoji}</span>
            <div>
              <span className="learn-eyebrow">
                CHAPTER {activeLesson.chapterId} · CONCEPT{" "}
                {activeLesson.topic.toUpperCase()}
              </span>
              <h1>{activeLesson.title}</h1>
              <p>Read at your own pace · {activeLesson.xp} XP in the separate quiz</p>
            </div>
          </div>

          <div className="lesson-utility-bar"><Link href={`/playground?lesson=${activeLesson.id}`} className="text-link">Try the example live</Link><button className="bookmark-button" aria-pressed={bookmarks.includes(activeLesson.id)} onClick={() => toggleBookmark(activeLesson.id)}>{bookmarks.includes(activeLesson.id) ? "Saved for later" : "Save for later"}</button></div>
          <article className="lesson-panel">
            <span className="learn-eyebrow">LET&apos;S LEARN</span>
            <h2>{content.heading}</h2>
            <p>{content.explanation}</p>

            {deep && <>
              <section className="lesson-objectives">
                <h3>What you will learn</h3>
                <ul>{deep.objectives.map((goal) => <li key={goal}>{goal}</li>)}</ul>
              </section>
              <nav className="lesson-contents" aria-label="Lesson contents">
                <strong>In this lesson</strong>
                {deep.sections.map((section, index) => <a key={section.title} href={`#section-${index}`}>{index + 1}. {section.title}</a>)}
                <a href="#worked-example">Worked example</a>
                <a href="#practice">Practice on your own</a>
              </nav>
              {deep.sections.map((section, index) => <section className="deep-section" id={`section-${index}`} key={section.title}>
                <h3>{section.title}</h3>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.code && <><pre className="lesson-code"><code>{section.code}</code></pre><div className="output-box"><strong>Expected output</strong><pre>{section.output}</pre></div></>}
              </section>)}
            </>}
            <h3 id="worked-example">Worked example</h3>
            <div className="code-example-heading">
              <span>🐍 Python example</span>
              <span>EXAMPLE</span>
            </div>
            <pre className="lesson-code">
              <code>{content.code}</code>
            </pre>

            <div className="output-box">
              <strong>Expected output</strong>
              <pre>{content.output}</pre>
            </div>

            {deep && <>
              <section className="deep-section"><h3>Step-by-step walkthrough</h3><ol>{deep.walkthrough.map((step) => <li key={step}>{step}</li>)}</ol></section>
              <section className="lesson-objectives"><h3>Common mistakes to avoid</h3><ul>{deep.mistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}</ul></section>
              <section className="deep-section" id="practice"><h3>Practice on your own</h3><p>{deep.practice.task}</p>
                <Link className="secondary-learn-button" href={`/playground?lesson=${activeLesson.id}&exercise=1`}>Try this exercise</Link>
                <details><summary>Need a hint?</summary><p>{deep.practice.hint}</p></details>
                <details><summary>Show solution and explanation</summary><pre className="lesson-code"><code>{deep.practice.solution}</code></pre><div className="output-box"><strong>Expected output</strong><pre>{deep.practice.output}</pre></div><p>{deep.practice.explanation}</p></details>
              </section>
              <section className="lesson-objectives"><h3>Remember this</h3><p>{deep.takeaway}</p></section>
            </>}
            <div className="lesson-actions">
              <button className="secondary-learn-button" onClick={backToLessons}>All lessons</button>
              <Link className="primary-learn-button" href={`/quizzes?lesson=${activeLesson.id}`}>Take this topic&apos;s quiz →</Link>
              {lessons[lessons.findIndex((lesson) => lesson.id === activeLesson.id) + 1] && <button className="secondary-learn-button" onClick={() => { openLesson(lessons[lessons.findIndex((lesson) => lesson.id === activeLesson.id) + 1].id); window.scrollTo(0, 0); }}>Next lesson &rarr;</button>}
            </div>
          </article>
        </section>
      ) : (
        <section className="lessons-content">
          <div className="lessons-hero">
            <div>
              <span className="learn-eyebrow">YOUR CODING ADVENTURE</span>
              <h1>
                Learn to code.
                <br />
                <span>One step at a time.</span>
              </h1>
              <p>
                Build a deep understanding with detailed explanations, worked
                examples, common mistakes, and guided practice for every topic.
              </p>
            </div>
            <div className="lessons-hero-panda">🐼</div>
              <div className="lessons-hero-chip">BEGINNER MODE ✨</div>
          </div>

          <div className="lesson-actions"><Link className="primary-learn-button" href="/quizzes">Go to the quiz section →</Link></div>
          <div className="learning-summary">
            <div>
              <span>📚</span>
              <div>
                <strong>{lessons.length} in-depth lessons</strong>
                <small>Start with the basics</small>
              </div>
            </div>
            <div>
              <span>🏆</span>
              <div>
                <strong>{completed.length} completed</strong>
                <small>Topic quizzes passed</small>
              </div>
            </div>
            <div>
              <span>⚡</span>
              <div>
                <strong>
                  {lessons
                    .filter((lesson) => completed.includes(lesson.id))
                    .reduce((total, lesson) => total + lesson.xp, 0)}{" "}
                  XP earned
                </strong>
                <small>Pass topic quizzes to earn XP</small>
              </div>
            </div>
          </div>

          <div className="lessons-section-title">
            <div>
              <span className="learn-eyebrow">PYTHON LEARNING PATH</span>
              <h2>Learn chapter by chapter 🐾</h2>
            </div>
            <span className="difficulty-badge">🌱 Beginner</span>
          </div>

          <div className="lesson-explorer"><label className="lesson-search-label">Find your next discovery<input type="search" placeholder="Search variables, loops, functions..." value={query} onChange={(event) => setQuery(event.target.value)} /></label><div className="segmented-control" role="group" aria-label="Filter lessons">{[["all", "All lessons"], ["todo", "To learn"], ["complete", "Completed"], ["saved", "Saved"]].map(([value, label]) => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}</div></div>
          <p className="results-count" role="status">{visibleLessons.length} lessons to explore</p>
          {visibleLessons.length === 0 && <div className="empty-state-card"><h3>No lessons found</h3><p>Try another search or save a lesson to find it here later.</p><button onClick={() => { setQuery(""); setFilter("all"); }}>Show all lessons</button></div>}
          <div className="chapter-list">
            {chapters.map((chapter, chapterIndex) => {
              const chapterLessons = visibleLessons.filter(
                (lesson) => lesson.chapterId === chapter.id,
              );
              if (!chapterLessons.length) return null;
              const chapterCompleted = chapterLessons.filter((lesson) =>
                completed.includes(lesson.id),
              ).length;

              return (
                <section className="chapter-section" key={chapter.id}>
                  <div className="chapter-heading">
                    <span className="chapter-icon">{chapter.icon}</span>
                    <div className="chapter-heading-info">
                      <span className="learn-eyebrow">
                        CHAPTER {String(chapterIndex + 1).padStart(2, "0")}
                      </span>
                      <h3>{chapter.title}</h3>
                      <p>{chapter.description}</p>
                    </div>
                    <span className="chapter-progress">
                      {chapterCompleted}/{chapterLessons.length} concepts
                    </span>
                  </div>
                  <div className="lesson-list">
                    {chapterLessons.map((lesson) => {
                      const isCompleted = completed.includes(lesson.id);

                      return (
                        <article
                          className={`lesson-row ${isCompleted ? "is-completed" : ""}`}
                          key={lesson.id}
                        >
                          <div className="lesson-row-icon">{lesson.emoji}</div>
                          <div className="lesson-row-info">
                            <div className="lesson-row-meta">
                              <span>
                                CONCEPT {String(lesson.id).padStart(2, "0")}
                              </span>
                              <span>·</span>
                              <span>{lesson.duration}</span>
                            </div>
                            <h3>{lesson.title}</h3>
                            <p>{lesson.description}</p>
                            <div className="lesson-row-tags">
                              <span>{lesson.topic}</span>
                              <span>+{lesson.xp} XP</span>
                            </div>
                          </div>
                          <button className="bookmark-button" aria-label={`${bookmarks.includes(lesson.id) ? "Unsave" : "Save"} ${lesson.title}`} aria-pressed={bookmarks.includes(lesson.id)} onClick={() => toggleBookmark(lesson.id)}>{bookmarks.includes(lesson.id) ? "?" : "?"}</button>
                          <button
                            className="open-lesson-button"
                            onClick={() => openLesson(lesson.id)}
                          >
                            {isCompleted ? "Review ✓" : "Start →"}
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>

          <div className="lessons-footer">
            Made with 💜 for curious minds · Learn at your own pace.
          </div>
        </section>
      )}
    </main>
  );
}
