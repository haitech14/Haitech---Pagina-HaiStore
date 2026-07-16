import { optimizeImageDataUrl, optimizeImageFile } from '@/lib/optimize-image-for-web';
import { randomId } from '@/lib/random-id';
import { normalizeAttributes } from '@/lib/inventory-attributes';
import { sanitizeStoredProductMedia } from '@/lib/product-media-sanitize';
import { normalizeProductCatalogStatus } from '../../shared/product-catalog-status.js';
import {
  isImageMediaUrl,
  isVideoMediaUrl,
  isYoutubeMediaUrl,
  normalizeYoutubeMediaUrl,
} from '@/lib/product-media';
import { normalizeAttachments } from '@/lib/inventory-attachments';
import { normalizeBundleComponents } from '@/lib/product-bundle';
import { normalizeSuppliers, resolvePurchasePriceUsd } from '@/lib/inventory-suppliers';
import { applyStockFields, DEFAULT_WAREHOUSES } from '@/lib/inventory-stock';
import { normalizeVolumeRolePrices } from '@/lib/product-volume-role-prices';
import { normalizeMerchandisingProductIds, normalizeMerchandisingOptionalProducts } from '@/lib/product-merchandising';
import { normalizeProductGalleryFields, appendProductGalleryUrls, getAdditionalGalleryUrls } from '@/lib/product-gallery';
import {
  MAX_PRODUCT_IMAGE_UPLOAD_BYTES,
  MAX_PRODUCT_VIDEO_UPLOAD_BYTES,
} from '@/lib/product-media-upload-limits';
import {
  heroBulletsToDescriptionText,
  normalizeStorefrontFeatureBar,
  normalizeStorefrontHeroBullets,
} from '@/lib/product-storefront-detail';
import { ensureFullPrices } from '@/lib/roles';
import type { InventoryProduct, ProductRolePrices } from '@/types/product';

async function optimizeProductImages(product: InventoryProduct): Promise<InventoryProduct> {
  const galleryFields = normalizeProductGalleryFields(product.image_url, product.gallery);
  const optimizedGallery = await Promise.all(
    galleryFields.gallery.map((url) =>
      url.startsWith('data:image/') ? optimizeImageDataUrl(url, 'product') : Promise.resolve(url),
    ),
  );
  const image_url = galleryFields.image_url
    ? galleryFields.image_url.startsWith('data:image/')
      ? await optimizeImageDataUrl(galleryFields.image_url, 'product')
      : galleryFields.image_url
    : optimizedGallery.find((url) => isImageMediaUrl(url)) ?? null;

  const normalized = normalizeProductGalleryFields(image_url, optimizedGallery);

  return {
    ...product,
    ...normalized,
  };
}

/** Payload listo para POST/PATCH al API de inventario (imágenes optimizadas). */
export async function prepareInventoryPayloadForApi(
  product: InventoryProduct,
  options?: { isCreate?: boolean },
): Promise<InventoryProduct> {
  const id = product.id?.trim() || (options?.isCreate ? randomId() : product.id);
  const prices = ensureFullPrices(product.prices) as ProductRolePrices;

  const suppliers = normalizeSuppliers(product.suppliers, product.purchase_price_usd);
  const attachments = normalizeAttachments(product.attachments);
  const attributes = normalizeAttributes(product.attributes);
  const storefront_feature_bar = normalizeStorefrontFeatureBar(product.storefront_feature_bar);
  const storefront_hero_bullets = Array.isArray(product.storefront_hero_bullets)
    ? normalizeStorefrontHeroBullets(product.storefront_hero_bullets)
    : undefined;
  const description =
    product.description?.trim() ||
    (storefront_hero_bullets && storefront_hero_bullets.length > 0
      ? heroBulletsToDescriptionText(storefront_hero_bullets)
      : product.description ?? null);

  const base: InventoryProduct = applyStockFields(
    {
      ...product,
      id,
      prices,
      volume_role_prices: normalizeVolumeRolePrices(product.volume_role_prices),
      suppliers,
      attachments,
      attributes,
      storefront_feature_bar,
      ...(storefront_hero_bullets !== undefined ? { storefront_hero_bullets } : {}),
      description,
      purchase_price_usd: resolvePurchasePriceUsd(suppliers, product.purchase_price_usd),
      code: product.code?.trim() || generateInventoryProductCode(id),
      gallery: product.gallery ?? [],
    },
    DEFAULT_WAREHOUSES,
  );

  return optimizeProductImages(base);
}

