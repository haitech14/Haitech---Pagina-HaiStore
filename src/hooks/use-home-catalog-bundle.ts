import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import type { HomeCatalogSectionPayload } from '@/lib/home-catalog-bundle';
import {
  fetchHomeCatalogBundleForDisplay,
  HOME_CATALOG_BUNDLE_QUERY_KEY,
  readStoredHomeCatalogBundle,
  type HomeCatalogBundleResponse,
} from '@/lib/home-catalog-bundle';
import type { FeaturedProduct } from '@/data/featured-products';
import { applyViewAsPriceToProducts, shouldApplyViewAsPriceTransform, viewAsRolesQueryKey } from '@/lib/view-as-role';
import { ensureFullPrices } from '@/lib/roles';
import {
  getConditionsForCatalogFamily,
  type ProductCondition,
} from '@/lib/product-condition';
import type { Product } from '@/types/product';

function featuredToProduct(featured: FeaturedProduct): Product {
  return {
    id: featured.id,
    name: featured.name,
    code: featured.code ?? null,
    description: null,
    price: featured.price,
    prices: ensureFullPrices({ public: featured.price }),
    currency: 'USD',
    image_url: featured.image,
    stock: 1,
    category: featured.category,
    brand: featured.brand ?? null,
    attributes: featured.attributes ?? [],
    sort_order: 0,
    is_featured: false,
    view_count: 0,
    price_role: 'public',
    created_at: new Date(0).toISOString(),
  };
}

function normalizeProductsByCondition(
  sectionId: HomeCatalogSectionPayload['id'],
  source: Partial<Record<ProductCondition, FeaturedProduct[]>>,
): Record<ProductCondition, FeaturedProduct[]> {
  const normalized = {} as Record<ProductCondition, FeaturedProduct[]>;
  for (const condition of getConditionsForCatalogFamily(sectionId)) {
    normalized[condition] = source[condition] ?? [];
  }
  return normalized;
}

function applyViewAsToFeatured(
  sections: HomeCatalogSectionPayload[],
  effectiveRole: string,
): HomeCatalogSectionPayload[] {
  return sections.map((section) => {
    const productsByCondition = normalizeProductsByCondition(
      section.id,
      section.productsByCondition,
    );
    for (const condition of getConditionsForCatalogFamily(section.id)) {
      const items = productsByCondition[condition];
      const asProducts = applyViewAsPriceToProducts(items.map(featuredToProduct), effectiveRole);
      productsByCondition[condition] = items.map((item, index) => ({
        ...item,
        price: asProducts[index]?.price ?? item.price,
      }));
    }
    return { ...section, productsByCondition };
  });
}

function normalizeBundleSections(
  sections: HomeCatalogSectionPayload[],
): HomeCatalogSectionPayload[] {
  return sections.map((section) => ({
    ...section,
    productsByCondition: normalizeProductsByCondition(section.id, section.productsByCondition),
  }));
}

function normalizeBundle(payload: HomeCatalogBundleResponse): HomeCatalogBundleResponse {
  return {
    ...payload,
    sections: normalizeBundleSections(payload.sections),
  };
}

function applyViewAsToBundle(
  payload: HomeCatalogBundleResponse,
  effectiveRole: string,
): HomeCatalogBundleResponse {
  return {
    featured: applyViewAsPriceToProducts(payload.featured, effectiveRole),
    sections: applyViewAsToFeatured(payload.sections, effectiveRole),
  };
}

export function useHomeCatalogBundle() {
  const { role, viewAsRoles, effectiveRole } = useAuth();

  return useQuery({
    queryKey: [HOME_CATALOG_BUNDLE_QUERY_KEY, role, viewAsRolesQueryKey(viewAsRoles)],
    queryFn: fetchHomeCatalogBundleForDisplay,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8_000),
    placeholderData: (previous) =>
      previous ?? readStoredHomeCatalogBundle() ?? undefined,
    initialData: () => {
      if (role !== 'public' || viewAsRoles.length > 0) return undefined;
      return readStoredHomeCatalogBundle();
    },
    initialDataUpdatedAt: () => {
      const cached = readStoredHomeCatalogBundle();
      return cached ? Date.now() - 1000 * 60 : undefined;
    },
    select: (payload) => {
      const normalized = normalizeBundle(payload);
      return shouldApplyViewAsPriceTransform(viewAsRoles)
        ? applyViewAsToBundle(normalized, effectiveRole)
        : normalized;
    },
  });
}

export function useHomeCatalogBundleSections(sectionIds: string[]) {
  const query = useHomeCatalogBundle();
  const sectionKey = sectionIds.join(',');

  const data = useMemo(() => {
    if (!query.data) return undefined;
    const idSet = new Set(sectionIds);
    return {
      sections: query.data.sections.filter((section) => idSet.has(section.id)),
    };
  }, [query.data, sectionKey, sectionIds]);

  return {
    ...query,
    data,
  };
}

export function useHomeCatalogBundleFeatured() {
  const query = useHomeCatalogBundle();
  return {
    ...query,
    data: query.data?.featured ?? [],
  };
}
