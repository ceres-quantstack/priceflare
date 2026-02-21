"use client";

import { useState } from "react";
import { Product } from "@/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PriceHistoryChartProps {
  product: Product;
}

export default function PriceHistoryChart({ product }: PriceHistoryChartProps) {
  const [startIndex, setStartIndex] = useState(0);
  const itemsPerPage = 12;

  const visibleData = product.priceHistory.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => {
    setStartIndex(Math.max(0, startIndex - itemsPerPage));
  };

  const handleNext = () => {
    setStartIndex(
      Math.min(product.priceHistory.length - itemsPerPage, startIndex + itemsPerPage)
    );
  };

  const canGoPrev = startIndex > 0;
  const canGoNext = startIndex + itemsPerPage < product.priceHistory.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-dark-blue">
          3-Year Price History - {product.retailer}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            disabled={!canGoPrev}
            className="glass p-2 rounded-lg hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className="glass p-2 rounded-lg hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="glass rounded-xl p-4">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={visibleData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
              domain={['dataMin - 20', 'dataMax + 20']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px',
              }}
              formatter={(value: any, name: string, props: any) => [
                `$${value}`,
                props.payload.isSale ? 'Sale Price 🔥' : 'Regular Price',
              ]}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={product.retailerColor}
              strokeWidth={2}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={payload.isSale ? 6 : 4}
                    fill={payload.isSale ? '#ff4500' : product.retailerColor}
                    stroke={payload.isSale ? '#ffa500' : 'white'}
                    strokeWidth={2}
                  />
                );
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span>Sale Event</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: product.retailerColor }} />
          <span>Regular Price</span>
        </div>
      </div>
    </div>
  );
}
