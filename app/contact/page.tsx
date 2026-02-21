"use client";

import { useState } from "react";
import { Metadata } from "next";
import { Mail, Send, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Open mailto: link as fallback, then show success
    const mailto = `mailto:${"priceflare"}@${"gmail.com"}?subject=${encodeURIComponent(
      formData.subject
    )}&body=${encodeURIComponent(formData.message)}`;
    window.open(mailto, "_blank");

    setSubmitted(true);
    setTimeout(() => {
      setFormData({ subject: "", message: "" });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-dark-blue mb-4">
          Contact PriceFlare <span className="animate-fire-flicker inline-block">🔥</span>
        </h1>
        <p className="text-xl text-gray-700">
          Questions? Feedback? Found a bug? We're all ears! (Well, technically we're all code, but you get the idea.)
        </p>
      </div>

      {!submitted ? (
        <div className="glass rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-dark-blue font-semibold mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                className="w-full glass px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-sky-blue text-gray-800 placeholder-gray-500"
                placeholder="What's on your mind?"
              />
            </div>

            <div>
              <label className="block text-dark-blue font-semibold mb-2 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={8}
                className="w-full glass px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-sky-blue text-gray-800 placeholder-gray-500 resize-none"
                placeholder="Tell us everything! Bug reports, feature requests, love letters, pizza recipes... we read it all."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-sky-blue to-dark-blue text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send Message
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-gray-700">
              <strong>Pro tip:</strong> If you're reporting a bug, include what you were searching for and 
              which browser you're using. Screenshots are chef's kiss 👌
            </p>
          </div>

          <div className="mt-6 text-center text-gray-600 text-sm">
            <p>We typically respond within 24-48 hours.</p>
            <p className="mt-2">Unless it's the weekend. Then we're probably hiking or eating tacos. 🌮</p>
          </div>
        </div>
      ) : (
        <div className="glass rounded-3xl p-12 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-3xl font-bold text-dark-blue mb-2">Message Sent!</h2>
          <p className="text-gray-700">
            Thanks for reaching out! We'll get back to you faster than a Black Friday doorbuster.
          </p>
        </div>
      )}
    </div>
  );
}
