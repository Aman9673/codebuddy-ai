"use client";

import Link from "next/link";
import { recordActivity } from "../lib/activity";
import { useEffect, useState } from "react";
import { lessonContent, lessons } from "../lessons/course";

const STORAGE_KEY = "codebuddy.completedLessons";
type Question = { question: string; code?: string; options: string[]; answer: number; reason: string };

const extraQuestions: Record<number, Question[]> = {
  1: [
    { question: "Which statement about a comment is correct?", options: ["It runs twice", "Python ignores it during execution", "It must be printed"], answer: 1, reason: "A # outside a string begins a comment. Comments explain code to people and are not executed." },
    { question: "What is displayed, in order?", code: 'print("Start")\nprint(3 + 4)', options: ["Start, then 7 on a new line", "7, then Start", "Start, then 3 + 4"], answer: 0, reason: "Instructions execute from top to bottom. The second print receives the calculated value 7." },
  ],
  2: [
    { question: "What is the final value of points?", code: 'points = 10\npoints = points + 5', options: ["10", "15", "5"], answer: 1, reason: "Python reads the old value 10, adds 5, then assigns the result 15 to points." },
    { question: 'What does "12" + "3" produce?', options: ["15", 'The string "123"', "An integer 123"], answer: 1, reason: "Both operands are strings, so + joins their text rather than performing numeric addition." },
  ],
  3: [
    { question: 'What does print("2 + 3") display?', options: ["5", "2 + 3", "23"], answer: 1, reason: "Quotes make the argument a literal string. Python does not evaluate arithmetic written inside that string." },
    { question: "What is displayed?", code: 'name = "Asha"\nprint(f"Hi {name}")', options: ["Hi name", "Hi {name}", "Hi Asha"], answer: 2, reason: "The f prefix makes Python evaluate the expression inside braces and insert Asha into the message." },
  ],
  4: [
    { question: "Which branch runs?", code: 'score = 90\nif score >= 50:\n    print("Passed")\nelif score >= 80:\n    print("Excellent")', options: ["Both branches", "Passed only", "Excellent only"], answer: 1, reason: "A decision chain selects its first matching branch. Since 90 >= 50 is true, the elif is skipped." },
    { question: "What marks the statements belonging to an if block?", options: ["Quotation marks", "Indentation", "Their variable names"], answer: 1, reason: "Python uses indentation to group a block. The header also requires a colon." },
  ],
  5: [
    { question: "Which values does range(2, 8, 2) supply?", options: ["2, 4, 6", "2, 4, 6, 8", "0, 2, 4, 6"], answer: 0, reason: "The start is 2, the step is 2, and the stop value 8 is excluded." },
    { question: "Where should total = 0 go when accumulating a sum?", options: ["Inside the loop before every addition", "After the loop", "Before the loop"], answer: 2, reason: "Initialize once before repeating. Resetting inside the body would discard earlier accumulated values." },
  ],
  6: [
    { question: "What output does this definition produce by itself?", code: 'def greet():\n    print("Hello")', options: ["Hello once", "No output", "Hello forever"], answer: 1, reason: "def creates the function. Its body runs only when the function is called." },
    { question: "How do you execute a function named greet with no inputs?", options: ["greet", "def greet", "greet()"], answer: 2, reason: "The parentheses call the function. Its name alone refers to the function without running the body." },
  ],
  7: [
    { question: "Which condition includes a score exactly equal to 50?", options: ["score > 50", "score >= 50", "score < 50"], answer: 1, reason: ">= includes equality. Boundary values distinguish inclusive from strict comparisons." },
    { question: "What is True and False?", options: ["True", "False", "An error"], answer: 1, reason: "and requires both Boolean conditions to be true. One false condition makes this result False." },
  ],
  8: [
    { question: "How many iterations occur?", code: 'count = 5\nwhile count < 3:\n    count += 1', options: ["Zero", "One", "Three"], answer: 0, reason: "The condition is checked before entering the body. 5 < 3 is already false." },
    { question: "What is the risk of omitting a necessary counter update?", options: ["The loop always runs once", "The condition may stay true forever", "The counter updates automatically"], answer: 1, reason: "A while loop does not advance a counter automatically. Its state must change or another exit such as break must be reached." },
  ],
  9: [
    { question: "What value is stored in result?", code: 'def double(n):\n    return n * 2\nresult = double(5) + 1', options: ["10", "11", "None"], answer: 1, reason: "double(5) returns 10. The caller adds 1 and stores 11." },
    { question: "What does a function return if it reaches the end without return?", options: ["Its last printed number", "0", "None"], answer: 2, reason: "The implicit return value is None. Printing inside the function does not supply a numeric return value." },
  ],
  10: [
    { question: "Which expression selects the last item of a nonempty list?", options: ["items[-1]", "items[len(items)]", "items[0] always"], answer: 0, reason: "Negative index -1 selects the last item. len(items) is past the last valid positive index." },
    { question: "What is the result?", code: 'items = [10, 20, 30]\nprint(items[0:2])', options: ["[10, 20, 30]", "[10, 20]", "[20, 30]"], answer: 1, reason: "A slice includes the start index and excludes the stop, so only indexes 0 and 1 are selected." },
  ],
  11: [
    { question: "What is stored in result?", code: 'tasks = ["read"]\nresult = tasks.append("review")', options: ["The updated list", "2", "None"], answer: 2, reason: "append modifies tasks in place and returns None. The list itself now contains two strings." },
    { question: "Which operation removes and returns the final list item?", options: ["items.pop()", "len(items)", "items.append()"], answer: 0, reason: "pop without an index removes and returns the last item. It requires a nonempty list." },
  ],
  12: [
    { question: "What is displayed?", code: 'student = {"name": "Asha"}\nprint(student.get("score", 0))', options: ["An error", "0", "Asha"], answer: 1, reason: "score is missing, so get returns its supplied default 0 without inserting a new key." },
    { question: "What happens when you assign a new value to an existing key?", options: ["The old value is replaced", "A duplicate key is added", "The dictionary becomes a list"], answer: 0, reason: "Dictionary keys are unique. Assignment updates the value associated with that existing key." },
  ],
};

