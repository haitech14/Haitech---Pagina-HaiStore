export const HAITECH_WATERMARK_SRC = '/brand/haitech-watermark.png';

export function shouldWatermarkProductImage(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  if (url.startsWith('data:image/')) return true;
  if (url.startsWith('/products/')) return true;
  // URLs absolutas (p.ej. Supabase Storage / CDN) que contienen el path esperado.
  if (url.includes('/products/')) return true;
  return false;
}

export function isProductImageWatermarkEnabled(): boolean {
  return import.meta.env.VITE_HAISTORE_DISABLE_WATERMARK !== '1';
}

/** Overlay en vitrina (detalle + catálogo). */
export function shouldShowProductImageWatermarkOverlay(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  if (!isProductImageWatermarkEnabled()) return false;
  return shouldWatermarkProductImage(url);
}
