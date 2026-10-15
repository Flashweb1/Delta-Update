"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import BreakingTickerBanner from "@/components/BreakingTicker";
import HeroSection from "@/components/HeroSection";
import ArticleCard from "@/components/ArticleCard";
import ArticleModal from "@/components/ArticleModal";
import SubmitTipModal from "@/components/SubmitTipModal";
import PollWidget from "@/components/PollWidget";
import NewsletterWidget from "@/components/NewsletterWidget";
import Footer from "@/components/Footer";
import { Radio, Send, Compass, ChevronRight, TrendingUp } from "lucide-react";
import type { Article, BreakingTicker } from "@/lib/view";
import { NEWS_DESKS, NIGERIA_REGION_FILTERS, matchesNewsDesk, matchesNewsRegion } from "@/lib/nigeria";
import { MOCK_ARTICLES, MOCK_TICKERS, MOCK_POLL } from "@/lib/mockNews";

const DEFAULT_CATEGORIES = [...NEWS_DESKS];

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>(MOCK_ARTICLES);
  const [tickers, setTickers] = useState<BreakingTicker[]>(MOCK_TICKERS);
  const [activeCategory, setActiveCategory] = useState("All Nigeria");
  const [selectedRegion, setSelectedRegion] = useState("All Nigeria");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadLiveData() {
      try {
        const [articlesRes, tickersRes] = await Promise.all([
          fetch("/api/articles", { cache: "no-store" }),
          fetch("/api/breaking", { cache: "no-store" }),
        ]);

        if (articlesRes.ok) {
          const data = (await articlesRes.json()) as Article[];
          if (!cancelled && Array.isArray(data) && data.length > 0) {
            setArticles(data);
          }
        }

        if (tickersRes.ok) {
          const data = (await tickersRes.json()) as BreakingTicker[];
          if (!cancelled && Array.isArray(data) && data.length > 0) {
            setTickers(data);
          }
        }
      } catch {
        // Fall back to the bundled sample data when the API or database is unavailable.
      }
    }

    void loadLiveData();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLike = (id: string) => {
    setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, likes: a.likes + 1 } : a)));
    void fetch(`/api/articles/${id}/react`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "like" }),
    }).catch(() => undefined);
  };

  const filteredArticles = articles.filter((a) => {
    const matchesCat = matchesNewsDesk(activeCategory, a.category, a.lga, a.title, a.summary);
    const matchesRegion = matchesNewsRegion(selectedRegion, a.lga, a.title, a.summary);
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === "" ||
      a.title.toLowerCase().includes(query) ||
      a.summary.toLowerCase().includes(query) ||
      a.content.toLowerCase().includes(query) ||
      a.lga.toLowerCase().includes(query);
    return matchesCat && matchesRegion && matchesSearch;
  });

  const featuredArticle = articles.find((article) => article.isFeatured) || articles[0];
  const heroArticle =
    selectedRegion === "All Nigeria"
      ? featuredArticle
      : filteredArticles.find((article) => article.isFeatured) || filteredArticles[0];
  const secondaryArticles = filteredArticles.filter((article) => article.id !== heroArticle?.id).slice(0, 3);
  const showHero = activeCategory === "All Nigeria" && !searchQuery;
  const regularStreamArticles = filteredArticles.filter(
    (article) => !showHero || article.id !== heroArticle?.id,
  );
  const mostRead = [...articles].sort((a, b) => b.views - a.views).slice(0, 5);

  const hasActiveFilters =
    activeCategory !== "All Nigeria" || selectedRegion !== "All Nigeria" || searchQuery.trim() !== "";

  const clearFilters = () => {
    setActiveCategory("All Nigeria");
    setSelectedRegion("All Nigeria");
    setSearchQuery("");
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 font-sans">
      <Navbar
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        categories={DEFAULT_CATEGORIES}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenTipModal={() => setIsTipModalOpen(true)}
        breakingCount={tickers.length}
      />

      <BreakingTickerBanner
        tickers={tickers}
        onSelectArticleTitle={(title) => setSearchQuery(title.slice(0, 24))}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:py-8">
        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-brand-ink">Showing:</span>
              {activeCategory !== "All Nigeria" && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 font-bold text-red-700">
                  Desk: {activeCategory}
                </span>
              )}
              {selectedRegion !== "All Nigeria" && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 font-bold text-blue-800">
                  Location: {selectedRegion}
                </span>
              )}
              {searchQuery.trim() && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 font-bold text-amber-800">
                  Search: &ldquo;{searchQuery}&rdquo;
                </span>
              )}
              <span className="font-medium text-slate-500">
                ({filteredArticles.length} {filteredArticles.length === 1 ? "story" : "stories"})
              </span>
            </div>
            <button
              onClick={clearFilters}
              className="cursor-pointer text-xs font-bold text-red-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {showHero && (
          <HeroSection
            featuredArticle={heroArticle}
            secondaryArticles={secondaryArticles}
            onSelectArticle={setSelectedArticle}
            selectedRegion={selectedRegion}
            onSelectRegion={setSelectedRegion}
            regions={[...NIGERIA_REGION_FILTERS]}
          />
        )}

        <div className="mt-2 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Main feed */}
          <div className="space-y-6 lg:col-span-8">
            <div className="flex items-end justify-between border-b-2 border-brand-ink pb-2.5">
              <div className="flex items-center space-x-2.5">
                <span className="inline-block h-6 w-1 rounded-full bg-red-600" />
                <h2 className="font-serif text-lg font-bold tracking-tight text-brand-ink sm:text-xl">
                  {activeCategory === "All Nigeria" ? "Latest from across Nigeria" : activeCategory}
                </h2>
              </div>
              <span className="hidden text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:block">
                Verified local reporting
              </span>
            </div>

            {regularStreamArticles.length === 0 ? (
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-xs">
                <p className="text-sm font-bold text-slate-700">No stories match this selection.</p>
                <p className="text-xs text-slate-500">Try another news desk or location.</p>
                <button
                  onClick={clearFilters}
                  className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700"
                >
                  View all headlines
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {regularStreamArticles.slice(0, 2).map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    layout="horizontal"
                    onSelect={setSelectedArticle}
                    onLike={handleLike}
                  />
                ))}

                {regularStreamArticles.length > 2 && (
                  <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                    {regularStreamArticles.slice(2).map((article) => (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        layout="vertical"
                        onSelect={setSelectedArticle}
                        onLike={handleLike}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Multimedia & whistleblower band */}
            <div className="space-y-4 rounded-2xl bg-gradient-to-r from-brand-navy via-brand-navy-light to-brand-navy-dark p-6 text-white shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-wider text-red-400">
                  <Radio className="h-4 w-4 animate-pulse text-red-500" />
                  <span>Audio &amp; Multimedia Desk</span>
                </span>
                <span className="text-[11px] text-blue-200">National desk &middot; Asaba &amp; Warri hubs</span>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2 rounded-xl border border-blue-400/20 bg-slate-900/60 p-4">
                  <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase">
                    Listen
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    Take Nigeria&rsquo;s local stories with you.
                  </h4>
                  <p className="text-xs leading-relaxed text-blue-200">
                    Open any headline to hear the full report read aloud while you commute or work.
                  </p>
                </div>
                <div className="space-y-2 rounded-xl border border-blue-400/20 bg-slate-900/60 p-4">
                  <span className="rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase">
                    Whistleblower desk
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    Got an urgent community development to report?
                  </h4>
                  <p className="text-xs leading-relaxed text-blue-200">
                    Send verified story leads from any state or the FCT. Our editors review every submission.
                  </p>
                  <button
                    onClick={() => setIsTipModalOpen(true)}
                    className="inline-flex items-center space-x-1 pt-1 text-xs font-bold text-red-400 hover:text-red-300"
                  >
                    <span>Submit a scoop</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:col-span-4">
            <PollWidget poll={MOCK_POLL} />

            <NewsletterWidget demoMode />

            {/* Most read */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <div className="mb-4 flex items-center space-x-2 text-brand-ink">
                <TrendingUp className="h-4 w-4 text-red-600" />
                <h3 className="text-xs font-extrabold uppercase tracking-wide">Most read today</h3>
              </div>
              <ol className="space-y-3.5">
                {mostRead.map((article, index) => (
                  <li key={article.id}>
                    <button
                      onClick={() => setSelectedArticle(article)}
                      className="group flex w-full items-start gap-3 text-left"
                    >
                      <span className="mt-0.5 font-serif text-lg font-bold leading-none text-slate-300 transition group-hover:text-red-600">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 block text-xs font-bold leading-snug text-slate-800 transition group-hover:text-brand-red">
                          {article.title}
                        </span>
                        <span className="mt-1 block text-[10px] text-slate-400">
                          {article.category} &middot; {article.views.toLocaleString()} reads
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>

            {/* Regional desk */}
            <div className="space-y-3 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <div className="flex items-center space-x-2 text-brand-ink">
                <Compass className="h-4 w-4 text-blue-600" />
                <h3 className="text-xs font-extrabold uppercase tracking-wide">Niger Delta regional desk</h3>
              </div>
              <div className="space-y-2.5 text-xs">
                {[
                  { label: "Warri Seaport Terminal", value: "Operational · High flow", tone: "text-emerald-600" },
                  { label: "Escravos Crude Offtake", value: "1.45M bbls/day", tone: "text-blue-600" },
                  { label: "Asaba Cargo Terminal", value: "Export ready", tone: "text-purple-700" },
                  { label: "Delta Grid Supply", value: "320MW average", tone: "text-amber-600" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2.5"
                  >
                    <span className="font-semibold text-slate-700">{item.label}</span>
                    <span className={`font-bold ${item.tone}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tip CTA */}
            <div className="space-y-2 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 p-5 text-center text-white shadow-md">
              <Send className="mx-auto h-6 w-6 text-yellow-300" />
              <h4 className="text-sm font-extrabold">Be a community reporter</h4>
              <p className="text-xs leading-relaxed text-red-100">
                Break the news first. Send pictures, audio notes and eyewitness accounts from your town.
              </p>
              <button
                onClick={() => setIsTipModalOpen(true)}
                className="mt-2 w-full cursor-pointer rounded-lg bg-white py-2 text-xs font-bold text-red-700 shadow-xs transition hover:bg-red-50"
              >
                Send news scoop
              </button>
            </div>
          </aside>
        </div>
      </main>

      <ArticleModal
        key={selectedArticle?.id ?? "none"}
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onLike={handleLike}
      />
      <SubmitTipModal isOpen={isTipModalOpen} onClose={() => setIsTipModalOpen(false)} />
      <Footer onOpenTipModal={() => setIsTipModalOpen(true)} />
    </div>
  );
}
