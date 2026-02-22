"use client";

import { Product } from "@/types";
import { ExternalLink, Crown } from "lucide-react";

interface ComparisonTableProps {
  results: Product[];
}

export default function ComparisonTable({ results }: ComparisonTableProps) {
  // Exclude Target from best-deal calculations (price accuracy unreliable)
  const EXCLUDED_FROM_BEST_DEAL = ['Target'];

  // Sort results by price (lowest first)
  const sortedResults = [...results].sort((a, b) => {
    // Put products without prices at the end
    if (!a.price && !b.price) return 0;
    if (!a.price) return 1;
    if (!b.price) return -1;
    return a.price - b.price;
  });

  const resultsWithPrice = sortedResults.filter((p) => p.price);
  const resultsWithoutPrice = sortedResults.filter((p) => !p.price);

  // Calculate summary statistics (excluding unreliable retailers)
  const eligibleResults = resultsWithPrice.filter(p => !EXCLUDED_FROM_BEST_DEAL.includes(p.retailer));
  const bestDealPool = eligibleResults.length > 0 ? eligibleResults : resultsWithPrice;
  const lowestPrice = bestDealPool[0]?.price || 0;
  const highestPrice = bestDealPool[bestDealPool.length - 1]?.price || 0;
  const savings = highestPrice - lowestPrice;
  const savingsPercent = highestPrice > 0 ? ((savings / highestPrice) * 100).toFixed(0) : 0;

  const lowestRetailer = bestDealPool[0]?.retailer || "N/A";
  const highestRetailer = bestDealPool[bestDealPool.length - 1]?.retailer || "N/A";

  return (
    <div className="glass rounded-3xl p-6 mb-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">💰</span>
        <h2 className="text-2xl font-bold text-dark-blue">Price Comparison</h2>
      </div>

      {/* Summary Bar */}
      {resultsWithPrice.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Lowest Price
            </p>
            <p className="text-2xl font-bold text-green-700">
              ${lowestPrice.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 mt-1">at {lowestRetailer}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-xl border border-red-200">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Highest Price
            </p>
            <p className="text-2xl font-bold text-red-700">
              ${highestPrice.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 mt-1">at {highestRetailer}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              You Save
            </p>
            <p className="text-2xl font-bold text-blue-700">
              ${savings.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              ({savingsPercent}% off highest)
            </p>
          </div>
        </div>
      )}

      {/* Comparison Table - Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Retailer
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Product Name
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Price
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Link
              </th>
            </tr>
          </thead>
          <tbody>
            {resultsWithPrice.map((product, index) => {
              const isLowest = index === 0 && !EXCLUDED_FROM_BEST_DEAL.includes(product.retailer);
              const savingsVsHighest = highestPrice - product.price;

              return (
                <tr
                  key={product.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-white/50 ${
                    isLowest ? "bg-green-50/50" : ""
                  }`}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{product.retailerEmoji}</span>
                      <span className="font-semibold" style={{ color: product.retailerColor }}>
                        {product.retailer}
                      </span>
                      {isLowest && (
                        <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">
                          <Crown className="w-3 h-3" />
                          Best Deal
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-700 max-w-md truncate">
                    {product.name}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div>
                      <p className="text-xl font-bold text-dark-blue">
                        ${product.price.toFixed(2)}
                      </p>
                      {isLowest && savingsVsHighest > 0 && (
                        <p className="text-xs text-green-600 font-medium">
                          Save ${savingsVsHighest.toFixed(2)} vs highest
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-blue to-dark-blue text-white px-4 py-2 rounded-lg font-semibold hover:scale-105 transition-transform text-sm"
                    >
                      View <ExternalLink className="w-4 h-4" />
                    </a>
                  </td>
                </tr>
              );
            })}
            {resultsWithoutPrice.map((product) => (
              <tr
                key={product.id}
                className="border-b border-gray-100 transition-colors hover:bg-white/50"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{product.retailerEmoji}</span>
                    <span className="font-semibold" style={{ color: product.retailerColor }}>
                      {product.retailer}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-700 max-w-md truncate">
                  {product.name}
                </td>
                <td className="py-4 px-4 text-right">
                  <p className="text-sm text-gray-500 italic">Price unavailable</p>
                </td>
                <td className="py-4 px-4 text-center">
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 glass px-4 py-2 rounded-lg font-semibold hover:bg-white/40 transition-all text-sm"
                  >
                    Check Price <ExternalLink className="w-4 h-4" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Comparison Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {resultsWithPrice.map((product, index) => {
          const isLowest = index === 0 && !EXCLUDED_FROM_BEST_DEAL.includes(product.retailer);
          const savingsVsHighest = highestPrice - product.price;

          return (
            <div
              key={product.id}
              className={`p-4 rounded-xl border-2 ${
                isLowest ? "border-green-400 bg-green-50/50" : "border-gray-200 bg-white/50"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{product.retailerEmoji}</span>
                  <div>
                    <p className="font-bold" style={{ color: product.retailerColor }}>
                      {product.retailer}
                    </p>
                    {isLowest && (
                      <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold mt-1">
                        <Crown className="w-3 h-3" />
                        Best Deal
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-dark-blue">
                    ${product.price.toFixed(2)}
                  </p>
                  {isLowest && savingsVsHighest > 0 && (
                    <p className="text-xs text-green-600 font-medium">
                      Save ${savingsVsHighest.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3 line-clamp-2">{product.name}</p>
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-blue to-dark-blue text-white px-4 py-2 rounded-lg font-semibold hover:scale-[1.02] transition-transform text-sm"
              >
                View on {product.retailer} <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          );
        })}
        {resultsWithoutPrice.map((product) => (
          <div
            key={product.id}
            className="p-4 rounded-xl border-2 border-gray-200 bg-white/50"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{product.retailerEmoji}</span>
                <p className="font-bold" style={{ color: product.retailerColor }}>
                  {product.retailer}
                </p>
              </div>
              <p className="text-sm text-gray-500 italic">No price</p>
            </div>
            <p className="text-sm text-gray-700 mb-3 line-clamp-2">{product.name}</p>
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 glass px-4 py-2 rounded-lg font-semibold hover:bg-white/40 transition-all text-sm"
            >
              Check Price on {product.retailer} <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
