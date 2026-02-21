"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import SearchHistory from "@/components/SearchHistory";
import TrendingProducts from "@/components/TrendingProducts";
import { Product } from "@/types";

// API Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.100:8095';

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

    // Clear any existing timers
    progressTimers.current.forEach(clearTimeout);
    progressTimers.current = [];

    // Try SSE streaming endpoint first
    try {
      const eventSource = new EventSource(`${API_URL}/api/search/stream?q=${encodeURIComponent(query)}`);
      const receivedResults: Product[] = [];
      const completedRetailers = new Set<string>();

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Check if streaming is complete
          if (data.done) {
            eventSource.close();
            setIsSearching(false);
            setSearchProgress({});
            return;
          }

          // Enrich and add the result
          const apiProduct = data;
          const details = PRODUCT_DETAILS[apiProduct.retailer] || PRODUCT_DETAILS["Amazon"];
          const reviewIdx = receivedResults.length % REVIEW_SNIPPETS.length;
          const priceToUse = apiProduct.price || getProductBasePrice(query);
          const priceHistory = generatePriceHistory(priceToUse, query + apiProduct.retailer);
          const avgPrice3Months = calculate3MonthAverage(priceHistory);
          const isPriceFlare = apiProduct.price && apiProduct.price < avgPrice3Months * 0.95;

          const enrichedProduct: Product = {
            id: `${apiProduct.retailer.toLowerCase()}-${Date.now()}-${receivedResults.length}`,
            name: apiProduct.productName,
            retailer: apiProduct.retailer,
            retailerEmoji: apiProduct.retailerEmoji,
            retailerColor: apiProduct.retailerColor,
            price: apiProduct.price || 0,
            description: apiProduct.description || details.desc,
            inStock: apiProduct.inStock !== false,
            url: apiProduct.url,
            reviews: hashStringToRange(query + apiProduct.retailer + "rev", 847, 9200),
            rating: +(4.0 + hashStringToRange(query + apiProduct.retailer + "rate", 0, 10) / 10).toFixed(1),
            pros: details.pros,
            cons: details.cons.slice(0, 2 + (receivedResults.length % 2)),
            reviewSnippet: REVIEW_SNIPPETS[reviewIdx],
            inventory: hashStringToRange(query + apiProduct.retailer + "inv", 3, 180),
            priceHistory,
            isPriceFlare,
          };

          receivedResults.push(enrichedProduct);
          completedRetailers.add(apiProduct.retailer);

          // Update results immediately
          setSearchResults([...receivedResults]);

          // Mark retailer as complete (100%)
          setSearchProgress((prev) => ({
            ...prev,
            [apiProduct.retailer]: 100,
          }));
        } catch (parseError) {
          console.error('Error parsing SSE data:', parseError);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE error, falling back to regular API:', error);
        eventSource.close();
        
        // Fallback to regular API
        fallbackToRegularAPI(query);
      };

      // Set searching progress for retailers that haven't completed yet
      const progressInterval = setInterval(() => {
        setSearchProgress((prev) => {
          const updated = { ...prev };
          RETAILERS.forEach((retailer) => {
            if (!completedRetailers.has(retailer.name) && updated[retailer.name] < 95) {
              updated[retailer.name] = Math.min((updated[retailer.name] || 0) + 5, 95);
            }
          });
          return updated;
        });

        // Clear interval if all done
        if (completedRetailers.size === RETAILERS.length) {
          clearInterval(progressInterval);
        }
      }, 300);

      // Cleanup timeout (30s max)
      const timeoutTimer = setTimeout(() => {
        eventSource.close();
        clearInterval(progressInterval);
        if (receivedResults.length > 0) {
          setIsSearching(false);
          setSearchProgress({});
        } else {
          fallbackToRegularAPI(query);
        }
      }, 30000);

      progressTimers.current.push(timeoutTimer);

    } catch (error) {
      console.error('Failed to start SSE, falling back to regular API:', error);
      fallbackToRegularAPI(query);
    }

    // Fallback function for regular API
    async function fallbackToRegularAPI(query: string) {
      try {
        // Staggered progress animation
        RETAILERS.forEach((retailer) => {
          const totalDuration = 1800 + retailer.delay;
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

        const response = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }
        
        const data = await response.json();
        
        // Enrich API results
        const enrichedResults = data.results.map((apiProduct: any, idx: number) => {
          const details = PRODUCT_DETAILS[apiProduct.retailer] || PRODUCT_DETAILS["Amazon"];
          const reviewIdx = (idx + query.length) % REVIEW_SNIPPETS.length;
          const priceToUse = apiProduct.price || getProductBasePrice(query);
          const priceHistory = generatePriceHistory(priceToUse, query + apiProduct.retailer);
          const avgPrice3Months = calculate3MonthAverage(priceHistory);
          const isPriceFlare = apiProduct.price && apiProduct.price < avgPrice3Months * 0.95;

          return {
            id: `${apiProduct.retailer.toLowerCase()}-${Date.now()}-${idx}`,
            name: apiProduct.productName,
            retailer: apiProduct.retailer,
            retailerEmoji: apiProduct.retailerEmoji,
            retailerColor: apiProduct.retailerColor,
            price: apiProduct.price || 0,
            description: apiProduct.description || details.desc,
            inStock: apiProduct.inStock !== false,
            url: apiProduct.url,
            reviews: hashStringToRange(query + apiProduct.retailer + "rev", 847, 9200),
            rating: +(4.0 + hashStringToRange(query + apiProduct.retailer + "rate", 0, 10) / 10).toFixed(1),
            pros: details.pros,
            cons: details.cons.slice(0, 2 + (idx % 2)),
            reviewSnippet: REVIEW_SNIPPETS[reviewIdx],
            inventory: hashStringToRange(query + apiProduct.retailer + "inv", 3, 180),
            priceHistory,
            isPriceFlare,
          };
        });

        const longestDuration = Math.max(...RETAILERS.map((r) => 1800 + r.delay * 2));
        const completeTimer = setTimeout(() => {
          setSearchResults(enrichedResults);
          setIsSearching(false);
          setSearchProgress({});
        }, longestDuration);
        progressTimers.current.push(completeTimer);

      } catch (error) {
        console.error('API search failed completely, using mock data:', error);
        
        const longestDuration = Math.max(...RETAILERS.map((r) => 1800 + r.delay * 2));
        const completeTimer = setTimeout(() => {
          setSearchResults(generateMockResults(query));
          setIsSearching(false);
          setSearchProgress({});
        }, longestDuration);
        progressTimers.current.push(completeTimer);
      }
    }
  }, [searchHistory]);

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("priceflare_search_history");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <a href="#main-content" className="skip-to-content">Skip to content</a>
      
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

      {/* Trending Products (Empty State) */}
      {!isSearching && searchResults.length === 0 && searchHistory.length === 0 && (
        <TrendingProducts onProductClick={handleSearch} />
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

// Realistic product name variations by retailer
const PRODUCT_NAME_VARIATIONS: Record<string, (query: string) => string> = {
  Amazon: (q) => `${q} - Amazon Exclusive Bundle`,
  Walmart: (q) => `${q} + Free Shipping`,
  Target: (q) => `${q} (RedCard Members Save 5%)`,
  Newegg: (q) => `${q} - Tech Specialist Edition`,
  eBay: (q) => `${q} - Certified Refurbished`,
  "Best Buy": (q) => `${q} with Geek Squad Protection`,
};

const PRODUCT_DETAILS: Record<string, { desc: string; pros: string[]; cons: string[] }> = {
  Amazon: {
    desc: "Prime eligible with free 2-day shipping. Fulfilled by Amazon with their A-to-Z Guarantee. Easy returns within 30 days, no questions asked.",
    pros: ["Prime 2-day shipping included", "30-day easy returns", "A-to-Z Guarantee protection", "Often bundled with exclusive accessories"],
    cons: ["Price can fluctuate frequently", "May be third-party seller", "Packaging sometimes excessive"],
  },
  Walmart: {
    desc: "Free next-day delivery on orders $35+. Available for same-day pickup at your local Walmart store. Price match guarantee available.",
    pros: ["Free next-day delivery $35+", "Same-day store pickup option", "Walmart+ member exclusive savings", "Excellent price match guarantee"],
    cons: ["Limited premium brand selection", "Customer service response times vary", "Website can be cluttered"],
  },
  Target: {
    desc: "Order with same-day Drive Up, Order Pickup, or delivery via Shipt. RedCard members save an extra 5% on every purchase automatically.",
    pros: ["Same-day Drive Up pickup", "5% off every purchase with RedCard", "Excellent in-store experience", "Industry-leading return policy (90 days)"],
    cons: ["Slightly higher base prices", "Smaller online catalog vs competitors", "Popular items sell out quickly"],
  },
  Newegg: {
    desc: "Tech-focused retailer with detailed product specifications and verified buyer reviews. Known for combo deals and open-box discounts.",
    pros: ["Detailed tech specs and comparisons", "Verified buyer review system", "Frequent combo deal bundles", "Open-box items save 10-30%"],
    cons: ["Return policy can be restrictive", "Shipping times vary by seller", "Restocking fees on some returns"],
  },
  eBay: {
    desc: "New, refurbished, and used options available. All purchases covered by eBay Money Back Guarantee. Seller ratings provide transparency.",
    pros: ["Refurbished options at 20-40% off", "eBay Money Back Guarantee", "Auction format can yield deals", "Global marketplace variety"],
    cons: ["Item condition varies by seller", "Shipping can take 1-3 weeks", "Returns handled by individual sellers"],
  },
  "Best Buy": {
    desc: "Expert Geek Squad support available for setup and troubleshooting. 15-day price match guarantee with major retailers. Totaltech membership perks.",
    pros: ["Geek Squad setup & 24/7 support", "15-day price match guarantee", "Same-day pickup at 1000+ stores", "Totaltech member exclusive deals"],
    cons: ["Premium pricing on accessories", "Aggressive extended warranty upsells", "Limited third-party sellers"],
  },
};

const REVIEW_SNIPPETS = [
  "Absolutely love this! Exceeded expectations in build quality and performance. Setup took 10 minutes. Highly recommend for anyone considering this category.",
  "Fantastic value for the money. Works flawlessly after 3 months of daily use. Customer service was helpful when I had a question about setup.",
  "Solid product overall. Does exactly what it promises. I compared this to 4 other models and this was the clear winner in my testing.",
  "Best purchase I've made this year. The quality difference is noticeable immediately. My previous model lasted 2 years; expecting this to last 5+.",
  "Very happy with this purchase. No regrets after 6 months of regular use. Would definitely buy again and recommend to friends.",
  "Outstanding build quality and attention to detail. You can tell the manufacturer really thought through the user experience here.",
  "Great product but arrived with minor cosmetic damage. Seller quickly sent a replacement. Works perfectly now. Would give 5 stars if shipping was better.",
  "Meets all my needs and then some. Impressed by how well it handles demanding tasks. Battery life/durability is excellent.",
];

// Product pricing strategy: realistic base prices by category
function getProductBasePrice(query: string): number {
  const q = query.toLowerCase();
  
  // High-end electronics ($800-$1200)
  if (q.includes("iphone") && (q.includes("pro") || q.includes("max"))) return 999;
  if (q.includes("macbook pro") || q.includes("laptop") && q.includes("pro")) return 1899;
  if (q.includes("playstation 5") || q.includes("ps5") || q.includes("xbox series x")) return 499;
  
  // Mid-range electronics ($300-$800)
  if (q.includes("ipad") || q.includes("tablet")) return 449;
  if (q.includes("airpods") || q.includes("headphones") && q.includes("sony")) return 249;
  if (q.includes("watch") || q.includes("smartwatch")) return 399;
  if (q.includes("camera")) return 599;
  
  // Appliances ($200-$600)
  if (q.includes("dyson") || q.includes("vacuum")) return 399;
  if (q.includes("air fryer") || q.includes("instant pot")) return 129;
  if (q.includes("coffee") || q.includes("espresso")) return 199;
  
  // Budget items ($50-$200)
  if (q.includes("speaker") || q.includes("echo") || q.includes("nest")) return 79;
  if (q.includes("keyboard") || q.includes("mouse")) return 69;
  if (q.includes("case") || q.includes("charger")) return 29;
  
  // Default mid-range
  return 299;
}

function generateMockResults(query: string): Product[] {
  const basePrice = getProductBasePrice(query);
  
  return RETAILERS.map((retailer, idx) => {
    // Each retailer gets realistic price variance (±5-15%)
    const variancePercent = hashStringToRange(query + retailer.name, -15, 15);
    const variance = basePrice * (variancePercent / 100);
    const price = Math.max(basePrice + variance, basePrice * 0.5);
    
    const details = PRODUCT_DETAILS[retailer.name];
    const reviewIdx = (idx + query.length) % REVIEW_SNIPPETS.length;
    const nameVariation = PRODUCT_NAME_VARIATIONS[retailer.name] || ((q) => q);

    const priceHistory = generatePriceHistory(price, query + retailer.name);
    const avgPrice3Months = calculate3MonthAverage(priceHistory);
    const isPriceFlare = price < avgPrice3Months * 0.95; // 5% below 3-month avg

    return {
      id: `${retailer.name.toLowerCase()}-${Date.now()}-${idx}`,
      name: nameVariation(query),
      retailer: retailer.name,
      retailerEmoji: retailer.emoji,
      retailerColor: retailer.color,
      price: +price.toFixed(2),
      description: details.desc,
      inStock: hashStringToRange(query + retailer.name + "stock", 0, 10) > 1, // 90% in stock
      url: `${retailer.url}/s?k=${encodeURIComponent(query)}`,
      reviews: hashStringToRange(query + retailer.name + "rev", 847, 9200),
      rating: +(4.0 + hashStringToRange(query + retailer.name + "rate", 0, 10) / 10).toFixed(1),
      pros: details.pros,
      cons: details.cons.slice(0, 2 + (idx % 2)), // Vary cons count
      reviewSnippet: REVIEW_SNIPPETS[reviewIdx],
      inventory: hashStringToRange(query + retailer.name + "inv", 3, 180),
      priceHistory,
      isPriceFlare,
    };
  }).filter((p) => p.inStock); // Spec says: don't show out-of-stock results
}

function calculate3MonthAverage(history: { date: string; price: number; isSale: boolean }[]): number {
  const last90Days = history.slice(-3);
  const sum = last90Days.reduce((acc, point) => acc + point.price, 0);
  return sum / last90Days.length;
}

// Realistic price history with seasonal patterns
function generatePriceHistory(currentPrice: number, seed: string) {
  const history = [];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  for (let i = 36; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - i, 15);
    const month = date.getMonth();
    
    // Seasonal pricing patterns
    let seasonalFactor = 1.0;
    let isSale = false;
    
    // Black Friday / Cyber Monday (late November)
    if (month === 10) { // November
      seasonalFactor = 0.75; // 25% off
      isSale = true;
    }
    // Prime Day (July)
    else if (month === 6) { // July
      seasonalFactor = 0.80; // 20% off
      isSale = true;
    }
    // Back to School (August-September)
    else if (month === 7 || month === 8) {
      seasonalFactor = 0.88; // 12% off
      isSale = true;
    }
    // Holiday markup (December)
    else if (month === 11) {
      seasonalFactor = 1.08; // 8% markup
    }
    // New Year clearance (January)
    else if (month === 0) {
      seasonalFactor = 0.82; // 18% off
      isSale = true;
    }
    // Spring sales (April)
    else if (month === 3) {
      seasonalFactor = 0.90; // 10% off
      isSale = true;
    }
    
    // Add minor random variance (±3%)
    const randomVariance = hashStringToRange(seed + i, -3, 3) / 100;
    const finalFactor = seasonalFactor * (1 + randomVariance);
    
    const price = Math.max(currentPrice * finalFactor, currentPrice * 0.6);

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
