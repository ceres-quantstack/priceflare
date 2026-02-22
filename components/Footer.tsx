"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="glass-dark mt-16 border-t border-sky-blue/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold text-white">PriceFlare</span>
              <span className="text-2xl animate-fire-flicker">🔥</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Smart price tracking across major retailers. Never overpay again.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Search Products
                </Link>
              </li>
              <li>
                <Link
                  href="/alerts"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Price Alerts
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Retailers */}
          <div>
            <h3 className="text-white font-semibold mb-4">We Track</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>📦 Amazon</li>
              <li>🎯 Target</li>
              <li>🥚 Newegg</li>
              <li>🛒 eBay</li>
              <li>⚡ Best Buy</li>
            </ul>
          </div>

          {/* Privacy & Trust */}
          <div>
            <h3 className="text-white font-semibold mb-4">Our Promise</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-green-400 text-lg">✓</span>
                <p className="text-gray-300 text-sm">Privacy-focused</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400 text-lg">✓</span>
                <p className="text-gray-300 text-sm">No data stored</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400 text-lg">✓</span>
                <p className="text-gray-300 text-sm">Always free</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-sky-blue/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            © {currentYear} PriceFlare. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm flex items-center gap-2">
            Made with <Heart className="w-4 h-4 text-red-400 fill-red-400" /> for smart shoppers
          </p>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-white/5 rounded-xl">
          <p className="text-xs text-gray-400 leading-relaxed">
            <strong>Disclaimer:</strong> PriceFlare is an independent price comparison service. We are not affiliated with Amazon, Target, Newegg, eBay, or Best Buy. 
            Product prices and availability are subject to change. Always verify current pricing on the retailer's website before purchase.
          </p>
        </div>
      </div>
    </footer>
  );
}
