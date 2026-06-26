/** Ruta pública del PNG de marca de agua (fondo transparente). */
export const HAITECH_WATERMARK_PUBLIC_PATH = '/brand/haitech-watermark.png';

/** Opacidad del overlay CSS en vitrina (0–1). Debe ser baja para no distraer. */
export const PRODUCT_IMAGE_WATERMARK_OVERLAY_OPACITY = 0.14;

/** Opacidad al incrustar la marca en imágenes (servidor). */
export const PRODUCT_IMAGE_WATERMARK_COMPOSITE_OPACITY = 0.2;

/**
 * @param {string} url
 * @returns {string}
 */
function productImageUrlPathname(url) {
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

/**
 * Assets del sitio que no deben llevar marca de agua de producto.
 * @param {unknown} url
 * @returns {boolean}
 */
export function isDecorativeNonProductImageUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return true;
  const path = productImageUrlPathname(url);
  return (
    path.includes('/brand/haitech-watermark') ||
    path.includes('/favicon') ||
    path.endsWith('/logo.png') ||
    path.endsWith('/logo.ico') ||
    path.startsWith('/hero/')
  );
}

/**
 * Imágenes que deben persistirse con marca de agua incrustada (servidor).
 * @param {unknown} url
 * @returns {boolean}
 */
export function shouldWatermarkProductImage(url) {
  if (typeof url !== 'string' || !url.trim()) return false;
  if (isDecorativeNonProductImageUrl(url)) return false;
  if (url.startsWith('data:image/')) return true;
  if (url.startsWith('/products/') || url.startsWith('/album/')) return true;
  if (url.includes('/products/') || url.includes('/album/')) return true;
  return false;
}

/**
 * Overlay CSS en vitrina e inventario (todas las fotos de producto visibles).
 * @param {unknown} url
 * @returns {boolean}
 */
export function shouldShowProductImageWatermarkOverlay(url) {
  if (typeof url !== 'string' || !url.trim()) return false;
  if (!isProductImageWatermarkEnabled()) return false;
  if (isDecorativeNonProductImageUrl(url)) return false;
  if (url.startsWith('data:image/')) return true;
  if (url.startsWith('http://') || url.startsWith('https://')) return true;
  if (url.startsWith('/')) return true;
  return false;
}

/**
 * @returns {boolean}
 */
export function isProductImageWatermarkEnabled() {
  return process.env.HAISTORE_DISABLE_WATERMARK !== '1';
}
