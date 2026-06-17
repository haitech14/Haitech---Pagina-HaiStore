import { optimizeImageDataUrl, optimizeImageFile } from '@/lib/optimize-image-for-web';
import { randomId } from '@/lib/random-id';
import { normalizeAttributes } from '@/lib/inventory-attributes';
import { sanitizeStoredProductMedia } from '@/lib/product-media-sanitize';
import {
  isImageMediaUrl,
  normalizeYoutubeMediaUrl,
} from '@/lib/product-media';
import { normalizeAttachments } from '@/lib/inventory-attachments';
import { normalizeSuppliers, resolvePurchasePriceUsd } from '@/lib/inventory-suppliers';
import { applyStockFields, DEFAULT_WAREHOUSES } from '@/lib/inventory-stock';
import { ensureFullPrices } from '@/lib/roles';
import type { InventoryProduct, ProductRolePrices } from '@/types/product';

async function optimizeProductImages(product: InventoryProduct): Promise<InventoryProduct> {
  const gallery = product.gallery ?? [];
  const optimizedGallery = await Promise.all(
    gallery.map((url) =>
      url.startsWith('data:image/') ? optimizeImageDataUrl(url, 'product') : Promise.resolve(url),
    ),
  );
  const image_url = product.image_url
    ? product.image_url.startsWith('data:image/')
      ? await optimizeImageDataUrl(product.image_url, 'product')
      : product.image_url
    : optimizedGallery.find((url) => isImageMediaUrl(url)) ?? null;

  const deduped: string[] = [];
  const seen = new Set<string>();
  for (const url of [image_url, ...optimizedGallery]) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    deduped.push(url);
  }

  const mainImage = deduped.find((url) => isImageMediaUrl(url)) ?? null;

  return {
    ...product,
    image_url: mainImage,
    gallery: deduped,
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

  const base: InventoryProduct = applyStockFields(
    {
      ...product,
      id,
      prices,
      suppliers,
      attachments,
      attributes,
      purchase_price_usd: resolvePurchasePriceUsd(suppliers, product.purchase_price_usd),
      code: product.code?.trim() || id.replace(/-/g, '').slice(0, 24).toUpperCase(),
      gallery: product.gallery ?? [],
    },
    DEFAULT_WAREHOUSES,
  );

  return optimizeProductImages(base);
}

export function createEmptyInventoryProduct(): InventoryProduct {
  return {
    id: '',
    code: '',
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
    prices: ensureFullPrices({}),
  };
}

/** Asegura campos nuevos en productos legacy del JSON local. */
export function normalizeInventoryProduct(
  raw: Partial<InventoryProduct> & Pick<InventoryProduct, 'id' | 'name' | 'prices'>,
  warehouses = DEFAULT_WAREHOUSES,
): InventoryProduct {
  const prices = ensureFullPrices(raw.prices ?? { public: 0 });
  const publicPrice = prices.public ?? 0;
  const gallery = Array.isArray(raw.gallery)
    ? raw.gallery.filter((url): url is string => typeof url === 'string' && url.length > 0)
    : raw.image_url
      ? [raw.image_url]
      : [];

  const image_url = raw.image_url ?? gallery[0] ?? null;
  const fallbackPurchase = Number(
    raw.purchase_price_usd ?? Math.round(publicPrice * 0.72 * 100) / 100,
  );
  const suppliers = normalizeSuppliers(raw.suppliers, fallbackPurchase);

  const withStock: InventoryProduct = {
      id: raw.id,
      code: raw.code?.trim() || raw.id.toUpperCase().replace(/-/g, ''),
      name: raw.name,
      description: raw.description ?? null,
      currency: raw.currency ?? 'USD',
      stock: Number(raw.stock ?? 0),
      stock_by_warehouse: raw.stock_by_warehouse ?? [],
      category: raw.category ?? null,
      brand: raw.brand ?? null,
      image_url,
      gallery: gallery.length > 0 ? gallery : image_url ? [image_url] : [],
      suppliers,
      attachments: normalizeAttachments(raw.attachments),
      attributes: normalizeAttributes(raw.attributes),
      purchase_price_usd: resolvePurchasePriceUsd(suppliers, fallbackPurchase),
      created_at: raw.created_at ?? new Date().toISOString(),
      sort_order: Number.isFinite(Number(raw.sort_order)) ? Number(raw.sort_order) : 0,
      is_featured: raw.is_featured === true,
      view_count: Number.isFinite(Number(raw.view_count))
        ? Math.max(0, Math.floor(Number(raw.view_count)))
        : 0,
      prices,
  };

  return applyStockFields(
    {
      ...withStock,
      ...sanitizeStoredProductMedia(withStock),
    },
    warehouses,
  );
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

  return normalizeInventoryProduct(merged, warehouses);
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

const MAX_VIDEO_BYTES = 80 * 1024 * 1024;

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
  const existingGallery = product.gallery ?? [];
  const newUrls = urls.filter((url) => !existingGallery.includes(url));
  const image_url =
    product.image_url && isImageMediaUrl(product.image_url)
      ? product.image_url
      : newUrls.find((url) => isImageMediaUrl(url)) ?? product.image_url ?? null;

  const gallery = dedupeMediaUrls([
    ...(image_url ? [image_url] : []),
    ...existingGallery.filter((item) => item !== image_url),
    ...newUrls.filter((url) => url !== image_url),
  ]);

  return { image_url, gallery };
}