/** Código SKU corto a partir del id (UUID sin guiones). */
export function generateInventoryProductCode(id: string): string {
  const compact = id.replace(/-/g, '').toUpperCase();
  return compact.slice(0, 12) || compact;
}

export function createEmptyInventoryProduct(): InventoryProduct {
  const id = randomId();
  return {
    id,
    code: generateInventoryProductCode(id),
    slug: null,
    name: '',
    description: '',
    currency: 'USD',
    stock: 0,
    stock_by_warehouse: [{ warehouse_id: 'principal', quantity: 0 }],
    category: '',
    brand: '',
    image_url: null,
    gallery: [],
    purchase_price_usd: 0,
    suppliers: [],
    attachments: [],
    attributes: [],
    created_at: new Date().toISOString(),
    sort_order: 0,
    status: 'borrador',
    prices: ensureFullPrices({}),
    volume_role_prices: [],
  };
}

/** Asegura campos nuevos en productos legacy del JSON local. */
export function normalizeInventoryProduct(
  raw: Partial<InventoryProduct> & Pick<InventoryProduct, 'id' | 'name' | 'prices'>,
  warehouses = DEFAULT_WAREHOUSES,
): InventoryProduct {
  const prices = ensureFullPrices(raw.prices ?? { public: 0 });
  const publicPrice = prices.public ?? 0;
  const galleryFields = normalizeProductGalleryFields(raw.image_url, raw.gallery);
  const image_url = galleryFields.image_url;
  const gallery = galleryFields.gallery;
  const fallbackPurchase = Number(
    raw.purchase_price_usd ?? Math.round(publicPrice * 0.72 * 100) / 100,
  );
  const suppliers = normalizeSuppliers(raw.suppliers, fallbackPurchase);

  const withStock: InventoryProduct = {
      id: raw.id,
      slug: raw.slug?.trim() || null,
      code: raw.code?.trim() || raw.id.toUpperCase().replace(/-/g, ''),
      name: raw.name,
      description: raw.description ?? null,
      currency: raw.currency ?? 'USD',
      stock: Number(raw.stock ?? 0),
      stock_by_warehouse: raw.stock_by_warehouse ?? [],
      category: raw.category ?? null,
      brand: raw.brand ?? null,
      image_url,
      gallery,
      suppliers,
      attachments: normalizeAttachments(raw.attachments),
      attributes: normalizeAttributes(raw.attributes),
      bundle_components: normalizeBundleComponents(raw.bundle_components),
      cross_sell_product_ids: normalizeMerchandisingProductIds(raw.cross_sell_product_ids),
      upsell_product_ids: normalizeMerchandisingProductIds(raw.upsell_product_ids),
      variant_product_ids: normalizeMerchandisingProductIds(raw.variant_product_ids),
      cross_sell_optional_products: normalizeMerchandisingOptionalProducts(
        raw.cross_sell_optional_products,
      ),
      upsell_optional_products: normalizeMerchandisingOptionalProducts(
        raw.upsell_optional_products,
      ),
      purchase_price_usd: resolvePurchasePriceUsd(suppliers, fallbackPurchase),
      created_at: raw.created_at ?? new Date().toISOString(),
      sort_order: Number.isFinite(Number(raw.sort_order)) ? Number(raw.sort_order) : 0,
      is_featured: raw.is_featured === true,
      status: normalizeProductCatalogStatus(raw.status),
      view_count: Number.isFinite(Number(raw.view_count))
        ? Math.max(0, Math.floor(Number(raw.view_count)))
        : 0,
      prices,
      volume_role_prices: normalizeVolumeRolePrices(raw.volume_role_prices),
      storefront_feature_bar: normalizeStorefrontFeatureBar(raw.storefront_feature_bar),
      ...(Array.isArray(raw.storefront_hero_bullets)
        ? {
            storefront_hero_bullets: normalizeStorefrontHeroBullets(raw.storefront_hero_bullets),
          }
        : {}),
      ...(typeof raw.updated_at === 'string' ? { updated_at: raw.updated_at } : {}),
    };

  return applyStockFields(
    {
      ...withStock,
      ...sanitizeStoredProductMedia(withStock),
    },
    warehouses,
  );
}

