import fs from 'fs/promises';
import path from 'path';
import { createHash, randomUUID } from 'crypto';

import sharp from 'sharp';

import { applyHaitechWatermark } from './image-watermark.js';
import { readInventory } from './inventory-store.js';
import { getMediaAlbumPath, getPublicAlbumDir } from './server-paths.js';
import {
  isImageMediaUrl,
  isVideoMediaUrl,
  isYoutubeMediaUrl,
} from '../../shared/product-media.js';
import { dedupeMediaAlbumItems } from '../../shared/media-album-dedupe.js';
import { productMediaCanonicalKey } from '../../shared/product-media-dedupe.js';
import {
  MAX_PRODUCT_VIDEO_UPLOAD_BYTES,
  PRODUCT_IMAGE_MAX_EDGE,
  PRODUCT_IMAGE_WEBP_QUALITY,
} from '../../shared/product-media-upload-limits.js';

const WEBP_QUALITY = PRODUCT_IMAGE_WEBP_QUALITY;
const MAX_EDGE = PRODUCT_IMAGE_MAX_EDGE;
const MAX_VIDEO_BYTES = MAX_PRODUCT_VIDEO_UPLOAD_BYTES;
const INVENTORY_ALBUM_CACHE_MS = 60 * 1000;
const INVENTORY_ALBUM_ID_PREFIX = 'inventory:';

let inventoryAlbumCache = null;
let inventoryAlbumCacheAt = 0;

const DEFAULT_DATA = {
  version: 1,
  drive: {
    folderId: null,
    folderUrl: null,
    lastSyncAt: null,
  },
  items: [],
};

function albumDataPath() {
  return getMediaAlbumPath();
}

function publicAlbumDir() {
  return getPublicAlbumDir();
}

