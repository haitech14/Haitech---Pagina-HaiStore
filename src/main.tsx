import '@/lib/install-random-uuid-polyfill';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from '@/App';
import '@/fonts';
import '@/index.css';
import { registerServiceWorker } from '@/lib/register-service-worker';

registerServiceWorker();

/**
 * /tienda y /categoria: bajar el chunk de store cuanto antes.
 * El índice 1.3MB no compite con el primer paint:
 * - /tienda*: idle tras paint
 * - /categoria/*: no precargar (API-first)
 */
const bootPath = typeof window !== 'undefined' ? window.location.pathname : '';
const isStorePath = bootPath === '/tienda' || bootPath.startsWith('/tienda/');
const isCategoryPath = bootPath.startsWith('/categoria/');

if (isStorePath || isCategoryPath) {
  void import('@/pages/store');
}

if (isStorePath) {
  const scheduleIndex =
    typeof window.requestIdleCallback === 'function'
      ? (cb: () => void) => window.requestIdleCallback(cb, { timeout: 2500 })
      : (cb: () => void) => window.setTimeout(cb, 800);
  scheduleIndex(() => {
    void import('@/lib/defer-catalog-index').then((m) => {
      m.preloadCatalogIndexNow();
    });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('No se encontró el elemento #root');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
