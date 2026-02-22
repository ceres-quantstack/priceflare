import { Metadata } from "next";
import { TrendingDown, Shield, Zap, Heart, Search, Clock } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About PriceFlare",
  description: "Learn about PriceFlare — the instant price comparison tool that searches across 5 major retailers in real time.",
  keywords: "about priceflare, price comparison, save money, deal finder",
};

export default function AboutPage() {
  const features = [
    {
      icon: Search,
      title: "Live Price Search",
      description: "We search Amazon, Target, Newegg, eBay, and Best Buy in real time — no cached or outdated data.",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "No accounts, no tracking, no data storage. Your searches stay on your device.",
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Results stream in as each retailer responds. See prices in seconds, not minutes.",
    },
    {
      icon: Clock,
      title: "Always Current",
      description: "Every search hits live retailer pages. Prices reflect what you'd actually pay right now.",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-surface-900 mb-3 tracking-tight">
          About Price<span className="text-brand-500">Flare</span> 🔥
        </h1>
        <p className="text-base text-surface-500 max-w-lg mx-auto">
          Stop opening 5 tabs to compare prices. We do it in one search.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6 md:p-8 mb-8">
        <h2 className="text-lg font-bold text-surface-800 mb-4">How It Works</h2>
        <div className="space-y-3 text-surface-600 text-sm leading-relaxed">
          <p>
            PriceFlare searches 5 major retailers simultaneously when you type in a product name.
            We use a combination of direct APIs and intelligent web scraping to pull <strong>real, live prices</strong> — 
            not cached data from a week ago.
          </p>
          <p>
            Results stream in as each retailer responds, so you see the fastest results first.
            Our relevance engine uses phrase-matching and accessory detection to make sure you're
            comparing the right products, not random accessories.
          </p>
          <p>
            We don't store your searches, don't require an account, and don't sell your data.
            It's just a search box that saves you money.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div key={idx} className="bg-white rounded-xl border border-surface-200 p-5 hover:shadow-card-hover transition-shadow">
              <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-brand-500" />
              </div>
              <h3 className="text-sm font-bold text-surface-800 mb-1">{feature.title}</h3>
              <p className="text-xs text-surface-500 leading-relaxed">{feature.description}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6 mb-8">
        <h2 className="text-lg font-bold text-surface-800 mb-4">Retailers We Search</h2>
        <div className="grid grid-cols-5 gap-3">
          {[
            { name: "Amazon", emoji: "📦" },
            { name: "Target", emoji: "🎯" },
            { name: "Newegg", emoji: "🥚" },
            { name: "eBay", emoji: "🛒" },
            { name: "Best Buy", emoji: "⚡" },
          ].map((r) => (
            <div key={r.name} className="text-center p-3 bg-surface-50 rounded-xl">
              <span className="text-2xl block mb-1">{r.emoji}</span>
              <span className="text-xs font-medium text-surface-600">{r.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-600 active:scale-[0.97] transition-all text-sm"
        >
          <Search className="w-4 h-4" />
          Start Comparing Prices
        </Link>
      </div>
    </div>
  );
}
