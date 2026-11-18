"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="learn-page"><section className="lessons-content"><div className="lesson-panel"><span className="learn-eyebrow">LET’S GET YOU BACK ON TRACK</span><h1>Something didn’t load.</h1><p>Try again, or return to your dashboard. Your saved browser data is still on this device.</p><div className="lesson-actions"><button className="primary-learn-button" onClick={reset}>Try again</button><Link className="secondary-learn-button" href="/">Back to dashboard</Link></div></div></section></main>;
}
