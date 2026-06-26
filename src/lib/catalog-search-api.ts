import { apiFetch } from '@/lib/api';
import { getCatalogRows, loadCatalogIndex } from '@/lib/catalog-featured';
import { filterProductsBySearch } from '@/lib/product-search';
import { toPublicProduct } from '@/lib/pricing';
import type { Product } from '@/types/product';

export async function searchCatalogProducts(
  query: string,
  options?: { categoryFilter?: string; limit?: number; role?: string },
): Promise<{ products: Product[]; total: number }> {
  const params = new URLSearchParams({
    q: query,
    cat: options?.categoryFilter ?? 'all',
    limit: String(options?.limit ?? 50),
  });
  try {
    return await apiFetch(`/api/products/search?${params}`);
  } catch {
    const role = options?.role ?? 'public';
    const rows = getCatalogRows().length > 0 ? getCatalogRows() : await loadCatalogIndex();
    const products = rows.map((row) => toPublicProduct(row, role));
    const matched = filterProductsBySearch(
      products,
      query,
      options?.categoryFilter ? { categoryFilter: options.categoryFilter } : {},
    );
    const limit = options?.limit ?? 50;
    return {
      products: matched.slice(0, limit),
      total: matched.length,
    };
  }
}