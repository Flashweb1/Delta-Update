"use client";

import React from "react";
import Image from "next/image";
import { Eye, Heart, Clock, MapPin } from "lucide-react";
import type { Article } from "@/lib/view";

interface ArticleCardProps {
  article: Article;
  onSelect: (article: Article) => void;
  onLike?: (id: string) => void;
  onShare?: (article: Article) => void;
  layout?: "vertical" | "horizontal" | "compact";
}

export default function ArticleCard({
  article,
  onSelect,
  onLike,
  layout = "vertical",
}: ArticleCardProps) {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (layout === "compact") {
    return (
      <div
        onClick={() => onSelect(article)}
        className="group flex items-start space-x-3 p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200/80 transition duration-300 shadow-2xs hover:shadow-md cursor-pointer premium-card-hover"
      >
        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 relative bg-slate-100 premium-img-zoom">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            sizes="80px"
            className="object-cover"
          />
          {article.isBreaking && (
            <span className="absolute top-1 left-1 bg-[#ba202c] text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
              Alert
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1.5 text-[10px] text-red-600 font-bold mb-1">
            <span className="uppercase tracking-wider">{article.category}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-normal">{article.readTime}</span>
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-[#102b49] group-hover:text-[#ba202c] line-clamp-2 leading-snug transition-colors duration-200">
            {article.title}
          </h4>
          <div className="flex items-center space-x-3 mt-1.5 text-[10px] text-slate-400 font-medium">
            <span>{formattedDate}</span>
            <span className="flex items-center space-x-0.5">
              <Eye className="w-3 h-3 text-slate-400" />
              <span>{article.views}</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (layout === "horizontal") {
    return (
      <div
        onClick={() => onSelect(article)}
        className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row cursor-pointer premium-card-hover"
      >
        <div className="sm:w-5/12 h-48 sm:h-auto relative overflow-hidden bg-slate-100 premium-img-zoom shrink-0">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            sizes="(max-width: 640px) 100vw, 40vw"
            className="object-cover"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 bg-[#102b49] text-white text-[10px] font-bold uppercase tracking-wider rounded shadow-md">
              {article.category}
            </span>
            {article.isBreaking && (
              <span className="px-2 py-1 bg-[#ba202c] text-white text-[9px] font-extrabold uppercase tracking-widest rounded shadow-md animate-pulse">
                Breaking
              </span>
            )}
          </div>
        </div>

        <div className="sm:w-7/12 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-[10px] sm:text-xs text-slate-500 mb-2">
              <span className="flex items-center space-x-1 font-semibold text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>{article.lga}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{article.readTime}</span>
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-serif font-bold text-[#102b49] group-hover:text-[#ba202c] leading-snug transition-colors duration-200">
              {article.title}
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed font-normal">
              {article.summary}
            </p>
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center space-x-2 min-w-0">
              <span className="font-bold text-slate-700 truncate">{article.authorName}</span>
              <span className="text-slate-300">•</span>
              <span className="shrink-0">{formattedDate}</span>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <span className="flex items-center space-x-1 text-slate-700 font-medium">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>{article.views}</span>
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLike && onLike(article.id);
                }}
                className="flex items-center space-x-1 text-slate-600 hover:text-red-600 transition"
                title="Like article"
              >
                <Heart className="w-3.5 h-3.5 text-red-500" />
                <span>{article.likes}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vertical (Standard Card)
  return (
    <div
      onClick={() => onSelect(article)}
      className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer premium-card-hover"
    >
      <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100 premium-img-zoom">
        <Image
          src={article.imageUrl}
          alt={article.title}
          fill
          sizes="(max-width: 640px) 100vw, 40vw"
          className="object-cover"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 bg-[#102b49] text-white text-[10px] font-bold uppercase tracking-wider rounded shadow-md">
            {article.category}
          </span>
          {article.isBreaking && (
            <span className="px-2 py-1 bg-[#ba202c] text-white text-[9px] font-extrabold uppercase tracking-widest rounded shadow-md animate-pulse">
              Breaking
            </span>
          )}
        </div>
        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[9px] rounded font-semibold flex items-center space-x-1">
          <Clock className="w-3 h-3 text-red-300" />
          <span>{article.readTime}</span>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-1 text-[10px] text-slate-500 font-semibold mb-2">
            <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="truncate">{article.lga}</span>
          </div>

          <h3 className="text-sm sm:text-base font-serif font-bold text-[#102b49] group-hover:text-[#ba202c] leading-snug transition-colors duration-200 line-clamp-2">
            {article.title}
          </h3>

          <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {article.summary}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="truncate max-w-[120px]">
            {formattedDate}
          </span>

          <div className="flex items-center space-x-3 shrink-0">
            <span className="flex items-center space-x-1 text-slate-700">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>{article.views}</span>
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike && onLike(article.id);
              }}
              className="flex items-center space-x-1 hover:text-red-600 transition"
              title="Like"
            >
              <Heart className="w-3.5 h-3.5 text-red-500" />
              <span>{article.likes}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
