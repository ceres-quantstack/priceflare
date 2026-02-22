"use client";

import { useState, useEffect } from "react";
import { Bell, Trash2, Mail, Check } from "lucide-react";
import Link from "next/link";

interface SavedAlert {
  productId: string;
  productName: string;
  retailer: string;
  currentPrice: number;
  threshold: number;
  email: string;
  createdAt: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<SavedAlert[]>([]);
  const [email, setEmail] = useState("");
  const [emailSaved, setEmailSaved] = useState(false);

  useEffect(() => {
    const savedAlerts = localStorage.getItem("priceflare_alerts");
    if (savedAlerts) { try { setAlerts(JSON.parse(savedAlerts)); } catch {} }
    const savedEmail = localStorage.getItem("priceflare_email");
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const deleteAlert = (index: number) => {
    const updated = alerts.filter((_, i) => i !== index);
    setAlerts(updated);
    localStorage.setItem("priceflare_alerts", JSON.stringify(updated));
  };

  const updateEmail = () => {
    localStorage.setItem("priceflare_email", email);
    setEmailSaved(true);
    setTimeout(() => setEmailSaved(false), 2000);
  };

  const clearAllAlerts = () => {
    setAlerts([]);
    localStorage.removeItem("priceflare_alerts");
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-surface-900 mb-3 tracking-tight">
          Price Alerts <span className="text-2xl">🔔</span>
        </h1>
        <p className="text-base text-surface-500">
          Get notified when prices drop on products you're watching.
        </p>
      </div>

      {/* Email Settings */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-brand-500" />
          <h2 className="text-base font-bold text-surface-800">Notification Email</h2>
        </div>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="flex-1 bg-surface-50 border border-surface-200 px-4 py-2.5 rounded-xl outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200 text-sm text-surface-800 placeholder-surface-400 transition-all"
          />
          <button
            onClick={updateEmail}
            className="bg-brand-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-brand-600 active:scale-[0.97] transition-all text-sm flex items-center gap-1.5"
          >
            {emailSaved ? <><Check className="w-4 h-4" /> Saved</> : "Save"}
          </button>
        </div>
        <p className="text-xs text-surface-400 mt-2">
          We only use this for price drop alerts. No spam, no sharing.
        </p>
      </div>

      {/* Active Alerts */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-500" />
            <h2 className="text-base font-bold text-surface-800">Active Alerts</h2>
          </div>
          {alerts.length > 0 && (
            <button
              onClick={clearAllAlerts}
              className="text-xs text-surface-400 hover:text-red-500 font-medium flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Clear All
            </button>
          )}
        </div>

        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-surface-50 rounded-xl border border-surface-100">
                <div className="flex-1">
                  <p className="font-medium text-surface-800 text-sm">{alert.productName}</p>
                  <p className="text-xs text-surface-500 mt-0.5">
                    {alert.retailer} · ${alert.currentPrice} → alert at ${alert.currentPrice - alert.threshold}
                  </p>
                </div>
                <button onClick={() => deleteAlert(idx)} className="p-1.5 rounded-lg hover:bg-red-50 text-surface-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <span className="text-4xl block mb-3">🔕</span>
            <p className="text-sm font-medium text-surface-700 mb-1">No active alerts</p>
            <p className="text-xs text-surface-400 mb-4">
              Search for a product first, then set alerts from the results.
            </p>
            <Link href="/" className="inline-flex items-center gap-1.5 text-brand-500 hover:text-brand-600 text-sm font-medium transition-colors">
              ← Search products
            </Link>
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="mt-6 bg-white rounded-2xl border border-surface-200 p-5">
        <h3 className="text-sm font-bold text-surface-800 mb-3">Alert Thresholds</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { amount: "$25", label: "Small drop", color: "bg-green-50 text-green-700 border-green-100" },
            { amount: "$50", label: "Good deal", color: "bg-blue-50 text-blue-700 border-blue-100" },
            { amount: "$75", label: "Great deal", color: "bg-brand-50 text-brand-700 border-brand-100" },
            { amount: "$100", label: "Major drop", color: "bg-red-50 text-red-700 border-red-100" },
          ].map((t) => (
            <div key={t.amount} className={`text-center p-3 rounded-xl border ${t.color}`}>
              <p className="text-lg font-bold mb-0.5">{t.amount}</p>
              <p className="text-[10px] font-medium">{t.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
