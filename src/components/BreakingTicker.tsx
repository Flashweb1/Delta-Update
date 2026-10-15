"use client";

import React, { useState } from "react";
import { Flame, Bell, ChevronRight, Pause, Play } from "lucide-react";
import type { BreakingTicker } from "@/lib/view";

interface BreakingTickerProps {
  tickers: BreakingTicker[];
  onSelectArticleTitle?: (text: string) => void;
}

export default function BreakingTickerBanner({
  tickers,
  onSelectArticleTitle,
}: BreakingTickerProps) {
  const [isPaused, setIsPaused] = useState(false);

  if (!tickers || tickers.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#b91c1c] text-white border-b border-red-800 shadow-sm overflow-hidden select-none">
      <div className="max-w-7xl mx-auto flex items-center">
        {/* Red Live Badge */}
        <div className="flex items-center space-x-1.5 bg-[#991b1b] px-3.5 py-2 font-black text-xs uppercase tracking-wider text-white shrink-0 z-10 shadow-md">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400"></span>
          </span>
          <Flame className="w-4 h-4 text-yellow-300 animate-pulse" />
          <span className="font-bold">Breaking News</span>
        </div>

        {/* Marquee Content */}
        <div 
          className="flex-1 overflow-hidden py-1.5 px-3 relative cursor-pointer"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className={`whitespace-nowrap inline-flex items-center space-x-8 text-xs font-medium text-white/95 ${
              isPaused ? "" : "animate-marquee"
            }`}
          >
            {/* Repeat tickers so loop is continuous */}
            {[...tickers, ...tickers].map((item, idx) => (
              <span
                key={`${item.id}-${idx}`}
                onClick={() => onSelectArticleTitle && onSelectArticleTitle(item.text)}
                className="inline-flex items-center space-x-2 hover:underline hover:text-yellow-200 transition"
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                <span>{item.text}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Play/Pause Control */}
        <div className="hidden sm:flex items-center px-3 py-1 text-red-200 shrink-0">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 rounded hover:bg-red-800/80 text-white/80 hover:text-white transition"
            title={isPaused ? "Resume scroll" : "Pause scroll"}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
