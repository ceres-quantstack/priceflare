"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Search, Bell, Info, Mail } from "lucide-react";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Search", icon: Search, href: "/" },
    { name: "Alerts", icon: Bell, href: "/alerts" },
    { name: "About", icon: Info, href: "/about" },
    { name: "Contact", icon: Mail, href: "/contact" },
  ];

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      <header className="bg-white border-b border-surface-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl md:text-3xl font-bold text-surface-900 tracking-tight">
              Price<span className="text-brand-500">Flare</span>
            </span>
            <span className="text-2xl group-hover:scale-110 transition-transform">🔥</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="px-3 py-2 rounded-lg text-surface-600 hover:text-surface-900 hover:bg-surface-100 transition-colors text-sm font-medium flex items-center gap-1.5"
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-surface-100 transition-colors"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <X className="w-6 h-6 text-surface-700" />
              ) : (
                <Menu className="w-6 h-6 text-surface-700" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-72 z-40 transform transition-all duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <nav className="bg-white h-full p-6 shadow-elevated border-l border-surface-200">
          <div className="flex flex-col gap-2 mt-16">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="p-3 rounded-xl hover:bg-surface-100 transition-colors flex items-center gap-3 text-surface-700 hover:text-surface-900"
                  style={{
                    animation: isOpen ? `slideIn 0.3s ease-out ${idx * 0.08}s forwards` : "none",
                    opacity: isOpen ? 1 : 0,
                  }}
                  tabIndex={isOpen ? 0 : -1}
                >
                  <Icon className="w-5 h-5 text-brand-500" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="absolute bottom-6 left-6 right-6">
            <p className="text-xs text-surface-400 text-center">
              Press <kbd className="px-1.5 py-0.5 bg-surface-100 rounded text-surface-600 text-xs">Esc</kbd> to close
            </p>
          </div>
        </nav>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
