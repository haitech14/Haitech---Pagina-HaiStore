import '@/lib/install-random-uuid-polyfill';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from '@/App';
import '@/fonts';
import '@/index.css';
import { registerServiceWorker } from '@/lib/register-service-worker';

registerServiceWorker();

/** En /tienda y categorías: bajar chunk + índice cuanto antes (antes de React). */
const bootPath = typeof window !== 'undefined' ? window.location.pathname : '';
if (
  bootPath === '/tienda' ||
  bootPath.startsWith('/tienda/') ||
  bootPath.startsWith('/categoria/')
) {
  void import('@/pages/store');
  void import('@/lib/defer-catalog-index').then((m) => {
    m.preloadCatalogIndexNow();
  });
  // Hint paralelo al fetch del índice (LAN / primer paint de /tienda).
  const preload = document.createElement('link');
  preload.rel = 'preload';
  preload.as = 'fetch';
  preload.href = '/catalog/inventory-index.json';
  preload.crossOrigin = 'anonymous';
  document.head.appendChild(preload);
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
