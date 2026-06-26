import type { LucideIcon } from 'lucide-react';

import type { ProductRolePrices } from '@/lib/roles';

export type SoftwareCatalogCategoryId =
  | 'gestion-documental'
  | 'automatizacion-procesos'
  | 'impresion-y-captura'
  | 'integracion-ricoh'
  | 'antivirus'
  | 'inteligencia-artificial'
  | 'software-empresarial';

export type SoftwareAvailability = 'disponible' | 'reserva' | 'popular';

export type SoftwareContractType = 'mensual' | 'trimestral' | 'anual';

export type SoftwarePlanId = 'basico' | 'empresarial' | 'premium';

export type SoftwarePricePeriod = 'mes' | 'usuario' | 'licencia';

export interface SoftwareCatalogCategory {
  id: SoftwareCatalogCategoryId;
  label: string;
  icon: LucideIcon;
}

export interface SoftwareContractDuration {
  id: string;
  label: string;
  months: number;
  discountFactor: number;
}

export interface SoftwarePlanFeature {
  id: string;
  label: string;
  basico: string | boolean;
  empresarial: string | boolean;
  premium: string | boolean;
}

export interface SoftwarePlan {
  id: SoftwarePlanId;
  label: string;
  description: string;
  priceMultiplier: number;
  highlighted?: boolean;
  features: readonly string[];
}

export interface SoftwareCatalogItem {
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  categoryId: SoftwareCatalogCategoryId;
  /** Subcategoría visible en ficha (p. ej. Antivirus). */
  subcategoryLabel?: string;
  images: readonly string[];
  imageAlt: string;
  badge?: SoftwareAvailability;
  rating: number;
  reviewCount: number;
  basePricePen: number;
  /** Precios por rol cuando aplica (público, técnico, distribuidor). */
  pricesByRole?: Partial<ProductRolePrices>;
  pricePeriod: SoftwarePricePeriod;
  features: readonly string[];
  availability: SoftwareAvailability;
  contractTypes: readonly SoftwareContractType[];
  plans: readonly SoftwarePlan[];
  planComparison: readonly SoftwarePlanFeature[];
  inclusions: readonly string[];
  conditions: readonly string[];
  faq: readonly { question: string; answer: string }[];
  valueProps: readonly { id: string; title: string; description: string }[];
  whatsappMessage: string;
}

export interface SoftwareCatalogFilters {
  categories: SoftwareCatalogCategoryId[];
  availability: SoftwareAvailability[];
  priceMin: number | null;
  priceMax: number | null;
  contractTypes: SoftwareContractType[];
  search: string;
}

export interface SoftwareQuoteLine {
  lineId: string;
  softwareSlug: string;
  planId: SoftwarePlanId;
  durationId: string;
  quantity: number;
  unitPricePen: number;
}
