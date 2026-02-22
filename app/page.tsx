"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import SearchHistory from "@/components/SearchHistory";
import TrendingProducts from "@/components/TrendingProducts";
import { Product } from "@/types";

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
  const progressTimers = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    const history = localStorage.getItem("priceflare_search_history");
    if (history) {
      try { setSearchHistory(JSON.parse(history)); } catch {}
    }
  }, []);

  const handleSearch = useCallback(async (query: string) => {
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

        const products: Product[] = data.results.map((r: any, idx: number) => ({
          id: `${r.retailer.toLowerCase().replace(/\s/g, '-')}-${Date.now()}-${idx}`,
          name: r.productName,
          retailer: r.retailer,
          retailerEmoji: r.retailerEmoji,
          retailerColor: r.retailerColor,
          price: r.price || 0,
          description: RETAILER_DETAILS[r.retailer] || "",
          inStock: r.inStock !== false,
          url: r.url,
          source: r.source,
          image: r.image,
        }));

        setSearchResults(products);
      } catch (e) {
        console.error('Search failed:', e);
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
      <div className="text-center mb-10 mt-6">
        <h1 className="text-4xl md:text-5xl font-bold text-dark-blue mb-3">
          PriceFlare{" "}
          <span className="animate-fire-flicker inline-block">🔥</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Compare real prices across 5 major retailers instantly.
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

      {/* Results */}
      {searchResults.length > 0 && <SearchResults results={searchResults} />}

      {/* Trending Products */}
      {!isSearching && searchResults.length === 0 && searchHistory.length === 0 && (
        <TrendingProducts onProductClick={handleSearch} />
      )}

      {/* Trusted Retailers */}
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
