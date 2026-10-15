"use client";

import React, { useState } from "react";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";
import { NIGERIAN_STATES } from "@/lib/nigeria";

export default function NewsletterWidget({ demoMode = false }: { demoMode?: boolean }) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [region, setRegion] = useState("All Nigeria");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setStatus("loading");
    setMessage("");

    if (demoMode) {
      window.setTimeout(() => {
        setStatus("success");
        setMessage("You're subscribed to the Nigeria Local Brief.");
      }, 600);
      return;
    }

    try {
      const res = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fullName, lga: region }),
      });

      if (res.ok) {
        setStatus("success");
        setMessage("You’re subscribed to the Nigeria Local Brief.");
      } else {
        setStatus("error");
        setMessage("Could not complete subscription. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#0b2545] to-[#134074] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
      {/* Decorative accent */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-600/20 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center space-x-2 text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
        <Mail className="w-4 h-4" />
        <span>The Nigeria Local Brief</span>
      </div>

      <h3 className="font-extrabold text-lg leading-tight mb-2">
        Nigeria’s local stories, in your inbox.
      </h3>

      <p className="text-xs text-blue-100 mb-4 leading-relaxed">
        Get useful, verified reporting from Delta State and communities across Nigeria. Choose a state for more relevant local updates, or follow the nationwide edition.
      </p>

      {status === "success" ? (
        <div className="bg-white/10 border border-white/20 rounded-xl p-3 flex items-center space-x-2 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{message}</span>
        </div>
      ) : (
        <form onSubmit={handleSubscribe} className="space-y-2.5">
          <input
            type="text"
            placeholder="Your Name (Optional)"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full text-xs bg-slate-900/60 border border-blue-400/30 rounded-lg px-3 py-2 text-white placeholder-blue-300/60 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <select
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            aria-label="Choose your preferred news coverage"
            className="w-full rounded-lg border border-blue-400/30 bg-slate-900/60 px-3 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="All Nigeria" className="text-slate-900">All Nigeria · National edition</option>
            {NIGERIAN_STATES.map((state) => <option key={state} value={state} className="text-slate-900">{state}</option>)}
          </select>
          <input
            type="email"
            placeholder="Enter your email address *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full text-xs bg-slate-900/60 border border-blue-400/30 rounded-lg px-3 py-2 text-white placeholder-blue-300/60 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          {status === "error" && (
            <p className="text-[11px] text-red-300">{message}</p>
          )}
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-md disabled:opacity-50"
          >
            <span>{status === "loading" ? "Subscribing..." : "Subscribe Free"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <p className="text-[10px] text-blue-200/80 text-center">
            Zero spam. Unsubscribe anytime with 1-click.
          </p>
        </form>
      )}
    </div>
  );
}
