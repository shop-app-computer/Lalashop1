export interface User {
  id: string | number;
  username: string;
  name: string;
  avatar: string;
  isFollowing?: boolean;
  bio?: string;
}

export interface ProductPrice {
  range: string;
  price: number;
}

export interface Product {
  _id: string; // MongoDB ID
  name: string;
  description: string;
  price: number;
  image: string | string[]; // Support image as Array or String
  images?: string[]; // Added to match user requirement
  category: string;
  countInStock: number;
  createdAt?: string;
  updatedAt?: string;
  // Optional legacy or social fields
  id?: number;
  prices?: ProductPrice[];
  moq?: number;
  supplierName?: string;
  location?: string;
  verified?: boolean;
  salesVolume?: string;
  tags?: string[];
  badge?: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  slug: string;
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  discount: string;
  tag: string;
  bgColor: string;
}
