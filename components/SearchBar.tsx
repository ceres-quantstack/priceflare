"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
}

const PRODUCT_SUGGESTIONS = [
  "iPhone 15 Pro", "MacBook Pro", "Sony PlayStation 5", "Xbox Series X",
  "Samsung Galaxy S24", "AirPods Pro", "Nintendo Switch", "iPad Air",
  "Dell XPS 15", "LG OLED TV", "Dyson Vacuum", "KitchenAid Mixer",
  "Canon EOS R5", "GoPro Hero 12", "Bose QuietComfort", "Instant Pot",
  "Herman Miller Chair", "Peloton Bike", "Ninja Air Fryer", "Roomba",
  "Apple Watch Series 9", "Galaxy Watch 6", "Fitbit Charge 6", "Garmin Fenix",
  "Sony WH-1000XM5", "JBL Flip 6", "Amazon Echo", "Google Nest Hub",
  "Ring Doorbell", "Arlo Camera", "Philips Hue", "Roku Streaming Stick",
  "Kindle Paperwhite", "Samsung Tablet", "Microsoft Surface", "Steam Deck",
];

export default function SearchBar({ onSearch, isSearching }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length > 1) {
      const filtered = PRODUCT_SUGGESTIONS.filter(product =>
        product.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
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

  return (
    <div className="relative max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="glass rounded-2xl p-2 flex items-center gap-2 hover:shadow-xl transition-shadow">
          <Search className="w-6 h-6 text-sky-blue ml-2" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products across all retailers..."
            className="flex-1 bg-transparent border-none outline-none text-lg px-2 py-3 text-gray-800 placeholder-gray-500"
            disabled={isSearching}
          />
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="bg-gradient-to-r from-sky-blue to-dark-blue text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
          >
            {isSearching ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Search"
            )}
          </button>
        </div>
      </form>

      {/* Autocomplete Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full glass rounded-xl overflow-hidden shadow-2xl z-50">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-6 py-3 hover:bg-white/30 transition-colors text-gray-800 border-b border-white/10 last:border-b-0"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Search Progress Bars */}
      {isSearching && (
        <div className="mt-6 space-y-3 glass rounded-2xl p-6">
          <div className="text-center text-dark-blue font-semibold mb-4">
            Searching across retailers...
          </div>
          {["Amazon 📦", "Walmart 🏪", "Target 🎯", "Newegg 🥚", "eBay 🛒", "Best Buy ⚡"].map((retailer, idx) => (
            <div key={retailer} className="space-y-1">
              <div className="text-sm text-gray-700 font-medium">{retailer}</div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full fire-progress"
                  style={{
                    width: "100%",
                    animationDelay: `${idx * 0.2}s`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
