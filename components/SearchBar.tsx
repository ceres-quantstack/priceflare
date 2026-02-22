"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
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
  smartphones: "📱 Smartphones",
  laptops: "💻 Laptops",
  tablets: "📲 Tablets",
  tvs: "📺 TVs",
  headphones: "🎧 Headphones",
  speakers: "🔊 Speakers",
  gaming: "🎮 Gaming",
  cameras: "📷 Cameras",
  smartwatches: "⌚ Smartwatches",
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
  misc: "🎁 Miscellaneous",
};

export default function SearchBar({ onSearch, isSearching, searchProgress }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced fuzzy search with 500+ products
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
    }, 150); // 150ms debounce

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
    if (query.length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="relative max-w-3xl mx-auto" ref={wrapperRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="glass rounded-2xl p-2 flex items-center gap-2 transition-shadow duration-300">
          <Search className="w-6 h-6 text-sky-blue ml-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            placeholder="Search for products across all retailers..."
            className="flex-1 bg-transparent border-none outline-none text-lg px-2 py-3 text-gray-800 placeholder-gray-500"
            disabled={isSearching}
            autoComplete="off"
            aria-label="Search for products"
          />
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="bg-gradient-to-r from-sky-blue to-dark-blue text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
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

      {/* Autocomplete Suggestions with Category Labels */}
      {showSuggestions && suggestions.length > 0 && !isSearching && (
        <div className="absolute top-full mt-2 w-full glass rounded-xl overflow-hidden shadow-2xl z-50 border border-white/20">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(suggestion.name)}
              className="w-full text-left px-6 py-3 hover:bg-sky-blue/20 transition-all duration-150 text-gray-800 border-b border-white/10 last:border-b-0 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 flex-1">
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="font-medium">{suggestion.name}</span>
              </div>
              <span className="text-xs text-gray-500 bg-white/50 px-2 py-1 rounded-full">
                {CATEGORY_LABELS[suggestion.category] || suggestion.category}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Search Progress Bars — realistic staggered progress */}
      {isSearching && (
        <div className="mt-6 space-y-3 glass rounded-2xl p-6">
          <div className="text-center text-dark-blue font-semibold mb-4">
            🔥 Searching across retailers...
          </div>
          {RETAILERS.map((retailer) => {
            const progress = searchProgress[retailer.name] ?? 0;
            const isComplete = progress >= 100;
            return (
              <div key={retailer.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 font-medium">
                    {retailer.emoji} {retailer.name}
                  </span>
                  <span className="text-xs text-gray-600 font-mono font-semibold">
                    {isComplete ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <span className="text-green-600">✓</span> Complete
                      </span>
                    ) : (
                      `${Math.round(progress)}%`
                    )}
                  </span>
                </div>
                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ease-out ${
                      isComplete ? "bg-green-500" : "fire-progress"
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Skeleton Loading Placeholders */}
      {isSearching && (
        <div className="mt-6 space-y-4" role="status" aria-label="Loading results">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-3xl p-6 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-6 w-48 bg-gray-300 rounded"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="h-8 w-24 bg-gray-300 rounded"></div>
              </div>
              <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
