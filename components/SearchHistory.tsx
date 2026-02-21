"use client";

import { Clock, Trash2 } from "lucide-react";

interface SearchHistoryProps {
  history: string[];
  onClear: () => void;
  onSelect: (query: string) => void;
}

export default function SearchHistory({ history, onClear, onSelect }: SearchHistoryProps) {
  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-sky-blue" />
          <h2 className="text-xl font-bold text-dark-blue">Recent Searches</h2>
        </div>
        <button
          onClick={onClear}
          className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Clear All
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {history.map((query, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(query)}
            className="glass px-4 py-2 rounded-xl hover:bg-white/30 transition-all text-gray-800 font-medium"
          >
            {query}
          </button>
        ))}
      </div>
    </div>
  );
}
