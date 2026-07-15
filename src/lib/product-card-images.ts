import { getCatalogProductById } from '@/lib/catalog-featured';
import {
  buildProductImageCandidates,
  buildProductStoredImageCandidates,
  resolveProductCardHoverImage,
  type ResolveProductImageInput,
  type ResolveProductImageOptions,
} from '@/lib/product-image-url';
import { sanitizeStoredProductMedia } from '@/lib/product-media-sanitize';

function mergeGallery(
  primary?: string[] | null,
  secondary?: string[] | null,
): string[] | null {
  const merged = [...new Set([...(primary ?? []), ...(secondary ?? [])])].filter(Boolean);
  return merged.length > 0 ? merged : null;
}

/** Une inventario/API con el catálogo estático para reintentos de imagen en tarjetas. */
export function buildProductCardImageSource(
  product: ResolveProductImageInput & { id?: string },
): ResolveProductImageInput {
  const catalog = product.id ? getCatalogProductById(product.id) : undefined;

  const source: ResolveProductImageInput = {
    code: product.code ?? catalog?.code ?? null,
    category: product.category ?? catalog?.category ?? null,
    brand: product.brand ?? catalog?.brand ?? null,
    image_url: product.image_url ?? catalog?.image_url ?? null,
    gallery: mergeGallery(product.gallery, catalog?.gallery),
  };

  if (product.id) source.id = product.id;
  const name = product.name ?? catalog?.name;
  if (name) source.name = name;

  const sanitized = sanitizeStoredProductMedia({
    id: source.id ?? product.id ?? '',
    code: source.code,
    name: source.name,
    category: source.category,
    brand: source.brand,
    image_url: source.image_url,
    gallery: source.gallery,
  });

  return {
    ...source,
    image_url: sanitized.image_url,
    gallery: sanitized.gallery,
  };
}

export function buildProductCardImageCandidates(
  product: ResolveProductImageInput & { id?: string },
  options?: ResolveProductImageOptions,
): string[] {
  return buildProductImageCandidates(buildProductCardImageSource(product), {
    stockFallback: false,
    ...options,
  });
}

/** Candidatos de inventario para fallback de hover (sin imágenes genéricas por modelo). */
export function buildProductCardStoredImageCandidates(
  product: ResolveProductImageInput & { id?: string },
  options?: ResolveProductImageOptions,
): string[] {
  return buildProductStoredImageCandidates(buildProductCardImageSource(product), {
    ...options,
  });
}

export function resolveProductCardHoverImageFromProduct(
  product: ResolveProductImageInput & { id?: string },
  options?: ResolveProductImageOptions,
): string | null {
  return resolveProductCardHoverImage(buildProductCardImageSource(product), {
    stockFallback: false,
    ...options,
  });
}
