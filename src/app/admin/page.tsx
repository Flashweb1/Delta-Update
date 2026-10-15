"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpRight,
  BarChart3,
  Bell,
  Check,
  ChevronRight,
  Clock3,
  Database,
  ExternalLink,
  FileText,
  Flame,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import type { Article, BreakingTicker, Category, Comment, NewsTip, Subscriber } from "@/lib/view";
import { NEWS_DESKS, NIGERIAN_STATES } from "@/lib/nigeria";

type AdminTab = "overview" | "articles" | "breaking" | "tips" | "comments" | "subscribers" | "database";

type ArticleForm = {
  title: string;
  summary: string;
  content: string;
  category: string;
  lga: string;
  authorName: string;
  authorRole: string;
  imageUrl: string;
  isBreaking: boolean;
  isFeatured: boolean;
  readTime: string;
  status: string;
};

type DashboardStats = {
  totalArticles: number;
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  totalComments: number;
  totalSubscribers: number;
  totalTips: number;
  totalTickers: number;
  databaseStatus: string;
};

const NAV_GROUPS: { label: string; items: { id: AdminTab; label: string; icon: LucideIcon }[] }[] = [
  {
    label: "Workspace",
    items: [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "articles", label: "Stories", icon: FileText },
    ],
  },
  {
    label: "Publishing",
    items: [
      { id: "breaking", label: "Breaking desk", icon: Flame },
      { id: "tips", label: "Reader tips", icon: Send },
      { id: "comments", label: "Comments", icon: MessageSquare },
    ],
  },
  {
    label: "Audience",
    items: [{ id: "subscribers", label: "Subscribers", icon: Users }],
  },
  {
    label: "System",
    items: [{ id: "database", label: "Database", icon: Database }],
  },
];

const DEFAULT_CATEGORIES = Array.from(new Set([
  ...NEWS_DESKS.filter((desk) => desk !== "All Nigeria"),
  "Delta Politics",
  "Warri & Asaba Metro",
  "Oil & Energy",
  "Security & Maritime",
  "Culture & Entertainment",
]));

