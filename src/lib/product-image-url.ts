import { isImageMediaUrl } from '@/lib/product-media';
import {
  publicProductMediaPath,
  resolveProductCategoryStockImage,
  resolveProductModelStockImage,
} from '@/lib/product-stock-images';

export type ResolveProductImageOptions = {
  /** Vista admin: permite previsualizar data: URL antes de persistir en disco. */
  allowDataUrl?: boolean;
  /** Si es false, no añade imágenes genéricas al resolver en cliente. */
  stockFallback?: boolean;
};

type ResolveProductImageInput = {
  image_url?: string | null;
  gallery?: string[] | null;
  id?: string;
  code?: string | null;
  name?: string;
  category?: string | null;
  brand?: string | null;
};

function shouldUseStockFallback(options?: ResolveProductImageOptions): boolean {
  return options?.stockFallback !== false;
}

function isCategoryStockImageUrl(url: string): boolean {
  return (
    url.startsWith('/categories/') ||
    url.startsWith('/promotions/') ||
    url.startsWith('/promo-cards/')
  );
}

function isSyntheticStockImageUrl(product: ResolveProductImageInput, url: string): boolean {
  if (url === resolveProductModelStockImage(product)) return true;
  if (url === resolveProductCategoryStockImage(product)) return true;
  if (url === publicProductMediaPath(product.id ?? '')) return true;
  return isCategoryStockImageUrl(url);
}

function isUsableExplicitImageUrl(url: string, options?: ResolveProductImageOptions): boolean {
  if (url.length === 0) return false;
  if (!isImageMediaUrl(url)) return false;
  if (url.startsWith('data:') && !options?.allowDataUrl) return false;
  return true;
}

function isUsableFallbackImageUrl(
  product: ResolveProductImageInput,
  url: string,
  options?: ResolveProductImageOptions,
): boolean {
  if (!isUsableExplicitImageUrl(url, options)) return false;
  if (!shouldUseStockFallback(options) && isSyntheticStockImageUrl(product, url)) return false;
  return true;
}

export function resolveProductStockImagePath(product: {
  id?: string;
  name?: string;
  category?: string | null;
  brand?: string | null;
}): string {
  const modelImage = resolveProductModelStockImage(product);
  if (modelImage) return modelImage;

  const id = String(product.id ?? '').trim();
  if (id) {
    return publicProductMediaPath(id);
  }

  return resolveProductCategoryStockImage(product);
}

/** Candidatos en orden de prioridad para `<img>` con reintento en error. */
export function buildProductImageCandidates(
  product: ResolveProductImageInput,
  options?: ResolveProductImageOptions,
): string[] {
  const candidates: string[] = [];
  const seen = new Set<string>();

  const pushExplicit = (url: string | null | undefined) => {
    if (!url || seen.has(url)) return;
    if (!isUsableExplicitImageUrl(url, options)) return;
    seen.add(url);
    candidates.push(url);
  };

  const pushFallback = (url: string | null | undefined) => {
    if (!url || seen.has(url)) return;
    if (!isUsableFallbackImageUrl(product, url, options)) return;
    seen.add(url);
    candidates.push(url);
  };

  pushExplicit(product.image_url);
  for (const url of product.gallery ?? []) {
    pushExplicit(url);
  }

  if (shouldUseStockFallback(options)) {
    pushFallback(resolveProductModelStockImage(product));
    if (product.id) {
      pushFallback(publicProductMediaPath(product.id));
    }
    pushFallback(resolveProductCategoryStockImage(product));
  }

  return candidates;
}

/** URL pública para mostrar un producto (evita data: URLs que no persisten en Supabase). */
export function resolveProductImageUrl(
  product: ResolveProductImageInput,
  options?: ResolveProductImageOptions,
): string | null {
  const candidates = buildProductImageCandidates(product, options);
  return candidates[0] ?? null;
}

/** Galería completa del producto (imágenes, vídeos y YouTube). */
export function resolveProductGallery(
  product: ResolveProductImageInput,
  options?: ResolveProductImageOptions,
): string[] {
  const gallery = (product.gallery ?? []).filter(
    (url): url is string => typeof url === 'string' && url.length > 0,
  );
  if (gallery.length > 0) {
    return [...new Set(gallery)];
  }

  const image = resolveProductImageUrl(product, options);
  return image ? [image] : [];
}
