import {
  getCategoryLabel,
  getPlanPrice,
  SERVICE_CONTRACT_DURATIONS,
  serviceDetailPath,
} from '@/data/services-catalog';
import { penToUsd } from '@/lib/utils';
import { productPath } from '@/lib/product-path';
import type { Product } from '@/types/product';
import type {
  ServiceCatalogItem,
  ServiceContractType,
  ServicePlanId,
} from '@/types/services-catalog';

export const SERVICE_PRODUCT_ID_PREFIX = 'service:';

export interface ServiceCartInput {
  item: ServiceCatalogItem;
  planId: ServicePlanId;
  durationId: ServiceContractType;
  unitPricePen: number;
}

export function isServiceCartProduct(product: Pick<Product, 'id'>): boolean {
  return product.id.startsWith(SERVICE_PRODUCT_ID_PREFIX);
}

export function buildServiceCartProductId(
  slug: string,
  planId: ServicePlanId,
  durationId: ServiceContractType,
): string {
  return `${SERVICE_PRODUCT_ID_PREFIX}${slug}::${planId}::${durationId}`;
}

function resolveServiceCartName(
  item: ServiceCatalogItem,
  planId: ServicePlanId,
  durationId: ServiceContractType,
): string {
  if (item.pricingMode === 'fixed') {
    return item.title;
  }

  const plan = item.plans.find((entry) => entry.id === planId) ?? item.plans[0];
  const duration =
    SERVICE_CONTRACT_DURATIONS.find((entry) => entry.id === durationId) ??
    SERVICE_CONTRACT_DURATIONS[0];

  return `${item.title} — ${plan.label} (${duration.label})`;
}

export function buildServiceCartProduct(input: ServiceCartInput): Product {
  const { item, planId, durationId, unitPricePen } = input;

  return {
    id: buildServiceCartProductId(item.slug, planId, durationId),
    slug: item.slug,
    name: resolveServiceCartName(item, planId, durationId),
    description: item.shortDescription,
    price: penToUsd(unitPricePen),
    currency: 'USD',
    image_url: item.images[0] ?? null,
    gallery: [...item.images],
    stock: 999,
    category: getCategoryLabel(item.categoryId),
    created_at: '1970-01-01T00:00:00.000Z',
  };
}

export function resolveCartItemDetailPath(
  product: Pick<Product, 'id' | 'slug'>,
): string {
  if (isServiceCartProduct(product) && product.slug) {
    return serviceDetailPath(product.slug);
  }
  return productPath(product.id);
}

export function buildDefaultServiceCartInput(item: ServiceCatalogItem): ServiceCartInput {
  const durationId = item.pricingMode === 'fixed'
    ? 'unico'
    : item.contractTypes.includes('mensual')
      ? 'mensual'
      : (item.contractTypes[0] ?? 'mensual');

  const planId: ServicePlanId = item.pricingMode === 'fixed' ? 'basico' : 'empresarial';
  const resolvedDuration = durationId as ServiceContractType;

  return {
    item,
    planId,
    durationId: resolvedDuration,
    unitPricePen: getPlanPrice(item, planId, resolvedDuration),
  };
}
