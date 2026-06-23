/** Ruta pública del PNG de marca de agua (fondo transparente). */
export const HAITECH_WATERMARK_PUBLIC_PATH = '/brand/haitech-watermark.png';

/**
 * Imágenes que deben persistirse con marca de agua incrustada (servidor).
 * @param {unknown} url
 * @returns {boolean}
 */
export function shouldWatermarkProductImage(url) {
  if (typeof url !== 'string' || !url.trim()) return false;
  if (url.startsWith('data:image/')) return true;
  if (url.startsWith('/products/')) return true;
  if (url.includes('/products/')) return true;
  return false;
}

/**
 * Overlay CSS en vitrina (solo previsualizaciones data: antes de guardar).
 * @param {unknown} url
 * @returns {boolean}
 */
export function shouldShowProductImageWatermarkOverlay(url) {
  if (typeof url !== 'string' || !url.trim()) return false;
  if (!isProductImageWatermarkEnabled()) return false;
  return shouldWatermarkProductImage(url);
}

/**
 * @returns {boolean}
 */
export function isProductImageWatermarkEnabled() {
  return process.env.HAISTORE_DISABLE_WATERMARK !== '1';
}
