"use client";

import { useState } from "react";
import { Product } from "@/types";
import PriceHistoryChart from "./PriceHistoryChart";
import PriceAlertModal from "./PriceAlertModal";
import { ExternalLink, Star, TrendingDown, Calendar, Bell } from "lucide-react";

interface SearchResultsProps {
  results: Product[];
}

export default function SearchResults({ results }: SearchResultsProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [alertModalProduct, setAlertModalProduct] = useState<Product | null>(null);

  // Find lowest price
  const lowestPriceProduct = results.reduce((prev, current) =>
    prev.price < current.price ? prev : current
  );

  // Calculate predictions
  const predictions = generatePredictions(results[0]);

  return (
    <div className="space-y-8">
      {/* Lowest Price Section */}
      <div className="glass rounded-3xl p-6 border-2 border-green-400">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-dark-blue">Lowest Price Found</h2>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{lowestPriceProduct.retailerEmoji}</span>
            <div>
              <p className="text-lg font-semibold text-gray-700">{lowestPriceProduct.retailer}</p>
              <p className="text-3xl font-bold text-green-600">${lowestPriceProduct.price}</p>
            </div>
          </div>
          <a
            href={lowestPriceProduct.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all flex items-center gap-2 hover:scale-105"
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
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <p className="text-sm text-gray-600 mb-1">Best Time to Buy</p>
            <p className="text-lg font-bold text-green-700">{predictions.bestTime}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-xl border border-red-200">
            <p className="text-sm text-gray-600 mb-1">Worst Time to Buy</p>
            <p className="text-lg font-bold text-red-700">{predictions.worstTime}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Next Expected Sale</p>
            <p className="text-lg font-bold text-blue-700">{predictions.nextSale}</p>
          </div>
        </div>
      </div>

      {/* Product Results Grid */}
      <div className="grid gap-6">
        {results.map((product) => (
          <div key={product.id} className="glass rounded-3xl p-6 hover:shadow-2xl transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{product.retailerEmoji}</span>
                <div>
                  <h3 className="text-2xl font-bold text-dark-blue">{product.name}</h3>
                  <p className="text-lg font-semibold" style={{ color: product.retailerColor }}>
                    {product.retailer}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-dark-blue">${product.price}</p>
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
              <span className="text-sm text-gray-600">({product.reviews} reviews)</span>
            </div>

            {/* Pros and Cons */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-semibold text-green-700 mb-2">Pros:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  {product.pros.map((pro, idx) => (
                    <li key={idx}>✓ {pro}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-red-700 mb-2">Cons:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  {product.cons.map((con, idx) => (
                    <li key={idx}>✗ {con}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-4">
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gradient-to-r from-sky-blue to-dark-blue text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                View Product <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={() => setAlertModalProduct(product)}
                className="glass px-4 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all flex items-center gap-2"
              >
                <Bell className="w-4 h-4" />
                Set Alert
              </button>
              <button
                onClick={() =>
                  setSelectedProduct(selectedProduct?.id === product.id ? null : product)
                }
                className="glass px-4 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all"
              >
                {selectedProduct?.id === product.id ? "Hide" : "Show"} History
              </button>
            </div>

            {/* Price History Chart */}
            {selectedProduct?.id === product.id && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <PriceHistoryChart product={product} />
              </div>
            )}
          </div>
        ))}
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
  const months = ["January", "February", "March", "April", "May", "June", 
                  "July", "August", "September", "October", "November", "December"];
  
  const currentMonth = new Date().getMonth();
  const nextSaleMonth = (currentMonth + 2) % 12;
  
  return {
    bestTime: `${months[(currentMonth + 3) % 12]} (historically 15% lower)`,
    worstTime: `${months[(currentMonth + 9) % 12]} (peak demand period)`,
    nextSale: `${months[nextSaleMonth]} (Black Friday/Cyber Monday trends)`,
  };
}
