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

const WEBP_QUALITY = 82;
const MAX_EDGE = 1200;
const MAX_VIDEO_BYTES = 80 * 1024 * 1024;
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

function isUsableInventoryMediaUrl(url) {
  if (typeof url !== 'string' || url.length === 0) return false;
  if (url.startsWith('data:')) return false;
  if (isYoutubeMediaUrl(url) || isVideoMediaUrl(url)) return true;
  return isImageMediaUrl(url);
}

function detectKindFromUrl(url) {
  if (typeof url !== 'string') return 'image';
  if (url.startsWith('youtube:')) return 'youtube';
  if (url.startsWith('data:video/') || /\.(mp4|webm|mov)(\?|$)/i.test(url)) return 'video';
  return 'image';
}

async function listInventoryMediaAlbumItems() {
  const { products } = await readInventory();
  const byUrl = new Map();

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
      if (!isUsableInventoryMediaUrl(url) || byUrl.has(url)) continue;

      byUrl.set(url, {
        id: inventoryMediaItemId(url),
        url,
        kind: detectKindFromUrl(url),
        name: productName || path.basename(url),
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

  return [...byUrl.values()].sort((a, b) => b.created_at.localeCompare(a.created_at));
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
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  await fs.writeFile(absolutePath, output);

  const meta = await sharp(output).metadata();

  return {
    url: publicPath,
    bytes: output.length,
    width: meta.width ?? null,
    height: meta.height ?? null,
  };
}

async function exportVideoBufferToAlbum(buffer, id) {
  if (buffer.length > MAX_VIDEO_BYTES) {
    throw new Error('El vídeo supera el tamaño máximo de 80MB');
  }

  const publicPath = publicAlbumMediaPath(id, 'video');
  const absolutePath = path.join(publicAlbumDir(), `${id}.mp4`);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, buffer);

  return {
    url: publicPath,
    bytes: buffer.length,
    width: null,
    height: null,
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

export async function listMediaAlbumItems(filters = {}) {
  const data = await readAlbumData();
  const storedUrls = new Set(data.items.map((item) => item.url));
  const inventoryItems = await getCachedInventoryMediaAlbumItems();
  let items = [
    ...data.items,
    ...inventoryItems.filter((item) => !storedUrls.has(item.url)),
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
  });

  data.items.unshift(item);
  await writeAlbumData(data);
  return item;
}

export async function deleteMediaAlbumItem(id) {
  if (typeof id === 'string' && id.startsWith(INVENTORY_ALBUM_ID_PREFIX)) {
    return false;
  }

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
}
