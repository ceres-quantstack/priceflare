"use client";

import { useState } from "react";
import { Product } from "@/types";
import { X, Bell } from "lucide-react";

interface PriceAlertModalProps {
  product: Product;
  onClose: () => void;
}

export default function PriceAlertModal({ product, onClose }: PriceAlertModalProps) {
  const [email, setEmail] = useState("");
  const [threshold, setThreshold] = useState(25);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to localStorage
    const alerts = JSON.parse(localStorage.getItem("priceflare_alerts") || "[]");
    alerts.push({
      productId: product.id,
      productName: product.name,
      retailer: product.retailer,
      currentPrice: product.price,
      threshold,
      email,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("priceflare_alerts", JSON.stringify(alerts));
    
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-dark rounded-3xl p-8 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 glass p-2 rounded-lg hover:bg-white/20"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {!submitted ? (
          <>
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-8 h-8 text-sky-blue" />
              <h2 className="text-2xl font-bold text-white">Set Price Alert</h2>
            </div>

            <div className="mb-6">
              <p className="text-white/90 mb-2">
                <strong>{product.name}</strong>
              </p>
              <p className="text-white/70">
                Current price at {product.retailer}: <strong>${product.price}</strong>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white mb-2 font-medium">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full glass px-4 py-3 rounded-xl text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-sky-blue"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-white mb-2 font-medium">
                  Alert me when price drops by:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[25, 50, 75, 100].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setThreshold(amount)}
                      className={`py-3 rounded-xl font-semibold transition-all ${
                        threshold === amount
                          ? "bg-sky-blue text-white"
                          : "glass text-white hover:bg-white/20"
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-sky-blue to-dark-blue text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105"
              >
                Create Alert
              </button>
            </form>

            <p className="text-white/60 text-xs mt-4 text-center">
              We'll email you when the price drops by ${threshold} or more. No spam, ever.
            </p>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-white mb-2">Alert Created!</h3>
            <p className="text-white/80">
              We'll notify you at <strong>{email}</strong> when the price drops.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
