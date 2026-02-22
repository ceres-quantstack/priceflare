"use client";

import { useState } from "react";
import { Send, MessageSquare, Mail, AlertCircle } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({ subject: "", message: "", honeypot: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.honeypot !== "") { setError(true); return; }

    window.location.href = `mailto:priceflare@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(formData.message)}`;
    setSubmitted(true);
    setTimeout(() => { setFormData({ subject: "", message: "", honeypot: "" }); setSubmitted(false); }, 5000);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-surface-900 mb-3 tracking-tight">
          Get in Touch <span className="text-2xl">💬</span>
        </h1>
        <p className="text-base text-surface-500">
          Bug reports, feature ideas, or just saying hi — we read everything.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">Something went wrong. Try emailing us directly at priceflare@gmail.com</p>
        </div>
      )}

      {!submitted ? (
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="subject" className="block text-sm font-semibold text-surface-700 mb-1.5 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-surface-400" /> Subject
              </label>
              <input
                id="subject"
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                className="w-full bg-surface-50 border border-surface-200 px-4 py-2.5 rounded-xl outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200 text-sm text-surface-800 placeholder-surface-400 transition-all"
                placeholder="What's this about?"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-surface-700 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-surface-400" /> Message
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={6}
                className="w-full bg-surface-50 border border-surface-200 px-4 py-2.5 rounded-xl outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200 text-sm text-surface-800 placeholder-surface-400 transition-all resize-none"
                placeholder="Tell us what's on your mind..."
              />
            </div>

            {/* Honeypot */}
            <div className="hidden" aria-hidden="true">
              <input type="text" value={formData.honeypot} onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })} tabIndex={-1} autoComplete="off" />
            </div>

            <button
              type="submit"
              className="w-full bg-brand-500 text-white py-3 rounded-xl font-semibold hover:bg-brand-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Send className="w-4 h-4" /> Send Message
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-surface-400">
            Or email us directly at{" "}
            <a href="mailto:priceflare@gmail.com" className="text-brand-500 hover:text-brand-600 transition-colors">
              priceflare@gmail.com
            </a>
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-10 text-center">
          <span className="text-5xl block mb-3">✉️</span>
          <h2 className="text-xl font-bold text-surface-900 mb-2">Message Sent!</h2>
          <p className="text-sm text-surface-500">Your email client should open. We'll get back to you soon.</p>
        </div>
      )}
    </div>
  );
}
