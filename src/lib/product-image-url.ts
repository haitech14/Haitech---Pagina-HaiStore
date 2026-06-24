import { isImageMediaUrl } from '@/lib/product-media';
import { isSyntheticProductMediaUrl } from '../../shared/product-media-sanitize.js';
import {
  publicProductMediaPath,
  resolveProductCategoryStockImage,
  resolveProductModelStockImage,
} from '@/lib/product-stock-images';

export type ResolveProductImageOptions = {
  /** Vista admin: permite previsualizar data: URL antes de persistir en disco. */
  allowDataUrl?: boolean;
  /** Solo con true se añaden imágenes genéricas por categoría/modelo. */
  stockFallback?: boolean;
};

export type ResolveProductImageInput = {
  image_url?: string | null;
  gallery?: string[] | null;
  id?: string;
  code?: string | null;
  name?: string;
  category?: string | null;
  brand?: string | null;
};

function shouldUseStockFallback(options?: ResolveProductImageOptions): boolean {
  return options?.stockFallback === true;
}

function isUsableExplicitImageUrl(url: string, options?: ResolveProductImageOptions): boolean {
  if (url.length === 0) return false;
  if (!isImageMediaUrl(url)) return false;
  if (url.startsWith('data:') && !options?.allowDataUrl) return false;
  return true;
}

function isUsableStoredImageUrl(
  product: ResolveProductImageInput,
  url: string,
  options?: ResolveProductImageOptions,
): boolean {
  if (!isUsableExplicitImageUrl(url, options)) return false;
  if (isSyntheticProductMediaUrl(product, url)) return false;
  return true;
}

export function resolveProductStockImagePath(product: {
  id?: string;
  name?: string;
  category?: string | null;
  brand?: string | null;
  code?: string | null;
}): string | null {
  return resolveProductImageUrl(product);
}

/** Candidatos en orden de prioridad para `<img>` con reintento en error. */
export function buildProductImageCandidates(
  product: ResolveProductImageInput,
  options?: ResolveProductImageOptions,
): string[] {
  const candidates: string[] = [];
  const seen = new Set<string>();

  const pushStored = (url: string | null | undefined) => {
    if (!url || seen.has(url)) return;
    if (!isUsableStoredImageUrl(product, url, options)) return;
    seen.add(url);
    candidates.push(url);
  };

  const pushFallback = (url: string | null | undefined) => {
    if (!url || seen.has(url)) return;
    if (!shouldUseStockFallback(options)) return;
    if (!isUsableExplicitImageUrl(url, options)) return;
    seen.add(url);
    candidates.push(url);
  };

  pushStored(product.image_url);
  for (const url of product.gallery ?? []) {
    pushStored(url);
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

/** Segunda imagen de galería para hover en tarjetas (`gallery[1]`, sin duplicar la principal). */
export function resolveProductCardHoverImage(
  product: ResolveProductImageInput,
  options?: ResolveProductImageOptions,
): string | null {
  const primary = typeof product.image_url === 'string' ? product.image_url.trim() : '';
  const gallery = Array.isArray(product.gallery) ? product.gallery : [];

  const pick = (url: string | null | undefined): string | null => {
    if (!url || !isUsableStoredImageUrl(product, url, options)) return null;
    if (primary && url === primary) return null;
    return url;
  };

  const secondGallery = pick(gallery[1]);
  if (secondGallery) return secondGallery;

  for (const url of gallery) {
    const resolved = pick(url);
    if (resolved) return resolved;
  }

  return null;
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
  const authentic = (product.gallery ?? []).filter(
    (url): url is string =>
      typeof url === 'string' &&
      url.length > 0 &&
      isUsableStoredImageUrl(product, url, options),
  );
  if (authentic.length > 0) {
    return [...new Set(authentic)];
  }

  const image = resolveProductImageUrl(product, options);
  return image ? [image] : [];
}

export { publicProductMediaPath } from '@/lib/product-stock-images';
