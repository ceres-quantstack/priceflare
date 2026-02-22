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
  source?: string;
  image?: string;
}
