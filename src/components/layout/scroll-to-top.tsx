import { useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Al cambiar de ruta (pathname), lleva la vista al inicio.
 * No reacciona a query (`?…`) para no saltar al filtrar en la misma página.
 * Respeta anclas `#` y retroceso del navegador.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  useLayoutEffect(() => {
    if (hash) return;
    if (navigationType === 'POP') {
      const state = window.history.state as { idx?: number } | null;
      if (typeof state?.idx === 'number' && state.idx > 0) return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash, navigationType]);

  return null;
}