/**
 * Normalización ligera para el listado admin (sin sanitize de media ni attachments/storefront).
 */
export function normalizeInventoryProductForAdminList(
  raw: Partial<InventoryProduct> & Pick<InventoryProduct, 'id' | 'name' | 'prices'>,
  warehouses = DEFAULT_WAREHOUSES,
): InventoryProduct {
  const prices = ensureFullPrices(raw.prices ?? { public: 0 });
  const publicPrice = prices.public ?? 0;
  const galleryFields = normalizeProductGalleryFields(raw.image_url, raw.gallery);
  const fallbackPurchase = Number(
    raw.purchase_price_usd ?? Math.round(publicPrice * 0.72 * 100) / 100,
  );
  const suppliers = normalizeSuppliers(raw.suppliers, fallbackPurchase);

  const withStock: InventoryProduct = {
    id: raw.id,
    slug: raw.slug?.trim() || null,
    code: raw.code?.trim() || raw.id.toUpperCase().replace(/-/g, ''),
    name: raw.name,
    description: null,
    currency: raw.currency ?? 'USD',
    stock: Number(raw.stock ?? 0),
    stock_by_warehouse: raw.stock_by_warehouse ?? [],
    category: raw.category ?? null,
    brand: raw.brand ?? null,
    image_url: galleryFields.image_url,
    gallery: galleryFields.gallery,
    suppliers,
    attachments: [],
    attributes: normalizeAttributes(raw.attributes),
    bundle_components: normalizeBundleComponents(raw.bundle_components),
    cross_sell_product_ids: normalizeMerchandisingProductIds(raw.cross_sell_product_ids),
    upsell_product_ids: normalizeMerchandisingProductIds(raw.upsell_product_ids),
    variant_product_ids: normalizeMerchandisingProductIds(raw.variant_product_ids),
    cross_sell_optional_products: normalizeMerchandisingOptionalProducts(
      raw.cross_sell_optional_products,
    ),
    upsell_optional_products: normalizeMerchandisingOptionalProducts(
      raw.upsell_optional_products,
    ),
    purchase_price_usd: resolvePurchasePriceUsd(suppliers, fallbackPurchase),
    created_at: raw.created_at ?? new Date().toISOString(),
    sort_order: Number.isFinite(Number(raw.sort_order)) ? Number(raw.sort_order) : 0,
    is_featured: raw.is_featured === true,
    status: normalizeProductCatalogStatus(raw.status),
    view_count: Number.isFinite(Number(raw.view_count))
      ? Math.max(0, Math.floor(Number(raw.view_count)))
      : 0,
    prices,
    volume_role_prices: normalizeVolumeRolePrices(raw.volume_role_prices),
    ...(typeof raw.updated_at === 'string' ? { updated_at: raw.updated_at } : {}),
  };

  return applyStockFields(withStock, warehouses);
}

/** Fusiona un patch parcial sin perder precios u otros campos anidados. */
export function mergeInventoryProductPatch(
  product: InventoryProduct,
  patch: Partial<InventoryProduct>,
  warehouses = DEFAULT_WAREHOUSES,
): InventoryProduct {
  const merged: InventoryProduct = {
    ...product,
    ...patch,
    prices: patch.prices ? { ...product.prices, ...patch.prices } : product.prices,
  };

  if (patch.gallery !== undefined) merged.gallery = patch.gallery;
  if (patch.attributes !== undefined) merged.attributes = patch.attributes;
  if (patch.suppliers !== undefined) merged.suppliers = patch.suppliers;
  if (patch.attachments !== undefined) merged.attachments = patch.attachments;
  if (patch.stock_by_warehouse !== undefined) {
    merged.stock_by_warehouse = patch.stock_by_warehouse;
  }
  if (patch.volume_role_prices !== undefined) {
    merged.volume_role_prices = patch.volume_role_prices;
  }
  if (patch.cross_sell_product_ids !== undefined) {
    merged.cross_sell_product_ids = patch.cross_sell_product_ids;
  }
  if (patch.upsell_product_ids !== undefined) {
    merged.upsell_product_ids = patch.upsell_product_ids;
  }
  if (patch.variant_product_ids !== undefined) {
    merged.variant_product_ids = patch.variant_product_ids;
  }
  if (patch.cross_sell_optional_products !== undefined) {
    merged.cross_sell_optional_products = patch.cross_sell_optional_products;
  }
  if (patch.upsell_optional_products !== undefined) {
    merged.upsell_optional_products = patch.upsell_optional_products;
  }

  return normalizeInventoryProductForAdminList(merged, warehouses);
}

