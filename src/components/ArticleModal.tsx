"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  X, 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  Share2, 
  Heart, 
  Eye, 
  Clock, 
  MapPin, 
  Send, 
  MessageSquare, 
  Check, 
  ZoomIn, 
  ZoomOut,
  Sparkles,
  ExternalLink
} from "lucide-react";
import type { Article, Comment } from "@/lib/view";

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
  onLike: (id: string) => void;
}

export default function ArticleModal({
  article,
  onClose,
  onLike,
}: ArticleModalProps) {
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentAuthor, setNewCommentAuthor] = useState("");
  const [newCommentEmail, setNewCommentEmail] = useState("");
  const [newCommentLocation, setNewCommentLocation] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [commentNotice, setCommentNotice] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(article?.likes ?? 0);

  useEffect(() => {
    if (!article) return;
    let active = true;

    (async () => {
      try {
        const res = await fetch(`/api/comments?articleId=${article.id}`);
        if (res.ok && active) {
          setComments(await res.json());
        }
      } catch (e) {
        console.error("Failed to load comments", e);
      }
    })();

    return () => {
      active = false;
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [article]);

  if (!article) return null;

  // Text-to-Speech logic
  const toggleSpeech = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      alert("Text-to-speech is not supported on this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const narrationText = `${article.title}. Reported by ${article.authorName} in ${article.lga}. ${article.summary}. ${article.content}`;
      const utterance = new SpeechSynthesisUtterance(narrationText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/#${article.slug}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`*${article.title}*\nRead on Delta Updates: ${window.location.origin}/#${article.slug}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`${article.title} via @DeltaUpdatesNG`);
    const url = encodeURIComponent(`${window.location.origin}/#${article.slug}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  const handleLikeClick = () => {
    if (!liked) {
      setLiked(true);
      setLikesCount((prev) => prev + 1);
      onLike(article.id);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentAuthor.trim() || !newCommentText.trim() || !newCommentEmail.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: article.id,
          authorName: newCommentAuthor,
          authorEmail: newCommentEmail,
          authorLocation: newCommentLocation || "Nigeria",
          content: newCommentText,
        }),
      });

      const added = await res.json().catch(() => null);

      if (res.ok && added) {
        if (added.status === "approved") {
          setComments((prev) => [added, ...prev]);
          setCommentNotice("");
        } else {
          setCommentNotice(
            "Thanks — your comment has been received and is awaiting moderation by the newsroom."
          );
        }
        setNewCommentText("");
        setNewCommentEmail("");
      } else {
        setCommentNotice(added?.error ?? "We could not post your comment. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setCommentNotice("We could not post your comment. Please try again.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const formattedDate = new Date(article.publishedAt).toLocaleDateString("en-NG", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const fontSizeClass = {
    sm: "text-sm leading-relaxed",
    base: "text-base leading-relaxed sm:text-lg sm:leading-8",
    lg: "text-lg leading-loose sm:text-xl sm:leading-9",
  }[fontSize];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="bg-[#0b2545] text-white px-4 sm:px-6 py-3 flex items-center justify-between border-b border-blue-900 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-red-400">
              Delta Updates Reader
            </span>
            <span className="text-blue-300">•</span>
            <span className="text-xs font-medium text-slate-300">{article.category}</span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Audio Reader button */}
            <button
              onClick={toggleSpeech}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                isSpeaking
                  ? "bg-amber-400 text-slate-950 animate-pulse"
                  : "bg-blue-800 text-white hover:bg-blue-700"
              }`}
              title="Listen to story read aloud"
            >
              {isSpeaking ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isSpeaking ? "Pause Audio" : "Listen (AI Voice)"}</span>
            </button>

            {/* Font size toggles */}
            <div className="hidden sm:flex items-center bg-blue-900/60 rounded-lg p-0.5 border border-blue-800">
              <button
                onClick={() => setFontSize("sm")}
                className={`px-2 py-0.5 text-xs font-bold rounded ${
                  fontSize === "sm" ? "bg-red-600 text-white" : "text-blue-200"
                }`}
                title="Smaller text"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize("base")}
                className={`px-2 py-0.5 text-xs font-bold rounded ${
                  fontSize === "base" ? "bg-red-600 text-white" : "text-blue-200"
                }`}
                title="Normal text"
              >
                A
              </button>
              <button
                onClick={() => setFontSize("lg")}
                className={`px-2 py-0.5 text-xs font-bold rounded ${
                  fontSize === "lg" ? "bg-red-600 text-white" : "text-blue-200"
                }`}
                title="Larger text"
              >
                A+
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-red-600 text-white transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-8 space-y-6">
          {/* Header Metadata */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-[#0b2545] text-white text-xs font-extrabold rounded-md uppercase">
                {article.category}
              </span>
              <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-md flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-red-600" />
                <span>{article.lga}</span>
              </span>
              <span className="text-xs text-slate-500 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{article.readTime}</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {article.title}
            </h1>

            {/* Author info */}
            <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0b2545] to-red-600 text-white flex items-center justify-center font-bold text-sm uppercase">
                  {article.authorName.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{article.authorName}</p>
                  <p className="text-slate-500">{article.authorRole} • Delta Updates</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span>Published {formattedDate}</span>
                <span className="flex items-center space-x-1 font-semibold text-slate-700">
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>{article.views} reads</span>
                </span>
              </div>
            </div>
          </div>

          {/* Featured Article Image */}
          <div className="rounded-xl overflow-hidden shadow-md relative bg-slate-900 max-h-[420px]">
            <Image
              src={article.imageUrl}
              alt={article.title}
              width={1200}
              height={800}
              sizes="(max-width: 896px) 100vw, 896px"
              className="w-full object-cover max-h-[420px]"
            />
            <div className="bg-slate-900/90 text-slate-300 text-[11px] px-3 py-1.5 flex items-center justify-between">
              <span>Image: Delta Updates newsroom / source as credited</span>
              <span>LGA: {article.lga}</span>
            </div>
          </div>

          {/* Summary Lead Quote Box */}
          <div className="border-l-4 border-red-600 bg-red-50/70 p-4 rounded-r-xl">
            <p className="text-sm font-semibold italic leading-relaxed text-slate-800 sm:text-base">
              &ldquo;{article.summary}&rdquo;
            </p>
          </div>

          {/* Full Article Content */}
          <div className={`text-slate-800 ${fontSizeClass} space-y-4 font-normal`}>
            {article.content.split("\n\n").map((para, i) => (
              <p key={i} className="leading-relaxed">
                {para}
              </p>
            ))}
          </div>

          {/* Action Ribbon: Like & Share Buttons */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleLikeClick}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold text-xs transition cursor-pointer ${
                  liked
                    ? "bg-red-600 text-white shadow"
                    : "bg-white text-slate-700 border border-slate-300 hover:border-red-500 hover:text-red-600"
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? "fill-white" : "text-red-500"}`} />
                <span>{liked ? "Liked" : "Like Article"} ({likesCount})</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? "Link Copied!" : "Copy Link"}</span>
              </button>
            </div>

            {/* Social Share Buttons */}
            <div className="flex items-center space-x-2 text-xs font-semibold">
              <span className="text-slate-500">Share to:</span>
              <button
                onClick={handleShareWhatsApp}
                className="px-3 py-1.5 rounded-lg bg-[#25D366] text-white hover:bg-[#20ba59] transition flex items-center space-x-1 cursor-pointer"
              >
                <span>WhatsApp</span>
              </button>
              <button
                onClick={handleShareTwitter}
                className="px-3 py-1.5 rounded-lg bg-black text-white hover:bg-slate-800 transition flex items-center space-x-1 cursor-pointer"
              >
                <span>X / Twitter</span>
              </button>
            </div>
          </div>

          {/* Reader Discussion / Comments Section */}
          <div className="pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#0b2545] flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-red-600" />
                <span>Reader Discussion & Verified Voices ({comments.length})</span>
              </h3>
            </div>

            {/* Comment Post Form */}
            <form onSubmit={handleSubmitComment} className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 space-y-3">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Join the conversation from anywhere in Nigeria:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Your Full Name (e.g. Oghenetega David)"
                  value={newCommentAuthor}
                  onChange={(e) => setNewCommentAuthor(e.target.value)}
                  required
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Your Email (not published)"
                  value={newCommentEmail}
                  onChange={(e) => setNewCommentEmail(e.target.value)}
                  required
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Your State / City (e.g. Lagos, Jos, Warri, Abuja)"
                  value={newCommentLocation}
                  onChange={(e) => setNewCommentLocation(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
              <textarea
                placeholder="Write your constructive thoughts on this report..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                required
                rows={3}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:outline-none"
              ></textarea>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingComment}
                  className="px-4 py-2 bg-[#0b2545] hover:bg-blue-900 text-white font-bold text-xs rounded-lg transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingComment ? "Posting..." : "Post Comment"}</span>
                </button>
              </div>
            </form>

            {commentNotice && (
              <p className="mb-4 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                {commentNotice}
              </p>
            )}

            {/* Comments List */}
            <div className="space-y-3">
              {comments.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-4 italic">
                  Be the first reader to share your opinion on this news story!
                </p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="p-3.5 bg-white rounded-xl border border-slate-100 shadow-2xs">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{c.authorName}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] text-red-600 font-medium">{c.authorLocation}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.createdAt).toLocaleDateString("en-NG")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{c.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
