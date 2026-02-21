"use client";

import { useState } from "react";
import { Mail, Send, MessageSquare, AlertCircle } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    honeypot: "", // Spam trap
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check
    if (formData.honeypot !== "") {
      setError(true);
      return;
    }

    // Mailto fallback
    const mailtoLink = `mailto:priceflare@gmail.com?subject=${encodeURIComponent(
      formData.subject
    )}&body=${encodeURIComponent(formData.message)}`;

    window.location.href = mailtoLink;

    setSubmitted(true);
    setTimeout(() => {
      setFormData({ subject: "", message: "", honeypot: "" });
      setSubmitted(false);
    }, 5000);
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

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-semibold">Spam detected</p>
            <p className="text-red-700 text-sm">
              Please try again. If you're a real human, contact us directly at priceflare@gmail.com
            </p>
          </div>
        </div>
      )}

      {!submitted ? (
        <div className="glass rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="subject"
                className="block text-dark-blue font-semibold mb-2 flex items-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                Subject
              </label>
              <input
                id="subject"
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                className="w-full glass px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-sky-blue text-gray-800 placeholder-gray-500"
                placeholder="What's on your mind?"
                aria-required="true"
              />
            </div>

            <div>
              <label 
                htmlFor="message"
                className="block text-dark-blue font-semibold mb-2 flex items-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Message
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={8}
                className="w-full glass px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-sky-blue text-gray-800 placeholder-gray-500 resize-none"
                placeholder="Tell us everything! Bug reports, feature requests, love letters, pizza recipes... we read it all."
                aria-required="true"
              />
            </div>

            {/* Honeypot field - hidden from real users */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                id="website"
                type="text"
                value={formData.honeypot}
                onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-sky-blue to-dark-blue text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              aria-label="Send message"
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

          <div className="mt-6 text-center text-gray-600 text-sm space-y-1">
            <p>We typically respond within 24-48 hours.</p>
            <p>Unless it's the weekend. Then we're probably hiking or eating tacos. 🌮</p>
            <p className="text-xs text-gray-500 mt-4">
              Direct email: <a href="mailto:priceflare@gmail.com" className="text-sky-blue hover:underline">priceflare@gmail.com</a>
            </p>
          </div>
        </div>
      ) : (
        <div className="glass rounded-3xl p-12 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-3xl font-bold text-dark-blue mb-2">Message Sent!</h2>
          <p className="text-gray-700 mb-4">
            Thanks for reaching out! Your email client should open now.
          </p>
          <p className="text-sm text-gray-600">
            We'll get back to you faster than a Black Friday doorbuster.
          </p>
        </div>
      )}
    </div>
  );
}
