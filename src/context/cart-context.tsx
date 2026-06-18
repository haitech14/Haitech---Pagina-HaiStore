import * as React from 'react';

import { buildEquipmentCartLineId, getPaidEquipmentOptions } from '@/lib/equipment-config-selection';
import { penToUsd } from '@/lib/utils';
import type { CartConfigurationLine, CartItem, Product } from '@/types/product';

export interface AddToCartOptions {
  quantity?: number;
  /** Abre el panel lateral tras agregar (por defecto true). */
  openDrawer?: boolean;
  configuration?: CartConfigurationLine;
  /** Accesorios del inventario a añadir como líneas separadas. */
  accessoryProducts?: Product[];
  /** Precio unitario USD con descuento por volumen. */
  volumeUnitPriceUsd?: number;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  /** Producto recién añadido (resaltado breve en el panel). */
  highlightProductId: string | null;
  addItem: (product: Product, options?: AddToCartOptions) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  setCartOpen: (open: boolean) => void;
}

const CartContext = React.createContext<CartContextValue | null>(null);

const HIGHLIGHT_MS = 2200;

function cartLineUnitUsd(item: CartItem): number {
  const extrasUsd = penToUsd(item.configuration?.extrasPen ?? 0);
  const baseUsd = item.volumeUnitPriceUsd ?? item.product.price;
  return baseUsd + extrasUsd;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [highlightProductId, setHighlightProductId] = React.useState<string | null>(null);
  const highlightTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const flashHighlight = React.useCallback((productId: string) => {
    setHighlightProductId(productId);
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    highlightTimerRef.current = setTimeout(() => {
      setHighlightProductId(null);
      highlightTimerRef.current = null;
    }, HIGHLIGHT_MS);
  }, []);

  React.useEffect(
    () => () => {
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    },
    [],
  );

  const openCart = React.useCallback(() => setIsOpen(true), []);
  const closeCart = React.useCallback(() => setIsOpen(false), []);
  const setCartOpen = React.useCallback((open: boolean) => setIsOpen(open), []);

  const addItem = React.useCallback(
    (product: Product, options?: AddToCartOptions) => {
      const quantity = Math.max(1, Math.floor(options?.quantity ?? 1));
      const openDrawer = options?.openDrawer !== false;
      const configuration = options?.configuration;
      const accessoryProducts = options?.accessoryProducts ?? [];
      const hasLinkedAccessories = accessoryProducts.length > 0;

      setItems((prev) => {
        let next = prev;

        const upsertLine = (targetProduct: Product, lineConfiguration?: CartConfigurationLine, lineQuantity = quantity) => {
          const targetLineId = lineConfiguration
            ? buildEquipmentCartLineId(
                targetProduct.id,
                getPaidEquipmentOptions(lineConfiguration.options),
              )
            : targetProduct.id;
          const existing = next.find((item) => item.lineId === targetLineId);
          if (existing) {
            next = next.map((item) =>
              item.lineId === targetLineId
                ? {
                    ...item,
                    quantity: item.quantity + lineQuantity,
                    ...(options?.volumeUnitPriceUsd != null && targetProduct.id === product.id
                      ? { volumeUnitPriceUsd: options.volumeUnitPriceUsd }
                      : {}),
                  }
                : item,
            );
          } else {
            const nextItem: CartItem = {
              product: targetProduct,
              quantity: lineQuantity,
              lineId: targetLineId,
              ...(lineConfiguration ? { configuration: lineConfiguration } : {}),
              ...(options?.volumeUnitPriceUsd != null && targetProduct.id === product.id
                ? { volumeUnitPriceUsd: options.volumeUnitPriceUsd }
                : {}),
            };
            next = [...next, nextItem];
          }
        };

        const bundledConfiguration =
          configuration && hasLinkedAccessories
            ? { ...configuration, extrasPen: 0 }
            : configuration;

        upsertLine(product, bundledConfiguration, quantity);

        accessoryProducts.forEach((accessory) => {
          upsertLine(accessory, undefined, quantity);
        });

        return next;
      });

      flashHighlight(product.id);
      if (openDrawer) setIsOpen(true);
    },
    [flashHighlight],
  );

  const updateQuantity = React.useCallback((lineId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.lineId !== lineId);
      }
      return prev.map((item) => (item.lineId === lineId ? { ...item, quantity } : item));
    });
  }, []);

  const removeItem = React.useCallback((lineId: string) => {
    setItems((prev) => prev.filter((item) => item.lineId !== lineId));
  }, []);

  const clear = React.useCallback(() => setItems([]), []);

  const value = React.useMemo<CartContextValue>(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce(
      (sum, item) => sum + cartLineUnitUsd(item) * item.quantity,
      0,
    );
    return {
      items,
      totalItems,
      totalPrice,
      isOpen,
      highlightProductId,
      addItem,
      updateQuantity,
      removeItem,
      clear,
      openCart,
      closeCart,
      setCartOpen,
    };
  }, [
    items,
    isOpen,
    highlightProductId,
    addItem,
    updateQuantity,
    removeItem,
    clear,
    openCart,
    closeCart,
    setCartOpen,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
}

export { cartLineUnitUsd };
