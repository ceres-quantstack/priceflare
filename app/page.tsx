"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import SearchHistory from "@/components/SearchHistory";
import TrendingProducts from "@/components/TrendingProducts";
import { Product } from "@/types";
import { Search, RotateCcw } from "lucide-react";

// API Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.100:8095';

// Retailer configs
const RETAILERS = [
  { name: "Amazon", emoji: "📦", color: "#FF9900", url: "https://www.amazon.com", delay: 400 },
  { name: "Target", emoji: "🎯", color: "#CC0000", url: "https://www.target.com", delay: 600 },
  { name: "Newegg", emoji: "🥚", color: "#FF6600", url: "https://www.newegg.com", delay: 500 },
  { name: "eBay", emoji: "🛒", color: "#E53238", url: "https://www.ebay.com", delay: 700 },
  { name: "Best Buy", emoji: "⚡", color: "#0046BE", url: "https://www.bestbuy.com", delay: 550 },
];

const RETAILER_DETAILS: Record<string, string> = {
  Amazon: "Prime eligible with free 2-day shipping. A-to-Z Guarantee. Easy 30-day returns.",
  Target: "Same-day Drive Up pickup. RedCard members save 5% on every purchase.",
  Newegg: "Tech-focused retailer with detailed specs. Known for combo deals and open-box discounts.",
  eBay: "New, refurbished, and used options. All purchases covered by Money Back Guarantee.",
  "Best Buy": "Geek Squad support available. 15-day price match guarantee. Same-day pickup at 1000+ stores.",
};

