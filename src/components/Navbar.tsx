"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Clock3,
  Menu,
  Radio,
  Search,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";

interface NavbarProps {
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  categories: string[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenTipModal: () => void;
  breakingCount?: number;
}

export default function Navbar({
  activeCategory,
  onSelectCategory,
  categories,
  searchQuery,
  onSearchChange,
  onOpenTipModal,
  breakingCount = 0,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDate(
        new Intl.DateTimeFormat("en-NG", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "Africa/Lagos",
        }).format(now),
      );
      setCurrentDateTime(
        new Intl.DateTimeFormat("en-NG", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Africa/Lagos",
          timeZoneName: "short",
        }).format(now),
      );
    };

    updateTime();
    const interval = window.setInterval(updateTime, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const selectCategory = (category: string) => {
    onSelectCategory(category);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.06)]">
      {/* A deliberately quiet utility strip keeps context separate from the brand. */}
      <div className="bg-[#102b49] text-white">
        <div className="mx-auto flex min-h-8 max-w-7xl items-center justify-center gap-3 px-4 text-[10px] sm:justify-between sm:text-[11px]">
          <div className="hidden min-w-0 items-center gap-2.5 sm:flex">
            <span className="inline-flex shrink-0 items-center gap-1.5 font-bold uppercase tracking-[0.13em] text-blue-100">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              Nigeria · 36 States + FCT
            </span>
            <span className="hidden text-blue-200/50 sm:inline">/</span>
            <span className="hidden truncate text-blue-100/80 sm:inline">
              Independent local journalism
            </span>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 text-blue-100/90">
            <Clock3 className="h-3 w-3 text-red-300" aria-hidden="true" />
            <time className="sm:hidden">{currentDate || "West Africa Time · Nigeria"}</time>
            <time className="hidden sm:inline">{currentDateTime || "West Africa Time · Nigeria"}</time>
          </span>
        </div>
      </div>

      {/* Masthead */}
      <div className="border-b border-slate-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-[#102b49] transition hover:border-slate-300 hover:bg-slate-50 lg:hidden"
              aria-label={mobileMenuOpen ? "Close sections menu" : "Open sections menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            <Link href="/" className="group flex min-w-0 items-center" aria-label="Delta Updates home">
              <Image
                src="/delta-updates-wordmark.png"
                alt="Delta Updates"
                width={599}
                height={282}
                priority
                className="h-10 w-auto transition group-hover:opacity-90 sm:h-12"
              />
            </Link>
          </div>

          <div className="hidden flex-1 justify-center px-5 xl:flex">
            <div className="h-9 w-px bg-slate-200" />
            <p className="ml-5 max-w-[235px] text-xs leading-5 text-slate-500">
              Rooted in Delta. <span className="font-semibold text-slate-700">Open to every Nigerian community.</span>
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            <label className="relative hidden w-[220px] lg:block xl:w-[250px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search the latest news"
                aria-label="Search news"
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <button
              type="button"
              onClick={() => setMobileSearchOpen((open) => !open)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-[#102b49] transition hover:bg-slate-50 lg:hidden"
              aria-label="Toggle news search"
              aria-expanded={mobileSearchOpen}
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onOpenTipModal}
              className="hidden h-9 items-center gap-2 rounded-lg bg-[#ba202c] px-3.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#a51925] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 sm:inline-flex"
            >
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
              Send a tip
            </button>
            <Link
              href="/admin"
              className="hidden h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-[#102b49] transition hover:border-blue-200 hover:bg-blue-50 sm:inline-flex"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-blue-700" aria-hidden="true" />
              Newsroom
              <ArrowUpRight className="h-3 w-3 text-slate-400" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {mobileSearchOpen && (
          <div className="border-t border-slate-100 px-4 py-2.5 lg:hidden">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search Nigerian news, states, communities..."
                aria-label="Search news"
                autoFocus
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-800 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>
        )}
      </div>

      {/* Section navigation */}
      <nav aria-label="News sections" className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
          <div className="no-scrollbar flex min-w-0 items-center gap-0.5 overflow-x-auto py-1.5">
            {categories.map((category) => {
              const active = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => selectCategory(category)}
                  aria-current={active ? "page" : undefined}
                  className={`relative shrink-0 px-3 py-2 text-[11px] font-semibold transition-colors sm:text-xs ${
                    active ? "text-[#102b49]" : "text-slate-600 hover:text-[#102b49]"
                  }`}
                >
                  {category}
                  {active && <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-[#ba202c]" />}
                </button>
              );
            })}
          </div>
          <div className="hidden shrink-0 items-center gap-2 border-l border-slate-200 py-2 pl-4 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 xl:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
            </span>
            Live updates
            {breakingCount > 0 && <span className="rounded-full bg-red-50 px-1.5 py-0.5 text-red-700">{breakingCount}</span>}
          </div>
        </div>
      </nav>

      {/* Compact mobile actions are grouped together in one clear drawer. */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-slate-50 shadow-lg lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
              <Radio className="h-3.5 w-3.5 text-[#ba202c]" />
              Browse sections
            </div>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => selectCategory(category)}
                  className={`rounded-md px-3 py-2.5 text-left text-xs font-semibold transition ${
                    activeCategory === category
                      ? "bg-[#102b49] text-white"
                      : "bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-200 pt-3">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenTipModal();
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#ba202c] px-3 py-2.5 text-xs font-bold text-white"
              >
                <Send className="h-3.5 w-3.5" /> Send a news tip
              </button>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-[#102b49]"
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Newsroom CMS
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
