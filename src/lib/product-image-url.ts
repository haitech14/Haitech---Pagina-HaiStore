import { isImageMediaUrl } from '@/lib/product-media';
import { isSyntheticProductMediaUrl, sanitizeStoredProductMedia } from '../../shared/product-media-sanitize.js';
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

function withSanitizedProductMedia(product: ResolveProductImageInput): ResolveProductImageInput {
  const sanitized = sanitizeStoredProductMedia({
    id: product.id ?? '',
    code: product.code,
    name: product.name,
    category: product.category,
    brand: product.brand,
    image_url: product.image_url,
    gallery: product.gallery,
  });

  return {
    ...product,
    image_url: sanitized.image_url,
    gallery: sanitized.gallery,
  };
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
  const sanitizedProduct = withSanitizedProductMedia(product);
  const candidates: string[] = [];
  const seen = new Set<string>();

  const pushStored = (url: string | null | undefined) => {
    if (!url || seen.has(url)) return;
    if (!isUsableStoredImageUrl(sanitizedProduct, url, options)) return;
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

  pushStored(sanitizedProduct.image_url);
  for (const url of sanitizedProduct.gallery ?? []) {
    pushStored(url);
  }

  // Si sanitize vació la media pero el inventario aún declara URLs, reintentarlas
  // contra el producto original (p. ej. foto elegida del álbum/inventario).
  if (candidates.length === 0) {
    const pushDeclared = (url: string | null | undefined) => {
      if (!url || seen.has(url)) return;
      if (!isUsableExplicitImageUrl(url, options)) return;
      if (isCategoryStockLike(url)) return;
      if (isSyntheticProductMediaUrl(product, url)) return;
      seen.add(url);
      candidates.push(url);
    };
    pushDeclared(product.image_url);
    for (const url of product.gallery ?? []) pushDeclared(url);
  }

  // Convención local: muchos ítems tienen /products/{id}.webp en disco aunque
  // inventory-index tenga image_url null. El <img> cae a «Sin Imagen» solo si 404.
  if (candidates.length === 0 && sanitizedProduct.id) {
    const ownedPath = publicProductMediaPath(sanitizedProduct.id);
    if (ownedPath && !seen.has(ownedPath) && isUsableExplicitImageUrl(ownedPath, options)) {
      seen.add(ownedPath);
      candidates.push(ownedPath);
    }
  }

  if (shouldUseStockFallback(options)) {
    pushFallback(resolveProductModelStockImage(sanitizedProduct));
    if (sanitizedProduct.id) {
      pushFallback(publicProductMediaPath(sanitizedProduct.id));
    }
    pushFallback(resolveProductCategoryStockImage(sanitizedProduct));
  }

  return candidates;
}

function isCategoryStockLike(url: string): boolean {
  return (
    url.startsWith('/categories/') ||
    url.startsWith('/promotions/') ||
    url.startsWith('/promo-cards/')
  );
}

/** Solo fotos del inventario (principal + galería), sin placeholders por modelo/categoría. */
export function buildProductStoredImageCandidates(
  product: ResolveProductImageInput,
  options?: ResolveProductImageOptions,
): string[] {
  return buildProductImageCandidates(product, { ...options, stockFallback: false });
}

/** Primera imagen adicional de galería para hover en tarjetas (sin duplicar la principal). */
export function resolveProductCardHoverImage(
  product: ResolveProductImageInput,
  options?: ResolveProductImageOptions,
): string | null {
  const sanitizedProduct = withSanitizedProductMedia(product);
  const primary =
    typeof sanitizedProduct.image_url === 'string' ? sanitizedProduct.image_url.trim() : '';
  const gallery = Array.isArray(sanitizedProduct.gallery) ? sanitizedProduct.gallery : [];

  const pick = (url: string | null | undefined): string | null => {
    if (!url || !isUsableStoredImageUrl(sanitizedProduct, url, options)) return null;
    if (primary && url === primary) return null;
    return url;
  };

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
  const sanitizedProduct = withSanitizedProductMedia(product);
  const authentic = (sanitizedProduct.gallery ?? []).filter(
    (url): url is string =>
      typeof url === 'string' &&
      url.length > 0 &&
      isUsableStoredImageUrl(sanitizedProduct, url, options),
  );
  if (authentic.length > 0) {
    return [...new Set(authentic)];
  }

  const image = resolveProductImageUrl(product, options);
  return image ? [image] : [];
}

export { publicProductMediaPath } from '@/lib/product-stock-images';
