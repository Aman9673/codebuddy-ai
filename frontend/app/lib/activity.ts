export type DayActivity = { date: string; runs: number; quizzes: number };
const KEY = "codebuddy.activity.v1";
export function dateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function readActivity(): DayActivity[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(data) ? data.filter((item): item is DayActivity => !!item && typeof item.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item.date) && Number.isInteger(item.runs) && item.runs >= 0 && Number.isInteger(item.quizzes) && item.quizzes >= 0) : [];
  } catch { return []; }
}
export function recordActivity(kind: "run" | "quiz") {
  try {
    const all = readActivity();
    const date = dateKey();
    const day = all.find((item) => item.date === date) ?? { date, runs: 0, quizzes: 0 };
    if (!all.includes(day)) all.push(day);
    if (kind === "run") day.runs++; else day.quizzes++;
    localStorage.setItem(KEY, JSON.stringify(all.slice(-365)));
    window.dispatchEvent(new Event("codebuddy-activity"));
  } catch { /* Practice still works when browser storage is unavailable. */ }
}
