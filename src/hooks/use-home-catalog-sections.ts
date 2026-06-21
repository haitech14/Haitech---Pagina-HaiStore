import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import type { FeaturedProduct } from '@/data/featured-products';
import { apiFetch } from '@/lib/api';
import type { ProductCondition } from '@/lib/product-condition';
import type { CatalogFamilySlug } from '@/lib/product-condition';
import { applyViewAsPriceToProducts } from '@/lib/view-as-role';
import { ensureFullPrices } from '@/lib/roles';
import type { Product } from '@/types/product';

export const HOME_CATALOG_SECTIONS_QUERY_KEY = 'home-catalog-sections';

export interface HomeCatalogSectionPayload {
  id: CatalogFamilySlug;
  productsByCondition: Record<ProductCondition, FeaturedProduct[]>;
}

interface HomeCatalogSectionsResponse {
  sections: HomeCatalogSectionPayload[];
}

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

function applyViewAsToFeatured(
  sections: HomeCatalogSectionPayload[],
  effectiveRole: string,
): HomeCatalogSectionPayload[] {
  return sections.map((section) => {
    const productsByCondition = {} as Record<ProductCondition, FeaturedProduct[]>;
    for (const [condition, items] of Object.entries(section.productsByCondition)) {
      const asProducts = applyViewAsPriceToProducts(items.map(featuredToProduct), effectiveRole);
      productsByCondition[condition as ProductCondition] = items.map((item, index) => ({
        ...item,
        price: asProducts[index]?.price ?? item.price,
      }));
    }
    return { ...section, productsByCondition };
  });
}

async function fetchHomeCatalogSections(sectionIds: string[], limit: number) {
  const params = new URLSearchParams({
    sections: sectionIds.join(','),
    limit: String(limit),
  });
  return apiFetch<HomeCatalogSectionsResponse>(`/api/products/home-sections?${params}`);
}

export function useHomeCatalogSections(sectionIds: string[], limit = 10) {
  const { role, viewAsRole, effectiveRole } = useAuth();
  const enabled = sectionIds.length > 0;

  return useQuery({
    queryKey: [HOME_CATALOG_SECTIONS_QUERY_KEY, sectionIds.join(','), limit, role, viewAsRole],
    queryFn: () => fetchHomeCatalogSections(sectionIds, limit),
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    select: (payload) =>
      viewAsRole
        ? { sections: applyViewAsToFeatured(payload.sections, effectiveRole) }
        : payload,
  });
}
