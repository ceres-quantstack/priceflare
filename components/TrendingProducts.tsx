"use client";

import { Search } from "lucide-react";

interface TrendingProductsProps {
  onProductClick: (query: string) => void;
}

const TRENDING_PRODUCTS = [
  { name: "iPhone 16 Pro", emoji: "📱", priceRange: "$999 - $1,199", gradient: "from-blue-500 to-purple-500" },
  { name: "MacBook Air M4", emoji: "💻", priceRange: "$1,099 - $1,499", gradient: "from-gray-500 to-blue-600" },
  { name: "PlayStation 5", emoji: "🎮", priceRange: "$449 - $549", gradient: "from-blue-600 to-indigo-700" },
  { name: "Samsung Galaxy S25", emoji: "📱", priceRange: "$799 - $999", gradient: "from-indigo-500 to-purple-600" },
  { name: "AirPods Pro 3", emoji: "🎧", priceRange: "$199 - $279", gradient: "from-gray-600 to-gray-800" },
  { name: "Nintendo Switch 2", emoji: "🎮", priceRange: "$349 - $399", gradient: "from-red-500 to-red-700" },
  { name: "Sony WH-1000XM6", emoji: "🎧", priceRange: "$299 - $399", gradient: "from-purple-500 to-pink-500" },
  { name: "iPad Air M3", emoji: "📱", priceRange: "$599 - $749", gradient: "from-sky-500 to-blue-600" },
];

export default function TrendingProducts({ onProductClick }: TrendingProductsProps) {
  return (
    <div className="glass rounded-3xl p-8 md:p-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-dark-blue mb-3 flex items-center justify-center gap-2">
          <span className="animate-fire-flicker">🔥</span> Trending Products
        </h2>
        <p className="text-gray-600 text-lg">
          Click to compare prices across retailers
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TRENDING_PRODUCTS.map((product) => (
          <button
            key={product.name}
            onClick={() => onProductClick(product.name)}
            className="group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.05] hover:shadow-2xl active:scale-[0.98]"
          >
            {/* Gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${product.gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />
            
            {/* Content */}
            <div className="relative z-10">
              {/* Emoji Icon */}
              <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                {product.emoji}
              </div>
              
              {/* Product Name */}
              <h3 className="text-lg font-bold text-white mb-2 leading-tight">
                {product.name}
              </h3>
              
              {/* Price Range */}
              <p className="text-sm text-white/90 mb-4 font-medium">
                {product.priceRange}
              </p>
              
              {/* Search Button */}
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <Search className="w-4 h-4" />
                <span>Search Prices</span>
              </div>
            </div>

            {/* Hover shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
        ))}
      </div>

      {/* Bottom Note */}
      <div className="mt-8 text-center text-sm text-gray-500">
        Updated hourly based on search trends and seasonal demand
      </div>
    </div>
  );
}
