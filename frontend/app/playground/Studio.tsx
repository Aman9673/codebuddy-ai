"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { courseFiles, lessonContent, lessons } from "../lessons/course";
import { deepLessons } from "../lessons/deep-content";
import { recordActivity } from "../lib/activity";
import { downloadText } from "../lib/download";

const languageLabels = { python: "🐍 Python", javascript: "JS JavaScript", cpp: "C++", java: "Java", csharp: "C#" };
type Language = keyof typeof languageLabels;
type Output = { text: string; kind: string };
type RunStage = { stdout: string; stderr: string; code: number | null; signal: string | null; message: string | null };
type CompiledRun = { compile: RunStage | null; run: RunStage | null };

const languages = Object.keys(languageLabels) as Language[];
const filenames: Record<Language, string> = {
  python: "main.py",
  javascript: "main.js",
  cpp: courseFiles.cpp.filename,
  java: courseFiles.java.filename,
  csharp: courseFiles.csharp.filename,
};

function lessonExamples(language: keyof typeof courseFiles) {
  return lessons.filter((lesson) => lesson.language === language)
    .map((lesson) => ({ name: lesson.title, code: lessonContent[lesson.id].code }));
}

const examples: Record<Language, { name: string; code: string }[]> = {
  python: [
    { name: "Hello world", code: 'name = "CodeBuddy"\nprint(f"Hello, {name}!")\nprint("Let’s build something.")' },
    { name: "Decisions", code: 'score = 82\nif score >= 80:\n    print("Excellent work!")\nelse:\n    print("Keep practicing!")' },
    { name: "Loops", code: 'total = 0\nfor number in range(1, 6):\n    total += number\n    print(f"Step {number}: total = {total}")' },
    { name: "Functions", code: 'def greet(name):\n    return f"Welcome, {name}!"\n\nprint(greet("Asha"))\nprint(greet("Panda"))' },
    { name: "Collections", code: 'scores = {"Asha": 90, "Ravi": 85, "Sam": 92}\nfor name, score in scores.items():\n    print(f"{name}: {score}")' },
  ],
  javascript: [
    { name: "Hello world", code: 'const name = "CodeBuddy";\nconsole.log(`Hello, ${name}!`);' },
    { name: "Variables", code: 'const price = 25;\nconst quantity = 3;\nconsole.log("Total:", price * quantity);' },
    { name: "Loops", code: 'for (let i = 1; i <= 5; i++) {\n  console.log(`Step ${i}`);\n}' },
    { name: "Functions", code: 'function double(number) {\n  return number * 2;\n}\nconsole.log(double(21));' },
    { name: "Arrays", code: 'const scores = [80, 95, 72];\nconsole.log("Passing:", scores.filter(score => score >= 80));' },
  ],
  cpp: lessonExamples("cpp"),
  java: lessonExamples("java"),
  csharp: lessonExamples("csharp"),
};
const DRAFT_KEY = "codebuddy.playground.v2";