export default function Home() {
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState<Record<string, number>>({});
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [currentQuery, setCurrentQuery] = useState("");
  const [noResults, setNoResults] = useState(false);
  const progressTimers = useRef<NodeJS.Timeout[]>([]);
  const hasAutoSearched = useRef(false);

  useEffect(() => {
    const history = localStorage.getItem("priceflare_search_history");
    if (history) {
      try { setSearchHistory(JSON.parse(history)); } catch {}
    }
  }, []);

  // Auto-search from URL params (shareable links)
  useEffect(() => {
    if (hasAutoSearched.current) return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q && q.trim()) {
      hasAutoSearched.current = true;
      handleSearch(q.trim());
    }
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setCurrentQuery(query);
    setNoResults(false);

    // Update URL without reload
    const url = new URL(window.location.href);
    url.searchParams.set("q", query);
    window.history.replaceState({}, "", url.toString());

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

    // Clear timers
    progressTimers.current.forEach(clearTimeout);
    progressTimers.current = [];

    try {
      const eventSource = new EventSource(`${API_URL}/api/search/stream?q=${encodeURIComponent(query)}`);
      const receivedResults: Product[] = [];
      const completedRetailers = new Set<string>();

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.done) {
            eventSource.close();
            setIsSearching(false);
            setSearchProgress({});
            if (receivedResults.length === 0) setNoResults(true);
            return;
          }

          const product: Product = {
            id: `${data.retailer.toLowerCase().replace(/\s/g, '-')}-${Date.now()}-${receivedResults.length}`,
            name: data.productName,
            retailer: data.retailer,
            retailerEmoji: data.retailerEmoji,
            retailerColor: data.retailerColor,
            price: data.price || 0,
            description: RETAILER_DETAILS[data.retailer] || "",
            inStock: data.inStock !== false,
            url: data.url,
            source: data.source,
            image: data.image,
          };

          // Only include results that have actual price data
          if (!data.price || data.price <= 0) return;

          receivedResults.push(product);
          completedRetailers.add(data.retailer);
          setSearchResults([...receivedResults]);
          setSearchProgress((prev) => ({ ...prev, [data.retailer]: 100 }));
        } catch {}
      };

      eventSource.onerror = () => {
        eventSource.close();
        if (receivedResults.length === 0) {
          fallbackToRegularAPI(query);
        } else {
          setIsSearching(false);
          setSearchProgress({});
        }
      };

      // Progress animation for waiting retailers
      const progressInterval = setInterval(() => {
        setSearchProgress((prev) => {
          const updated = { ...prev };
          RETAILERS.forEach((retailer) => {
            if (!completedRetailers.has(retailer.name) && updated[retailer.name] < 90) {
              updated[retailer.name] = Math.min((updated[retailer.name] || 0) + 3, 90);
            }
          });
          return updated;
        });
        if (completedRetailers.size === RETAILERS.length) clearInterval(progressInterval);
      }, 500);

      // 45s timeout (searches can take 35s)
      const timeout = setTimeout(() => {
        eventSource.close();
        clearInterval(progressInterval);
        setIsSearching(false);
        setSearchProgress({});
      }, 45000);

      progressTimers.current.push(timeout);

    } catch {
      fallbackToRegularAPI(query);
    }

    async function fallbackToRegularAPI(query: string) {
      try {
        const response = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error(`${response.status}`);
        const data = await response.json();

        const products: Product[] = data.results
          .filter((r: any) => r.price && r.price > 0)
          .map((r: any, idx: number) => ({
            id: `${r.retailer.toLowerCase().replace(/\s/g, '-')}-${Date.now()}-${idx}`,
            name: r.productName,
            retailer: r.retailer,
            retailerEmoji: r.retailerEmoji,
            retailerColor: r.retailerColor,
            price: r.price,
            description: RETAILER_DETAILS[r.retailer] || "",
            inStock: r.inStock !== false,
            url: r.url,
            source: r.source,
            image: r.image,
          }));

        setSearchResults(products);
        if (products.length === 0) setNoResults(true);
      } catch (e) {
        console.error('Search failed:', e);
        setNoResults(true);
      }
      setIsSearching(false);
      setSearchProgress({});
    }
  }, [searchHistory]);

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("priceflare_search_history");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <a href="#main-content" className="skip-to-content">Skip to content</a>
      
      {/* Hero */}
      <div className="text-center mb-8 mt-4">
        <h1 className="text-3xl md:text-4xl font-bold text-surface-900 mb-2 tracking-tight">
          Find the best price,{" "}
          <span className="text-brand-500">instantly</span>
          <span className="animate-fire-flicker inline-block ml-1">🔥</span>
        </h1>
        <p className="text-base text-surface-500 max-w-md mx-auto">
          Compare real prices across 5 major retailers in seconds.
        </p>
      </div>

      {/* Search */}
      <div id="main-content" className="mb-8">
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

      {/* Results Header */}
      {(searchResults.length > 0 || noResults) && !isSearching && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-surface-500">
            {searchResults.length > 0
              ? `Showing ${searchResults.length} results for "${currentQuery}"`
              : `No results found for "${currentQuery}"`
            }
          </p>
          <button
            onClick={() => {
              setSearchResults([]);
              setCurrentQuery("");
              setNoResults(false);
              const url = new URL(window.location.href);
              url.searchParams.delete("q");
              window.history.replaceState({}, "", url.toString());
            }}
            className="flex items-center gap-1.5 text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New Search
          </button>
        </div>
      )}

      {/* No Results */}
      {noResults && !isSearching && searchResults.length === 0 && (
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-8 text-center">
          <span className="text-4xl block mb-3">🔍</span>
          <p className="text-sm font-medium text-surface-700 mb-1">
            No prices found for &ldquo;{currentQuery}&rdquo;
          </p>
          <p className="text-xs text-surface-400">
            Try a more specific product name, or check the spelling.
          </p>
        </div>
      )}

      {/* Results */}
      {searchResults.length > 0 && <SearchResults results={searchResults} />}

      {/* Trending Products */}
      {!isSearching && searchResults.length === 0 && searchHistory.length === 0 && (
        <TrendingProducts onProductClick={handleSearch} />
      )}

      {/* Trusted Retailers */}
      {!isSearching && searchResults.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-xs text-surface-400 uppercase tracking-widest mb-4 font-semibold">
            Comparing prices across
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {RETAILERS.map((r) => (
              <span key={r.name} className="text-sm font-medium text-surface-500 bg-white border border-surface-200 px-3 py-1.5 rounded-full">
                {r.emoji} {r.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
