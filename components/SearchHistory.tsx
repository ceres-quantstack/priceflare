"use client";

import { Clock, X } from "lucide-react";

interface SearchHistoryProps {
  history: string[];
  onClear: () => void;
  onSelect: (query: string) => void;
}

export default function SearchHistory({ history, onClear, onSelect }: SearchHistoryProps) {
  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-5 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-surface-400" />
          <h2 className="text-sm font-semibold text-surface-700">Recent Searches</h2>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-surface-400 hover:text-red-500 font-medium flex items-center gap-1 transition-colors"
        >
          <X className="w-3 h-3" />
          Clear
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {history.map((query, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(query)}
            className="px-3 py-1.5 rounded-lg border border-surface-200 bg-surface-50 hover:bg-brand-50 hover:border-brand-200 transition-colors text-sm text-surface-700 font-medium"
          >
            {query}
          </button>
        ))}
      </div>
    </div>
  );
}
