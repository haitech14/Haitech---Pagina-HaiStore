export const HAITECH_WATERMARK_SRC = '/brand/haitech-watermark.png';

/** Clases del logo superpuesto (centrado, discreto sobre el producto). */
export const PRODUCT_IMAGE_WATERMARK_OVERLAY_CLASS =
  'pointer-events-none absolute left-1/2 top-1/2 z-[2] w-[40%] min-w-[3rem] max-w-[9.5rem] -translate-x-1/2 -translate-y-1/2 select-none sm:max-w-[10rem]';

/** Variante compacta para miniaturas de búsqueda y filas en vista lista. */
export const PRODUCT_IMAGE_WATERMARK_OVERLAY_COMPACT_CLASS =
  'pointer-events-none absolute left-1/2 top-1/2 z-[2] w-[45%] min-w-0 max-w-[1.75rem] -translate-x-1/2 -translate-y-1/2 select-none sm:max-w-[2rem]';

/** Opacidad del overlay (mantener alineado con shared/product-image-watermark.js). */
export const PRODUCT_IMAGE_WATERMARK_OVERLAY_OPACITY = 0.14;

function productImageUrlPathname(url: string): string {
  const trimmed = url.trim();
  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return new URL(trimmed).pathname.toLowerCase();
    }
  } catch {
    // URL relativa o inválida
  }
  return trimmed.split('?')[0].split('#')[0].toLowerCase();
}

export function isDecorativeNonProductImageUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return true;
  const path = productImageUrlPathname(url);
  return (
    path.includes('/brand/haitech-watermark') ||
    path.includes('/favicon') ||
    path.endsWith('/logo.png') ||
    path.endsWith('/logo.ico') ||
    path.startsWith('/hero/')
  );
}

export function shouldWatermarkProductImage(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  if (isDecorativeNonProductImageUrl(url)) return false;
  if (url.startsWith('data:image/')) return true;
  if (url.startsWith('/products/') || url.startsWith('/album/')) return true;
  // URLs absolutas (p.ej. Supabase Storage / CDN) que contienen el path esperado.
  if (url.includes('/products/') || url.includes('/album/')) return true;
  return false;
}

export function isProductImageWatermarkEnabled(): boolean {
  return import.meta.env.VITE_HAISTORE_DISABLE_WATERMARK !== '1';
}

/** Overlay en vitrina solo para previews locales (data:). Imágenes en /products/ ya llevan marca en servidor. */
export function shouldShowProductImageWatermarkOverlay(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  if (!isProductImageWatermarkEnabled()) return false;
  if (isDecorativeNonProductImageUrl(url)) return false;
  if (url.startsWith('data:image/')) return true;
  return false;
}
