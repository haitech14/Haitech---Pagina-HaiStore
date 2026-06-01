import type { LucideIcon } from 'lucide-react';

import type { Product } from '@/types/product';

export interface ProductBreadcrumb {
  label: string;
  href?: string;
}

export interface ProductFeatureIcon {
  icon: LucideIcon;
  label: string;
}

export interface ProductResourceLink {
  label: string;
  subtitle: string;
  href?: string;
  icon: LucideIcon;
  accentSubtitle?: boolean;
  action?: 'quote';
}

export interface ProductWarrantyOption {
  id: string;
  label: string;
  priceUsd?: number;
}

export interface ProductComboItem {
  id: string;
  name: string;
  image: string;
  pricePen: number;
  defaultSelected: boolean;
}

export interface EquipmentConfigStep {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  pricePen: number;
  icon: LucideIcon;
  defaultSelected: boolean;
}

export interface ProductSpecRow {
  label: string;
  value: string;
}

export interface BulkDiscountTier {
  range: string;
  discount: string;
  discountPercent: number;
}

export interface RentalPlanOption {
  pagesPerMonth: number;
  monthlyPricePen: number;
}

export interface ProductDescriptionHighlight {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

export interface ProductDescriptionContent {
  paragraphs: string[];
  youtubeVideoId?: string;
  youtubeTitle?: string;
  highlights: ProductDescriptionHighlight[];
}

export type ProductGalleryItem =
  | { type: 'image'; src: string; alt?: string }
  | {
      type: 'video';
      youtubeId: string;
      title?: string;
      poster?: string;
    };

export interface ProductDetailViewModel {
  product: Product;
  sku: string;
  brandLabel: string;
  colorLabel: string;
  breadcrumbs: ProductBreadcrumb[];
  displayTitle: string;
  categoryLabel: string;
  rating: number;
  reviews: number;
  soldCount: number;
  bullets: string[];
  descriptionContent: ProductDescriptionContent | null;
  specs: ProductSpecRow[];
  warrantyBullets: string[];
  gallery: ProductGalleryItem[];
  features: ProductFeatureIcon[];
  resourceLinks: ProductResourceLink[];
  warrantyOptions: ProductWarrantyOption[];
  comboItems: ProductComboItem[];
  equipmentConfigSteps: EquipmentConfigStep[];
  bulkDiscountTiers: BulkDiscountTier[];
  rentalPlans: RentalPlanOption[];
  isPrinterEquipment: boolean;
  isSupplyProduct: boolean;
  isOnOffer: boolean;
  oldPricePen: number | null;
  discountPercent: number | null;
}
