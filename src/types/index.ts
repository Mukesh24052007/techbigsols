export interface Product {
  id: string;
  name: string;
  category: "Accessories" | "Hardware" | "Office Tech" | "Smart Devices";
  price: number;
  rating: number;
  reviewsCount: number;
  badge?: "New" | "Best Seller" | "Popular" | "Featured";
  image: string;
  shortDescription: string;
  description: string;
  specs: { [key: string]: string };
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ServiceItem {
  id: string;
  title: string;
  category: string;
  tagline: string;
  description: string;
  iconName: string;
  image: string;
  keyPoints: string[];
  features: { title: string; desc: string }[];
  ctaLabel: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  rating: number;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}
