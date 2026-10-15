"use client";

import { useEffect, useState } from "react";
import { Vote, CheckCircle2, BarChart2 } from "lucide-react";
import type { PollSnapshot } from "@/lib/mockNews";

interface PollWidgetProps {
  poll?: PollSnapshot;
}

export default function PollWidget({ poll: pollOverride }: PollWidgetProps) {
  const [poll, setPoll] = useState<PollSnapshot | null>(pollOverride ?? null);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (pollOverride) return;
    let active = true;

    (async () => {
      try {
        const res = await fetch("/api/poll");
        if (res.ok && active) {
          setPoll(await res.json());
        }
      } catch (e) {
        console.error("Failed to load poll", e);
      }
    })();

    return () => {
      active = false;
    };
  }, [pollOverride]);

  const handleVote = async () => {
    if (!selectedOption || !poll) return;

    if (pollOverride) {
      setPoll({
        ...poll,
        results: { ...poll.results, [selectedOption]: (poll.results[selectedOption] || 0) + 1 },
        totalVotes: poll.totalVotes + 1,
      });
      setHasVoted(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionSelected: selectedOption }),
      });

      if (res.ok) {
        setHasVoted(true);
        const refreshed = await fetch("/api/poll");
        if (refreshed.ok) setPoll(await refreshed.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!poll) return null;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
      <div className="mb-2 flex items-center space-x-2 text-xs font-extrabold uppercase tracking-wider text-red-600">
        <Vote className="h-4 w-4 text-red-600" />
        <span>Community Pulse &middot; Poll of the Week</span>
      </div>

      <h3 className="mb-4 font-serif text-sm font-bold leading-snug text-slate-900">
        {poll.question}
      </h3>

      {hasVoted ? (
        <div className="space-y-3">
          <p className="flex items-center space-x-1 text-[11px] font-bold text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Thank you. Your vote has been recorded.</span>
          </p>

          <div className="space-y-2.5">
            {poll.options.map((opt) => {
              const count = poll.results[opt] || 0;
              const percent = poll.totalVotes > 0 ? Math.round((count / poll.totalVotes) * 100) : 0;

              return (
                <div key={opt} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{opt}</span>
                    <span className="font-bold text-slate-900">{percent}% ({count})</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-[#0b2545] transition-all duration-700"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="pt-1 text-right text-[10px] text-slate-500">
            Total participants: {poll.totalVotes.toLocaleString()} votes
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            {poll.options.map((opt) => (
              <label
                key={opt}
                className={`flex cursor-pointer items-center space-x-2.5 rounded-lg border p-2.5 text-xs transition ${
                  selectedOption === opt
                    ? "border-red-500 bg-red-50/50 font-bold text-red-950"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="pollOption"
                  value={opt}
                  checked={selectedOption === opt}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="h-3.5 w-3.5 text-red-600 focus:ring-red-500"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>

          <button
            onClick={handleVote}
            disabled={!selectedOption || isSubmitting}
            className="flex w-full cursor-pointer items-center justify-center space-x-1.5 rounded-lg bg-red-600 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-red-700 disabled:opacity-50"
          >
            <BarChart2 className="h-3.5 w-3.5" />
            <span>{isSubmitting ? "Casting vote..." : "Submit Vote"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
