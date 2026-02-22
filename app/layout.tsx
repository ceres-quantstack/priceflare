import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const siteUrl = "https://priceflare.com";
const siteName = "PriceFlare";
const siteDescription = "Track product prices across Amazon, Target, Newegg, eBay, and Best Buy. Get instant price alerts and never overpay again.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PriceFlare 🔥 - Track Product Prices Across Top Retailers",
    template: "%s | PriceFlare"
  },
  description: siteDescription,
  keywords: [
    "price tracking",
    "price comparison",
    "Amazon deals",
    "Target sales",
    "product price history",
    "price alerts",
    "best deals",
    "price drop alerts",
    "compare prices",
    "shopping deals",
    "Black Friday deals",
    "Cyber Monday deals",
  ],
  authors: [{ name: "PriceFlare Team" }],
  creator: "PriceFlare",
  publisher: "PriceFlare",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName,
    title: "PriceFlare 🔥 - Smart Price Tracking Across Retailers",
    description: siteDescription,
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "PriceFlare - Smart Price Tracking",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PriceFlare 🔥 - Smart Price Tracking",
    description: siteDescription,
    images: [`${siteUrl}/og-image.png`],
    creator: "@priceflare",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: siteUrl,
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
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: siteName,
              url: siteUrl,
              description: siteDescription,
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${siteUrl}?q={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: siteName,
              url: siteUrl,
              logo: `${siteUrl}/logo.png`,
              sameAs: [
                "https://twitter.com/priceflare",
                "https://facebook.com/priceflare",
              ],
            }),
          }}
        />
      </head>
      <body className="antialiased">
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