function dedupeMediaUrls(urls: (string | null | undefined)[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const url of urls) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    result.push(url);
  }
  return result;
}

/** Reemplaza una URL de la galería o la foto principal por otra. */
export function replaceProductMediaUrl(
  product: InventoryProduct,
  targetUrl: string | null,
  newUrl: string,
): Pick<InventoryProduct, 'image_url' | 'gallery'> {
  if (!targetUrl) {
    return {
      image_url: newUrl,
      gallery: dedupeMediaUrls([newUrl, ...(product.gallery ?? [])]),
    };
  }

  const isMain = product.image_url === targetUrl;
  const gallery = (product.gallery ?? []).map((url) => (url === targetUrl ? newUrl : url));

  if (isMain) {
    return {
      image_url: newUrl,
      gallery: dedupeMediaUrls([newUrl, ...gallery]),
    };
  }

  return {
    image_url: product.image_url,
    gallery: dedupeMediaUrls(
      product.image_url ? [product.image_url, ...gallery] : gallery,
    ),
  };
}

/** Marca una URL de la galería como foto principal (solo imágenes). */
export function setProductMainMediaUrl(
  product: InventoryProduct,
  url: string,
): Pick<InventoryProduct, 'image_url' | 'gallery'> {
  if (!isImageMediaUrl(url)) {
    throw new Error('La foto principal debe ser una imagen');
  }

  return {
    image_url: url,
    gallery: dedupeMediaUrls([url, ...(product.gallery ?? []), product.image_url]),
  };
}

/** Quita una imagen de la galería (y la principal si aplica). */
export function removeProductMediaUrl(
  product: InventoryProduct,
  targetUrl: string,
): Pick<InventoryProduct, 'image_url' | 'gallery'> {
  const gallery = (product.gallery ?? []).filter((url) => url !== targetUrl);
  const image_url = product.image_url === targetUrl ? (gallery[0] ?? null) : product.image_url;
  return {
    image_url,
    gallery: dedupeMediaUrls(image_url ? [image_url, ...gallery] : gallery),
  };
}

export function getProductMediaUrls(product: InventoryProduct): string[] {
  const { image_url, gallery } = sanitizeStoredProductMedia(product);
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const url of [image_url, ...gallery]) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    urls.push(url);
  }
  return urls;
}

/** Lee y comprime una imagen para uso web en inventario (~1200px, WebP). */
export function readImageFile(file: File): Promise<string> {
  return optimizeImageFile(file, 'product');
}

/** Lee un vídeo MP4 como data URL para persistir en el servidor. */
export function readVideoFile(file: File): Promise<string> {
  if (!file.type.startsWith('video/') && !/\.mp4$/i.test(file.name)) {
    throw new Error('Solo se admiten vídeos MP4');
  }
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error('El vídeo supera el límite de 80 MB');
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
