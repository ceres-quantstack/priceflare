"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, CheckCircle2 } from "lucide-react";
import { searchProducts, type ProductSuggestion } from "@/lib/productDatabase";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
  searchProgress: Record<string, number>;
}

const RETAILERS = [
  { name: "Amazon", emoji: "📦", color: "#FF9900" },
  { name: "Target", emoji: "🎯", color: "#CC0000" },
  { name: "Newegg", emoji: "🥚", color: "#FF6600" },
  { name: "eBay", emoji: "🛒", color: "#E53238" },
  { name: "Best Buy", emoji: "⚡", color: "#0046BE" },
];

const CATEGORY_LABELS: Record<string, string> = {
  smartphones: "📱 Phones",
  laptops: "💻 Laptops",
  tablets: "📲 Tablets",
  tvs: "📺 TVs",
  headphones: "🎧 Audio",
  speakers: "🔊 Speakers",
  gaming: "🎮 Gaming",
  cameras: "📷 Cameras",
  smartwatches: "⌚ Watches",
  smarthome: "🏠 Smart Home",
  vacuums: "🧹 Vacuums",
  kitchen: "🍳 Kitchen",
  appliances: "⚡ Appliances",
  monitors: "🖥️ Monitors",
  office: "🪑 Office",
  storage: "💾 Storage",
  networking: "📡 Networking",
  ereaders: "📖 E-Readers",
  fitness: "💪 Fitness",
  power: "🔋 Power",
  misc: "🎁 Other",
};

export default function SearchBar({ onSearch, isSearching, searchProgress }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const timer = setTimeout(() => {
      const results = searchProducts(query, 8);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    }, 150);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const handleFocus = () => {
    if (query.length >= 2 && suggestions.length > 0) setShowSuggestions(true);
  };

  return (
    <div className="relative max-w-2xl mx-auto" ref={wrapperRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card flex items-center gap-2 p-1.5 focus-within:border-brand-300 focus-within:shadow-card-hover transition-all">
          <Search className="w-5 h-5 text-surface-400 ml-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            placeholder="Search any product..."
            className="flex-1 bg-transparent border-none outline-none text-base px-2 py-2.5 text-surface-800 placeholder-surface-400"
            disabled={isSearching}
            autoComplete="off"
            aria-label="Search for products"
          />
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="bg-brand-500 text-white px-5 py-2.5 rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-600 active:scale-[0.97] transition-all text-sm"
            aria-label="Search"
          >
            {isSearching ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Search"
            )}
          </button>
        </div>
      </form>

      {/* Autocomplete */}
      {showSuggestions && suggestions.length > 0 && !isSearching && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl overflow-hidden shadow-elevated z-50 border border-surface-200">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(suggestion.name)}
              className="w-full text-left px-4 py-3 hover:bg-surface-50 transition-colors text-surface-700 border-b border-surface-100 last:border-b-0 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 flex-1">
                <Search className="w-4 h-4 text-surface-300 flex-shrink-0" />
                <span className="font-medium text-sm">{suggestion.name}</span>
              </div>
              <span className="text-xs text-surface-400 bg-surface-50 px-2 py-0.5 rounded-full">
                {CATEGORY_LABELS[suggestion.category] || suggestion.category}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Search Progress */}
      {isSearching && (
        <div className="mt-4 bg-white rounded-2xl border border-surface-200 p-5 shadow-card">
          <p className="text-sm font-medium text-surface-600 mb-3 text-center">
            Searching across {RETAILERS.length} retailers...
          </p>
          <div className="grid grid-cols-5 gap-3">
            {RETAILERS.map((retailer) => {
              const progress = searchProgress[retailer.name] ?? 0;
              const isComplete = progress >= 100;
              return (
                <div key={retailer.name} className="flex flex-col items-center gap-1.5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                    isComplete ? "bg-green-50 ring-2 ring-green-400" : "bg-surface-50"
                  }`}>
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <span className="animate-pulse-soft">{retailer.emoji}</span>
                    )}
                  </div>
                  <span className="text-[10px] text-surface-500 font-medium truncate w-full text-center">
                    {retailer.name}
                  </span>
                  <div className="h-1 w-full bg-surface-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isComplete ? "bg-green-400" : "fire-progress"
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Skeleton Loading */}
      {isSearching && (
        <div className="mt-4 space-y-3" role="status" aria-label="Loading results">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-surface-200 p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-100 rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 w-40 bg-surface-100 rounded" />
                    <div className="h-3 w-24 bg-surface-100 rounded" />
                  </div>
                </div>
                <div className="h-6 w-20 bg-surface-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
