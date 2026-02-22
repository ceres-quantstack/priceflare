import { Metadata } from "next";
import { TrendingDown, Shield, Zap, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "About PriceFlare 🔥 - Smart Price Tracking",
  description: "Learn about PriceFlare, the intelligent price tracking platform that helps you save money across major retailers.",
  keywords: "about priceflare, price tracking platform, save money, deal finder",
};

export default function AboutPage() {
  const features = [
    {
      icon: TrendingDown,
      title: "Real-Time Price Tracking",
      description: "We monitor prices 24/7 across Amazon, Target, Newegg, eBay, and Best Buy so you don't have to.",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "We don't store your personal data. All searches are anonymous and your email alerts are encrypted.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Our optimized search engine scans thousands of products in seconds, with cached results for instant access.",
    },
    {
      icon: Heart,
      title: "Made with Love",
      description: "Built by deal hunters, for deal hunters. We know the pain of overpaying, so we made PriceFlare.",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-dark-blue mb-4">
          About PriceFlare <span className="animate-fire-flicker inline-block">🔥</span>
        </h1>
        <p className="text-xl text-gray-700 max-w-2xl mx-auto">
          We're on a mission to end impulse buying and help you snag the best deals on the internet.
        </p>
      </div>

      <div className="glass rounded-3xl p-8 mb-12">
        <h2 className="text-3xl font-bold text-dark-blue mb-6">Our Story</h2>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            PriceFlare started in a college dorm room when our founder realized he'd overpaid for a laptop by $200 
            because he didn't check all the retailers. <em>"There has to be a better way,"</em> he thought, 
            while crying into his ramen noodles.
          </p>
          <p>
            After months of late-night coding sessions (fueled by questionable amounts of coffee ☕), 
            PriceFlare was born. We built the platform we wished existed: a dead-simple way to compare 
            prices across every major retailer, track price history, and get alerts when deals happen.
          </p>
          <p>
            Today, PriceFlare helps thousands of smart shoppers save millions of dollars. We've tracked over 
            100 million price changes, sent countless deal alerts, and prevented more buyer's remorse than 
            we can count. And we're just getting started.
          </p>
          <p className="font-semibold text-dark-blue">
            Because life's too short to overpay for stuff. 🔥
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div key={idx} className="glass rounded-2xl p-6 hover:shadow-xl transition-all">
              <Icon className="w-10 h-10 text-sky-blue mb-4" />
              <h3 className="text-xl font-bold text-dark-blue mb-2">{feature.title}</h3>
              <p className="text-gray-700">{feature.description}</p>
            </div>
          );
        })}
      </div>

      <div className="glass rounded-3xl p-8 text-center">
        <h2 className="text-2xl font-bold text-dark-blue mb-4">Fun Facts</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-4xl font-bold text-sky-blue mb-2">100M+</p>
            <p className="text-gray-700">Price points tracked</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-sky-blue mb-2">$50M+</p>
            <p className="text-gray-700">Saved by users</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-sky-blue mb-2">6</p>
            <p className="text-gray-700">Major retailers monitored</p>
          </div>
        </div>
      </div>
    </div>
  );
}
