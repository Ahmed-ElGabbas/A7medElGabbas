"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Terminal } from "lucide-react";

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.replace("/admin/dashboard");
        router.refresh();
        return;
      }

      const data = (await res.json().catch(() => null)) as {
        message?: string | string[];
      } | null;

      const message = Array.isArray(data?.message)
        ? data?.message.join(", ")
        : data?.message;

      setError(message ?? "Invalid email or password.");
    } catch {
      setError("Could not reach the API. Is the backend running?");
    } finally {
      setStatus("idle");
    }
  }

  const busy = status === "submitting";

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-20">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card">
            <Terminal className="h-5 w-5 gold-text" aria-hidden />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            <span className="gold-text">{"//"}</span> admin
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Authenticate to manage portfolio content.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-xs uppercase tracking-wider text-muted-foreground"
            >
              Email
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:opacity-60"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-xs uppercase tracking-wider text-muted-foreground"
            >
              Password
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:opacity-60"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Authenticating…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          This area is not indexed. Contact the site owner for access.
        </p>
      </div>
    </div>
  );
}
