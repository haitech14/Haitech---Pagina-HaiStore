import sharp from 'sharp';

import { isImageMediaUrl } from '../../shared/product-media.js';
import {
  PRODUCT_IMAGE_MAX_EDGE,
  PRODUCT_IMAGE_WEBP_QUALITY,
} from '../../shared/product-media-upload-limits.js';
import { applyHaitechWatermark } from './image-watermark.js';

const WEBP_QUALITY = PRODUCT_IMAGE_WEBP_QUALITY;
/** Por debajo de esto no reoptimizar (ya es liviano para web). */
const MAX_BYTES_BEFORE_OPTIMIZE = 220_000;

/**
 * Redimensiona y comprime data URLs de imagen para inventario / settings.
 * @param {string | null | undefined} dataUrl
 * @param {{ maxEdge?: number }} [options]
 * @returns {Promise<string | null | undefined>}
 */
export async function optimizeImageDataUrl(dataUrl, options = {}) {
  const maxEdge = options.maxEdge ?? PRODUCT_IMAGE_MAX_EDGE;
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
    return dataUrl;
  }
  if (dataUrl.startsWith('data:image/svg') || dataUrl.startsWith('data:image/gif')) {
    return dataUrl;
  }

  try {
    const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : '';
    if (!base64) return dataUrl;

    const input = Buffer.from(base64, 'base64');
    if (input.length <= MAX_BYTES_BEFORE_OPTIMIZE) {
      const meta = await sharp(input).metadata();
      if (
        meta.width &&
        meta.height &&
        meta.width <= maxEdge &&
        meta.height <= maxEdge
      ) {
        return dataUrl;
      }
    }

    const rotated = await sharp(input).rotate().toBuffer();
    let trimmed = rotated;
    try {
      trimmed = await sharp(rotated).trim({ threshold: 12 }).toBuffer();
    } catch {
      trimmed = rotated;
    }

    const resized = await sharp(trimmed)
      .resize(maxEdge, maxEdge, { fit: 'inside', withoutEnlargement: true })
      .toBuffer();

    const watermarked = await applyHaitechWatermark(resized, {
      sourceUrl: 'data:image/upload',
    });

    const output = await sharp(watermarked)
      .webp({ quality: WEBP_QUALITY, effort: 4 })
      .toBuffer();

    return `data:image/webp;base64,${output.toString('base64')}`;
  } catch (error) {
    console.warn('[optimize-image]', error?.message ?? error);
    return dataUrl;
  }
}

/**
 * @param {{ image_url?: string | null, gallery?: string[] }} product
 */
export async function optimizeProductMedia(product) {
  const gallery = Array.isArray(product.gallery) ? product.gallery : [];
  const optimizedGallery = await Promise.all(
    gallery.map((url) =>
      typeof url === 'string' && url.startsWith('data:image/')
        ? optimizeImageDataUrl(url)
        : Promise.resolve(url),
    ),
  );
  const optimizedImageUrl = product.image_url
    ? typeof product.image_url === 'string' && product.image_url.startsWith('data:image/')
      ? await optimizeImageDataUrl(product.image_url)
      : product.image_url
    : null;

  const image_url = optimizedImageUrl ?? optimizedGallery.find((url) => isImageMediaUrl(url)) ?? null;
  const additionalGallery = dedupeUrls([
    ...optimizedGallery.filter((url) => url && url !== image_url),
  ]);

  return {
    ...product,
    image_url,
    gallery: additionalGallery,
  };
}

function dedupeUrls(urls) {
  const seen = new Set();
  const result = [];
  for (const url of urls) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    result.push(url);
  }
  return result;
}
