"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { dateKey, readActivity, type DayActivity } from "../lib/activity";

export default function LearningPulse() {
  const [activity, setActivity] = useState<DayActivity[]>([]);
  const [today, setToday] = useState("");
  useEffect(() => {
    const update = () => { setToday(dateKey()); setActivity(readActivity()); };
    const timer = setTimeout(update, 0);
    window.addEventListener("codebuddy-activity", update);
    window.addEventListener("storage", update);
    window.addEventListener("focus", update);
    return () => { clearTimeout(timer); window.removeEventListener("codebuddy-activity", update); window.removeEventListener("storage", update); window.removeEventListener("focus", update); };
  }, []);
  const day = activity.find((item) => item.date === today);
  const missions = [
    { title: "Experiment with code", description: "Run a program in the playground", done: (day?.runs ?? 0) > 0, href: "/playground", icon: "⌘" },
    { title: "Put your knowledge to work", description: "Complete one topic quiz", done: (day?.quizzes ?? 0) > 0, href: "/quizzes", icon: "✦" },
  ];
  const achieved = missions.filter((mission) => mission.done).length;
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(`${today || "2000-01-07"}T12:00:00`);
    date.setDate(date.getDate() - 6 + index);
    const key = dateKey(date);
    const record = activity.find((item) => item.date === key);
    return { key, label: date.toLocaleDateString("en", { weekday: "short" }), active: !!record && record.runs + record.quizzes > 0 };
  });
  return <section className="learning-pulse" aria-label="Daily learning plan">
    <div className="pulse-plan"><div className="pulse-heading"><div><span className="section-kicker">BUILD A LITTLE MOMENTUM</span><h2>Your next small win.</h2><p>Two simple steps. A stronger coding habit.</p></div><span className={`daily-badge ${achieved === 2 ? "earned" : ""}`}>{achieved === 2 ? "✧ Daily goal complete" : `${achieved}/2 daily goals`}</span></div>
      <div className="daily-missions">{missions.map((mission) => <Link href={mission.href} className={`daily-mission ${mission.done ? "done" : ""}`} key={mission.title}><span className="mission-symbol">{mission.done ? "✓" : mission.icon}</span><div><strong>{mission.title}</strong><small>{mission.description}</small></div><span aria-hidden="true">↗</span></Link>)}</div>
    </div><div className="pulse-week"><span className="section-kicker">YOUR LAST 7 DAYS</span><h3>Consistency adds up.</h3><div className="week-days">{week.map((item) => <div key={item.key}><span className={`week-dot ${item.active ? "active" : ""}`} title={`${item.key}: ${item.active ? "Practiced" : "No activity recorded"}`}>{item.active ? "✓" : "·"}</span><small>{item.label}</small></div>)}</div><p>{week.filter((item) => item.active).length} active days · Progress stays on this device.</p></div>
  </section>;
}
