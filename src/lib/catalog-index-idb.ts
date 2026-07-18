import type { InventoryProduct } from '@/types/product';

const DB_NAME = 'haistore-catalog';
const DB_VERSION = 1;
const STORE_NAME = 'inventory-index';
const RECORD_KEY = 'rows-v1';

/** Filas del índice (compatible con CatalogRow). */
export type CatalogIndexIdbRow = InventoryProduct & {
  compare_at_price_usd?: number;
  is_new?: boolean;
};

interface CatalogIndexRecord {
  savedAt: number;
  rows: CatalogIndexIdbRow[];
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB no disponible'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error ?? new Error('No se pudo abrir IndexedDB'));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/** Lee filas normalizadas del índice (refresh rápido sin re-parsear la red). */
export async function readCatalogIndexFromIdb(): Promise<CatalogIndexIdbRow[] | null> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(RECORD_KEY);
      request.onerror = () => reject(request.error ?? new Error('Lectura IDB fallida'));
      request.onsuccess = () => {
        const value = request.result as CatalogIndexRecord | undefined;
        if (!value?.rows || !Array.isArray(value.rows) || value.rows.length === 0) {
          resolve(null);
          return;
        }
        resolve(value.rows);
      };
      tx.oncomplete = () => db.close();
    });
  } catch {
    return null;
  }
}

/** Persiste el índice tras la primera carga / revalidación. */
export async function writeCatalogIndexToIdb(rows: readonly CatalogIndexIdbRow[]): Promise<void> {
  if (rows.length === 0) return;
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record: CatalogIndexRecord = {
        savedAt: Date.now(),
        rows: rows as CatalogIndexIdbRow[],
      };
      const request = store.put(record, RECORD_KEY);
      request.onerror = () => reject(request.error ?? new Error('Escritura IDB fallida'));
      request.onsuccess = () => resolve();
      tx.oncomplete = () => db.close();
    });
  } catch {
    /* cuota / privado: ignorar */
  }
}
