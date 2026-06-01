import sharp from 'sharp';

const WEBP_QUALITY = 82;
/** Por debajo de esto no reoptimizar (ya es liviano para web). */
const MAX_BYTES_BEFORE_OPTIMIZE = 140_000;

/**
 * Redimensiona y comprime data URLs de imagen para inventario / settings.
 * @param {string | null | undefined} dataUrl
 * @param {{ maxEdge?: number }} [options]
 * @returns {Promise<string | null | undefined>}
 */
export async function optimizeImageDataUrl(dataUrl, options = {}) {
  const maxEdge = options.maxEdge ?? 1200;
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

    const output = await sharp(input)
      .rotate()
      .resize(maxEdge, maxEdge, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
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
  const optimizedGallery = await Promise.all(gallery.map((url) => optimizeImageDataUrl(url)));
  const image_url = product.image_url
    ? await optimizeImageDataUrl(product.image_url)
    : optimizedGallery[0] ?? null;

  const deduped = [];
  const seen = new Set();
  for (const url of [image_url, ...optimizedGallery]) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    deduped.push(url);
  }

  return {
    ...product,
    image_url: deduped[0] ?? null,
    gallery: deduped,
  };
}
