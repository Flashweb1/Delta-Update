"use client";

import React, { useState } from "react";
import { X, Send, Shield, CheckCircle, AlertCircle, MapPin } from "lucide-react";

interface SubmitTipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubmitTipModal({ isOpen, onClose }: SubmitTipModalProps) {
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [reporterContact, setReporterContact] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline.trim() || !description.trim() || !location.trim()) {
      setErrorMessage("Please fill in the headline, details, and town/LGA location.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline,
          description,
          location,
          reporterContact: isAnonymous ? null : reporterContact,
          isAnonymous,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const err = await res.json();
        setErrorMessage(err.error || "Failed to submit tip");
      }
    } catch {
      setErrorMessage("Network error, please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setHeadline("");
    setDescription("");
    setLocation("");
    setReporterContact("");
    setIsAnonymous(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#0b2545] text-white p-4 flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Send a News Tip / Whistleblower Scoop</h3>
              <p className="text-[11px] text-blue-200">Confidential Editorial Desk • Delta Updates Nigeria</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-slate-800 text-white hover:bg-red-600 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6">
          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="font-extrabold text-lg text-slate-900">Scoop Received Securely</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Thank you for contributing to independent journalism. Our editors will review your report and verify it before publication.
              </p>
              <div className="pt-3">
                <button
                  onClick={handleReset}
                  className="px-6 py-2 bg-[#0b2545] text-white rounded-lg text-xs font-bold hover:bg-blue-900 transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
                <p className="font-bold mb-0.5">Your privacy is protected</p>
                <p className="text-[11px] text-blue-700">
                  Have a verified local story, public-interest concern, or eyewitness report from anywhere in Nigeria? Send it to our editors. You can choose to remain anonymous.
                </p>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Headline / Brief Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tanker incident along Effurun-Sapele expressway"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  required
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Location in Nigeria (State, City / LGA, Landmark) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. Ikeja, Lagos State · Jos North, Plateau State · Warri, Delta State"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="w-full text-xs border border-slate-300 rounded-lg pl-8 p-2.5 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                  <MapPin className="w-3.5 h-3.5 text-red-500 absolute left-2.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Details & Eyewitness Observations *
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe what happened, when, who was involved, and current situation on ground..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="anonymousCheck"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500 h-4 w-4"
                />
                <label htmlFor="anonymousCheck" className="text-xs font-semibold text-slate-700">
                  Submit anonymously (Do not attach contact info)
                </label>
              </div>

              {!isAnonymous && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Phone or WhatsApp (For verification by editor only)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +234 803 123 4567 or email@domain.com"
                    value={reporterContact}
                    onChange={(e) => setReporterContact(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Transmitting..." : "Send Confidential Tip"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
