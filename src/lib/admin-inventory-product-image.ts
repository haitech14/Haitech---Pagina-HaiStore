import { isImageMediaUrl } from '@/lib/product-media';
import { imageBasePath } from '@/lib/responsive-image';
import type { InventoryProduct } from '@/types/product';

function pathnameOf(url: string): string {
  return url.split('?')[0].split('#')[0];
}

function isLocalProductImagePath(path: string): boolean {
  return path.startsWith('/products/') || path.startsWith('/album/');
}

function isResponsiveVariantPath(path: string): boolean {
  return /-(?:256|512|1024)\.webp$/i.test(path);
}

/** Variantes locales para reintento si la imagen principal aún no está disponible.
 * Prioriza -256 (rápido en tabla) y limita a 3 candidatos para evitar cascadas de 404.
 */
function productImageVariantPaths(url: string): string[] {
  const path = pathnameOf(url);
  if (!path.startsWith('/products/') || isResponsiveVariantPath(path)) {
    return [url];
  }

  const base = imageBasePath(path);
  const query = url.includes('?') ? url.slice(url.indexOf('?')) : '';
  return [
    `${base}-256.webp${query}`,
    url,
    `${base}-512.webp${query}`,
  ];
}

/**
 * Candidatos para preview al hover: prioriza full-res / -1024 / -512
 * (mejor calidad que la miniatura -256).
 */
function productImageHoverPreviewPaths(url: string): string[] {
  const path = pathnameOf(url);
  const query = url.includes('?') ? url.slice(url.indexOf('?')) : '';

  if (!path.startsWith('/products/')) {
    return [url];
  }

  const base = isResponsiveVariantPath(path)
    ? path.replace(/-(?:256|512|1024)\.webp$/i, '')
    : imageBasePath(path);

  return [
    `${base}.webp${query}`,
    `${base}-1024.webp${query}`,
    `${base}-512.webp${query}`,
    `${base}-256.webp${query}`,
    url,
  ];
}

export function extractProductImageCacheVersion(
  url: string | null | undefined,
  updatedAt?: string | null,
): string | null {
  if (url) {
    const match = url.match(/[?&]v=([^&#]+)/);
    if (match?.[1]) return decodeURIComponent(match[1]);
  }

  if (updatedAt) {
    const timestamp = Date.parse(updatedAt);
    if (!Number.isNaN(timestamp)) return String(timestamp);
  }

  return null;
}

export function withProductImageCacheBust(
  url: string,
  updatedAt?: string | null,
): string {
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;

  const version = extractProductImageCacheVersion(url, updatedAt);
  if (!version) return url;

  const [path, existingQuery] = url.split('?');
  const params = new URLSearchParams(existingQuery ?? '');
  params.set('v', version);
  return `${path}?${params.toString()}`;
}

/**
 * Candidatos para miniatura en admin: usa el inventario tal cual (sin sanitizar
 * placeholders de catálogo) y admite data:/blob: para previsualización optimista.
 */
export function buildAdminInventoryImageCandidates(
  product: Pick<InventoryProduct, 'image_url' | 'gallery'>,
  optimisticSrc?: string | null,
): string[] {
  const candidates: string[] = [];
  const seen = new Set<string>();

  const push = (raw: string | null | undefined) => {
    if (!raw?.trim()) return;
    const url = raw.trim();
    if (!isImageMediaUrl(url)) return;

    const pushUnique = (candidate: string) => {
      const key = pathnameOf(candidate);
      if (seen.has(key)) return;
      seen.add(key);
      candidates.push(candidate);
    };

    if (url.startsWith('data:') || url.startsWith('blob:') || /^https?:\/\//i.test(url)) {
      pushUnique(url);
      return;
    }

    if (isLocalProductImagePath(pathnameOf(url))) {
      for (const variant of productImageVariantPaths(url)) {
        pushUnique(variant);
      }
      return;
    }

    pushUnique(url);
  };

  if (optimisticSrc) push(optimisticSrc);
  push(product.image_url);
  const firstGallery = (product.gallery ?? []).find((item) => isImageMediaUrl(item));
  if (firstGallery && firstGallery !== product.image_url) push(firstGallery);

  return candidates.slice(0, 3);
}

export function hasAdminInventoryProductImage(
  product: Pick<InventoryProduct, 'image_url' | 'gallery'>,
  optimisticSrc?: string | null,
): boolean {
  return buildAdminInventoryImageCandidates(product, optimisticSrc).length > 0;
}

/**
 * Candidatos de mayor resolución para la ventana flotante al pasar el mouse.
 */
export function buildAdminInventoryHoverPreviewCandidates(
  product: Pick<InventoryProduct, 'image_url' | 'gallery'>,
  optimisticSrc?: string | null,
): string[] {
  const candidates: string[] = [];
  const seen = new Set<string>();

  const push = (raw: string | null | undefined) => {
    if (!raw?.trim()) return;
    const url = raw.trim();
    if (!isImageMediaUrl(url)) return;

    const pushUnique = (candidate: string) => {
      const key = pathnameOf(candidate);
      if (seen.has(key)) return;
      seen.add(key);
      candidates.push(candidate);
    };

    if (url.startsWith('data:') || url.startsWith('blob:') || /^https?:\/\//i.test(url)) {
      pushUnique(url);
      return;
    }

    if (isLocalProductImagePath(pathnameOf(url))) {
      for (const variant of productImageHoverPreviewPaths(url)) {
        pushUnique(variant);
      }
      return;
    }

    pushUnique(url);
  };

  if (optimisticSrc) push(optimisticSrc);
  push(product.image_url);
  for (const item of product.gallery ?? []) push(item);

  return candidates;
}
