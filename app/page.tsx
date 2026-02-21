"use client";

import { useState, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import SearchHistory from "@/components/SearchHistory";
import { Product } from "@/types";

export default function Home() {
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    // Load search history from localStorage
    const history = localStorage.getItem("priceflare_search_history");
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  const handleSearch = (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    
    // Add to search history
    const updatedHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
    setSearchHistory(updatedHistory);
    localStorage.setItem("priceflare_search_history", JSON.stringify(updatedHistory));

    // Simulate search with mock data
    setTimeout(() => {
      setSearchResults(generateMockResults(query));
      setIsSearching(false);
    }, 2500);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("priceflare_search_history");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Section */}
      <div className="text-center mb-12 mt-8">
        <h1 className="text-5xl md:text-6xl font-bold text-dark-blue mb-4 animate-float">
          Welcome to PriceFlare <span className="animate-fire-flicker inline-block">🔥</span>
        </h1>
        <p className="text-xl text-gray-700 max-w-2xl mx-auto">
          Track prices across top retailers, get instant alerts on deals, and never overpay again.
        </p>
      </div>

      {/* Search Bar - Always Visible */}
      <div className="mb-8">
        <SearchBar onSearch={handleSearch} isSearching={isSearching} />
      </div>

      {/* Search History */}
      {searchHistory.length > 0 && !isSearching && searchResults.length === 0 && (
        <SearchHistory history={searchHistory} onClear={clearHistory} onSelect={handleSearch} />
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <SearchResults results={searchResults} />
      )}

      {/* Empty State */}
      {!isSearching && searchResults.length === 0 && searchHistory.length === 0 && (
        <div className="glass rounded-3xl p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-semibold text-dark-blue mb-2">Start Your Price Hunt</h2>
          <p className="text-gray-600">
            Search for any product to see prices across Amazon, Walmart, Target, and more!
          </p>
        </div>
      )}
    </div>
  );
}

function generateMockResults(query: string): Product[] {
  const retailers = [
    { name: "Amazon", emoji: "📦", color: "#FF9900", url: "https://amazon.com" },
    { name: "Walmart", emoji: "🏪", color: "#0071CE", url: "https://walmart.com" },
    { name: "Target", emoji: "🎯", color: "#CC0000", url: "https://target.com" },
    { name: "Newegg", emoji: "🥚", color: "#FF6600", url: "https://newegg.com" },
    { name: "eBay", emoji: "🛒", color: "#E53238", url: "https://ebay.com" },
    { name: "Best Buy", emoji: "⚡", color: "#FFE000", url: "https://bestbuy.com" },
  ];

  return retailers.map((retailer, idx) => ({
    id: `${retailer.name.toLowerCase()}-${Date.now()}-${idx}`,
    name: query,
    retailer: retailer.name,
    retailerEmoji: retailer.emoji,
    retailerColor: retailer.color,
    price: Math.floor(Math.random() * 500 + 50),
    description: `High-quality ${query} with excellent features and customer ratings`,
    inStock: true,
    url: `${retailer.url}/product/${query.toLowerCase().replace(/\s+/g, "-")}`,
    reviews: Math.floor(Math.random() * 5000 + 100),
    rating: +(Math.random() * 1.5 + 3.5).toFixed(1),
    pros: ["Great value", "Fast shipping", "Quality product"],
    cons: ["Limited color options"],
    priceHistory: generatePriceHistory(),
  }));
}

function generatePriceHistory() {
  const history = [];
  const now = new Date();
  const basePrice = Math.floor(Math.random() * 300 + 100);
  
  for (let i = 36; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    
    const variance = Math.random() * 60 - 30;
    const isSale = Math.random() > 0.8;
    const price = Math.max(basePrice + variance - (isSale ? 50 : 0), basePrice * 0.5);
    
    history.push({
      date: date.toISOString().split('T')[0],
      price: +price.toFixed(2),
      isSale,
    });
  }
  
  return history;
}
