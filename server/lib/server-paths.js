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