/** Añade imágenes a la galería (y foto principal si no había). */
export async function appendGalleryImagesToProduct(
  product: InventoryProduct,
  files: File[],
): Promise<Pick<InventoryProduct, 'image_url' | 'gallery'>> {
  if (files.length === 0) {
    return { image_url: product.image_url, gallery: product.gallery ?? [] };
  }

  const urls = await Promise.all(files.map((file) => readImageFile(file)));
  return appendGalleryUrlsToProduct(product, urls);
}

const MAX_VIDEO_BYTES = MAX_PRODUCT_VIDEO_UPLOAD_BYTES;

function assertImageUploadSize(file: File): void {
  if (file.size > MAX_PRODUCT_IMAGE_UPLOAD_BYTES) {
    throw new Error(
      `La imagen supera el límite de ${Math.round(MAX_PRODUCT_IMAGE_UPLOAD_BYTES / (1024 * 1024))} MB`,
    );
  }
}

/** Lee y comprime una imagen para uso web en inventario (~1200px, WebP). */
export function readImageFile(file: File): Promise<string> {
  assertImageUploadSize(file);
  return optimizeImageFile(file, 'product');
}

/** Añade vídeos MP4 a la galería. */
export async function appendGalleryVideosToProduct(
  product: InventoryProduct,
  files: File[],
): Promise<Pick<InventoryProduct, 'image_url' | 'gallery'>> {
  if (files.length === 0) {
    return { image_url: product.image_url, gallery: product.gallery ?? [] };
  }

  const urls = await Promise.all(files.map((file) => readVideoFile(file)));
  return appendGalleryUrlsToProduct(product, urls);
}

/** Añade una URL de YouTube a la galería. */
export function appendYoutubeToProduct(
  product: InventoryProduct,
  youtubeInput: string,
): Pick<InventoryProduct, 'image_url' | 'gallery'> {
  const url = normalizeYoutubeMediaUrl(youtubeInput);
  if (!url) {
    throw new Error('URL de YouTube inválida');
  }
  return appendGalleryUrlsToProduct(product, [url]);
}

function appendGalleryUrlsToProduct(
  product: InventoryProduct,
  urls: string[],
): Pick<InventoryProduct, 'image_url' | 'gallery'> {
  return appendProductGalleryUrls(product.image_url, product.gallery, urls);
}

/** Reemplaza una URL de la galería o la foto principal por otra. */
export function replaceProductMediaUrl(
  product: InventoryProduct,
  targetUrl: string | null,
  newUrl: string,
): Pick<InventoryProduct, 'image_url' | 'gallery'> {
  const { image_url, gallery } = normalizeProductGalleryFields(product.image_url, product.gallery);

  if (!targetUrl) {
    return normalizeProductGalleryFields(newUrl, gallery);
  }

  const isMain = image_url === targetUrl;
  const nextGallery = gallery.map((url) => (url === targetUrl ? newUrl : url));

  if (isMain) {
    return normalizeProductGalleryFields(newUrl, nextGallery);
  }

  return normalizeProductGalleryFields(image_url, nextGallery);
}

/** Marca una URL de la galería como foto principal (solo imágenes). */
export function setProductMainMediaUrl(
  product: InventoryProduct,
  url: string,
): Pick<InventoryProduct, 'image_url' | 'gallery'> {
  if (!isImageMediaUrl(url)) {
    throw new Error('La foto principal debe ser una imagen');
  }

  const trimmed = url.trim();
  const main = product.image_url?.trim() ?? null;
  const gallery = getAdditionalGalleryUrls(main, product.gallery);
  const nextGallery = gallery.filter((item) => item !== trimmed);
  if (main && main !== trimmed) {
    nextGallery.unshift(main);
  }

  return {
    image_url: trimmed,
    gallery: getAdditionalGalleryUrls(trimmed, nextGallery),
  };
}

