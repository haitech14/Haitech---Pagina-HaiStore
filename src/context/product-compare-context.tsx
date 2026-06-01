import * as React from 'react';
import { toast } from 'sonner';

import { MAX_COMPARE_PRODUCTS, type CompareProductItem } from '@/lib/compare-product';

interface ProductCompareContextValue {
  items: CompareProductItem[];
  isSelected: (id: string) => boolean;
  toggle: (product: CompareProductItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  compareOpen: boolean;
  setCompareOpen: (open: boolean) => void;
}

const ProductCompareContext = React.createContext<ProductCompareContextValue | null>(null);

export function ProductCompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CompareProductItem[]>([]);
  const [compareOpen, setCompareOpen] = React.useState(false);

  const isSelected = React.useCallback((id: string) => items.some((item) => item.id === id), [items]);

  const toggle = React.useCallback((product: CompareProductItem) => {
    const id = product.id;
    setItems((prev) => {
      const exists = prev.some((item) => item.id === id);
      if (exists) {
        return prev.filter((item) => item.id !== id);
      }
      if (prev.length >= MAX_COMPARE_PRODUCTS) {
        toast.message(`Máximo ${MAX_COMPARE_PRODUCTS} equipos para comparar`);
        return prev;
      }
      toast.success('Añadido al comparador');
      return [...prev, product];
    });
  }, []);

  const remove = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clear = React.useCallback(() => {
    setItems([]);
    setCompareOpen(false);
  }, []);

  const value = React.useMemo(
    () => ({
      items,
      isSelected,
      toggle,
      remove,
      clear,
      compareOpen,
      setCompareOpen,
    }),
    [items, isSelected, toggle, remove, clear, compareOpen],
  );

  return (
    <ProductCompareContext.Provider value={value}>{children}</ProductCompareContext.Provider>
  );
}

export function useProductCompare() {
  const context = React.useContext(ProductCompareContext);
  if (!context) {
    throw new Error('useProductCompare debe usarse dentro de ProductCompareProvider');
  }
  return context;
}
