import type { LucideIcon } from 'lucide-react';

export type ServiceCatalogCategoryId =
  | 'alquiler'
  | 'servicio-tecnico'
  | 'outsourcing'
  | 'servicios-corporativos'
  | 'locales-eventos'
  | 'paquetes-corporativos';

export type ServiceAvailability = 'disponible' | 'reserva' | 'popular';

export type ServiceContractType = 'mensual' | 'trimestral' | 'anual' | 'evento' | 'unico';

export type ServicePlanId = 'basico' | 'empresarial' | 'premium';

export type ServicePricePeriod = 'mes' | 'evento' | 'dia' | 'servicio';

export interface ServiceCatalogCategory {
  id: ServiceCatalogCategoryId;
  label: string;
  stripLabel: string;
  icon: LucideIcon;
  /** Categorías de catálogo que incluye este filtro del strip */
  filterCategoryIds: ServiceCatalogCategoryId[];
}

export interface ServiceContractDuration {
  id: string;
  label: string;
  months: number;
  discountFactor: number;
}

export interface ServicePlanFeature {
  id: string;
  label: string;
  basico: string | boolean;
  empresarial: string | boolean;
  premium: string | boolean;
}

export interface ServicePlan {
  id: ServicePlanId;
  label: string;
  description: string;
  priceMultiplier: number;
  /** Precio fijo en soles cuando aplica (ignora multiplicadores). */
  fixedPricePen?: number;
  /** Texto adicional bajo el precio (p. ej. «+ Transporte»). */
  priceNote?: string;
  highlighted?: boolean;
  features: readonly string[];
}

export interface ServicePriceVariant {
  label: string;
  pricePen: number;
}

export interface ServiceCatalogItem {
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  categoryId: ServiceCatalogCategoryId;
  landingSlug: string;
  images: readonly string[];
  imageAlt: string;
  badge?: ServiceAvailability;
  rating: number;
  reviewCount: number;
  basePricePen: number;
  pricePeriod: ServicePricePeriod;
  /** Precio fijo por servicio (sin prefijo «Desde» ni multiplicadores de plan). */
  pricingMode?: 'plan' | 'fixed';
  /** Variantes de precio adicionales (p. ej. Color sobre B/N). */
  priceVariants?: readonly ServicePriceVariant[];
  features: readonly string[];
  availability: ServiceAvailability;
  contractTypes: readonly ServiceContractType[];
  eventCapacity?: number;
  isPackage?: boolean;
  plans: readonly ServicePlan[];
  planComparison: readonly ServicePlanFeature[];
  inclusions: readonly string[];
  conditions: readonly string[];
  faq: readonly { question: string; answer: string }[];
  valueProps: readonly { id: string; title: string; description: string }[];
  whatsappMessage: string;
}

export interface ServiceCatalogFilters {
  categories: ServiceCatalogCategoryId[];
  availability: ServiceAvailability[];
  priceMin: number | null;
  priceMax: number | null;
  contractTypes: ServiceContractType[];
  eventCapacities: number[];
  search: string;
}

export interface ServicesQuoteLine {
  lineId: string;
  serviceSlug: string;
  planId: ServicePlanId;
  durationId: string;
  quantity: number;
  unitPricePen: number;
}
