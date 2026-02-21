"use client";

import { useState, useEffect } from "react";
import { Bell, Trash2, Mail } from "lucide-react";

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

  useEffect(() => {
    const savedAlerts = localStorage.getItem("priceflare_alerts");
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts));
    }

    const savedEmail = localStorage.getItem("priceflare_email");
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const deleteAlert = (index: number) => {
    const updatedAlerts = alerts.filter((_, i) => i !== index);
    setAlerts(updatedAlerts);
    localStorage.setItem("priceflare_alerts", JSON.stringify(updatedAlerts));
  };

  const updateEmail = () => {
    localStorage.setItem("priceflare_email", email);
    alert("Email preferences saved!");
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-dark-blue mb-4">
          Email Reminder Settings <span className="animate-fire-flicker inline-block">🔥</span>
        </h1>
        <p className="text-xl text-gray-700">
          Manage your price alerts and notification preferences
        </p>
      </div>

      {/* Email Settings */}
      <div className="glass rounded-3xl p-8 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Mail className="w-6 h-6 text-sky-blue" />
          <h2 className="text-2xl font-bold text-dark-blue">Email Preferences</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Default Email for Alerts
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 glass px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-sky-blue text-gray-800"
              />
              <button
                onClick={updateEmail}
                className="bg-gradient-to-r from-sky-blue to-dark-blue text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Save
              </button>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <p className="text-sm text-gray-700">
              <strong>Privacy Notice:</strong> We only use your email to send price drop alerts. 
              No spam, no third-party sharing, ever. You can delete all alerts at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      <div className="glass rounded-3xl p-8">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="w-6 h-6 text-sky-blue" />
          <h2 className="text-2xl font-bold text-dark-blue">Active Price Alerts</h2>
        </div>

        {alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert, idx) => (
              <div
                key={idx}
                className="glass rounded-xl p-4 flex items-center justify-between hover:bg-white/30 transition-all"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-dark-blue text-lg">{alert.productName}</h3>
                  <p className="text-gray-600">
                    {alert.retailer} • Current: ${alert.currentPrice} • Alert at: ${alert.currentPrice - alert.threshold}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Created: {new Date(alert.createdAt).toLocaleDateString()} • Email: {alert.email}
                  </p>
                </div>
                <button
                  onClick={() => deleteAlert(idx)}
                  className="ml-4 p-2 rounded-lg hover:bg-red-100 text-red-600 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-semibold text-dark-blue mb-2">No Active Alerts</h3>
            <p className="text-gray-600">
              Search for products and set price alerts to get notified when deals happen!
            </p>
          </div>
        )}
      </div>

      {/* Alert Options Info */}
      <div className="mt-8 glass rounded-3xl p-6">
        <h3 className="font-semibold text-dark-blue mb-4">How Price Alerts Work</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <p className="text-2xl font-bold text-green-700 mb-1">$25</p>
            <p className="text-sm text-gray-600">Small drop</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <p className="text-2xl font-bold text-blue-700 mb-1">$50</p>
            <p className="text-sm text-gray-600">Good deal</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-xl">
            <p className="text-2xl font-bold text-orange-700 mb-1">$75</p>
            <p className="text-sm text-gray-600">Great deal</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-xl">
            <p className="text-2xl font-bold text-red-700 mb-1">$100</p>
            <p className="text-sm text-gray-600">Epic deal</p>
          </div>
        </div>
      </div>
    </div>
  );
}
