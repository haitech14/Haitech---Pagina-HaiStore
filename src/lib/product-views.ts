import { apiFetch } from '@/lib/api';
import { recordRecentlyViewedProduct } from '@/lib/recently-viewed-products';
import type { Product } from '@/types/product';

const STORAGE_KEY = 'haistore-product-views';

type ViewMap = Record<string, number>;

function readLocalViews(): ViewMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as ViewMap;
  } catch {
    return {};
  }
}

function writeLocalViews(views: ViewMap) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
  } catch {
    /* quota / modo privado */
  }
}

export function getLocalProductViewCount(productId: string): number {
  const count = readLocalViews()[productId];
  return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
}

export function recordLocalProductView(productId: string) {
  if (!productId.trim()) return;
  recordRecentlyViewedProduct(productId);
  const views = readLocalViews();
  views[productId] = (views[productId] ?? 0) + 1;
  writeLocalViews(views);
}

export async function recordProductView(productId: string) {
  if (!productId.trim()) return;
  recordLocalProductView(productId);
  try {
    await apiFetch<{ ok: boolean }>(`/api/products/${encodeURIComponent(productId)}/view`, {
      method: 'POST',
    });
  } catch {
    /* offline o migración pendiente */
  }
}

export function totalProductViews(product: Product): number {
  const server = Number.isFinite(Number(product.view_count)) ? Number(product.view_count) : 0;
  const local = getLocalProductViewCount(product.id);
  return Math.max(0, server + local);
}

function shuffleArray<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = copy[i];
    const b = copy[j];
    if (a !== undefined && b !== undefined) {
      copy[i] = b;
      copy[j] = a;
    }
  }
  return copy;
}

/** Elige al azar entre los productos con más visitas; si no hay datos, mezcla todo el catálogo. */
export function pickRandomMostViewedProducts(products: Product[], limit: number): Product[] {
  if (products.length === 0 || limit <= 0) return [];
  if (products.length <= limit) return shuffleArray(products);

  const scored = products
    .map((product) => ({ product, views: totalProductViews(product) }))
    .sort((a, b) => b.views - a.views || a.product.name.localeCompare(b.product.name, 'es'));

  const hasViews = scored.some((entry) => entry.views > 0);
  const pool = hasViews
    ? scored
        .filter((entry) => entry.views > 0)
        .slice(0, Math.max(limit * 2, limit))
        .map((entry) => entry.product)
    : scored.map((entry) => entry.product);

  return shuffleArray(pool).slice(0, limit);
}
