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
import { getPublicProductsDir } from './persist-product-media.js';

function shouldUseStockFallback(options) {
  return options?.stockFallback !== false;
}

function isCategoryStockImageUrl(url) {
  return (
    url.startsWith('/categories/') ||
    url.startsWith('/promotions/') ||
    url.startsWith('/promo-cards/')
  );
}

function isSyntheticStockImageUrl(product, url) {
  if (url === resolveProductModelStockImage(product)) return true;
  if (url === resolveProductCategoryStockImage(product)) return true;
  if (url === publicProductMediaPath(product?.id ?? '')) return true;
  return isCategoryStockImageUrl(url);
}

function isUsableProductImageUrl(product, url, options) {
  if (typeof url !== 'string' || url.length === 0) return false;
  if (url.startsWith('data:')) return false;
  if (!isImageMediaUrl(url)) return false;
  if (!shouldUseStockFallback(options) && isSyntheticStockImageUrl(product, url)) return false;
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
  const modelImage = resolveProductModelStockImage(product);
  if (modelImage) return modelImage;

  const id = String(product?.id ?? '').trim();
  if (id && productWebpExists(id)) {
    return publicProductMediaPath(id);
  }

  return resolveProductCategoryStockImage(product);
}

export function buildProductImageCandidates(product, options) {
  const candidates = [];
  const seen = new Set();

  const push = (url) => {
    if (!url || url.startsWith('data:') || seen.has(url)) return;
    if (!isUsableProductImageUrl(product, url, options)) return;
    seen.add(url);
    candidates.push(url);
  };

  push(product?.image_url);
  for (const url of product?.gallery ?? []) {
    push(url);
  }

  if (shouldUseStockFallback(options)) {
    push(resolveProductModelStockImage(product));
    const id = String(product?.id ?? '').trim();
    if (id && productWebpExists(id)) {
      push(publicProductMediaPath(id));
    }
    push(resolveProductCategoryStockImage(product));
  }

  return candidates;
}

export function resolveProductImageUrl(product, options) {
  const candidates = buildProductImageCandidates(product, options);
  return candidates[0] ?? null;
}

export function resolveProductGallery(product, options) {
  const gallery = Array.isArray(product?.gallery)
    ? product.gallery.filter((url) => typeof url === 'string' && url.length > 0)
    : [];
  if (gallery.length > 0) {
    return [...new Set(gallery)];
  }
  const image = resolveProductImageUrl(product, options);
  return image ? [image] : [];
}
