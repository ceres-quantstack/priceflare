import Link from "next/link";
import { Flame, Shield, Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-200/50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl font-bold text-dark-blue">PriceFlare</span>
              <span className="text-xl">🔥</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Track prices across major retailers. Get alerts when deals happen.
              Never overpay again.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-dark-blue mb-3 text-sm uppercase tracking-wider">
              Navigate
            </h4>
            <ul className="space-y-2">
              {[
                { name: "Search Products", href: "/" },
                { name: "Price Alerts", href: "/alerts" },
                { name: "About", href: "/about" },
                { name: "Contact", href: "/contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-dark-blue transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Retailers */}
          <div>
            <h4 className="font-semibold text-dark-blue mb-3 text-sm uppercase tracking-wider">
              Retailers
            </h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>📦 Amazon</li>
              <li>🏪 Walmart</li>
              <li>🎯 Target</li>
              <li>🥚 Newegg</li>
              <li>🛒 eBay</li>
              <li>⚡ Best Buy</li>
            </ul>
          </div>

          {/* Trust Signals */}
          <div>
            <h4 className="font-semibold text-dark-blue mb-3 text-sm uppercase tracking-wider">
              Our Promise
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-500">No data stored — your privacy matters</span>
              </li>
              <li className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-500">Real-time pricing from verified sources</span>
              </li>
              <li className="flex items-start gap-2">
                <Flame className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-500">Instant PriceFlare alerts on deals</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200/50 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} PriceFlare. All rights reserved. Not affiliated with any retailer.
          </p>
          <p className="text-xs text-gray-400">
            Prices are fetched in real-time and may differ from retailer sites.
          </p>
        </div>
      </div>
    </footer>
  );
}
