import type { WishlistItem } from '@/lib/wishlist-product';

const STORAGE_KEY = 'haistore_wishlist_v1';

export function loadWishlistFromStorage(): WishlistItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (entry): entry is WishlistItem =>
          entry != null &&
          typeof entry === 'object' &&
          typeof (entry as WishlistItem).id === 'string' &&
          typeof (entry as WishlistItem).name === 'string' &&
          typeof (entry as WishlistItem).price === 'number',
      )
      .map((entry) => ({
        id: entry.id,
        name: entry.name,
        category: typeof entry.category === 'string' ? entry.category : '',
        brand: typeof entry.brand === 'string' ? entry.brand : null,
        price: entry.price,
        image: typeof entry.image === 'string' ? entry.image : null,
      }));
  } catch {
    return [];
  }
}

export function saveWishlistToStorage(items: WishlistItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