function sanitizeFilename(name) {
  return String(name ?? 'media')
    .trim()
    .slice(0, 80)
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function detectKindFromMime(mimeType) {
  if (typeof mimeType === 'string' && mimeType.startsWith('video/')) return 'video';
  return 'image';
}

function inventoryMediaItemId(url) {
  return `${INVENTORY_ALBUM_ID_PREFIX}${createHash('sha256').update(url).digest('hex').slice(0, 20)}`;
}

function isResponsiveProductVariantUrl(url) {
  return /\/products\/.+-(?:256|512|768|1024|1280|1920)\.(webp|png|jpe?g)(?:$|\?)/i.test(
    String(url),
  );
}

function isUsableInventoryMediaUrl(url) {
  if (typeof url !== 'string' || url.length === 0) return false;
  if (url.startsWith('data:')) return false;
  if (isYoutubeMediaUrl(url) || isVideoMediaUrl(url)) return true;
  if (!isImageMediaUrl(url)) return false;
  // Las variantes -256/-512/-1024 son la misma foto: no las listamos aparte.
  if (isResponsiveProductVariantUrl(url)) return false;
  return true;
}

function inventoryMediaGroupKey(url) {
  const key = productMediaCanonicalKey(url);
  return key || url.toLowerCase();
}

function detectKindFromUrl(url) {
  if (typeof url !== 'string') return 'image';
  if (url.startsWith('youtube:')) return 'youtube';
  if (url.startsWith('data:video/') || /\.(mp4|webm|mov)(\?|$)/i.test(url)) return 'video';
  return 'image';
}

async function listInventoryMediaAlbumItems() {
  const { products } = await readInventory();
  /** @type {Map<string, object>} */
  const byKey = new Map();

  for (const product of products) {
    const productName = typeof product.name === 'string' ? product.name.trim() : '';
    const urls = [];

    if (typeof product.image_url === 'string' && product.image_url.trim()) {
      urls.push(product.image_url.trim());
    }
    if (Array.isArray(product.gallery)) {
      for (const entry of product.gallery) {
        if (typeof entry === 'string' && entry.trim()) urls.push(entry.trim());
      }
    }

    for (const url of urls) {
      if (!isUsableInventoryMediaUrl(url)) continue;
      const key = inventoryMediaGroupKey(url);
      if (byKey.has(key)) continue;

      byKey.set(key, {
        id: inventoryMediaItemId(key),
        url,
        kind: detectKindFromUrl(url),
        name: productName || path.basename(url.split('?')[0] ?? url),
        source: 'inventory',
        google_drive_file_id: null,
        created_at:
          typeof product.created_at === 'string'
            ? product.created_at
            : new Date(0).toISOString(),
        bytes: null,
        width: null,
        height: null,
      });
    }
  }

  return [...byKey.values()].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

async function getCachedInventoryMediaAlbumItems() {
  const now = Date.now();
  if (inventoryAlbumCache && now - inventoryAlbumCacheAt < INVENTORY_ALBUM_CACHE_MS) {
    return inventoryAlbumCache;
  }

  inventoryAlbumCache = await listInventoryMediaAlbumItems();
  inventoryAlbumCacheAt = now;
  return inventoryAlbumCache;
}

export function invalidateInventoryMediaAlbumCache() {
  inventoryAlbumCache = null;
  inventoryAlbumCacheAt = 0;
}

function normalizeItem(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const url = typeof raw.url === 'string' ? raw.url.trim() : '';
  if (!url) return null;

  const kind =
    raw.kind === 'image' || raw.kind === 'video' || raw.kind === 'youtube'
      ? raw.kind
      : detectKindFromUrl(url);

  return {
    id: typeof raw.id === 'string' && raw.id.length > 0 ? raw.id : randomUUID(),
    url,
    kind,
    name: typeof raw.name === 'string' ? raw.name.trim() || 'Sin nombre' : 'Sin nombre',
    source:
      raw.source === 'upload' ||
      raw.source === 'google_drive' ||
      raw.source === 'import' ||
      raw.source === 'inventory'
        ? raw.source
        : 'upload',
    google_drive_file_id:
      typeof raw.google_drive_file_id === 'string' ? raw.google_drive_file_id : null,
    created_at: typeof raw.created_at === 'string' ? raw.created_at : new Date().toISOString(),
    bytes: Number.isFinite(Number(raw.bytes)) ? Number(raw.bytes) : null,
    width: Number.isFinite(Number(raw.width)) ? Number(raw.width) : null,
    height: Number.isFinite(Number(raw.height)) ? Number(raw.height) : null,
    content_hash:
      typeof raw.content_hash === 'string' && raw.content_hash.length > 0
        ? raw.content_hash
        : null,
  };
}

async function readAlbumData() {
  try {
    const raw = await fs.readFile(albumDataPath(), 'utf8');
    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed?.items)
      ? parsed.items.map(normalizeItem).filter(Boolean)
      : [];
    return {
      version: 1,
      drive: {
        folderId: parsed?.drive?.folderId ?? null,
        folderUrl: parsed?.drive?.folderUrl ?? null,
        lastSyncAt: parsed?.drive?.lastSyncAt ?? null,
      },
      items,
    };
  } catch (error) {
    if (error?.code === 'ENOENT') return structuredClone(DEFAULT_DATA);
    throw error;
  }
}

async function writeAlbumData(data) {
  await fs.mkdir(path.dirname(albumDataPath()), { recursive: true });
  await fs.writeFile(albumDataPath(), JSON.stringify(data, null, 2), 'utf8');
}

/** Serializa mutaciones del álbum para evitar carreras al subir varias imágenes a la vez. */
let albumWriteChain = Promise.resolve();

/**
 * @template T
 * @param {() => Promise<T>} work
 * @returns {Promise<T>}
 */
function withAlbumWriteLock(work) {
  const run = albumWriteChain.then(work, work);
  albumWriteChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function publicAlbumMediaPath(id, kind = 'image') {
  const ext = kind === 'video' ? 'mp4' : 'webp';
  return `/album/${id}.${ext}`;
}

async function exportImageBufferToAlbum(buffer, id) {
  const publicPath = publicAlbumMediaPath(id, 'image');
  const absolutePath = path.join(publicAlbumDir(), `${id}.webp`);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });

  const resized = await sharp(buffer)
    .rotate()
    .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
    .toBuffer();

  const watermarked = await applyHaitechWatermark(resized, {
    sourceUrl: '/album/upload',
  });

  const output = await sharp(watermarked)
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toBuffer();

  await fs.writeFile(absolutePath, output);

  const meta = await sharp(output).metadata();
  const content_hash = createHash('sha256').update(output).digest('hex');

  return {
    url: publicPath,
    bytes: output.length,
    width: meta.width ?? null,
    height: meta.height ?? null,
    content_hash,
  };
}

