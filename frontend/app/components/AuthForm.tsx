"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const signingUp = mode === "signup";
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const form = new FormData(event.currentTarget);
    setError("");
    setPending(true);
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CodeBuddy-Auth": "1" },
        body: JSON.stringify({
          name: form.get("name")?.toString().trim(),
          email: form.get("email")?.toString().trim(),
          password: form.get("password"),
        }),
      });

      if (response.ok) {
        window.location.replace("/");
        return;
      }
      const body = await response.json().catch(() => null);
      setError(typeof body?.detail === "string" ? body.detail :
        response.status === 422 ? "Check your name, email, and password and try again." :
        "The account service is unavailable. Try again in a moment.");
    } catch {
      setError("Could not reach the account service. Try again in a moment.");
    }
    setPending(false);
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <span className="auth-panda" aria-hidden="true">🐼</span>
        <h1 id="auth-title">{signingUp ? "Create your account" : "Welcome back"}</h1>
        <p className="auth-intro">
          {signingUp ? "Join Panda and start coding with CodeBuddy." : "Log in to your CodeBuddy account."}
        </p>

        <form className="auth-form" onSubmit={submit} aria-busy={pending}>
          {signingUp && (
            <label htmlFor="auth-name">
              Display name
              <input id="auth-name" name="name" autoComplete="name" required pattern=".*\S.*" maxLength={60} />
            </label>
          )}
          <label htmlFor="auth-email">
            Email
            <input id="auth-email" name="email" type="email" autoComplete="email" required maxLength={254} />
          </label>

          <div className="auth-password-field">
            <label htmlFor="auth-password">Password</label>
            <div className="auth-password">
              <input
                id="auth-password"
                name="password"
                type={visible ? "text" : "password"}
                autoComplete={signingUp ? "new-password" : "current-password"}
                aria-describedby={signingUp ? "password-hint" : undefined}
                minLength={signingUp ? 8 : undefined}
                maxLength={128}
                required
              />
              <button type="button" aria-controls="auth-password" onClick={() => setVisible(!visible)}>
                {visible ? "Hide password" : "Show password"}
              </button>
            </div>
            {signingUp && <small id="password-hint">Use at least 8 characters.</small>}
          </div>

          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={pending}>
            {pending ? (signingUp ? "Creating account…" : "Logging in…") : (signingUp ? "Create account" : "Log in")}
          </button>
        </form>

        <p className="auth-switch">
          {signingUp ? "Already have an account? " : "New to CodeBuddy? "}
          <Link href={signingUp ? "/login" : "/signup"}>{signingUp ? "Log in" : "Sign up"}</Link>
        </p>
        <p className="auth-switch"><Link href="/">Back to dashboard</Link></p>
      </section>
    </main>
  );
}
