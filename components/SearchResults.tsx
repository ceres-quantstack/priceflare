"use client";

import { useState } from "react";
import { Product } from "@/types";
import PriceHistoryChart from "./PriceHistoryChart";
import PriceAlertModal from "./PriceAlertModal";
import ComparisonTable from "./ComparisonTable";
import { ExternalLink, Star, TrendingDown, Calendar, Bell, ChevronDown, ChevronUp } from "lucide-react";

interface SearchResultsProps {
  results: Product[];
}

export default function SearchResults({ results }: SearchResultsProps) {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [alertModalProduct, setAlertModalProduct] = useState<Product | null>(null);

  // Retailers excluded from best-deal calculations (add names here if price data is unreliable)
  const EXCLUDED_FROM_BEST_DEAL: string[] = [];
  const eligibleResults = results.filter(p => !EXCLUDED_FROM_BEST_DEAL.includes(p.retailer));
  const bestDealPool = eligibleResults.length > 0 ? eligibleResults : results;

  // Find lowest price (excluding unreliable retailers)
  const lowestPriceProduct = bestDealPool.reduce((prev, current) =>
    prev.price < current.price ? prev : current
  );

  // Calculate savings
  const highestPrice = Math.max(...bestDealPool.map((p) => p.price));
  const savings = highestPrice - lowestPriceProduct.price;

  // Calculate predictions
  const predictions = generatePredictions(results[0]);

  return (
    <div className="space-y-8">
      {/* Comparison Table */}
      <ComparisonTable results={results} />

      {/* Lowest Price Section */}
      <div className="glass rounded-3xl p-6 border-2 border-green-400 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-dark-blue">Lowest Price Found</h2>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{lowestPriceProduct.retailerEmoji}</span>
            <div>
              <p className="text-lg font-semibold text-gray-700">
                {lowestPriceProduct.retailer}
              </p>
              <p className="text-4xl font-bold text-green-600">
                ${lowestPriceProduct.price.toFixed(2)}
              </p>
              {savings > 0 && (
                <p className="text-sm text-green-700 font-medium mt-1">
                  Save ${savings.toFixed(2)} vs highest price
                </p>
              )}
            </div>
          </div>
          <a
            href={lowestPriceProduct.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all duration-200 flex items-center gap-2 hover:scale-[1.03] active:scale-[0.98]"
            aria-label={`View deal at ${lowestPriceProduct.retailer}`}
          >
            View on {lowestPriceProduct.retailer} <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Purchase Predictions */}
      <div className="glass rounded-3xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-6 h-6 text-sky-blue" />
          <h2 className="text-2xl font-bold text-dark-blue">Purchase Predictions</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-5 rounded-xl border border-green-200">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Best Time to Buy
            </p>
            <p className="text-lg font-bold text-green-700">{predictions.bestTime}</p>
            <p className="text-xs text-gray-500 mt-1">Based on 3-year price trends</p>
          </div>
          <div className="bg-red-50 p-5 rounded-xl border border-red-200">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Worst Time to Buy
            </p>
            <p className="text-lg font-bold text-red-700">{predictions.worstTime}</p>
            <p className="text-xs text-gray-500 mt-1">Peak demand, highest prices</p>
          </div>
          <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Next Expected Sale
            </p>
            <p className="text-lg font-bold text-blue-700">{predictions.nextSale}</p>
            <p className="text-xs text-gray-500 mt-1">🔥 PriceFlare incoming!</p>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-dark-blue">
          All Retailers ({results.length} results)
        </h2>
        {results.map((product) => {
          const isLowest = product.id === lowestPriceProduct.id;
          const isExpanded = selectedProduct === product.id;
          const isReviewExpanded = expandedReview === product.id;

          return (
            <div
              key={product.id}
              className={`glass rounded-3xl p-6 transition-all duration-200 hover:shadow-2xl hover:-translate-y-1 result-stream-in ${
                isLowest ? "ring-2 ring-green-400/50" : ""
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4 gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-4xl flex-shrink-0">{product.retailerEmoji}</span>
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-dark-blue truncate">
                      {product.name}
                    </h3>
                    <p
                      className="text-base font-semibold"
                      style={{ color: product.retailerColor }}
                    >
                      {product.retailer}
                      {isLowest && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                          LOWEST
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <p className="text-3xl font-bold text-dark-blue">${product.price.toFixed(2)}</p>
                    {product.isPriceFlare && (
                      <div className="relative">
                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          🔥 PriceFlare!
                        </span>
                        <span className="absolute inset-0 rounded-full bg-orange-400 opacity-50 animate-ping"></span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-green-600 font-medium">In Stock ✓</p>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{product.description}</p>

              {/* Rating and Reviews */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm font-semibold">{product.rating}</span>
                </div>
                <span className="text-sm text-gray-600">({product.reviews.toLocaleString()} reviews)</span>
              </div>

              {/* Review Snippet - Expandable */}
              <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span>💬</span> Top Customer Review
                </p>
                <p className="text-sm text-gray-700 italic">
                  "{isReviewExpanded ? product.reviewSnippet : product.reviewSnippet.slice(0, 120) + "..."}"
                </p>
                {product.reviewSnippet.length > 120 && (
                  <button
                    onClick={() => setExpandedReview(isReviewExpanded ? null : product.id)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold mt-2 flex items-center gap-1"
                    aria-label={isReviewExpanded ? "Show less" : "Show more"}
                  >
                    {isReviewExpanded ? (
                      <>
                        Show less <ChevronUp className="w-3 h-3" />
                      </>
                    ) : (
                      <>
                        Read more <ChevronDown className="w-3 h-3" />
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Pros and Cons */}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-semibold text-green-700 mb-2">✓ Pros:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {product.pros.map((pro, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-600 flex-shrink-0">✓</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-700 mb-2">✗ Cons:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {product.cons.map((con, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-600 flex-shrink-0">✗</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-4 flex-wrap">
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[200px] bg-gradient-to-r from-sky-blue to-dark-blue text-white px-4 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                  aria-label={`View ${product.name} at ${product.retailer}`}
                >
                  View on {product.retailer} <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setAlertModalProduct(product)}
                  className="glass px-4 py-3 rounded-xl font-semibold hover:bg-white/40 transition-all flex items-center gap-2"
                  aria-label="Set price alert"
                >
                  <Bell className="w-4 h-4" />
                  Set Alert
                </button>
                <button
                  onClick={() => setSelectedProduct(isExpanded ? null : product.id)}
                  className="glass px-4 py-3 rounded-xl font-semibold hover:bg-white/40 transition-all"
                  aria-label={isExpanded ? "Hide price history" : "Show price history"}
                >
                  {isExpanded ? "Hide" : "Show"} History
                </button>
              </div>

              {/* Price History Chart */}
              {isExpanded && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <PriceHistoryChart product={product} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Price Alert Modal */}
      {alertModalProduct && (
        <PriceAlertModal
          product={alertModalProduct}
          onClose={() => setAlertModalProduct(null)}
        />
      )}
    </div>
  );
}

function generatePredictions(product: Product) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentMonth = new Date().getMonth();

  // Best time: Black Friday (November) or Prime Day (July)
  const bestMonth = currentMonth < 6 ? 6 : 10; // July or November
  const worstMonth = (currentMonth + 5) % 12; // 5 months from now
  const nextSaleMonth = currentMonth === 10 ? 11 : (currentMonth < 6 ? 6 : 10);

  return {
    bestTime: `${months[bestMonth]} (Black Friday/Prime Day sales)`,
    worstTime: `${months[worstMonth]} (peak demand period)`,
    nextSale: `${months[nextSaleMonth]} ${nextSaleMonth === 6 ? "(Prime Day)" : nextSaleMonth === 10 ? "(Black Friday)" : ""}`,
  };
}
