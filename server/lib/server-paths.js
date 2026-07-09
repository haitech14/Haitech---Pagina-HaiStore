import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Directorio persistente en local; en Vercel usa /tmp (efímero entre despliegues). */
export function getServerDataDir() {
  if (process.env.HAISTORE_DATA_DIR) {
    return process.env.HAISTORE_DATA_DIR;
  }
  if (process.env.VERCEL) {
    return '/tmp/haistore-data';
  }
  return path.join(__dirname, '../data');
}

export function getInventoryPath() {
  return path.join(getServerDataDir(), 'inventory.json');
}

export function getCompanySettingsPath() {
  return path.join(getServerDataDir(), 'company-settings.json');
}

export function getProformasPath() {
  return path.join(getServerDataDir(), 'proformas.json');
}

export function getStoreCategoriesPath() {
  return path.join(getServerDataDir(), 'store-categories.json');
}

export function getStoreBrandsPath() {
  return path.join(getServerDataDir(), 'store-brands.json');
}

export function getSupportTicketsPath() {
  return path.join(getServerDataDir(), 'support-tickets.json');
}

export function getMediaAlbumPath() {
  return path.join(getServerDataDir(), 'media-album.json');
}

/** Directorio público de assets del álbum (servidos por Vite / CDN). */
export function getPublicAlbumDir() {
  if (process.env.HAISTORE_PUBLIC_ALBUM_DIR) {
    return process.env.HAISTORE_PUBLIC_ALBUM_DIR;
  }
  return path.join(__dirname, '../../public/album');
}
