export interface Product {
  id: string;
  name: string;
  retailer: string;
  retailerEmoji: string;
  retailerColor: string;
  price: number;
  description: string;
  inStock: boolean;
  url: string;
  reviews: number;
  rating: number;
  pros: string[];
  cons: string[];
  priceHistory: PriceHistoryPoint[];
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
  isSale: boolean;
}

export interface PriceAlert {
  productId: string;
  threshold: number;
  email: string;
}
