import { LucideIcon } from "lucide-react";

export interface PriceTier {
  range: string;
  price: number;
}

export interface LiveBadgeProps {
  children: React.ReactNode;
  color?: string;
}

export interface QuantityStepperProps {
  value: number;
  min?: number;
  onChange: (value: number) => void;
}

export interface PriceTierCardProps {
  tier: PriceTier;
  index: number;
  active: boolean;
  onClick: () => void;
}

export interface ImageGalleryProps {
  image: string;
  name: string;
  badge?: string;
}

export interface TrustPillProps {
  icon: LucideIcon;
  label: string;
  value: string;
  color: string;
}

export interface SpecRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface StarsProps {
  count?: number;
  filled?: number;
  size?: number;
}

/** Shape required by ProductPage and ProductTabs — use index signature
 *  to be compatible with any type from @/data without importing */
export interface ProductData {
  id: number | string;
  name: string;
  image: string;
  category?: string;
  description?: string;
  location?: string;
  badge?: string;
  moq?: number;
  prices?: PriceTier[] | number;
  [key: string]: unknown;   // Supports additional fields that @/data might have
}

export interface ProductTabsProps {
  tab: string;
  setTab: (tab: string) => void;
  product: ProductData;
}