const PRODUCT_CARD_VARIANT_SUFFIX = /-(?:256|512|1024)\.webp(?:$|\?)/i;

/** Reemplaza la foto principal y descarta variantes -256/-512/-1024 obsoletas. */
export function replaceProductMainImage(
  product: InventoryProduct,
  url: string,
): Pick<InventoryProduct, 'image_url' | 'gallery'> {
  const media = setProductMainMediaUrl(product, url);
  const cleanedGallery = (media.gallery ?? []).filter((item) => {
    const path = item.split('?')[0] ?? '';
    if (!path.startsWith('/products/')) return true;
    return !PRODUCT_CARD_VARIANT_SUFFIX.test(item);
  });

  return {
    image_url: media.image_url,
    gallery: getAdditionalGalleryUrls(media.image_url, cleanedGallery),
  };
}

/** Quita una imagen de la galería (y la principal si aplica). */
export function removeProductMediaUrl(
  product: InventoryProduct,
  targetUrl: string,
): Pick<InventoryProduct, 'image_url' | 'gallery'> {
  const { image_url, gallery } = normalizeProductGalleryFields(product.image_url, product.gallery);
  const nextGallery = gallery.filter((url) => url !== targetUrl);
  const nextMain = image_url === targetUrl ? (nextGallery.find((url) => isImageMediaUrl(url)) ?? null) : image_url;

  return normalizeProductGalleryFields(nextMain, nextGallery);
}

export function getProductMediaUrls(product: InventoryProduct): string[] {
  const { image_url, gallery } = sanitizeStoredProductMedia(product);
  const normalized = normalizeProductGalleryFields(image_url, gallery);
  const urls: string[] = [];
  const seen = new Set<string>();
  for (const url of [normalized.image_url, ...normalized.gallery]) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    urls.push(url);
  }
  return urls;
}

export function getProductVideoUrl(product: InventoryProduct): string | null {
  return getProductMediaUrls(product).find((url) => isVideoMediaUrl(url) || isYoutubeMediaUrl(url)) ?? null;
}

function stripVideoUrlsFromProduct(
  product: InventoryProduct,
): Pick<InventoryProduct, 'image_url' | 'gallery'> {
  const { image_url, gallery } = normalizeProductGalleryFields(product.image_url, product.gallery);
  const nextGallery = gallery.filter((url) => !isVideoMediaUrl(url) && !isYoutubeMediaUrl(url));
  const nextMain =
    image_url && (isVideoMediaUrl(image_url) || isYoutubeMediaUrl(image_url))
      ? (nextGallery.find((url) => isImageMediaUrl(url)) ?? null)
      : image_url;

  return normalizeProductGalleryFields(nextMain, nextGallery);
}

export function setProductVideoUrl(
  product: InventoryProduct,
  videoUrl: string | null,
): Pick<InventoryProduct, 'image_url' | 'gallery'> {
  const cleared = stripVideoUrlsFromProduct(product);
  if (!videoUrl?.trim()) {
    return cleared;
  }
  return appendGalleryUrlsToProduct({ ...product, ...cleared }, [videoUrl.trim()]);
}

/** Lee un vídeo MP4 como data URL para persistir en el servidor. */
export function readVideoFile(file: File): Promise<string> {
  if (!file.type.startsWith('video/') && !/\.mp4$/i.test(file.name)) {
    throw new Error('Solo se admiten vídeos MP4');
  }
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error(
      `El vídeo supera el límite de ${Math.round(MAX_VIDEO_BYTES / (1024 * 1024))} MB`,
    );
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('No se pudo leer el vídeo'));
    };
    reader.onerror = () => reject(new Error('No se pudo leer el vídeo'));
    reader.readAsDataURL(file);
  });
}

/** Extrae archivos de imagen del portapapeles (Ctrl+V). */
export function getImageFilesFromClipboard(
  dataTransfer: DataTransfer | null,
): File[] {
  if (!dataTransfer) return [];
  const files: File[] = [];
  for (const item of dataTransfer.items) {
    if (item.kind !== 'file' || !item.type.startsWith('image/')) continue;
    const file = item.getAsFile();
    if (file) files.push(file);
  }
  return files;
}
