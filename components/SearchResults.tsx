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

  // Retailers excluded from best-deal calculations (add names here if unreliable)
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
    } catch {
      // Fallback
    }
  };

  return (
    <div className="space-y-6">
      {/* Comparison Table */}
      <ComparisonTable results={results} />

      {/* Best Deal Hero */}
      {lowestPriceProduct && lowestPriceProduct.price > 0 && (
        <div className="glass rounded-2xl p-6 border-2 border-green-400 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-bold text-dark-blue">Best Price Found</h2>
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
                {savings > 1 && (
                  <p className="text-sm text-green-700 font-medium mt-1">
                    Save ${savings.toFixed(2)} vs highest ({results.find(r => r.price === highestPrice)?.retailer})
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="glass px-4 py-3 rounded-xl font-semibold hover:bg-white/40 transition-all flex items-center gap-2 text-sm"
                aria-label="Copy price comparison"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
                {copied ? "Copied!" : "Share"}
              </button>
              <a
                href={lowestPriceProduct.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all duration-200 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                View Deal <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* All Retailers */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-dark-blue">
          All Results ({results.filter(r => r.price > 0).length} prices found)
        </h2>
        <div className="grid gap-3">
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
                  className={`glass rounded-xl p-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 result-stream-in flex items-center justify-between gap-4 group ${
                    isLowest ? "ring-2 ring-green-400/50 bg-green-50/30" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {product.image ? (
                      <img src={product.image} alt="" className="w-12 h-12 object-contain rounded-lg flex-shrink-0 bg-white p-1" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).replaceWith(Object.assign(document.createElement('span'), { className: 'text-3xl flex-shrink-0', textContent: product.retailerEmoji })); }} />
                    ) : (
                      <span className="text-3xl flex-shrink-0">{product.retailerEmoji}</span>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-dark-blue truncate text-sm md:text-base">
                        {product.name}
                      </p>
                      <p className="text-sm font-medium" style={{ color: product.retailerColor }}>
                        {product.retailer}
                        {isLowest && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                            BEST PRICE
                          </span>
                        )}
                        {product.source === 'fallback' && (
                          <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            search only
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {product.price > 0 ? (
                      <p className="text-2xl font-bold text-dark-blue">${product.price.toFixed(2)}</p>
                    ) : (
                      <p className="text-sm text-gray-400">No price</p>
                    )}
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-sky-blue transition-colors" />
                  </div>
                </a>
              );
            })}
        </div>
      </div>
    </div>
  );
}
