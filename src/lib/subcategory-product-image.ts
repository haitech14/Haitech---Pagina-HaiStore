import { subcategoryStockImage } from '@/data/subcategory-images';
import { productMatchesCategoryFilter } from '@/lib/inventory-categories';
import { subcategoryVisualKind } from '@/lib/subcategory-visual';
import type { Product } from '@/types/product';

interface SubcategoryImageSource {
  name: string;
  slug: string;
  image?: string | null;
  inventoryLabels?: string[];
}

function productHaystack(product: Product): string {
  return `${product.category ?? ''} ${product.name} ${product.description ?? ''}`.toLowerCase();
}

function productMatchesSubcategoryName(product: Product, subName: string): boolean {
  const haystack = productHaystack(product);
  const sub = subName.toLowerCase();

  if (sub.includes('remanufactur') || sub.includes('reacondicion')) {
    return haystack.includes('remanufactur') || haystack.includes('reacondicion');
  }

  if (sub.includes('nueva') || sub.includes('nuevo')) {
    if (haystack.includes('remanufactur') || haystack.includes('reacondicion')) return false;
    if (haystack.includes('nueva') || haystack.includes('nuevo')) return true;
    if (sub.includes('multifuncional') && haystack.includes('multifuncional')) return true;
    if (sub.includes('impresor') && haystack.includes('impresor')) return true;
  }

  const tokens = sub
    .split(/\s+/)
    .filter((word) => word.length > 3 && !['para', 'con', 'los', 'las'].includes(word));

  return tokens.some((token) => haystack.includes(token));
}

function scoreProductForSubcategory(product: Product, sub: SubcategoryImageSource): number {
  const haystack = productHaystack(product);
  const subName = sub.name.toLowerCase();
  let score = product.image_url ? 10 : 0;

  for (const label of sub.inventoryLabels ?? []) {
    if (productMatchesCategoryFilter(product, label)) score += 20;
  }

  if (productMatchesSubcategoryName(product, sub.name)) score += 15;

  if (subName.includes('remanufactur') && haystack.includes('remanufactur')) score += 12;
  if (subName.includes('nueva') && !haystack.includes('remanufactur')) score += 8;

  return score;
}

export function resolveSubcategoryImage(
  sub: SubcategoryImageSource,
  products: Product[],
  parentImage?: string | null,
): string | null {
  const configured = sub.image?.trim();
  if (configured) return configured;

  const ranked = products
    .filter((product) => Boolean(product.image_url))
    .map((product) => ({ product, score: scoreProductForSubcategory(product, sub) }))
    .filter((entry) => entry.score >= 10)
    .sort((a, b) => b.score - a.score);

  const best = ranked[0]?.product.image_url;
  if (best) return best;

  const kind = subcategoryVisualKind(sub.name);
  if (kind === 'new' || kind === 'refurbished') {
    const stock = subcategoryStockImage(sub.name, sub.slug);
    if (stock) return stock;
  }

  return subcategoryStockImage(sub.name, sub.slug) ?? parentImage ?? null;
}