async function exportVideoBufferToAlbum(buffer, id) {
  if (buffer.length > MAX_VIDEO_BYTES) {
    throw new Error(
      `El vídeo supera el tamaño máximo de ${Math.round(MAX_VIDEO_BYTES / (1024 * 1024))}MB`,
    );
  }

  const publicPath = publicAlbumMediaPath(id, 'video');
  const absolutePath = path.join(publicAlbumDir(), `${id}.mp4`);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, buffer);

  const content_hash = createHash('sha256').update(buffer).digest('hex');

  return {
    url: publicPath,
    bytes: buffer.length,
    width: null,
    height: null,
    content_hash,
  };
}

function parseDataUrl(dataUrl) {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) return null;
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], 'base64'),
  };
}

async function ensureItemContentHash(item) {
  if (item.content_hash) return item;
  if (!item.url?.startsWith('/album/')) return item;

  const absolutePath = path.join(publicAlbumDir(), path.basename(item.url.split('?')[0]));
  try {
    const buffer = await fs.readFile(absolutePath);
    return {
      ...item,
      content_hash: createHash('sha256').update(buffer).digest('hex'),
      bytes: item.bytes ?? buffer.length,
    };
  } catch {
    return item;
  }
}

/**
 * Fusiona ítems del álbum con el mismo contenido (hash) y borra archivos huérfanos.
 * @returns {Promise<{ merged: number; removedFiles: number }>}
 */
export async function compactMediaAlbumDuplicates() {
  const data = await readAlbumData();
  const withHashes = [];
  for (const item of data.items) {
    withHashes.push(await ensureItemContentHash(item));
  }

  /** @type {Map<string, typeof withHashes>} */
  const byHash = new Map();
  const keepWithoutHash = [];

  for (const item of withHashes) {
    if (!item.content_hash) {
      keepWithoutHash.push(item);
      continue;
    }
    const list = byHash.get(item.content_hash);
    if (list) list.push(item);
    else byHash.set(item.content_hash, [item]);
  }

  const kept = [...keepWithoutHash];
  const removedFiles = [];
  let merged = 0;

  for (const group of byHash.values()) {
    const sorted = [...group].sort((a, b) => a.created_at.localeCompare(b.created_at));
    const canonical = sorted[0];
    kept.push(canonical);
    for (const duplicate of sorted.slice(1)) {
      merged += 1;
      if (
        duplicate.url?.startsWith('/album/') &&
        duplicate.url !== canonical.url
      ) {
        removedFiles.push(duplicate.url);
      }
    }
  }

  if (merged === 0) {
    const hashesChanged = withHashes.some(
      (item, index) => item.content_hash !== data.items[index]?.content_hash,
    );
    if (!hashesChanged) {
      return { merged: 0, removedFiles: 0 };
    }
  }

  data.items = kept.sort((a, b) => b.created_at.localeCompare(a.created_at));
  await writeAlbumData(data);

  let deleted = 0;
  for (const url of removedFiles) {
    const absolutePath = path.join(publicAlbumDir(), path.basename(url.split('?')[0]));
    try {
      await fs.unlink(absolutePath);
      deleted += 1;
    } catch {
      // ya no existe
    }
  }

  return { merged, removedFiles: deleted };
}

export async function listMediaAlbumItems(filters = {}) {
  const data = await readAlbumData();
  const storedUrls = new Set(data.items.map((item) => item.url));
  const storedKeys = new Set(
    data.items.map((item) => inventoryMediaGroupKey(item.url)).filter(Boolean),
  );
  const inventoryItems = await getCachedInventoryMediaAlbumItems();
  let items = [
    ...data.items,
    ...inventoryItems.filter((item) => {
      if (storedUrls.has(item.url)) return false;
      const key = inventoryMediaGroupKey(item.url);
      return !storedKeys.has(key);
    }),
  ];

  if (filters.kind === 'image' || filters.kind === 'video' || filters.kind === 'youtube') {
    items = items.filter((item) => item.kind === filters.kind);
  }

  return dedupeMediaAlbumItems(items);
}

export async function getMediaAlbumDriveConfig() {
  const data = await readAlbumData();
  return {
    ...data.drive,
    hasApiKey: Boolean(process.env.GOOGLE_DRIVE_API_KEY?.trim()),
    hasServiceAccount: Boolean(process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON?.trim()),
  };
}

