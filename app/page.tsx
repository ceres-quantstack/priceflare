"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import SearchHistory from "@/components/SearchHistory";
import { Product } from "@/types";

// Retailer configs — single source of truth
const RETAILERS = [
  { name: "Amazon", emoji: "📦", color: "#FF9900", url: "https://www.amazon.com", delay: 400 },
  { name: "Walmart", emoji: "🏪", color: "#0071CE", url: "https://www.walmart.com", delay: 600 },
  { name: "Target", emoji: "🎯", color: "#CC0000", url: "https://www.target.com", delay: 800 },
  { name: "Newegg", emoji: "🥚", color: "#FF6600", url: "https://www.newegg.com", delay: 500 },
  { name: "eBay", emoji: "🛒", color: "#E53238", url: "https://www.ebay.com", delay: 700 },
  { name: "Best Buy", emoji: "⚡", color: "#0046BE", url: "https://www.bestbuy.com", delay: 550 },
];

export default function Home() {
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState<Record<string, number>>({});
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const progressTimers = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    const history = localStorage.getItem("priceflare_search_history");
    if (history) {
      try { setSearchHistory(JSON.parse(history)); } catch {}
    }
  }, []);

  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) return;

    // Update history
    const updatedHistory = [query, ...searchHistory.filter((h) => h !== query)].slice(0, 20);
    setSearchHistory(updatedHistory);
    localStorage.setItem("priceflare_search_history", JSON.stringify(updatedHistory));

    // Reset state
    setIsSearching(true);
    setSearchResults([]);
    const progress: Record<string, number> = {};
    RETAILERS.forEach((r) => (progress[r.name] = 0));
    setSearchProgress({ ...progress });

    // Clear any existing timers
    progressTimers.current.forEach(clearTimeout);
    progressTimers.current = [];

    // Staggered progress per retailer — each progresses at its own pace
    RETAILERS.forEach((retailer) => {
      const totalDuration = 1800 + retailer.delay; // 1.8-2.6s total per retailer
      const steps = 20;
      const stepDuration = totalDuration / steps;

      for (let i = 1; i <= steps; i++) {
        const timer = setTimeout(() => {
          setSearchProgress((prev) => ({
            ...prev,
            [retailer.name]: Math.min((i / steps) * 100, 100),
          }));
        }, retailer.delay + i * stepDuration);
        progressTimers.current.push(timer);
      }
    });

    // Complete search after all progress bars finish
    const longestDuration = Math.max(...RETAILERS.map((r) => 1800 + r.delay * 2));
    const completeTimer = setTimeout(() => {
      setSearchResults(generateMockResults(query));
      setIsSearching(false);
      setSearchProgress({});
    }, longestDuration);
    progressTimers.current.push(completeTimer);
  }, [searchHistory]);

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("priceflare_search_history");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero */}
      <div className="text-center mb-12 mt-8">
        <h1 className="text-5xl md:text-6xl font-bold text-dark-blue mb-4 animate-float">
          Welcome to PriceFlare{" "}
          <span className="animate-fire-flicker inline-block">🔥</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Track prices across top retailers, get instant alerts on deals, and
          never overpay again.
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <SearchBar
          onSearch={handleSearch}
          isSearching={isSearching}
          searchProgress={searchProgress}
        />
      </div>

      {/* Search History */}
      {searchHistory.length > 0 && !isSearching && searchResults.length === 0 && (
        <SearchHistory
          history={searchHistory}
          onClear={clearHistory}
          onSelect={handleSearch}
        />
      )}

      {/* Results */}
      {searchResults.length > 0 && <SearchResults results={searchResults} />}

      {/* Empty State */}
      {!isSearching && searchResults.length === 0 && searchHistory.length === 0 && (
        <div className="glass rounded-3xl p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-semibold text-dark-blue mb-2">
            Start Your Price Hunt
          </h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Search for any product to compare prices across Amazon, Walmart,
            Target, Newegg, eBay, and Best Buy.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {["iPhone 15 Pro", "Sony PlayStation 5", "Dyson V15 Detect", "AirPods Pro 2"].map((q) => (
              <button
                key={q}
                onClick={() => handleSearch(q)}
                className="glass px-4 py-2 rounded-full text-sm text-gray-700 hover:bg-sky-blue/20 transition-colors duration-200"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Trusted Retailers Bar */}
      {!isSearching && searchResults.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400 uppercase tracking-wider mb-4 font-medium">
            Comparing prices across
          </p>
          <div className="flex flex-wrap justify-center gap-6 opacity-60">
            {RETAILERS.map((r) => (
              <span key={r.name} className="text-lg font-semibold" style={{ color: r.color }}>
                {r.emoji} {r.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Mock Data Generation ---

const PRODUCT_DETAILS: Record<string, { desc: string; pros: string[]; cons: string[] }> = {
  Amazon: {
    desc: "Ships with Prime 2-day delivery. Fulfilled by Amazon warehouse.",
    pros: ["Prime 2-day shipping", "Easy returns within 30 days", "Wide seller marketplace", "Price matching available"],
    cons: ["Third-party seller quality varies", "Packaging can be excessive"],
  },
  Walmart: {
    desc: "Available for pickup today or free next-day delivery on orders $35+.",
    pros: ["Free next-day delivery $35+", "In-store pickup available", "Walmart+ member savings", "Price match guarantee"],
    cons: ["Limited premium product selection", "Customer service can be slow"],
  },
  Target: {
    desc: "Order with same-day Drive Up or delivery. RedCard saves 5% on every purchase.",
    pros: ["Same-day Drive Up pickup", "5% off with RedCard", "Clean store experience", "Excellent return policy"],
    cons: ["Higher base prices on some items", "Smaller online catalog"],
  },
  Newegg: {
    desc: "Tech-focused retailer with detailed specs and user reviews from verified buyers.",
    pros: ["Detailed tech specifications", "Verified buyer reviews", "Combo deal bundles", "Open-box savings"],
    cons: ["Returns can be complicated", "Shipping times vary by seller"],
  },
  eBay: {
    desc: "New and refurbished options available. eBay Money Back Guarantee on all purchases.",
    pros: ["Refurbished options at lower prices", "Money Back Guarantee", "Auction deals possible", "Global marketplace"],
    cons: ["Shipping times can vary", "Condition descriptions vary by seller"],
  },
  "Best Buy": {
    desc: "Geek Squad protection available. Price match with major retailers within 15 days.",
    pros: ["Geek Squad setup & support", "15-day price match guarantee", "Same-day store pickup", "My Best Buy rewards"],
    cons: ["Premium pricing on accessories", "Extended warranty upsells"],
  },
};

const REVIEW_SNIPPETS = [
  "Absolutely love this product! It exceeded my expectations in every way. Build quality is outstanding.",
  "Great value for the price. Works exactly as described. Setup was straightforward and took about 10 minutes.",
  "Solid product overall. I've been using it daily for three months and it still performs like new.",
  "Best purchase I've made this year. The quality is noticeably better than competing products I've tried.",
  "Does what it says on the box. No complaints after six months of regular use. Would recommend.",
  "Impressive build quality and attention to detail. You can tell a lot of thought went into the design.",
];

function generateMockResults(query: string): Product[] {
  const basePrice = hashStringToRange(query, 49, 899);

  return RETAILERS.map((retailer, idx) => {
    // Each retailer gets a slightly different price — realistic variance
    const variance = hashStringToRange(query + retailer.name, -80, 80);
    const price = Math.max(basePrice + variance, 29.99);
    const details = PRODUCT_DETAILS[retailer.name];
    const reviewIdx = (idx + query.length) % REVIEW_SNIPPETS.length;

    return {
      id: `${retailer.name.toLowerCase()}-${Date.now()}-${idx}`,
      name: query,
      retailer: retailer.name,
      retailerEmoji: retailer.emoji,
      retailerColor: retailer.color,
      price: +price.toFixed(2),
      description: details.desc,
      inStock: hashStringToRange(query + retailer.name + "stock", 0, 10) > 1, // 90% in stock
      url: `${retailer.url}/s?k=${encodeURIComponent(query)}`,
      reviews: hashStringToRange(query + retailer.name + "rev", 87, 12400),
      rating: +(3.5 + hashStringToRange(query + retailer.name + "rate", 0, 15) / 10).toFixed(1),
      pros: details.pros.slice(0, 3 + (idx % 2)),
      cons: details.cons,
      reviewSnippet: REVIEW_SNIPPETS[reviewIdx],
      inventory: hashStringToRange(query + retailer.name + "inv", 1, 150),
      priceHistory: generatePriceHistory(basePrice + variance, query + retailer.name),
    };
  }).filter((p) => p.inStock); // Spec says: don't show out-of-stock results
}

function generatePriceHistory(basePrice: number, seed: string) {
  const history = [];
  const now = new Date();

  for (let i = 36; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);

    // Deterministic variance from seed
    const h = hashStringToRange(seed + i, -40, 40);
    const isSale = hashStringToRange(seed + "sale" + i, 0, 10) > 7;
    const saleDiscount = isSale ? hashStringToRange(seed + "disc" + i, 20, 80) : 0;
    const price = Math.max(basePrice + h - saleDiscount, basePrice * 0.4);

    history.push({
      date: date.toISOString().split("T")[0],
      price: +price.toFixed(2),
      isSale,
    });
  }

  return history;
}

// Simple deterministic hash for consistent mock data
function hashStringToRange(str: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return min + Math.abs(hash % (max - min + 1));
}
