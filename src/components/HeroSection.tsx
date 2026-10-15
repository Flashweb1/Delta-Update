"use client";

import React from "react";
import Image from "next/image";
import { Eye, Clock, Flame, MapPin, ChevronRight, Sparkles, Heart } from "lucide-react";
import type { Article } from "@/lib/view";

interface HeroSectionProps {
  featuredArticle?: Article;
  secondaryArticles: Article[];
  onSelectArticle: (article: Article) => void;
  selectedRegion: string;
  onSelectRegion: (region: string) => void;
  regions: string[];
}

export default function HeroSection({
  featuredArticle,
  secondaryArticles,
  onSelectArticle,
  selectedRegion,
  onSelectRegion,
  regions,
}: HeroSectionProps) {
  return (
    <section className="mb-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs sm:px-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
            <MapPin className="h-4 w-4" />
          </span>
          <div>
            <label htmlFor="coverage-region" className="block text-xs font-bold text-[#0b2545]">Browse by location</label>
            <p className="mt-0.5 text-[10px] text-slate-500">Local stories from every part of Nigeria</p>
          </div>
        </div>
        <select
          id="coverage-region"
          value={selectedRegion}
          onChange={(event) => onSelectRegion(event.target.value)}
          className="h-9 min-w-[190px] rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        >
          {regions.map((region) => <option key={region} value={region}>{region}</option>)}
        </select>
      </div>

      {!featuredArticle ? (
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-8 text-center shadow-xs">
          <p className="text-sm font-bold text-[#0b2545]">No featured story from {selectedRegion} yet.</p>
          <p className="mt-1 text-xs text-slate-500">Choose another location or browse all Nigeria while our local coverage grows.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <button
            type="button"
            onClick={() => onSelectArticle(featuredArticle)}
            className="group relative flex min-h-[420px] cursor-pointer flex-col justify-end overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 text-left shadow-lg sm:min-h-[470px] lg:col-span-8"
          >
            <Image
              src={featuredArticle.imageUrl}
              alt={featuredArticle.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07172c] via-[#07172c]/75 to-transparent" />
            <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2 sm:left-6 sm:top-6">
              <span className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white shadow-md">
                <Flame className="h-3.5 w-3.5" /> Lead story
              </span>
              <span className="rounded-md border border-blue-300/30 bg-blue-950/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                {featuredArticle.category}
              </span>
            </div>

            <div className="relative z-10 space-y-3 p-5 text-white sm:p-8">
              <div className="flex flex-wrap items-center gap-3 text-xs text-blue-200">
                <span className="flex items-center gap-1 font-bold text-red-300"><MapPin className="h-3.5 w-3.5" />{featuredArticle.lga}</span>
                <span aria-hidden="true">•</span>
                <span>{new Date(featuredArticle.publishedAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}</span>
                <span aria-hidden="true">•</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{featuredArticle.readTime}</span>
              </div>
              <h1 className="text-xl font-extrabold leading-tight text-white transition-colors group-hover:text-red-200 sm:text-3xl">
                {featuredArticle.title}
              </h1>
              <p className="line-clamp-2 max-w-3xl text-sm leading-relaxed text-slate-200 sm:line-clamp-3">{featuredArticle.summary}</p>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-700/60 pt-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-blue-700 text-xs font-bold uppercase text-white">{featuredArticle.authorName.charAt(0)}</span>
                  <span><span className="block font-semibold text-white">{featuredArticle.authorName}</span><span className="mt-0.5 block text-[10px] text-slate-400">{featuredArticle.authorRole}</span></span>
                </div>
                <span className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><Eye className="h-4 w-4 text-blue-300" />{featuredArticle.views} reads</span>
                  <span className="flex items-center gap-1 text-red-300"><Heart className="h-4 w-4" />{featuredArticle.likes}</span>
                  <span className="hidden items-center gap-1 font-bold text-amber-200 sm:inline-flex">Read story <ChevronRight className="h-3.5 w-3.5" /></span>
                </span>
              </div>
            </div>
          </button>

          <div className="flex flex-col justify-between space-y-4 lg:col-span-4">
            <div className="flex items-center justify-between rounded-xl bg-[#0b2545] px-4 py-3 text-white shadow-xs">
              <span className="flex items-center gap-2 text-sm font-bold tracking-wide"><Sparkles className="h-4 w-4 text-amber-300" />Trending in Nigeria</span>
              <span className="text-[10px] text-blue-200">Reader picks</span>
            </div>
            <div className="flex flex-1 flex-col gap-3">
              {secondaryArticles.slice(0, 3).map((article, index) => (
                <button
                  type="button"
                  key={article.id}
                  onClick={() => onSelectArticle(article)}
                  className="group flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-left shadow-xs transition hover:bg-slate-50 hover:shadow-md"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-50 text-sm font-extrabold text-red-700 transition group-hover:bg-red-600 group-hover:text-white">{index + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="mb-1 flex items-center gap-2 text-[10px] font-medium text-slate-500"><span className="font-bold text-red-700">{article.category}</span><span>·</span><span className="truncate">{article.lga}</span></span>
                    <span className="line-clamp-2 block text-xs font-bold leading-snug text-slate-900 transition-colors group-hover:text-[#0b2545] sm:text-sm">{article.title}</span>
                    <span className="mt-1.5 flex items-center gap-2 text-[10px] text-slate-400"><span>{article.readTime}</span><span>·</span><span className="flex items-center gap-1"><Eye className="h-3 w-3" />{article.views}</span></span>
                  </span>
                  <Image src={article.imageUrl} alt="" width={64} height={64} className="h-16 w-16 shrink-0 rounded-lg bg-slate-100 object-cover transition group-hover:scale-[1.02]" />
                </button>
              ))}
              {secondaryArticles.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center text-xs text-slate-500">More stories from this area are on the way.</p>}
            </div>
            <div className="rounded-xl bg-gradient-to-r from-red-700 to-red-600 p-3.5 text-white shadow-md">
              <p className="text-[10px] font-bold uppercase tracking-wider text-red-100">Our founding regional desk</p>
              <p className="mt-1 text-xs font-bold">Delta & Niger Delta reporting, with a national outlook.</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