export function parseGoogleDriveFolderId(input) {
  const trimmed = String(input ?? '').trim();
  if (!trimmed) return null;

  if (/^[a-zA-Z0-9_-]{10,}$/.test(trimmed) && !trimmed.includes('/')) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    const foldersMatch = url.pathname.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (foldersMatch?.[1]) return foldersMatch[1];

    const idParam = url.searchParams.get('id');
    if (idParam) return idParam;
  } catch {
    // no es URL
  }

  return null;
}

export async function updateMediaAlbumDriveConfig({ folderUrl, folderId }) {
  const data = await readAlbumData();
  const resolvedId = folderId?.trim() || parseGoogleDriveFolderId(folderUrl) || null;

  data.drive = {
    folderId: resolvedId,
    folderUrl: folderUrl?.trim() || (resolvedId ? `https://drive.google.com/drive/folders/${resolvedId}` : null),
    lastSyncAt: data.drive?.lastSyncAt ?? null,
  };

  await writeAlbumData(data);
  return getMediaAlbumDriveConfig();
}

export async function markMediaAlbumDriveSynced() {
  const data = await readAlbumData();
  data.drive = {
    ...data.drive,
    lastSyncAt: new Date().toISOString(),
  };
  await writeAlbumData(data);
  return data.drive;
}

export async function findMediaAlbumItemByDriveId(driveFileId) {
  if (!driveFileId) return null;
  const data = await readAlbumData();
  return data.items.find((item) => item.google_drive_file_id === driveFileId) ?? null;
}

export async function addMediaAlbumItem({
  dataUrl,
  buffer,
  mimeType,
  name,
  source = 'upload',
  google_drive_file_id = null,
  kind,
}) {
  return withAlbumWriteLock(async () => {
    const data = await readAlbumData();
    const id = randomUUID();
    const displayName = sanitizeFilename(name) || 'media';

    let parsed = null;
    if (buffer) {
      parsed = { mimeType: mimeType ?? 'application/octet-stream', buffer };
    } else if (dataUrl) {
      parsed = parseDataUrl(dataUrl);
    }

    if (!parsed?.buffer?.length) {
      throw new Error('No se recibió contenido de imagen o vídeo válido');
    }

    const resolvedKind =
      kind === 'image' || kind === 'video' || kind === 'youtube'
        ? kind
        : detectKindFromMime(parsed.mimeType);

    let persisted;
    if (resolvedKind === 'video') {
      persisted = await exportVideoBufferToAlbum(parsed.buffer, id);
    } else {
      persisted = await exportImageBufferToAlbum(parsed.buffer, id);
    }

    // Misma imagen ya en el álbum: reutiliza y borra el archivo recién escrito.
    if (persisted.content_hash) {
      const existing = data.items.find((item) => item.content_hash === persisted.content_hash);
      if (existing) {
        const absolutePath = path.join(publicAlbumDir(), path.basename(persisted.url));
        await fs.unlink(absolutePath).catch(() => {});
        return existing;
      }
    }

    const item = normalizeItem({
      id,
      url: persisted.url,
      kind: resolvedKind,
      name: displayName,
      source,
      google_drive_file_id,
      created_at: new Date().toISOString(),
      bytes: persisted.bytes,
      width: persisted.width,
      height: persisted.height,
      content_hash: persisted.content_hash,
    });

    data.items.unshift(item);
    await writeAlbumData(data);

    // Compacta en segundo plano con demora: evita borrar el archivo recién
    // subido mientras un PATCH de inventario aún lo está importando.
    setTimeout(() => {
      void compactMediaAlbumDuplicates().catch((error) => {
        console.warn('[media-album] compact:', error?.message ?? error);
      });
    }, 2500);

    return item;
  });
}

export async function deleteMediaAlbumItem(id) {
  if (typeof id === 'string' && id.startsWith(INVENTORY_ALBUM_ID_PREFIX)) {
    return false;
  }

  return withAlbumWriteLock(async () => {
    const data = await readAlbumData();
    const index = data.items.findIndex((item) => item.id === id);
    if (index < 0) return false;

    const [removed] = data.items.splice(index, 1);
    await writeAlbumData(data);

    if (removed?.url?.startsWith('/album/')) {
      const filename = path.basename(removed.url);
      const absolutePath = path.join(publicAlbumDir(), filename);
      await fs.unlink(absolutePath).catch(() => {});
    }

    return true;
  });
}
