"use client";

import { Product } from "@/types";
import { ExternalLink, Crown } from "lucide-react";

interface ComparisonTableProps {
  results: Product[];
}

export default function ComparisonTable({ results }: ComparisonTableProps) {
  const EXCLUDED_FROM_BEST_DEAL: string[] = [];

  const sortedResults = [...results].sort((a, b) => {
    if (!a.price && !b.price) return 0;
    if (!a.price) return 1;
    if (!b.price) return -1;
    return a.price - b.price;
  });

  const resultsWithPrice = sortedResults.filter((p) => p.price);
  const eligibleResults = resultsWithPrice.filter(p => !EXCLUDED_FROM_BEST_DEAL.includes(p.retailer));
  const bestDealPool = eligibleResults.length > 0 ? eligibleResults : resultsWithPrice;
  const lowestPrice = bestDealPool[0]?.price || 0;
  const highestPrice = bestDealPool[bestDealPool.length - 1]?.price || 0;
  const savings = highestPrice - lowestPrice;
  const savingsPercent = highestPrice > 0 ? ((savings / highestPrice) * 100).toFixed(0) : 0;

  const lowestRetailer = bestDealPool[0]?.retailer || "N/A";
  const highestRetailer = bestDealPool[bestDealPool.length - 1]?.retailer || "N/A";

  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-xl">💰</span>
        <h2 className="text-lg font-bold text-surface-800">Price Comparison</h2>
      </div>

      {/* Summary Stats */}
      {resultsWithPrice.length > 1 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-green-50 p-3 rounded-xl border border-green-100">
            <p className="text-[10px] text-surface-500 uppercase tracking-wider font-semibold mb-1">Lowest</p>
            <p className="text-xl font-bold text-green-700">${lowestPrice.toFixed(2)}</p>
            <p className="text-xs text-surface-500 mt-0.5">{lowestRetailer}</p>
          </div>
          <div className="bg-red-50 p-3 rounded-xl border border-red-100">
            <p className="text-[10px] text-surface-500 uppercase tracking-wider font-semibold mb-1">Highest</p>
            <p className="text-xl font-bold text-red-600">${highestPrice.toFixed(2)}</p>
            <p className="text-xs text-surface-500 mt-0.5">{highestRetailer}</p>
          </div>
          <div className="bg-brand-50 p-3 rounded-xl border border-brand-100">
            <p className="text-[10px] text-surface-500 uppercase tracking-wider font-semibold mb-1">You Save</p>
            <p className="text-xl font-bold text-brand-600">${savings.toFixed(2)}</p>
            <p className="text-xs text-surface-500 mt-0.5">{savingsPercent}% off</p>
          </div>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-200">
              <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-surface-500 uppercase tracking-wider">Retailer</th>
              <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-surface-500 uppercase tracking-wider">Product</th>
              <th className="text-right py-2.5 px-3 text-[11px] font-semibold text-surface-500 uppercase tracking-wider">Price</th>
              <th className="text-center py-2.5 px-3 text-[11px] font-semibold text-surface-500 uppercase tracking-wider">Link</th>
            </tr>
          </thead>
          <tbody>
            {resultsWithPrice.map((product, index) => {
              const isLowest = index === 0 && !EXCLUDED_FROM_BEST_DEAL.includes(product.retailer);
              const savingsVsHighest = highestPrice - product.price;

              return (
                <tr
                  key={product.id}
                  className={`border-b border-surface-100 transition-colors hover:bg-surface-50 ${
                    isLowest ? "bg-green-50/40" : ""
                  }`}
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{product.retailerEmoji}</span>
                      <span className="font-semibold text-sm" style={{ color: product.retailerColor }}>
                        {product.retailer}
                      </span>
                      {isLowest && (
                        <span className="flex items-center gap-1 bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                          <Crown className="w-3 h-3" /> Best
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-sm text-surface-600 max-w-xs truncate">
                    {product.name}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <p className="text-lg font-bold text-surface-900">${product.price.toFixed(2)}</p>
                    {isLowest && savingsVsHighest > 0 && (
                      <p className="text-[11px] text-green-600 font-medium">Save ${savingsVsHighest.toFixed(2)}</p>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-brand-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-brand-600 active:scale-[0.97] transition-all text-xs"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {resultsWithPrice.map((product, index) => {
          const isLowest = index === 0 && !EXCLUDED_FROM_BEST_DEAL.includes(product.retailer);
          const savingsVsHighest = highestPrice - product.price;

          return (
            <div
              key={product.id}
              className={`p-3.5 rounded-xl border ${
                isLowest ? "border-green-300 bg-green-50/40" : "border-surface-200"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{product.retailerEmoji}</span>
                  <div>
                    <p className="font-bold text-sm" style={{ color: product.retailerColor }}>
                      {product.retailer}
                    </p>
                    {isLowest && (
                      <span className="flex items-center gap-1 bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full text-[10px] font-bold mt-1 w-fit">
                        <Crown className="w-3 h-3" /> Best Deal
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-surface-900">${product.price.toFixed(2)}</p>
                  {isLowest && savingsVsHighest > 0 && (
                    <p className="text-[11px] text-green-600 font-medium">Save ${savingsVsHighest.toFixed(2)}</p>
                  )}
                </div>
              </div>
              <p className="text-xs text-surface-600 mb-2.5 line-clamp-2">{product.name}</p>
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-brand-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-600 active:scale-[0.97] transition-all text-xs"
              >
                View on {product.retailer} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
