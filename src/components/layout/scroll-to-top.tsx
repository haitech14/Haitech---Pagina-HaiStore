import { useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

import { isStayInShowcaseState } from '@/lib/store-showcase-path';

/**
 * Al cambiar de ruta (pathname), lleva la vista al inicio.
 * No reacciona a query (`?…`) ni al primer `replace` (POP → REPLACE) para no
 * saltar al filtrar en la misma página.
 * Respeta anclas `#`, retroceso del navegador y filtros de vitrina.
 */
export function ScrollToTop() {
  const { pathname, hash, state } = useLocation();
  const navigationType = useNavigationType();
  const prevPathnameRef = useRef(pathname);

  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  useLayoutEffect(() => {
    const pathnameChanged = prevPathnameRef.current !== pathname;
    prevPathnameRef.current = pathname;

    if (isStayInShowcaseState(state)) {
      if (typeof state.scrollY === 'number') {
        window.scrollTo({ top: state.scrollY, left: 0, behavior: 'instant' });
      }
      return;
    }

    if (!pathnameChanged) return;
    if (hash) return;
    if (navigationType === 'POP') {
      const historyState = window.history.state as { idx?: number } | null;
      if (typeof historyState?.idx === 'number' && historyState.idx > 0) return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash, navigationType, state]);

  return null;
}
