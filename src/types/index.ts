export interface Product {
  id: string;
  name: string;
  /** Free-form category string matching the backend schema (e.g. "Electronics", "Accessories", …) */
  category: string;
  price: number;
  rating: number;
  reviewsCount?: number;
  badge?: string;
  image: string;
  shortDescription: string;
  description: string;
  /** Specs stored as a key→value map internally; converted to/from { key, value }[] on the wire */
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
