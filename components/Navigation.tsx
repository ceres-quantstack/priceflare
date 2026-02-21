"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Search, Bell, Info, Mail } from "lucide-react";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const menuItems = [
    { name: "Search for Products", icon: Search, href: "/" },
    { name: "Email Reminder Settings", icon: Bell, href: "/alerts" },
    { name: "About PriceFlare", icon: Info, href: "/about" },
    { name: "Contact PriceFlare", icon: Mail, href: "/contact" },
  ];

  return (
    <>
      {/* Header */}
      <header className="glass-dark sticky top-0 z-50 border-b border-sky-blue/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              PriceFlare
            </span>
            <span className="text-3xl animate-fire-flicker group-hover:scale-110 transition-transform duration-200">
              🔥
            </span>
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="glass p-3 rounded-xl hover:bg-white/20 transition-all duration-200"
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

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* 3D Frosted Pop-out Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] z-40 transition-transform duration-500 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ perspective: "1000px" }}
      >
        <nav
          className="glass-dark h-full p-8 shadow-2xl border-l border-sky-blue/30 transition-transform duration-500"
          style={{
            transform: isOpen ? "rotateY(0deg)" : "rotateY(-8deg)",
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
                  className={`glass p-4 rounded-xl hover:bg-white/20 transition-all duration-200 group flex items-center gap-3 hover:scale-[1.03] ${
                    isOpen ? "animate-[slideIn_0.3s_ease-out_forwards]" : "opacity-0"
                  }`}
                  style={{ animationDelay: isOpen ? `${idx * 80}ms` : "0ms" }}
                >
                  <Icon className="w-5 h-5 text-sky-blue group-hover:text-white transition-colors duration-200" />
                  <span className="text-white font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Menu footer */}
          <div className="absolute bottom-8 left-8 right-8">
            <div className="border-t border-sky-blue/20 pt-4">
              <p className="text-white/40 text-xs text-center">
                PriceFlare 🔥 — Track. Compare. Save.
              </p>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
