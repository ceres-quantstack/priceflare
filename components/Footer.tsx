"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-surface-200 mt-16 bg-white">
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-lg font-bold text-surface-900">Price<span className="text-brand-500">Flare</span></span>
              <span className="text-lg">🔥</span>
            </div>
            <p className="text-sm text-surface-500 leading-relaxed">
              Real-time price comparison across major retailers.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs font-semibold text-surface-800 uppercase tracking-wider mb-3">Pages</h3>
            <ul className="space-y-2">
              {[
                { name: "Search", href: "/" },
                { name: "Alerts", href: "/alerts" },
                { name: "About", href: "/about" },
                { name: "Contact", href: "/contact" },
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-surface-500 hover:text-surface-800 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Retailers */}
          <div>
            <h3 className="text-xs font-semibold text-surface-800 uppercase tracking-wider mb-3">We Track</h3>
            <ul className="space-y-2 text-sm text-surface-500">
              <li>📦 Amazon</li>
              <li>🎯 Target</li>
              <li>🥚 Newegg</li>
              <li>🛒 eBay</li>
              <li>⚡ Best Buy</li>
            </ul>
          </div>

          {/* Trust */}
          <div>
            <h3 className="text-xs font-semibold text-surface-800 uppercase tracking-wider mb-3">Our Promise</h3>
            <div className="space-y-2">
              {["Privacy-focused", "No data stored", "Always free"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center text-[10px] text-green-600">✓</span>
                  <p className="text-sm text-surface-500">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-surface-100 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-surface-400">
            © {currentYear} PriceFlare. All rights reserved.
          </p>
          <p className="text-xs text-surface-400">
            Made for smart shoppers ❤️
          </p>
        </div>

        <div className="mt-4 p-3 bg-surface-50 rounded-lg">
          <p className="text-[11px] text-surface-400 leading-relaxed">
            <strong>Disclaimer:</strong> PriceFlare is independent and not affiliated with any retailer.
            Prices are subject to change — always verify on the retailer&apos;s website before purchase.
          </p>
        </div>
      </div>
    </footer>
  );
}
