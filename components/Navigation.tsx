"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Search, Bell, Info, Mail } from "lucide-react";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Search for Products", icon: Search, href: "/" },
    { name: "Email Reminder Settings", icon: Bell, href: "/alerts" },
    { name: "About PriceFlare", icon: Info, href: "/about" },
    { name: "Contact PriceFlare", icon: Mail, href: "/contact" },
  ];

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Prevent body scroll when menu open (focus trap)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Header */}
      <header className="glass-dark sticky top-0 z-50 border-b border-sky-blue/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl md:text-3xl font-bold text-white">
              PriceFlare
            </span>
            <span className="text-3xl animate-fire-flicker group-hover:scale-110 transition-transform">
              🔥
            </span>
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="glass p-3 rounded-xl hover:bg-white/20 transition-all"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      </header>

      {/* 3D Frosted Pop-out Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-80 z-40 transform transition-all duration-500 ease-out ${
          isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
        }`}
        style={{
          transformStyle: "preserve-3d",
          perspective: "1000px",
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        <nav
          className="glass-dark h-full p-8 shadow-2xl border-l border-sky-blue/30"
          style={{
            transform: isOpen ? "rotateY(0deg)" : "rotateY(-15deg)",
            transformOrigin: "right center",
          }}
        >
          <div className="flex flex-col gap-4 mt-20">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="glass p-4 rounded-xl hover:bg-white/20 transition-all duration-200 group flex items-center gap-3 hover:scale-105 focus-visible:outline-2 focus-visible:outline-sky-blue"
                  style={{
                    animation: isOpen ? `slideIn 0.3s ease-out ${idx * 0.1}s forwards` : "none",
                    opacity: isOpen ? 1 : 0,
                  }}
                  tabIndex={isOpen ? 0 : -1}
                  aria-label={item.name}
                >
                  <Icon className="w-5 h-5 text-sky-blue group-hover:text-white transition-colors" />
                  <span className="text-white font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Keyboard hint */}
          <div className="absolute bottom-8 left-8 right-8">
            <p className="text-xs text-gray-400 text-center">
              Press <kbd className="px-2 py-1 bg-white/10 rounded text-white">Esc</kbd> to close
            </p>
          </div>
        </nav>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
