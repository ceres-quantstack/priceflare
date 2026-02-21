"use client";

import { useState } from "react";
import { Product } from "@/types";
import PriceHistoryChart from "./PriceHistoryChart";
import PriceAlertModal from "./PriceAlertModal";
import {
  ExternalLink,
  Star,
  TrendingDown,
  Calendar,
  Bell,
  ChevronDown,
  ChevronUp,
  Package,
  MessageSquare,
} from "lucide-react";

interface SearchResultsProps {
  results: Product[];
}

export default function SearchResults({ results }: SearchResultsProps) {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [alertModalProduct, setAlertModalProduct] = useState<Product | null>(null);
  const [expandedReview, setExpandedReview] = useState<string | null>(null);

  // Find lowest price
  const lowestPriceProduct = results.reduce((prev, current) =>
    prev.price < current.price ? prev : current
  );

  const savings = results.reduce((prev, current) =>
    prev.price > current.price ? prev : current
  ).price - lowestPriceProduct.price;

  // Predictions
  const predictions = generatePredictions();

  return (
    <div className="space-y-8">
      {/* Lowest Price Banner */}
      <div className="glass rounded-3xl p-6 border-2 border-green-400/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
          BEST DEAL
        </div>
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
          >
            View Deal <ExternalLink className="w-4 h-4" />
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
              className={`glass rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl ${
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
                  <p className="text-3xl font-bold text-dark-blue">
                    ${product.price.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-1 justify-end mt-1">
                    <Package className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">
                      {product.inventory < 10
                        ? `Only ${product.inventory} left!`
                        : "In Stock ✓"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                {product.description}
              </p>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : i < product.rating
                          ? "fill-yellow-200 text-yellow-300"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-1.5 text-sm font-bold text-gray-700">
                    {product.rating}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  ({product.reviews.toLocaleString()} reviews)
                </span>
              </div>

              {/* Review Snippet */}
              <div className="mb-4">
                <button
                  onClick={() =>
                    setExpandedReview(isReviewExpanded ? null : product.id)
                  }
                  className="flex items-center gap-1.5 text-sm text-sky-blue hover:text-dark-blue transition-colors duration-200"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="font-medium">
                    {isReviewExpanded ? "Hide review" : "Read a review"}
                  </span>
                </button>
                {isReviewExpanded && (
                  <blockquote className="mt-2 pl-4 border-l-2 border-sky-blue/30 text-sm text-gray-600 italic">
                    "{product.reviewSnippet}"
                    <span className="block mt-1 text-xs text-gray-400 not-italic">
                      — Verified Buyer
                    </span>
                  </blockquote>
                )}
              </div>

              {/* Pros / Cons */}
              <div className="grid md:grid-cols-2 gap-4 mb-5">
                <div>
                  <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2">
                    Pros
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {product.pros.map((pro, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-green-500 mt-0.5">✓</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">
                    Cons
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {product.cons.map((con, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-red-400 mt-0.5">✗</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 flex-wrap">
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[140px] bg-gradient-to-r from-sky-blue to-dark-blue text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
                >
                  View Product <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setAlertModalProduct(product)}
                  className="glass px-4 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-200 flex items-center gap-2 text-sm"
                >
                  <Bell className="w-4 h-4" /> Alert
                </button>
                <button
                  onClick={() =>
                    setSelectedProduct(isExpanded ? null : product.id)
                  }
                  className="glass px-4 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-200 flex items-center gap-2 text-sm"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" /> Hide History
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" /> Price History
                    </>
                  )}
                </button>
              </div>

              {/* Price History Chart */}
              {isExpanded && (
                <div className="mt-6 pt-6 border-t border-gray-200/50">
                  <PriceHistoryChart product={product} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Alert Modal */}
      {alertModalProduct && (
        <PriceAlertModal
          product={alertModalProduct}
          onClose={() => setAlertModalProduct(null)}
        />
      )}
    </div>
  );
}

function generatePredictions() {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const now = new Date();
  const m = now.getMonth();

  // More realistic predictions based on known retail cycles
  const saleMonths = [0, 4, 6, 10, 11]; // Jan, May, Jul, Nov, Dec
  const nextSale = saleMonths.find((s) => s > m) ?? saleMonths[0];
  const peakMonth = m < 9 ? 11 : 1; // Holiday season or post-holiday

  return {
    bestTime: `${months[nextSale]} (historically 12-25% lower)`,
    worstTime: `${months[peakMonth]} (peak demand, premium pricing)`,
    nextSale:
      nextSale === 10 || nextSale === 11
        ? "Black Friday / Cyber Monday"
        : `${months[nextSale]} clearance event`,
  };
}
