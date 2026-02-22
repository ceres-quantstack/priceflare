"use client";

import { Search, TrendingUp } from "lucide-react";

interface TrendingProductsProps {
  onProductClick: (query: string) => void;
}

const TRENDING_PRODUCTS = [
  { name: "iPhone 16 Pro", emoji: "📱", category: "Phones" },
  { name: "MacBook Air M4", emoji: "💻", category: "Laptops" },
  { name: "PlayStation 5", emoji: "🎮", category: "Gaming" },
  { name: "Samsung Galaxy S25", emoji: "📱", category: "Phones" },
  { name: "AirPods Pro 3", emoji: "🎧", category: "Audio" },
  { name: "Nintendo Switch 2", emoji: "🎮", category: "Gaming" },
  { name: "Sony WH-1000XM6", emoji: "🎧", category: "Audio" },
  { name: "iPad Air M3", emoji: "📲", category: "Tablets" },
];

export default function TrendingProducts({ onProductClick }: TrendingProductsProps) {
  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-brand-500" />
        <h2 className="text-lg font-bold text-surface-800">Popular Searches</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TRENDING_PRODUCTS.map((product) => (
          <button
            key={product.name}
            onClick={() => onProductClick(product.name)}
            className="group bg-surface-50 hover:bg-brand-50 border border-surface-200 hover:border-brand-200 rounded-xl p-4 text-left transition-all duration-150 hover:shadow-card active:scale-[0.98]"
          >
            <span className="text-3xl mb-2 block">{product.emoji}</span>
            <h3 className="text-sm font-semibold text-surface-800 mb-1 leading-snug">
              {product.name}
            </h3>
            <p className="text-xs text-surface-400">{product.category}</p>
            <div className="flex items-center gap-1 mt-2 text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <Search className="w-3 h-3" />
              <span className="text-xs font-medium">Compare</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
