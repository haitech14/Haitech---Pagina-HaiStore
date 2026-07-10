/** Límite de subida de imagen cruda antes de optimizar en cliente/servidor. */
export const MAX_PRODUCT_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;

/** Límite de adjuntos de producto (ficha, driver, manual, etc.). */
export const MAX_PRODUCT_ATTACHMENT_UPLOAD_BYTES = 25 * 1024 * 1024;

/** Límite de vídeo MP4 en galería de producto. */
export const MAX_PRODUCT_VIDEO_UPLOAD_BYTES = 200 * 1024 * 1024;

/**
 * Límite de body JSON en Express: cubre data URLs base64 (~4/3 del binario)
 * del vídeo más grande más overhead del payload.
 */
export const MAX_PRODUCT_UPLOAD_JSON_BODY = '300mb';

/** Borde máximo tras optimización (px). */
export const PRODUCT_IMAGE_MAX_EDGE = 1200;

/**
 * @param {number} bytes
 * @returns {string}
 */
export function formatUploadBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10_240 ? 1 : 0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(bytes < 10_485_760 ? 1 : 0)} MB`;
}

export const PRODUCT_IMAGE_UPLOAD_HINT = `JPG, PNG o WebP · máx. ${formatUploadBytes(MAX_PRODUCT_IMAGE_UPLOAD_BYTES)} por imagen (se optimiza a ${PRODUCT_IMAGE_MAX_EDGE}px)`;

export const PRODUCT_ATTACHMENT_UPLOAD_HINT = `Máx. ${formatUploadBytes(MAX_PRODUCT_ATTACHMENT_UPLOAD_BYTES)}`;

export const PRODUCT_VIDEO_UPLOAD_HINT = `MP4 · máx. ${formatUploadBytes(MAX_PRODUCT_VIDEO_UPLOAD_BYTES)} por vídeo`;
