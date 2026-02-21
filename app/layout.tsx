import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "PriceFlare 🔥 - Track Product Prices Across Top Retailers",
  description: "Find the best deals and track price history across Amazon, Walmart, Target, Newegg, eBay, and Best Buy. Get email alerts when prices drop and never overpay again.",
  keywords: "price tracking, price comparison, Amazon deals, Walmart prices, Target sales, product price history, price alerts, best deals",
  authors: [{ name: "PriceFlare Team" }],
  openGraph: {
    title: "PriceFlare 🔥 - Smart Price Tracking",
    description: "Track prices across major retailers and get alerted when deals happen",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "PriceFlare 🔥 - Smart Price Tracking",
    description: "Track prices across major retailers and get alerted when deals happen",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
