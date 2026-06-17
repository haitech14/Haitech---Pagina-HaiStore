import { isImageMediaUrl } from '@/lib/product-media';
import {
  publicProductMediaPath,
  resolveProductCategoryStockImage,
  resolveProductModelStockImage,
} from '@/lib/product-stock-images';

export type ResolveProductImageOptions = {
  /** Vista admin: permite previsualizar data: URL antes de persistir en disco. */
  allowDataUrl?: boolean;
  /** Si es false, no usa imágenes genéricas por categoría ni `/products/{id}.webp`. */
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

function isUsableProductImageUrl(
  product: ResolveProductImageInput,
  url: string,
  options?: ResolveProductImageOptions,
): boolean {
  if (url.length === 0) return false;
  if (!isImageMediaUrl(url)) return false;
  if (url.startsWith('data:') && !options?.allowDataUrl) return false;
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

  const push = (url: string | null | undefined) => {
    if (!url || url.startsWith('data:') || seen.has(url)) return;
    if (!isUsableProductImageUrl(product, url, options)) return;
    seen.add(url);
    candidates.push(url);
  };

  push(product.image_url);
  for (const url of product.gallery ?? []) {
    push(url);
  }

  if (shouldUseStockFallback(options)) {
    push(resolveProductModelStockImage(product));
    if (product.id) {
      push(publicProductMediaPath(product.id));
    }
    push(resolveProductCategoryStockImage(product));
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