export default function PlaygroundPage() {
  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState(examples.python[0].code);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState<Output[]>([]);
  const [status, setStatus] = useState("Ready when you are");
  const [running, setRunning] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState("");
  const [active, setActive] = useState("Hello world");
  const [lessonId, setLessonId] = useState<number | null>(null);
  const [focus, setFocus] = useState(false);
  const worker = useRef<Worker | null>(null);
  const compiledRequest = useRef<AbortController | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const busy = useRef(false);
  const drafts = useRef<Partial<Record<Language, string>>>({});
  const textarea = useRef<HTMLTextAreaElement>(null);
  const gutter = useRef<HTMLDivElement>(null);

  const stopWorker = useCallback(() => {
    compiledRequest.current?.abort();
    compiledRequest.current = null;
    worker.current?.terminate(); worker.current = null;
    if (timer.current) clearTimeout(timer.current);
    busy.current = false;
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const saved: unknown = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
        if (saved && typeof saved === "object") {
          for (const lang of languages) {
            const value = (saved as Record<string, unknown>)[lang];
            if (typeof value === "string") drafts.current[lang] = value;
          }
        }
      } catch { setNotice("Your previous draft could not be restored."); }
      const params = new URLSearchParams(window.location.search);
      const lesson = lessons.find((item) => item.id === Number(params.get("lesson")));
      const lang = languages.find((item) => item === params.get("language")) ?? "python";
      if (lesson) {
        const content = lessonContent[lesson.id];
        const practice = params.get("exercise") === "1";
        const task = deepLessons[lesson.id]?.practice.task ?? content.exercise;
        setLessonId(lesson.id);
        setLanguage(lesson.language ?? "python");
        setCode(practice && task
          ? lesson.language ? `// ${task}\n${content.code}` : `# ${task}\n# Write your solution below.\n`
          : content.code);
        setActive(practice ? "" : lesson.title);
      } else {
        setLanguage(lang);
        setCode(drafts.current[lang] ?? examples[lang][0].code);
        setActive(drafts.current[lang] === undefined ? examples[lang][0].name : "");
      }
      setLoaded(true);
    }, 0);
    return () => { clearTimeout(timeout); stopWorker(); };
  }, [stopWorker]);

  useEffect(() => {
    if (!loaded) return;
    drafts.current[language] = code;
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts.current)); }
    catch { const id = setTimeout(() => setNotice("Draft saving is unavailable. Download your code to keep a copy."), 0); return () => clearTimeout(id); }
  }, [code, language, loaded]);

  const run = useCallback(() => {
    if (busy.current || !code.trim()) return;
    busy.current = true; setRunning(true); setOutput([]);
    setStatus(language === "python" ? "Preparing Python…" : "Running…");
    const fail = (text: string) => {
      stopWorker(); setRunning(false); setStatus("Run stopped");
      setOutput((previous) => [...previous, { kind: "error", text }]);
    };
    if (language !== "python" && language !== "javascript") {
      const controller = new AbortController();
      compiledRequest.current = controller;
      setStatus("Compiling…");
      void (async () => {
        try {
          const response = await fetch("/api/playground/run", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-CodeBuddy-Auth": "1" },
            body: JSON.stringify({ language, code, stdin }),
            signal: controller.signal,
          });
          const result = await response.json();
          if (controller.signal.aborted) return;
          if (!response.ok) {
            throw new Error(typeof result.detail === "string" ? result.detail : "The runner could not process this program.");
          }
          const { compile, run }: CompiledRun = result;
          const lines: Output[] = [];
          for (const stage of [compile, run]) {
            if (!stage) continue;
            if (stage.stdout) lines.push({ kind: "log", text: stage.stdout });
            if (stage.stderr) lines.push({ kind: "error", text: stage.stderr });
            if (stage.message) lines.push({ kind: "error", text: stage.message });
          }
          const completed = run?.code === 0 && !run.signal;
          setOutput(lines);
          setStatus(completed ? "Completed" : !run && compile ? "Compilation failed" : "Program stopped");
          if (completed) recordActivity("run");
        } catch (error) {
          if (!controller.signal.aborted) fail(error instanceof Error ? error.message : "Could not connect to the runner.");
        } finally {
          if (compiledRequest.current === controller) {
            compiledRequest.current = null;
            busy.current = false;
            setRunning(false);
          }
        }
      })();
      return;
    }
    try {
      if (!worker.current) worker.current = new Worker("/code-runner.js");
      const current = worker.current;
      current.onerror = () => fail("The runner could not start. Check your connection and try again.");
      current.onmessage = ({ data }) => {
        if (data.type === "loading") setStatus("Downloading Python for the first run…");
        if (data.type === "started") {
          setStatus("Running…");
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => fail("Execution stopped after 5 seconds. Check for an infinite loop or try a smaller task."), 5000);
        }
        if (data.type === "line") setOutput((previous) => previous.length < 200 ? [...previous, { text: String(data.text), kind: String(data.kind) }] : previous);
        if (data.type === "error") fail(String(data.text));
        if (data.type === "done") {
          if (timer.current) clearTimeout(timer.current);
          busy.current = false; setRunning(false); setStatus(`Completed in ${data.duration} ms`);
          recordActivity("run");
        }
      };
      timer.current = setTimeout(() => fail("Python could not finish loading. Check your connection, then try again. JavaScript works without downloading Python."), 90000);
      current.postMessage({ language, code, stdin });
    } catch { fail("Your browser could not start the code runner. Try a browser with Web Worker support."); }
  }, [code, language, stdin, stopWorker]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") { event.preventDefault(); run(); }
      if (event.key === "Escape") setFocus(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run]);

  function changeLanguage(next: Language) {
    stopWorker(); setRunning(false); setLanguage(next); setLessonId(null);
    setCode(drafts.current[next] ?? examples[next][0].code); setActive(""); setOutput([]); setStatus("Ready when you are");
    window.history.replaceState(null, "", `/playground?language=${next}`);
  }

  const practiceTask = lessonId ? deepLessons[lessonId]?.practice.task ?? lessonContent[lessonId]?.exercise : null;
  const practiceHint = lessonId ? deepLessons[lessonId]?.practice.hint : null;

  return <main className={`playground-page ${focus ? "workspace-focus" : ""}`}><section className="playground-content">
    <div className="page-heading-row"><div className="playground-intro"><span className="playground-eyebrow">YOUR IDEAS. REAL CODE.</span><h1>A little space to <span>build big.</span></h1><p>Try an idea, make a mistake, discover something new. Your draft is saved on this device.</p></div></div>
    {notice && <p className="app-notice" role="status">{notice}</p>}
    {lessonId && <div className="context-banner"><span>Practicing: <strong>{lessons.find((item) => item.id === lessonId)?.title}</strong></span><Link href={`/lessons?lesson=${lessonId}`}>Back to lesson →</Link></div>}
    <div className="workspace-controls"><div className="segmented-control" role="group" aria-label="Programming language">{languages.map((lang) => <button key={lang} aria-pressed={language === lang} onClick={() => changeLanguage(lang)}>{languageLabels[lang]}</button>)}</div><div className="compact-actions"><button onClick={() => { downloadText(filenames[language], code); setNotice("Code downloaded."); }}>↓ Download</button><button aria-pressed={focus} onClick={() => setFocus(!focus)}>{focus ? "Exit focus" : "⛶ Focus mode"}</button></div></div>
    <div className="playground-workspace">
      <section className="editor-panel" aria-label="Code workspace"><div className="editor-toolbar"><div className="editor-file"><span className="editor-dot" />{filenames[language]}</div><div className="editor-actions"><button className="clear-code-button" disabled={running} onClick={() => { setCode(""); setActive(""); textarea.current?.focus(); }}>Clear</button>{running ? <button className="stop-code-button" onClick={() => { stopWorker(); setRunning(false); setStatus("Stopped by you"); }}>■ Stop</button> : <button className="run-code-button" disabled={!loaded || !code.trim()} onClick={run}>▶ Run code</button>}</div></div>
        <div className="examples-bar"><span>TRY AN EXAMPLE</span>{examples[language].map((example) => <button key={example.name} disabled={running} className={active === example.name ? "example-active" : ""} onClick={() => { setActive(example.name); setCode(example.code); }}>{example.name}</button>)}</div>
        <div className="editor-area"><div className="line-numbers" ref={gutter} aria-hidden="true">{code.split("\n").map((_, index) => <div key={index}>{index + 1}</div>)}</div><textarea ref={textarea} className="code-textarea" aria-label={`${language} code editor`} spellCheck={false} autoCapitalize="off" autoCorrect="off" value={code} onChange={(event) => { setCode(event.target.value); setActive(""); }} onScroll={(event) => { if (gutter.current) gutter.current.scrollTop = event.currentTarget.scrollTop; }} onKeyDown={(event) => {
          if (event.key === "Tab") {
            event.preventDefault(); const element = event.currentTarget; const start = element.selectionStart; const end = element.selectionEnd;
            setCode(code.slice(0, start) + "    " + code.slice(end));
            requestAnimationFrame(() => { element.selectionStart = start + 4; element.selectionEnd = start + 4; });
          }
        }} /></div><div className="editor-status"><span>{code.split("\n").length} lines · {code.length} characters</span><span>Ctrl / ⌘ + Enter to run</span></div>
      </section>
      <section className="output-panel"><div className="output-toolbar"><strong>⌘ Console</strong><button onClick={() => setOutput([])}>Clear output</button></div><p className={`runner-status ${running ? "is-running" : ""}`} role="status"><span />{status}</p><div className="output-content" aria-label="Program output" aria-busy={running}>{output.length ? output.map((line, index) => <div className={`output-line output-${line.kind}`} key={index}><span className="output-prompt">›</span><pre>{line.text}</pre></div>) : <div className="console-empty"><span>⌘</span><strong>Your next discovery starts here.</strong><p>Run your code to see the result.</p></div>}</div><div className="output-tip"><p><strong>Panda’s tip:</strong> {language === "python" ? "Use print() to display a value. Python downloads from jsDelivr on your first run; an internet connection is required." : language === "javascript" ? "Use console.log() to inspect a value. This editor runs JavaScript without browser DOM APIs." : "Run sends this draft and its program input to the configured compiler service."}</p></div></section>
    </div>
    {language !== "javascript" && <details className="input-drawer"><summary>Program input <span>One value per line</span></summary><textarea aria-label="Program standard input" placeholder={"Asha\n12"} value={stdin} onChange={(event) => setStdin(event.target.value)} /></details>}
    <div className="playground-challenge"><span className="challenge-emoji">🎯</span><div><span className="playground-eyebrow">SMALL STEPS, REAL SKILLS</span><h2>{practiceTask ?? "Make it your own"}</h2><p>{practiceHint ?? (lessonId ? "Predict the output before you run your changes." : "Change an example, predict the output, then run it. Can you explain why the result changed?")}</p></div><Link className="text-link" href="/lessons">Explore lessons →</Link></div>
  </section></main>;
}
