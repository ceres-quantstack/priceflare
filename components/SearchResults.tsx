"use client";

import { useState } from "react";
import { Product } from "@/types";
import ComparisonTable from "./ComparisonTable";
import { ExternalLink, TrendingDown, Share2, Check } from "lucide-react";

interface SearchResultsProps {
  results: Product[];
}

export default function SearchResults({ results }: SearchResultsProps) {
  const [copied, setCopied] = useState(false);

  const EXCLUDED_FROM_BEST_DEAL: string[] = [];
  const eligibleResults = results.filter(p => !EXCLUDED_FROM_BEST_DEAL.includes(p.retailer) && p.price > 0);
  const bestDealPool = eligibleResults.length > 0 ? eligibleResults : results.filter(p => p.price > 0);

  const lowestPriceProduct = bestDealPool.length > 0
    ? bestDealPool.reduce((prev, current) => prev.price < current.price ? prev : current)
    : null;

  const highestPrice = bestDealPool.length > 0 ? Math.max(...bestDealPool.map(p => p.price)) : 0;
  const savings = lowestPriceProduct ? highestPrice - lowestPriceProduct.price : 0;

  const handleShare = async () => {
    const productName = results[0]?.name || "product";
    const priceList = results
      .filter(r => r.price > 0)
      .sort((a, b) => a.price - b.price)
      .map(r => `${r.retailerEmoji} ${r.retailer}: $${r.price.toFixed(2)}`)
      .join("\n");
    const text = `${productName} — Price Comparison\n\n${priceList}\n\nFound on PriceFlare 🔥`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Comparison Table */}
      <ComparisonTable results={results} />

      {/* Best Deal Hero */}
      {lowestPriceProduct && lowestPriceProduct.price > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-green-200 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-surface-800">Best Price Found</h2>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{lowestPriceProduct.retailerEmoji}</span>
              <div>
                <p className="text-sm font-medium text-surface-500">
                  {lowestPriceProduct.retailer}
                </p>
                <p className="text-3xl font-bold text-green-600">
                  ${lowestPriceProduct.price.toFixed(2)}
                </p>
                {savings > 1 && (
                  <p className="text-sm text-green-600 font-medium mt-0.5">
                    Save ${savings.toFixed(2)} vs {results.find(r => r.price === highestPrice)?.retailer}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="px-4 py-2.5 rounded-xl border border-surface-200 bg-white font-medium hover:bg-surface-50 transition-colors flex items-center gap-2 text-sm text-surface-600"
                aria-label="Copy price comparison"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                {copied ? "Copied!" : "Share"}
              </button>
              <a
                href={lowestPriceProduct.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700 active:scale-[0.97] transition-all flex items-center gap-2 text-sm"
              >
                View Deal <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* All Retailers */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-surface-500 uppercase tracking-wider px-1">
          All Results ({results.filter(r => r.price > 0).length} prices found)
        </h2>
        <div className="grid gap-2">
          {results
            .sort((a, b) => {
              if (!a.price && !b.price) return 0;
              if (!a.price) return 1;
              if (!b.price) return -1;
              return a.price - b.price;
            })
            .map((product) => {
              const isLowest = lowestPriceProduct && product.price === lowestPriceProduct.price &&
                               product.retailer === lowestPriceProduct.retailer;

              return (
                <a
                  key={product.id}
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`bg-white rounded-xl p-4 border transition-all duration-150 hover:shadow-card-hover hover:-translate-y-px result-stream-in flex items-center justify-between gap-4 group ${
                    isLowest ? "border-green-200 bg-green-50/30" : "border-surface-200"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {product.image ? (
                      <img src={product.image} alt="" className="w-11 h-11 object-contain rounded-lg flex-shrink-0 bg-surface-50 p-1" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).replaceWith(Object.assign(document.createElement('span'), { className: 'text-2xl flex-shrink-0', textContent: product.retailerEmoji })); }} />
                    ) : (
                      <span className="text-2xl flex-shrink-0">{product.retailerEmoji}</span>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-surface-800 truncate text-sm">
                        {product.name}
                      </p>
                      <p className="text-xs font-medium mt-0.5" style={{ color: product.retailerColor }}>
                        {product.retailer}
                        {isLowest && (
                          <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold uppercase">
                            Best Price
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {product.price > 0 ? (
                      <p className="text-xl font-bold text-surface-900">${product.price.toFixed(2)}</p>
                    ) : (
                      <p className="text-sm text-surface-400">No price</p>
                    )}
                    <ExternalLink className="w-4 h-4 text-surface-300 group-hover:text-brand-500 transition-colors" />
                  </div>
                </a>
              );
            })}
        </div>
      </div>
    </div>
  );
}
