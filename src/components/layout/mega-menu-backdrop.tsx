import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { cn } from '@/lib/utils';

type MegaMenuBackdropContextValue = {
  acquire: () => void;
  release: () => void;
};

const MegaMenuBackdropContext = createContext<MegaMenuBackdropContextValue | null>(null);

export function MegaMenuBackdropProvider({ children }: { children: ReactNode }) {
  const [openCount, setOpenCount] = useState(0);
  const acquire = useCallback(() => setOpenCount((count) => count + 1), []);
  const release = useCallback(() => setOpenCount((count) => Math.max(0, count - 1)), []);
  const value = useMemo(() => ({ acquire, release }), [acquire, release]);

  return (
    <MegaMenuBackdropContext.Provider value={value}>
      {children}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none fixed inset-0 z-[45] bg-black/55 transition-opacity duration-200',
          openCount > 0 ? 'opacity-100' : 'opacity-0',
        )}
      />
    </MegaMenuBackdropContext.Provider>
  );
}

/** Oscurece el contenido detrás del header mientras un mega menú está abierto. */
export function useMegaMenuBackdrop(active: boolean) {
  const context = useContext(MegaMenuBackdropContext);

  useEffect(() => {
    if (!context || !active) return;
    context.acquire();
    return () => context.release();
  }, [active, context]);
}