const IMAGE_PRESETS = [
  { label: "Asaba riverfront", url: "/images/delta-updates-hero.jpg" },
  { label: "Newsroom", url: "/images/delta-newsroom.jpg" },
  { label: "Energy", url: "https://images.pexels.com/photos/10396415/pexels-photo-10396415.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
  { label: "Infrastructure", url: "https://images.pexels.com/photos/38513265/pexels-photo-38513265.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
  { label: "Press conference", url: "https://images.pexels.com/photos/15920138/pexels-photo-15920138.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
  { label: "Community", url: "https://images.pexels.com/photos/5632274/pexels-photo-5632274.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
];

const EMPTY_STATS: DashboardStats = {
  totalArticles: 0,
  totalViews: 0,
  totalLikes: 0,
  totalShares: 0,
  totalComments: 0,
  totalSubscribers: 0,
  totalTips: 0,
  totalTickers: 0,
  databaseStatus: "Checking connection",
};

const EMPTY_FORM: ArticleForm = {
  title: "",
  summary: "",
  content: "",
  category: "Cities & Communities",
  lga: "Nationwide",
  authorName: "Delta Updates Desk",
  authorRole: "Correspondent",
  imageUrl: "/images/delta-updates-hero.jpg",
  isBreaking: false,
  isFeatured: false,
  readTime: "3 min read",
  status: "published",
};

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-NG", { notation: value > 9999 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}

function getTabTitle(tab: AdminTab) {
  return {
    overview: "Overview",
    articles: "Story manager",
    breaking: "Breaking news desk",
    tips: "Reader tips",
    comments: "Comment moderation",
    subscribers: "Newsletter audience",
    database: "Database & setup",
  }[tab];
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tickers, setTickers] = useState<BreakingTicker[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [tips, setTips] = useState<NewsTip[]>([]);
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All desks");
  const [statusFilter, setStatusFilter] = useState("All stories");

  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [articleForm, setArticleForm] = useState<ArticleForm>(EMPTY_FORM);
  const [tickerText, setTickerText] = useState("");
  const [tickerPriority, setTickerPriority] = useState(1);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(""), 3200);
  };

  const loadAllData = async (quiet = false) => {
    if (quiet) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [articleResponse, categoryResponse, tickerResponse, commentResponse, subscriberResponse, tipResponse, statsResponse] = await Promise.all([
        fetch("/api/articles?limit=100&includeDrafts=true"),
        fetch("/api/categories"),
        fetch("/api/breaking"),
        fetch("/api/comments"),
        fetch("/api/subscribers"),
        fetch("/api/tips"),
        fetch("/api/stats"),
      ]);

      if (articleResponse.ok) setArticles(await articleResponse.json());
      if (categoryResponse.ok) setCategories(await categoryResponse.json());
      if (tickerResponse.ok) setTickers(await tickerResponse.json());
      if (commentResponse.ok) setComments(await commentResponse.json());
      if (subscriberResponse.ok) setSubscribers(await subscriberResponse.json());
      if (tipResponse.ok) setTips(await tipResponse.json());
      if (statsResponse.ok) setStats(await statsResponse.json());
    } catch (error) {
      console.error("Dashboard data could not be loaded", error);
      showToast("Could not load newsroom data. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void (async () => {
      await Promise.resolve();
      await loadAllData();
    })();
  }, []);

  const openCreateModal = () => {
    setEditingArticle(null);
    setArticleForm({ ...EMPTY_FORM });
    setArticleModalOpen(true);
  };

  const openEditModal = (article: Article) => {
    setEditingArticle(article);
    setArticleForm({
      title: article.title,
      summary: article.summary,
      content: article.content,
      category: article.category,
      lga: article.lga,
      authorName: article.authorName,
      authorRole: article.authorRole,
      imageUrl: article.imageUrl,
      isBreaking: article.isBreaking,
      isFeatured: article.isFeatured,
      readTime: article.readTime,
      status: article.status,
    });
    setArticleModalOpen(true);
  };

  const handleSaveArticle = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const endpoint = editingArticle ? `/api/articles/${editingArticle.id}` : "/api/articles";
    try {
      const response = await fetch(endpoint, {
        method: editingArticle ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(articleForm),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        showToast(result?.error || "Unable to save this story.");
        return;
      }
      setArticleModalOpen(false);
      showToast(editingArticle ? "Story changes saved." : "Story published successfully.");
      await loadAllData(true);
    } catch (error) {
      console.error("Unable to save story", error);
      showToast("Unable to save this story. Check your connection.");
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm("Delete this story permanently? This action cannot be undone.")) return;
    try {
      const response = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      showToast("Story deleted.");
      await loadAllData(true);
    } catch {
      showToast("Unable to delete this story.");
    }
  };

  const updateArticleFlag = async (article: Article, flag: "isBreaking" | "isFeatured") => {
    try {
      const response = await fetch(`/api/articles/${article.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...article, [flag]: !article[flag] }),
      });
      if (!response.ok) throw new Error("Update failed");
      showToast(flag === "isBreaking"
        ? article.isBreaking ? "Removed from breaking desk." : "Story is now marked breaking."
        : article.isFeatured ? "Removed from lead story." : "Story is now the lead feature.");
      await loadAllData(true);
    } catch {
      showToast("Unable to update the story.");
    }
  };

  const handleSeedDatabase = async () => {
    if (!window.confirm("Seed sample newsroom stories if the database is empty?")) return;
    try {
      const response = await fetch("/api/seed", { method: "POST" });
      const result = await response.json();
      showToast(result.message || "Sample data checked.");
      await loadAllData(true);
    } catch {
      showToast("Unable to seed the database.");
    }
  };

  const handleAddTicker = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tickerText.trim()) return;
    try {
      const response = await fetch("/api/breaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: tickerText.trim(), priority: tickerPriority, isActive: true }),
      });
      if (!response.ok) throw new Error("Ticker could not be published");
      setTickerText("");
      showToast("Breaking alert published to the site.");
      await loadAllData(true);
    } catch {
      showToast("Unable to publish the alert.");
    }
  };

  const handleDeleteTicker = async (id: string) => {
    try {
      const response = await fetch(`/api/breaking?id=${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      showToast("Breaking alert removed.");
      await loadAllData(true);
    } catch {
      showToast("Unable to remove the alert.");
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!window.confirm("Remove this comment from the discussion?")) return;
    try {
      const response = await fetch(`/api/comments?id=${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      showToast("Comment removed.");
      await loadAllData(true);
    } catch {
      showToast("Unable to remove the comment.");
    }
  };

  const handleDraftFromTip = (tip: NewsTip) => {
    setEditingArticle(null);
    setArticleForm({
      ...EMPTY_FORM,
      category: DEFAULT_CATEGORIES[0],
      lga: tip.location,
      title: tip.headline,
      summary: tip.description.slice(0, 240),
      content: `${tip.description}\n\nReported from: ${tip.location}`,
    });
    setArticleModalOpen(true);
  };

  const handleExportSubscribers = () => {
    const csv = [
      "Email,Status,Date subscribed",
      ...subscribers.map((subscriber) =>
        [subscriber.email, subscriber.status || "active", subscriber.createdAt]
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      ),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "delta-updates-subscribers.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const filteredArticles = useMemo(() => articles.filter((article) => {
    const matchesCategory = categoryFilter === "All desks" || article.category === categoryFilter;
    const matchesStatus = statusFilter === "All stories" || article.status.toLowerCase() === statusFilter.toLowerCase();
    const query = searchFilter.trim().toLowerCase();
    const matchesQuery = !query || [article.title, article.summary, article.lga, article.authorName]
      .some((text) => text.toLowerCase().includes(query));
    return matchesCategory && matchesStatus && matchesQuery;
  }), [articles, categoryFilter, searchFilter, statusFilter]);

  const totalEngagement = stats.totalLikes + stats.totalShares;
  const currentTitle = getTabTitle(activeTab);
  const categoryCounts = categories.map((category) => ({
    name: category.name,
    count: articles.filter((article) => article.category === category.name).length,
  })).filter((category) => category.count > 0).sort((a, b) => b.count - a.count).slice(0, 5);

  const changeTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-slate-900">
      {toastMessage && (
        <div role="status" className="fixed right-4 top-4 z-[70] flex max-w-sm items-center gap-2 rounded-xl bg-[#102b49] px-4 py-3 text-sm font-semibold text-white shadow-xl ring-1 ring-white/10">
          <Check className="h-4 w-4 shrink-0 text-emerald-300" />
          {toastMessage}
        </div>
      )}

      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      {/* Fixed, grouped newsroom navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[258px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[76px] items-center justify-between border-b border-slate-100 px-5">
          <Link href="/admin" className="flex items-center gap-3" aria-label="Delta Updates newsroom home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ba202c] text-sm font-black tracking-[-0.08em] text-white">DU</span>
            <span>
              <span className="block font-serif text-[17px] font-bold leading-5 tracking-tight text-[#102b49]">Delta Updates</span>
              <span className="mt-0.5 block text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">Newsroom workspace</span>
            </span>
          </Link>
          <button type="button" onClick={() => setMobileNavOpen(false)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Close navigation">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-4 pt-4">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-100 text-[10px] font-black text-blue-900">DU</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11px] font-bold text-slate-800">Editorial desk</span>
              <span className="block text-[10px] text-slate-500">Nigeria · 36 states + FCT</span>
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        <nav aria-label="Newsroom navigation" className="no-scrollbar flex-1 space-y-6 overflow-y-auto px-3 py-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate-400">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const badgeCount = item.id === "tips" ? tips.length : item.id === "comments" ? comments.length : item.id === "breaking" ? tickers.length : 0;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => changeTab(item.id)}
                      aria-current={isActive ? "page" : undefined}
                      className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[12px] font-semibold transition ${
                        isActive ? "bg-[#102b49] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-[#102b49]"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400 group-hover:text-[#102b49]"}`} />
                      <span className="flex-1">{item.label}</span>
                      {badgeCount > 0 && (
                        <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"}`}>
                          {badgeCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[10px] font-semibold text-emerald-800">Database connection active</span>
          </div>
          <Link href="/" className="flex items-center justify-between rounded-lg px-3 py-2 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-[#102b49]">
            <span>View public website</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </aside>

      {/* Main workspace */}
      <div className="min-h-screen lg:pl-[258px]">
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setMobileNavOpen(true)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden" aria-label="Open navigation">
              <Menu className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                <span className="hidden sm:inline">Newsroom</span>
                <ChevronRight className="hidden h-3 w-3 sm:block" />
                <span className="truncate text-slate-600">{currentTitle}</span>
              </div>
              <h1 className="mt-0.5 truncate text-sm font-bold tracking-tight text-[#102b49] sm:text-base">{currentTitle}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => void loadAllData(true)}
              disabled={isRefreshing}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <Link href="/" target="_blank" className="hidden h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 sm:inline-flex">
              Preview site <ExternalLink className="h-3 w-3" />
            </Link>
            <span className="hidden h-8 w-px bg-slate-200 sm:block" />
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#102b49] text-[10px] font-black text-white">DU</span>
            <div className="hidden leading-tight sm:block">
              <p className="text-[11px] font-bold text-slate-800">Newsroom</p>
              <p className="text-[9px] text-slate-500">Editor workspace</p>
            </div>
            <button
              type="button"
              onClick={() => {
                void fetch("/api/auth/logout", { method: "POST" }).finally(() => {
                  window.location.href = "/login";
                });
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#ba202c]">Delta Updates · Editorial</p>
              <h2 className="font-serif text-2xl font-bold tracking-tight text-[#102b49] sm:text-[30px]">{activeTab === "overview" ? "Good day, newsroom" : currentTitle}</h2>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                {activeTab === "overview" ? "Your publishing activity and audience at a glance." : "Manage your Delta Updates editorial workflow."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {activeTab === "overview" && (
                <button type="button" onClick={handleSeedDatabase} className="hidden h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 md:inline-flex">
                  <Database className="h-3.5 w-3.5" /> Sample data
                </button>
              )}
              {(activeTab === "overview" || activeTab === "articles" || activeTab === "tips") && (
                <button type="button" onClick={openCreateModal} className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#ba202c] px-3.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#a51925] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2">
                  <Plus className="h-4 w-4" />
                  <span>New story</span>
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex min-h-[340px] flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-slate-500">
              <RefreshCw className="h-7 w-7 animate-spin text-blue-700" />
              <p className="text-xs font-medium">Loading your newsroom workspace…</p>
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <section aria-label="Newsroom metrics" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                    {[
                      { label: "Published stories", value: formatNumber(stats.totalArticles || articles.length), note: `${articles.filter((article) => article.status === "draft").length} drafts in the desk`, icon: FileText, color: "text-blue-700", bg: "bg-blue-50" },
                      { label: "Total readership", value: formatNumber(stats.totalViews), note: "Article page views", icon: BarChart3, color: "text-emerald-700", bg: "bg-emerald-50" },
                      { label: "Reader engagement", value: formatNumber(totalEngagement), note: `${formatNumber(stats.totalLikes)} likes · ${formatNumber(stats.totalShares)} shares`, icon: Activity, color: "text-violet-700", bg: "bg-violet-50" },
                      { label: "Newsletter audience", value: formatNumber(stats.totalSubscribers || subscribers.length), note: "Morning Dispatch subscribers", icon: Users, color: "text-amber-700", bg: "bg-amber-50" },
                    ].map((metric) => {
                      const Icon = metric.icon;
                      return (
                        <article key={metric.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[11px] font-semibold text-slate-500">{metric.label}</p>
                              <p className="mt-2 text-[26px] font-bold leading-none tracking-tight text-[#102b49]">{metric.value}</p>
                            </div>
                            <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${metric.bg}`}><Icon className={`h-4 w-4 ${metric.color}`} /></span>
                          </div>
                          <p className="mt-3 truncate text-[10px] text-slate-500">{metric.note}</p>
                        </article>
                      );
                    })}
                  </section>

                  <section className="grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.85fr)]">
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <div>
                          <h3 className="text-sm font-bold text-[#102b49]">Recent stories</h3>
                          <p className="mt-0.5 text-[10px] text-slate-500">Latest updates from the editorial desk</p>
                        </div>
                        <button type="button" onClick={() => changeTab("articles")} className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 hover:text-blue-950">
                          All stories <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {articles.length === 0 ? (
                        <EmptyState title="No stories yet" message="Publish your first update to start the newsroom feed." action={<button type="button" onClick={openCreateModal} className="mt-3 rounded-lg bg-[#ba202c] px-3 py-2 text-xs font-bold text-white">Create a story</button>} />
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[650px] text-left text-xs">
                            <thead className="bg-slate-50/80 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">
                              <tr><th className="px-5 py-3">Headline</th><th className="px-3 py-3">Desk</th><th className="px-3 py-3">Status</th><th className="px-3 py-3 text-right">Views</th><th className="px-5 py-3 text-right">Published</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {articles.slice(0, 6).map((article) => (
                                <tr key={article.id} className="transition hover:bg-slate-50/70">
                                  <td className="max-w-[330px] px-5 py-3.5">
                                    <button type="button" onClick={() => openEditModal(article)} className="block truncate text-left font-semibold text-slate-800 hover:text-blue-800">{article.title}</button>
                                    <span className="mt-1 block text-[10px] text-slate-400">{article.authorName}</span>
                                  </td>
                                  <td className="px-3 py-3.5 text-slate-600">{article.category}</td>
                                  <td className="px-3 py-3.5"><StatusPill status={article.status} /></td>
                                  <td className="px-3 py-3.5 text-right tabular-nums text-slate-600">{formatNumber(article.views)}</td>
                                  <td className="px-5 py-3.5 text-right text-slate-500">{formatDate(article.publishedAt)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    <div className="space-y-5">
                      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-bold text-[#102b49]">Editorial queue</h3>
                            <p className="mt-0.5 text-[10px] text-slate-500">Items that may need attention</p>
                          </div>
                          <Bell className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="space-y-2">
                          <QueueRow label="Reader tips to review" count={tips.length} icon={Send} onClick={() => changeTab("tips")} />
                          <QueueRow label="Comments to moderate" count={comments.length} icon={MessageSquare} onClick={() => changeTab("comments")} />
                          <QueueRow label="Live breaking alerts" count={tickers.length} icon={Flame} onClick={() => changeTab("breaking")} />
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-bold text-[#102b49]">Coverage by desk</h3>
                            <p className="mt-0.5 text-[10px] text-slate-500">Published stories in each category</p>
                          </div>
                          <BarChart3 className="h-4 w-4 text-slate-400" />
                        </div>
                        {categoryCounts.length ? (
                          <div className="space-y-3">
                            {categoryCounts.map((item) => (
                              <div key={item.name}>
                                <div className="mb-1 flex items-center justify-between gap-2 text-[10px]">
                                  <span className="truncate font-medium text-slate-600">{item.name}</span>
                                  <span className="tabular-nums text-slate-500">{item.count}</span>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#214e78]" style={{ width: `${Math.max(7, (item.count / Math.max(1, articles.length)) * 100)}%` }} /></div>
                              </div>
                            ))}
                          </div>
                        ) : <p className="text-xs text-slate-500">Coverage breakdown appears after stories are published.</p>}
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === "articles" && (
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
                    <div>
                      <h3 className="text-sm font-bold text-[#102b49]">All stories <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{filteredArticles.length}</span></h3>
                      <p className="mt-1 text-[10px] text-slate-500">Create, review, and update published coverage.</p>
                    </div>
                    <button type="button" onClick={openCreateModal} className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#ba202c] px-3 text-xs font-bold text-white hover:bg-[#a51925]"><Plus className="h-4 w-4" /> New story</button>
                  </div>
                  <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/60 p-3 sm:flex-row sm:items-center sm:px-5">
                    <label className="relative flex-1 sm:max-w-sm">
                      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <input value={searchFilter} onChange={(event) => setSearchFilter(event.target.value)} placeholder="Search headlines, author, or LGA" className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                    </label>
                    <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-blue-400">
                      <option>All desks</option>{(categories.length ? categories.map((category) => category.name) : DEFAULT_CATEGORIES).map((name) => <option key={name}>{name}</option>)}
                    </select>
                    <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-blue-400">
                      <option>All stories</option><option>published</option><option>draft</option>
                    </select>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left text-xs">
                      <thead className="bg-white text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">
                        <tr><th className="px-5 py-3">Story</th><th className="px-3 py-3">Desk / location</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Placement</th><th className="px-3 py-3 text-right">Views</th><th className="px-5 py-3 text-right">Actions</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredArticles.map((article) => (
                          <tr key={article.id} className="group hover:bg-slate-50/70">
                            <td className="max-w-[370px] px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <Image src={article.imageUrl} alt="" width={56} height={44} className="h-11 w-14 shrink-0 rounded-md bg-slate-100 object-cover" />
                                <div className="min-w-0"><p className="line-clamp-2 font-semibold leading-4 text-slate-800">{article.title}</p><p className="mt-1 truncate text-[10px] text-slate-400">{article.authorName} · {formatDate(article.publishedAt)}</p></div>
                              </div>
                            </td>
                            <td className="px-3 py-3.5"><span className="block max-w-[150px] truncate font-medium text-slate-700">{article.category}</span><span className="mt-1 block max-w-[150px] truncate text-[10px] text-slate-400">{article.lga}</span></td>
                            <td className="px-3 py-3.5"><StatusPill status={article.status} /></td>
                            <td className="px-3 py-3.5"><div className="flex flex-wrap gap-1">{article.isBreaking && <span className="rounded bg-red-50 px-1.5 py-1 text-[9px] font-bold text-red-700">Breaking</span>}{article.isFeatured && <span className="rounded bg-blue-50 px-1.5 py-1 text-[9px] font-bold text-blue-800">Lead</span>}{!article.isBreaking && !article.isFeatured && <span className="text-[10px] text-slate-400">Standard</span>}</div></td>
                            <td className="px-3 py-3.5 text-right tabular-nums text-slate-600">{formatNumber(article.views)}</td>
                            <td className="px-5 py-3.5 text-right"><div className="inline-flex items-center gap-1">
                              <button type="button" onClick={() => void updateArticleFlag(article, "isBreaking")} title={article.isBreaking ? "Remove breaking label" : "Mark as breaking"} className={`rounded-md border px-2 py-1.5 text-[9px] font-bold transition ${article.isBreaking ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}><Flame className="mr-1 inline h-3 w-3" />{article.isBreaking ? "Live" : "Alert"}</button>
                              <button type="button" onClick={() => void updateArticleFlag(article, "isFeatured")} title={article.isFeatured ? "Remove lead story" : "Set as lead story"} className="rounded-md border border-slate-200 px-2 py-1.5 text-[9px] font-bold text-slate-500 transition hover:bg-slate-50">{article.isFeatured ? "Lead" : "Feature"}</button>
                              <button type="button" onClick={() => openEditModal(article)} className="rounded-md border border-slate-200 px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800">Edit</button>
                              <button type="button" onClick={() => void handleDeleteArticle(article.id)} aria-label={`Delete ${article.title}`} className="rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div></td>
                          </tr>
                        ))}
                        {filteredArticles.length === 0 && <tr><td colSpan={6}><EmptyState title="No matching stories" message="Try a different search or clear the selected filters." /></td></tr>}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {activeTab === "breaking" && (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
                  <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6">
                    <div className="mb-5 flex items-start gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#ba202c]"><Flame className="h-5 w-5" /></span>
                      <div><h3 className="text-sm font-bold text-[#102b49]">Publish a breaking alert</h3><p className="mt-1 text-[11px] text-slate-500">This message appears in the live ticker on the public site.</p></div>
                    </div>
                    <form onSubmit={handleAddTicker} className="space-y-4">
                      <label className="block"><span className="mb-1.5 block text-[11px] font-semibold text-slate-700">Alert text</span><textarea value={tickerText} onChange={(event) => setTickerText(event.target.value)} rows={4} required maxLength={300} placeholder="Write a concise, verified update for readers…" className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100" /><span className="mt-1 block text-right text-[10px] text-slate-400">{tickerText.length}/300</span></label>
                      <div className="flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 pt-4">
                        <label className="block"><span className="mb-1.5 block text-[11px] font-semibold text-slate-700">Priority</span><select value={tickerPriority} onChange={(event) => setTickerPriority(Number(event.target.value))} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs"><option value={1}>Standard</option><option value={2}>High priority</option><option value={3}>Urgent</option></select></label>
                        <button type="submit" className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#ba202c] px-4 text-xs font-bold text-white transition hover:bg-[#a51925]"><Send className="h-3.5 w-3.5" /> Publish alert</button>
                      </div>
                    </form>
                  </section>
                  <section className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h3 className="text-sm font-bold text-[#102b49]">Active alerts</h3><p className="mt-0.5 text-[10px] text-slate-500">Currently shown on the homepage</p></div><span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-700">{tickers.length} live</span></div>
                    <div className="divide-y divide-slate-100">
                      {tickers.map((ticker) => <div key={ticker.id} className="flex items-start gap-3 px-5 py-4"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" /><div className="min-w-0 flex-1"><p className="text-xs font-medium leading-5 text-slate-800">{ticker.text}</p><p className="mt-1 text-[10px] text-slate-400">Priority {ticker.priority} · {formatDate(ticker.createdAt)}</p></div><button type="button" onClick={() => void handleDeleteTicker(ticker.id)} aria-label="Remove alert" className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></div>)}
                      {tickers.length === 0 && <EmptyState title="No active alerts" message="Published breaking updates will appear here." />}
                    </div>
                  </section>
                </div>
              )}

              {activeTab === "tips" && (
                <section className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h3 className="text-sm font-bold text-[#102b49]">Community news tips</h3><p className="mt-1 text-[10px] text-slate-500">Review incoming reports before developing them into a story.</p></div><span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800">{tips.length} received</span></div>
                  {tips.length === 0 ? <EmptyState title="Your tip inbox is clear" message="New reader submissions will be listed here for editorial review." /> : <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">{tips.map((tip) => <article key={tip.id} className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:shadow-sm"><div className="mb-3 flex items-start justify-between gap-2"><span className="max-w-[75%] truncate rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-800">{tip.location}</span><time className="shrink-0 text-[10px] text-slate-400">{formatDate(tip.createdAt)}</time></div><h4 className="text-sm font-bold leading-5 text-slate-800">{tip.headline}</h4><p className="mt-2 line-clamp-4 text-xs leading-5 text-slate-600">{tip.description}</p><div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3"><span className="truncate text-[10px] text-slate-500">{tip.isAnonymous ? "Anonymous submission" : tip.reporterContact || "No contact supplied"}</span><button type="button" onClick={() => handleDraftFromTip(tip)} className="shrink-0 rounded-md bg-[#102b49] px-2.5 py-1.5 text-[10px] font-bold text-white transition hover:bg-blue-900">Draft story</button></div></article>)}</div>}
                </section>
              )}

              {activeTab === "comments" && (
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h3 className="text-sm font-bold text-[#102b49]">Reader discussion</h3><p className="mt-1 text-[10px] text-slate-500">Review reader responses published beneath stories.</p></div><span className="text-[10px] font-semibold text-slate-500">{comments.length} comments</span></div>
                  {comments.length === 0 ? <EmptyState title="No comments yet" message="Reader discussion will appear here when readers join the conversation." /> : <div className="divide-y divide-slate-100">{comments.map((comment) => <article key={comment.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-800">{comment.authorName.slice(0, 1).toUpperCase()}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-x-2 gap-y-1"><span className="text-xs font-bold text-slate-800">{comment.authorName}</span><span className="text-[10px] text-slate-400">{comment.authorLocation}</span><span className="text-[10px] text-slate-300">·</span><time className="text-[10px] text-slate-400">{formatDate(comment.createdAt)}</time></div><p className="mt-2 text-xs leading-5 text-slate-600">{comment.content}</p></div><button type="button" onClick={() => void handleDeleteComment(comment.id)} className="self-end rounded-md border border-slate-200 px-2.5 py-1.5 text-[10px] font-semibold text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-700 sm:self-start">Remove</button></article>)}</div>}
                </section>
              )}

              {activeTab === "subscribers" && (
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div><h3 className="text-sm font-bold text-[#102b49]">Morning Dispatch subscribers</h3><p className="mt-1 text-[10px] text-slate-500">Manage your reader newsletter audience.</p></div><button type="button" onClick={handleExportSubscribers} disabled={!subscribers.length} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"><ArrowDownToLine className="h-3.5 w-3.5" /> Export CSV</button></div>
                  {subscribers.length === 0 ? <EmptyState title="No subscribers yet" message="New newsletter signups will appear here." /> : <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-xs"><thead className="bg-slate-50 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500"><tr><th className="px-5 py-3">Reader</th><th className="px-3 py-3">Email address</th><th className="px-3 py-3">Coverage area</th><th className="px-5 py-3 text-right">Subscribed</th></tr></thead><tbody className="divide-y divide-slate-100">{subscribers.map((subscriber) => <tr key={subscriber.id} className="hover:bg-slate-50/70"><td className="px-5 py-3.5 font-semibold text-slate-700">{subscriber.fullName || "Reader"}</td><td className="px-3 py-3.5 text-slate-600">{subscriber.email}</td><td className="px-3 py-3.5 text-slate-500">{subscriber.lga || "All Nigeria"}</td><td className="px-5 py-3.5 text-right text-slate-500">{formatDate(subscriber.createdAt)}</td></tr>)}</tbody></table></div>}
                </section>
              )}

              {activeTab === "database" && (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
                  <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6">
                    <div className="mb-5 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Database className="h-5 w-5" /></span><div><h3 className="text-sm font-bold text-[#102b49]">PostgreSQL connection</h3><p className="mt-1 text-[10px] text-slate-500">Supabase-compatible storage through Drizzle ORM</p></div></div>
                    <div className="mb-5 flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3"><div><p className="text-xs font-bold text-emerald-900">{stats.databaseStatus}</p><p className="mt-0.5 text-[10px] text-emerald-700">Connection checked through the newsroom API.</p></div><span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" /></div>
                    <h4 className="mb-2 text-[11px] font-bold text-slate-700">Connect a Supabase project</h4>
                    <ol className="space-y-3 text-xs leading-5 text-slate-600">
                      <li className="flex gap-2"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-700">1</span><span>Create a project in Supabase, then copy its PostgreSQL connection URI from <strong>Project Settings → Database</strong>.</span></li>
                      <li className="flex gap-2"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-700">2</span><span>Set the URI as <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-blue-800">DATABASE_URL</code> in your deployment environment. Keep credentials server-side.</span></li>
                      <li className="flex gap-2"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-700">3</span><span>Apply the schema using Drizzle Kit:</span></li>
                    </ol>
                    <pre className="mt-2 overflow-x-auto rounded-lg bg-[#10243a] p-3 text-[11px] leading-5 text-emerald-300">npx drizzle-kit push</pre>
                    <p className="mt-3 text-[10px] leading-4 text-slate-500">For production, use separate credentials, enable database backups, and restrict administrator access before launch.</p>
                  </section>
                  <section className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                    <div className="border-b border-slate-100 px-5 py-4"><h3 className="text-sm font-bold text-[#102b49]">Connected data</h3><p className="mt-1 text-[10px] text-slate-500">Records currently visible to the newsroom.</p></div>
                    <div className="divide-y divide-slate-100">
                      {[
                        { name: "Articles", count: articles.length, icon: FileText },
                        { name: "Categories", count: categories.length, icon: LayoutDashboard },
                        { name: "Breaking alerts", count: tickers.length, icon: Flame },
                        { name: "Reader comments", count: comments.length, icon: MessageSquare },
                        { name: "Newsletter subscribers", count: subscribers.length, icon: Users },
                        { name: "Community tips", count: tips.length, icon: Send },
                      ].map((row) => { const Icon = row.icon; return <div key={row.name} className="flex items-center justify-between px-5 py-3"><span className="flex items-center gap-2.5 text-xs font-medium text-slate-600"><Icon className="h-3.5 w-3.5 text-slate-400" />{row.name}</span><span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold tabular-nums text-slate-600">{row.count}</span></div>; })}
                    </div>
                    <div className="border-t border-slate-100 p-4"><button type="button" onClick={handleSeedDatabase} className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"><Database className="h-3.5 w-3.5" /> Check / seed sample data</button></div>
                  </section>
                </div>
              )}
            </>
          )}

          <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4 text-[10px] text-slate-400">
            <span>Delta Updates Editorial Workspace</span>
            <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> PostgreSQL · Drizzle ORM</span>
          </footer>
        </main>
      </div>

      {articleModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-[2px] sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) setArticleModalOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="article-dialog-title" className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><div><p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#ba202c]">Editorial publishing</p><h2 id="article-dialog-title" className="mt-1 text-sm font-bold text-[#102b49]">{editingArticle ? "Edit story" : "Create a story"}</h2></div><button type="button" onClick={() => setArticleModalOpen(false)} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Close editor"><X className="h-4 w-4" /></button></div>
            <form onSubmit={handleSaveArticle} className="no-scrollbar flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
              <label className="block"><span className="mb-1.5 block text-[11px] font-semibold text-slate-700">Headline <span className="text-red-600">*</span></span><input value={articleForm.title} onChange={(event) => setArticleForm({ ...articleForm, title: event.target.value })} required maxLength={240} placeholder="Write a clear, accurate headline" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" /></label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block"><span className="mb-1.5 block text-[11px] font-semibold text-slate-700">News desk</span><select value={articleForm.category} onChange={(event) => setArticleForm({ ...articleForm, category: event.target.value })} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-400">{Array.from(new Set([...DEFAULT_CATEGORIES, ...categories.map((category) => category.name)])).map((name) => <option key={name} value={name}>{name}</option>)}</select></label>
                <label className="block"><span className="mb-1.5 block text-[11px] font-semibold text-slate-700">Coverage location <span className="font-normal text-slate-400">(state, city / LGA)</span></span><input list="nigerian-state-suggestions" value={articleForm.lga} onChange={(event) => setArticleForm({ ...articleForm, lga: event.target.value })} placeholder="e.g. Lagos State · Ikeja, or Delta State · Warri" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" /><datalist id="nigerian-state-suggestions">{NIGERIAN_STATES.map((state) => <option key={state} value={`${state} · `} />)}<option value="Nationwide" /></datalist><span className="mt-1 block text-[10px] text-slate-400">Add the state and local area so readers can filter by location.</span></label>
              </div>
              <div className="grid gap-3 sm:grid-cols-3"><label className="block"><span className="mb-1.5 block text-[11px] font-semibold text-slate-700">Author</span><input value={articleForm.authorName} onChange={(event) => setArticleForm({ ...articleForm, authorName: event.target.value })} className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-blue-400" /></label><label className="block"><span className="mb-1.5 block text-[11px] font-semibold text-slate-700">Role / byline</span><input value={articleForm.authorRole} onChange={(event) => setArticleForm({ ...articleForm, authorRole: event.target.value })} className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-blue-400" /></label><label className="block"><span className="mb-1.5 block text-[11px] font-semibold text-slate-700">Read time</span><input value={articleForm.readTime} onChange={(event) => setArticleForm({ ...articleForm, readTime: event.target.value })} className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-blue-400" /></label></div>
              <label className="block"><span className="mb-1.5 block text-[11px] font-semibold text-slate-700">Standfirst / summary <span className="text-red-600">*</span></span><textarea value={articleForm.summary} onChange={(event) => setArticleForm({ ...articleForm, summary: event.target.value })} required rows={2} placeholder="A concise introduction that gives readers the key context" className="w-full resize-y rounded-lg border border-slate-200 p-3 text-xs leading-5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" /></label>
              <label className="block"><span className="mb-1.5 block text-[11px] font-semibold text-slate-700">Article body <span className="text-red-600">*</span></span><textarea value={articleForm.content} onChange={(event) => setArticleForm({ ...articleForm, content: event.target.value })} required rows={8} placeholder="Write the full story. Use a blank line between paragraphs." className="w-full resize-y rounded-lg border border-slate-200 p-3 text-xs leading-5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" /></label>
              <div><label className="mb-1.5 block text-[11px] font-semibold text-slate-700">Lead image URL</label><input value={articleForm.imageUrl} onChange={(event) => setArticleForm({ ...articleForm, imageUrl: event.target.value })} className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-blue-400" /><div className="mt-2 flex flex-wrap gap-1.5">{IMAGE_PRESETS.map((preset) => <button key={preset.label} type="button" onClick={() => setArticleForm({ ...articleForm, imageUrl: preset.url })} className={`rounded-md border px-2 py-1.5 text-[9px] font-semibold transition ${articleForm.imageUrl === preset.url ? "border-blue-300 bg-blue-50 text-blue-800" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>{preset.label}</button>)}</div></div>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3"><div className="flex flex-wrap gap-x-5 gap-y-2"><label className="inline-flex items-center gap-2 text-[11px] font-semibold text-slate-700"><input type="checkbox" checked={articleForm.isBreaking} onChange={(event) => setArticleForm({ ...articleForm, isBreaking: event.target.checked })} className="h-3.5 w-3.5 rounded border-slate-300 accent-[#ba202c]" /> Breaking alert</label><label className="inline-flex items-center gap-2 text-[11px] font-semibold text-slate-700"><input type="checkbox" checked={articleForm.isFeatured} onChange={(event) => setArticleForm({ ...articleForm, isFeatured: event.target.checked })} className="h-3.5 w-3.5 rounded border-slate-300 accent-blue-800" /> Lead story</label></div><label className="inline-flex items-center gap-2 text-[11px] font-semibold text-slate-700">Status<select value={articleForm.status} onChange={(event) => setArticleForm({ ...articleForm, status: event.target.value })} className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[10px]"><option value="published">Published</option><option value="draft">Draft</option></select></label></div>
              <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-100 bg-white pt-4"><button type="button" onClick={() => setArticleModalOpen(false)} className="h-9 rounded-lg border border-slate-200 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button><button type="submit" className="h-9 rounded-lg bg-[#ba202c] px-4 text-xs font-bold text-white transition hover:bg-[#a51925]">{editingArticle ? "Save changes" : articleForm.status === "draft" ? "Save draft" : "Publish story"}</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const isPublished = status.toLowerCase() === "published";
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[9px] font-bold capitalize ${isPublished ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}><span className={`h-1.5 w-1.5 rounded-full ${isPublished ? "bg-emerald-500" : "bg-amber-500"}`} />{status}</span>;
}

function QueueRow({ label, count, icon: Icon, onClick }: { label: string; count: number; icon: LucideIcon; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-lg border border-slate-100 px-3 py-2.5 text-left transition hover:border-slate-200 hover:bg-slate-50"><Icon className="h-4 w-4 text-slate-400" /><span className="flex-1 text-[11px] font-medium text-slate-600">{label}</span><span className="min-w-6 rounded-full bg-slate-100 px-1.5 py-1 text-center text-[10px] font-bold tabular-nums text-slate-600">{count}</span><ChevronRight className="h-3 w-3 text-slate-400" /></button>;
}

function EmptyState({ title, message, action }: { title: string; message: string; action?: React.ReactNode }) {
  return <div className="flex min-h-[170px] flex-col items-center justify-center px-5 py-9 text-center"><span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100"><FileText className="h-4 w-4 text-slate-400" /></span><p className="text-xs font-bold text-slate-700">{title}</p><p className="mt-1 max-w-sm text-[11px] leading-5 text-slate-500">{message}</p>{action}</div>;
}
