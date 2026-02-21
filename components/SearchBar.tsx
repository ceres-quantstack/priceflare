"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
  searchProgress: Record<string, number>;
}

// ~500 products for autocomplete — common electronics, home, kitchen, etc.
const PRODUCT_DATABASE = [
  // Electronics
  "iPhone 15 Pro", "iPhone 15 Pro Max", "iPhone 15", "iPhone 14", "iPhone SE",
  "Samsung Galaxy S24 Ultra", "Samsung Galaxy S24", "Samsung Galaxy S23", "Samsung Galaxy A54",
  "Google Pixel 8 Pro", "Google Pixel 8", "Google Pixel 7a", "OnePlus 12",
  "MacBook Pro 14", "MacBook Pro 16", "MacBook Air M3", "MacBook Air M2",
  "Dell XPS 15", "Dell XPS 13", "Dell Inspiron 16", "Dell Latitude 14",
  "HP Spectre x360", "HP Envy 16", "HP Pavilion 15", "HP EliteBook",
  "Lenovo ThinkPad X1 Carbon", "Lenovo Yoga 9i", "Lenovo IdeaPad 5",
  "ASUS ROG Zephyrus G16", "ASUS ZenBook 14", "ASUS TUF Gaming A15",
  "Microsoft Surface Pro 10", "Microsoft Surface Laptop 6", "Microsoft Surface Go 4",
  "iPad Pro 12.9", "iPad Pro 11", "iPad Air M2", "iPad Mini 6", "iPad 10th Gen",
  "Samsung Galaxy Tab S9", "Samsung Galaxy Tab A9",
  // TVs
  "LG OLED C4 65-inch", "LG OLED C4 55-inch", "LG OLED G4 77-inch",
  "Samsung QN90D 65-inch", "Samsung QN85D 55-inch", "Samsung The Frame 55-inch",
  "Sony Bravia XR A95L", "Sony Bravia X90L 65-inch", "TCL 6-Series 65-inch",
  "Hisense U8K 65-inch", "Vizio M-Series 55-inch",
  // Audio
  "AirPods Pro 2", "AirPods Max", "AirPods 3rd Gen",
  "Sony WH-1000XM5", "Sony WF-1000XM5", "Sony ULT Wear",
  "Bose QuietComfort Ultra", "Bose QuietComfort 45", "Bose SoundLink Flex",
  "JBL Flip 6", "JBL Charge 5", "JBL PartyBox 310", "JBL Tune 770NC",
  "Samsung Galaxy Buds3 Pro", "Google Pixel Buds Pro 2",
  "Beats Studio Pro", "Beats Fit Pro", "Beats Solo 4",
  "Sonos Era 300", "Sonos Era 100", "Sonos Beam Gen 2", "Sonos Arc",
  "Amazon Echo Dot 5th Gen", "Amazon Echo Show 8", "Amazon Echo Studio",
  "Google Nest Hub Max", "Google Nest Mini", "Google Nest Audio",
  "HomePod 2", "HomePod Mini",
  // Gaming
  "Sony PlayStation 5", "Sony PlayStation 5 Slim", "PS5 DualSense Controller",
  "Xbox Series X", "Xbox Series S", "Xbox Elite Controller Series 2",
  "Nintendo Switch OLED", "Nintendo Switch Lite", "Nintendo Switch Pro Controller",
  "Steam Deck OLED 512GB", "Steam Deck OLED 1TB",
  "ASUS ROG Ally X", "Lenovo Legion Go",
  "Meta Quest 3 128GB", "Meta Quest 3 512GB", "Meta Quest Pro",
  "Razer Viper V3 Pro", "Razer BlackWidow V4", "Razer Kraken V4",
  "Logitech G Pro X Superlight", "Logitech G915 TKL", "Logitech G Pro X Headset",
  "SteelSeries Arctis Nova Pro", "SteelSeries Apex Pro Mini",
  "HyperX Cloud III", "HyperX Alloy Origins",
  "Corsair K70 RGB Pro", "Corsair HS80 RGB",
  // Cameras
  "Canon EOS R5", "Canon EOS R6 Mark II", "Canon EOS R8",
  "Sony A7 IV", "Sony A7R V", "Sony ZV-E1", "Sony ZV-1 II",
  "Nikon Z8", "Nikon Z6 III", "Nikon Z50",
  "Fujifilm X-T5", "Fujifilm X100VI", "Fujifilm X-S20",
  "GoPro Hero 12 Black", "GoPro Hero 11 Black Mini",
  "DJI Mini 4 Pro", "DJI Air 3", "DJI Mavic 3 Pro", "DJI Osmo Pocket 3",
  "Insta360 X4", "Insta360 Ace Pro",
  // Wearables
  "Apple Watch Series 9", "Apple Watch Ultra 2", "Apple Watch SE",
  "Samsung Galaxy Watch 6 Classic", "Samsung Galaxy Watch 6",
  "Google Pixel Watch 2", "Fitbit Charge 6", "Fitbit Sense 2",
  "Garmin Fenix 8", "Garmin Venu 3", "Garmin Forerunner 265",
  "Oura Ring Gen 3", "Whoop 4.0",
  // Smart Home
  "Ring Video Doorbell 4", "Ring Floodlight Cam Pro", "Ring Indoor Cam",
  "Arlo Pro 5", "Arlo Essential Spotlight", "Arlo Video Doorbell",
  "Nest Cam Outdoor", "Nest Doorbell Wired", "Nest Thermostat",
  "ecobee Smart Thermostat Premium", "Ecobee Smart Sensor",
  "Philips Hue Starter Kit", "Philips Hue Gradient Lightstrip",
  "LIFX A19 Color Bulb", "Nanoleaf Shapes",
  "Roku Streaming Stick 4K+", "Roku Ultra", "Apple TV 4K",
  "Amazon Fire TV Stick 4K Max", "Chromecast with Google TV",
  "iRobot Roomba j9+", "iRobot Roomba Combo j7+", "iRobot Braava Jet m6",
  "Roborock S8 Pro Ultra", "Roborock Q Revo", "Ecovacs Deebot X2 Omni",
  "Eufy RoboVac G30", "Shark AI VacMop",
  // Kitchen
  "KitchenAid Artisan Stand Mixer", "KitchenAid Professional 600",
  "Instant Pot Duo 7-in-1", "Instant Pot Pro Plus", "Instant Pot Duo Crisp",
  "Ninja Foodi Air Fryer", "Ninja Creami", "Ninja Professional Blender",
  "Vitamix A3500", "Vitamix E310", "Blendtec Total Classic",
  "Breville Barista Express", "Breville Smart Oven Air",
  "Nespresso Vertuo Next", "Nespresso Vertuo Plus", "Keurig K-Supreme Plus",
  "Dyson V15 Detect", "Dyson V12 Detect Slim", "Dyson Airwrap",
  "Dyson Pure Cool TP07", "Dyson Supersonic Hair Dryer",
  "Cuisinart 14-Cup Food Processor", "Cuisinart TOA-65 Air Fryer Toaster Oven",
  "Lodge Cast Iron Skillet 12-inch", "Le Creuset Dutch Oven 5.5 Qt",
  "Staub Round Cocotte", "All-Clad D3 Stainless Steel Fry Pan",
  // Furniture & Office
  "Herman Miller Aeron Chair", "Herman Miller Embody Chair",
  "Steelcase Leap V2", "Secretlab Titan Evo",
  "Standing Desk FlexiSpot E7", "Uplift V2 Standing Desk",
  "LG UltraWide 34WP65C", "Samsung Odyssey G9", "Dell UltraSharp U2723QE",
  "ASUS ProArt PA278QV", "BenQ PD2705U",
  "CalDigit TS4 Thunderbolt 4 Dock", "Anker 575 USB-C Hub",
  "Logitech MX Master 3S", "Logitech MX Keys S", "Logitech C920 Webcam",
  "Elgato Stream Deck MK.2", "Elgato Key Light Air",
  "Blue Yeti Microphone", "Shure MV7", "Rode NT-USB Mini",
  // Fitness
  "Peloton Bike+", "Peloton Tread", "NordicTrack Commercial 1750",
  "Bowflex SelectTech 552 Dumbbells", "Bowflex Revolution",
  "Theragun Pro", "Theragun Elite", "Hyperice Hypervolt 2 Pro",
  "Hydrow Rower", "Concept2 RowErg", "Sunny Health Rowing Machine",
  "TRX All-in-One Suspension Trainer", "Resistance Bands Set",
  "Yoga Mat Manduka PRO", "Lululemon Reversible Mat",
  // Storage
  "Samsung 990 Pro 2TB SSD", "Samsung T7 Shield 2TB",
  "WD Black SN850X 2TB", "WD My Passport 5TB",
  "Seagate FireCuda 530 2TB", "Seagate Expansion 8TB",
  "SanDisk Extreme Pro 2TB", "Crucial P5 Plus 2TB",
  "Kingston Fury Beast 32GB DDR5", "Corsair Vengeance 32GB DDR5",
  // Networking
  "ASUS RT-AX86U Pro", "ASUS ZenWiFi AX XT8",
  "TP-Link Deco XE75", "TP-Link Archer AXE75",
  "Netgear Orbi RBK863S", "Netgear Nighthawk RAXE500",
  "eero Pro 6E", "Google Nest WiFi Pro",
  "Ubiquiti UniFi Dream Router", "Ubiquiti UniFi AP U7 Pro",
  // Miscellaneous
  "Kindle Paperwhite Signature Edition", "Kindle Scribe", "Kindle Oasis",
  "Remarkable 2 Tablet", "Supernote A5 X2",
  "Anker PowerCore 26800", "Anker 737 Power Bank",
  "Peak Design Everyday Backpack V2", "Bellroy Classic Backpack",
  "Tile Pro 2024", "Apple AirTag 4-Pack",
  "Jackery Explorer 1000 Pro", "EcoFlow Delta 2",
  "Weber Genesis E-335", "Traeger Ironwood 650",
  "iRobot Roomba s9+", "Shark AI Robot VacMop",
  "Dyson Big Ball Multi Floor", "Miele Complete C3",
];

