import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

/** Altura aproximada de la barra de navegación inferior móvil (px). */
export const MOBILE_BOTTOM_NAV_HEIGHT_PX = 64;

/** Altura aproximada de la barra fija de compra en ficha (px). */
export const MOBILE_PURCHASE_BAR_HEIGHT_PX = 88;

interface MobileBottomInsetContextValue {
  purchaseBarInsetPx: number;
  setPurchaseBarInsetPx: (value: number) => void;
  bottomNavInsetPx: number;
  setBottomNavInsetPx: (value: number) => void;
}

const MobileBottomInsetContext = createContext<MobileBottomInsetContextValue | null>(null);

export function MobileBottomInsetProvider({ children }: { children: ReactNode }) {
  const [purchaseBarInsetPx, setPurchaseBarInsetPx] = useState(0);
  const [bottomNavInsetPx, setBottomNavInsetPx] = useState(0);
  const value = useMemo(
    () => ({ purchaseBarInsetPx, setPurchaseBarInsetPx, bottomNavInsetPx, setBottomNavInsetPx }),
    [purchaseBarInsetPx, bottomNavInsetPx],
  );
  return (
    <MobileBottomInsetContext.Provider value={value}>{children}</MobileBottomInsetContext.Provider>
  );
}

export function useMobileBottomInset(): number {
  const context = useContext(MobileBottomInsetContext);
  return (context?.purchaseBarInsetPx ?? 0) + (context?.bottomNavInsetPx ?? 0);
}

export function useMobileBottomNavInset(): number {
  return useContext(MobileBottomInsetContext)?.bottomNavInsetPx ?? 0;
}

/** Actualiza el inset inferior compartido (p. ej. barra de compra en ficha). */
export function useSetMobileBottomInset(insetPx: number) {
  const context = useContext(MobileBottomInsetContext);

  useEffect(() => {
    if (!context) return;
    context.setPurchaseBarInsetPx(insetPx);
    return () => context.setPurchaseBarInsetPx(0);
  }, [context, insetPx]);
}

/** Actualiza el inset de la barra de navegación inferior móvil. */
export function useSetMobileBottomNavInset(insetPx: number) {
  const context = useContext(MobileBottomInsetContext);

  useEffect(() => {
    if (!context) return;
    context.setBottomNavInsetPx(insetPx);
    return () => context.setBottomNavInsetPx(0);
  }, [context, insetPx]);
}

export function mobileBottomOffsetStyle(insetPx: number, baseRem = 1.25): CSSProperties {
  return {
    bottom: `calc(${baseRem}rem + ${insetPx}px + env(safe-area-inset-bottom, 0px))`,
  };
}
