import {
  isImageMediaUrl,
  isVideoMediaUrl,
  isYoutubeMediaUrl,
} from './product-media.js';
import { mergeDuplicateProductMediaUrls, productMediaCanonicalKey } from './product-media-dedupe.js';
import { getAdditionalGalleryUrls } from './product-gallery.js';
import {
  publicProductMediaPath,
  resolveProductCategoryStockImage,
  resolveProductModelStockImage,
  sanitizeProductId,
} from './product-stock-images.js';
import { DUPLICATE_MAIN_PRODUCT_IDS } from './product-media-duplicate-main-ids.js';

function isCategoryStockImageUrl(url) {
  return (
    url.startsWith('/categories/') ||
    url.startsWith('/promotions/') ||
    url.startsWith('/promo-cards/')
  );
}

function storedMediaUrls(product) {
  return dedupeUrls([
    product?.image_url,
    ...(Array.isArray(product?.gallery) ? product.gallery : []),
  ]);
}

function isStoredMediaUrl(product, url) {
  const key = productMediaCanonicalKey(url);
  return storedMediaUrls(product).some(
    (stored) => productMediaCanonicalKey(stored) === key,
  );
}

function productMediaPathname(url) {
  return String(url).split('?')[0].split('#')[0];
}

function productMediaFilenameStem(url) {
  const match = productMediaPathname(url).match(/^\/products\/(.+)\.webp$/i);
  return match ? match[1].toLowerCase() : null;
}

function ownedProductMediaStems(product) {
  const stems = new Set();
  const id = sanitizeProductId(product?.id);
  if (id) stems.add(id);

  const code = String(product?.code ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (code) {
    stems.add(code);
    stems.add(`toner-${code}`);
  }

  return stems;
}

function isExtraAuthenticProductPhotoPath(url) {
  const path = productMediaPathname(url);
  if (/^https?:\/\//i.test(path)) return true;
  if (/\/products\/.+-(?:2|3)\.webp$/i.test(path)) return true;
  return false;
}

/**
 * Galería copiada por sync-missing-catalog-images (categoría/modelo/donor),
 * con solo variantes de tarjeta (-256/-512), sin fotos reales adicionales.
 */
function isSyncGeneratedFallbackProductGallery(product) {
  const imagePaths = storedMediaUrls(product).filter(
    (url) =>
      isImageMediaUrl(url) &&
      !isYoutubeMediaUrl(url) &&
      !isVideoMediaUrl(url) &&
      !String(url).startsWith('data:'),
  );
  if (imagePaths.length === 0) return false;
  if (imagePaths.some(isExtraAuthenticProductPhotoPath)) return false;

  const mainPath = productMediaPathname(publicProductMediaPath(product?.id ?? ''));
  if (!mainPath.startsWith('/products/')) return false;

  const stem = mainPath.replace(/\.webp$/i, '');
  const variant256 = `${stem}-256.webp`;
  const variant512 = `${stem}-512.webp`;
  const variant1024 = `${stem}-1024.webp`;

  const normalized = imagePaths.map(productMediaPathname);
  if (!normalized.includes(variant256) || !normalized.includes(variant512)) return false;
  if (normalized.includes(variant1024)) return false;

  return normalized.every(
    (path) => path === mainPath || path === variant256 || path === variant512,
  );
}

/** Señales de que el usuario subió o eligió medios reales (no placeholder de sync). */
function hasAuthenticUserMedia(urls) {
  return urls.some((url) => {
    if (typeof url !== 'string' || url.length === 0) return false;
    if (url.startsWith('data:')) return true;
    if (url.includes('?v=')) return true;
    return isExtraAuthenticProductPhotoPath(url);
  });
}

/** Imagen principal idéntica a la de otros productos (copia de sync/donor). */
function isDuplicateMainProductGallery(product) {
  const id = sanitizeProductId(product?.id);
  if (!id || !DUPLICATE_MAIN_PRODUCT_IDS.has(id)) return false;

  const urls = storedMediaUrls(product);
  if (hasAuthenticUserMedia(urls)) return false;

  return !urls.some((url) => /^https?:\/\//i.test(productMediaPathname(url)));
}

/** Imagen en /products/ que pertenece a este producto (no tomada de otro ítem). */
export function isOwnedProductMediaPath(product, url) {
  if (!String(url).startsWith('/products/')) return true;

  const stem = productMediaFilenameStem(url);
  if (!stem) return false;

  const owned = ownedProductMediaStems(product);
  if (owned.has(stem)) return true;

  for (const own of owned) {
    if (stem.startsWith(`${own}-`)) return true;
  }

  return false;
}

/** URL de stock / placeholder, no subida por el usuario. */
export function isSyntheticProductMediaUrl(product, url) {
  if (typeof url !== 'string' || url.length === 0) return true;
  if (url.startsWith('data:')) return false;

  // Medios persistidos en inventario (subida del usuario o importación).
  if (isStoredMediaUrl(product, url)) {
    if (isCategoryStockImageUrl(url)) return true;
    if (isYoutubeMediaUrl(url) || isVideoMediaUrl(url)) return false;
    if (url.startsWith('/products/')) {
      if (!isOwnedProductMediaPath(product, url)) return true;
      if (isDuplicateMainProductGallery(product)) return true;
      if (isSyncGeneratedFallbackProductGallery(product)) return true;
      return false;
    }
    if (url.startsWith('http://') || url.startsWith('https://')) return false;
    return false;
  }

  if (url === resolveProductModelStockImage(product)) return true;
  if (url === resolveProductCategoryStockImage(product)) return true;
  if (isCategoryStockImageUrl(url)) return true;

  if (url.startsWith('/products/') && !isOwnedProductMediaPath(product, url)) return true;

  const path = productMediaPathname(url);
  const id = sanitizeProductId(product?.id);
  const mainPath = id ? publicProductMediaPath(product.id) : null;

  if (id) {
    if (mainPath && productMediaCanonicalKey(path) === productMediaCanonicalKey(mainPath)) {
      return !isStoredMediaUrl(product, url);
    }
    if (new RegExp(`^/products/${id}-\\d+\\.webp$`, 'i').test(path)) return true;
  }

  return false;
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

/** Conserva la galería real guardada (sin placeholders de catálogo). */
export function sanitizeStoredProductMedia(product) {
  const candidates = dedupeUrls([
    product?.image_url,
    ...(Array.isArray(product?.gallery) ? product.gallery : []),
  ]);

  const authentic = mergeDuplicateProductMediaUrls(
    candidates.filter((url) => !isSyntheticProductMediaUrl(product, url)),
  );
  const images = authentic.filter(isImageMediaUrl);
  const explicitMain = typeof product?.image_url === 'string' ? product.image_url.trim() : null;
  let image_url = null;

  if (explicitMain && !isSyntheticProductMediaUrl(product, explicitMain)) {
    if (authentic.includes(explicitMain)) {
      image_url = explicitMain;
    } else if (isImageMediaUrl(explicitMain)) {
      const explicitKey = productMediaCanonicalKey(explicitMain);
      image_url =
        authentic.find(
          (url) => isImageMediaUrl(url) && productMediaCanonicalKey(url) === explicitKey,
        ) ?? null;
    }
  }

  if (!image_url) {
    image_url = images[0] ?? null;
  }

  return {
    image_url,
    gallery: getAdditionalGalleryUrls(image_url, authentic),
  };
}
