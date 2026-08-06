export type PriceLevel = 1 | 2 | 3 | 4; // $, $$, $$$, $$$$

export interface OpeningHours {
  // 0 = Sunday ... 6 = Saturday
  day: number;
  open: string; // "09:00"
  close: string; // "23:30"
}

export interface MenuItem {
  name: string;
  description?: string;
  /** Price in Maldivian rufiyaa. */
  price: number;
  /** Dietary or preparation notes, e.g. "Vegetarian", "Spicy". */
  tags?: string[];
  popular?: boolean;
  /** Listed by the restaurant when it publishes them. */
  ingredients?: string[];
  /** Overrides the photo lookup for this dish. */
  image?: string;
}

export interface MenuSection {
  name: string;
  items: MenuItem[];
}

export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  cuisine: string[];
  priceLevel: PriceLevel;
  /** Displayed rating: the listed one blended with live reviews. */
  rating: number;
  reviewCount: number;
  /** Listed values before live reviews are folded in; set by getRestaurants. */
  baseRating?: number;
  baseReviewCount?: number;
  description: string;
  /** Optional explicit photo. When absent, resolved by name via /api/photo. */
  image?: string;
  gallery?: string[];
  location: string; // area, e.g. "Malé"
  address?: string;
  coords?: { lat: number; lng: number };
  tags: string[];
  phone?: string;
  email?: string;
  hours?: OpeningHours[];
  menu?: MenuSection[];
  featured?: boolean;
  createdAt?: number;
}

export interface ReviewReply {
  /** What the restaurant wrote back. */
  text: string;
  /** Display name shown next to the reply. */
  by: string;
  at: number;
}

/** A dish the reviewer actually ordered, with their verdict on it. */
export interface DishVerdict {
  name: string;
  /** 1–5, or undefined if they picked the dish without rating it. */
  rating?: number;
}

export type VisitType = "dine-in" | "takeaway" | "delivery";

export interface Review {
  id: string;
  restaurantId: string;
  userId: string;
  name: string;
  rating: number;
  content: string;
  createdAt: number;
  /** What they ordered. This is what makes dish-level ratings possible. */
  dishes?: DishVerdict[];
  /** Download URLs for photos they added. */
  photos?: string[];
  visitType?: VisitType;
  /** Minutes waited for food, as reported. */
  waitMinutes?: number;
  /** Rufiyaa per person, as reported. */
  spendPerHead?: number;
  /** Set when the venue answers. Only the listing's owner can write this. */
  reply?: ReviewReply;
}