export default function SearchBar({ onSearch, isSearching, searchProgress }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced fuzzy search
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(() => {
      const q = query.toLowerCase();
      const tokens = q.split(/\s+/);
      const scored = PRODUCT_DATABASE
        .map((product) => {
          const lower = product.toLowerCase();
          let score = 0;
          // Exact substring match = highest
          if (lower.includes(q)) score += 100;
          // All tokens present
          const allMatch = tokens.every((t) => lower.includes(t));
          if (allMatch) score += 50;
          // Individual token matches
          tokens.forEach((t) => {
            if (lower.includes(t)) score += 10;
            if (lower.startsWith(t)) score += 20;
          });
          return { product, score };
        })
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map((s) => s.product);

      setSuggestions(scored);
      setShowSuggestions(scored.length > 0);
    }, 150); // 150ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setShowSuggestions(false);
      setShowHistory(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const handleFocus = () => {
    if (query.length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const retailers = [
    { name: "Amazon", emoji: "📦", color: "#FF9900" },
    { name: "Walmart", emoji: "🏪", color: "#0071CE" },
    { name: "Target", emoji: "🎯", color: "#CC0000" },
    { name: "Newegg", emoji: "🥚", color: "#FF6600" },
    { name: "eBay", emoji: "🛒", color: "#E53238" },
    { name: "Best Buy", emoji: "⚡", color: "#0046BE" },
  ];

  return (
    <div className="relative max-w-3xl mx-auto" ref={wrapperRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="glass rounded-2xl p-2 flex items-center gap-2 hover:shadow-xl transition-shadow duration-300">
          <Search className="w-6 h-6 text-sky-blue ml-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            placeholder="Search for products across all retailers..."
            className="flex-1 bg-transparent border-none outline-none text-lg px-2 py-3 text-gray-800 placeholder-gray-500"
            disabled={isSearching}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="bg-gradient-to-r from-sky-blue to-dark-blue text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
          >
            {isSearching ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Search"
            )}
          </button>
        </div>
      </form>

      {/* Autocomplete Suggestions */}
      {showSuggestions && suggestions.length > 0 && !isSearching && (
        <div className="absolute top-full mt-2 w-full glass rounded-xl overflow-hidden shadow-2xl z-50 border border-white/20">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-6 py-3 hover:bg-sky-blue/20 transition-colors duration-150 text-gray-800 border-b border-white/10 last:border-b-0 flex items-center gap-3"
            >
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      {/* Search Progress Bars — staggered per retailer */}
      {isSearching && (
        <div className="mt-6 space-y-3 glass rounded-2xl p-6">
          <div className="text-center text-dark-blue font-semibold mb-4">
            🔥 Searching across retailers...
          </div>
          {retailers.map((retailer) => {
            const progress = searchProgress[retailer.name] ?? 0;
            return (
              <div key={retailer.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 font-medium">
                    {retailer.emoji} {retailer.name}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    {progress < 100 ? `${Math.round(progress)}%` : "✓ Done"}
                  </span>
                </div>
                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ease-out ${
                      progress >= 100 ? "bg-green-500" : "fire-progress"
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
