/**
 * Resuelve una URL pública servible (Vercel /public) para vitrina y API.
 * Los data: URLs no se persisten en Supabase ni deben enviarse al cliente.
 */
import fs from 'fs';
import path from 'path';

import {
  publicProductMediaPath,
  resolveProductCategoryStockImage,
  resolveProductModelStockImage,
} from '../../shared/product-stock-images.js';
import { isImageMediaUrl } from '../../shared/product-media.js';
import { isSyntheticProductMediaUrl } from '../../shared/product-media-sanitize.js';
import { getPublicProductsDir } from './persist-product-media.js';

function shouldUseStockFallback(options) {
  return options?.stockFallback === true;
}

function isUsableExplicitImageUrl(url, options) {
  if (typeof url !== 'string' || url.length === 0) return false;
  if (url.startsWith('data:')) return false;
  if (!isImageMediaUrl(url)) return false;
  return true;
}

function isUsableStoredImageUrl(product, url, options) {
  if (!isUsableExplicitImageUrl(url, options)) return false;
  if (isSyntheticProductMediaUrl(product, url)) return false;
  return true;
}

function productWebpExists(productId) {
  const id = String(productId ?? '').trim();
  if (!id) return false;

  try {
    const filePath = path.join(getPublicProductsDir(), `${publicProductMediaPath(id).split('/').pop()}`);
    fs.accessSync(filePath);
    return true;
  } catch {
    return false;
  }
}

export function resolveProductStockImagePath(product) {
  return resolveProductImageUrl(product);
}

export function buildProductImageCandidates(product, options) {
  const candidates = [];
  const seen = new Set();

  const pushStored = (url) => {
    if (!url || seen.has(url)) return;
    if (!isUsableStoredImageUrl(product, url, options)) return;
    seen.add(url);
    candidates.push(url);
  };

  const pushFallback = (url) => {
    if (!url || seen.has(url)) return;
    if (!shouldUseStockFallback(options)) return;
    if (!isUsableExplicitImageUrl(url, options)) return;
    seen.add(url);
    candidates.push(url);
  };

  pushStored(product?.image_url);
  for (const url of product?.gallery ?? []) {
    pushStored(url);
  }

  // Si inventory tiene image_url null pero el webp propio existe en disco, usarlo.
  const id = String(product?.id ?? '').trim();
  if (candidates.length === 0 && id && productWebpExists(id)) {
    const ownedPath = publicProductMediaPath(id);
    if (ownedPath && !seen.has(ownedPath)) {
      seen.add(ownedPath);
      candidates.push(ownedPath);
    }
  }

  if (shouldUseStockFallback(options)) {
    pushFallback(resolveProductModelStockImage(product));
    if (id && productWebpExists(id)) {
      pushFallback(publicProductMediaPath(id));
    }
    pushFallback(resolveProductCategoryStockImage(product));
  }

  return candidates;
}

export function resolveProductImageUrl(product, options) {
  const candidates = buildProductImageCandidates(product, options);
  return candidates[0] ?? null;
}

export function resolveProductGallery(product, options) {
  const authentic = (product?.gallery ?? []).filter(
    (url) => typeof url === 'string' && url.length > 0 && isUsableStoredImageUrl(product, url, options),
  );
  if (authentic.length > 0) {
    return [...new Set(authentic)];
  }
  const image = resolveProductImageUrl(product, options);
  return image ? [image] : [];
}
