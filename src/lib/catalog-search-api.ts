import { apiFetch } from '@/lib/api';
import type { Product } from '@/types/product';

export async function searchCatalogProducts(
  query: string,
  options?: { categoryFilter?: string; limit?: number },
): Promise<{ products: Product[]; total: number }> {
  const params = new URLSearchParams({
    q: query,
    cat: options?.categoryFilter ?? 'all',
    limit: String(options?.limit ?? 50),
  });
  return apiFetch(`/api/products/search?${params}`);
}
