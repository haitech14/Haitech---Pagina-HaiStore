const STORAGE_KEY = 'haistore_recently_viewed_v1';
const MAX_RECENT = 24;
export const RECENTLY_VIEWED_EVENT = 'haistore:recently-viewed';

const EMPTY_IDS: string[] = [];

let cachedSnapshot: string[] = EMPTY_IDS;
let cachedKey = '';

function readIdsFromStorage(): string[] {
  if (typeof window === 'undefined') return EMPTY_IDS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_IDS;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return EMPTY_IDS;
    return parsed.filter((id): id is string => typeof id === 'string' && id.trim().length > 0);
  } catch {
    return EMPTY_IDS;
  }
}

function syncCachedSnapshot(ids: string[]) {
  const key = ids.join('|');
  if (key === cachedKey) return;
  cachedKey = key;
  cachedSnapshot = ids.length === 0 ? EMPTY_IDS : ids;
}

function writeIds(ids: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* quota / modo privado */
  }
  syncCachedSnapshot(ids);
}

/** IDs de productos visitados recientemente (más reciente primero). Referencia estable para useSyncExternalStore. */
export function readRecentlyViewedProductIds(): string[] {
  syncCachedSnapshot(readIdsFromStorage());
  return cachedSnapshot;
}

/** Registra una visita a ficha de producto para «últimos vistos». */
export function recordRecentlyViewedProduct(productId: string) {
  const trimmed = productId.trim();
  if (!trimmed) return;
  const next = [trimmed, ...readIdsFromStorage().filter((id) => id !== trimmed)].slice(0, MAX_RECENT);
  writeIds(next);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(RECENTLY_VIEWED_EVENT));
  }
}

export function subscribeRecentlyViewedProducts(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => onStoreChange();
  window.addEventListener(RECENTLY_VIEWED_EVENT, handler);
  return () => window.removeEventListener(RECENTLY_VIEWED_EVENT, handler);
}
