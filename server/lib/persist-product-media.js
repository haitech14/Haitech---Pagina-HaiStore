import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import sharp from 'sharp';

import { applyHaitechWatermark } from './image-watermark.js';
import { getPublicAlbumDir } from './server-paths.js';
import {
  isVideoMediaUrl,
  isYoutubeMediaUrl,
  normalizeYoutubeMediaUrl,
} from '../../shared/product-media.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const WEBP_QUALITY = 82;
const MAX_EDGE = 1200;
const PRODUCT_CARD_VARIANTS = [
  { suffix: '-256', width: 256 },
  { suffix: '-512', width: 512 },
];

export function getPublicProductsDir() {
  if (process.env.HAISTORE_PUBLIC_PRODUCTS_DIR) {
    return process.env.HAISTORE_PUBLIC_PRODUCTS_DIR;
  }
  return path.join(__dirname, '../../public/products');
}

function sanitizeProductId(productId) {
  return String(productId ?? 'product')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function publicProductMediaPath(productId, index = 0) {
  const base = sanitizeProductId(productId);
  const suffix = index > 0 ? `-${index + 1}` : '';
  return `/products/${base}${suffix}.webp`;
}

export function publicProductVideoPath(productId, videoIndex = 0) {
  const base = sanitizeProductId(productId);
  const suffix = videoIndex > 0 ? `-video-${videoIndex + 1}` : '-video';
  return `/products/${base}${suffix}.mp4`;
}

function countPersistedImages(urls) {
  return urls.filter(
    (url) =>
      typeof url === 'string' &&
      !isYoutubeMediaUrl(url) &&
      !isVideoMediaUrl(url) &&
      !url.startsWith('data:'),
  ).length;
}

function countPersistedVideos(urls) {
  return urls.filter(
    (url) => typeof url === 'string' && (isVideoMediaUrl(url) || url.startsWith('data:video/')),
  ).length;
}

function mediaPathname(url) {
  return String(url).split('?')[0].split('#')[0];
}

async function exportBufferToProductWebp(input, filePath, sourceUrl) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  const rotated = await sharp(input).rotate().toBuffer();
  let trimmed = rotated;
  try {
    trimmed = await sharp(rotated).trim({ threshold: 12 }).toBuffer();
  } catch {
    trimmed = rotated;
  }

  const resized = await sharp(trimmed)
    .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
    .toBuffer();

  const watermarked = await applyHaitechWatermark(resized, { sourceUrl });

  const output = await sharp(watermarked)
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  await fs.writeFile(filePath, output);
  return true;
}

/** Regenera variantes responsive de tarjetas (-256, -512) tras actualizar la imagen base. */
async function writeProductCardVariants(mainFilePath) {
  const parsed = path.parse(mainFilePath);
  const input = await fs.readFile(mainFilePath);

  for (const { suffix, width } of PRODUCT_CARD_VARIANTS) {
    const variantPath = path.join(parsed.dir, `${parsed.name}${suffix}.webp`);
    const output = await sharp(input)
      .resize(width, width, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    await fs.writeFile(variantPath, output);
  }
}

async function persistProductImageFile(absolutePath, writeFile) {
  await writeFile();
  await writeProductCardVariants(absolutePath);
}

async function exportDataUrlToFile(dataUrl, filePath) {
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : '';
  if (!base64) return false;

  const input = Buffer.from(base64, 'base64');
  return exportBufferToProductWebp(input, filePath, '/products/upload');
}

async function exportAlbumUrlToProductFile(albumUrl, filePath) {
  const sourcePath = path.join(getPublicAlbumDir(), path.basename(mediaPathname(albumUrl)));
  const input = await fs.readFile(sourcePath);
  return exportBufferToProductWebp(input, filePath, '/album/import');
}

async function resolveProductImageCacheSuffix(absolutePath, imageIndex) {
  if (imageIndex !== 0) return '';
  try {
    await fs.access(absolutePath);
    return `?v=${Date.now()}`;
  } catch {
    return '';
  }
}

async function exportVideoDataUrlToFile(dataUrl, filePath) {
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : '';
  if (!base64) return false;

  const input = Buffer.from(base64, 'base64');
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, input);
  return true;
}

function resolvePersistedUrl(url) {
  if (isYoutubeMediaUrl(url)) return url;
  const normalizedYoutube = normalizeYoutubeMediaUrl(url);
  if (normalizedYoutube) return normalizedYoutube;
  if (!url.startsWith('data:')) return url;
  return null;
}

/**
 * Convierte data: URLs del producto en archivos estáticos en public/products
 * y sustituye las referencias por rutas públicas servibles en Vercel.
 */
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

