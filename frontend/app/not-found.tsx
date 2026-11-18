import Link from "next/link";

export default function NotFound() {
  return (
    <main className="cosmic-dashboard">
      <section className="dashboard-card" style={{ maxWidth: 640, margin: "24px auto" }}>
        <span className="learn-eyebrow">404</span>
        <h1 style={{ margin: "8px 0 10px", fontSize: 36 }}>This page wandered off.</h1>
        <p style={{ color: "#b9c1dc", lineHeight: 1.6 }}>
          That link does not match a CodeBuddy page. Head back to the dashboard,
          lessons, or playground.
        </p>
        <div className="hero-actions" style={{ marginTop: 20 }}>
          <Link href="/" className="cosmic-button primary-button">
            Back to dashboard
          </Link>
          <Link href="/lessons" className="cosmic-button outline-button">
            Open lessons
          </Link>
        </div>
      </section>
    </main>
  );
}