export default function QuizzesPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [completed, setCompleted] = useState<number[]>([]);
  const [storageError, setStorageError] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const id = Number(new URLSearchParams(window.location.search).get("lesson"));
      if (lessons.some((lesson) => lesson.id === id)) setSelected(id);
      try {
        const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        if (Array.isArray(saved)) setCompleted([...new Set(saved.filter((id): id is number => typeof id === "number" && lessons.some((lesson) => lesson.id === id)))]);
      } catch { setStorageError("Saved progress could not be loaded. You can still take quizzes."); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const lesson = lessons.find((item) => item.id === selected);
  const original = selected ? lessonContent[selected] : null;
  const questions: Question[] = original && selected ? [original, ...extraQuestions[selected]] : [];
  const allCorrect = questions.length > 0 && questions.every((question, index) => responses[index] === question.answer);
  function open(id: number | null) {
    setSelected(id);
    setResponses({});
    window.history.replaceState(null, "", id ? `/quizzes?lesson=${id}` : "/quizzes");
    window.scrollTo(0, 0);
  }
  function answer(questionIndex: number, optionIndex: number) {
    if (!lesson || responses[questionIndex] === questions[questionIndex].answer) return;
    const next = { ...responses, [questionIndex]: optionIndex };
    setResponses(next);
    if (questions.every((question, index) => next[index] === question.answer)) {
      recordActivity("quiz");
      const progress = [...new Set([...completed, lesson.id])];
      setCompleted(progress);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); }
      catch { setStorageError("You passed, but this browser could not save your progress. Keep storage enabled to retain it."); }
    }
  }
  return <main className="learn-page"><section className="lessons-content">
    <span className="learn-eyebrow">PRACTICE & UNDERSTANDING</span>
    <h1>Python quizzes</h1>
    <p>Study at your own pace, then check your understanding here. Each topic has three questions with explanations. Answer all three correctly to complete a topic and earn its XP.</p>
    <p className="quiz-progress">{completed.length} of {lessons.length} topics completed · Retry questions as you learn.</p>
    {storageError && <p role="status">{storageError}</p>}
    {lesson && original ? <>
      <button className="back-link" onClick={() => open(null)}>← All quizzes</button>
      <h2>{lesson.emoji} {lesson.title}</h2>
      <div className="lesson-actions"><Link className="secondary-learn-button" href={`/lessons?lesson=${lesson.id}`}>Review the full lesson</Link><button className="secondary-learn-button" onClick={() => setResponses({})}>Restart quiz</button></div>
      <p className="quiz-progress" role="status">{questions.filter((question, index) => responses[index] === question.answer).length} / {questions.length} correct</p>
      {questions.map((question, index) => {
        const chosen = responses[index];
        const correct = chosen === question.answer;
        return <article className="lesson-panel" key={`${lesson.id}-${index}`}>
          <span className="learn-eyebrow">QUESTION {index + 1} OF {questions.length}</span>
          <h3>{question.question}</h3>
          {question.code && <pre className="lesson-code"><code>{question.code}</code></pre>}
          {index === 0 && <pre className="lesson-code"><code>{original.code}</code></pre>}
          <div className="quiz-options">{question.options.map((option, optionIndex) => <button key={option} className={`quiz-option ${chosen === optionIndex ? correct ? "correct" : "incorrect" : ""}`} disabled={correct} onClick={() => answer(index, optionIndex)}><span>{String.fromCharCode(65 + optionIndex)}</span>{option}</button>)}</div>
          {chosen !== undefined && <p className={`quiz-feedback ${correct ? "success" : "error"}`} role="status">{correct ? question.reason : "Not quite. Trace the example or review the lesson, then try another answer."}</p>}
        </article>;
      })}
      {allCorrect && <div className="lesson-objectives" role="status"><h3>Topic complete!</h3><p>You answered every question correctly. This topic counts once toward your progress and {lesson.xp} XP.</p><button className="primary-learn-button" onClick={() => open(null)}>Choose another quiz</button></div>}
    </> : <div className="chapter-list">{lessons.map((item) => <article className="lesson-row" key={item.id}><span className="lesson-row-icon">{item.emoji}</span><div className="lesson-row-info"><h2>{item.title}</h2><p>3 questions · {item.xp} XP {completed.includes(item.id) ? "· Completed ✓" : ""}</p><Link href={`/lessons?lesson=${item.id}`}>Read lesson</Link></div><button className="open-lesson-button" onClick={() => open(item.id)}>{completed.includes(item.id) ? "Retry quiz" : "Start quiz"}</button></article>)}</div>}
  </section></main>;
}
