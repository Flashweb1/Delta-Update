"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { Lock, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        window.location.href = "/admin";
        return;
      }
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Sign-in failed. Please try again.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#07172c] via-[#0b2545] to-[#102b49] px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white p-7 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 shadow-sm">
            <Image
              src="/delta-updates-icon.png"
              alt="Delta Updates"
              width={466}
              height={401}
              priority
              className="h-10 w-auto object-contain"
            />
          </span>
          <h1 className="mt-4 font-serif text-xl font-bold tracking-tight text-[#102b49]">
            Newsroom sign-in
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Editor access only. This workspace is protected.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
              Newsroom password
            </span>
            <span className="relative block">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                autoFocus
                placeholder="Enter password"
                aria-label="Newsroom password"
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </span>
          </label>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || password.length === 0}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#ba202c] text-sm font-bold text-white transition hover:bg-[#a51925] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            )}
            {loading ? "Signing in…" : "Enter newsroom"}
          </button>
        </form>

        <p className="mt-5 text-center text-[10px] leading-4 text-slate-400">
          Restricted area. Unauthorized access attempts are rate-limited.
        </p>
      </div>
    </div>
  );
}