async function refreshProductCardVariantsForUrl(imageUrl, publicDir) {
  const pathname = mediaPathname(imageUrl);
  if (!pathname.startsWith('/products/')) return false;

  const absolutePath = path.join(publicDir, path.basename(pathname));
  try {
    await fs.access(absolutePath);
    await writeProductCardVariants(absolutePath);
    return true;
  } catch {
    return false;
  }
}

function isImageProductUrl(url) {
  return (
    typeof url === 'string' &&
    !isYoutubeMediaUrl(url) &&
    !isVideoMediaUrl(url) &&
    /\.(webp|png|jpe?g|avif)$/i.test(mediaPathname(url))
  );
}

export async function persistProductMedia(product) {
  if (!product?.id) return product;

  const gallery = Array.isArray(product.gallery)
    ? product.gallery.filter((url) => typeof url === 'string' && url.length > 0)
    : [];
  const explicitMain =
    typeof product.image_url === 'string' ? product.image_url.trim() : null;
  const sourceUrls = dedupeUrls([explicitMain, ...gallery]).filter(Boolean);

  if (sourceUrls.length === 0) return product;

  const publicDir = getPublicProductsDir();
  const nextGallery = [];
  const mainSourceIndex = explicitMain ? sourceUrls.indexOf(explicitMain) : 0;

  for (const url of sourceUrls) {
    if (url.startsWith('data:image/')) {
      const imageIndex = countPersistedImages(nextGallery);
      const publicPath = publicProductMediaPath(product.id, imageIndex);
      const absolutePath = path.join(publicDir, path.basename(publicPath.split('?')[0]));
      const cacheSuffix = await resolveProductImageCacheSuffix(absolutePath, imageIndex);
      try {
        await persistProductImageFile(absolutePath, () => exportDataUrlToFile(url, absolutePath));
        nextGallery.push(`${publicPath}${cacheSuffix}`);
      } catch (error) {
        console.warn('[persist-media]', product.id, error?.message ?? error);
        nextGallery.push(url);
      }
      continue;
    }

    if (url.startsWith('data:video/')) {
      const videoIndex = countPersistedVideos(nextGallery);
      const publicPath = publicProductVideoPath(product.id, videoIndex);
      const absolutePath = path.join(publicDir, path.basename(publicPath));
      try {
        await exportVideoDataUrlToFile(url, absolutePath);
        nextGallery.push(publicPath);
      } catch (error) {
        console.warn('[persist-media]', product.id, error?.message ?? error);
        nextGallery.push(url);
      }
      continue;
    }

    if (mediaPathname(url).startsWith('/album/')) {
      const imageIndex = countPersistedImages(nextGallery);
      const publicPath = publicProductMediaPath(product.id, imageIndex);
      const absolutePath = path.join(publicDir, path.basename(publicPath.split('?')[0]));
      const cacheSuffix = await resolveProductImageCacheSuffix(absolutePath, imageIndex);
      try {
        await persistProductImageFile(absolutePath, () => exportAlbumUrlToProductFile(url, absolutePath));
        nextGallery.push(`${publicPath}${cacheSuffix}`);
      } catch (error) {
        console.warn('[persist-media] album', product.id, error?.message ?? error);
        nextGallery.push(url);
      }
      continue;
    }

    const persisted = resolvePersistedUrl(url);
    if (persisted) {
      nextGallery.push(persisted);
    }
  }

  const image_url = (() => {
    if (mainSourceIndex >= 0 && mainSourceIndex < nextGallery.length) {
      const entry = nextGallery[mainSourceIndex];
      if (entry && !isYoutubeMediaUrl(entry) && !isVideoMediaUrl(entry)) {
        return entry;
      }
    }
    return (
      nextGallery.find(
        (entry) => !isYoutubeMediaUrl(entry) && !isVideoMediaUrl(entry),
      ) ?? null
    );
  })();

  const additionalGallery = nextGallery.filter((entry) => entry !== image_url);

  let finalImageUrl = image_url;
  if (finalImageUrl && isImageProductUrl(finalImageUrl)) {
    const refreshed = await refreshProductCardVariantsForUrl(finalImageUrl, publicDir);
    if (refreshed && finalImageUrl.includes('?')) {
      finalImageUrl = mediaPathname(finalImageUrl);
    }
  }

  return {
    ...product,
    image_url: finalImageUrl,
    gallery: additionalGallery.length > 0 ? additionalGallery : [],
  };
}

export async function persistProductsMedia(products) {
  if (!Array.isArray(products)) return [];
  const persisted = [];
  for (const product of products) {
    persisted.push(await persistProductMedia(product));
  }
  return persisted;
}
