import * as React from 'react';
import { toast } from 'sonner';

import { loadWishlistFromStorage, saveWishlistToStorage } from '@/lib/wishlist-storage';
import type { WishlistItem } from '@/lib/wishlist-product';

interface WishlistContextValue {
  items: WishlistItem[];
  totalItems: number;
  isSelected: (id: string) => boolean;
  toggle: (product: WishlistItem) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const WishlistContext = React.createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<WishlistItem[]>(() => loadWishlistFromStorage());

  React.useEffect(() => {
    saveWishlistToStorage(items);
  }, [items]);

  const isSelected = React.useCallback((id: string) => items.some((item) => item.id === id), [items]);

  const toggle = React.useCallback((product: WishlistItem) => {
    setItems((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        toast.message('Eliminado de favoritos');
        return prev.filter((item) => item.id !== product.id);
      }
      toast.success('Añadido a favoritos');
      return [...prev, product];
    });
  }, []);

  const remove = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clear = React.useCallback(() => {
    setItems([]);
  }, []);

  const value = React.useMemo(
    () => ({
      items,
      totalItems: items.length,
      isSelected,
      toggle,
      remove,
      clear,
    }),
    [items, isSelected, toggle, remove, clear],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const context = React.useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist debe usarse dentro de WishlistProvider');
  }
  return context;
}
