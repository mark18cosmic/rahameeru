export type PriceLevel = 1 | 2 | 3 | 4; // $, $$, $$$, $$$$

export interface OpeningHours {
  // 0 = Sunday ... 6 = Saturday
  day: number;
  open: string; // "09:00"
  close: string; // "23:30"
}

export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  cuisine: string[];
  priceLevel: PriceLevel;
  rating: number;
  reviewCount: number;
  description: string;
  image: string;
  gallery?: string[];
  location: string; // area, e.g. "Malé"
  address?: string;
  coords?: { lat: number; lng: number };
  tags: string[];
  phone?: string;
  email?: string;
  hours?: OpeningHours[];
  featured?: boolean;
  createdAt?: number;
}

export interface Review {
  id: string;
  restaurantId: string;
  userId: string;
  name: string;
  rating: number;
  content: string;
  createdAt: number;
}
