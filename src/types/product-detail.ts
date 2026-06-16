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
  /** Producto real del catálogo cuando está disponible. */
  productId?: string;
  name: string;
  image: string;
  pricePen: number;
  priceUsd?: number;
  defaultSelected: boolean;
}

export interface EquipmentConfigOption {
  id: string;
  name: string;
  description?: string;
  pricePen: number;
  /** Opción incluida en el equipo base (sin costo adicional). */
  included?: boolean;
  /** Producto del inventario enlazado. */
  productId?: string;
  sku?: string;
  image?: string;
  priceUsd?: number;
}

export interface EquipmentConfigStep {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  pricePen: number;
  icon: LucideIcon;
  defaultSelected: boolean;
  options: EquipmentConfigOption[];
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

export interface ProductDescriptionVisualItem {
  icon: LucideIcon;
  label: string;
}

export interface ProductDescriptionVisualSpec {
  icon: LucideIcon;
  title: string;
  lines: string[];
}

/** Infografía de funciones y especificaciones en la pestaña Descripción. */
export interface ProductDescriptionVisual {
  functions: ProductDescriptionVisualItem[];
  /** Conectividad (Wi-Fi, LAN, USB, móvil) a la derecha de las funciones. */
  connectivity?: ProductDescriptionVisualItem[];
  specs: ProductDescriptionVisualSpec[];
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
  /** Título corto para breadcrumb y encabezado (p. ej. RICOH IM 430F). */
  shortTitle: string;
  /** Título principal en hero (nombre completo con capitalización). */
  heroTitle: string;
  /** Píldoras bajo la marca (Nuevo, ppm, A4, etc.). */
  tagPills: string[];
  /** Tarjetas de características en el hero (4 en 1, velocidad, etc.). */
  heroHighlights: ProductDescriptionHighlight[];
  /** Subtítulo bajo el nombre del producto. */
  displaySubtitle: string;
  categoryLabel: string;
  rating: number;
  reviews: number;
  soldCount: number;
  bullets: string[];
  descriptionContent: ProductDescriptionContent | null;
  /** Iconos de funciones y especificaciones en la descripción. */
  descriptionVisual: ProductDescriptionVisual | null;
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
  /** URL del PDF de ficha técnica cuando está cargado en inventario. */
  technicalSheetUrl: string | null;
  /** Precio mayorista (USD) para mostrar junto al precio público. */
  wholesalePriceUsd: number | null;
}
