import { getCatalogProductById } from '@/lib/catalog-featured';
import {
  buildProductImageCandidates,
  resolveProductCardHoverImage,
  type ResolveProductImageInput,
  type ResolveProductImageOptions,
} from '@/lib/product-image-url';

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

  return source;
}

export function buildProductCardImageCandidates(
  product: ResolveProductImageInput & { id?: string },
  options?: ResolveProductImageOptions,
): string[] {
  return buildProductImageCandidates(buildProductCardImageSource(product), {
    stockFallback: true,
    ...options,
  });
}

export function resolveProductCardHoverImageFromProduct(
  product: ResolveProductImageInput & { id?: string },
  options?: ResolveProductImageOptions,
): string | null {
  return resolveProductCardHoverImage(buildProductCardImageSource(product), {
    stockFallback: true,
    ...options,
  });
}
